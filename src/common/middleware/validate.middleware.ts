import { type NextFunction, type Request, type Response } from "express";
import { z } from "zod";

export function validateBody(schema: z.ZodType){
    return (req: Request,res: Response, next: NextFunction): void => {
        const result = schema.safeParse(req.body);
        if(!result.success){
            // formErrors come from whole-object checks (e.g. "provide at least one field")
            const { formErrors, fieldErrors } = z.flattenError(result.error);
            res.status(400).json({
                success: false,
                error:{message: formErrors[0] ?? "Invalid request",details:fieldErrors}
            });
            return;
        }
        req.body = result.data;
        //look at this
        next();
    };
}