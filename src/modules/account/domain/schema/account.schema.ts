import z from "zod";

export const accountSchema = z.object({
  phoneNumber: z.string(),
  password: z.string(),
});

export interface AccountInfo {
  accessToken: string;
  account: {
    exId: string;
    username: string;
  };
}
