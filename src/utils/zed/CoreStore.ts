// import { isEmpty, isNil, maxBy, keys } from 'lodash-es';
import { makeAutoObservable } from 'mobx';
// import {
//   MOBILE_PLATFORM_BREAKPOINT_CONFIG,
//   WEB_PLATFORM_BREAKPOINT_CONFIG,
//   WECHAT_PLATFORM_BREAKPOINT_CONFIG,
// } from 'zed/constants';
import { DEFAULT_AUTHENTICATION_CONFIG, DEFAULT_DATA_MODEL } from './ZSchema.ts';
// import { getConfiguration } from 'zed/hooks/useConfiguration';
// import { AllStores } from 'zed/mobx/StoreContexts';
import BaseComponentModel from 'zed/models/base/BaseComponentModel';
import {
  type ApiWorkSpace,
  type AuthenticationConfig,
  type BackendActionFlow,
  type CallbackConfiguration,
  type ClientsSchema,
  type ClientType,
  type ColorTheme,
  type Component,
  type ConfiguredCodeComponentRepo,
  type CustomLLMConfig,
  type CustomTypeDefinition,
  type DataModel,
  type MobileClientConfiguration,
  type PageGroupConfiguration,
  type PaymentConfiguration,
  type PaymentType,
  type Platform,
  type RoleConfig,
  type ScheduledJobConfiguration,
  type ServerEditorConfiguration,
  type ServerSchema,
  type ThirdPartyApiConfig,
  type TriggerConfiguration,
  type TypeConversionDefinition,
  type TypeDefinition,
  type TypeDefinitionGroupConfiguration,
  type WebClientConfiguration,
  type WechatMiniProgramClientConfiguration,
  type ZAiConfig,
} from './index.ts';
import { ZTypeSystem } from './TypeSystem.ts';

export class CoreStore {
  constructor() {
    makeAutoObservable(this);
  }

  private readonly version = ZTypeSystem.getSchemaVersion();

  private clients?: ClientsSchema;

  private server: ServerSchema = {
    dataModel: DEFAULT_DATA_MODEL,
    roleConfigs: [],
    zAiConfigs: [],
    customAiModelConfigs: [],
    thirdPartyApiConfigs: [],
    draftActionFlows: [],
    pendingActionFlows: [],
    callbackConfigurations: [],
    scheduledJobConfigurations: [],
    triggerConfigurations: [],
    types: {},
    authenticationConfig: DEFAULT_AUTHENTICATION_CONFIG,
    paymentConfigRecord: {},
  };

  get schemaVersion(): string {
    return this.version;
  }

  get rootPageIds(): string[] {
    return this.clients?.clientById[this.clientExId]?.rootPageIds ?? [];
  }

  get mRefMap(): Record<string, BaseComponentModel> {
    return (this.clients?.clientById[this.clientExId]?.componentMetaById ??
      {}) as Record<string, BaseComponentModel>;
  }

  get componentById() {
    return this.clients?.clientById[this.clientExId]?.componentById as Record<
      string,
      Component
    >;
  }

  get isComponentRefactor() {
    return keys(this.componentById).length;
  }

  get colorTheme(): Record<string, ColorTheme> {
    return (
      this.clients?.clientById[this.clientExId]?.configuration.colorThemeById ??
      {}
    );
  }

  get scrollBarEnabled(): boolean {
    return (
      (
        this.clients?.clientById[this.clientExId]
          ?.configuration as WebClientConfiguration
      ).showScrollBar ?? false
    );
  }

  get wechatConfiguration(): WechatMiniProgramClientConfiguration {
    const configuration = this.clients?.clientById[this.clientExId]
      ?.configuration as WechatMiniProgramClientConfiguration;
    return (
      configuration ?? {
        appDidLoad: [],
        globalVariableTable: {},
        pageCountInMainPackage: 6,
        pageCountInSubPackage: 12,
        breakpointRecord: WECHAT_PLATFORM_BREAKPOINT_CONFIG,
        pageGroupConfiguration: { groupList: [] },
      }
    );
  }

  get webConfiguration(): WebClientConfiguration {
    const configuration = this.clients?.clientById[this.clientExId]
      ?.configuration as WebClientConfiguration;
    return (
      configuration ?? {
        appDidLoad: [],
        globalVariableTable: {},
        breakpointRecord: WEB_PLATFORM_BREAKPOINT_CONFIG,
        pageGroupConfiguration: { groupList: [] },
      }
    );
  }

  get mobileConfiguration(): MobileClientConfiguration {
    const configuration = this.clients?.clientById[this.clientExId]
      ?.configuration as MobileClientConfiguration;
    return (
      configuration ?? {
        appDidLoad: [],
        globalVariableTable: {},
        breakpointRecord: MOBILE_PLATFORM_BREAKPOINT_CONFIG,
        pageGroupConfiguration: { groupList: [] },
      }
    );
  }

  get codeComponentRepos(): ConfiguredCodeComponentRepo[] {
    return (
      this.clients?.clientById[this.clientExId]?.configuration?.customRepos ??
      []
    );
  }

  get authenticationConfig(): AuthenticationConfig {
    return this.server.authenticationConfig ?? DEFAULT_AUTHENTICATION_CONFIG;
  }

  get dataModel(): DataModel {
    return this.server.dataModel ?? DEFAULT_DATA_MODEL;
  }

  get serverEditorConfiguration(): ServerEditorConfiguration | undefined {
    return this.server.editorConfiguration;
  }

  get roleConfigs(): RoleConfig[] {
    return this.server.roleConfigs ?? [];
  }

  get zAiConfigs(): ZAiConfig[] {
    return this.server.zAiConfigs ?? [];
  }

  get draftActionFlows(): BackendActionFlow[] {
    return this.server.draftActionFlows ?? [];
  }

  get pendingActionFlows(): BackendActionFlow[] {
    return this.server.pendingActionFlows ?? [];
  }

  get thirdPartyApiConfigs(): ThirdPartyApiConfig[] {
    return this.server.thirdPartyApiConfigs ?? [];
  }

  get callbackConfigurations(): CallbackConfiguration[] {
    return this.server.callbackConfigurations ?? [];
  }

  get scheduledJobConfigurations(): ScheduledJobConfiguration[] {
    return this.server.scheduledJobConfigurations ?? [];
  }

  get triggerConfigurations(): TriggerConfiguration[] {
    return this.server.triggerConfigurations ?? [];
  }

  get customAiModelConfigs(): CustomLLMConfig[] {
    return this.server.customAiModelConfigs ?? [];
  }

  get customTypeDefinitions(): Record<string, CustomTypeDefinition> {
    return this.server.types?.deprecatedCustomTypeDefinitions ?? {};
  }

  get typeConversionDefinitions(): TypeConversionDefinition[] {
    return this.server.types?.conversionDefinitions ?? [];
  }

  get typeDefinitionById(): Record<string, TypeDefinition> {
    return this.server.types?.definitionById ?? {};
  }

  get typeDefinitionGroupConfiguration():
    | TypeDefinitionGroupConfiguration
    | undefined {
    return this.server.types?.groupConfiguration;
  }

  get paymentConfigRecord(): { [key in PaymentType]?: PaymentConfiguration } {
    return this.server.paymentConfigRecord ?? {};
  }

  public get actionFlowsInUse() {
    const result: Record<string, BackendActionFlow> = {};
    this.pendingActionFlows.forEach((item) => {
      if (
        !result[item.uniqueId] ||
        (result[item.uniqueId] &&
          result[item.uniqueId].versionId < item.versionId)
      ) {
        result[item.uniqueId] = item;
      }
    });
    return Object.values(result);
  }

  public get maxBreakpointName(): string {
    const { breakpointRecord } = getConfiguration();
    const maxBreakpointName = maxBy(
      Object.entries(breakpointRecord),
      ([breakpointName, breakpoint]) => breakpoint.scaleRange.max
    )?.[0];
    if (!maxBreakpointName) {
      throw new Error('missing maxBreakpoint');
    }
    return maxBreakpointName;
  }

  public get clientExId(): string {
    const { editorStore, projectStore } = AllStores;
    if (!isNil(projectStore.appExId) && !isEmpty(projectStore.appExId)) {
      return projectStore.appExId;
    }
    switch (editorStore.editorPlatform) {
      case Platform.WECHAT:
        return ClientType.WECHAT_MINI_PROGRAM;
      case Platform.WEB:
        return ClientType.WEB;
      case Platform.MOBILE:
        return ClientType.MOBILE;
      default:
        throw new Error(
          `unsupported editorPlatform, ${editorStore.editorPlatform}`
        );
    }
  }

  public get initialPageId(): string | undefined {
    const { editorStore } = AllStores;
    const { initialPageId } =
      editorStore.editorPlatform === Platform.WECHAT
        ? this.wechatConfiguration
        : this.webConfiguration;
    return initialPageId;
  }

  public get pageGroupConfiguration(): PageGroupConfiguration {
    const { editorStore } = AllStores;
    const { pageGroupConfiguration } =
      editorStore.editorPlatform === Platform.WECHAT
        ? this.wechatConfiguration
        : this.webConfiguration;
    return pageGroupConfiguration ?? { groupList: [] };
  }

  public get apiWorkSpaces(): ApiWorkSpace[] {
    return this.server.apiWorkSpaces ?? [];
  }

  public reset(): void {
    AllStores.coreStore = new CoreStore();
  }
}
