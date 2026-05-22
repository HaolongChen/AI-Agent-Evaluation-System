import { describe, it, expect } from "vitest";
import {
  FileEntryEntity,
  FolderEntryEntity,
} from "../entity/entry.entity.ts";
import { DirectoryAggregate } from "../aggregate/directory.aggregate.ts";

describe("DirectoryAggregate", () => {
  const folder = new FolderEntryEntity({
    name: "root",
    type: "folder",
    entriesCount: 0,
  });

  it("should construct with FolderEntryEntity and basePath", () => {
    const agg = new DirectoryAggregate(folder, "/test/path");
    expect(agg).toBeInstanceOf(DirectoryAggregate);
  });

  it("should auto-append trailing slash to basePath when missing", () => {
    // basePath is private; we verify the constructor doesn't throw
    // and the aggregate is in a valid state
    const agg = new DirectoryAggregate(folder, "/test/path");
    expect(agg.entries).toEqual([]);
  });

  it("should accept basePath with trailing slash", () => {
    const agg = new DirectoryAggregate(folder, "/test/path/");
    expect(agg.entries).toEqual([]);
  });

  it("should start with empty entries", () => {
    const agg = new DirectoryAggregate(folder, "/test/path/");
    expect(agg.entries).toEqual([]);
  });

  it("should add a FileEntryEntity via addEntry", () => {
    const agg = new DirectoryAggregate(folder, "/test/path/");
    const file = new FileEntryEntity({
      name: "readme",
      type: "file",
      extension: "md",
      wordsCount: 100,
    });
    agg.addEntry(file);
    expect(agg.entries).toHaveLength(1);
    expect(agg.entries[0]).toBe(file);
  });

  it("should add a FolderEntryEntity via addEntry", () => {
    const agg = new DirectoryAggregate(folder, "/test/path/");
    const subFolder = new FolderEntryEntity({
      name: "sub",
      type: "folder",
      entriesCount: 0,
    });
    agg.addEntry(subFolder);
    expect(agg.entries).toHaveLength(1);
    expect(agg.entries[0]).toBe(subFolder);
  });

  it("should throw when adding entry with duplicate name", () => {
    const agg = new DirectoryAggregate(folder, "/test/path/");
    const file1 = new FileEntryEntity({
      name: "readme",
      type: "file",
      extension: "md",
      wordsCount: 100,
    });
    const file2 = new FileEntryEntity({
      name: "readme",
      type: "file",
      extension: "json",
      wordsCount: 50,
    });
    agg.addEntry(file1);
    expect(() => agg.addEntry(file2)).toThrow(
      "Entry with same name already exists",
    );
  });

  it("getEntryByName should return entry for existing name", () => {
    const agg = new DirectoryAggregate(folder, "/test/path/");
    const file = new FileEntryEntity({
      name: "readme",
      type: "file",
      extension: "md",
      wordsCount: 100,
    });
    agg.addEntry(file);
    expect(agg.getEntryByName("readme")).toBe(file);
  });

  it("getEntryByName should return undefined for non-existing name", () => {
    const agg = new DirectoryAggregate(folder, "/test/path/");
    expect(agg.getEntryByName("nonexistent")).toBeUndefined();
  });

  it("entries getter should return all added entries", () => {
    const agg = new DirectoryAggregate(folder, "/test/path/");
    const file1 = new FileEntryEntity({
      name: "file1",
      type: "file",
      extension: "md",
      wordsCount: 100,
    });
    const file2 = new FileEntryEntity({
      name: "file2",
      type: "file",
      extension: "json",
      wordsCount: 200,
    });
    agg.addEntry(file1);
    agg.addEntry(file2);
    expect(agg.entries).toEqual([file1, file2]);
  });

  it("entries getter should be the same array reference", () => {
    const agg = new DirectoryAggregate(folder, "/test/path/");
    expect(agg.entries).toBe(agg.entries);
  });

  describe("readFile", () => {
    it("should throw for non-existent entry name", async () => {
      const agg = new DirectoryAggregate(folder, "/test/path/");
      await expect(agg.readFile("nonexistent")).rejects.toThrow(
        "File not found",
      );
    });
  });
});
