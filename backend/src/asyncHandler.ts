import { NextFunction, Request, Response } from "express";

// async route mein error aaye to Express ke error middleware tak pahunchata hai
export const asyncHandler =
  (fn: (req: any, res: Response, next: NextFunction) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
