import { isNull, isUndefined, isNil } from 'lodash-es';
import {
  ActionFlowTemplateCodeDescriptor,
  AIModelDescriptors,
  CustomChatCompletionFeatures,
  CustomChatModelDescriptor,
  CustomEmbeddingModelDescriptor,
  CustomModelParam,
  ExtraContext,
  Identifier,
  KtList,
  KtMap,
  ModelCustomParamDescriptor,
  Variable,
  ZTypeSystem,
} from './TypeSystem.ts';
import {
  SYSTEM_MODEL_PROVIDER,
  type SupportedCustomModelDescriptor_supportedCustomModelDescriptor,
} from './ZSchema.ts';
import type {
  AfCustomCodeTemplates_visibleAfCustomCodeTemplates,
  AfCustomCodeTemplates_visibleAfCustomCodeTemplates_inputType,
  AfCustomCodeTemplates_visibleAfCustomCodeTemplates_outputType,
} from './AfCustomCodeTemplates.ts';

export type Nullable<T> = T | null | undefined;

export function isNotNull<T>(obj: T | null): obj is T {
  return !isNull(obj);
}

export function isDefined<T>(obj: T | undefined): obj is T {
  return !isUndefined(obj);
}

export function isDefinedAndNotNull<T>(obj: T | undefined | null): obj is T {
  return !isNil(obj);
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

export const assertUnreachable = (err: string): never => {
  throw new Error(err);
};

export function assertNotNull<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) {
    throw new Error('Found unexpected null value');
  }
  return value;
}

export const getError = (errorMessage: string, result: unknown) => {
  const error = new Error(errorMessage);
  (error as unknown as { result: unknown }).result = result;
  throw error;
};

export function genExtraContext(
  aiModelDescriptors: SupportedCustomModelDescriptor_supportedCustomModelDescriptor | null,
  afTemplateCodeDescriptors: AfCustomCodeTemplates_visibleAfCustomCodeTemplates[],
) {
  const getAFTemplateCodeInputOutputMap = (
    inputOrOutputType: (
      | AfCustomCodeTemplates_visibleAfCustomCodeTemplates_inputType
      | AfCustomCodeTemplates_visibleAfCustomCodeTemplates_outputType
    )[],
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
              : ZTypeSystem.parseDataBindingFromJsObject(defaultValue),
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
              fetchCustomModelParam(item.paramToConfigure),
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
              fetchCustomModelParam(item.paramToConfigure),
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

const fetchCustomModelParam = (paramToConfigure: any) =>
  new CustomModelParam(
    new ModelCustomParamDescriptor(
      paramToConfigure.serverUrl.name,
      KtMap.fromJsMap(
        new Map(Object.entries(paramToConfigure.serverUrl.displayName)),
      ),
      paramToConfigure.serverUrl.type,
      KtMap.fromJsMap(
        new Map(Object.entries(paramToConfigure.serverUrl.description)),
      ),
    ),
    new ModelCustomParamDescriptor(
      paramToConfigure.apiToken.name,
      KtMap.fromJsMap(
        new Map(Object.entries(paramToConfigure.apiToken.displayName)),
      ),
      paramToConfigure.apiToken.type,
      KtMap.fromJsMap(
        new Map(Object.entries(paramToConfigure.apiToken.description)),
      ),
    ),
    KtList.fromJsArray(
      (paramToConfigure.extensionParams as any[]).map(
        (param) =>
          new ModelCustomParamDescriptor(
            param.name,
            KtMap.fromJsMap(new Map(Object.entries(param.displayName))),
            param.type,
            KtMap.fromJsMap(new Map(Object.entries(param.displayName))),
          ),
      ),
    ),
  );

