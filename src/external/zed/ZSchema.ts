/* eslint-disable unicorn/filename-case */
/* eslint-disable @typescript-eslint/no-explicit-any */

import type { AuthenticationConfig } from "./index.ts";

export const DEFAULT_AUTHENTICATION_CONFIG: AuthenticationConfig = {
  usernameConfig: { enabled: true },
  phoneNumberConfig: { enabled: true },
  emailAuthConfig: { enabled: true },
  wechatConfig: { enabled: true },
  wxworkAuthConfig: { enabled: true },
  ssoConfigs: [],
};

/* tslint:disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: SupportedCustomModelDescriptor
// ====================================================

export interface SupportedCustomModelDescriptor_supportedCustomModelDescriptor {
  __typename: "SupportedCustomModelDescriptor";
  chatModelDescriptors: (any | null)[] | null;
  embeddingModelDescriptors: (any | null)[] | null;
}

export interface SupportedCustomModelDescriptor {
  supportedCustomModelDescriptor: SupportedCustomModelDescriptor_supportedCustomModelDescriptor | null;
}

export enum ColumnType {
  BIGINT = "BIGINT",
  BIGSERIAL = "BIGSERIAL",
  BITMAP = "BITMAP",
  BOOLEAN = "BOOLEAN",
  DATE = "DATE",
  DECIMAL = "DECIMAL",
  FILE = "FILE",
  FLOAT8 = "FLOAT8",
  GEO_POINT = "GEO_POINT",
  IMAGE = "IMAGE",
  IMAGE_LIST = "IMAGE_LIST",
  INTEGER = "INTEGER",
  INTERVAL = "INTERVAL",
  JSONB = "JSONB",
  LOCATION_INFO = "LOCATION_INFO",
  TEXT = "TEXT",
  TIMESTAMPTZ = "TIMESTAMPTZ",
  TIMETZ = "TIMETZ",
  UNKNOWN = "UNKNOWN",
  VIDEO = "VIDEO",
}

export enum AfCodeTemplateStatus {
  CREATED = "CREATED",
  PUBLISHED = "PUBLISHED",
}

export const SYSTEM_MODEL_PROVIDER = "Functorz";

export enum ProjectCreationStatus {
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  PROCESSING = "PROCESSING",
}

export interface OnProjectCreationStatusChanged_onProjectCreationStatusChanged {
  __typename: "ProjectCreationResult";
  projectExId: string | null;
  status: ProjectCreationStatus | null;
}

export interface OnProjectCreationStatusChanged {
  onProjectCreationStatusChanged: OnProjectCreationStatusChanged_onProjectCreationStatusChanged | null;
}

export interface OnProjectCreationStatusChangedVariables {
  uniqueId: string;
}
