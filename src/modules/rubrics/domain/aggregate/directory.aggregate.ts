import path from "node:path";
import { AggregateRoot } from "../../../shared/domain/aggregate/aggregate-root.ts";
import type {
  FileEntryEntity,
  FolderEntryEntity,
} from "../entity/entry.entity.ts";
import type { folderEntrySchema } from "../schema/entry.schema.ts";
import { createInterface } from "node:readline/promises";
import { createReadStream } from "node:fs";

export class DirectoryAggregate extends AggregateRoot<
  typeof folderEntrySchema,
  FolderEntryEntity
> {
  private _entries: (FolderEntryEntity | FileEntryEntity)[] = [];
  private _pathStore: Array<string> = ["."];
  private _entriesMap: Map<string, FolderEntryEntity | FileEntryEntity> =
    new Map();

  get entries(): (FolderEntryEntity | FileEntryEntity)[] {
    return this._entries;
  }
  constructor(
    entity: FolderEntryEntity,
    private basePath: string,
  ) {
    super(entity);
    if (!basePath.endsWith("/")) {
      this.basePath = basePath + "/";
    }
  }

  getEntryByName(
    name: string,
  ): FolderEntryEntity | FileEntryEntity | undefined {
    if (this._entriesMap.has(name)) {
      return this._entriesMap.get(name);
    }
    return undefined;
  }

  addEntry(entry: FolderEntryEntity | FileEntryEntity) {
    if (this._entriesMap.has(entry.data.name)) {
      throw new Error("Entry with same name already exists");
    }
    this._entriesMap.set(entry.data.name, entry);
    this._entries.push(entry);
    this._pathStore.push(entry.getEntryPathName());
  }

  async readFile(
    name: string,
    limit?: number,
    offset?: number,
  ): Promise<string> {
    const entry = this.getEntryByName(name);
    if (entry && entry.data.type === "file") {
      const fullPath = path.join(this.basePath, entry.getEntryPathName());
      const fileStream = createReadStream(fullPath);
      const rl = createInterface({ input: fileStream, crlfDelay: Infinity });
      let content = "";
      let currentLine = 0;
      for await (const line of rl) {
        currentLine++;
        if (offset && currentLine <= offset) {
          continue;
        }
        if (limit && currentLine > limit + (offset || 0)) {
          content += "\n[Content truncated]";
          break;
        }
        content += line + "\n";
      }
      return content;
    }
    throw new Error("File not found");
  }
}
