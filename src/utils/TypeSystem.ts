import ztype from '@functorz/ztype';

const ztypePackage = ztype.com.functorz.ztype;

export type DiffPathComponent = ztype.com.functorz.ztype.typesystem.schema.diff.DiffPathComponent;
export type FieldDescriptor = ztype.com.functorz.ztype.typesystem.types.FieldDescriptor;
export type JsErrorMessage = ztype.com.functorz.ztype.typesystem.JsErrorMessage;
export type OpaqueSchemaGraph = ztype.com.functorz.ztype.typesystem.OpaqueSchemaGraph;
export type OpaqueType = ztype.com.functorz.ztype.typesystem.types.OpaqueType;
export type UpdateSchemaGraphResults = ztype.com.functorz.ztype.typesystem.UpdateSchemaGraphResults;
export type TypeDescriptor = ztype.com.functorz.ztype.typesystem.types.TypeDescriptor;
export type ValidationResults = ztype.com.functorz.ztype.typesystem.ValidationResults;
export type OpaqueDataBindingSelectorContext =
  ztype.com.functorz.ztype.typesystem.OpaqueDataBindingSelectorContext;
export type OpaqueTypeSelectorContext =
  ztype.com.functorz.ztype.typesystem.OpaqueTypeSelectorContext;
export type CopyPasteMenuItemStatus =
  ztype.com.functorz.ztype.application.data.CopyPasteMenuItemStatus;
export type DataBindingSelectorOptionJS =
  ztype.com.functorz.ztype.application.editor.databinding.DataBindingSelectorOptionJS;
export type TypeSelectorOptionJs =
  ztype.com.functorz.ztype.application.editor.type.TypeSelectorOptionJs;
export type DataBindingSelectorOptionResult =
  ztype.com.functorz.ztype.application.editor.databinding.DataBindingSelectorOptionResult;
export type TypeSelectorOptionResult =
  ztype.com.functorz.ztype.application.editor.type.TypeSelectorOptionResult;
export type CodeComponentInputMutationResult =
  ztype.com.functorz.ztype.application.editor.CodeComponentInputMutationResult;
export type CopilotApiResult = ztype.com.functorz.ztype.application.copilot.CopilotApiResult;
export type ZAiConfigWrapperJs = ztype.com.functorz.ztype.typesystem.schema.ZAiConfigWrapperJs;
export type ThirdPartyApiWrapperJs =
  ztype.com.functorz.ztype.typesystem.schema.ThirdPartyApiWrapperJs;
export type ActionFlowWrapperJs = ztype.com.functorz.ztype.typesystem.schema.ActionFlowWrapperJs;
export type ClipboardZAiConfigFormatJs =
  ztype.com.functorz.ztype.application.data.ClipboardZAiConfigFormatJs;
export type ClipboardActionFlowFormatJs =
  ztype.com.functorz.ztype.application.data.ClipboardActionFlowFormatJs;
export type ClipboardTpaConfigFormatJs =
  ztype.com.functorz.ztype.application.data.ClipboardTpaConfigFormatJs;
export const { TypeNamespace } = ztype.com.functorz.ztype.typesystem.schema;
export const { TypeKind } = ztype.com.functorz.ztype.typesystem.schema;

export const { ZTypeValidationUtils } = ztype.com.functorz.ztype.application.validation;
export const { ExtraContext } = ztype.com.functorz.ztype.typesystem.settings;
export const { AIModelDescriptors, ActionFlowTemplateCodeDescriptor } =
  ztype.com.functorz.ztype.typesystem.settings;

export const { ZTypeSystem, ValidationResults } = ztypePackage.typesystem;
// export const { SchemaParser } = ztypePackage.typesystem.schema;

export const { TypeBuilder, OpaqueTypeSerializer, TypeMerger, TypeDescriptor } =
  ztypePackage.typesystem.types;
export const { TypeData } = ztype.com.functorz.ztype.typesystem.types;

export const { DiffPathComponent } = ztypePackage.typesystem.schema.diff;
export const { SchemaDataConverterJs } = ztypePackage.application.data;
export const { CopyPasteData } = ztypePackage.application.data;
export const {
  ZAIAnalyzer,
  ComponentAnalyzer,
  ActionAnalyzer,
  SchemaContentWithPathWrapperJs,
  RequestAnalyzer,
} = ztypePackage.application.analyzer;

export const {
  Product,
  Platform,
  CustomChatModelDescriptor,
  CustomEmbeddingModelDescriptor,
  ModelCustomParamDescriptor,
  CustomModelParam,
  CustomChatCompletionFeatures,
  Identifier,
  ClientType,
  SchemaData,
} = ztype.com.functorz.ztype.typesystem.schema;
export const { Locale, IdUtilsJs } = ztype.com.functorz.ztype.typesystem.utils;
export const {
  DataBindingSelectorBuilderJS,
  DataBindingBuilderJS,
  DataBindingSelectorCategoryOptionJS,
  DataBindingSelectorDataBindingOptionJS,
//   TargetDataBindingInfo,
} = ztype.com.functorz.ztype.application.editor.databinding;
export const {
  TypeSelectorBuilderJS,
  TypeSelectorTypeOption,
  TypeSelectorTypeOptionJs,
  TypeSelectorCategoryOption,
  TypeSelectorTypeWithNextLevelOption,
} = ztype.com.functorz.ztype.application.editor.type;

export const {
  CodeComponentEditorJs,
  SchemaEditorJs,
  TypeDefinitionEditorJs,
  DefaultTable,
  DefaultRelation,
  PaymentActionFlow,
  PaymentCallback,
  PaymentScheduledJob,
  TypeIdentifierUtilsJs,
} = ztype.com.functorz.ztype.application.editor;

export const { ClipboardActionFlowNodesFormat, CopyActionFlowNodesResultFormat } =
  ztype.com.functorz.ztype.typesystem.schema;

export const { Copilot } = ztype.com.functorz.ztype.application.copilot;

export const { KtList, KtMap, KtSet } = ztype.kotlin.collections;

export const { ClonedComponentData } = ztype.com.functorz.ztype.application.data;

export const { Variable } = ztype.com.functorz.ztype.typesystem.schema;

export const { OverviewGraphBuilderJs } = ztype.com.functorz.ztype.application.overview;
