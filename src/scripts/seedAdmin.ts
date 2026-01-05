import { prisma } from "../lib/prisma";

async function seedAdmin() {
    try {
        const adminData = {
          name: process.env.ADMIN_NAME,
          email: process.env.ADMIN_EMAIL,
          password: process.env.ADMIN_PASSWORD,
          role: process.env.ADMIN_ROLE,
        };
        const existingAdmin = await prisma.user.findUnique({
            where: {
                email: adminData.email as string
            }
        })
        if(existingAdmin) {
            console.log("Admin already exists");
            return;
        }

        const signupAdmin = await fetch("http://localhost:3000/api/auth/sign-up/email", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(adminData)
        })
        console.log(signupAdmin);

        if(signupAdmin.ok) {
            await prisma.user.update({
                where: {
                    email: adminData.email as string
                },
                data: {
                    emailVerified: true
                }
            })
        }
    } catch (error) {
        console.log(error);
    }
}

seedAdmin();