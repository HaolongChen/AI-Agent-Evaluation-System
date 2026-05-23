import type z from "zod";
import { Entity } from "../../../shared/domain/entity/entity.ts";
import {
  commonEntrySchema,
  fileEntrySchema,
  folderEntrySchema,
} from "../schema/entry.schema.js";

export class EntryEntity<T extends typeof commonEntrySchema> extends Entity<T> {
  private illegalCharRegExp = /[/\\?%*:|"<> ]/;
  constructor(data: z.infer<T>, schema: T, id?: string) {
    super(data, schema, id);
    if (this.illegalCharRegExp.test(data.name)) {
      throw new Error("Invalid entry name");
    }
  }

  getEntryPathName(): string {
    return this.getData("name");
  }
}

export class FileEntryEntity extends EntryEntity<typeof fileEntrySchema> {
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

export class FolderEntryEntity extends EntryEntity<typeof folderEntrySchema> {
  constructor(data: z.infer<typeof folderEntrySchema>, id?: string) {
    super(data, folderEntrySchema, id);
  }
  getEntryPathName(): string {
    return this.getData("name");
  }
}
