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
    return this.data.name;
  }
}

export class FileEntryEntity extends EntryEntity<typeof fileEntrySchema> {
  constructor(data: z.infer<typeof fileEntrySchema>, id?: string) {
    super(data, fileEntrySchema, id);
  }
  getEntryPathName(): string {
    if (this.data.extension.length > 0) {
      return `${this.data.name}.${this.data.extension}`;
    }
    return this.data.name;
  }
}

export class FolderEntryEntity extends EntryEntity<typeof folderEntrySchema> {
  constructor(data: z.infer<typeof folderEntrySchema>, id?: string) {
    super(data, folderEntrySchema, id);
  }
  getEntryPathName(): string {
    return this.data.name;
  }
}
