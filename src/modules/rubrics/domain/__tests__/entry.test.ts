import { describe, it, expect } from "vitest";
import {
  EntryEntity,
  FileEntryEntity,
  FolderEntryEntity,
} from "../entity/entry.entity.ts";
import { commonEntrySchema } from "../schema/entry.schema.ts";

describe("EntryEntity", () => {
  it("should create with valid name and type 'file'", () => {
    const entry = new EntryEntity(
      { name: "valid-file", type: "file" },
      commonEntrySchema,
    );
    expect(entry).toBeInstanceOf(EntryEntity);
    expect(entry.data.name).toBe("valid-file");
    expect(entry.data.type).toBe("file");
  });

  it("should create with type 'folder'", () => {
    const entry = new EntryEntity(
      { name: "valid-folder", type: "folder" },
      commonEntrySchema,
    );
    expect(entry.data.type).toBe("folder");
  });

  it("getEntryPathName should return the name", () => {
    const entry = new EntryEntity(
      { name: "my-entry", type: "file" },
      commonEntrySchema,
    );
    expect(entry.getEntryPathName()).toBe("my-entry");
  });

  describe("illegal character validation in name", () => {
    const testCases: [string, string][] = [
      ["/", "forward slash"],
      ["\\", "backslash"],
      ["?", "question mark"],
      ["%", "percent"],
      ["*", "asterisk"],
      [":", "colon"],
      ["|", "pipe"],
      ['"', "double quote"],
      ["<", "less than"],
      [">", "greater than"],
      [" ", "space"],
    ];

    for (const [char, description] of testCases) {
      it(`should throw for name containing ${description} (${char})`, () => {
        expect(
          () =>
            new EntryEntity(
              { name: `name${char}`, type: "file" },
              commonEntrySchema,
            ),
        ).toThrow("Invalid entry name");
      });
    }
  });

  it("should accept name without illegal characters", () => {
    const entry = new EntryEntity(
      { name: "my-normal-file-123", type: "file" },
      commonEntrySchema,
    );
    expect(entry.data.name).toBe("my-normal-file-123");
  });
});

describe("FileEntryEntity", () => {
  it("should create with valid data", () => {
    const file = new FileEntryEntity({
      name: "readme",
      type: "file",
      extension: "md",
      wordsCount: 100,
    });
    expect(file).toBeInstanceOf(FileEntryEntity);
    expect(file.data.name).toBe("readme");
    expect(file.data.extension).toBe("md");
    expect(file.data.wordsCount).toBe(100);
  });

  it("getEntryPathName should return 'name.extension' for md extension", () => {
    const file = new FileEntryEntity({
      name: "readme",
      type: "file",
      extension: "md",
      wordsCount: 50,
    });
    expect(file.getEntryPathName()).toBe("readme.md");
  });

  it("getEntryPathName should return 'name.extension' for txt extension", () => {
    const file = new FileEntryEntity({
      name: "notes",
      type: "file",
      extension: "txt",
      wordsCount: 200,
    });
    expect(file.getEntryPathName()).toBe("notes.txt");
  });

  it("getEntryPathName should return 'name.extension' for json extension", () => {
    const file = new FileEntryEntity({
      name: "data",
      type: "file",
      extension: "json",
      wordsCount: 0,
    });
    expect(file.getEntryPathName()).toBe("data.json");
  });
});

describe("FolderEntryEntity", () => {
  it("should create with valid data", () => {
    const folder = new FolderEntryEntity({
      name: "src",
      type: "folder",
      entriesCount: 10,
    });
    expect(folder).toBeInstanceOf(FolderEntryEntity);
    expect(folder.data.name).toBe("src");
    expect(folder.data.type).toBe("folder");
    expect(folder.data.entriesCount).toBe(10);
  });

  it("getEntryPathName should return the name", () => {
    const folder = new FolderEntryEntity({
      name: "src",
      type: "folder",
      entriesCount: 5,
    });
    expect(folder.getEntryPathName()).toBe("src");
  });
});
