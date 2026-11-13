import z from "zod";

export const loginSchema = z.object({
    email: z.string().trim().toLowerCase().pipe(z.email()),
    password: z.string().min(1).max(128)
})

export type LoginInput = z.infer<typeof loginSchema>;



export const registerSchema = z.object({
    email: z.string().trim().toLowerCase().pipe(z.email()),
    password: z.string().min(8).max(128),
    mobileNumber: z.string().min(9).max(12),
    name: z.string().min(8).max(128),
    // accepts "male", "Male", "MALE", ... and stores the uppercase enum value
    gender: z.string().trim().toUpperCase().pipe(z.enum(["MALE", "FEMALE", "OTHER"]))
})

export type RegisterInput = z.infer<typeof registerSchema>;