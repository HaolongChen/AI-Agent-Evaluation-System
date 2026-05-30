import type z from "zod";
import { Entity } from "../../../shared/domain/entity/entity.ts";
import { fileEntrySchema, folderEntrySchema } from "../schema/entry.schema.js";
export class FileEntryEntity extends Entity<typeof fileEntrySchema> {
  constructor(data: z.infer<typeof fileEntrySchema>, id?: string) {
    super(data, fileEntrySchema, id);
  }
  getEntryPathName(): string {
    if (this.getData("extension").length > 0) {
      return `${this.getData("name")}.${this.getData("extension")}`;
    }
    return this.getData("name");
  }
}

export class FolderEntryEntity extends Entity<typeof folderEntrySchema> {
  constructor(data: z.infer<typeof folderEntrySchema>, id?: string) {
    super(data, folderEntrySchema, id);
  }
  getEntryPathName(): string {
    return this.getData("name");
  }
}
