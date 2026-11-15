import { z } from "zod";

export const activeModeSchema = z.object({
  mode: z.string().trim().toUpperCase().pipe(z.enum(["CUSTOMER", "PROVIDER"])),
});

export type ActiveModeInput = z.infer<typeof activeModeSchema>;
