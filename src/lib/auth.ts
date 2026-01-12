import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import nodemailer from "nodemailer";
import { twoFactor } from "better-auth/plugins";
import { Resend } from "resend";
// If your Prisma file is located elsewhere, you can change the path

const resend = new Resend(process.env.RESEND_API);

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use true for port 465, false for port 587
  auth: {
    user: process.env.APP_MAIL,
    pass: process.env.APP_PASS,
  },
});
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),
  trustedOrigins: [process.env.APP_URL!],
  advanced:{
    cookiePrefix: "Prisma-Blog"
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "USER",
      },
      phone: {
        type: "string",
        required: false,
      },
      status: {
        type: "boolean",
        required: false,
        defaultValue: true,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: false,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      try {
        const verificationURL = `${process.env.APP_URL}/verify-email?token=${token}`;
        const info = await transporter.sendMail({
          from: '"Prisma Blog App" <prisma@blog.com>',
          to: user.email,
          subject: "Verify your email address",
          text: `
        Hi ${user.name ?? "there"},

        Welcome to Prisma Blog App!

        Please verify your email address by clicking the link below:

        ${verificationURL}

        If you did not create this account, you can safely ignore this email.

        — Prisma Blog App Team
        `,
          html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
        <meta charset="UTF-8" />
        <title>Email Verification</title>
        <style>
            body {
            font-family: Arial, Helvetica, sans-serif;
            background-color: #f4f6f8;
            margin: 0;
            padding: 0;
            }
            .container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
            }
            .header {
            background: #4f46e5;
            color: #ffffff;
            padding: 20px;
            text-align: center;
            }
            .content {
            padding: 30px;
            color: #333333;
            line-height: 1.6;
            }
            .button {
            display: inline-block;
            margin: 20px 0;
            padding: 12px 24px;
            background-color: #4f46e5;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            }
            .footer {
            font-size: 13px;
            color: #777777;
            text-align: center;
            padding: 20px;
            border-top: 1px solid #eeeeee;
            }
        </style>
        </head>
        <body>
        <div class="container">
            <div class="header">
            <h1>Prisma Blog App</h1>
            </div>

            <div class="content">
            <p>Hi <strong>${user.name ?? "there"}</strong>,</p>

            <p>
                Thanks for creating an account with <strong>Prisma Blog App</strong>.
                Please confirm your email address by clicking the button below.
            </p>

            <p style="text-align: center;">
                <a href="${verificationURL}" class="button">
                Verify Email
                </a>
            </p>

            <p>
                If the button doesn’t work, copy and paste this link into your browser:
            </p>

            <p>
                <a href="${verificationURL}">
                ${verificationURL}
                </a>
            </p>

            <p>
                This verification link will expire for security reasons.
                If you didn’t create this account, you can safely ignore this email.
            </p>

            <p>— Prisma Blog App Team</p>
            </div>

            <div class="footer">
            © ${new Date().getFullYear()} Prisma Blog App. All rights reserved.
            </div>
        </div>
        </body>
        </html>
        `,
        });

        console.log("Message sent:", info.messageId);
      } catch (error) {
        console.error("Error sending email:", error);
        throw error;
      }
    },
  },
  socialProviders: {
    google: {
      accessType: "offline",
      prompt: "select_account consent",
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      redirectURI: `${process.env.APP_URL}/api/auth/callback/github`,
    },
  },
  plugins: [
    twoFactor({
      otpOptions: {
        async sendOTP({ user, otp }, ctx) {
          console.log({otp});
          await resend.emails.send({
            from: "Prisma Blog App <prisma@resend.dev>",
            to: user.email,
            subject: "Two-factor authentication code",
            html: `
            <h1>Two-factor authentication code</h1>
            <p>Use the following code to log in to your account: <b>${otp}</b></p>
            `,
            text: `Use the following code to log in to your account: ${otp}`,
          });
        },
      },
      
    }),
  ],
});
