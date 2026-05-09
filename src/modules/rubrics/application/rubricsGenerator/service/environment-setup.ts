import { fromUint8Array } from "js-base64";
import { getSchemaModel } from "../../../../../external/ali-oss.ts";
import { Crdt } from "@functorz/crdt-helper";
import { fetchSideBar } from "../tools/documentation-reader.ts";
import fs from "node:fs/promises";

export const setupEnvironment = async (schemaId: string) => {
  await Promise.all([
    fs.mkdir(`${process.env.RUBRICS_GENERATOR_BASE_PATH}/zion/${schemaId}`, {
      recursive: true,
    }),
    fs.mkdir(`${process.env.RUBRICS_GENERATOR_BASE_PATH}/schemas`, {
      recursive: true,
    }),
  ]);
  await Promise.all([
    getSchemaModel(schemaId).then((arrayBuffer) => {
      fs.writeFile(
        `${process.env.RUBRICS_GENERATOR_BASE_PATH}/zion/${schemaId}/crdt_schema.json`,
        JSON.stringify(
          Crdt.initModel(fromUint8Array(new Uint8Array(arrayBuffer))).view(),
        ),
      );
    }),
    fetchSideBar(),
    fs.copyFile(process.env.ZSCHEMA_SRC_PATH, process.env.ZSCHEMA_DEST_PATH),
  ]);
};
