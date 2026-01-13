import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError";

const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  console.log({statusCode});

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    error: err,
  });
};

export default errorHandler;
