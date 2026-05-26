export const copilotInputSchema = z.object({
  goldenSet: goldenSetSchema,
  userInput: userInputSchema
})