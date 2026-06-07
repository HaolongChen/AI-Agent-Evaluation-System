import z from "zod";

const unauthorizedPhoneAccountSchema = z.object({
  phoneNumber: z.string(),
  password: z.string(),
} );

const unauthorizedUsernameAccountSchema = z.object({
  username: z.string(),
  password: z.string(),
} );

const accountInfoSchema = z.object( {
  accessToken: z.string(),
  exId: z.string(),
  username: z.string(),
  organizationExId: z.string(),
  organizationName: z.string(),
} );

export const unauthorizedAccountSchema = {
  withPhoneNumber: unauthorizedPhoneAccountSchema,
  withUsername: unauthorizedUsernameAccountSchema,
} as const;

export const accountSchema = {
  withPhoneNumber: unauthorizedPhoneAccountSchema.extend( accountInfoSchema.shape ),
  withUsername: unauthorizedUsernameAccountSchema.extend( accountInfoSchema.shape ),
} as const;
