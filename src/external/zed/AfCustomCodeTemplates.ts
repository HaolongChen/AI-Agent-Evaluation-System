/* eslint-disable unicorn/filename-case */
/* eslint-disable unicorn/no-abusive-eslint-disable */
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ColumnType, AfCodeTemplateStatus } from "./ZSchema.ts";

// ====================================================
// GraphQL query operation: AfCustomCodeTemplates
// ====================================================

export interface AfCustomCodeTemplates_visibleAfCustomCodeTemplates_inputType {
  __typename: "NodeTemplateVariable";
  name: string | null;
  type: ColumnType | null;
  defaultValue: any | null;
  required: boolean;
  description: string | null;
}

export interface AfCustomCodeTemplates_visibleAfCustomCodeTemplates_outputType {
  __typename: "NodeTemplateVariable";
  name: string | null;
  type: ColumnType | null;
  defaultValue: any | null;
  required: boolean;
  description: string | null;
}

export interface AfCustomCodeTemplates_visibleAfCustomCodeTemplates {
  __typename: "AfCodeTemplate";
  async: boolean;
  exId: string;
  author: any;
  displayName: string;
  inputType: (AfCustomCodeTemplates_visibleAfCustomCodeTemplates_inputType | null)[];
  logoUrl: string;
  outputType: (AfCustomCodeTemplates_visibleAfCustomCodeTemplates_outputType | null)[];
  status: AfCodeTemplateStatus | null;
  templateGroup: string;
  updatedAt: any | null;
  version: string | null;
}

export interface AfCustomCodeTemplates {
  visibleAfCustomCodeTemplates:
    | (AfCustomCodeTemplates_visibleAfCustomCodeTemplates | null)[]
    | null;
}
