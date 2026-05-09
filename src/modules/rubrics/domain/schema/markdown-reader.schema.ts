import z from "zod";

export const markdownReaderToolField = {
  name: "read_markdown_documentations",
  description:
    "Read large markdown documentations lazily by heading or keyword with bounded output.",
  schema: z.object({
    filePath: z
      .string()
      .optional()
      .describe(
        "Relative path under /momen_docs, for example '/introduction.md'. Omit to auto-select a file.",
      ),
    heading: z
      .string()
      .optional()
      .describe("Optional markdown heading to extract as a focused section."),
    keyword: z
      .string()
      .optional()
      .describe("Optional keyword to extract nearby text windows."),
  }),
};
