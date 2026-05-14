import z from "zod";

export const entryTypeEnum = z.enum(["file", "folder"]);

export const extensionEnum = z.enum(["md", "txt", "json"]);

export const commonEntrySchema = z.object({
  name: z.string(),
  type: entryTypeEnum,
});

export const fileEntrySchema = commonEntrySchema.extend({
  extension: extensionEnum,
  wordsCount: z.number(),
});

export const folderEntrySchema = commonEntrySchema.extend({
  entriesCount: z.number(),
});
