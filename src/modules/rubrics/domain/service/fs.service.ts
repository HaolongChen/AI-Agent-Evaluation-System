import { readdir } from "node:fs/promises";
import { number } from "zod";

type Extension<T extends string = string> =
	T extends `${string}.${infer Extension_}` ? Extension<Extension_> : T;
type FileInitialName<T extends string = string> =
	T extends `${infer Name}.${string}` ? FileInitialName<Name> : T;
type FileMiddleName<T extends string = string> =
	T extends `${infer MiddleNames}${Extension<infer LastMiddleName>}.` ?
		`${FileMiddleName<MiddleNames>}${LastMiddleName}.`
	:	never;
type FileName<T extends string> =
	T extends (
		`${FileInitialName<infer Name>}.${FileMiddleName<infer MiddleNames>}${Extension<infer Extension_>}`
	) ?
		{ name: Name; middleNames: MiddleNames; extension: Extension_ }
	:	{ name: T; middleNames: ""; extension: "" };


type ExtractFieldsFromArray<
  T extends { [Key in string]: string },
	K extends Array<T>,
	E extends keyof T,
  > = {
  [Key in E]: K[number][Key];
}

type FileNameMap<T extends Array<Q>, Q extends FileName<R>, R extends string> = {
	[K in T[number]["name"]]: Extract<T[number], { name: K }>;
}

export class FileSystemService {
  private _fileEntries: FileNameMap<Array<FileName<string>>, FileName<string>, string> = {} as FileNameMap<Array<FileName<string>>, FileName<string>, string>;
	private _folderEntries: string[] = [];
	constructor(private readonly basePath: string) {}

	async ls(): Promise<void> {
		const entries = await readdir(this.basePath, { withFileTypes: true });
		for (const entry of entries) {
			if (entry.isFile()) {
        const fileName: FileName<string> = entry.name as unknown as FileName<string>;
        if ( this._fileEntries.name )
        {
          if(this._fileEntries[fileName.name])
        }
				this._fileEntries.push(fileName);
			} else if (entry.isDirectory()) {
				this._folderEntries.push(entry.name);
			}
		}
	}

	get fileEntries(): FileName<string>[] {
		return this._fileEntries;
	}
	get folderEntries(): string[] {
		return this._folderEntries;
	}
}
