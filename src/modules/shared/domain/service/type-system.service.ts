/* eslint-disable unicorn/prevent-abbreviations */
/* eslint-disable unicorn/no-null */
import { isNull, isUndefined, isNil } from "lodash-es";
import {
  ActionFlowTemplateCodeDescriptor,
  AIModelDescriptors,
  CustomChatCompletionFeatures,
  CustomChatModelDescriptor,
  CustomEmbeddingModelDescriptor,
  CustomModelParam as CustomModelParameter,
  ExtraContext,
  Identifier,
  KtList,
  KtMap,
  ModelCustomParamDescriptor as ModelCustomParameterDescriptor,
  Variable,
  ZTypeCoreApi,
} from "../interface/type-system.ts";
const SYSTEM_MODEL_PROVIDER = "Functorz";
import type {
  AfCustomCodeTemplatesQuery,
  SupportedCustomModelDescriptorQuery,
} from "../../../../graphql/generated/types.ts";

export type Nullable<T> = T | null | undefined;

export function isNotNull<T>(object: T | null): object is T {
  return !isNull(object);
}

export function isDefined<T>(object: T | undefined): object is T {
  return !isUndefined(object);
}

export function isDefinedAndNotNull<T>(
  object: T | undefined | null,
): object is T {
  return !isNil(object);
}

export function filterNotNullOrUndefined<T>(
  items: Array<T | null | undefined>,
): Array<T> {
  return items.filter((e) => !isNull(e) && !isUndefined(e)) as Array<T>;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export type RequiredNonNullable<P> = {
  [K in keyof P]-?: NonNullable<P[K]> extends any[]
    ? NonNullable<NonNullable<P[K]>[number]>[]
    : NonNullable<P[K]>;
};

export const assertUnreachable = (error: string): never => {
  throw new Error(error);
};

export function assertNotNull<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) {
    throw new Error("Found unexpected null value");
  }
  return value;
}

export type ExtractArray<T extends any[]> = T extends (infer U)[] ? U : never;

export const getError = (errorMessage: string, result: unknown) => {
  const error = new Error(errorMessage);
  (error as unknown as { result: unknown }).result = result;
  throw error;
};

export function genExtraContext(
  aiModelDescriptors:
    | {
        [
          K in keyof Exclude<
            SupportedCustomModelDescriptorQuery["supportedCustomModelDescriptor"],
            null
          >
        ]: K extends "__typename"
          ? "SupportedCustomModelDescriptor"
          : (any | null)[] | null;
      }
    | null,
  afTemplateCodeDescriptors: Exclude<
    ExtractArray<
      Exclude<AfCustomCodeTemplatesQuery["visibleAfCustomCodeTemplates"], null>
    >,
    null
  >[],
) {
  const getAFTemplateCodeInputOutputMap = (
    inputOrOutputType: Array<
      Exclude<
        | ExtractArray<
            Exclude<
              ExtractArray<
                Exclude<
                  AfCustomCodeTemplatesQuery["visibleAfCustomCodeTemplates"],
                  null
                >
              >,
              null
            >["inputType"]
          >
        | ExtractArray<
            Exclude<
              ExtractArray<
                Exclude<
                  AfCustomCodeTemplatesQuery["visibleAfCustomCodeTemplates"],
                  null
                >
              >,
              null
            >["outputType"]
          >,
        null
      >
    >,
  ) => {
    const inputOrOutputTypeMap = new Map(
      inputOrOutputType.map((item) => {
        const { name, type, required, defaultValue } = item;
        return [
          assertNotNull(name),
          new Variable(
            assertNotNull(type),
            null,
            !required,
            null,
            null,
            null,
            null,
            isNil(defaultValue)
              ? null
              : ZTypeCoreApi.parseDataBindingFromJsObject(defaultValue),
          ),
        ];
      }),
    );
    return KtMap.fromJsMap(inputOrOutputTypeMap);
  };
  return new ExtraContext(
    new AIModelDescriptors(
      KtList.fromJsArray(
        assertNotNull(aiModelDescriptors?.chatModelDescriptors ?? []).map(
          (item) =>
            new CustomChatModelDescriptor(
              item.provider,
              item.name,
              fetchCustomModelParameter(item.paramToConfigure),
              item.delisted,
              new CustomChatCompletionFeatures(
                item.features.streamResponse,
                item.features.multiModal,
                item.features.imageInput ?? false,
                false,
                item.features.videoInput ?? false,
                item.features.imageMessageInput ?? false,
                false,
                item.features.videoMessageInput ?? false,
                item.features.tools,
                item.features.reasoningContent,
                item.features.imageOutput,
                item.features.videoOutput,
                null,
                item.features.structuredOutput,
              ),
              item.provider === SYSTEM_MODEL_PROVIDER
                ? new Identifier(
                    item.customModelIdentifier.id,
                    item.customModelIdentifier.namespace,
                  )
                : null,
            ),
        ),
      ),
      KtList.fromJsArray(
        assertNotNull(aiModelDescriptors?.embeddingModelDescriptors ?? []).map(
          (item) =>
            new CustomEmbeddingModelDescriptor(
              item.provider,
              item.name,
              fetchCustomModelParameter(item.paramToConfigure),
              item.provider === SYSTEM_MODEL_PROVIDER
                ? new Identifier(
                    item.customModelIdentifier.id,
                    item.customModelIdentifier.namespace,
                  )
                : null,
              item.delisted,
            ),
        ),
      ),
    ),
    KtMap.fromJsMap(
      new Map(
        afTemplateCodeDescriptors.map((item) => [
          item.exId,
          new ActionFlowTemplateCodeDescriptor(
            item.exId,
            item.async,
            getAFTemplateCodeInputOutputMap(
              filterNotNullOrUndefined(item.inputType ?? []),
            ),
            getAFTemplateCodeInputOutputMap(
              filterNotNullOrUndefined(item.outputType ?? []),
            ),
          ),
        ]),
      ),
    ),
  );
}

const fetchCustomModelParameter = (parameterToConfigure: any) =>
  new CustomModelParameter(
    new ModelCustomParameterDescriptor(
      parameterToConfigure.serverUrl.name,
      KtMap.fromJsMap(
        new Map(Object.entries(parameterToConfigure.serverUrl.displayName)),
      ),
      parameterToConfigure.serverUrl.type,
      KtMap.fromJsMap(
        new Map(Object.entries(parameterToConfigure.serverUrl.description)),
      ),
    ),
    new ModelCustomParameterDescriptor(
      parameterToConfigure.apiToken.name,
      KtMap.fromJsMap(
        new Map(Object.entries(parameterToConfigure.apiToken.displayName)),
      ),
      parameterToConfigure.apiToken.type,
      KtMap.fromJsMap(
        new Map(Object.entries(parameterToConfigure.apiToken.description)),
      ),
    ),
    KtList.fromJsArray(
      (parameterToConfigure.extensionParams as any[]).map(
        (parameter) =>
          new ModelCustomParameterDescriptor(
            parameter.name,
            KtMap.fromJsMap(new Map(Object.entries(parameter.displayName))),
            parameter.type,
            KtMap.fromJsMap(new Map(Object.entries(parameter.displayName))),
          ),
      ),
    ),
  );
