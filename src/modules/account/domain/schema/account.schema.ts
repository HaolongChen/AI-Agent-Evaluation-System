import z from "zod";

export const unauthorizedAccountSchema = z.object({
  type: z.enum(["phone", "username"]),
  value: z.string(),
  password: z.string(),
});

export type AccountInfo = z.infer<typeof accountInfoSchema>;

const accountInfoSchema = z.object({
  accessToken: z.string(),
  exId: z.string(),
  username: z.string(),
  organizationExId: z.string(),
  organizationName: z.string(),
});

export const accountSchema = accountInfoSchema.extend(
  unauthorizedAccountSchema.shape,
);
