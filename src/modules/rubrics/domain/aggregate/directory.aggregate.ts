import path from "node:path";
import { AggregateRoot } from "../../../shared/domain/aggregate/aggregate-root.ts";
import type {
  EntryEntity,
  FileEntryEntity,
  FolderEntryEntity,
} from "../entity/entry.entity.ts";
import { folderEntrySchema } from "../schema/entry.schema.ts";
import { createInterface } from "node:readline/promises";
import { createReadStream } from "node:fs";
import type { EntityMetadata } from "../../../shared/domain/entity/entity.ts";

export class DirectoryAggregate extends AggregateRoot<
  typeof folderEntrySchema,
  EntityMetadata,
  { folderEntry: FolderEntryEntity[]; fileEntry: FileEntryEntity[] }
> {
  private _entriesMap: Map<string, FolderEntryEntity | FileEntryEntity> =
    new Map();
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
    if (this._entriesMap.has(entry.getEntryPathName())) {
      throw new Error(
        `Entry with name ${entry.getEntryPathName()} already exists in directory ${this.getData("name")}`,
      );
    }
    this.pushEntity(
      entry.schema === folderEntrySchema ? "folderEntry" : "fileEntry",
      entry,
    );
    this._entriesMap.set(entry.getEntryPathName(), entry);
  }

  async readFile(
    name: string,
    limit?: number,
    offset?: number,
  ): Promise<string> {
    const entry = this.getEntryByName(name);
    if (entry && (entry as EntryEntity).getData("type") === "file") {
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
