
import { ComponentType, VerticalDirection, LayoutMode, Variable } from 'zed/types/Schema';
import uniqid from 'uniqid';
import { AllStores } from 'zed/mobx/StoreContexts';
import { LayoutMutations } from 'zed/mobx/mutations/LayoutMutations';
import { ComponentRightDrawerConfigTab } from 'zed/mobx/stores/EditorStore';
import BaseContainerModel from 'zed/models/base/BaseContainerModel';
import { DummyComponentFrame } from 'zed/models/base/constants';
import ComponentModel, { Platform } from 'zed/models/interfaces/ComponentModel';
import ZFrame, { ZSize } from 'zed/models/interfaces/Frame';
import {
  Interaction,
  InteractionProperty,
  InteractionType,
} from 'zed/models/interfaces/InteractionProperty';
import { LayoutEditableConfig, ZLayout } from 'zed/models/interfaces/Layout';
import { OverrideProperty } from 'zed/models/interfaces/OverrideProperty';
import { genComponentLayout } from 'zed/utils';
import { getComponentModel } from 'zed/utils/ComponentHelper';
import { makeObservable, observable } from 'mobx';
import { last } from 'lodash-es';

export const DefaultComponentModelLayout = {
  location: VerticalDirection.TOP_DOWN,
  layoutMode: LayoutMode.FIXED,
  minValue: 0,
};

export default abstract class BaseComponentModel implements ComponentModel {
  constructor(
    public parentMRef: string,
    size?: ZSize
  ) {
    if (size) {
      this.componentFrame.size = size;
    }
    makeObservable(this, {
      isFloating: observable,
      relatedMRefs: observable,
      variableTable: observable,
      overridePropertyRecord: observable,
      interactionRecord: observable,
      interactionPropertyRecord: observable,
      variantRecord: observable,
      dataAttributes: observable,
      componentFrame: observable,
      layout: observable,
      componentHidden: observable,
    });
  }

  public readonly applicablePlatforms: Platform[] = [];

  public isFloating = false;

  public readonly mRef: string = uniqid.process();

  public get componentName(): string {
    return this.name.length > 0 ? this.name : this.type;
  }

  public set componentName(name: string) {
    this.name = name;
  }

  public get previewMRef(): string {
    return this.mRef;
  }

  public componentHidden = false;

  public relatedMRefs: string[] = [];

  public variableTable: Record<string, Variable> = {};

  public overridePropertyRecord: Record<string, OverrideProperty> = {};

  public interactionRecord: Partial<Record<InteractionType, Interaction>> = {};

  /**
   * @deprecated 待废弃，等variants数据迁移完
   */
  public interactionPropertyRecord: Record<InteractionType, InteractionProperty> = {
    [InteractionType.HOVER]: {},
    [InteractionType.CLICK]: {},
    [InteractionType.SCROLL_INTO]: {},
    [InteractionType.SCROLLING]: {},
  };

  public variantRecord: Record<string, InteractionProperty> = {
    [InteractionType.HOVER]: {},
  };

  public abstract readonly type: ComponentType;

  public abstract dataAttributes: Record<string, any>;

  public componentFrame: ZFrame = this.getDefaultComponentFrame();

  public get mRefPath(): string[] {
    if (!this.parentMRef) {
      return [this.mRef];
    }
    return [this.mRef, ...(this.parent()?.mRefPath || [])];
  }

  public get rootScreenMRef(): string | null {
    return last(this.mRefPath) ?? null;
  }

  public getDefaultComponentFrame(): ZFrame {
    return DummyComponentFrame;
  }

  public setComponentFrame(frame: ZFrame): void {
    this.componentFrame = frame;
    this.initLayout();
  }

  public layoutEnabled = false;

  public getLayoutEnabled(): boolean {
    return this.layoutEnabled;
  }

  public setLayoutEnabled(layoutEnabled: boolean): void {
    this.layoutEnabled = layoutEnabled;
  }

  public layout?: ZLayout = undefined;

  public setLayout(layout: ZLayout): void {
    this.layout = layout;
  }

  public initLayout(): void {
    if (!this.layout) {
      this.layoutEnabled = true;
      this.layout = this.genInitLayout();
      this.updateLayout();
    }
  }

  public getLayoutEditorConfig(): LayoutEditableConfig {
    return {
      sizeEditable: true,
      sizeFitUnitAvailable: false,
      sizeRelativeUnitAvailable: true,
      sizeFrUnitAvailable: true,
      sizeWidthValueEditable: true,
      sizeMaxWidthEditable: true,
      sizeMinWidthEditable: true,
      sizeHeightValueEditable: true,
      sizeMaxHeightEditable: true,
      sizeMinHeightEditable: true,
      layoutEditable: LayoutMutations.ContainerComponent.includes(this.type),
      layoutWrapEditable: true,
      paddingEditable: LayoutMutations.ContainerComponent.includes(this.type),
      marginEditable: true,
      // TODO (oyc): not available
      sizeWidthRelativeUnitAvailable: false,
      sizeHeightRelativeUnitAvailable: false,
      sizeWidthFitUnitAvailable: false,
      sizeHeightFitUnitAvailable: false,
    };
  }

  public genInitLayout() {
    const layoutEditorConfig = this.getLayoutEditorConfig();
    return genComponentLayout(this.componentFrame, layoutEditorConfig);
  }

  protected updateLayout(): void {
    // to be implemented by child class
  }

  public abstract defaultDataAttributes(): Record<string, any>;

  public parent(): BaseContainerModel {
    return getComponentModel(this.parentMRef) as BaseContainerModel;
  }

  public originalParent(): BaseContainerModel {
    return AllStores.coreStore.mRefMap[this.parentMRef] as BaseContainerModel;
  }

  public name = '';

  public static isComponentModel(input: any): boolean {
    return (
      input &&
      typeof input === 'object' &&
      input.mRef &&
      Object.values(ComponentType).includes(input.type)
    );
  }

  // todo(clh): 优化各组件中的这个方法，拆分各组件定义的默认属性来生成不同tab的使用属性
  // 例如 model.getActionDefaultDataAttributes() 再Object.keys()，就可以得到action tab下所有的属性
  public getTabConfigurePathIds(configTab: ComponentRightDrawerConfigTab): string[] {
    return [];
  }
}
