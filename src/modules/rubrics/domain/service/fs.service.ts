import { readdir } from "node:fs/promises";

interface IFileName {
  name: string;
  extension: string | undefined;
  middleNames: string[];
}

class FileName implements IFileName {
  name: string;
  extension: string | undefined;
  middleNames: string[];
  attachedTo: FileName[] = [];
  attachments: FileName[] = [];
  constructor(data: FileName | string) {
    if (typeof data === "string") {
      this.name = data.split(".")[0];
      this.extension = data.split(".").slice(1).at(-1);
      this.middleNames = data.split(".").slice(1, -1);
    } else {
      this.name = data.name;
      this.extension = data.extension;
      this.middleNames = data.middleNames;
      this.attachedTo = data.attachedTo;
      this.attachments = data.attachments;
    }
  }

  get realName(): string {
    if (!this.extension) {
      return this.name;
    }
    if (this.middleNames.length === 0) {
      return `${this.name}.${this.extension}`;
    }
    return `${this.name}.${this.middleNames.join(".")}.${this.extension}`;
  }

  fastIdentityCheck(fileName: FileName): boolean {
    return (
      this.name === fileName.name &&
      this.extension === fileName.extension &&
      this.middleNames.join(".") === fileName.middleNames.join(".")
    );
  }

  createAttachmentTo(fileNames: FileName[], rawAttachment: FileName | string) {
    const attachment = new FileName(rawAttachment);
    for (const fileName of fileNames) {
      fileName.attachments.push(attachment);
      attachment.attachedTo.push(fileName);
    }
  }

  hasThisLeaf(fileName: FileName): boolean {
    if (!this.fastIdentityCheck(fileName)) {
      return false;
    }
    if (this.middleNames.length >= fileName.middleNames.length) {
      return false;
    }
    return (
      fileName.middleNames.slice(0, this.middleNames.length).join(".") ===
      this.middleNames.join(".")
    );
  }

  exact(fileName: FileName): boolean {
    if (!this.fastIdentityCheck(fileName)) {
      return false;
    }
    if (this.middleNames.length !== fileName.middleNames.length) {
      return false;
    }
    return this.middleNames.every(
      (middleName, index) => middleName === fileName.middleNames[index],
    );
  }
}

export class FileService {
  private _fileEntriesMap: Map<string, FileName[]> = new Map<
    string,
    FileName[]
  >();

  getByKey(key: string): FileName[] | undefined {
    return this._fileEntriesMap.get(key);
  }
  addFile(fileName: string | FileName): void {
    const existingFiles = this.exists(fileName);
    if (existingFiles === undefined) {
      const newFileName = new FileName(fileName);
      this._fileEntriesMap.set(newFileName.name, [newFileName]);
    } else if (Array.isArray(existingFiles)) {
      existingFiles.push(new FileName(fileName));
    }
  }

  exists(rawFileName: FileName | string): FileName[] | FileName | undefined {
    const fileName = new FileName(rawFileName);
    const existingFiles = this.getByKey(fileName.name);
    if (!existingFiles) {
      return undefined;
    }
    const exactFile = existingFiles.filter(
      (file) =>
        file.extension === fileName.extension &&
        file.middleNames.join(".") === fileName.middleNames.join("."),
    );
    if (exactFile.length > 1) {
      throw new Error(
        `Multiple files with the same name ${fileName.realName} exist`,
      );
    }
    if (exactFile.length > 0) {
      return exactFile[0];
    }
    return existingFiles;
  }
}

export class FileSystemService extends FileService {
  private _folderEntries: string[] = [];
  constructor(private readonly basePath: string) {
    super();
  }

  async ls(): Promise<FileService> {
    const entries = await readdir(this.basePath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile()) {
        this.addFile(entry.name);
      } else if (entry.isDirectory()) {
        this._folderEntries.push(entry.name);
      }
    }
    return this;
  }

  get folderEntries(): string[] {
    return this._folderEntries;
  }

  cd(folderName: string): FileSystemService {
    if (!this._folderEntries.includes(folderName)) {
      throw new Error(
        `Folder ${folderName} does not exist in ${this.basePath}`,
      );
    }
    return new FileSystemService(`${this.basePath}/${folderName}`);
  }
}
