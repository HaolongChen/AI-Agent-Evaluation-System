export enum BackendOnlyActionFlowNodeType {
  CUSTOM_CODE = 'CUSTOM_CODE',
  TEMPLATE_CODE = 'TEMPLATE_CODE',
  INSERT_RECORD = 'INSERT_RECORD',
  UPDATE_RECORD = 'UPDATE_RECORD',
  DELETE_RECORD = 'DELETE_RECORD',
  QUERY_RECORD = 'QUERY_RECORD',
  THIRD_PARTY_API = 'THIRD_PARTY_API',
  ACTION_FLOW = 'ACTION_FLOW',
  UPDATE_GLOBAL_VARIABLES = 'UPDATE_GLOBAL_VARIABLES',
  AI_CREATE_CONVERSATION = 'AI_CREATE_CONVERSATION',
  AI_DELETE_CONVERSATION = 'AI_DELETE_CONVERSATION',
  AI_SEND_MESSAGE = 'AI_SEND_MESSAGE',
  AI_STOP_RESPONSE = 'AI_STOP_RESPONSE',
  ADD_ROLE_TO_ACCOUNT = 'ADD_ROLE_TO_ACCOUNT',
  REMOVE_ROLE_FROM_ACCOUNT = 'REMOVE_ROLE_FROM_ACCOUNT',
}
export enum GeneralActionFlowNodeType {
  FLOW_START = 'FLOW_START',
  FLOW_END = 'FLOW_END',
  BRANCH_SEPARATION = 'BRANCH_SEPARATION',
  BRANCH_ITEM = 'BRANCH_ITEM',
  BRANCH_MERGE = 'BRANCH_MERGE',
  FOR_EACH_START = 'FOR_EACH_START',
  FOR_EACH_END = 'FOR_EACH_END',
}
export enum FrontendOnlyActionFlowNodeType {
  CONCURRENT_BRANCH_SEPARATION = 'CONCURRENT_BRANCH_SEPARATION',
  CONCURRENT_BRANCH_MERGE = 'CONCURRENT_BRANCH_MERGE',
  CALL_ACTION = 'CALL_ACTION',
  SUCCESS_FAIL_MERGE = 'SUCCESS_FAIL_MERGE',
}
export interface ChooseLocationEventBinding {
  addressAssociatedPathComponents?: PathComponent[];
  authorizationFailedActions: EventBinding[];
  displayName?: string;
  failedActions?: EventBinding[];
  geoPointAssociatedPathComponents?: PathComponent[];
  id: string;
  nameAssociatedPathComponents?: PathComponent[];
  successActions?: EventBinding[];
  type: EventType.CHOOSE_LOCATION;
}
export interface GetLocationEventBinding {
  authorizationFailedActions: EventBinding[];
  displayName?: string;
  failedActions?: EventBinding[];
  geoPointAssociatedPathComponents?: PathComponent[];
  id: string;
  successActions?: EventBinding[];
  type: EventType.GET_LOCATION;
}
export interface UploadFileEventBinding {
  authorizationFailedActions: EventBinding[];
  displayName?: string;
  failedActions?: EventBinding[];
  fileInfoComponents?: PathComponent[];
  id: string;
  maxFileSize?: FileSize;
  successActions?: EventBinding[];
  type: EventType.UPLOAD_FILE;
}
export interface BlankContainerAttributes {
  backgroundColor: DataBinding;
  backgroundImage?: BackgroundImage;
  backgroundImageFitType: BackgroundImageFitType;
  borderColor: DataBinding;
  borderRadius: DataBinding;
  borderStyle: DataBinding;
  borderWidth: DataBinding;
  boxShadowBlurRadius?: DataBinding;
  boxShadowColor?: DataBinding;
  boxShadowOffsetX?: DataBinding;
  boxShadowOffsetY?: DataBinding;
  boxShadowSpreadRadius?: DataBinding;
  clickActions: EventBinding[];
  individualBorderRadius?: IndividualBorderRadius;
  individualBorderWidth?: IndividualBorderWidth;
}
export interface ButtonAttributes {
  backgroundColor: DataBinding;
  backgroundImage?: BackgroundImage;
  backgroundImageFitType: BackgroundImageFitType;
  borderColor: DataBinding;
  borderRadius: DataBinding;
  borderStyle: DataBinding;
  borderWidth: DataBinding;
  boxShadowBlurRadius: DataBinding;
  boxShadowColor: DataBinding;
  boxShadowOffsetX: DataBinding;
  boxShadowOffsetY: DataBinding;
  boxShadowSpreadRadius: DataBinding;
  clickActions: EventBinding[];
  color: DataBinding;
  cursor: string;
  filterBlur?: DataBinding;
  fontFamily: DataBinding;
  fontSize: DataBinding;
  fontStyle: DataBinding;
  fontWeight: DataBinding;
  individualBorderRadius?: IndividualBorderRadius;
  individualBorderWidth?: IndividualBorderWidth;
  letterSpacing?: DataBinding;
  lineHeight: DataBinding;
  multiLine: DataBinding;
  opacity: DataBinding;
  rowNumberLimit: DataBinding;
  textAlign: DataBinding;
  textDecorationColor: DataBinding;
  textDecorationLine: DataBinding;
  textDecorationStyle: DataBinding;
  textIndent?: DataBinding;
  title: DataBinding;
}
export interface CodeComponentAttributes {
  alt?: string;
  autoResize?: DataBinding;
  backgroundColor: DataBinding;
  backgroundImage?: BackgroundImage;
  backgroundImageFitType: BackgroundImageFitType;
  borderColor: DataBinding;
  borderRadius: DataBinding;
  borderStyle: DataBinding;
  borderWidth: DataBinding;
  boxShadowBlurRadius: DataBinding;
  boxShadowColor: DataBinding;
  boxShadowOffsetX: DataBinding;
  boxShadowOffsetY: DataBinding;
  boxShadowSpreadRadius: DataBinding;
  cursor: string;
  filterBlur?: DataBinding;
  imageCrop: DataBinding;
  imageObject: DataBinding;
  imageSource: DataBinding;
  individualBorderRadius?: IndividualBorderRadius;
  individualBorderWidth?: IndividualBorderWidth;
  opacity?: DataBinding;
}
export interface ConditionalContainerAttributes {
  backgroundColor?: DataBinding;
  backgroundImage?: BackgroundImage;
  backgroundImageFitType?: BackgroundImageFitType;
  borderColor?: DataBinding;
  borderRadius?: DataBinding;
  borderStyle?: DataBinding;
  borderWidth?: DataBinding;
  boxShadowBlurRadius?: DataBinding;
  boxShadowColor?: DataBinding;
  boxShadowOffsetX?: DataBinding;
  boxShadowOffsetY?: DataBinding;
  boxShadowSpreadRadius?: DataBinding;
  individualBorderRadius?: IndividualBorderRadius;
  individualBorderWidth?: IndividualBorderWidth;
  preserveStateOnSwitch?: boolean;
  rerunConditionOnUpdate: boolean;
}
export interface ConditionalContainerChildAttributes {
  backgroundColor?: DataBinding;
  backgroundImage?: BackgroundImage;
  backgroundImageFitType?: BackgroundImageFitType;
  borderColor?: DataBinding;
  borderRadius?: DataBinding;
  borderStyle?: DataBinding;
  borderWidth?: DataBinding;
  boxShadowBlurRadius?: DataBinding;
  boxShadowColor?: DataBinding;
  boxShadowOffsetX?: DataBinding;
  boxShadowOffsetY?: DataBinding;
  boxShadowSpreadRadius?: DataBinding;
  clickActions: EventBinding[];
  individualBorderRadius?: IndividualBorderRadius;
  individualBorderWidth?: IndividualBorderWidth;
}
export interface CountDownAttributes {
  backgroundColor: DataBinding;
  backgroundImage?: BackgroundImage;
  backgroundImageFitType: BackgroundImageFitType;
  borderColor: DataBinding;
  borderRadius: DataBinding;
  borderStyle: DataBinding;
  borderWidth: DataBinding;
  boxShadowBlurRadius: DataBinding;
  boxShadowColor: DataBinding;
  boxShadowOffsetX: DataBinding;
  boxShadowOffsetY: DataBinding;
  boxShadowSpreadRadius: DataBinding;
  color: DataBinding;
  displayUnitOfTime: string;
  eventListeners: EventListener[];
  fontFamily: DataBinding;
  fontSize: DataBinding;
  fontStyle: DataBinding;
  fontWeight: DataBinding;
  individualBorderRadius?: IndividualBorderRadius;
  individualBorderWidth?: IndividualBorderWidth;
  invisible: boolean;
  letterSpacing?: DataBinding;
  lineHeight: DataBinding;
  millisFromStart: DataBinding;
  multiLine: DataBinding;
  onTimeUpActions: EventBinding[];
  opacity: DataBinding;
  prefixTitle: DataBinding;
  rowNumberLimit: DataBinding;
  step: LiteralOrDataBinding;
  suffixTitle: DataBinding;
  textAlign: DataBinding;
  textDecorationColor: DataBinding;
  textDecorationLine: DataBinding;
  textDecorationStyle: DataBinding;
  textIndent?: DataBinding;
}
export interface CustomListAttributes {
  autoGridEnabled?: boolean;
  autoScrollToTopOnRefreshMode?: ListViewAutoScrollToTopOnRefreshMode;
  autoplay: boolean;
  backgroundColor: DataBinding;
  backgroundImage?: BackgroundImage;
  backgroundImageFitType: BackgroundImageFitType;
  borderColor: DataBinding;
  borderRadius: DataBinding;
  borderStyle: DataBinding;
  borderWidth: DataBinding;
  boxShadowBlurRadius: DataBinding;
  boxShadowColor: DataBinding;
  boxShadowOffsetX: DataBinding;
  boxShadowOffsetY: DataBinding;
  boxShadowSpreadRadius: DataBinding;
  cellAutoSizeEnabled?: boolean;
  cellKeyDataField?: DataField;
  circular: boolean;
  columnNum: number;
  direction?: ListDirection;
  horizontalPadding: number;
  indicatorActiveColor?: DataBinding;
  indicatorColor?: DataBinding;
  indicatorDots?: boolean;
  individualBorderRadius?: IndividualBorderRadius;
  individualBorderWidth?: IndividualBorderWidth;
  loadMoreEnabled: boolean;
  masonryEnabled?: boolean;
  onScrollActions: EventBinding[];
  pagingEnabled: boolean;
  preserveCellState?: boolean;
  pullDownRefreshEnabled: boolean;
  reversed: boolean;
  rowNum?: number;
  showScrollBar?: boolean;
  verticalPadding: number;
}
export interface CustomMultiImagePickerAttributes {
  addContainerMRef: string;
  backgroundColor: DataBinding;
  backgroundImage?: BackgroundImage;
  backgroundImageFitType: BackgroundImageFitType;
  borderColor: DataBinding;
  borderRadius: DataBinding;
  borderStyle: DataBinding;
  borderWidth: DataBinding;
  boxShadowBlurRadius: DataBinding;
  boxShadowColor: DataBinding;
  boxShadowOffsetX: DataBinding;
  boxShadowOffsetY: DataBinding;
  boxShadowSpreadRadius: DataBinding;
  defaultImageList: DataBinding;
  imageContainerMRef: string;
  individualBorderRadius?: IndividualBorderRadius;
  individualBorderWidth?: IndividualBorderWidth;
  isShowMultiLine: boolean;
  maxFileSize?: FileSize;
  maxImageCount: number;
  uploadLoadingEnabled: boolean;
  uploadSizeType?: UploadSizeType;
}
export interface CustomViewAttributes {
  backgroundColor: DataBinding;
  backgroundImage?: BackgroundImage;
  backgroundImageFitType: BackgroundImageFitType;
  borderColor: DataBinding;
  borderRadius: DataBinding;
  borderStyle: DataBinding;
  borderWidth: DataBinding;
  boxShadowBlurRadius: DataBinding;
  boxShadowColor: DataBinding;
  boxShadowOffsetX: DataBinding;
  boxShadowOffsetY: DataBinding;
  boxShadowSpreadRadius: DataBinding;
  clickActions: EventBinding[];
  cursor: string;
  filterBlur?: DataBinding;
  foldingHeight: number;
  foldingMode: FoldingMode;
  hasScrollX: boolean;
  hasScrollY: boolean;
  individualBorderRadius?: IndividualBorderRadius;
  individualBorderWidth?: IndividualBorderWidth;
  isFullBleed: boolean;
  opacity?: DataBinding;
  showScrollBar?: boolean;
}
export interface DataPickerAttributes {
  backgroundColor: DataBinding;
  backgroundImage?: BackgroundImage;
  backgroundImageFitType: BackgroundImageFitType;
  borderColor: DataBinding;
  borderRadius: DataBinding;
  borderStyle: DataBinding;
  borderWidth: DataBinding;
  boxShadowBlurRadius: DataBinding;
  boxShadowColor: DataBinding;
  boxShadowOffsetX: DataBinding;
  boxShadowOffsetY: DataBinding;
  boxShadowSpreadRadius: DataBinding;
  clearable: boolean;
  defaultValue: DataBinding;
  displayDataField?: DataField;
  individualBorderRadius?: IndividualBorderRadius;
  individualBorderWidth?: IndividualBorderWidth;
  labelColor: DataBinding;
  mode: string;
  onChangeActions: EventBinding[];
  placeHolder: DataBinding;
  textAlign: DataBinding;
  textColor: DataBinding;
  title: DataBinding;
  titleFontFamily: DataBinding;
  titleFontSize: DataBinding;
  titleFontStyle: DataBinding;
  titleFontWeight: DataBinding;
  valueFontFamily: DataBinding;
  valueFontSize: DataBinding;
  valueFontStyle: DataBinding;
  valueFontWeight: DataBinding;
  valueType: string;
}
export interface DataSelectorAttributes {
  backgroundColor: DataBinding;
  backgroundImage?: BackgroundImage;
  backgroundImageFitType: BackgroundImageFitType;
  borderColor: DataBinding;
  borderRadius: DataBinding;
  borderStyle: DataBinding;
  borderWidth: DataBinding;
  boxShadowBlurRadius: DataBinding;
  boxShadowColor: DataBinding;
  boxShadowOffsetX: DataBinding;
  boxShadowOffsetY: DataBinding;
  boxShadowSpreadRadius: DataBinding;
  clearable: boolean;
  color: DataBinding;
  defaultValue: DataBinding;
  displayDataField?: DataField;
  fontFamily: DataBinding;
  fontSize: DataBinding;
  fontStyle: DataBinding;
  fontWeight: DataBinding;
  individualBorderRadius?: IndividualBorderRadius;
  individualBorderWidth?: IndividualBorderWidth;
  onChangeActions: EventBinding[];
  placeHolder: DataBinding;
  textAlign: DataBinding;
}
export interface DateTimePickerAttributes {
  backgroundColor: DataBinding;
  backgroundImage?: BackgroundImage;
  backgroundImageFitType: BackgroundImageFitType;
  borderColor: DataBinding;
  borderRadius: DataBinding;
  borderStyle: DataBinding;
  borderWidth: DataBinding;
  boxShadowBlurRadius: DataBinding;
  boxShadowColor: DataBinding;
  boxShadowOffsetX: DataBinding;
  boxShadowOffsetY: DataBinding;
  boxShadowSpreadRadius: DataBinding;
  color: DataBinding;
  defaultValue: DataBinding;
  end: DataBinding;
  fontFamily: DataBinding;
  fontSize: DataBinding;
  fontStyle: DataBinding;
  fontWeight: DataBinding;
  individualBorderRadius?: IndividualBorderRadius;
  individualBorderWidth?: IndividualBorderWidth;
  mode: string;
  onChangeActions: EventBinding[];
  placeHolder: DataBinding;
  start: DataBinding;
  textAlign: DataBinding;
  timeInterval: DataBinding;
  valueType: string;
}
export interface FilePickerAttributes {
  borderColor: DataBinding;
  borderRadius: DataBinding;
  borderStyle: DataBinding;
  borderWidth: DataBinding;
  individualBorderRadius?: IndividualBorderRadius;
  individualBorderWidth?: IndividualBorderWidth;
}
export interface HorizontalLineAttributes {
  backgroundColor: DataBinding;
  borderRadius: DataBinding;
  dashLength?: DataBinding;
  individualBorderRadius?: IndividualBorderRadius;
  lineDirection?: HorizontalLineDirection;
  lineGap?: DataBinding;
  lineType?: HorizontalLineType;
}
export interface ImageAttributes {
  alt?: string;
  autoResize?: DataBinding;
  backgroundColor: DataBinding;
  backgroundImage?: BackgroundImage;
  backgroundImageFitType: BackgroundImageFitType;
  borderColor: DataBinding;
  borderRadius: DataBinding;
  borderStyle: DataBinding;
  borderWidth: DataBinding;
  boxShadowBlurRadius: DataBinding;
  boxShadowColor: DataBinding;
  boxShadowOffsetX: DataBinding;
  boxShadowOffsetY: DataBinding;
  boxShadowSpreadRadius: DataBinding;
  clickActions: EventBinding[];
  cursor: string;
  filterBlur?: DataBinding;
  imageCrop: DataBinding;
  imageObject: DataBinding;
  imageSource: DataBinding;
  individualBorderRadius?: IndividualBorderRadius;
  individualBorderWidth?: IndividualBorderWidth;
  opacity?: DataBinding;
}
export interface ImagePickerAttributes {
  backgroundColor: DataBinding;
  backgroundImage?: BackgroundImage;
  backgroundImageFitType: BackgroundImageFitType;
  borderColor: DataBinding;
  borderRadius: DataBinding;
  borderStyle: DataBinding;
  borderWidth: DataBinding;
  boxShadowBlurRadius: DataBinding;
  boxShadowColor: DataBinding;
  boxShadowOffsetX: DataBinding;
  boxShadowOffsetY: DataBinding;
  boxShadowSpreadRadius: DataBinding;
  disablePreview?: boolean;
  imageObject: DataBinding;
  imageSource: DataBinding;
  individualBorderRadius?: IndividualBorderRadius;
  individualBorderWidth?: IndividualBorderWidth;
  maxFileSize?: FileSize;
  onSuccessActions: EventBinding[];
  original?: boolean;
  uploadLoadingEnabled: boolean;
  uploadSizeType?: UploadSizeType;
}
export interface InputAttributes {
  backgroundColor: DataBinding;
  backgroundImage?: BackgroundImage;
  backgroundImageFitType: BackgroundImageFitType;
  borderColor: DataBinding;
  borderRadius: DataBinding;
  borderStyle: DataBinding;
  borderWidth: DataBinding;
  boxShadowBlurRadius: DataBinding;
  boxShadowColor: DataBinding;
  boxShadowOffsetX: DataBinding;
  boxShadowOffsetY: DataBinding;
  boxShadowSpreadRadius: DataBinding;
  color: DataBinding;
  cursorSpacing: DataBinding;
  defaultValue: DataBinding;
  focus: boolean;
  fontFamily?: DataBinding;
  fontSize: DataBinding;
  fontStyle?: DataBinding;
  fontWeight?: DataBinding;
  individualBorderRadius?: IndividualBorderRadius;
  individualBorderWidth?: IndividualBorderWidth;
  valueType: InputValueType;
  multiLine: DataBinding;
  onBlurActions: EventBinding[];
  onChangeActions: EventBinding[];
  onChangeDebounceDuration: DataBinding;
  password: boolean;
  placeholder: DataBinding;
  placeholderColor: DataBinding;
  textAlign: DataBinding;
}
export interface MapViewAttributes {
  backgroundColor: DataBinding;
  backgroundImage?: BackgroundImage;
  backgroundImageFitType: BackgroundImageFitType;
  borderColor: DataBinding;
  borderRadius: DataBinding;
  borderStyle: DataBinding;
  borderWidth: DataBinding;
  boxShadowBlurRadius: DataBinding;
  boxShadowColor: DataBinding;
  boxShadowOffsetX: DataBinding;
  boxShadowOffsetY: DataBinding;
  boxShadowSpreadRadius: DataBinding;
  centerPoint: DataBinding;
  clickActions: EventBinding[];
  dataSource: DataBinding;
  geoPoint: DataBinding;
  individualBorderRadius?: IndividualBorderRadius;
  individualBorderWidth?: IndividualBorderWidth;
  markerIcon: MarkerIconAttributes;
  markerMRef: string;
  markerTitle: DataBinding;
  multipleMarkers: boolean;
  showLocation: boolean;
  showPointOfInformation: boolean;
  zoom?: number;
}
export interface MixImagePickerAttributes {
  backgroundColor: DataBinding;
  borderColor: DataBinding;
  borderRadius: DataBinding;
  borderStyle: DataBinding;
  borderWidth: DataBinding;
  boxShadowBlurRadius: DataBinding;
  boxShadowColor: DataBinding;
  boxShadowOffsetX: DataBinding;
  boxShadowOffsetY: DataBinding;
  boxShadowSpreadRadius: DataBinding;
  columnNumber: number;
  defaultValue: DataBinding;
  imagePadding: number;
  individualBorderRadius?: IndividualBorderRadius;
  individualBorderWidth?: IndividualBorderWidth;
  maxFileSize?: FileSize;
  maxImageCount: number;
  onSuccessActions: EventBinding[];
  original: boolean;
  placeholderImageObject: DataBinding;
  placeholderImageSource: DataBinding;
  previewEnabled: boolean;
  uploadLoadingEnabled: boolean;
  uploadSizeType?: UploadSizeType;
}
export interface ModalViewAttributes {
  backgroundColor: DataBinding;
  backgroundImage?: BackgroundImage;
  backgroundImageFitType: BackgroundImageFitType;
  borderColor: DataBinding;
  borderRadius: DataBinding;
  borderStyle: DataBinding;
  borderWidth: DataBinding;
  boxShadowBlurRadius: DataBinding;
  boxShadowColor: DataBinding;
  boxShadowOffsetX: DataBinding;
  boxShadowOffsetY: DataBinding;
  boxShadowSpreadRadius: DataBinding;
  clickActions: EventBinding[];
  closeOnClickOverlay: boolean;
  cursor: string;
  filterBlur?: DataBinding;
  foldingHeight: number;
  foldingMode: FoldingMode;
  hasScrollX: boolean;
  hasScrollY: boolean;
  individualBorderRadius?: IndividualBorderRadius;
  individualBorderWidth?: IndividualBorderWidth;
  isFullBleed: boolean;
  opacity?: DataBinding;
}
export interface MultiImageAttributes {
  backgroundColor: DataBinding;
  backgroundImage?: BackgroundImage;
  backgroundImageFitType: BackgroundImageFitType;
  borderColor: DataBinding;
  borderRadius: DataBinding;
  borderStyle: DataBinding;
  borderWidth: DataBinding;
  boxShadowBlurRadius: DataBinding;
  boxShadowColor: DataBinding;
  boxShadowOffsetX: DataBinding;
  boxShadowOffsetY: DataBinding;
  boxShadowSpreadRadius: DataBinding;
  horizontalPadding: number;
  imageList: DataBinding;
  individualBorderRadius?: IndividualBorderRadius;
  individualBorderWidth?: IndividualBorderWidth;
  itemBackgroundColor: DataBinding;
  itemBorderRadius: number;
  itemClickActions: EventBinding[];
  maxImageCount: number;
  previewImageCount: number;
  verticalPadding: number;
}
export interface MultiImagePickerAttributes {
  backgroundColor: DataBinding;
  backgroundImage?: BackgroundImage;
  backgroundImageFitType: BackgroundImageFitType;
  borderColor: DataBinding;
  borderRadius: DataBinding;
  borderStyle: DataBinding;
  borderWidth: DataBinding;
  boxShadowBlurRadius: DataBinding;
  boxShadowColor: DataBinding;
  boxShadowOffsetX: DataBinding;
  boxShadowOffsetY: DataBinding;
  boxShadowSpreadRadius: DataBinding;
  defaultImageList: DataBinding;
  individualBorderRadius?: IndividualBorderRadius;
  individualBorderWidth?: IndividualBorderWidth;
  itemClickActions: EventBinding[];
  maxFileSize?: FileSize;
  maxImageCount: number;
  previewImageCount: number;
  uploadLoadingEnabled: boolean;
  uploadSizeType?: UploadSizeType;
}
export interface NumberInputAttributes {
  backgroundColor: DataBinding;
  backgroundImage?: BackgroundImage;
  backgroundImageFitType: BackgroundImageFitType;
  borderColor: DataBinding;
  borderRadius: DataBinding;
  borderStyle: DataBinding;
  borderWidth: DataBinding;
  boxShadowBlurRadius: DataBinding;
  boxShadowColor: DataBinding;
  boxShadowOffsetX: DataBinding;
  boxShadowOffsetY: DataBinding;
  boxShadowSpreadRadius: DataBinding;
  color: DataBinding;
  disabled: DataBinding;
  individualBorderRadius?: IndividualBorderRadius;
  individualBorderWidth?: IndividualBorderWidth;
  inputDefaultValue: DataBinding;
  inputDisabled: DataBinding;
  max: DataBinding;
  min: DataBinding;
  step: LiteralOrDataBinding;
}
export interface OverrideAttributes {
  addContainerMRef?: string;
  advertId?: string;
  alt?: string;
  autoGridEnabled?: boolean;
  autoResize?: DataBinding;
  autoScaleChildComponentSizeByScreenWidthForLegacyProject?: boolean;
  autoScrollToTopOnRefreshMode?: ListViewAutoScrollToTopOnRefreshMode;
  autoplay?: boolean;
  backgroundColor?: DataBinding;
  backgroundImage?: BackgroundImage;
  backgroundImageFitType?: BackgroundImageFitType;
  barColor?: DataBinding;
  borderColor?: DataBinding;
  borderRadius?: DataBinding;
  borderStyle?: DataBinding;
  borderWidth?: DataBinding;
  boxShadowBlurRadius?: DataBinding;
  boxShadowColor?: DataBinding;
  boxShadowOffsetX?: DataBinding;
  boxShadowOffsetY?: DataBinding;
  boxShadowSpreadRadius?: DataBinding;
  canonicalUrl?: DataBinding;
  cellAutoSizeEnabled?: boolean;
  cellKeyDataField?: DataField;
  centerPoint?: DataBinding;
  circular?: boolean;
  clearable?: boolean;
  clickActions?: EventBinding[];
  closeOnClickOverlay?: boolean;
  color?: DataBinding;
  columnConfigs?: SheetColumnConfigEntry[];
  columnNum?: number;
  columnNumber?: number;
  completeActions?: EventBinding[];
  containerColor?: DataBinding;
  controls?: boolean;
  cursor?: string;
  cursorSpacing?: DataBinding;
  dashLength?: DataBinding;
  dataSource?: DataBinding;
  defaultColor?: DataBinding;
  defaultFontSize?: DataBinding;
  defaultImageList?: DataBinding;
  defaultProgress?: DataBinding;
  defaultValue?: DataBinding;
  deselectable?: boolean;
  deselectedColor?: DataBinding;
  devicePosition?: string;
  direction?: ListDirection;
  disablePreview?: boolean;
  disabled?: DataBinding;
  displayDataField?: DataField;
  displayToday?: boolean;
  displayUnitOfTime?: string;
  dividerColor?: DataBinding;
  dividerWeight?: DataBinding;
  end?: DataBinding;
  eventListeners?: EventListener[];
  exId?: string;
  filterBlur?: DataBinding;
  flash?: string;
  focus?: boolean;
  foldingHeight?: number;
  foldingMode?: FoldingMode;
  fontFamily?: DataBinding;
  fontSize?: DataBinding;
  fontStyle?: DataBinding;
  fontWeight?: DataBinding;
  footerHeight?: number;
  format?: string;
  frameSize?: string;
  geoPoint?: DataBinding;
  hasScrollX?: boolean;
  hasScrollY?: boolean;
  headerBackgroundColor?: DataBinding;
  headerConfiguration?: RichTextEditorHeaderConfiguration;
  headerFontSize?: DataBinding;
  headerTextColor?: DataBinding;
  horizontalPadding?: number;
  htmlTitle?: DataBinding;
  icon?: string;
  imageContainerMRef?: string;
  imageCrop?: DataBinding;
  imageList?: DataBinding;
  imageObject?: DataBinding;
  imagePadding?: number;
  imageSource?: DataBinding;
  indicatorActiveColor?: DataBinding;
  indicatorColor?: DataBinding;
  indicatorDots?: boolean;
  individualBorderRadius?: IndividualBorderRadius;
  individualBorderWidth?: IndividualBorderWidth;
  inputDefaultValue?: DataBinding;
  inputDisabled?: DataBinding;
  inputValueType?: InputValueType;
  invisible?: boolean;
  isDarkMode?: boolean;
  isFullBleed?: boolean;
  isMinPreview?: boolean;
  isShowMultiLine?: boolean;
  itemBackgroundColor?: DataBinding;
  itemBorderRadius?: number;
  itemClickActions?: EventBinding[];
  keepChoiceOnRefresh?: boolean;
  labelColor?: DataBinding;
  letterSpacing?: DataBinding;
  lineDirection?: HorizontalLineDirection;
  lineGap?: DataBinding;
  lineHeight?: DataBinding;
  lineType?: HorizontalLineType;
  listMRef?: string;
  loadMoreEnabled?: boolean;
  localData?: SelectViewItem[];
  loop?: boolean;
  markedDates?: DataBinding;
  markerColor?: DataBinding;
  markerIcon?: MarkerIconAttributes;
  markerMRef?: string;
  markerTitle?: DataBinding;
  masonryEnabled?: boolean;
  max?: DataBinding;
  maxFileSize?: FileSize;
  maxImageCount?: number;
  maxItemWidth?: DataBinding;
  millisFromStart?: DataBinding;
  min?: DataBinding;
  mode?: string;
  multiLine?: DataBinding;
  multiple?: boolean;
  multipleMarkers?: boolean;
  normalMRef?: string;
  normalTabMRef?: string;
  objectFit?: string;
  onBeginPlay?: EventBinding[];
  onBlurActions?: EventBinding[];
  onChangeActions?: EventBinding[];
  onChangeDebounceDuration?: DataBinding;
  onDateClicked?: EventBinding[];
  onItemClick?: EventBinding[];
  onProgressChangeActions?: EventBinding[];
  onScrollActions?: EventBinding[];
  onSuccessActions?: EventBinding[];
  onTimeUpActions?: EventBinding[];
  opacity?: DataBinding;
  original?: boolean;
  pageDealloc?: EventBinding[];
  pageDidLoad?: EventBinding[];
  pageSize?: DataBinding;
  pagingEnabled?: boolean;
  password?: boolean;
  placeHolder?: DataBinding;
  placeholder?: DataBinding;
  placeholderColor?: DataBinding;
  placeholderImageObject?: DataBinding;
  placeholderImageSource?: DataBinding;
  prefixTitle?: DataBinding;
  preserveCellState?: boolean;
  preserveStateOnSwitch?: boolean;
  previewEnabled?: boolean;
  previewImageCount?: number;
  progress?: DataBinding;
  pullDownRefreshEnabled?: boolean;
  rerunConditionOnUpdate?: boolean;
  resolution?: string;
  reversed?: boolean;
  rowHeight?: DataBinding;
  rowNum?: number;
  rowNumberLimit?: DataBinding;
  scale?: DataBinding;
  scheduledJobs?: ScheduledJob[];
  selected?: DataBinding;
  selectedColor?: DataBinding;
  selectedDate?: DataBinding;
  selectedIndex?: DataBinding;
  selectedMRef?: string;
  selectedTabMRef?: string;
  seoDescription?: DataBinding;
  seoKeywords?: DataBinding;
  seoThumbnail?: ImageData;
  seoTitle?: DataBinding;
  seoValueOptionsByPathData?: Record<string, SeoPathDataValueOptions>;
  shareInfo?: ShareInfo;
  shareTimelineInfo?: ShareInfo;
  showHorizontalIndicator?: boolean;
  showLocation?: boolean;
  showMuteBtn?: boolean;
  showPointOfInformation?: boolean;
  showVerticalIndicator?: boolean;
  size?: DataBinding;
  socialMediaSeoConfigs?: SocialMediaSeoConfigGroup;
  sortable?: DataBinding;
  sourceType?: SelectViewSourceType;
  start?: DataBinding;
  step?: LiteralOrDataBinding;
  styleType?: SwitchStyleType;
  suffixTitle?: DataBinding;
  tabHeight?: number;
  tabList?: TabListItem[];
  textAlign?: DataBinding;
  textColor?: DataBinding;
  textDecorationColor?: DataBinding;
  textDecorationLine?: DataBinding;
  textDecorationStyle?: DataBinding;
  textIndent?: DataBinding;
  themeColor?: DataBinding;
  timeInterval?: DataBinding;
  title?: DataBinding;
  titleFontFamily?: DataBinding;
  titleFontSize?: DataBinding;
  titleFontStyle?: DataBinding;
  titleFontWeight?: DataBinding;
  totalProgress?: LiteralOrDataBinding;
  treatEmptyAsAll?: boolean;
  uploadLoadingEnabled?: boolean;
  uploadSizeType?: UploadSizeType;
  useBrowserDefaultVideoTag?: boolean;
  value?: DataBinding;
  valueFontFamily?: DataBinding;
  valueFontSize?: DataBinding;
  valueFontStyle?: DataBinding;
  valueFontWeight?: DataBinding;
  valueType?: string;
  verticalPadding?: number;
  videoObject?: DataBinding;
  videoSource?: VideoSource;
  zoom?: number;
}
export interface RichTextEditorAttributes {
  backgroundColor: DataBinding;
  backgroundImage?: BackgroundImage;
  backgroundImageFitType: BackgroundImageFitType;
  borderColor: DataBinding;
  borderRadius: DataBinding;
  borderStyle: DataBinding;
  borderWidth: DataBinding;
  boxShadowBlurRadius: DataBinding;
  boxShadowColor: DataBinding;
  boxShadowOffsetX: DataBinding;
  boxShadowOffsetY: DataBinding;
  boxShadowSpreadRadius: DataBinding;
  defaultColor: DataBinding;
  defaultFontSize?: DataBinding;
  headerConfiguration?: RichTextEditorHeaderConfiguration;
  individualBorderRadius?: IndividualBorderRadius;
  individualBorderWidth?: IndividualBorderWidth;
  value: DataBinding;
}
export interface ScrollViewAttributes {
  backgroundColor: DataBinding;
  backgroundImage?: BackgroundImage;
  backgroundImageFitType: BackgroundImageFitType;
  borderColor: DataBinding;
  borderRadius: DataBinding;
  borderStyle: DataBinding;
  borderWidth: DataBinding;
  boxShadowBlurRadius: DataBinding;
  boxShadowColor: DataBinding;
  boxShadowOffsetX: DataBinding;
  boxShadowOffsetY: DataBinding;
  boxShadowSpreadRadius: DataBinding;
  hasScrollX: boolean;
  hasScrollY: boolean;
  individualBorderRadius?: IndividualBorderRadius;
  individualBorderWidth?: IndividualBorderWidth;
  showHorizontalIndicator: boolean;
  showVerticalIndicator: boolean;
}
export interface SelectViewAttributes {
  backgroundColor: DataBinding;
  backgroundImage?: BackgroundImage;
  backgroundImageFitType: BackgroundImageFitType;
  borderColor: DataBinding;
  borderRadius: DataBinding;
  borderStyle: DataBinding;
  borderWidth: DataBinding;
  boxShadowBlurRadius: DataBinding;
  boxShadowColor: DataBinding;
  boxShadowOffsetX: DataBinding;
  boxShadowOffsetY: DataBinding;
  boxShadowSpreadRadius: DataBinding;
  cellKeyDataField?: DataField;
  defaultValue: DataBinding;
  deselectable: boolean;
  displayDataField?: DataField;
  individualBorderRadius?: IndividualBorderRadius;
  individualBorderWidth?: IndividualBorderWidth;
  isShowMultiLine: boolean;
  itemClickActions: EventBinding[];
  keepChoiceOnRefresh?: boolean;
  localData: SelectViewItem[];
  multiple: boolean;
  normalMRef: string;
  preserveCellState?: boolean;
  selectedMRef: string;
  sourceType: SelectViewSourceType;
  treatEmptyAsAll: boolean;
}
export interface SheetAttributes {
  backgroundColor: DataBinding;
  borderColor: DataBinding;
  borderRadius: DataBinding;
  borderStyle: DataBinding;
  borderWidth: DataBinding;
  boxShadowBlurRadius: DataBinding;
  boxShadowColor: DataBinding;
  boxShadowOffsetX: DataBinding;
  boxShadowOffsetY: DataBinding;
  boxShadowSpreadRadius: DataBinding;
  columnConfigs: SheetColumnConfigEntry[];
  dividerColor: DataBinding;
  dividerWeight: DataBinding;
  fontSize: DataBinding;
  headerBackgroundColor: DataBinding;
  headerFontSize: DataBinding;
  headerTextColor: DataBinding;
  individualBorderRadius?: IndividualBorderRadius;
  individualBorderWidth?: IndividualBorderWidth;
  opacity: DataBinding;
  pageSize: DataBinding;
  rowHeight: DataBinding;
  sortable: DataBinding;
  textColor: DataBinding;
}
export interface VideoAttributes {
  autoplay: boolean;
  backgroundColor: DataBinding;
  backgroundImage?: BackgroundImage;
  backgroundImageFitType: BackgroundImageFitType;
  borderColor: DataBinding;
  borderRadius: DataBinding;
  borderStyle: DataBinding;
  borderWidth: DataBinding;
  boxShadowBlurRadius: DataBinding;
  boxShadowColor: DataBinding;
  boxShadowOffsetX: DataBinding;
  boxShadowOffsetY: DataBinding;
  boxShadowSpreadRadius: DataBinding;
  controls: boolean;
  filterBlur?: DataBinding;
  individualBorderRadius?: IndividualBorderRadius;
  individualBorderWidth?: IndividualBorderWidth;
  loop: boolean;
  objectFit: string;
  onBeginPlay: EventBinding[];
  opacity?: DataBinding;
  showMuteBtn: boolean;
  useBrowserDefaultVideoTag?: boolean;
  videoObject: DataBinding;
  videoSource: VideoSource;
}
export interface VideoPickerAttributes {
  backgroundColor: DataBinding;
  backgroundImage?: BackgroundImage;
  backgroundImageFitType: BackgroundImageFitType;
  borderColor: DataBinding;
  borderRadius: DataBinding;
  borderStyle: DataBinding;
  borderWidth: DataBinding;
  boxShadowBlurRadius: DataBinding;
  boxShadowColor: DataBinding;
  boxShadowOffsetX: DataBinding;
  boxShadowOffsetY: DataBinding;
  boxShadowSpreadRadius: DataBinding;
  disablePreview?: boolean;
  individualBorderRadius?: IndividualBorderRadius;
  individualBorderWidth?: IndividualBorderWidth;
  maxFileSize?: FileSize;
  onSuccessActions: EventBinding[];
  uploadLoadingEnabled: boolean;
  uploadSizeType?: UploadSizeType;
  videoObject: DataBinding;
  videoSource: VideoSource;
}
export interface CalendarAttributes {
  backgroundColor: DataBinding;
  backgroundImage?: BackgroundImage;
  backgroundImageFitType: BackgroundImageFitType;
  borderColor: DataBinding;
  borderStyle: DataBinding;
  borderWidth: DataBinding;
  boxShadowBlurRadius: DataBinding;
  boxShadowColor: DataBinding;
  boxShadowOffsetX: DataBinding;
  boxShadowOffsetY: DataBinding;
  boxShadowSpreadRadius: DataBinding;
  displayToday: boolean;
  individualBorderWidth?: IndividualBorderWidth;
  isDarkMode: boolean;
  markedDates: DataBinding;
  markerColor: DataBinding;
  onDateClicked: EventBinding[];
  selectedDate: DataBinding;
}
export interface CallActionsOnFail {
  andThenNodeIdOnFail: string;
  terminateWhenFail: boolean;
}
export interface TerminateWhenFail {
  terminateWhenFail: boolean;
}
export enum DefaultColorType {
  DEFAULT = 'default',
}
export enum GradientColorType {
  LINEAR = 'linear-gradient',
}
export interface GeneralConfigState {
  enabled: boolean;
  expirationDuration?: number;
}
export interface OAuth2Config {
  enabled: boolean;
  expirationDuration?: number;
  id: string;
  protocol: SsoProtocol;
  provider: OAuth2ProviderConfig;
  providerName: string;
  registration: OAuth2RegistrationConfig;
  type: SsoType;
}
export interface WechatConfigState {
  appId?: string;
  appSecret?: string;
  enabled: boolean;
  expirationDuration?: number;
}
export interface WxworkAuthConfigState {
  corpId?: string;
  enabled: boolean;
  encodingAesKey?: string;
  expirationDuration?: number;
  providerSecret?: string;
  suiteId?: string;
  suiteSecret?: string;
  token?: string;
}
export interface TextAttributes {
  backgroundColor: DataBinding;
  clickActions: EventBinding[];
  color: DataBinding;
  cursor: string;
  displayMode?: TextDisplayMode;
  filterBlur?: DataBinding;
  fontFamily: DataBinding;
  fontSize: DataBinding;
  fontStyle: DataBinding;
  fontWeight: DataBinding;
  headerTag?: HeaderTag;
  letterSpacing?: DataBinding;
  lineHeight: DataBinding;
  multiLine: DataBinding;
  opacity: DataBinding;
  rowNumberLimit: DataBinding;
  textAlign: DataBinding;
  textDecorationColor: DataBinding;
  textDecorationLine: DataBinding;
  textDecorationStyle: DataBinding;
  textIndent?: DataBinding;
  title: DataBinding;
}
export interface AnimationCommonEmphasis {
  delay: number;
  displayName?: string;
  effect: string;
  id: string;
  loop: boolean;
  repeat: number;
  startPoint?: number;
  type: EventType;
}
export interface AnimationFlipEmphasis {
  axis: string;
  delay: number;
  displayName?: string;
  effect: string;
  id: string;
  loop: boolean;
  repeat: number;
  startPoint?: number;
  type: EventType;
}
export interface CommonEmphasis {
  delay: number;
  effect: string;
  loop: boolean;
  repeat: number;
  startPoint?: number;
}
export interface FlipEmphasis {
  axis: string;
  delay: number;
  effect: string;
  loop: boolean;
  repeat: number;
  startPoint?: number;
}
export interface AnimationFadeEffect {
  delay: number;
  displayName?: string;
  effect: string;
  effectType: string;
  id: string;
  startPoint?: number;
  type: EventType;
}
export interface AnimationScaleEffect {
  delay: number;
  displayName?: string;
  effect: string;
  id: string;
  scale: number;
  startPoint?: number;
  type: EventType;
}
export interface AnimationSlideEffect {
  delay: number;
  direction: string;
  displayName?: string;
  distance: number;
  effect: string;
  effectType: string;
  id: string;
  startPoint?: number;
  type: EventType;
}
export interface AnimationVariantInteraction {
  delay: number;
  displayName?: string;
  effect: string;
  id: string;
  startPoint?: number;
  type: EventType;
}
export interface FadeEffect {
  delay: number;
  effect: string;
  effectType: string;
  startPoint?: number;
}
export interface ScaleEffect {
  delay: number;
  effect: string;
  scale: number;
  startPoint?: number;
}
export interface SlideEffect {
  delay: number;
  direction: string;
  distance: number;
  effect: string;
  effectType: string;
  startPoint?: number;
}
export interface VariantInteraction {
  delay: number;
  effect: string;
  startPoint?: number;
}
export interface AdvertBannerAttributes {
  advertId: string;
}
export interface CameraViewAttributes {
  devicePosition: string;
  flash: string;
  frameSize: string;
  resolution: string;
}
export interface HorizontalListAttributes {
  autoplay: boolean;
  backgroundColor: DataBinding;
  cellKeyDataField?: DataField;
  circular: boolean;
  horizontalPadding: number;
  indicatorActiveColor: DataBinding;
  indicatorColor: DataBinding;
  indicatorDots: boolean;
  pagingEnabled: boolean;
  preserveCellState?: boolean;
  showScrollBar?: boolean;
}
export interface IconAttributes {
  backgroundColor: DataBinding;
  clickActions: EventBinding[];
  color: DataBinding;
  fontSize: DataBinding;
  icon: string;
}
export interface LottieAttributes {
  autoplay: boolean;
  completeActions: EventBinding[];
  exId: string;
  loop: boolean;
}
export interface PagingToolbarAttributes {
  isMinPreview: boolean;
  listMRef?: string;
  maxItemWidth: DataBinding;
  onItemClick: EventBinding[];
  themeColor: DataBinding;
}
export interface RichTextAttributes {
  defaultColor?: DataBinding;
  defaultFontSize?: DataBinding;
  filterBlur?: DataBinding;
  opacity?: DataBinding;
  value: DataBinding;
}
export interface FullScreenCurrentImageEventBinding {
  displayName?: string;
  id: string;
  mode?: FullScreenImageMode.FROM_CURRENT_IMAGE | undefined;
  type: EventType.FULLSCREEN_IMAGE;
}
export interface FullScreenImagesFromDataSourceEventBinding {
  currentIndex: DataBinding;
  dataSource: DataBinding;
  displayName?: string;
  id: string;
  mode: FullScreenImageMode.FROM_IMAGE_SOURCE;
  type: EventType.FULLSCREEN_IMAGE;
}
export interface GenerateMiniProgramCodeEventBinding {
  args?: Record<string, DataBinding>;
  assignTo: PathComponent[];
  backgroundImageExId?: string;
  backgroundRelativePosition?: number[];
  codeType: MiniAppCodeType;
  displayName?: string;
  failedActions?: EventBinding[];
  id: string;
  pageMRef?: string;
  size: number;
  successActions?: EventBinding[];
  type: EventType.GENERATE_MINI_PROGRAM_CODE;
}
export interface GenerateQRCodeEventBinding {
  arg?: DataBinding;
  args?: Record<string, DataBinding>;
  assignTo: PathComponent[];
  backgroundImageExId?: string;
  backgroundRelativePosition?: number[];
  displayName?: string;
  failedActions?: EventBinding[];
  id: string;
  plainText?: boolean;
  size: number;
  successActions?: EventBinding[];
  type: EventType.GENERATE_QR_CODE;
}
export interface BranchMerge {
  andThenNodeId: string;
  branchSeparationId: string;
  conditionType: BranchType;
  conditionalFlowIds: string[];
  displayName?: string;
  editable?: boolean;
  removable?: boolean;
  type: GeneralActionFlowNodeType.BRANCH_MERGE;
  uniqueId: string;
}
export interface ConcurrentBranchMerge {
  andThenNodeId: string;
  branchSeparationId: string;
  displayName?: string;
  editable?: boolean;
  removable?: boolean;
  type: FrontendOnlyActionFlowNodeType.CONCURRENT_BRANCH_MERGE;
  uniqueId: string;
}
export interface ForEachEnd {
  andThenNodeId: string;
  displayName?: string;
  editable?: boolean;
  forEachStartNodeId: string;
  previousNodeId: string;
  removable?: boolean;
  type: GeneralActionFlowNodeType.FOR_EACH_END;
  uniqueId: string;
}
export interface SuccessFailMerge {
  andThenNodeId: string;
  callActionNodeId: string;
  displayName?: string;
  editable?: boolean;
  removable?: boolean;
  type: FrontendOnlyActionFlowNodeType.SUCCESS_FAIL_MERGE;
  uniqueId: string;
}
export interface AICreateConversation {
  andThenNodeId: string;
  displayName?: string;
  editable?: boolean;
  event: AICreateConversationEventBinding;
  previousNodeId?: string;
  removable?: boolean;
  type: BackendOnlyActionFlowNodeType.AI_CREATE_CONVERSATION;
  uniqueId: string;
}
export interface AIDeleteConversation {
  andThenNodeId: string;
  displayName?: string;
  editable?: boolean;
  event: AIDeleteConversationEventBinding;
  previousNodeId?: string;
  removable?: boolean;
  type: BackendOnlyActionFlowNodeType.AI_DELETE_CONVERSATION;
  uniqueId: string;
}
export interface AISendMessage {
  andThenNodeId: string;
  displayName?: string;
  editable?: boolean;
  event: AISendMessageEventBinding;
  previousNodeId?: string;
  removable?: boolean;
  type: BackendOnlyActionFlowNodeType.AI_SEND_MESSAGE;
  uniqueId: string;
}
export interface AIStopResponse {
  andThenNodeId: string;
  displayName?: string;
  editable?: boolean;
  event: AIStopResponseEventBinding;
  previousNodeId?: string;
  removable?: boolean;
  type: BackendOnlyActionFlowNodeType.AI_STOP_RESPONSE;
  uniqueId: string;
}
export interface AddRoleToAccount {
  andThenNodeId: string;
  displayName?: string;
  editable?: boolean;
  previousNodeId: string;
  removable?: boolean;
  roleUuid?: string;
  targetAccountId: DataBinding;
  type: BackendOnlyActionFlowNodeType.ADD_ROLE_TO_ACCOUNT;
  uniqueId: string;
}
export interface BranchItem {
  andThenNodeId: string;
  branchSeparationId: string;
  condition: BoolExp<ConditionBoolExp>;
  displayName?: string;
  editable?: boolean;
  removable?: boolean;
  type: GeneralActionFlowNodeType.BRANCH_ITEM;
  uniqueId: string;
}
export interface CallActionFlow {
  andThenNodeId: string;
  displayName?: string;
  editable?: boolean;
  event: ActionFlowEventBinding;
  previousNodeId: string;
  removable?: boolean;
  type: BackendOnlyActionFlowNodeType.ACTION_FLOW;
  uniqueId: string;
}
export interface CallThirdPartyApi {
  andThenNodeId: string;
  displayName?: string;
  editable?: boolean;
  event: CustomRequestEventBinding;
  previousNodeId: string;
  removable?: boolean;
  type: BackendOnlyActionFlowNodeType.THIRD_PARTY_API;
  uniqueId: string;
}
export interface DeleteRecord {
  andThenNodeId: string;
  displayName?: string;
  editable?: boolean;
  mutation: MutationEventBinding;
  previousNodeId: string;
  removable?: boolean;
  type: BackendOnlyActionFlowNodeType.DELETE_RECORD;
  uniqueId: string;
}
export interface FlowStart {
  andThenNodeId: string;
  displayName?: string;
  editable?: boolean;
  inputArgs: Record<string, Variable>;
  removable?: boolean;
  type: GeneralActionFlowNodeType.FLOW_START;
  uniqueId: string;
}
export interface ForEachStart {
  andThenNodeId: string;
  dataSource: DataBinding;
  displayName?: string;
  editable?: boolean;
  forEachEndNodeId: string;
  previousNodeId: string;
  removable?: boolean;
  type: GeneralActionFlowNodeType.FOR_EACH_START;
  uniqueId: string;
}
export interface InsertRecord {
  andThenNodeId: string;
  displayName?: string;
  editable?: boolean;
  mutation: MutationEventBinding;
  previousNodeId: string;
  removable?: boolean;
  type: BackendOnlyActionFlowNodeType.INSERT_RECORD;
  uniqueId: string;
}
export interface QueryRecord {
  andThenNodeId: string;
  displayName?: string;
  editable?: boolean;
  previousNodeId: string;
  query: ZQuery;
  removable?: boolean;
  type: BackendOnlyActionFlowNodeType.QUERY_RECORD;
  uniqueId: string;
}
export interface RemoveRoleFromAccount {
  andThenNodeId: string;
  displayName?: string;
  editable?: boolean;
  previousNodeId: string;
  removable?: boolean;
  roleUuid?: string;
  targetAccountId: DataBinding;
  type: BackendOnlyActionFlowNodeType.REMOVE_ROLE_FROM_ACCOUNT;
  uniqueId: string;
}
export interface RunCustomCode {
  andThenNodeId: string;
  code: string;
  displayName?: string;
  editable?: boolean;
  inputArgs: Record<string, Variable>;
  inputArgsDataBinding: Record<string, DataBinding>;
  outputType?: string;
  outputValues: Record<string, Variable>;
  previousNodeId?: string;
  removable?: boolean;
  type: BackendOnlyActionFlowNodeType.CUSTOM_CODE;
  uniqueId: string;
}
export interface RunTemplateCode {
  andThenNodeId: string;
  displayName?: string;
  editable?: boolean;
  inputArgsDataBinding: Record<string, DataBinding>;
  previousNodeId?: string;
  removable?: boolean;
  templateCodeId: string;
  type: BackendOnlyActionFlowNodeType.TEMPLATE_CODE;
  uniqueId: string;
}
export interface UpdateGlobalVariables {
  andThenNodeId: string;
  displayName?: string;
  editable?: boolean;
  globalVariablesDataBinding: Record<string, DataBinding>;
  previousNodeId: string;
  removable?: boolean;
  type: BackendOnlyActionFlowNodeType.UPDATE_GLOBAL_VARIABLES;
  uniqueId: string;
}
export interface UpdateRecord {
  andThenNodeId: string;
  displayName?: string;
  editable?: boolean;
  mutation: MutationEventBinding;
  previousNodeId: string;
  removable?: boolean;
  type: BackendOnlyActionFlowNodeType.UPDATE_RECORD;
  uniqueId: string;
}
export interface DraggableScreenAttributes {
  autoScaleChildComponentSizeByScreenWidthForLegacyProject?: boolean;
  backgroundColor: DataBinding;
  backgroundImage?: BackgroundImage;
  backgroundImageFitType: BackgroundImageFitType;
  canonicalUrl?: DataBinding;
  footerHeight: number;
  htmlTitle: DataBinding;
  pageDealloc: EventBinding[];
  pageDidLoad: EventBinding[];
  scheduledJobs: ScheduledJob[];
  seoDescription?: DataBinding;
  seoKeywords?: DataBinding;
  seoThumbnail?: ImageData;
  seoTitle?: DataBinding;
  seoValueOptionsByPathData?: Record<string, SeoPathDataValueOptions>;
  shareInfo: ShareInfo;
  shareTimelineInfo?: ShareInfo;
  socialMediaSeoConfigs?: SocialMediaSeoConfigGroup;
}
export interface SimpleProgressBarAttributes {
  backgroundColor: DataBinding;
  barColor: DataBinding;
  containerColor: DataBinding;
  format: string;
  labelColor: DataBinding;
  mode: string;
  onProgressChangeActions: EventBinding[];
  progress: DataBinding;
  totalProgress: LiteralOrDataBinding;
}
export interface TabViewAttributes {
  backgroundColor: DataBinding;
  mode: string;
  normalTabMRef: string;
  preserveStateOnSwitch?: boolean;
  selectedIndex: DataBinding;
  selectedTabMRef: string;
  tabHeight: number;
  tabList: TabListItem[];
}
export interface WechatNavigationBarAttributes {
  backgroundColor: DataBinding;
  textColor: DataBinding;
  title: DataBinding;
}
export interface BranchSeparation {
  branchItemIds: string[];
  conditionType: BranchType;
  displayName?: string;
  editable?: boolean;
  previousNodeId: string;
  removable?: boolean;
  type: GeneralActionFlowNodeType.BRANCH_SEPARATION;
  uniqueId: string;
}
export interface ConcurrentBranchSeparation {
  branchItemIds: string[];
  displayName?: string;
  editable?: boolean;
  previousNodeId: string;
  removable?: boolean;
  type: FrontendOnlyActionFlowNodeType.CONCURRENT_BRANCH_SEPARATION;
  uniqueId: string;
}
export interface DataSelectorProperties {
  clearable?: boolean;
  dataSource?: DataSource;
  defaultValue: DataBinding;
  displayDataField?: DataField;
  placeholder: DataBinding;
}
export interface DateTimePickerProperties {
  defaultValue: DataBinding;
  end: DataBinding;
  mode: DateTimePickerMode;
  placeholder: DataBinding;
  start: DataBinding;
  timeInterval: DataBinding;
}
export interface MixImagePickerProperties {
  defaultValue: DataBinding;
  maxFileSize?: FileSize;
  maxImageCount: number;
  original: boolean;
  placeholderImage?: DataBinding;
  previewEnabled: boolean;
  uploadLoadingEnabled?: boolean;
  uploadSizeType?: UploadSizeType;
}
export interface NumberInputProperties {
  buttonDisabled: boolean;
  defaultValue: DataBinding;
  inputDisabled: boolean;
  max: DataBinding;
  min: DataBinding;
  step: DataBinding;
}
export interface SelectViewProperties {
  cellKeyDataField?: DataField;
  dataSource?: DataSource;
  defaultValue: DataBinding;
  deselectable: boolean;
  displayDataField?: DataField;
  isShowMultiLine: boolean;
  keepChoiceOnRefresh: boolean;
  multiple: boolean;
  preserveCellState?: boolean;
  treatEmptyAsAll: boolean;
}
export interface SwitchProperties {
  defaultValue: DataBinding;
  styleType: SwitchStyleType;
}
export interface TextInputProperties {
  cursorSpacing: number;
  defaultValue: DataBinding;
  focus: boolean;
  inputValueType: InputValueType;
  onChangeDebounceDuration: number;
  password: boolean;
  placeholder: DataBinding;
}
export interface ArrayElementMapping {
  arrayElementFieldMapping?: PathComponent;
  id: string;
  kind: ValueBindingKind.ARRAY_ELEMENT_MAPPING;
  op?: string;
  pathComponents: PathComponent[];
}
export interface InputBinding {
  arrayElementFieldMapping?: PathComponent;
  dataFormat?: DataFormat;
  id: string;
  kind: ValueBindingKind.INPUT | ValueBindingKind.SELECTION;
  label: string;
  pathComponents: PathComponent[];
  shouldDependentsUpdateOnValueChange: boolean;
  value: string;
}
export interface VariableBinding {
  arrayElementFieldMapping?: PathComponent;
  arrayElementObjectMapping?: string[];
  arrayMappingType?: string;
  dataFormat?: DataFormat;
  displayName?: string;
  distinctOnFieldNames?: string[];
  id: string;
  kind: ValueBindingKind.VARIABLE;
  pathComponents: PathComponent[];
  shouldDependentsUpdateOnValueChange?: boolean;
  where?: BoolExprOrAlwaysTrue;
}
export interface CallAction {
  action: EventBinding;
  andThenNodeIdOnSuccess: string;
  displayName?: string;
  editable?: boolean;
  onFailConfig: CallActionOnFailConfig;
  previousNodeId: string;
  removable?: boolean;
  type: FrontendOnlyActionFlowNodeType.CALL_ACTION;
  uniqueId: string;
}
export interface FlowEnd {
  displayName?: string;
  editable?: boolean;
  output?: TypeAssignment;
  outputDataBindings: Record<string, DataBinding>;
  previousNodeId?: string;
  removable?: boolean;
  type: GeneralActionFlowNodeType.FLOW_END;
  uniqueId: string;
}
export interface ScrollingInteraction {
  scrollSpeed: number;
  transform?: ScrollTransformConfig;
}
export interface UnknownEffect {
  effect: string;
}
export enum MobileNavigationTransitionType {
  PUSH = 'PUSH',
}
export enum WebNavigationTransitionType {
  PUSH = 'PUSH',
  NEW_TAB = 'NEW_TAB',
}
export enum WechatNavigationTransitionType {
  PUSH = 'PUSH',
  RELAUNCH = 'RELAUNCH',
  SWITCH_TO = 'SWITCH_TO',
  REDIRECT = 'REDIRECT',
}
export interface FormattedNumber {
  formatOptions?: NumberFormatOptions;
  transform: NumberTransform;
}
export interface BinaryNumericTransform {
  leftOperand: TransformOperand;
  operator: string;
  rightOperand: TransformOperand;
  type: 'binaryNumeric';
}
export interface UnaryNumericTransform {
  operator: string;
  type: 'unaryNumeric';
}
export enum GenericOperator {
  EQ = '_eq',
  NEQ = '_neq',
  GT = '_gt',
  LT = '_lt',
  GTE = '_gte',
  LTE = '_lte',
  ISNULL = '_is_null',
  IS_NOT_NULL = '_is_not_null',
  IN = '_in',
  NOT_IN = '_nin',
  REGEX_MATCH = '_regex_match',
}
export enum TextOperator {
  LIKE = '_like',
  NLIKE = '_nlike',
  ILIKE = '_ilike',
  NILIKE = '_nilike',
}
export enum BooleanOperator {
  IS_TRUE = '_is_true',
  IS_FALSE = '_is_false',
}
export enum CollectionOperator {
  ISEMPTY = '_is_empty',
  ISNOTEMPTY = '_is_not_empty',
  INCLUDES = 'includes',
}
export enum FormulaOperator {
  TO_STRING = 'toText',
  TO_INTEGER = 'toInteger',
  TO_DECIMAL = 'toDecimal',
  TO_DATE_TIME = 'toDateTime',
  ADD = '+',
  SUBTRACT = '-',
  MULTIPLY = '*',
  DIVIDE = '/',
  MODULO = '%',
  MIN = 'min',
  MAX = 'max',
  CEIL = 'ceil',
  FLOOR = 'floor',
  TRUNC = 'trunc',
  ABS = 'abs',
  RANDOM_NUMBER = 'randomNumber',
  POWER = 'power',
  LOG = 'log',
  DECIMAL_FORMAT = 'decimal_format',
  NUMBER_FORMATTING = 'numberFormatting',
  EQUAL = 'equal',
  NOT_EQUAL = 'not_equal',
  STRING_CONCAT = 'stringConcat',
  SUBSTRING = 'substring',
  TO_LOWER_CASE = 'toLowerCase',
  TO_UPPER_CASE = 'toUpperCase',
  SPLIT = 'split',
  STRING_REPLACE = 'stringReplace',
  STRING_FIND = 'stringFind',
  STRING_CONTAIN = 'stringContain',
  SUBSTRING_TO_END = 'substringToEnd',
  SUBSTRING_FROM_START = 'substringFromStart',
  RANDOM_STRING = 'randomString',
  SUBSTITUTE = 'substitute',
  ENCODE_URL = 'encodeUrl',
  DECODE_URL = 'decodeUrl',
  UUID = 'uuid',
  TEXT_REPEAT = 'textRepeat',
  TRIM = 'trim',
  REGEX_EXTRACT = 'regexExtract',
  REGEX_EXTRACT_ALL = 'regexExtractAll',
  REGEX_MATCH = 'regexMatch',
  REGEX_REPLACE = 'regexReplace',
  GET_VALUE_FROM_JSON = 'get_value_from_json',
  STRING_LENGTH = 'stringLength',
  ARRAY_LENGTH = 'arrayLength',
  ARRAY_JOIN = 'array_join',
  ARRAY_TO_ITEM_CONVERSION = 'arrayToItemConversion',
  ARRAY_GET_ITEM = 'arrayGetItem',
  ARRAY_FIRST_ITEM = 'arrayFirstItem',
  ARRAY_LAST_ITEM = 'arrayLastItem',
  RANDOM_ITEM = 'randomItem',
  SLICE = 'slice',
  INDEX_OF = 'indexOf',
  ARRAY_MAPPING = 'arrayMapping',
  FILTER = 'filter',
  SEQUENCE = 'sequence',
  COALESCE = 'coalesce',
  ARRAY_MIN = 'arrayMin',
  ARRAY_MAX = 'arrayMax',
  ARRAY_SUM = 'arraySum',
  ARRAY_AVERAGE = 'arrayAverage',
  ARRAY_CONCAT = 'arrayConcat',
  UNIQUE = 'unique',
  CREATE_TIME = 'createTime',
  GET_CURRENT_TIME = 'getCurrentTime',
  DURATION = 'duration',
  TIME_OPERATION = 'timeOperation',
  DATE_PART = 'datePart',
  DATE_TIME_COMBINE = 'dateTimeCombine',
  TIMESTAMP_GET_DATE = 'timestampGetDate',
  TIMESTAMP_GET_TIME = 'timestampGetTime',
  DATE_TIME_FORMATTING = 'dateTimeFormatting',
  DISTANCE = 'distance',
  GET_VALUE_FROM_GEO_POINT = 'get_value_from_geo_point',
  ENUM_ENTRIES = 'enumEntries',
}
export enum PrimitiveType {
  STRING = 's:p:string',
  DECIMAL = 's:p:decimal',
  BIGINT = 's:p:bigint',
  BOOLEAN = 's:p:boolean',
  TIMESTAMPTZ = 's:p:timestamptz',
  TIMETZ = 's:p:timetz',
  DATE = 's:p:date',
  JSONB = 's:p:jsonb',
  IMAGE = 's:p:image',
  VIDEO = 's:p:video',
  FILE = 's:p:file',
  GEO_POINT = 's:p:geo_point',
}
export enum SystemDefinedType {
  NULL = 'null',
  LOCATION_INFO = 'SYSTEM_DEFINED:OBJECT:location_info',
  BIGSERIAL = 'SYSTEM_DEFINED:PRIMITIVE:bigserial',
}
export interface ListViewProperties {
  autoGridEnabled: boolean;
  autoScrollToTopOnRefreshMode: ListViewAutoScrollToTopOnRefreshMode;
  cellAutoSizeEnabled: boolean;
  cellKeyDataField?: DataField;
  dataLoadingConfig: DataLoadingConfig;
  dataSource?: DataSource;
  direction: ListDirection;
  masonryEnabled: boolean;
  pagingConfig?: CellPagingConfig;
  preserveCellState: boolean;
}
export interface FunctionBinding {
  args?: Record<string, DataBinding>;
  config?: TimeIntervalConfig;
  dataFormat?: DataFormat;
  id: string;
  kind: ValueBindingKind.FUNCTION;
  label?: string;
  pageMRef?: string;
  pathArgs?: Record<string, DataBinding>;
  value: BuiltInFunction;
}
export interface AICreateConversationEventBinding {
  configId: string;
  displayName?: string;
  failedActions?: EventBinding[];
  id: string;
  inputArgs: Record<string, DataBinding>;
  reasoningContentAssignTo?: PathComponent[];
  showLoadingAnimation: boolean;
  streamingAssignTo?: PathComponent[];
  successActions?: EventBinding[];
  taskId: string;
  type: EventType.AI_CREATE_CONVERSATION;
}
export interface AIDeleteConversationEventBinding {
  configId: string;
  conversationId: DataBinding;
  displayName?: string;
  failedActions?: EventBinding[];
  id: string;
  showLoadingAnimation: boolean;
  successActions?: EventBinding[];
  type: EventType.AI_DELETE_CONVERSATION;
}
export interface AIObtainInfoEventBinding {
  configId: string;
  displayName?: string;
  failedActions?: EventBinding[];
  id: string;
  images?: DataBinding;
  showLoadingAnimation: boolean;
  successActions?: EventBinding[];
  taskId: string;
  text?: DataBinding;
  toolId: DataBinding;
  type: EventType.AI_OBTAIN_INFO;
}
export interface AISendMessageEventBinding {
  configId: string;
  conversationId: DataBinding;
  displayName?: string;
  failedActions?: EventBinding[];
  id: string;
  images?: DataBinding;
  reasoningContentAssignTo?: PathComponent[];
  showLoadingAnimation: boolean;
  streamingAssignTo?: PathComponent[];
  successActions?: EventBinding[];
  taskId: string;
  text?: DataBinding;
  type: EventType.AI_SEND_MESSAGE;
  video?: DataBinding;
}
export interface AIStopResponseEventBinding {
  configId: string;
  conversationId: DataBinding;
  displayName?: string;
  failedActions?: EventBinding[];
  id: string;
  showLoadingAnimation: boolean;
  successActions?: EventBinding[];
  type: EventType.AI_STOP_RESPONSE;
}
export interface AccountBindEmailEventBinding {
  displayName?: string;
  email: DataBinding;
  failedActions?: EventBinding[];
  id: string;
  successActions?: EventBinding[];
  type: EventType.ACCOUNT_BIND_EMAIL;
  verificationCode: DataBinding;
}
export interface AccountBindPhoneNumberEventBinding {
  displayName?: string;
  failedActions?: EventBinding[];
  id: string;
  phoneNumber: DataBinding;
  successActions?: EventBinding[];
  type: EventType.ACCOUNT_BIND_PHONE_NUMBER;
  verificationCode: DataBinding;
}
export interface AccountUnbindEmailEventBinding {
  displayName?: string;
  failedActions?: EventBinding[];
  id: string;
  successActions?: EventBinding[];
  type: EventType.ACCOUNT_UNBIND_EMAIL;
  verificationCode: DataBinding;
}
export interface AccountUnbindPhoneNumberEventBinding {
  displayName?: string;
  failedActions?: EventBinding[];
  id: string;
  successActions?: EventBinding[];
  type: EventType.ACCOUNT_UNBIND_PHONE_NUMBER;
  verificationCode: DataBinding;
}
export interface ActionFlowEventBinding {
  actionFlowId: string;
  actionId: string;
  displayName?: string;
  failedActions?: EventBinding[];
  id: string;
  inputArgs: Record<string, DataBinding>;
  showLoadingAnimation?: boolean;
  successActions?: EventBinding[];
  type: EventType.ACTION_FLOW;
}
export interface AliPaymentEventBinding {
  displayName?: string;
  failedActions?: EventBinding[];
  id: string;
  outTradeNo: DataBinding;
  productCode: DataBinding;
  subject: DataBinding;
  successActions?: EventBinding[];
  totalAmount: DataBinding;
  type: EventType.ALI_PAYMENT;
}
export interface AlipayRecurringPaymentEventBinding {
  alipaySignScene: DataBinding;
  cycleLength: DataBinding;
  cycleUnit: BillingCycleTimeUnit;
  displayName?: string;
  failedActions?: EventBinding[];
  id: string;
  orderId: DataBinding;
  price: DataBinding;
  subjectName: DataBinding;
  successActions?: EventBinding[];
  type: EventType.ALIPAY_RECURRING_PAYMENT;
}
export interface CancelRecurringPaymentEventBinding {
  displayName?: string;
  failedActions?: EventBinding[];
  id: string;
  recurringPaymentId: DataBinding;
  successActions?: EventBinding[];
  type: EventType.ALIPAY_CANCEL_RECURRING_PAYMENT | EventType.STRIPE_CANCEL_RECURRING_PAYMENT;
}
export interface CheckVerificationCodeEventBinding {
  contactType: string;
  displayName?: string;
  failedActions?: EventBinding[];
  id: string;
  successActions?: EventBinding[];
  target: DataBinding;
  type: EventType.CHECK_VERIFICATION_CODE;
  verificationCode: DataBinding;
}
export interface CompletePersonalInfoEventBinding {
  displayName?: string;
  failedActions?: EventBinding[];
  id: string;
  successActions?: EventBinding[];
  type: EventType.COMPLETE_PERSONAL_INFO;
}
export interface ComponentToBitmapEventBinding {
  componentMRef?: string;
  displayName?: string;
  failedActions?: EventBinding[];
  id: string;
  successActions?: EventBinding[];
  type: EventType.COMPONENT_TO_BITMAP;
}
export interface ComponentToImageEventBinding {
  componentId?: string;
  displayName?: string;
  failedActions?: EventBinding[];
  id: string;
  successActions?: EventBinding[];
  type: EventType.COMPONENT_TO_IMAGE;
}
export interface CustomRequestEventBinding {
  displayName?: string;
  failedActions?: EventBinding[];
  id: string;
  input?: ObjectNode;
  inputs?: Record<string, DataBinding>;
  limit?: number;
  operation: string;
  output?: ObjectNode;
  permanentError?: ObjectNode;
  permanentErrorActions?: EventBinding[];
  requestId: string;
  successActions?: EventBinding[];
  temporaryError?: ObjectNode;
  temporaryErrorActions?: EventBinding[];
  thirdPartyApiId?: string;
  type: EventType.THIRD_PARTY_API;
  value: string;
}
export interface DeleteAccountByPasswordEventBinding {
  displayName?: string;
  failedActions?: EventBinding[];
  id: string;
  password: DataBinding;
  successActions?: EventBinding[];
  type: EventType.DELETE_ACCOUNT_BY_PASSWORD;
}
export interface DeleteAccountByVerificationCodeEventBinding {
  contactType: SendVerificationCodeContactType;
  displayName?: string;
  failedActions?: EventBinding[];
  id: string;
  successActions?: EventBinding[];
  type: EventType.DELETE_ACCOUNT_BY_VERIFICATION_CODE;
  verificationCode: DataBinding;
}
export interface DeprecatedWechatPaymentEventBinding {
  displayName?: string;
  failedActions?: EventBinding[];
  id: string;
  paymentMessage: DataBinding;
  successActions?: EventBinding[];
  type: EventType.WECHAT_PAYMENT;
}
export interface EditFilterAndStickerEventBinding {
  assignTo?: PathComponent[];
  displayName?: string;
  failedActions?: EventBinding[];
  id: string;
  image: DataBinding;
  successActions?: EventBinding[];
  type: EventType.EDIT_FILTER_AND_STICKER;
}
export interface EmailLoginEventBinding {
  displayName?: string;
  email: DataBinding;
  failedActions?: EventBinding[];
  id: string;
  password: DataBinding;
  successActions?: EventBinding[];
  type: EventType.EMAIL_LOGIN;
}
export interface EmailRegisterEventBinding {
  displayName?: string;
  email: DataBinding;
  failedActions?: EventBinding[];
  id: string;
  password: DataBinding;
  successActions?: EventBinding[];
  type: EventType.EMAIL_REGISTER;
  verificationCode: DataBinding;
}
export interface EmailResetPasswordEventBinding {
  displayName?: string;
  email: DataBinding;
  failedActions?: EventBinding[];
  id: string;
  password: DataBinding;
  successActions?: EventBinding[];
  type: EventType.EMAIL_RESET_PASSWORD;
  verificationCode: DataBinding;
}
export interface GetAdministrationAreaEventBinding {
  assignTo: PathComponent[];
  displayName?: string;
  failedActions?: EventBinding[];
  id: string;
  location: DataBinding;
  successActions?: EventBinding[];
  type: EventType.GET_ADMINISTRATION_AREA;
}
export interface ImageFilterEventBinding {
  assignTo: PathComponent[];
  bitmap: DataBinding;
  displayName?: string;
  failedActions?: EventBinding[];
  filterName?: string;
  id: string;
  params?: Record<string, ImageFilterParamsType>;
  successActions?: EventBinding[];
  type: EventType.IMAGE_FILTER;
}
export interface MutationEventBinding {
  object?: Record<string, DataBinding>;
  displayName?: string;
  distinctOnFieldNames?: string[];
  failedActions?: EventBinding[];
  filters?: ConditionalFilter[];
  id: string;
  isWhereError: boolean;
  listMutation?: boolean;
  listMutationSourceData?: DataBinding;
  onMutationConflictAction?: MutationOnConflictAction;
  onRequestStatusChangeActions: EventBinding[];
  operation: MutationOp;
  requestId: string;
  role?: string;
  rootFieldType: string;
  sortFields?: PathComponent[];
  successActions?: EventBinding[];
  triggers: TriggerEventBinding[];
  type: EventType.MUTATION;
  value: string;
  where?: BoolExprOrAlwaysTrue;
}
export interface MutationZipEventBinding {
  displayName?: string;
  eventList: EventBinding[];
  failedActions?: EventBinding[];
  id: string;
  successActions?: EventBinding[];
  type: EventType.BATCH_MUTATION;
}
export interface NavigateToMiniProgramEventBinding {
  appId: DataBinding;
  displayName?: string;
  extraData: Record<string, DataBinding>;
  failedActions?: EventBinding[];
  id: string;
  path: DataBinding;
  successActions?: EventBinding[];
  type: EventType.NAVIGATE_TO_MINI_PROGRAM;
}
export interface NotificationAuthorizationEventBinding {
  displayName?: string;
  failedActions?: EventBinding[];
  id: string;
  successActions?: EventBinding[];
  templateIds: string[];
  type: EventType.NOTIFICATION_AUTHORIZATION;
}
export interface ObtainPhoneNumberEventBinding {
  displayName?: string;
  failedActions?: EventBinding[];
  id: string;
  successActions?: EventBinding[];
  target: PathComponent[];
  type: EventType.OBTAIN_PHONE_NUMBER;
}
export interface ObtainWeRunDataEventBinding {
  displayName?: string;
  failedActions?: EventBinding[];
  id: string;
  successActions?: EventBinding[];
  target: PathComponent[];
  type: EventType.OBTAIN_WE_RUN_DATA;
}
export interface OpenChannelsLiveEventBinding {
  displayName?: string;
  failedActions?: EventBinding[];
  finderUserName: DataBinding;
  id: string;
  successActions?: EventBinding[];
  type: EventType.OPEN_CHANNELS_LIVE;
}
export interface OpenWechatSettingEventBinding {
  displayName?: string;
  failedActions?: EventBinding[];
  id: string;
  successActions?: EventBinding[];
  type: EventType.OPEN_WECHAT_SETTING;
}
export interface PhoneCodeLoginEventBinding {
  displayName?: string;
  failedActions?: EventBinding[];
  id: string;
  phoneNumber: DataBinding;
  successActions?: EventBinding[];
  type: EventType.PHONE_NUMBER_CODE_LOGIN;
  verificationCode: DataBinding;
}
export interface PhonePasswordLoginEventBinding {
  displayName?: string;
  failedActions?: EventBinding[];
  id: string;
  password: DataBinding;
  phoneNumber: DataBinding;
  successActions?: EventBinding[];
  type: EventType.PHONE_NUMBER_PASSWORD_LOGIN;
}
export interface PhoneRegisterEventBinding {
  displayName?: string;
  failedActions?: EventBinding[];
  id: string;
  password?: DataBinding;
  phoneNumber: DataBinding;
  successActions?: EventBinding[];
  type: EventType.PHONE_NUMBER_REGISTER;
  verificationCode: DataBinding;
}
export interface PhoneResetPasswordEventBinding {
  displayName?: string;
  failedActions?: EventBinding[];
  id: string;
  password: DataBinding;
  phoneNumber: DataBinding;
  successActions?: EventBinding[];
  type: EventType.PHONE_NUMBER_RESET_PASSWORD;
  verificationCode: DataBinding;
}
export interface RefundEventBinding {
  displayName?: string;
  failedActions?: EventBinding[];
  id: string;
  paymentId: DataBinding;
  refundAmount: DataBinding;
  successActions?: EventBinding[];
  type: EventType.ALIPAY_REFUND | EventType.WECHAT_REFUND | EventType.STRIPE_REFUND;
}
export interface ScanQRCodeEventBinding {
  displayName?: string;
  expectedField?: PathComponent[];
  expectedFields: Record<string, PathComponent[]>;
  failedActions?: EventBinding[];
  id: string;
  plainText?: boolean;
  successActions?: EventBinding[];
  type: EventType.SCAN_QR_CODE;
}
export interface SendVerificationCodeEventBinding {
  contactType: SendVerificationCodeContactType;
  displayName?: string;
  failedActions?: EventBinding[];
  id: string;
  successActions?: EventBinding[];
  target?: DataBinding;
  type: EventType.SEND_VERIFICATION_CODE;
  verificationCodeType?: SendVerificationCodeType;
}
export interface StripePaymentEventBinding {
  amount: DataBinding;
  currency: DataBinding;
  displayName?: string;
  failedActions?: EventBinding[];
  id: string;
  merOrderId: DataBinding;
  productDescription?: DataBinding;
  productName?: DataBinding;
  successActions?: EventBinding[];
  type: EventType.STRIPE_PAYMENT;
}
export interface StripeRecurringPaymentEventBinding {
  displayName?: string;
  failedActions?: EventBinding[];
  id: string;
  orderId: DataBinding;
  priceId: DataBinding;
  productDescription?: DataBinding;
  productName?: DataBinding;
  successActions?: EventBinding[];
  type: EventType.STRIPE_RECURRING_PAYMENT;
}
export interface TakePhotoEventBinding {
  assignTo: PathComponent[];
  displayName?: string;
  failedActions?: EventBinding[];
  id: string;
  successActions?: EventBinding[];
  type: EventType.TAKE_PHOTO;
}
export interface TransformBitmapToImageEventBinding {
  assignTo?: PathComponent[];
  bitmap: DataBinding;
  displayName?: string;
  failedActions?: EventBinding[];
  id: string;
  successActions?: EventBinding[];
  type: EventType.TRANSFORM_BITMAP_TO_IMAGE;
}
export interface TransformImageToBitmapEventBinding {
  assignTo?: PathComponent[];
  displayName?: string;
  failedActions?: EventBinding[];
  id: string;
  image: DataBinding;
  successActions?: EventBinding[];
  type: EventType.TRANSFORM_IMAGE_TO_BITMAP;
}
export interface UserLoginEventBinding {
  createAccountOnLogin?: boolean;
  displayName?: string;
  failedActions?: EventBinding[];
  id: string;
  loginCredential?: UserLoginCredential;
  successActions?: EventBinding[];
  type: EventType.USER_LOGIN;
  value?: UserLoginActionType;
}
export interface UserRegisterEventBinding {
  displayName?: string;
  failedActions?: EventBinding[];
  id: string;
  registrationForm: Record<string, DataBinding>;
  successActions?: EventBinding[];
  type: EventType.USER_REGISTER;
}
export interface UsernameLoginEventBinding {
  displayName?: string;
  failedActions?: EventBinding[];
  id: string;
  password: DataBinding;
  successActions?: EventBinding[];
  type: EventType.USERNAME_LOGIN;
  username: DataBinding;
}
export interface UsernameRegisterEventBinding {
  displayName?: string;
  failedActions?: EventBinding[];
  id: string;
  password: DataBinding;
  successActions?: EventBinding[];
  type: EventType.USERNAME_REGISTER;
  username: DataBinding;
}
export interface WechatAddPhoneCalendarEventBinding {
  displayName?: string;
  failedActions?: EventBinding[];
  id: string;
  startTime: DataBinding;
  successActions?: EventBinding[];
  title: DataBinding;
  type: EventType.WECHAT_ADD_PHONE_CALENDAR;
}
export interface WechatAuthenticateLoginEventBinding {
  displayName?: string;
  failedActions?: EventBinding[];
  id: string;
  successActions?: EventBinding[];
  type: EventType.WECHAT_AUTHENTICATE_LOGIN;
}
export interface WechatContactEventBinding {
  displayName?: string;
  failedActions?: EventBinding[];
  id: string;
  successActions?: EventBinding[];
  type: EventType.WECHAT_CONTACT;
}
export interface WechatLoginEventBinding {
  displayName?: string;
  failedActions?: EventBinding[];
  id: string;
  matchAccountAcrossPlatforms?: boolean;
  successActions?: EventBinding[];
  type: EventType.WECHAT_LOGIN;
}
export interface WechatOpenChannelsEventBinding {
  displayName?: string;
  eventId?: DataBinding;
  failedActions?: EventBinding[];
  feedId?: DataBinding;
  finderUserName: DataBinding;
  id: string;
  openType: WechatOpenChannelsType;
  successActions?: EventBinding[];
  type: EventType.WECHAT_OPEN_CHANNELS;
}
export interface WechatOrderAndCallPaymentEventBinding {
  amount: DataBinding;
  description: DataBinding;
  displayName?: string;
  failedActions?: EventBinding[];
  id: string;
  merOrderId: DataBinding;
  successActions?: EventBinding[];
  type: EventType.WECHAT_ORDER_AND_CALL_PAYMENT;
}
export interface WechatReceiptEventBinding {
  displayName?: string;
  failedActions: EventBinding[];
  id: string;
  orderId: DataBinding;
  successActions: EventBinding[];
  type: EventType.WECHAT_RECEIPT;
}
export interface WechatShareEventBinding {
  args?: Record<string, DataBinding>;
  displayName?: string;
  failedActions?: EventBinding[];
  id: string;
  image?: DataBinding;
  imageObject: DataBinding;
  imageSource: DataBinding;
  pageMRef?: string;
  successActions?: EventBinding[];
  title: DataBinding;
  type: EventType.SHARE;
}
export interface WechatShipmentEventBinding {
  displayName?: string;
  failedActions: EventBinding[];
  id: string;
  orderId: DataBinding;
  shipmentInfo: ShipmentInfo;
  successActions: EventBinding[];
  type: EventType.WECHAT_SHIPMENT;
}
export interface WxworkAuthenticateLoginEventBinding {
  displayName?: string;
  failedActions?: EventBinding[];
  id: string;
  successActions?: EventBinding[];
  type: EventType.WXWORK_AUTHENTICATE_LOGIN;
}
export interface ZAITaskEventBinding {
  configId: string;
  displayName?: string;
  failedActions?: EventBinding[];
  id: string;
  inputArgs: Record<string, DataBinding>;
  showLoadingAnimation: boolean;
  streamingAssignTo?: PathComponent[];
  successActions?: EventBinding[];
  taskId: string;
  type: EventType.ZAI_TASK;
}
export interface LogisticsShipmentInfo {
  companyCode: DataBinding;
  itemDescription: DataBinding;
  recipientContact: DataBinding;
  senderContact: DataBinding;
  shippingMode: ShippingMode.LOGISTICS;
  trackingNumber: DataBinding;
}
export interface OtherShipmentInfo {
  itemDescription: DataBinding;
  shippingMode: ShippingMode.SAME_CITY | ShippingMode.DIGITAL | ShippingMode.PICK_UP;
}
export interface BasicSortConfig {
  field: PathComponent[];
  sort: SortType;
  type: 'BASIC';
}
export interface VectorSortConfig {
  calculation: VectorCalculation;
  comparison: DataBinding;
  field: PathComponent[];
  type: 'VECTOR';
}
export interface CustomTabConfig {
  mode: TabMode.CUSTOM;
  normalTabComponentId: string;
  selectedTabComponentId: string;
}
export interface NormalTabConfig {
  mode: TabMode.NORMAL;
}
export interface ColorTheme {
  color: string;
  displayName: string;
  id: string;
}
export interface VideoPickerProperties {
  disablePreview: boolean;
  maxFileSize?: FileSize;
  uploadLoadingEnabled: boolean;
  uploadSizeType?: UploadSizeType;
  video?: DataBinding;
}
export interface HasBodyParameters {
  bodyParameters?: TypeAssignment;
  headerParameters?: PropertyEntry<TypeAssignment>[];
  pathParameters?: PropertyEntry<TypeAssignment>[];
  queryParameters?: PropertyEntry<TypeAssignment>[];
}
export interface NoBodyParameters {
  headerParameters?: PropertyEntry<TypeAssignment>[];
  pathParameters?: PropertyEntry<TypeAssignment>[];
  queryParameters?: PropertyEntry<TypeAssignment>[];
}
export interface AnimationScrollingInteraction {
  displayName?: string;
  id: string;
  scrollSpeed: number;
  transform?: ScrollTransformConfig;
  type: EventType;
}
export interface LogEventBinding {
  args: Record<string, DataBinding>;
  displayName?: string;
  id: string;
  title: string;
  type: EventType.LOG;
}
export interface FunctorEventBinding {
  args?: Record<string, DataBinding>;
  displayName?: string;
  id: string;
  name: string;
  onFailedActions: EventBinding[];
  onSucceedActions: EventBinding[];
  resultAssociatedPathComponents?: PathComponent[];
  type: EventType.FUNCTOR;
}
export interface SetDataEventBinding {
  action?: SetDataOp;
  data?: DataBinding;
  displayName?: string;
  id: string;
  pathComponents?: PathComponent[];
  type: EventType.SET_GLOBAL_DATA | EventType.SET_PAGE_DATA;
}
export interface ImagePickerDeleteImageEventBinding {
  displayName?: string;
  id: string;
  index?: DataBinding;
  targetMRef?: string;
  type: EventType.IMAGE_PICKER_DELETE_IMAGE;
}
export interface ImagePickerReplaceImageEventBinding {
  displayName?: string;
  id: string;
  image?: DataBinding;
  index?: DataBinding;
  targetMRef?: string;
  type: EventType.IMAGE_PICKER_REPLACE_IMAGE;
}
export interface RefreshCellEventBinding {
  cellIndex?: DataBinding;
  displayName?: string;
  id: string;
  listMRef?: string;
  type: EventType.REFRESH_CELL;
}
export interface NavigationActionEventBinding {
  args?: Record<string, DataBinding>;
  displayName?: string;
  id: string;
  operation: NavigationOperation;
  pathArgs?: Record<string, DataBinding>;
  targetMRef?: string;
  transition?: string;
  type: EventType.NAVIGATION;
  value?: string;
}
export interface NavigationGoBackEventBinding {
  displayName?: string;
  id: string;
  pageId?: string;
  refresh?: boolean;
  type: EventType.NAVIGATION_GO_BACK;
}
export interface SsoBindEventBinding {
  displayName?: string;
  id: string;
  onSuccessActionFlows: ActionFlowEventBinding[];
  page?: string;
  pageType?: SsoPageType;
  params: Record<string, DataBinding>;
  ssoConfigId?: string;
  type: EventType.SSO_BIND;
}
export interface SsoLoginOrRegisterEventBinding {
  authPageParams?: Record<string, DataBinding>;
  displayName?: string;
  id: string;
  onSuccessActionFlows: ActionFlowEventBinding[];
  page?: string;
  pageType?: SsoPageType;
  params: Record<string, DataBinding>;
  ssoConfigId?: string;
  type: EventType.SSO_LOGIN_OR_REGISTER;
}
export interface ResetInputValueEventBinding {
  displayName?: string;
  id: string;
  targetMRef: string;
  type: EventType.RESET_INPUT_VALUE;
}
export interface SetInputValueEventBinding {
  displayName?: string;
  id: string;
  targetMRef: string;
  triggerOnChangeEvent?: boolean;
  type: EventType.SET_INPUT_VALUE;
  value: DataBinding;
}
export interface ShowModalWithCallbackEventsEventBinding {
  displayName?: string;
  id: string;
  inputs?: Record<string, DataBinding>;
  modalId: string;
  onModalClosed?: EventBinding[];
  showModalActionId: string;
  type: EventType.SHOW_MODAL_WITH_CALLBACK_EVENTS;
}
export interface MobileNavigationGotoEventBinding {
  displayName?: string;
  id: string;
  inputs?: Record<string, DataBinding>;
  pageId: string;
  transition: MobileNavigationTransitionType;
  type: EventType.NAVIGATION_GO_TO_MOBILE;
}
export interface WebNavigationGoToEventBinding {
  displayName?: string;
  id: string;
  inputs?: Record<string, DataBinding>;
  pageId: string;
  transition: WebNavigationTransitionType;
  type: EventType.NAVIGATION_GO_TO_WEB;
}
export interface WechatNavigationGotoEventBinding {
  displayName?: string;
  id: string;
  inputs?: Record<string, DataBinding>;
  pageId: string;
  transition: WechatNavigationTransitionType;
  type: EventType.NAVIGATION_GO_TO_WECHAT;
}
export interface ConfigureCameraEventBinding {
  devicePosition?: string;
  displayName?: string;
  flash?: string;
  id: string;
  targetMRef?: string;
  type: EventType.CONFIGURE_CAMERA;
}
export interface CountDownEventBinding {
  action: CountDownActionType;
  displayName?: string;
  id: string;
  targetMRef: string;
  type: EventType.COUNTDOWN;
}
export interface ExportSheetEventBinding {
  displayName?: string;
  id: string;
  targetMRef: string;
  type: EventType.EXPORT;
}
export interface HideModalEventBinding {
  displayName?: string;
  id: string;
  modalViewMRef: string;
  type: EventType.HIDE_MODAL;
}
export interface ImagePickerAddImageEventBinding {
  displayName?: string;
  id: string;
  targetMRef?: string;
  type: EventType.IMAGE_PICKER_ADD_IMAGE;
}
export interface ListLoadMoreEventBinding {
  displayName?: string;
  id: string;
  listMRef?: string;
  type: EventType.LIST_LOAD_MORE;
}
export interface LottieEventBinding {
  action: LottieAction;
  direction: DataBinding;
  displayName?: string;
  endFrame: DataBinding;
  id: string;
  startFrame: DataBinding;
  targetMRef: string;
  type: EventType.LOTTIE;
}
export interface PrintComponentEventBinding {
  componentMRef: string;
  displayName?: string;
  id: string;
  type: EventType.PRINT_COMPONENT;
}
export interface RerunConditionEventBinding {
  displayName?: string;
  id: string;
  type: EventType.RERUN_CONDITION;
  value: string;
}
export interface ScrollHorizontalListEventBinding {
  direction: ScrollHorizontalListDirection;
  displayName?: string;
  id: string;
  targetMRef: string;
  type: EventType.SCROLL_HORIZONTAL_LIST;
}
export interface ScrollPageToEventBinding {
  displayName?: string;
  id: string;
  mode: ScrollPageToMode;
  target?: string;
  type: EventType.SCROLL_PAGE_TO;
}
export interface ScrollToBottomEventBinding {
  displayName?: string;
  id: string;
  targetMRef: string;
  type: EventType.SCROLL_TO_BOTTOM;
}
export interface ScrollToEventBinding {
  displayName?: string;
  id: string;
  mode?: ScrollToMode;
  sectionIndex?: DataBinding;
  target?: string;
  type: EventType.SCROLL_TO;
}
export interface SetFoldModeEventBinding {
  displayName?: string;
  foldingMode?: FoldingMode;
  id: string;
  targetMRef?: string;
  type: EventType.SET_FOLD_MODE;
}
export interface SetVariableDataEventBinding {
  displayName?: string;
  id: string;
  targetComponentId: string;
  targetVariable: string;
  type: EventType.SET_VARIABLE_DATA;
  value?: DataBinding;
}
export interface ShowModalEventBinding {
  cancelTitle?: string;
  confirmActions?: EventBinding[];
  confirmTitle?: string;
  detail?: DataBinding;
  displayName?: string;
  id: string;
  modalViewMRef?: string;
  mode: ShowModalMode;
  title?: string;
  type: EventType.SHOW_MODAL;
}
export interface SwitchViewCaseEventBinding {
  displayName?: string;
  id: string;
  parent: string;
  target: string;
  type: EventType.SWITCH_VIEW_CASE;
  value: string;
}
export interface VideoEventBinding {
  action: MediaAction;
  displayName?: string;
  id: string;
  target?: string;
  type: EventType.VIDEO;
}
export interface SsoUnbindEventBinding {
  displayName?: string;
  id: string;
  ssoConfigId?: string;
  successActions?: EventBinding[];
  type: EventType.SSO_UNBIND;
}
export interface NotificationEventBinding {
  accountId?: DataBinding;
  args?: Record<string, DataBinding>;
  content?: DataBinding;
  displayName?: string;
  id: string;
  phoneNumber?: DataBinding;
  templateId: string;
  type: EventType.WECHAT_NOTIFICATION | EventType.SMS_NOTIFICATION;
}
export interface TriggerMutationEventBinding {
  columns?: string[];
  displayName?: string;
  id: string;
  operation?: string;
  table?: string;
  type: EventType.TRIGGER_MUTATION;
  value: MutationEventBinding;
}
export interface AddPhoneContactEventBinding {
  addressStreet: DataBinding;
  displayName?: string;
  email: DataBinding;
  firstName: DataBinding;
  id: string;
  mobilePhoneNumber: DataBinding;
  remark: DataBinding;
  title: DataBinding;
  type: EventType.ADD_PHONE_CONTACT;
  url: DataBinding;
}
export interface AudioEventBinding {
  action: MediaAction;
  coverImage?: DataBinding;
  displayName?: string;
  id: string;
  loop?: boolean;
  playInBackground?: boolean;
  src: DataBinding;
  title?: DataBinding;
  type: EventType.AUDIO;
}
export interface CallPhoneEventBinding {
  displayName?: string;
  id: string;
  phoneNumber: DataBinding;
  type: EventType.CALL_PHONE;
}
export interface CloseModalEventBinding {
  displayName?: string;
  id: string;
  mode: CloseModalMode;
  type: EventType.CLOSE_MODAL;
}
export interface ConditionalActionEventBinding {
  conditionalActions: ConditionalAction[];
  displayName?: string;
  id: string;
  type: EventType.CONDITIONAL;
}
export interface DownloadBitmapEventBinding {
  bitmap: DataBinding;
  displayName?: string;
  id: string;
  type: EventType.DOWNLOAD_BITMAP;
}
export interface DownloadFileEventBinding {
  displayName?: string;
  file: DataBinding;
  id: string;
  type: EventType.DOWNLOAD_FILE;
}
export interface DownloadImageEventBinding {
  displayName?: string;
  id: string;
  image: DataBinding;
  type: EventType.DOWNLOAD_IMAGE;
}
export interface FunctorApiEventBinding {
  displayName?: string;
  functorId: string;
  id: string;
  input?: ObjectNode;
  invokeApiName: string;
  operation: string;
  output?: ObjectNode;
  permanentError?: ObjectNode;
  permanentErrorActions?: EventBinding[];
  requestId: string;
  successActions?: EventBinding[];
  temporaryError?: ObjectNode;
  temporaryErrorActions?: EventBinding[];
  thirdPartyApiId?: string;
  type: EventType.FUNCTOR_API;
  value: string;
}
export interface ListEventBinding {
  dataSource?: DataBinding;
  displayName?: string;
  id: string;
  itemActions: EventBinding[];
  type: EventType.LIST_ACTION;
}
export interface MallbookDepositEventBinding {
  amount: DataBinding;
  displayName?: string;
  id: string;
  merOrderId: DataBinding;
  type: EventType.MALLBOOK_DEPOSIT;
}
export interface ModifyJsonbEventBinding {
  action: ModifyJsonbActionType;
  data?: DataBinding;
  displayName?: string;
  id: string;
  keyPathDataBinding: DataBinding;
  modifyJson: DataBinding;
  type: EventType.MODIFY_JSONB;
}
export interface OpenExternalLinkEventBinding {
  displayName?: string;
  id: string;
  openInNewTab?: boolean;
  type: EventType.OPEN_EXTERNAL_LINK;
  url: DataBinding;
}
export interface OpenLocationEventBinding {
  address: DataBinding;
  displayName?: string;
  geoPoint: DataBinding;
  id: string;
  name: DataBinding;
  type: EventType.OPEN_LOCATION;
}
export interface OpenRewardedVideoAdEventBinding {
  advertId: string;
  displayName?: string;
  id: string;
  onCloseWithEndedActions: EventBinding[];
  type: EventType.OPEN_REWARDED_VIDEO_AD;
}
export interface OpenWebViewEventBinding {
  displayName?: string;
  id: string;
  src: DataBinding;
  type: EventType.OPEN_WEB_VIEW;
}
export interface PreviewDocumentEventBinding {
  displayName?: string;
  fileId: DataBinding;
  id: string;
  showMenu?: boolean;
  type: EventType.PREVIEW_DOCUMENT;
}
export interface RefreshEventBinding {
  displayName?: string;
  id: string;
  refreshList: string[];
  type: EventType.REFRESH;
}
export interface RefreshListEventBinding {
  displayName?: string;
  id: string;
  refreshPathComponents: RefreshPathComponent[];
  type: EventType.REFRESH_LIST;
}
export interface RefreshLoginUserEventBinding {
  displayName?: string;
  id: string;
  type: EventType.REFRESH_LOGIN_USER;
}
export interface ScheduledJobControlEventBinding {
  action: ScheduledJobControlAction;
  displayName?: string;
  id: string;
  scheduledJobId?: string;
  type: EventType.SCHEDULED_JOB_CONTROL;
}
export interface SetClipboardEventBinding {
  displayName?: string;
  id: string;
  text: DataBinding;
  type: EventType.SET_CLIPBOARD;
}
export interface ShareToTwitterEventBinding {
  displayName?: string;
  id: string;
  title: DataBinding;
  type: EventType.SHARE_TO_TWITTER;
  url: DataBinding;
}
export interface ShareToWeiboEventBinding {
  displayName?: string;
  id: string;
  image?: DataBinding;
  imageObject: DataBinding;
  imageSource: DataBinding;
  title: DataBinding;
  type: EventType.SHARE_TO_WEIBO;
  url: DataBinding;
}
export interface ShowToastEventBinding {
  displayName?: string;
  id: string;
  title: DataBinding;
  type: EventType.SHOW_TOAST;
}
export interface WebSilentLoginEventBinding {
  displayName?: string;
  id: string;
  type: EventType.WEB_SILENT_LOGIN;
}
export interface WechatAgreePrivacyAuthorizationEventBinding {
  displayName?: string;
  id: string;
  type: EventType.WECHAT_AGREE_PRIVACY_AUTHORIZATION;
}
export interface WechatGetPrivacySettingEventBinding {
  displayName?: string;
  id: string;
  onNeedPrivacyAuthorization: EventBinding[];
  type: EventType.WECHAT_GET_PRIVACY_SETTING;
}
export interface WechatOpenPrivacyContractEventBinding {
  displayName?: string;
  id: string;
  type: EventType.WECHAT_OPEN_PRIVACY_CONTRACT;
}
export interface WechatSaveVideoToAlbumEventBinding {
  displayName?: string;
  id: string;
  type: EventType.WECHAT_SAVE_VIDEO_TO_ALBUM;
  video: DataBinding;
}
export interface CompositeDataBinding {
  arithmeticOperator?: ArithmeticOperator;
  conditionsToVerify?: ConditionToVerify[];
  id: string;
  itemType: string | null;
  op?: DataBindingOperation;
  type: string;
  typeParameter?: string;
  valueBinding: BindingBase[];
}
export interface SingleValueDataBinding {
  arithmeticOperator?: ArithmeticOperator;
  conditionsToVerify?: ConditionToVerify[];
  id: string;
  itemType: string | null;
  type: string;
  typeParameter?: string;
  valueBinding: ValueBinding;
}
export interface ArrayAverageFormulaBinding {
  array: DataBinding;
  id: string;
  kind: ValueBindingKind.FORMULA;
  op?: FormulaOperator.ARRAY_AVERAGE;
  resultType: string;
}
export interface ArrayConcatFormulaBinding {
  firstArray: DataBinding;
  id: string;
  kind: ValueBindingKind.FORMULA;
  op?: FormulaOperator.ARRAY_CONCAT;
  resultType: string;
  secondArray: DataBinding;
}
export interface ArrayFilterFormulaBinding {
  filter: BoolExp<ConditionBoolExp>;
  id: string;
  kind: ValueBindingKind.FORMULA;
  op?: FormulaOperator.FILTER;
  resultType: string;
  source: DataBinding;
}
export interface ArrayFirstItemFormulaBinding {
  array: DataBinding;
  id: string;
  kind: ValueBindingKind.FORMULA;
  op?: FormulaOperator.ARRAY_FIRST_ITEM;
  resultType: string;
}
export interface ArrayGetItemFormulaBinding {
  array: DataBinding;
  id: string;
  index: DataBinding;
  kind: ValueBindingKind.FORMULA;
  op?: FormulaOperator.ARRAY_GET_ITEM;
  resultType: string;
}
export interface ArrayIndexOfFormulaBinding {
  array: DataBinding;
  id: string;
  kind: ValueBindingKind.FORMULA;
  op?: FormulaOperator.INDEX_OF;
  resultType: string;
  searchItem: DataBinding;
}
export interface ArrayLastItemFormulaBinding {
  array: DataBinding;
  id: string;
  kind: ValueBindingKind.FORMULA;
  op?: FormulaOperator.ARRAY_LAST_ITEM;
  resultType: string;
}
export interface ArrayMappingFormulaBinding {
  id: string;
  kind: ValueBindingKind.FORMULA;
  mappedItem: DataBinding;
  op?: FormulaOperator.ARRAY_MAPPING;
  resultType: string;
  source: DataBinding;
}
export interface ArrayMaxFormulaBinding {
  array: DataBinding;
  id: string;
  kind: ValueBindingKind.FORMULA;
  op?: FormulaOperator.ARRAY_MAX;
  resultType: string;
}
export interface ArrayMinFormulaBinding {
  array: DataBinding;
  id: string;
  kind: ValueBindingKind.FORMULA;
  op?: FormulaOperator.ARRAY_MIN;
  resultType: string;
}
export interface ArrayRandomItemFormulaBinding {
  array: DataBinding;
  id: string;
  kind: ValueBindingKind.FORMULA;
  op?: FormulaOperator.RANDOM_ITEM;
  resultType: string;
}
export interface ArraySliceFormulaBinding {
  array: DataBinding;
  id: string;
  kind: ValueBindingKind.FORMULA;
  op?: FormulaOperator.SLICE;
  resultType: string;
  size: DataBinding;
  startIndex: DataBinding;
}
export interface ArraySumFormulaBinding {
  array: DataBinding;
  id: string;
  kind: ValueBindingKind.FORMULA;
  op?: FormulaOperator.ARRAY_SUM;
  resultType: string;
}
export interface BasicFormulaBinding {
  id: string;
  kind: ValueBindingKind.FORMULA;
  op?: FormulaOperator;
  resultType: string;
  valueRecord: Record<string, DataBinding>;
}
export interface CoalesceFormulaBinding {
  array: DataBinding;
  id: string;
  kind: ValueBindingKind.FORMULA;
  op?: FormulaOperator.COALESCE;
  resultType: string;
}
export interface CombineDateAndTimeFormulaBinding {
  date: DataBinding;
  dateFormat?: DateFormat;
  id: string;
  kind: ValueBindingKind.FORMULA;
  op?: FormulaOperator.DATE_TIME_COMBINE;
  resultType: string;
  time: DataBinding;
}
export interface CreateTimeFormulaBinding {
  dateFormat?: DateFormat;
  definedDateTime: TemporalData;
  id: string;
  kind: ValueBindingKind.FORMULA;
  op?: FormulaOperator.CREATE_TIME;
  resultType: string;
  timeType: DateTimeType;
}
export interface DateTimeFormattingFormulaBinding {
  dateTime: DataBinding;
  format: DateFormat;
  id: string;
  kind: ValueBindingKind.FORMULA;
  op?: FormulaOperator.DATE_TIME_FORMATTING;
  resultType: string;
}
export interface DateTimeFormulaBinding {
  durations: TimestampItem[];
  id: string;
  kind: ValueBindingKind.FORMULA;
  op?: FormulaOperator.ADD | FormulaOperator.SUBTRACT;
  resultType: string;
  valueRecord: Record<string, SingleValueDataBinding>;
}
export interface DecimalFormulaBinding {
  clearTrailingZeros: boolean;
  decimal: DataBinding;
  fractionDigits: DataBinding;
  id: string;
  kind: ValueBindingKind.FORMULA;
  op?: FormulaOperator.DECIMAL_FORMAT;
  resultType: string;
  roundingMode: RoundingMode;
  valueRecord: Record<string, DataBinding>;
}
export interface DecodeUrlFormulaBinding {
  id: string;
  kind: ValueBindingKind.FORMULA;
  op?: FormulaOperator.DECODE_URL;
  resultType: string;
  text: DataBinding;
}
export interface DurationFormulaBinding {
  dateTimeUnit: DateTimeUnit;
  fromDateTime: DataBinding;
  id: string;
  kind: ValueBindingKind.FORMULA;
  op?: FormulaOperator.DURATION;
  resultType: string;
  toDateTime: DataBinding;
}
export interface EncodeUrlFormulaBinding {
  id: string;
  kind: ValueBindingKind.FORMULA;
  op?: FormulaOperator.ENCODE_URL;
  resultType: string;
  text: DataBinding;
}
export interface EnumEntriesFormulaBinding {
  enumId?: string;
  id: string;
  kind: ValueBindingKind.FORMULA;
  op?: FormulaOperator.ENUM_ENTRIES;
  resultType: string;
}
export interface GeoDistanceFormulaBinding {
  end: DataBinding;
  id: string;
  kind: ValueBindingKind.FORMULA;
  op?: FormulaOperator.DISTANCE;
  resultType: string;
  start: DataBinding;
  unit: DistanceMeasurement;
}
export interface GeoPointGetValueFormulaBinding {
  geoPoint: DataBinding;
  getValueType: GeoPointGetValueType;
  id: string;
  kind: ValueBindingKind.FORMULA;
  op?: FormulaOperator.GET_VALUE_FROM_GEO_POINT;
  resultType: string;
}
export interface GetCurrentTimeFormulaBinding {
  dateFormat?: DateFormat;
  id: string;
  kind: ValueBindingKind.FORMULA;
  op?: FormulaOperator.GET_CURRENT_TIME;
  resultType: string;
  timeType: DateTimeType;
}
export interface JsonFormulaBinding {
  arrayElementFieldMapping?: PathComponent;
  arrayElementObjectMapping?: string[];
  id: string;
  json: DataBinding;
  keyPath?: string;
  keyPathDataBinding?: DataBinding;
  kind: ValueBindingKind.FORMULA;
  op?: FormulaOperator.GET_VALUE_FROM_JSON;
  resultType: string;
  valueRecord: Record<string, DataBinding>;
  valueType?: string;
}
export interface LogFormulaBinding {
  argument: DataBinding;
  base: DataBinding;
  id: string;
  kind: ValueBindingKind.FORMULA;
  op?: FormulaOperator.LOG;
  resultType: string;
}
export interface MathAbsFormulaBinding {
  id: string;
  kind: ValueBindingKind.FORMULA;
  op?: FormulaOperator.ABS;
  resultType: string;
  value: DataBinding;
}
export interface MathPowerFormulaBinding {
  base: DataBinding;
  exponent: DataBinding;
  id: string;
  kind: ValueBindingKind.FORMULA;
  op?: FormulaOperator.POWER;
  resultType: string;
}
export interface MathRandomNumberFormulaBinding {
  id: string;
  kind: ValueBindingKind.FORMULA;
  max: DataBinding;
  min: DataBinding;
  op?: FormulaOperator.RANDOM_NUMBER;
  resultType: string;
}
export interface NumberFormattingFormulaBinding {
  format: NumberFormatEnum;
  id: string;
  kind: ValueBindingKind.FORMULA;
  number: DataBinding;
  op?: FormulaOperator.NUMBER_FORMATTING;
  resultType: string;
}
export interface RandomStringFormulaBinding {
  id: string;
  kind: ValueBindingKind.FORMULA;
  maxLength: DataBinding;
  minLength: DataBinding;
  op?: FormulaOperator.RANDOM_STRING;
  resultType: string;
  withLowerCaseLetter: DataBinding;
  withNumber: DataBinding;
  withUpperCaseLetter: DataBinding;
}
export interface RegexExtractFormulaBinding {
  id: string;
  kind: ValueBindingKind.FORMULA;
  op?: FormulaOperator.REGEX_EXTRACT | FormulaOperator.REGEX_EXTRACT_ALL;
  regex: DataBinding;
  resultType: string;
  text: DataBinding;
}
export interface RegexMatchFormulaBinding {
  id: string;
  kind: ValueBindingKind.FORMULA;
  op?: FormulaOperator.REGEX_MATCH;
  regex: DataBinding;
  resultType: string;
  text: DataBinding;
}
export interface RegexReplaceFormulaBinding {
  id: string;
  kind: ValueBindingKind.FORMULA;
  op?: FormulaOperator.REGEX_REPLACE;
  regex: DataBinding;
  replacement: DataBinding;
  resultType: string;
  text: DataBinding;
}
export interface SequenceFormulaBinding {
  end: DataBinding;
  id: string;
  kind: ValueBindingKind.FORMULA;
  op?: FormulaOperator.SEQUENCE;
  resultType: string;
  start: DataBinding;
  step: DataBinding;
}
export interface SubstringFromStartFormulaBinding {
  id: string;
  kind: ValueBindingKind.FORMULA;
  numOfChar: DataBinding;
  op?: FormulaOperator.SUBSTRING_FROM_START;
  resultType: string;
  text: DataBinding;
}
export interface SubstringToEndFormulaBinding {
  id: string;
  kind: ValueBindingKind.FORMULA;
  numOfChar: DataBinding;
  op?: FormulaOperator.SUBSTRING_TO_END;
  resultType: string;
  text: DataBinding;
}
export interface TextConcatFormulaBinding {
  id: string;
  kind: ValueBindingKind.FORMULA;
  op: FormulaOperator.STRING_CONCAT;
  resultType: string;
  source: DataBinding;
  target: DataBinding;
}
export interface TextContainFormulaBinding {
  id: string;
  kind: ValueBindingKind.FORMULA;
  op?: FormulaOperator.STRING_CONTAIN;
  resultType: string;
  searchContent: DataBinding;
  text: DataBinding;
}
export interface TextFindFormulaBinding {
  id: string;
  kind: ValueBindingKind.FORMULA;
  op?: FormulaOperator.STRING_FIND;
  resultType: string;
  searchContent: DataBinding;
  text: DataBinding;
}
export interface TextRepeatFormulaBinding {
  id: string;
  kind: ValueBindingKind.FORMULA;
  op?: FormulaOperator.TEXT_REPEAT;
  resultType: string;
  text: DataBinding;
  times: DataBinding;
}
export interface TextReplaceFormulaBinding {
  id: string;
  kind: ValueBindingKind.FORMULA;
  lengthToReplace: DataBinding;
  op?: FormulaOperator.STRING_REPLACE;
  replaceWith: DataBinding;
  resultType: string;
  startIndex: DataBinding;
  text: DataBinding;
}
export interface TextSplitFormulaBinding {
  delimiter: DataBinding;
  id: string;
  kind: ValueBindingKind.FORMULA;
  op?: FormulaOperator.SPLIT;
  resultType: string;
  text: DataBinding;
}
export interface TextSubstituteFormulaBinding {
  id: string;
  kind: ValueBindingKind.FORMULA;
  op?: FormulaOperator.SUBSTITUTE;
  replaceWith: DataBinding;
  resultType: string;
  searchContent: DataBinding;
  text: DataBinding;
  timesToReplace: DataBinding;
}
export interface TimeGetPartFormulaBinding {
  dateTime: DataBinding;
  dateTimeUnit: DateTimeUnit;
  id: string;
  kind: ValueBindingKind.FORMULA;
  op?: FormulaOperator.DATE_PART;
  resultType: string;
}
export interface TimeOperationFormulaBinding {
  dateFormat?: DateFormat;
  dateTime: DataBinding;
  direction: TimeDirection;
  id: string;
  kind: ValueBindingKind.FORMULA;
  op?: FormulaOperator.TIME_OPERATION;
  resultType: string;
  timeInterval: TemporalData;
}
export interface TimestampGetDateOrTimeFormulaBinding {
  dateFormat?: DateFormat;
  dateTime: DataBinding;
  id: string;
  kind: ValueBindingKind.FORMULA;
  op?: FormulaOperator.TIMESTAMP_GET_TIME | FormulaOperator.TIMESTAMP_GET_DATE;
  resultType: string;
}
export interface ToDateTimeFormulaBinding {
  dateFormat?: DateFormat;
  format: DataBinding;
  id: string;
  kind: ValueBindingKind.FORMULA;
  op: FormulaOperator.TO_DATE_TIME;
  resultType: string;
  source: DataBinding;
}
export interface ToDecimalFormulaBinding {
  id: string;
  kind: ValueBindingKind.FORMULA;
  op: FormulaOperator.TO_DECIMAL;
  resultType: string;
  source: DataBinding;
}
export interface ToIntegerFormulaBinding {
  id: string;
  kind: ValueBindingKind.FORMULA;
  op: FormulaOperator.TO_INTEGER;
  resultType: string;
  source: DataBinding;
}
export interface ToStringFormulaBinding {
  id: string;
  kind: ValueBindingKind.FORMULA;
  op: FormulaOperator.TO_STRING;
  resultType: string;
  source: DataBinding;
}
export interface TrimFormulaBinding {
  id: string;
  kind: ValueBindingKind.FORMULA;
  op?: FormulaOperator.TRIM;
  resultType: string;
  text: DataBinding;
}
export interface UUIDFormulaBinding {
  id: string;
  kind: ValueBindingKind.FORMULA;
  op?: FormulaOperator.UUID;
  resultType: string;
}
export interface UniqueFormulaBinding {
  array: DataBinding;
  id: string;
  kind: ValueBindingKind.FORMULA;
  op?: FormulaOperator.UNIQUE;
  resultType: string;
}
export interface BooleanLiteralBinding {
  category?: LiteralCategory.BOOLEAN;
  id: string;
  kind: ValueBindingKind.LITERAL;
  value: boolean;
}
export interface DateLiteralBinding {
  category: LiteralCategory.DATE;
  dateInString: string;
  id: string;
  kind: ValueBindingKind.LITERAL;
}
export interface DateTimeLiteralBinding {
  category: LiteralCategory.TIMESTAMPTZ;
  dateTimeInString: string;
  id: string;
  kind: ValueBindingKind.LITERAL;
}
export interface FloatLiteralBinding {
  category?: LiteralCategory.DECIMAL;
  id: string;
  kind: ValueBindingKind.LITERAL;
  value: number;
}
export interface GeoPointLiteralBinding {
  category?: LiteralCategory.GEO_POINT;
  id: string;
  kind: ValueBindingKind.LITERAL;
  latitude: number;
  longitude: number;
}
export interface IntegerLiteralBinding {
  category?: LiteralCategory.BIGINT;
  id: string;
  kind: ValueBindingKind.LITERAL;
  value: number;
}
export interface JsonLiteralBinding {
  category?: LiteralCategory.JSONB;
  id: string;
  json: string;
  kind: ValueBindingKind.LITERAL;
}
export interface StringLiteralBinding {
  category?: LiteralCategory.STRING;
  id: string;
  kind: ValueBindingKind.LITERAL;
  value: string;
}
export interface TimeLiteralBinding {
  category: LiteralCategory.TIMETZ;
  id: string;
  kind: ValueBindingKind.LITERAL;
  timeInString: string;
}
export interface FileBinding {
  id: string;
  kind: ValueBindingKind.FILE;
  source: FileSource;
  value: DataBinding;
}
export interface ImageBinding {
  id: string;
  kind: ValueBindingKind.IMAGE;
  source: ComponentRefactorImageSource;
  value: DataBinding;
}
export interface VideoBinding {
  id: string;
  kind: ValueBindingKind.VIDEO;
  source: ComponentRefactorVideoSource;
  value: DataBinding;
}
export interface ColorThemeBinding {
  id: string;
  kind: ValueBindingKind.THEME;
  value: string;
}
export interface ColumnNameBinding {
  id: string;
  kind: ValueBindingKind.COLUMN_NAME;
  table: string;
  value: string;
}
export interface ConditionalBinding {
  conditionalData: ConditionData[];
  id: string;
  kind: ValueBindingKind.CONDITIONAL;
  resultType: string;
}
export interface CustomArrayBinding {
  id: string;
  itemType: string | null;
  items: DataBinding[];
  kind: ValueBindingKind.CUSTOM_ARRAY;
  type: string;
}
export interface CustomObjectBinding {
  fields: Record<string, DataBinding>;
  id: string;
  kind: ValueBindingKind.CUSTOM_OBJECT;
  type: string;
}
export interface EmptyBinding {
  id: string;
  kind: ValueBindingKind.EMPTY;
}
export interface EnumOptionBinding {
  enumId: string;
  id: string;
  kind: ValueBindingKind.ENUM_OPTION;
  optionId: string;
  pathComponents?: PathComponent[];
}
export interface ListSourceBinding {
  id: string;
  itemType: string;
  kind: ValueBindingKind.LIST;
  listSourceData?: SingleValueDataBinding;
  object: Record<string, DataBinding>;
}
export interface ObjectLiteralBinding {
  data: Record<string, DataBinding>;
  id: string;
  kind: ValueBindingKind.JSON;
}
export interface MobileClientConfiguration {
  appDidLoad: EventBinding[];
  breakpointRecord: Record<string, BreakPoint>;
  clonedComponentGroupConfiguration?: ClonedComponentGroupConfiguration;
  colorThemeById?: Record<string, ColorTheme>;
  customRepos?: ConfiguredCodeComponentRepo[];
  globalVariableTable: Record<string, Variable>;
  initialPageId?: string;
  language?: string;
  pageGroupConfiguration: PageGroupConfiguration;
  tabBarSetting?: TabBarSetting;
}
export interface WebClientConfiguration {
  appDidLoad: EventBinding[];
  breakpointRecord: Record<string, BreakPoint>;
  clonedComponentGroupConfiguration?: ClonedComponentGroupConfiguration;
  colorThemeById?: Record<string, ColorTheme>;
  customRepos?: ConfiguredCodeComponentRepo[];
  globalVariableTable: Record<string, Variable>;
  headerInjection?: string;
  initialPageId?: string;
  language?: string;
  mapConfiguration?: MapConfiguration;
  pageGroupConfiguration: PageGroupConfiguration;
  scriptInjection?: string;
  seoConfiguration?: SeoConfiguration;
  showScrollBar?: boolean;
}
export interface WechatMiniProgramClientConfiguration {
  appDidLoad: EventBinding[];
  breakpointRecord: Record<string, BreakPoint>;
  clonedComponentGroupConfiguration?: ClonedComponentGroupConfiguration;
  colorThemeById?: Record<string, ColorTheme>;
  customRepos?: ConfiguredCodeComponentRepo[];
  globalVariableTable: Record<string, Variable>;
  initialPageId?: string;
  isLegacySchema?: boolean;
  orderListPageId?: string;
  pageCountInMainPackage: number;
  pageCountInSubPackage: number;
  pageGroupConfiguration: PageGroupConfiguration;
  tabBarSetting?: TabBarSetting;
}
export interface CustomClonedComponentGroup {
  cloneComponentExId: string[];
  groupIconExId: string;
  groupId: string;
  groupName: string;
  groupType: ClonedComponentGroupType;
}
export interface DefaultClonedComponentGroup {
  groupId: string;
  groupName: string;
  groupType: ClonedComponentGroupType;
}
export interface CodeComponentConfigWithDynamicInput {
  id: string;
  identifyingName: string;
  inputArguments: CodeComponentInputArguments;
  tag: string;
}
export interface DeprecatedCodeComponentConfig {
  coverExId: string;
  coverUrl: string;
  inputParameters: CodeComponentItemParameter[];
  name: string;
  repo: string;
}
export interface CodeComponentMRefInput {
  mRef?: string;
  name: string;
}
export interface CodeComponentVariableAssignment {
  initValue: DataBinding;
  name: string;
}
export interface CodeComponentActionsInput {
  actions: EventBinding[];
  name: string;
}
export interface ModalEvents {
  componentDidMount?: EventBinding[];
  componentWillUnmount?: EventBinding[];
}
export interface PageEvents {
  componentDidMount?: EventBinding[];
  componentWillUnmount?: EventBinding[];
  scheduledJobs?: ScheduledJob[];
}
export interface ButtonEvents {
  onClick?: BaseEventBinding[];
  onHover?: ComponentRefactorInteraction[];
  onPageScroll?: ComponentRefactorInteraction[];
  onScrollIntoPage?: ComponentRefactorInteraction[];
}
export interface ImageEvents {
  onClick?: BaseEventBinding[];
  onHover?: ComponentRefactorInteraction[];
  onPageScroll?: ComponentRefactorInteraction[];
  onScrollIntoPage?: ComponentRefactorInteraction[];
}
export interface RichTextEvents {
  onClick?: ComponentRefactorInteraction[];
  onHover?: ComponentRefactorInteraction[];
  onPageScroll?: ComponentRefactorInteraction[];
  onScrollIntoPage?: ComponentRefactorInteraction[];
}
export interface TextEvents {
  onClick?: BaseEventBinding[];
  onHover?: ComponentRefactorInteraction[];
  onPageScroll?: ComponentRefactorInteraction[];
  onScrollIntoPage?: ComponentRefactorInteraction[];
}
export interface VideoEvents {
  onBeginPlay?: EventBinding[];
  onClick?: ComponentRefactorInteraction[];
  onHover?: ComponentRefactorInteraction[];
  onPageScroll?: ComponentRefactorInteraction[];
  onScrollIntoPage?: ComponentRefactorInteraction[];
}
export interface ViewEvents {
  onClick?: BaseEventBinding[];
  onHover?: ComponentRefactorInteraction[];
  onPageScroll?: ComponentRefactorInteraction[];
  onScrollIntoPage?: ComponentRefactorInteraction[];
}
export interface MapMarkerEvents {
  onClick?: EventBinding[];
}
export interface LottieProgressBarEvents {
  onProgressChange?: EventBinding[];
}
export interface ProgressBarEvents {
  onProgressChange?: EventBinding[];
}
export interface MixImagePickerEvents {
  onSuccess?: EventBinding[];
  onValueChange?: EventBinding[];
}
export interface VideoPickerEvents {
  onSuccess?: EventBinding[];
  onValueChange?: EventBinding[];
}
export interface DataSelectorEvents {
  onValueChange?: EventBinding[];
}
export interface DateTimePickerEvents {
  onValueChange?: EventBinding[];
}
export interface FilePickerEvents {
  onValueChange?: EventBinding[];
}
export interface NumberInputEvents {
  onValueChange?: EventBinding[];
}
export interface RichTextEditorEvents {
  onValueChange?: EventBinding[];
}
export interface SelectViewEvents {
  onValueChange?: EventBinding[];
}
export interface SwitchEvents {
  onValueChange?: EventBinding[];
}
export interface TextInputEvents {
  onBlur?: EventBinding[];
  onValueChange?: EventBinding[];
}
export interface CalendarEvents {
  onDateClicked?: EventBinding[];
}
export interface ListViewEvents {
  onScroll?: EventBinding[];
}
export interface LottieEvents {
  onComplete?: EventBinding[];
}
export interface ForeignKeyConstraint {
  name: string;
  sourceUnitedColumns: string[];
  targetTable: string;
  targetUnitedColumns: string[];
}
export interface NotNullConstraint {
  columnName: string;
  name: string;
}
export interface PrimaryKeyConstraint {
  name: string;
  primaryKeyColumns: string[];
}
export interface UniqueConstraint {
  compositeUniqueColumns: string[];
  name: string;
}
export interface ThirdPartyQuery {
  displayName?: string;
  id: string;
  input?: ObjectNode;
  inputs?: Record<string, DataBinding>;
  limit?: number;
  operation: string;
  output?: ObjectNode;
  outputListDataPathComponents: PathComponent[];
  permanentError?: ObjectNode;
  permanentErrorActions?: EventBinding[];
  requestId: string;
  successActions: EventBinding[];
  temporaryError?: ObjectNode;
  temporaryErrorActions?: EventBinding[];
  thirdPartyApiId?: string;
  type: EventType.THIRD_PARTY_API;
  uniqueIdentifierFieldPathComponents?: PathComponent[];
  value: string;
}
export interface ZQuery {
  displayName?: string;
  distanceArgs?: Record<string, DataBinding>;
  distinctOnFieldNames?: string[];
  filters?: ConditionalFilter[];
  id?: string;
  isWhereError: boolean;
  limit?: number;
  listMutation?: boolean;
  onRequestStatusChangeActions: EventBinding[];
  requestId: string;
  role?: string;
  rootFieldType: string;
  sortConfigs?: SortConfig[];
  sortFields?: PathComponent[];
  sortType?: SortType;
  successActions: EventBinding[];
  type: EventType.QUERY | EventType.SUBSCRIPTION;
  value?: string;
  where?: BoolExprOrAlwaysTrue;
}
export interface DbQuery {
  enable: boolean;
  query: ZQuery;
  selection: TableSelection;
}
export interface ReferenceDataSource {
  pathComponents: PathComponent[];
}
export interface SelectViewLocalDataSource {
  localData: SelectViewItem[];
}
export interface HasBodyParameterApiMeta {
  contentType?: ApiContentType;
  method: APIHttpMethod.PUT | APIHttpMethod.POST | APIHttpMethod.PATCH;
  parameter?: HasBodyParameters;
  url: DataBinding;
}
export interface NoBodyParameterApiMeta {
  method: APIHttpMethod.GET | APIHttpMethod.OPTION | APIHttpMethod.HEAD | APIHttpMethod.DELETE;
  parameter?: NoBodyParameters;
  url: DataBinding;
}
export interface ApplicationJsonResponse {
  body: ObjectNode;
  type: ContentType;
}
export interface TextHtmlResponse {
  body: DataBinding;
  type: ContentType;
}
export interface TextPlainResponse {
  body: DataBinding;
  type: ContentType;
}
export interface LayoutView {
  childComponentIds?: string[];
  design?: ComponentDesign<ViewStyles>;
  displayName: string;
  events?: ViewEvents;
  id: string;
  parentComponentId: string;
  properties: ViewProperties;
  type: ComponentRefactorComponentType.LAYOUT_VIEW;
}
export interface Modal {
  childComponentIds?: string[];
  design?: ComponentDesign<GeneralComponentStyle<ModalWrapperStyle>>;
  displayName: string;
  events?: ModalEvents;
  id: string;
  inputs?: Record<string, InputVariable>;
  outputs?: Record<string, OutputVariable>;
  properties?: ModalProperties;
  type: ComponentRefactorComponentType.MODAL;
  variables?: Record<string, InnerVariable>;
}
export interface Page {
  childComponentIds?: string[];
  design?: ComponentDesign<GeneralComponentStyle<PageWrapperStyle>>;
  displayName: string;
  events?: PageEvents;
  id: string;
  inputs?: Record<string, InputVariable>;
  outputs?: Record<string, OutputVariable>;
  properties: PageProperties;
  type: ComponentRefactorComponentType.PAGE;
  variables?: Record<string, InnerVariable>;
}
export interface DataSelector {
  design?: ComponentDesign<DataSelectorStyles>;
  displayName: string;
  events?: DataSelectorEvents;
  id: string;
  parentComponentId: string;
  properties: DataSelectorProperties;
  type: ComponentRefactorComponentType.DATA_SELECTOR;
}
export interface GeoMap {
  design?: ComponentDesign<GeneralComponentStyle<GeoMapWrapperStyle>>;
  displayName: string;
  events?: undefined;
  id: string;
  markerComponentId?: string;
  parentComponentId: string;
  properties: GeoMapProperties;
  type: ComponentRefactorComponentType.MAP;
}
export interface ListView {
  cellComponentId: string;
  design?: ComponentDesign<ListViewStyles>;
  displayName: string;
  events?: ListViewEvents;
  footerComponentId?: string;
  headerComponentId?: string;
  id: string;
  parentComponentId: string;
  properties: ListViewProperties;
  type: ComponentRefactorComponentType.LIST;
}
export interface SelectView {
  design?: ComponentDesign<GeneralComponentStyle<SelectViewWrapperStyle>>;
  displayName: string;
  events?: SelectViewEvents;
  id: string;
  normalComponentId: string;
  parentComponentId: string;
  properties: SelectViewProperties;
  selectedComponentId: string;
  type: ComponentRefactorComponentType.SELECT_VIEW;
}
export interface Sheet {
  design?: ComponentDesign<SheetStyles>;
  displayName: string;
  events?: undefined;
  id: string;
  parentComponentId: string;
  properties: SheetProperties;
  type: ComponentRefactorComponentType.SHEET;
}
export interface TabView {
  design?: ComponentDesign<GeneralComponentStyle<TabViewWrapperStyle>>;
  displayName: string;
  events?: undefined;
  id: string;
  parentComponentId: string;
  properties: TabViewProperties;
  tabConfig: TabConfig;
  tabList: ComponentRefactorTabListItem[];
  type: ComponentRefactorComponentType.TAB_VIEW;
}
export interface DateTimePicker {
  design?: ComponentDesign<DateTimePickerStyles>;
  displayName: string;
  events?: DateTimePickerEvents;
  id: string;
  parentComponentId: string;
  properties: DateTimePickerProperties;
  type: ComponentRefactorComponentType.DATE_TIME_PICKER;
}
export interface FilePicker {
  design?: ComponentDesign<GeneralComponentStyle<FilePickerWrapperStyle>>;
  displayName: string;
  events?: FilePickerEvents;
  id: string;
  parentComponentId: string;
  properties?: undefined;
  type: ComponentRefactorComponentType.FILE_PICKER;
}
export interface MixImagePicker {
  design?: ComponentDesign<MixImagePickerStyles>;
  displayName: string;
  events?: MixImagePickerEvents;
  id: string;
  parentComponentId: string;
  properties: MixImagePickerProperties;
  type: ComponentRefactorComponentType.MIX_IMAGE_PICKER;
}
export interface NumberInput {
  design?: ComponentDesign<GeneralComponentStyle<NumberInputWrapperStyle>>;
  displayName: string;
  events?: NumberInputEvents;
  id: string;
  parentComponentId: string;
  properties: NumberInputProperties;
  type: ComponentRefactorComponentType.NUMBER_INPUT;
}
export interface RichTextEditor {
  design?: ComponentDesign<GeneralComponentStyle<RichTextEditorWrapperStyle>>;
  displayName: string;
  events?: RichTextEditorEvents;
  id: string;
  parentComponentId: string;
  properties: RichTextEditorProperties;
  type: ComponentRefactorComponentType.RICH_TEXT_EDITOR;
}
export interface Switch {
  design?: ComponentDesign<SwitchStyles>;
  displayName: string;
  events?: SwitchEvents;
  id: string;
  parentComponentId: string;
  properties: SwitchProperties;
  type: ComponentRefactorComponentType.SWITCH;
}
export interface TextInput {
  design?: ComponentDesign<TextInputStyles>;
  displayName: string;
  events?: TextInputEvents;
  id: string;
  parentComponentId: string;
  properties: TextInputProperties;
  type: ComponentRefactorComponentType.TEXT_INPUT;
}
export interface VideoPicker {
  design?: ComponentDesign<GeneralComponentStyle<VideoPickerWrapperStyle>>;
  displayName: string;
  events?: VideoPickerEvents;
  id: string;
  parentComponentId: string;
  properties: VideoPickerProperties;
  type: ComponentRefactorComponentType.VIDEO_PICKER;
}
export interface Calendar {
  design?: ComponentDesign<GeneralComponentStyle<CalendarWrapperStyle>>;
  displayName: string;
  events?: CalendarEvents;
  id: string;
  parentComponentId: string;
  properties: CalendarProperties;
  type: ComponentRefactorComponentType.CALENDAR;
}
export interface CodeComponent {
  design?: ComponentDesign<GeneralComponentStyle<CodeComponentWrapperStyle>>;
  displayName: string;
  events?: undefined;
  id: string;
  parentComponentId: string;
  properties: CodeComponentConfigWithDynamicInput;
  type: ComponentRefactorComponentType.CODE_COMPONENT;
}
export interface AdvertBanner {
  design?: ComponentDesign<GeneralComponentStyle<AdvertBannerWrapperStyle>>;
  displayName: string;
  events?: undefined;
  id: string;
  parentComponentId: string;
  properties: AdvertBannerProperties;
  type: ComponentRefactorComponentType.WECHAT_ADVERT_BANNER;
}
export interface Button {
  design?: ComponentDesign<ButtonStyles>;
  displayName: string;
  events?: ButtonEvents;
  id: string;
  parentComponentId: string;
  properties: ButtonProperties;
  type: ComponentRefactorComponentType.BUTTON;
}
export interface Camera {
  design?: ComponentDesign<GeneralComponentStyle<CameraWrapperStyle>>;
  displayName: string;
  events?: undefined;
  id: string;
  parentComponentId: string;
  properties: CameraProperties;
  type: ComponentRefactorComponentType.CAMERA;
}
export interface ConditionalView {
  conditionalChildViewConfigs: ConditionalChildViewConfig[];
  design?: undefined;
  displayName: string;
  events?: undefined;
  id: string;
  parentComponentId: string;
  properties: ConditionalViewProperties;
  type: ComponentRefactorComponentType.CONDITIONAL_VIEW;
}
export interface HorizontalLine {
  design?: ComponentDesign<GeneralComponentStyle<HorizontalLineWrapperStyle>>;
  displayName: string;
  events?: undefined;
  id: string;
  parentComponentId: string;
  properties: HorizontalLineProperties;
  type: ComponentRefactorComponentType.HORIZONTAL_LINE;
}
export interface Html {
  design?: ComponentDesign<GeneralComponentStyle<HtmlWrapperStyle>>;
  displayName: string;
  events?: undefined;
  id: string;
  parentComponentId: string;
  properties: HtmlProperties;
  type: ComponentRefactorComponentType.HTML;
}
export interface Image {
  design?: ComponentDesign<GeneralComponentStyle<ImageWrapperStyle>>;
  displayName: string;
  events?: ImageEvents;
  id: string;
  parentComponentId: string;
  properties: ImageProperties;
  type: ComponentRefactorComponentType.IMAGE;
}
export interface Lottie {
  design?: ComponentDesign<GeneralComponentStyle<LottieWrapperStyle>>;
  displayName: string;
  events?: LottieEvents;
  id: string;
  parentComponentId: string;
  properties: LottieProperties;
  type: ComponentRefactorComponentType.LOTTIE;
}
export interface LottieProgressBar {
  design?: ComponentDesign<GeneralComponentStyle<LottieProgressBarWrapperStyle>>;
  displayName: string;
  events?: LottieProgressBarEvents;
  id: string;
  parentComponentId: string;
  properties: LottieProgressBarProperties;
  type: ComponentRefactorComponentType.LOTTIE_PROGRESS_BAR;
}
export interface MapMarker {
  design?: ComponentDesign<GeneralComponentStyle<MapMarkerWrapperStyle>>;
  displayName: string;
  events?: MapMarkerEvents;
  id: string;
  parentComponentId: string;
  properties: MapMarkerProperties;
  type: ComponentRefactorComponentType.MAP_MARKER;
}
export interface ProgressBar {
  design?: ComponentDesign<ProgressBarStyles>;
  displayName: string;
  events?: ProgressBarEvents;
  id: string;
  parentComponentId: string;
  properties: ProgressBarProperties;
  type: ComponentRefactorComponentType.PROGRESS_BAR;
}
export interface RichText {
  design?: ComponentDesign<GeneralComponentStyle<RichTextWrapperStyle>>;
  displayName: string;
  events?: RichTextEvents;
  id: string;
  parentComponentId: string;
  properties: RichTextProperties;
  type: ComponentRefactorComponentType.RICH_TEXT;
}
export interface Text {
  design?: ComponentDesign<TextStyles>;
  displayName: string;
  events?: TextEvents;
  id: string;
  parentComponentId: string;
  properties: TextProperties;
  type: ComponentRefactorComponentType.TEXT;
}
export interface Video {
  design?: ComponentDesign<GeneralComponentStyle<VideoWrapperStyle>>;
  displayName: string;
  events?: VideoEvents;
  id: string;
  parentComponentId: string;
  properties: VideoProperties;
  type: ComponentRefactorComponentType.VIDEO;
}
export interface WechatNavigationBar {
  design?: ComponentDesign<GeneralComponentStyle<WechatNavigationBarWrapperStyle>>;
  displayName: string;
  events?: undefined;
  id: string;
  parentComponentId: string;
  properties: WechatNavigationBarProperties;
  type: ComponentRefactorComponentType.WECHAT_NAVIGATION_BAR;
}
export interface WechatOfficialAccount {
  design?: ComponentDesign<GeneralComponentStyle<WechatOfficialAccountWrapperStyle>>;
  displayName: string;
  events?: undefined;
  id: string;
  parentComponentId: string;
  properties?: undefined;
  type: ComponentRefactorComponentType.WECHAT_OFFICIAL_ACCOUNT;
}
export interface CalendarMeta {
  applicablePlatforms: Platform[];
  componentFrame: ComponentFrame;
  componentFrameMinSize?: ComponentSize;
  componentHidden: boolean;
  dataAttributes: CalendarAttributes;
  interactionPropertyRecord: { [key in InteractionType]?: InteractionProperty };
  interactionRecord: Record<string, Interaction>;
  isFloating: boolean;
  layout?: ComponentLayout;
  layoutEnabled: boolean;
  mRef: string;
  name: string;
  overridePropertyRecord: Record<string, OverrideRecord>;
  parentMRef: string;
  relatedMRefs: string[];
  type: ComponentType.CALENDER;
  variableTable: Record<string, Variable>;
  variantRecord?: Record<string, InteractionProperty>;
  verticalLayout?: ComponentVerticalLayout;
}
export interface DataPickerMeta {
  applicablePlatforms: Platform[];
  childMRefs: string[];
  componentFrame: ComponentFrame;
  componentFrameMinSize?: ComponentSize;
  componentHidden: boolean;
  dataAttributes: DataPickerAttributes;
  dataPathComponents?: PathComponent[];
  interactionPropertyRecord: { [key in InteractionType]?: InteractionProperty };
  interactionRecord: Record<string, Interaction>;
  isAdaptive: boolean;
  isFloating: boolean;
  itemVariableTable: Record<string, ItemVariable>;
  layout?: ComponentLayout;
  layoutEnabled: boolean;
  listDataAccessMode: ListDataAccessMode;
  mRef: string;
  name: string;
  overridePropertyRecord: Record<string, OverrideRecord>;
  parentMRef: string;
  queries: ZQuery[];
  relatedMRefs: string[];
  thirdPartyQueries: ThirdPartyQuery[];
  type: ComponentType.DATA_PICKER;
  variableTable: Record<string, Variable>;
  variantRecord?: Record<string, InteractionProperty>;
  verticalLayout?: ComponentVerticalLayout;
}
export interface DataSelectorMeta {
  applicablePlatforms: Platform[];
  childMRefs: string[];
  componentFrame: ComponentFrame;
  componentFrameMinSize?: ComponentSize;
  componentHidden: boolean;
  dataAttributes: DataSelectorAttributes;
  dataPathComponents?: PathComponent[];
  interactionPropertyRecord: { [key in InteractionType]?: InteractionProperty };
  interactionRecord: Record<string, Interaction>;
  isAdaptive: boolean;
  isFloating: boolean;
  itemVariableTable: Record<string, ItemVariable>;
  layout?: ComponentLayout;
  layoutEnabled: boolean;
  listDataAccessMode: ListDataAccessMode;
  mRef: string;
  name: string;
  overridePropertyRecord: Record<string, OverrideRecord>;
  parentMRef: string;
  queries: ZQuery[];
  relatedMRefs: string[];
  thirdPartyQueries: ThirdPartyQuery[];
  type: ComponentType.DATA_SELECTOR;
  variableTable: Record<string, Variable>;
  variantRecord?: Record<string, InteractionProperty>;
  verticalLayout?: ComponentVerticalLayout;
}
export interface DateTimePickerMeta {
  applicablePlatforms: Platform[];
  componentFrame: ComponentFrame;
  componentFrameMinSize?: ComponentSize;
  componentHidden: boolean;
  dataAttributes: DateTimePickerAttributes;
  interactionPropertyRecord: { [key in InteractionType]?: InteractionProperty };
  interactionRecord: Record<string, Interaction>;
  isFloating: boolean;
  layout?: ComponentLayout;
  layoutEnabled: boolean;
  mRef: string;
  name: string;
  overridePropertyRecord: Record<string, OverrideRecord>;
  parentMRef: string;
  relatedMRefs: string[];
  type: ComponentType.DATE_TIME_PICKER;
  variableTable: Record<string, Variable>;
  variantRecord?: Record<string, InteractionProperty>;
  verticalLayout?: ComponentVerticalLayout;
}
export interface InputMeta {
  applicablePlatforms: Platform[];
  componentFrame: ComponentFrame;
  componentFrameMinSize?: ComponentSize;
  componentHidden: boolean;
  dataAttributes: InputAttributes;
  interactionPropertyRecord: { [key in InteractionType]?: InteractionProperty };
  interactionRecord: Record<string, Interaction>;
  isFloating: boolean;
  layout?: ComponentLayout;
  layoutEnabled: boolean;
  mRef: string;
  name: string;
  overridePropertyRecord: Record<string, OverrideRecord>;
  parentMRef: string;
  relatedMRefs: string[];
  type: ComponentType.INPUT;
  variableTable: Record<string, Variable>;
  variantRecord?: Record<string, InteractionProperty>;
  verticalLayout?: ComponentVerticalLayout;
}
export interface SwitchMeta {
  applicablePlatforms: Platform[];
  componentFrame: ComponentFrame;
  componentFrameMinSize?: ComponentSize;
  componentHidden: boolean;
  dataAttributes: SwitchAttributes;
  interactionPropertyRecord: { [key in InteractionType]?: InteractionProperty };
  interactionRecord: Record<string, Interaction>;
  isFloating: boolean;
  layout?: ComponentLayout;
  layoutEnabled: boolean;
  mRef: string;
  name: string;
  overridePropertyRecord: Record<string, OverrideRecord>;
  parentMRef: string;
  relatedMRefs: string[];
  type: ComponentType.SWITCH;
  variableTable: Record<string, Variable>;
  variantRecord?: Record<string, InteractionProperty>;
  verticalLayout?: ComponentVerticalLayout;
}
export interface BlankContainerMeta {
  applicablePlatforms: Platform[];
  childMRefs: string[];
  componentFrame: ComponentFrame;
  componentFrameMinSize?: ComponentSize;
  componentHidden: boolean;
  dataAttributes: BlankContainerAttributes;
  dataPathComponents?: PathComponent[];
  interactionPropertyRecord: { [key in InteractionType]?: InteractionProperty };
  interactionRecord: Record<string, Interaction>;
  isAdaptive: boolean;
  isFloating: boolean;
  itemVariableTable: Record<string, ItemVariable>;
  layout?: ComponentLayout;
  layoutEnabled: boolean;
  listDataAccessMode: ListDataAccessMode;
  mRef: string;
  name: string;
  overridePropertyRecord: Record<string, OverrideRecord>;
  parentMRef: string;
  parentType?: ComponentType;
  queries: ZQuery[];
  relatedMRefs: string[];
  thirdPartyQueries: ThirdPartyQuery[];
  type: ComponentType.BLANK_CONTAINER;
  variableTable: Record<string, Variable>;
  variantRecord?: Record<string, InteractionProperty>;
  verticalLayout?: ComponentVerticalLayout;
}
export interface ButtonMeta {
  applicablePlatforms: Platform[];
  componentFrame: ComponentFrame;
  componentFrameMinSize?: ComponentSize;
  componentHidden: boolean;
  dataAttributes: ButtonAttributes;
  interactionPropertyRecord: { [key in InteractionType]?: InteractionProperty };
  interactionRecord: Record<string, Interaction>;
  isFloating: boolean;
  layout?: ComponentLayout;
  layoutEnabled: boolean;
  mRef: string;
  name: string;
  overridePropertyRecord: Record<string, OverrideRecord>;
  parentMRef: string;
  relatedMRefs: string[];
  type: ComponentType.BUTTON;
  variableTable: Record<string, Variable>;
  variantRecord?: Record<string, InteractionProperty>;
  verticalLayout?: ComponentVerticalLayout;
}
export interface ConditionalContainerChildMeta {
  applicablePlatforms: Platform[];
  childMRefs: string[];
  componentFrame: ComponentFrame;
  componentFrameMinSize?: ComponentSize;
  componentHidden: boolean;
  dataAttributes: ConditionalContainerChildAttributes;
  dataPathComponents?: PathComponent[];
  initIfCondition: BoolExp<ConditionBoolExp>;
  interactionPropertyRecord: { [key in InteractionType]?: InteractionProperty };
  interactionRecord: Record<string, Interaction>;
  isAdaptive: boolean;
  isDefaultCase: boolean;
  isFloating: boolean;
  itemVariableTable: Record<string, ItemVariable>;
  layout?: ComponentLayout;
  layoutEnabled: boolean;
  listDataAccessMode: ListDataAccessMode;
  mRef: string;
  name: string;
  overridePropertyRecord: Record<string, OverrideRecord>;
  parentMRef: string;
  queries: ZQuery[];
  relatedMRefs: string[];
  thirdPartyQueries: ThirdPartyQuery[];
  type: ComponentType.CONDITIONAL_CONTAINER_CHILD;
  variableTable: Record<string, Variable>;
  variantRecord?: Record<string, InteractionProperty>;
  verticalLayout?: ComponentVerticalLayout;
}
export interface CustomViewMeta {
  applicablePlatforms: Platform[];
  childMRefs: string[];
  componentFrame: ComponentFrame;
  componentFrameMinSize?: ComponentSize;
  componentHidden: boolean;
  dataAttributes: CustomViewAttributes;
  dataPathComponents?: PathComponent[];
  interactionPropertyRecord: { [key in InteractionType]?: InteractionProperty };
  interactionRecord: Record<string, Interaction>;
  isAdaptive: boolean;
  isFloating: boolean;
  itemVariableTable: Record<string, ItemVariable>;
  layout?: ComponentLayout;
  layoutEnabled: boolean;
  listDataAccessMode: ListDataAccessMode;
  mRef: string;
  name: string;
  overridePropertyRecord: Record<string, OverrideRecord>;
  parentMRef: string;
  queries: ZQuery[];
  relatedMRefs: string[];
  stickyMarginTop?: number;
  stickyMode?: string;
  thirdPartyQueries: ThirdPartyQuery[];
  type: ComponentType.CUSTOM_VIEW;
  variableTable: Record<string, Variable>;
  variantRecord?: Record<string, InteractionProperty>;
  verticalLayout?: ComponentVerticalLayout;
}
export interface IconMeta {
  applicablePlatforms: Platform[];
  componentFrame: ComponentFrame;
  componentFrameMinSize?: ComponentSize;
  componentHidden: boolean;
  dataAttributes: IconAttributes;
  interactionPropertyRecord: { [key in InteractionType]?: InteractionProperty };
  interactionRecord: Record<string, Interaction>;
  isFloating: boolean;
  layout?: ComponentLayout;
  layoutEnabled: boolean;
  mRef: string;
  name: string;
  overridePropertyRecord: Record<string, OverrideRecord>;
  parentMRef: string;
  relatedMRefs: string[];
  type: ComponentType.ICON;
  variableTable: Record<string, Variable>;
  variantRecord?: Record<string, InteractionProperty>;
  verticalLayout?: ComponentVerticalLayout;
}
export interface ImageMeta {
  applicablePlatforms: Platform[];
  componentFrame: ComponentFrame;
  componentFrameMinSize?: ComponentSize;
  componentHidden: boolean;
  dataAttributes: ImageAttributes;
  interactionPropertyRecord: { [key in InteractionType]?: InteractionProperty };
  interactionRecord: Record<string, Interaction>;
  isFloating: boolean;
  layout?: ComponentLayout;
  layoutEnabled: boolean;
  mRef: string;
  name: string;
  overridePropertyRecord: Record<string, OverrideRecord>;
  parentMRef: string;
  relatedMRefs: string[];
  type: ComponentType.IMAGE;
  variableTable: Record<string, Variable>;
  variantRecord?: Record<string, InteractionProperty>;
  verticalLayout?: ComponentVerticalLayout;
}
export interface MapViewMeta {
  applicablePlatforms: Platform[];
  childMRefs: string[];
  componentFrame: ComponentFrame;
  componentFrameMinSize?: ComponentSize;
  componentHidden: boolean;
  dataAttributes: MapViewAttributes;
  dataPathComponents?: PathComponent[];
  interactionPropertyRecord: { [key in InteractionType]?: InteractionProperty };
  interactionRecord: Record<string, Interaction>;
  isAdaptive: boolean;
  isFloating: boolean;
  itemVariableTable: Record<string, ItemVariable>;
  layout?: ComponentLayout;
  layoutEnabled: boolean;
  listDataAccessMode: ListDataAccessMode;
  mRef: string;
  name: string;
  overridePropertyRecord: Record<string, OverrideRecord>;
  parentMRef: string;
  queries: ZQuery[];
  relatedMRefs: string[];
  thirdPartyQueries: ThirdPartyQuery[];
  type: ComponentType.MAP_VIEW;
  variableTable: Record<string, Variable>;
  variantRecord?: Record<string, InteractionProperty>;
  verticalLayout?: ComponentVerticalLayout;
}
export interface ModalViewMeta {
  applicablePlatforms: Platform[];
  childMRefs: string[];
  componentFrame: ComponentFrame;
  componentFrameMinSize?: ComponentSize;
  componentHidden: boolean;
  dataAttributes: ModalViewAttributes;
  dataPathComponents?: PathComponent[];
  interactionPropertyRecord: { [key in InteractionType]?: InteractionProperty };
  interactionRecord: Record<string, Interaction>;
  isAdaptive: boolean;
  isFloating: boolean;
  itemVariableTable: Record<string, ItemVariable>;
  layout?: ComponentLayout;
  layoutEnabled: boolean;
  listDataAccessMode: ListDataAccessMode;
  mRef: string;
  name: string;
  overridePropertyRecord: Record<string, OverrideRecord>;
  parentMRef: string;
  queries: ZQuery[];
  relatedMRefs: string[];
  thirdPartyQueries: ThirdPartyQuery[];
  type: ComponentType.MODAL_VIEW;
  variableTable: Record<string, Variable>;
  variantRecord?: Record<string, InteractionProperty>;
  verticalLayout?: ComponentVerticalLayout;
}
export interface TextMeta {
  applicablePlatforms: Platform[];
  componentFrame: ComponentFrame;
  componentFrameMinSize?: ComponentSize;
  componentHidden: boolean;
  dataAttributes: TextAttributes;
  interactionPropertyRecord: { [key in InteractionType]?: InteractionProperty };
  interactionRecord: Record<string, Interaction>;
  isFloating: boolean;
  layout?: ComponentLayout;
  layoutEnabled: boolean;
  mRef: string;
  name: string;
  overridePropertyRecord: Record<string, OverrideRecord>;
  parentMRef: string;
  relatedMRefs: string[];
  type: ComponentType.TEXT;
  variableTable: Record<string, Variable>;
  variantRecord?: Record<string, InteractionProperty>;
  verticalLayout?: ComponentVerticalLayout;
}
export interface CustomListMeta {
  applicablePlatforms: Platform[];
  childMRefs: string[];
  componentFrame: ComponentFrame;
  componentFrameMinSize?: ComponentSize;
  componentHidden: boolean;
  dataAttributes: CustomListAttributes;
  dataPathComponents?: PathComponent[];
  interactionPropertyRecord: { [key in InteractionType]?: InteractionProperty };
  interactionRecord: Record<string, Interaction>;
  isAdaptive: boolean;
  isFloating: boolean;
  itemVariableTable: Record<string, ItemVariable>;
  layout?: ComponentLayout;
  layoutEnabled: boolean;
  listDataAccessMode: ListDataAccessMode;
  mRef: string;
  name: string;
  overridePropertyRecord: Record<string, OverrideRecord>;
  parentMRef: string;
  queries: ZQuery[];
  relatedMRefs: string[];
  thirdPartyQueries: ThirdPartyQuery[];
  type: ComponentType.CUSTOM_LIST;
  variableTable: Record<string, Variable>;
  variantRecord?: Record<string, InteractionProperty>;
  verticalLayout?: ComponentVerticalLayout;
}
export interface HorizontalListMeta {
  applicablePlatforms: Platform[];
  childMRefs: string[];
  componentFrame: ComponentFrame;
  componentFrameMinSize?: ComponentSize;
  componentHidden: boolean;
  dataAttributes: HorizontalListAttributes;
  dataPathComponents?: PathComponent[];
  interactionPropertyRecord: { [key in InteractionType]?: InteractionProperty };
  interactionRecord: Record<string, Interaction>;
  isAdaptive: boolean;
  isFloating: boolean;
  itemVariableTable: Record<string, ItemVariable>;
  layout?: ComponentLayout;
  layoutEnabled: boolean;
  listDataAccessMode: ListDataAccessMode;
  mRef: string;
  name: string;
  overridePropertyRecord: Record<string, OverrideRecord>;
  parentMRef: string;
  queries: ZQuery[];
  relatedMRefs: string[];
  thirdPartyQueries: ThirdPartyQuery[];
  type: ComponentType.HORIZONTAL_LIST;
  variableTable: Record<string, Variable>;
  variantRecord?: Record<string, InteractionProperty>;
  verticalLayout?: ComponentVerticalLayout;
}
export interface CustomMultiImagePickerMeta {
  applicablePlatforms: Platform[];
  childMRefs: string[];
  componentFrame: ComponentFrame;
  componentFrameMinSize?: ComponentSize;
  componentHidden: boolean;
  dataAttributes: CustomMultiImagePickerAttributes;
  dataPathComponents?: PathComponent[];
  interactionPropertyRecord: { [key in InteractionType]?: InteractionProperty };
  interactionRecord: Record<string, Interaction>;
  isAdaptive: boolean;
  isFloating: boolean;
  itemVariableTable: Record<string, ItemVariable>;
  layout?: ComponentLayout;
  layoutEnabled: boolean;
  listDataAccessMode: ListDataAccessMode;
  mRef: string;
  name: string;
  overridePropertyRecord: Record<string, OverrideRecord>;
  parentMRef: string;
  queries: ZQuery[];
  relatedMRefs: string[];
  thirdPartyQueries: ThirdPartyQuery[];
  type: ComponentType.CUSTOM_MULTI_IMAGE_PICKER;
  variableTable: Record<string, Variable>;
  variantRecord?: Record<string, InteractionProperty>;
  verticalLayout?: ComponentVerticalLayout;
}
export interface PageMeta {
  applicablePlatforms: Platform[];
  childMRefs: string[];
  componentFrame: ComponentFrame;
  componentFrameMinSize?: ComponentSize;
  componentHidden: boolean;
  dataAttributes: DraggableScreenAttributes;
  dataPathComponents?: PathComponent[];
  htmlPagePath?: string;
  interactionPropertyRecord: { [key in InteractionType]?: InteractionProperty };
  interactionRecord: Record<string, Interaction>;
  isAdaptive: boolean;
  isFloating: boolean;
  itemVariableTable: Record<string, ItemVariable>;
  layout?: ComponentLayout;
  layoutEnabled: boolean;
  listDataAccessMode: ListDataAccessMode;
  mRef: string;
  name: string;
  overridePropertyRecord: Record<string, OverrideRecord>;
  pageVariableTable: Record<string, Variable>;
  parentMRef: string;
  pathVariableTable: Record<string, Variable>;
  queries: ZQuery[];
  relatedMRefs: string[];
  thirdPartyQueries: ThirdPartyQuery[];
  type: ComponentType.MOBILE_PAGE | ComponentType.WEB_PAGE;
  variableTable: Record<string, Variable>;
  variantRecord?: Record<string, InteractionProperty>;
  verticalLayout?: ComponentVerticalLayout;
}
export interface SelectViewMeta {
  applicablePlatforms: Platform[];
  childMRefs: string[];
  componentFrame: ComponentFrame;
  componentFrameMinSize?: ComponentSize;
  componentHidden: boolean;
  dataAttributes: SelectViewAttributes;
  dataPathComponents?: PathComponent[];
  interactionPropertyRecord: { [key in InteractionType]?: InteractionProperty };
  interactionRecord: Record<string, Interaction>;
  isAdaptive: boolean;
  isFloating: boolean;
  itemVariableTable: Record<string, ItemVariable>;
  layout?: ComponentLayout;
  layoutEnabled: boolean;
  listDataAccessMode: ListDataAccessMode;
  mRef: string;
  name: string;
  overridePropertyRecord: Record<string, OverrideRecord>;
  parentMRef: string;
  queries: ZQuery[];
  relatedMRefs: string[];
  thirdPartyQueries: ThirdPartyQuery[];
  type: ComponentType.SELECT_VIEW;
  variableTable: Record<string, Variable>;
  variantRecord?: Record<string, InteractionProperty>;
  verticalLayout?: ComponentVerticalLayout;
}
export interface ConditionalContainerMeta {
  applicablePlatforms: Platform[];
  childMRefs: string[];
  componentFrame: ComponentFrame;
  componentFrameMinSize?: ComponentSize;
  componentHidden: boolean;
  dataAttributes: ConditionalContainerAttributes;
  dataPathComponents?: PathComponent[];
  interactionPropertyRecord: { [key in InteractionType]?: InteractionProperty };
  interactionRecord: Record<string, Interaction>;
  isAdaptive: boolean;
  isFloating: boolean;
  itemVariableTable: Record<string, ItemVariable>;
  layout?: ComponentLayout;
  layoutEnabled: boolean;
  listDataAccessMode: ListDataAccessMode;
  mRef: string;
  name: string;
  overridePropertyRecord: Record<string, OverrideRecord>;
  parentMRef: string;
  queries: ZQuery[];
  relatedMRefs: string[];
  thirdPartyQueries: ThirdPartyQuery[];
  type: ComponentType.CONDITIONAL_CONTAINER;
  variableTable: Record<string, Variable>;
  variantRecord?: Record<string, InteractionProperty>;
  verticalLayout?: ComponentVerticalLayout;
}
export interface TabViewMeta {
  applicablePlatforms: Platform[];
  childMRefs: string[];
  componentFrame: ComponentFrame;
  componentFrameMinSize?: ComponentSize;
  componentHidden: boolean;
  dataAttributes: TabViewAttributes;
  dataPathComponents?: PathComponent[];
  interactionPropertyRecord: { [key in InteractionType]?: InteractionProperty };
  interactionRecord: Record<string, Interaction>;
  isAdaptive: boolean;
  isFloating: boolean;
  itemVariableTable: Record<string, ItemVariable>;
  layout?: ComponentLayout;
  layoutEnabled: boolean;
  listDataAccessMode: ListDataAccessMode;
  mRef: string;
  name: string;
  overridePropertyRecord: Record<string, OverrideRecord>;
  parentMRef: string;
  queries: ZQuery[];
  relatedMRefs: string[];
  thirdPartyQueries: ThirdPartyQuery[];
  type: ComponentType.TAB_VIEW;
  variableTable: Record<string, Variable>;
  variantRecord?: Record<string, InteractionProperty>;
  verticalLayout?: ComponentVerticalLayout;
}
export interface GeneralContainerMeta {
  applicablePlatforms: Platform[];
  childMRefs: string[];
  componentFrame: ComponentFrame;
  componentFrameMinSize?: ComponentSize;
  componentHidden: boolean;
  dataAttributes: null;
  dataPathComponents?: PathComponent[];
  interactionPropertyRecord: { [key in InteractionType]?: InteractionProperty };
  interactionRecord: Record<string, Interaction>;
  isAdaptive: boolean;
  isFloating: boolean;
  itemVariableTable: Record<string, ItemVariable>;
  layout?: ComponentLayout;
  layoutEnabled: boolean;
  listDataAccessMode: ListDataAccessMode;
  mRef: string;
  name: string;
  overridePropertyRecord: Record<string, OverrideRecord>;
  parentMRef: string;
  queries: ZQuery[];
  relatedMRefs: string[];
  thirdPartyQueries: ThirdPartyQuery[];
  type:
    | ComponentType.REUSABLE_COMPONENT
    | ComponentType.WECHAT_OFFICIAL_ACCOUNT
    | ComponentType.SIMPLE_LIST;
  variableTable: Record<string, Variable>;
  variantRecord?: Record<string, InteractionProperty>;
  verticalLayout?: ComponentVerticalLayout;
}
export interface ScrollViewMeta {
  applicablePlatforms: Platform[];
  childMRefs: string[];
  componentFrame: ComponentFrame;
  componentFrameMinSize?: ComponentSize;
  componentHidden: boolean;
  dataAttributes: ScrollViewAttributes;
  dataPathComponents?: PathComponent[];
  interactionPropertyRecord: { [key in InteractionType]?: InteractionProperty };
  interactionRecord: Record<string, Interaction>;
  isAdaptive: boolean;
  isFloating: boolean;
  itemVariableTable: Record<string, ItemVariable>;
  layout?: ComponentLayout;
  layoutEnabled: boolean;
  listDataAccessMode: ListDataAccessMode;
  mRef: string;
  name: string;
  overridePropertyRecord: Record<string, OverrideRecord>;
  parentMRef: string;
  queries: ZQuery[];
  relatedMRefs: string[];
  thirdPartyQueries: ThirdPartyQuery[];
  type: ComponentType.SCROLL_VIEW;
  variableTable: Record<string, Variable>;
  variantRecord?: Record<string, InteractionProperty>;
  verticalLayout?: ComponentVerticalLayout;
}
export interface CountDownMeta {
  applicablePlatforms: Platform[];
  componentFrame: ComponentFrame;
  componentFrameMinSize?: ComponentSize;
  componentHidden: boolean;
  dataAttributes: CountDownAttributes;
  interactionPropertyRecord: { [key in InteractionType]?: InteractionProperty };
  interactionRecord: Record<string, Interaction>;
  isFloating: boolean;
  layout?: ComponentLayout;
  layoutEnabled: boolean;
  mRef: string;
  name: string;
  overridePropertyRecord: Record<string, OverrideRecord>;
  parentMRef: string;
  relatedMRefs: string[];
  type: ComponentType.COUNT_DOWN;
  variableTable: Record<string, Variable>;
  variantRecord?: Record<string, InteractionProperty>;
  verticalLayout?: ComponentVerticalLayout;
}
export interface ImagePickerMeta {
  applicablePlatforms: Platform[];
  componentFrame: ComponentFrame;
  componentFrameMinSize?: ComponentSize;
  componentHidden: boolean;
  dataAttributes: ImagePickerAttributes;
  interactionPropertyRecord: { [key in InteractionType]?: InteractionProperty };
  interactionRecord: Record<string, Interaction>;
  isFloating: boolean;
  layout?: ComponentLayout;
  layoutEnabled: boolean;
  mRef: string;
  name: string;
  overridePropertyRecord: Record<string, OverrideRecord>;
  parentMRef: string;
  relatedMRefs: string[];
  type: ComponentType.IMAGE_PICKER;
  variableTable: Record<string, Variable>;
  variantRecord?: Record<string, InteractionProperty>;
  verticalLayout?: ComponentVerticalLayout;
}
export interface MultiImageMeta {
  applicablePlatforms: Platform[];
  componentFrame: ComponentFrame;
  componentFrameMinSize?: ComponentSize;
  componentHidden: boolean;
  dataAttributes: MultiImageAttributes;
  interactionPropertyRecord: { [key in InteractionType]?: InteractionProperty };
  interactionRecord: Record<string, Interaction>;
  isFloating: boolean;
  layout?: ComponentLayout;
  layoutEnabled: boolean;
  mRef: string;
  name: string;
  overridePropertyRecord: Record<string, OverrideRecord>;
  parentMRef: string;
  relatedMRefs: string[];
  type: ComponentType.MULTI_IMAGE;
  variableTable: Record<string, Variable>;
  variantRecord?: Record<string, InteractionProperty>;
  verticalLayout?: ComponentVerticalLayout;
}
export interface MultiImagePickerMeta {
  applicablePlatforms: Platform[];
  componentFrame: ComponentFrame;
  componentFrameMinSize?: ComponentSize;
  componentHidden: boolean;
  dataAttributes: MultiImagePickerAttributes;
  interactionPropertyRecord: { [key in InteractionType]?: InteractionProperty };
  interactionRecord: Record<string, Interaction>;
  isFloating: boolean;
  layout?: ComponentLayout;
  layoutEnabled: boolean;
  mRef: string;
  name: string;
  overridePropertyRecord: Record<string, OverrideRecord>;
  parentMRef: string;
  relatedMRefs: string[];
  type: ComponentType.MULTI_IMAGE_PICKER;
  variableTable: Record<string, Variable>;
  variantRecord?: Record<string, InteractionProperty>;
  verticalLayout?: ComponentVerticalLayout;
}
export interface NumberInputMeta {
  applicablePlatforms: Platform[];
  componentFrame: ComponentFrame;
  componentFrameMinSize?: ComponentSize;
  componentHidden: boolean;
  dataAttributes: NumberInputAttributes;
  interactionPropertyRecord: { [key in InteractionType]?: InteractionProperty };
  interactionRecord: Record<string, Interaction>;
  isFloating: boolean;
  layout?: ComponentLayout;
  layoutEnabled: boolean;
  mRef: string;
  name: string;
  overridePropertyRecord: Record<string, OverrideRecord>;
  parentMRef: string;
  relatedMRefs: string[];
  type: ComponentType.NUMBER_INPUT;
  variableTable: Record<string, Variable>;
  variantRecord?: Record<string, InteractionProperty>;
  verticalLayout?: ComponentVerticalLayout;
}
export interface RichTextEditorMeta {
  applicablePlatforms: Platform[];
  componentFrame: ComponentFrame;
  componentFrameMinSize?: ComponentSize;
  componentHidden: boolean;
  dataAttributes: RichTextEditorAttributes;
  interactionPropertyRecord: { [key in InteractionType]?: InteractionProperty };
  interactionRecord: Record<string, Interaction>;
  isFloating: boolean;
  layout?: ComponentLayout;
  layoutEnabled: boolean;
  mRef: string;
  name: string;
  overridePropertyRecord: Record<string, OverrideRecord>;
  parentMRef: string;
  relatedMRefs: string[];
  type: ComponentType.RICH_TEXT_EDITOR;
  variableTable: Record<string, Variable>;
  variantRecord?: Record<string, InteractionProperty>;
  verticalLayout?: ComponentVerticalLayout;
}
export interface VideoMeta {
  applicablePlatforms: Platform[];
  componentFrame: ComponentFrame;
  componentFrameMinSize?: ComponentSize;
  componentHidden: boolean;
  dataAttributes: VideoAttributes;
  interactionPropertyRecord: { [key in InteractionType]?: InteractionProperty };
  interactionRecord: Record<string, Interaction>;
  isFloating: boolean;
  layout?: ComponentLayout;
  layoutEnabled: boolean;
  mRef: string;
  name: string;
  overridePropertyRecord: Record<string, OverrideRecord>;
  parentMRef: string;
  relatedMRefs: string[];
  type: ComponentType.VIDEO;
  variableTable: Record<string, Variable>;
  variantRecord?: Record<string, InteractionProperty>;
  verticalLayout?: ComponentVerticalLayout;
}
export interface VideoPickerMeta {
  applicablePlatforms: Platform[];
  componentFrame: ComponentFrame;
  componentFrameMinSize?: ComponentSize;
  componentHidden: boolean;
  dataAttributes: VideoPickerAttributes;
  interactionPropertyRecord: { [key in InteractionType]?: InteractionProperty };
  interactionRecord: Record<string, Interaction>;
  isFloating: boolean;
  layout?: ComponentLayout;
  layoutEnabled: boolean;
  mRef: string;
  name: string;
  overridePropertyRecord: Record<string, OverrideRecord>;
  parentMRef: string;
  relatedMRefs: string[];
  type: ComponentType.VIDEO_PICKER;
  variableTable: Record<string, Variable>;
  variantRecord?: Record<string, InteractionProperty>;
  verticalLayout?: ComponentVerticalLayout;
}
export interface LottieMeta {
  applicablePlatforms: Platform[];
  componentFrame: ComponentFrame;
  componentFrameMinSize?: ComponentSize;
  componentHidden: boolean;
  dataAttributes: LottieAttributes;
  interactionPropertyRecord: { [key in InteractionType]?: InteractionProperty };
  interactionRecord: Record<string, Interaction>;
  isFloating: boolean;
  layout?: ComponentLayout;
  layoutEnabled: boolean;
  mRef: string;
  name: string;
  overridePropertyRecord: Record<string, OverrideRecord>;
  parentMRef: string;
  relatedMRefs: string[];
  type: ComponentType.LOTTIE;
  variableTable: Record<string, Variable>;
  variantRecord?: Record<string, InteractionProperty>;
  verticalLayout?: ComponentVerticalLayout;
}
export interface MixImagePickerMeta {
  applicablePlatforms: Platform[];
  componentFrame: ComponentFrame;
  componentFrameMinSize?: ComponentSize;
  componentHidden: boolean;
  dataAttributes: MixImagePickerAttributes;
  interactionPropertyRecord: { [key in InteractionType]?: InteractionProperty };
  interactionRecord: Record<string, Interaction>;
  isFloating: boolean;
  layout?: ComponentLayout;
  layoutEnabled: boolean;
  mRef: string;
  name: string;
  overridePropertyRecord: Record<string, OverrideRecord>;
  parentMRef: string;
  relatedMRefs: string[];
  type: ComponentType.MIX_IMAGE_PICKER;
  variableTable: Record<string, Variable>;
  variantRecord?: Record<string, InteractionProperty>;
  verticalLayout?: ComponentVerticalLayout;
}
export interface ProgressBarMeta {
  applicablePlatforms: Platform[];
  componentFrame: ComponentFrame;
  componentFrameMinSize?: ComponentSize;
  componentHidden: boolean;
  dataAttributes: ProgressBarAttributes;
  interactionPropertyRecord: { [key in InteractionType]?: InteractionProperty };
  interactionRecord: Record<string, Interaction>;
  isFloating: boolean;
  layout?: ComponentLayout;
  layoutEnabled: boolean;
  mRef: string;
  name: string;
  overridePropertyRecord: Record<string, OverrideRecord>;
  parentMRef: string;
  relatedMRefs: string[];
  type: ComponentType.PROGRESS_BAR;
  variableTable: Record<string, Variable>;
  variantRecord?: Record<string, InteractionProperty>;
  verticalLayout?: ComponentVerticalLayout;
}
export interface SimpleProgressBarMeta {
  applicablePlatforms: Platform[];
  componentFrame: ComponentFrame;
  componentFrameMinSize?: ComponentSize;
  componentHidden: boolean;
  dataAttributes: SimpleProgressBarAttributes;
  interactionPropertyRecord: { [key in InteractionType]?: InteractionProperty };
  interactionRecord: Record<string, Interaction>;
  isFloating: boolean;
  layout?: ComponentLayout;
  layoutEnabled: boolean;
  mRef: string;
  name: string;
  overridePropertyRecord: Record<string, OverrideRecord>;
  parentMRef: string;
  relatedMRefs: string[];
  type: ComponentType.SIMPLE_PROGRESS_BAR;
  variableTable: Record<string, Variable>;
  variantRecord?: Record<string, InteractionProperty>;
  verticalLayout?: ComponentVerticalLayout;
}
export interface RichTextMeta {
  applicablePlatforms: Platform[];
  componentFrame: ComponentFrame;
  componentFrameMinSize?: ComponentSize;
  componentHidden: boolean;
  dataAttributes: RichTextAttributes;
  interactionPropertyRecord: { [key in InteractionType]?: InteractionProperty };
  interactionRecord: Record<string, Interaction>;
  isFloating: boolean;
  layout?: ComponentLayout;
  layoutEnabled: boolean;
  mRef: string;
  name: string;
  overridePropertyRecord: Record<string, OverrideRecord>;
  parentMRef: string;
  relatedMRefs: string[];
  type: ComponentType.RICH_TEXT;
  variableTable: Record<string, Variable>;
  variantRecord?: Record<string, InteractionProperty>;
  verticalLayout?: ComponentVerticalLayout;
}
export interface WechatNavigationBarMeta {
  applicablePlatforms: Platform[];
  componentFrame: ComponentFrame;
  componentFrameMinSize?: ComponentSize;
  componentHidden: boolean;
  dataAttributes: WechatNavigationBarAttributes;
  interactionPropertyRecord: { [key in InteractionType]?: InteractionProperty };
  interactionRecord: Record<string, Interaction>;
  isFloating: boolean;
  layout?: ComponentLayout;
  layoutEnabled: boolean;
  mRef: string;
  name: string;
  overridePropertyRecord: Record<string, OverrideRecord>;
  parentMRef: string;
  relatedMRefs: string[];
  type: ComponentType.WECHAT_NAVIGATION_BAR;
  variableTable: Record<string, Variable>;
  variantRecord?: Record<string, InteractionProperty>;
  verticalLayout?: ComponentVerticalLayout;
}
export interface FilePickerMeta {
  applicablePlatforms: Platform[];
  componentFrame: ComponentFrame;
  componentFrameMinSize?: ComponentSize;
  componentHidden: boolean;
  dataAttributes: FilePickerAttributes;
  interactionPropertyRecord: { [key in InteractionType]?: InteractionProperty };
  interactionRecord: Record<string, Interaction>;
  isFloating: boolean;
  layout?: ComponentLayout;
  layoutEnabled: boolean;
  mRef: string;
  name: string;
  overridePropertyRecord: Record<string, OverrideRecord>;
  parentMRef: string;
  relatedMRefs: string[];
  type: ComponentType.FILE_PICKER;
  variableTable: Record<string, Variable>;
  variantRecord?: Record<string, InteractionProperty>;
  verticalLayout?: ComponentVerticalLayout;
}
export interface AdvertBannerMeta {
  applicablePlatforms: Platform[];
  componentFrame: ComponentFrame;
  componentFrameMinSize?: ComponentSize;
  componentHidden: boolean;
  dataAttributes: AdvertBannerAttributes;
  interactionPropertyRecord: { [key in InteractionType]?: InteractionProperty };
  interactionRecord: Record<string, Interaction>;
  isFloating: boolean;
  layout?: ComponentLayout;
  layoutEnabled: boolean;
  mRef: string;
  name: string;
  overridePropertyRecord: Record<string, OverrideRecord>;
  parentMRef: string;
  relatedMRefs: string[];
  type: ComponentType.ADVERT_BANNER;
  variableTable: Record<string, Variable>;
  variantRecord?: Record<string, InteractionProperty>;
  verticalLayout?: ComponentVerticalLayout;
}
export interface CameraViewMeta {
  applicablePlatforms: Platform[];
  componentFrame: ComponentFrame;
  componentFrameMinSize?: ComponentSize;
  componentHidden: boolean;
  dataAttributes: CameraViewAttributes;
  interactionPropertyRecord: { [key in InteractionType]?: InteractionProperty };
  interactionRecord: Record<string, Interaction>;
  isFloating: boolean;
  layout?: ComponentLayout;
  layoutEnabled: boolean;
  mRef: string;
  name: string;
  overridePropertyRecord: Record<string, OverrideRecord>;
  parentMRef: string;
  relatedMRefs: string[];
  type: ComponentType.CAMERA_VIEW;
  variableTable: Record<string, Variable>;
  variantRecord?: Record<string, InteractionProperty>;
  verticalLayout?: ComponentVerticalLayout;
}
export interface CodeComponentMeta {
  applicablePlatforms: Platform[];
  customComponentConfig: CodeComponentConfig;
  componentFrame: ComponentFrame;
  componentFrameMinSize?: ComponentSize;
  componentHidden: boolean;
  dataAttributes: CodeComponentAttributes;
  interactionPropertyRecord: { [key in InteractionType]?: InteractionProperty };
  interactionRecord: Record<string, Interaction>;
  isFloating: boolean;
  layout?: ComponentLayout;
  layoutEnabled: boolean;
  mRef: string;
  name: string;
  overridePropertyRecord: Record<string, OverrideRecord>;
  parentMRef: string;
  relatedMRefs: string[];
  type: ComponentType.CUSTOM_COMPONENT;
  variableTable: Record<string, Variable>;
  variantRecord?: Record<string, InteractionProperty>;
  verticalLayout?: ComponentVerticalLayout;
}
export interface GeneralComponentMeta {
  applicablePlatforms: Platform[];
  componentFrame: ComponentFrame;
  componentFrameMinSize?: ComponentSize;
  componentHidden: boolean;
  dataAttributes: null;
  interactionPropertyRecord: { [key in InteractionType]?: InteractionProperty };
  interactionRecord: Record<string, Interaction>;
  isFloating: boolean;
  layout?: ComponentLayout;
  layoutEnabled: boolean;
  mRef: string;
  name: string;
  overridePropertyRecord: Record<string, OverrideRecord>;
  parentMRef: string;
  relatedMRefs: string[];
  type:
    | ComponentType.MARKER
    | ComponentType.CAMERA_VIEW
    | ComponentType.PAGING_TOOLBAR
    | ComponentType.INSTANCE_COMPONENT
    | ComponentType.MOBILE_STATUS_BAR
    | ComponentType.SLOT_FOOTER;
  variableTable: Record<string, Variable>;
  variantRecord?: Record<string, InteractionProperty>;
  verticalLayout?: ComponentVerticalLayout;
}
export interface HorizontalLineMeta {
  applicablePlatforms: Platform[];
  componentFrame: ComponentFrame;
  componentFrameMinSize?: ComponentSize;
  componentHidden: boolean;
  dataAttributes: HorizontalLineAttributes;
  interactionPropertyRecord: { [key in InteractionType]?: InteractionProperty };
  interactionRecord: Record<string, Interaction>;
  isFloating: boolean;
  layout?: ComponentLayout;
  layoutEnabled: boolean;
  mRef: string;
  name: string;
  overridePropertyRecord: Record<string, OverrideRecord>;
  parentMRef: string;
  relatedMRefs: string[];
  type: ComponentType.HORIZONTAL_LINE;
  variableTable: Record<string, Variable>;
  variantRecord?: Record<string, InteractionProperty>;
  verticalLayout?: ComponentVerticalLayout;
}
export interface HtmlMeta {
  applicablePlatforms: Platform[];
  componentFrame: ComponentFrame;
  componentFrameMinSize?: ComponentSize;
  componentHidden: boolean;
  dataAttributes: HtmlAttributes;
  interactionPropertyRecord: { [key in InteractionType]?: InteractionProperty };
  interactionRecord: Record<string, Interaction>;
  isFloating: boolean;
  layout?: ComponentLayout;
  layoutEnabled: boolean;
  mRef: string;
  name: string;
  overridePropertyRecord: Record<string, OverrideRecord>;
  parentMRef: string;
  relatedMRefs: string[];
  type: ComponentType.HTML;
  variableTable: Record<string, Variable>;
  variantRecord?: Record<string, InteractionProperty>;
  verticalLayout?: ComponentVerticalLayout;
}
export interface SheetMeta {
  applicablePlatforms: Platform[];
  componentFrame: ComponentFrame;
  componentFrameMinSize?: ComponentSize;
  componentHidden: boolean;
  dataAttributes: SheetAttributes;
  dataSource?: SheetDataSource;
  interactionPropertyRecord: { [key in InteractionType]?: InteractionProperty };
  interactionRecord: Record<string, Interaction>;
  isFloating: boolean;
  layout?: ComponentLayout;
  layoutEnabled: boolean;
  mRef: string;
  name: string;
  overridePropertyRecord: Record<string, OverrideRecord>;
  parentMRef: string;
  relatedMRefs: string[];
  type: ComponentType.SHEET;
  variableTable: Record<string, Variable>;
  variantRecord?: Record<string, InteractionProperty>;
  verticalLayout?: ComponentVerticalLayout;
}
export interface ComponentRefactorGeneralSocialMediaSeoConfig {
  seoDescription: SocialMediaConfigValue;
  seoThumbnail: DataBinding;
  seoTitle: SocialMediaConfigValue;
}
export interface ComponentRefactorXPlatformSeoConfig {
  cardType: XPlatformCardType;
  seoDescription: SocialMediaConfigValue;
  seoThumbnail: DataBinding;
  seoTitle: SocialMediaConfigValue;
  siteUrl: DataBinding;
}
export interface ReadOnlyVariable {
  dataSource: DataSource;
  displayName?: string;
  itemType: string | null;
  name: string;
  type: string;
}
export interface ReadWriteVariable {
  defaultValue?: DataBinding;
  displayName?: string;
  itemType: string | null;
  name: string;
  type: string;
}
export interface GeneralInputVariable {
  category: InputVariableCategory.GENERAL;
  defaultValue?: DataBinding;
  displayName?: string;
  itemType: string | null;
  name: string;
  optional: boolean;
  type: string;
}
export interface UrlPathInputVariable {
  category: InputVariableCategory.URL_PATH;
  defaultValue?: DataBinding;
  displayName?: undefined;
  itemType: string | null;
  name: string;
  type: string;
}
export interface UrlQueryInputVariable {
  category: InputVariableCategory.URL_QUERY;
  defaultValue?: DataBinding;
  displayName?: undefined;
  ignoreWhenEmpty?: boolean;
  itemType: string | null;
  name: string;
  optional: boolean;
  type: string;
}
export interface OutputVariable {
  displayName?: string;
  itemType: string | null;
  name: string;
  type: string;
  value: DataBinding;
}
export interface DbDeleteTrigger {
  conditionAfterDelete: BoolExp<ConditionBoolExp>;
  dbOperationType: DbOperationType.DELETE;
}
export interface DbInsertOrUpdateTrigger {
  conditionAfterInsertOrUpdate: BoolExp<ConditionBoolExp>;
  dbOperationType: DbOperationType.INSERT_OR_UPDATE;
}
export interface DbInsertTrigger {
  conditionAfterInsert: BoolExp<ConditionBoolExp>;
  dbOperationType: DbOperationType.INSERT;
}
export interface DbUpdateTrigger {
  conditionAfterUpdate: BoolExp<ConditionBoolExp>;
  conditionBeforeUpdate: BoolExp<ConditionBoolExp>;
  dbOperationType: DbOperationType.UPDATE;
  selectedColumns: ColumnSelections;
}
export interface CallActionFlowAction {
  actionFlowUniqueId?: string;
  inputArgs: Record<string, DataBinding>;
  paymentType?: string;
  version?: number;
}
export interface ColumnMetadata {
  defaultValue?: DataBinding;
  displayName: string;
  formula?: DataBinding;
  generated?: boolean;
  id: string;
  name: string;
  primaryKey: boolean;
  required: boolean;
  systemDefined?: boolean;
  type: ColumnType;
  typeIdentifier?: string;
  uiHidden: boolean;
  unique: boolean;
}
export interface ConditionData {
  condition: BoolExp<ConditionBoolExp>;
  id: string;
  name?: string;
  value: DataBinding;
}
export interface EnumTypeDefinition {
  category: TypeDefinitionCategory.ENUM;
  description?: string;
  displayName: string;
  id: string;
  optionType?: string;
  options: EnumOption[];
}
export interface PaymentPermission {
  allowAll?: boolean;
  allowedPaymentTypeAndMethod?: { [key in PaymentType]?: BillingType[] };
}
export interface TablePermission {
  aggregate?: TableAggregatePermission;
  count?: TableCountPermission;
  delete?: TableDeletePermission;
  insert?: TableInsertPermission;
  select?: TableSelectPermission;
  tableId: string;
  update?: TableUpdatePermission;
}
export interface TypeAssignment {
  type: string;
  value?: DataBinding;
}
export interface TypeRefactorInputVariable {
  category: InputVariableCategory;
  defaultValue?: DataBinding;
  name: string;
  type: string;
}
export interface ZAiConfig {
  customModelIdentifier?: Identifier;
  dbQuery: DbQuery[];
  description: string;
  id: string;
  ignoreNullValuesFromContext?: boolean;
  imageInputQuality?: ImageInputQuality;
  initPrompt?: DataBinding;
  inputArgs: Record<string, Variable>;
  maxRound?: number;
  model: AiModel;
  name: string;
  outputConfig: ZAiOutputConfig;
  promptComponents: PromptComponent[];
  temperature: number;
  tools?: ZAiTool[];
  tpaQuery: TpaQuery[];
  uploadedFileConfig: UploadedFileConfig;
}
export interface AndExp<T> {
  _and: BoolExp<T>[];
}
export interface NotExp<T> {
  _not: BoolExp<T>;
}
export interface OrExp<T> {
  _or: BoolExp<T>[];
}
export interface GeoMapProperties {
  centerPoint: DataBinding;
  markerConfig?: GeoMapMarkerConfig;
  showLocation: boolean;
  showPointOfInformation: boolean;
  zoom?: number;
}
export interface SheetProperties {
  columnConfigs: SheetColumnConfigEntry[];
  dataSource?: SheetDataSource;
  sortable: DataBinding;
}
export interface HtmlCodeProperties {
  code: DataBinding;
  mode: HtmlMode;
}
export interface HtmlIFrameProperties {
  mode: HtmlMode;
  source: DataBinding;
}
export interface ConditionalViewProperties {
  preserveStateOnSwitch: boolean;
}
export interface TabViewProperties {
  defaultIndex: DataBinding;
  preserveStateOnSwitch: boolean;
}
export interface AdvertBannerProperties {
  advertId: string;
}
export interface ButtonProperties {
  title: DataBinding;
}
export interface CalendarProperties {
  displayToday: boolean;
  isDarkMode: boolean;
  markedDates: DataBinding;
  selectedDate: DataBinding;
}
export interface CameraProperties {
  devicePosition: CameraPosition;
  flash: CameraFlash;
  frameSize: CameraFrameSize;
  resolution: CameraResolution;
}
export interface HorizontalLineProperties {
  dashLength: number;
  lineDirection: HorizontalLineDirection;
  lineGap: number;
  lineType: HorizontalLineType;
}
export interface ImageProperties {
  alt?: string;
  autoResize: boolean;
  image?: DataBinding;
}
export interface LottieProgressBarProperties {
  defaultProgress: DataBinding;
  fileExId: string;
  step: DataBinding;
  totalProgress: DataBinding;
}
export interface LottieProperties {
  autoplay: boolean;
  fileExId: string;
  loop: boolean;
}
export interface MapMarkerProperties {
  geoPoint: DataBinding;
  markerIcon: DataBinding;
  markerTitle: DataBinding;
}
export interface ModalProperties {
  closeOnClickOverlay?: boolean;
}
export interface PageProperties {
  autoScaleChildComponentSizeByScreenWidthForLegacyProject?: boolean;
  htmlPagePath?: string;
  htmlTitle?: DataBinding;
  seoConfig?: PageSeoConfig;
  shareInfo?: ComponentRefactorShareInfo;
  shareTimelineInfo?: ComponentRefactorShareInfo;
}
export interface ProgressBarProperties {
  format: ProgressBarFormat;
  mode: ProgressBarMode;
  progress: DataBinding;
  totalProgress: DataBinding;
}
export interface RichTextEditorProperties {
  headerConfiguration?: RichTextEditorHeaderConfiguration;
  value: DataBinding;
}
export interface RichTextProperties {
  value: DataBinding;
}
export interface TextProperties {
  displayMode?: TextDisplayMode;
  headerTag?: HeaderTag;
  title: DataBinding;
}
export interface VideoProperties {
  autoplay: boolean;
  controls: boolean;
  loop: boolean;
  showMuteBtn: boolean;
  useBrowserDefaultVideoTag?: boolean;
  video?: DataBinding;
}
export interface ViewProperties {
  foldingConfig?: FoldingConfig;
}
export interface WechatNavigationBarProperties {
  title: DataBinding;
}
export interface ConstantCondition {
  category: ConditionCategory.CONSTANT;
  label: string;
  type: ConstantConditionType;
  updateable: boolean;
}
export interface EnvironmentCondition {
  category: ConditionCategory.ENVIRONMENT;
  label: string;
  type: EnvironmentConditionType;
  updateable: boolean;
  value: string;
}
export interface ExpressionCondition {
  category: ConditionCategory.EXPRESSION;
  label: string;
  target?: DataBinding;
  type: ExpressionConditionType;
  updateable: boolean;
  value?: DataBinding;
}
export interface ColumnValueExp {
  op: ColumnOperator;
  pathComponents: PathComponent[];
  value: DataBinding;
}
export interface HtmlCodeAttributes {
  code: DataBinding;
  mode: HtmlMode.CODE;
}
export interface HtmlIFrameAttributes {
  mode: HtmlMode.IFRAME;
  source: DataBinding;
}
export interface ProgressBarAttributes {
  defaultProgress: DataBinding;
  exId: string;
  onProgressChangeActions: EventBinding[];
  step: LiteralOrDataBinding;
  totalProgress: LiteralOrDataBinding;
}
export interface SwitchAttributes {
  deselectedColor: DataBinding;
  onChangeActions: EventBinding[];
  scale: DataBinding;
  selected: DataBinding;
  selectedColor: DataBinding;
  size: DataBinding;
  styleType: SwitchStyleType;
}
export interface MarkerIconAttributes {
  imageObject: DataBinding;
  imageSource: DataBinding;
}
export interface ComponentRefactorShareInfo {
  enabled: boolean;
  image?: DataBinding;
  title: DataBinding;
}
export interface ConditionalAction {
  actions: EventBinding[];
  condition: BoolExp<ConditionBoolExp>;
  id: string;
  name?: string;
}
export interface EventListener {
  actions: EventBinding[];
  id: string;
  millisUntilExpiry: DataBinding;
}
export interface PageSeoConfig {
  canonicalUrl?: DataBinding;
  seoDescription?: DataBinding;
  seoKeywords?: DataBinding;
  seoThumbnail?: DataBinding;
  seoTitle?: DataBinding;
  seoValueOptionsByPathData?: Record<string, SeoPathDataValueOptions>;
  socialMediaSeoConfigs?: ComponentRefactorSocialMediaSeoConfigGroup;
}
export interface ShareInfo {
  enabled: boolean;
  imageObject: DataBinding;
  imageSource: DataBinding;
  title: DataBinding;
}
export interface TabListItem {
  mRef: string;
  title: DataBinding;
}
export interface TableAggregatePermission {
  columns: string[];
  filter: BoolExp<ConditionBoolExp>;
}
export interface TableCountPermission {
  filter: BoolExp<ConditionBoolExp>;
}
export interface TableDeletePermission {
  filter: BoolExp<ConditionBoolExp>;
}
export interface TableInsertPermission {
  check: BoolExp<ConditionBoolExp>;
  columns: string[];
}
export interface TableSelectPermission {
  columns: string[];
  filter: BoolExp<ConditionBoolExp>;
}
export interface TableUpdatePermission {
  columns: string[];
  filter: BoolExp<ConditionBoolExp>;
}
export interface TimeIntervalConfig {
  instant: TimestampItem[];
  offset: TimestampItem;
}
export interface TimestampItem {
  amount?: SingleValueDataBinding;
  direction?: TimeDirection;
  temporalUnit: TemporalUnit;
}
export interface ArrayNode {
  itemType: string | null;
  list: ObjectLiteralNode[];
  name: string;
  object: ObjectLiteralNode[];
  type: string;
}
export interface ObjectNode {
  itemType: string | null;
  name: string;
  object: ObjectLiteralNode[];
  type: string;
}
export interface ValueNode {
  defaultValue?: string;
  itemType: string | null;
  name: string;
  type: string;
  value: DataBinding;
}
export interface AngleLinearGradientDirection {
  type: LinearGradientDirectionType.ANGLE;
  value: DataBinding;
}
export interface KeywordLinearGradientDirection {
  type: LinearGradientDirectionType.KEYWORD;
  value: KeywordLinearGradientDirectionValue;
}
export interface AMapConfiguration {
  key: string;
  secret: string;
  type: MapType;
}
export interface MapBoxConfiguration {
  token: string;
  type: MapType;
}
export interface AIInputZSchemaNode {
  configId: string;
  key: string;
  value: DataBinding;
}
export interface APIInputZSchemaNode {
  apiId: string;
  input: ObjectNode;
}
export interface ActionFlowInputZSchemaNode {
  actionFlowId: string;
  key: string;
  value: DataBinding;
}
export interface ActionFlowsZSchemaNode {
  actionFlow: BackendActionFlow[];
}
export interface ApiWorkSpacesZSchemaNode {
  apiWorkSpaces: ApiWorkSpace[];
}
export interface ComponentInputZSchemaNode {
  componentId: string;
  key: string;
  variable: InputVariable;
}
export interface ComponentVariableZSchemaNode {
  componentId: string;
  key: string;
  variable: InnerVariable;
}
export interface GlobalDataZSchemaNode {
  key: string;
  variable: Variable;
}
export interface LinkDataZSchemaNode {
  key: string;
  pageMRef: string;
  variable: Variable;
}
export interface PageDataZSchemaNode {
  key: string;
  pageMRef: string;
  variable: Variable;
}
export interface PathDataZSchemaNode {
  key: string;
  pageMRef: string;
  variable: Variable;
}
export interface TpaConfigsZSchemaNode {
  thirdPartyApiConfigs: ThirdPartyApiConfig[];
}
export interface ZAiConfigsZSchemaNode {
  zAiConfigs: ZAiConfig[];
}
export interface GeneralPaymentConfiguration {
  triggerIdByBillingType: { [key in BillingType]?: string };
}
export interface StripePaymentConfiguration {
  brandInfo?: StripeBrandInfo;
  triggerIdByBillingType: { [key in BillingType]?: string };
}
export interface WebConfiguration {
  appDidLoad: EventBinding[];
  breakpointRecord: Record<string, BreakPoint>;
  clonedComponentGroupConfiguration?: ClonedComponentGroupConfiguration;
  customRepos?: ConfiguredCodeComponentRepo[];
  globalVariableTable: Record<string, Variable>;
  headerInjection?: string;
  initialScreenMRef?: string;
  isLegacySchema?: boolean;
  language?: string;
  mapConfiguration?: MapConfiguration;
  pageGroupConfiguration: PageGroupConfiguration;
  paymentConfigRecord?: { [key in PaymentType]?: PaymentConfiguration };
  projectBackgroundColor: DataBinding;
  scriptInjection?: string;
  seoConfiguration?: SeoConfiguration;
  tabBarSetting?: TabBarSetting;
}
export interface WechatConfiguration {
  appDidLoad: EventBinding[];
  breakpointRecord: Record<string, BreakPoint>;
  clonedComponentGroupConfiguration?: ClonedComponentGroupConfiguration;
  customRepos?: ConfiguredCodeComponentRepo[];
  globalVariableTable: Record<string, Variable>;
  initialScreenMRef?: string;
  isLegacySchema?: boolean;
  orderListMRef?: string;
  pageCountInMainPackage: number;
  pageCountInSubPackage: number;
  pageGroupConfiguration: PageGroupConfiguration;
  paymentConfigRecord?: { [key in PaymentType]?: PaymentConfiguration };
  tabBarSetting?: TabBarSetting;
}
export interface TpaQuery {
  enable: boolean;
  fields: TpaFieldSelection[];
  query: ThirdPartyQuery;
}
export interface CustomResponseConfig {
  category: ResponseConfigCategory.CUSTOM;
  codeAndContentType: CodeAndContentType[];
  name: string;
  responseType: string;
  uniqueId: string;
}
export interface FallbackResponseConfig {
  category: ResponseConfigCategory.FALLBACK;
  codeAndContentType: CodeAndContentType[];
  name: string;
  responseType: string;
  uniqueId: string;
}
export interface LiveSchema {
  appConfiguration: AppConfiguration;
  callbackConfigurations: CallbackConfiguration[];
  colorTheme: Record<string, string>;
  colorThemeLabelMap: Record<string, string>;
  customTypeDefinitions: Record<string, CustomTypeDefinition>;
  dataModel: DataModel;
  draftActionFlows: BackendActionFlow[];
  editorConfiguration?: EditorConfiguration;
  mRefMap: Record<string, ComponentMeta>;
  pendingActionFlows: BackendActionFlow[];
  roleConfigs: RoleConfig[];
  scheduledJobConfigurations: ScheduledJobConfiguration[];
  serverConfiguration?: ServerConfiguration;
  thirdPartyApiConfigs: ThirdPartyApiConfig[];
  triggerConfiguration?: TriggerConfiguration[];
  typeConversionDefinitions?: TypeConversionDefinition[];
  typeDefinitionById?: Record<string, TypeDefinition>;
  webConfiguration: WebConfiguration;
  webRootMRefs: string[];
  wechatConfiguration: WechatConfiguration;
  wechatRootMRefs: string[];
  zAiConfigs: ZAiConfig[];
  zedVersion: string;
}
export interface ZSchema {
  clients?: ClientsSchema;
  server?: ServerSchema;
  version: string;
}
export interface ArrayTypeSchema {
  defs?: Record<string, Schema>;
  description?: string;
  items: Schema;
  type: TypeSchemaEnum;
}
export interface ObjectTypeSchema {
  defs?: Record<string, Schema>;
  description?: string;
  properties: Record<string, Schema>;
  propertiesInOrder?: SchemaWithFieldName[];
  required?: string[];
  type: TypeSchemaEnum;
}
export interface PrimitiveTypeSchema {
  description?: string;
  enums?: string[];
  type: TypeSchemaEnum;
}
export interface ReferenceSchema {
  location: ReferenceLocation;
  typeIdentifier: string;
}
export interface BackendActionFlow {
  allNodes: BackendActionFlowNode[];
  displayName: string;
  globalVariables: Record<string, Variable>;
  inputArgs: Record<string, Variable>;
  isAsync?: boolean;
  outputDataBindings: Record<string, DataBinding>;
  removable?: boolean;
  schemaVersion: string;
  startNodeId: string;
  timeout?: number;
  uniqueId: string;
  versionId: number;
}
export interface FrontendActionFlow {
  allNodes: FrontendActionFlowNode[];
  startNodeId: string;
  uniqueId: string;
}
export interface MobileSchema {
  clientId: string;
  componentById?: Record<string, Component>;
  componentMetaById: Record<string, ComponentMeta>;
  configuration: MobileClientConfiguration;
  rootPageIds: string[];
  type: ClientType.MOBILE;
}
export interface WebSchema {
  clientId: string;
  componentById?: Record<string, Component>;
  componentMetaById: Record<string, ComponentMeta>;
  configuration: WebClientConfiguration;
  rootPageIds: string[];
  type: ClientType.WEB;
}
export interface WechatMiniProgramSchema {
  clientId: string;
  componentById?: Record<string, Component>;
  componentMetaById: Record<string, ComponentMeta>;
  configuration: WechatMiniProgramClientConfiguration;
  rootPageIds: string[];
  type: ClientType.WECHAT_MINI_PROGRAM;
}
export interface DbTriggerConfiguration {
  actions: CallActionFlowAction[];
  displayName: string;
  enabled: boolean;
  tableId?: string;
  trigger: DbTrigger;
  type: TriggerType.DB_TRIGGER;
  uniqueId: string;
}
export interface Api {
  displayName: string;
  inputVariables: PropertyEntry<TypeRefactorInputVariable>[];
  meta: ApiMeta;
  pagination?: TpaPagingConfig;
  responseConfigs: ResponseConfig[];
  uniqueId: string;
  useAsData: boolean;
}
export interface ApiWorkSpace {
  apis: Api[];
  constants: PropertyEntry<TypeAssignment>[];
  description?: string;
  displayName: string;
  isDefault?: boolean;
  uniqueId: string;
}
export interface CallbackConfiguration {
  actions: CallActionFlowAction[];
  callbackType: CallbackType;
  enabled?: boolean;
  name?: string;
  parameters: ThirdPartyParameter[];
  removable?: boolean;
  response?: CallbackResponse;
  uniqueId: string;
}
export interface PlatformContentNode {
  colorTheme: Record<string, string>;
  platform: Platform;
  platformConfiguration: PlatformConfiguration;
  rootMRefs: string[];
}
export interface RelationSelection {
  alias?: string;
  description: string;
  name: string;
  query?: ZQuery;
  relationSelection: TableSelection;
}
export interface RoleConfig {
  boundToDataVisualizer?: boolean;
  description?: string;
  name: string;
  permissionConfig: PermissionConfig;
  uuid: string;
}
export interface TableMetadata {
  columnMetadata: ColumnMetadata[];
  constraintMetadata: ConstraintMetadata[];
  description?: string;
  displayName: string;
  extensions?: TableExtension[];
  hiddenInZed: boolean;
  id: string;
  isView?: boolean;
  name: string;
  schemaModifiable: boolean;
  writableForAdminOnly?: boolean;
}
export interface DBQueryDataSource {
  dbQuery: DbQuery;
  type: SheetDataSourceType;
}
export interface SocialMediaDataBindingValue {
  type: SocialMediaConfigValueType.DATA_BINDING;
  value: DataBinding;
}
export interface SocialMediaUseSeoTDKValue {
  type: SocialMediaConfigValueType.USE_SEO_TDK;
}
export interface GeneralSocialMediaSeoConfig {
  seoDescription: SocialMediaConfigValue;
  seoThumbnail: ImageData;
  seoTitle: SocialMediaConfigValue;
}
export interface XPlatformSeoConfig {
  cardType: XPlatformCardType;
  seoDescription: SocialMediaConfigValue;
  seoThumbnail: ImageData;
  seoTitle: SocialMediaConfigValue;
  siteUrl: DataBinding;
}
export interface LinearGradientColorStyle {
  type: GradientColorType;
  value: LinearGradientColorConfig;
}
export interface PlainColorStyle {
  type: DefaultColorType;
  value: DataBinding;
}
export interface ButtonStyles {
  title?: TextStyleAsComponentWrapperStyle;
  wrapper?: ButtonWrapperStyle;
}
export interface DataSelectorStyles {
  placeholder?: PlaceholderStyle;
  text?: TextStyleWithoutMultiLineAsComponentWrapperStyle;
  wrapper?: DataSelectorWrapperStyle;
}
export interface DateTimePickerStyles {
  placeholder?: PlaceholderStyle;
  text?: TextStyleWithoutMultiLineAsComponentWrapperStyle;
  wrapper?: DateTimePickerWrapperStyle;
}
export interface GeneralComponentStyle<T> {
  wrapper?: T;
}
export interface ListViewStyles {
  indicator?: BackgroundColorAsComponentWrapperStyle;
  list?: GridLayoutAsComponentWrapperStyle;
  scrollBar?: ScrollBarStyle;
  selectedIndicator?: BackgroundColorAsComponentWrapperStyle;
  wrapper?: ListWrapperStyle;
}
export interface MixImagePickerStyles {
  image?: MixImagePickerImageStyle;
  wrapper?: MixImagePickerWrapperStyle;
}
export interface ProgressBarStyles {
  bar?: BackgroundColorAsComponentWrapperStyle;
  container?: BackgroundColorAsComponentWrapperStyle;
  label?: TextStyleAsComponentWrapperStyle;
  wrapper?: ProgressBarWrapperStyle;
}
export interface SheetStyles {
  divider?: SheetDividerStyle;
  footer?: SheetHeaderFooterStyle;
  header?: SheetHeaderFooterStyle;
  row?: SheetRowStyle;
  wrapper?: SheetWrapperStyle;
}
export interface SwitchStyles {
  checked?: BackgroundColorAsComponentWrapperStyle;
  wrapper?: SwitchWrapperStyle;
}
export interface TextInputStyles {
  placeholder?: PlaceholderStyle;
  text?: TextStyleAsComponentWrapperStyle;
  wrapper?: TextInputWrapperStyle;
}
export interface TextStyles {
  title?: TextStyleAsComponentWrapperStyle;
  wrapper?: TextWrapperStyle;
}
export interface ViewStyles {
  scrollBar?: ScrollBarStyle;
  wrapper?: ViewWrapperStyle;
}
export interface AdvertBannerWrapperStyle {
  layout?: BlockOrNoneLayoutStyle;
  position?: PositionStyle;
  size?: GeneralSizeStyle;
}
export interface BackgroundColorAsComponentWrapperStyle {
  background?: BackgroundColorStyle;
}
export interface ButtonWrapperStyle {
  backdropFilter?: StyleOrSyntax<BackdropFilterWithBlurStyle>;
  background?: BackgroundColorStyle;
  border?: BorderStyle;
  boxShadow?: StyleOrSyntax<BoxShadowStyle>;
  cursor?: CursorStyle;
  layout?: BlockOrNoneLayoutStyle;
  margin?: StyleOrSyntax<PlainDimensionValues>;
  opacity?: DataBinding;
  padding?: StyleOrSyntax<PlainDimensionValues>;
  position?: PositionStyle;
  size?: GeneralSizeStyle;
  zIndex?: DataBinding;
}
export interface CalendarWrapperStyle {
  background?: BackgroundColorStyle;
  border?: BorderStyle;
  boxShadow?: StyleOrSyntax<BoxShadowStyle>;
  layout?: BlockOrNoneLayoutStyle;
  opacity?: DataBinding;
  position?: PositionStyle;
  size?: GeneralSizeStyle;
  zIndex?: DataBinding;
}
export interface CameraWrapperStyle {
  layout?: BlockOrNoneLayoutStyle;
  position?: PositionStyle;
  size?: GeneralSizeStyle;
}
export interface CodeComponentWrapperStyle {
  backdropFilter?: StyleOrSyntax<BackdropFilterWithBlurStyle>;
  background?: BackgroundStyle;
  border?: BorderStyle;
  boxShadow?: StyleOrSyntax<BoxShadowStyle>;
  cursor?: CursorStyle;
  layout?: LayoutStyle;
  margin?: StyleOrSyntax<PlainDimensionValues>;
  opacity?: DataBinding;
  overflow?: OverflowStyle;
  padding?: StyleOrSyntax<PlainDimensionValues>;
  position?: PositionStyle;
  size?: GeneralSizeStyle;
  zIndex?: DataBinding;
}
export interface DataSelectorWrapperStyle {
  background?: BackgroundColorStyle;
  border?: BorderStyle;
  boxShadow?: StyleOrSyntax<BoxShadowStyle>;
  layout?: BlockOrNoneLayoutStyle;
  margin?: StyleOrSyntax<PlainDimensionValues>;
  opacity?: DataBinding;
  padding?: StyleOrSyntax<PlainDimensionValues>;
  position?: PositionStyle;
  size?: GeneralSizeStyle;
  zIndex?: DataBinding;
}
export interface DateTimePickerWrapperStyle {
  background?: BackgroundColorStyle;
  border?: BorderStyle;
  boxShadow?: StyleOrSyntax<BoxShadowStyle>;
  layout?: BlockOrNoneLayoutStyle;
  margin?: StyleOrSyntax<PlainDimensionValues>;
  opacity?: DataBinding;
  padding?: StyleOrSyntax<PlainDimensionValues>;
  position?: PositionStyle;
  size?: GeneralSizeStyle;
  zIndex?: DataBinding;
}
export interface FilePickerWrapperStyle {
  background?: BackgroundColorStyle;
  boxShadow?: StyleOrSyntax<BoxShadowStyle>;
  layout?: BlockOrNoneLayoutStyle;
  margin?: StyleOrSyntax<PlainDimensionValues>;
  opacity?: DataBinding;
  position?: PositionStyle;
  size?: GeneralSizeStyle;
  zIndex?: DataBinding;
}
export interface GeoMapWrapperStyle {
  border?: BorderStyle;
  boxShadow?: StyleOrSyntax<BoxShadowStyle>;
  layout?: BlockOrNoneLayoutStyle;
  position?: PositionStyle;
  size?: GeneralSizeStyle;
}
export interface GridLayoutAsComponentWrapperStyle {
  layout?: GridLayoutStyle;
}
export interface HorizontalLineWrapperStyle {
  background?: BackgroundColorStyle;
  layout?: BlockOrNoneLayoutStyle;
  margin?: StyleOrSyntax<PlainDimensionValues>;
  opacity?: DataBinding;
  padding?: StyleOrSyntax<PlainDimensionValues>;
  position?: PositionStyle;
  size?: GeneralSizeStyle;
  zIndex?: DataBinding;
}
export interface HtmlWrapperStyle {
  backdropFilter?: StyleOrSyntax<BackdropFilterWithBlurStyle>;
  background?: BackgroundStyle;
  border?: BorderStyle;
  boxShadow?: StyleOrSyntax<BoxShadowStyle>;
  cursor?: CursorStyle;
  layout?: LayoutStyle;
  margin?: StyleOrSyntax<PlainDimensionValues>;
  opacity?: DataBinding;
  overflow?: OverflowStyle;
  padding?: StyleOrSyntax<PlainDimensionValues>;
  position?: PositionStyle;
  size?: GeneralSizeStyle;
  zIndex?: DataBinding;
}
export interface ImageWrapperStyle {
  backdropFilter?: StyleOrSyntax<BackdropFilterWithBlurStyle>;
  background?: BackgroundStyle;
  border?: BorderStyle;
  boxShadow?: StyleOrSyntax<BoxShadowStyle>;
  cursor?: CursorStyle;
  layout?: BlockOrNoneLayoutStyle;
  margin?: StyleOrSyntax<PlainDimensionValues>;
  objectFit?: ObjectFit;
  opacity?: DataBinding;
  position?: PositionStyle;
  size?: GeneralSizeStyle;
  zIndex?: DataBinding;
}
export interface ListWrapperStyle {
  backdropFilter?: StyleOrSyntax<BackdropFilterWithBlurStyle>;
  background?: BackgroundStyle;
  border?: BorderStyle;
  boxShadow?: StyleOrSyntax<BoxShadowStyle>;
  layout?: BlockOrNoneLayoutStyle;
  margin?: StyleOrSyntax<PlainDimensionValues>;
  opacity?: DataBinding;
  padding?: StyleOrSyntax<PlainDimensionValues>;
  position?: PositionStyle;
  size?: GeneralSizeStyle;
  zIndex?: DataBinding;
}
export interface LottieProgressBarWrapperStyle {
  position?: PositionStyle;
  size?: GeneralSizeStyle;
}
export interface LottieWrapperStyle {
  layout?: BlockOrNoneLayoutStyle;
  margin?: StyleOrSyntax<PlainDimensionValues>;
  opacity?: DataBinding;
  position?: PositionStyle;
  size?: GeneralSizeStyle;
  zIndex?: DataBinding;
}
export interface MapMarkerWrapperStyle {
  layout?: BlockOrNoneLayoutStyle;
  size?: GeneralSizeStyle;
}
export interface MixImagePickerImageStyle {
  background?: BackgroundColorStyle;
  border?: BorderStyle;
  boxShadow?: StyleOrSyntax<BoxShadowStyle>;
  layout?: BlockOrNoneLayoutStyle;
}
export interface MixImagePickerWrapperStyle {
  layout?: GridOrNoneLayoutStyle;
  margin?: StyleOrSyntax<PlainDimensionValues>;
  opacity?: DataBinding;
  position?: PositionStyle;
  size?: GeneralSizeStyle;
  zIndex?: DataBinding;
}
export interface ModalWrapperStyle {
  backdropFilter?: StyleOrSyntax<BackdropFilterWithBlurStyle>;
  background?: BackgroundStyle;
  border?: BorderStyle;
  boxShadow?: StyleOrSyntax<BoxShadowStyle>;
  layout?: LayoutStyle;
  opacity?: DataBinding;
  overflow?: OverflowStyle;
  padding?: StyleOrSyntax<PlainDimensionValues>;
  position?: PositionStyle;
  size?: GeneralSizeStyle;
  zIndex?: DataBinding;
}
export interface NumberInputWrapperStyle {
  background?: BackgroundColorStyle;
  border?: BorderStyle;
  boxShadow?: StyleOrSyntax<BoxShadowStyle>;
  layout?: BlockOrNoneLayoutStyle;
  margin?: StyleOrSyntax<PlainDimensionValues>;
  opacity?: DataBinding;
  position?: PositionStyle;
  size?: GeneralSizeStyle;
  zIndex?: DataBinding;
}
export interface PageWrapperStyle {
  background?: BackgroundStyle;
  layout?: LayoutStyle;
  overflow?: OverflowStyle;
  padding?: StyleOrSyntax<PlainDimensionValues>;
  size?: HeightSizeStyle;
}
export interface PlaceholderStyle {
  text?: TextStyleWithoutMultilineAndTextDecoration;
}
export interface ProgressBarWrapperStyle {
  background?: BackgroundColorStyle;
  layout?: BlockOrNoneLayoutStyle;
  margin?: StyleOrSyntax<PlainDimensionValues>;
  opacity?: DataBinding;
  position?: PositionStyle;
  size?: GeneralSizeStyle;
  zIndex?: DataBinding;
}
export interface RichTextEditorWrapperStyle {
  background?: BackgroundColorStyle;
  border?: BorderStyle;
  boxShadow?: StyleOrSyntax<BoxShadowStyle>;
  layout?: BlockOrNoneLayoutStyle;
  margin?: StyleOrSyntax<PlainDimensionValues>;
  opacity?: DataBinding;
  position?: PositionStyle;
  size?: GeneralSizeStyle;
  text?: TextColorStyle;
  zIndex?: DataBinding;
}
export interface RichTextWrapperStyle {
  backdropFilter?: StyleOrSyntax<BackdropFilterWithBlurStyle>;
  background?: BackgroundStyle;
  layout?: BlockOrNoneLayoutStyle;
  margin?: StyleOrSyntax<PlainDimensionValues>;
  opacity?: DataBinding;
  position?: PositionStyle;
  size?: GeneralSizeStyle;
  zIndex?: DataBinding;
}
export interface ScrollBarStyle {
  layout?: BlockOrNoneLayoutStyle;
}
export interface SelectViewWrapperStyle {
  background?: BackgroundColorStyle;
  border?: BorderStyle;
  boxShadow?: StyleOrSyntax<BoxShadowStyle>;
  layout?: BlockOrNoneLayoutStyle;
  margin?: StyleOrSyntax<PlainDimensionValues>;
  opacity?: DataBinding;
  overflow?: OverflowStyle;
  padding?: StyleOrSyntax<PlainDimensionValues>;
  position?: PositionStyle;
  size?: GeneralSizeStyle;
  zIndex?: DataBinding;
}
export interface SheetDividerStyle {
  background?: BackgroundColorStyle;
  size?: HeightSizeStyle;
}
export interface SheetHeaderFooterStyle {
  background?: BackgroundColorStyle;
  text?: TextColorAndFontSizeStyle;
}
export interface SheetRowStyle {
  size?: HeightSizeStyle;
}
export interface SheetWrapperStyle {
  background?: BackgroundColorStyle;
  border?: BorderStyle;
  boxShadow?: StyleOrSyntax<BoxShadowStyle>;
  layout?: BlockOrNoneLayoutStyle;
  opacity?: DataBinding;
  position?: PositionStyle;
  size?: GeneralSizeStyle;
  zIndex?: DataBinding;
}
export interface SwitchWrapperStyle {
  layout?: BlockOrNoneLayoutStyle;
  margin?: StyleOrSyntax<PlainDimensionValues>;
  opacity?: DataBinding;
  position?: PositionStyle;
  size?: WidthHeightSizeStyle;
  zIndex?: DataBinding;
}
export interface TabViewWrapperStyle {
  background?: BackgroundColorStyle;
  layout?: BlockOrNoneLayoutStyle;
  margin?: StyleOrSyntax<PlainDimensionValues>;
  opacity?: DataBinding;
  position?: PositionStyle;
  size?: GeneralSizeStyle;
  zIndex?: DataBinding;
}
export interface TextInputWrapperStyle {
  backdropFilter?: StyleOrSyntax<BackdropFilterWithBlurStyle>;
  background?: BackgroundColorStyle;
  border?: BorderStyle;
  boxShadow?: StyleOrSyntax<BoxShadowStyle>;
  layout?: BlockOrNoneLayoutStyle;
  margin?: StyleOrSyntax<PlainDimensionValues>;
  opacity?: DataBinding;
  padding?: StyleOrSyntax<PlainDimensionValues>;
  position?: PositionStyle;
  size?: GeneralSizeStyle;
  zIndex?: DataBinding;
}
export interface TextStyleAsComponentWrapperStyle {
  text?: TextStyle;
}
export interface TextStyleWithoutMultiLineAsComponentWrapperStyle {
  text?: TextStyleWithoutMultiline;
}
export interface TextWrapperStyle {
  backdropFilter?: StyleOrSyntax<BackdropFilterWithBlurStyle>;
  background?: BackgroundColorStyle;
  border?: BorderStyle;
  boxShadow?: StyleOrSyntax<BoxShadowStyle>;
  cursor?: CursorStyle;
  layout?: BlockOrNoneLayoutStyle;
  margin?: StyleOrSyntax<PlainDimensionValues>;
  opacity?: DataBinding;
  position?: PositionStyle;
  size?: GeneralSizeStyle;
  zIndex?: DataBinding;
}
export interface VideoPickerWrapperStyle {
  background?: BackgroundColorStyle;
  border?: BorderStyle;
  boxShadow?: StyleOrSyntax<BoxShadowStyle>;
  layout?: BlockOrNoneLayoutStyle;
  margin?: StyleOrSyntax<PlainDimensionValues>;
  opacity?: DataBinding;
  position?: PositionStyle;
  size?: GeneralSizeStyle;
  zIndex?: DataBinding;
}
export interface VideoWrapperStyle {
  backdropFilter?: StyleOrSyntax<BackdropFilterWithBlurStyle>;
  border?: BorderStyle;
  boxShadow?: StyleOrSyntax<BoxShadowStyle>;
  cursor?: CursorStyle;
  layout?: BlockOrNoneLayoutStyle;
  margin?: StyleOrSyntax<PlainDimensionValues>;
  objectFit?: ObjectFit;
  opacity?: DataBinding;
  position?: PositionStyle;
  size?: GeneralSizeStyle;
  zIndex?: DataBinding;
}
export interface ViewWrapperStyle {
  backdropFilter?: StyleOrSyntax<BackdropFilterWithBlurStyle>;
  background?: BackgroundStyle;
  border?: BorderStyle;
  boxShadow?: StyleOrSyntax<BoxShadowStyle>;
  cursor?: CursorStyle;
  layout?: LayoutStyle;
  margin?: StyleOrSyntax<PlainDimensionValues>;
  opacity?: DataBinding;
  overflow?: OverflowStyle;
  padding?: StyleOrSyntax<PlainDimensionValues>;
  position?: PositionStyle;
  size?: GeneralSizeStyle;
  zIndex?: DataBinding;
}
export interface WechatNavigationBarWrapperStyle {
  background?: BackgroundColorStyle;
  text?: TextStyle;
}
export interface WechatOfficialAccountWrapperStyle {
  layout?: LayoutStyle;
  position?: PositionStyle;
  size?: GeneralSizeStyle;
  zIndex?: DataBinding;
}
export interface AbsoluteOrFixedPositionStyle {
  bottom?: FixedLengthSyntax;
  horizontalDir?: HorizontalDirection;
  left?: FixedLengthSyntax;
  position: Position.ABSOLUTE | Position.FIXED;
  right?: FixedLengthSyntax;
  top?: FixedLengthSyntax;
  verticalDir?: ComponentRefactorVerticalDirection;
}
export interface PlainDimensionValues {
  bottom?: FixedLengthSyntax;
  left?: FixedLengthSyntax;
  right?: FixedLengthSyntax;
  top?: FixedLengthSyntax;
}
export interface BlockOrNoneLayoutStyle {
  display: LayoutDisplay.BLOCK | LayoutDisplay.NONE;
}
export interface GridLayoutStyle {
  columnGap?: DataBinding;
  display: LayoutDisplay.GRID;
  gridTemplateColumns?: DataBinding;
  gridTemplateRows?: DataBinding;
  rowGap?: DataBinding;
}
export interface NoneLayoutStyle {
  display: LayoutDisplay.NONE;
}
export interface BlockLayoutStyle {
  display: LayoutDisplay.BLOCK;
}
export interface FlexLayoutStyle {
  alignItems?: AlignItems;
  columnGap?: DataBinding;
  display: LayoutDisplay.FLEX;
  flexDirection?: FlexDirection;
  flexWrap?: FlexWrap;
  justifyContent?: JustifyContent;
  rowGap?: DataBinding;
}
export interface FixedLengthSyntax {
  unit: LengthUnit.FIXED;
  value: DataBinding;
}
export interface RelativeLengthSyntax {
  unit: LengthUnit.RELATIVE;
  value: DataBinding;
}
export interface AutoLengthSyntax {
  unit: LengthUnit.AUTO;
}
export interface RelativePositionStyle {
  position: Position.RELATIVE;
}
export interface GeneralSizeStyle {
  height?: SizeMeasure;
  maxHeight?: StyleOrSyntax<SizeMinMaxMeasure>;
  maxWidth?: StyleOrSyntax<SizeMinMaxMeasure>;
  minHeight?: StyleOrSyntax<SizeMinMaxMeasure>;
  minWidth?: StyleOrSyntax<SizeMinMaxMeasure>;
  width?: SizeMeasure;
}
export interface HeightSizeStyle {
  height?: SizeMeasure;
}
export interface WidthHeightSizeStyle {
  height?: SizeMeasure;
  width?: SizeMeasure;
}
export interface BackdropFilterWithBlurStyle {
  type?: BackdropFilterType;
  value?: FixedLengthSyntax;
}
export interface BackgroundColorStyle {
  color?: StyleOrSyntax<ColorStyle>;
}
export interface BackgroundImageStyle {
  autoResize?: boolean;
  imageData?: DataBinding;
}
export interface BackgroundStyle {
  color?: StyleOrSyntax<ColorStyle>;
  fitType?: StyleOrSyntax<BackgroundImageFitType>;
  image?: StyleOrSyntax<BackgroundImageStyle>;
}
export interface BorderRadiusConfig {
  bottomLeft?: FixedLengthSyntax;
  bottomRight?: FixedLengthSyntax;
  topLeft?: FixedLengthSyntax;
  topRight?: FixedLengthSyntax;
}
export interface BorderStyle {
  color?: StyleOrSyntax<ColorStyle>;
  radius?: BorderRadiusConfig;
  style?: StyleOrSyntax<BorderStyleType>;
  width?: StyleOrSyntax<PlainDimensionValues>;
}
export interface BoxShadowStyle {
  blur?: FixedLengthSyntax;
  color?: PlainColorStyle;
  offsetX?: FixedLengthSyntax;
  offsetY?: FixedLengthSyntax;
  spread?: FixedLengthSyntax;
  type?: BoxShadowType;
}
export interface CursorStyle {
  type: ComponentRefactorCursorType;
  value?: CursorKeyword;
}
export interface LinearGradientColor {
  color: DataBinding;
  stop: LengthSyntaxWithValue;
}
export interface LinearGradientColorConfig {
  colors?: LinearGradientColor[];
  direction?: LinearGradientDirection;
}
export interface MultilineStyle {
  enabled?: DataBinding;
  lineClamp?: DataBinding;
}
export interface OverflowStyle {
  x?: Overflow;
  y?: Overflow;
}
export interface SizeMeasure {
  unit?: SizeUnit;
  value?: DataBinding;
}
export interface SizeMinMaxMeasure {
  unit?: SizeMinMaxUnit;
  value?: DataBinding;
}
export interface TextColorAndFontSizeStyle {
  color?: ColorStyle;
  fontSize?: FixedLengthSyntax;
}
export interface TextColorStyle {
  color?: ColorStyle;
}
export interface TextDecoration {
  color?: PlainColorStyle;
  line?: ComponentRefactorTextDecorationLine;
  style?: TextDecorationStyle;
}
export interface TextStyle {
  color?: ColorStyle;
  fontFamily?: DataBinding;
  fontSize?: FixedLengthSyntax;
  fontStyle?: ComponentRefactorFontStyle;
  fontWeight?: DataBinding;
  letterSpacing?: FixedLengthSyntax;
  lineHeight?: FixedLengthSyntax;
  multiline?: MultilineStyle;
  textAlign?: ComponentRefactorTextAlign;
  textDecoration?: StyleOrSyntax<TextDecoration>;
  textIndent?: FixedLengthSyntax;
}
export interface TextStyleWithoutMultiline {
  color?: ColorStyle;
  fontFamily?: DataBinding;
  fontSize?: FixedLengthSyntax;
  fontStyle?: ComponentRefactorFontStyle;
  fontWeight?: DataBinding;
  letterSpacing?: FixedLengthSyntax;
  lineHeight?: FixedLengthSyntax;
  textAlign?: ComponentRefactorTextAlign;
  textDecoration?: StyleOrSyntax<TextDecoration>;
  textIndent?: FixedLengthSyntax;
}
export interface TextStyleWithoutMultilineAndTextDecoration {
  color?: ColorStyle;
  fontFamily?: DataBinding;
  fontSize?: FixedLengthSyntax;
  fontStyle?: ComponentRefactorFontStyle;
  fontWeight?: DataBinding;
  letterSpacing?: FixedLengthSyntax;
  lineHeight?: FixedLengthSyntax;
  textAlign?: ComponentRefactorTextAlign;
  textIndent?: FixedLengthSyntax;
}
export interface ThirdPartyData {
  defaultValue?: string;
  encode: TypeEncode;
  itemType: TPADataType | null;
  name: string;
  parameters?: ThirdPartyData[];
  required: boolean;
  type: TPADataType;
  uniqueId: string;
  uploadStrategy?: UploadStrategy;
  zType?: string;
}
export interface ThirdPartyParameter {
  defaultValue?: string;
  encode: TypeEncode;
  itemType: TPADataType | null;
  name: string;
  parameters?: ThirdPartyData[];
  position: ParamPosition;
  required: boolean;
  type: TPADataType;
  uniqueId: string;
  uploadStrategy?: UploadStrategy;
  zType?: string;
}
export interface ObjectTypeDefinition {
  category: TypeDefinitionCategory.OBJECT;
  description?: string;
  displayName?: string;
  id: string;
  private?: boolean;
  properties: PropertyEntry<string>[];
}
export interface DefaultZAiOutputConfig {
  isStreaming: boolean;
  isStructured: boolean;
  maxTokenSize?: number;
}
export interface StructuredZAiOutputConfig {
  customTypeId?: string;
  isStructured: boolean;
  maxTokenSize?: number;
  outputType?: string;
}
export interface ActionFlowTool {
  actionFlowId: string;
  description: string;
  inputDescription: Record<string, FieldDescription>;
  name?: string;
  outputDescription: Record<string, FieldDescription>;
  toolId: string;
  type: ZAiToolType.ACTION_FLOW;
}
export interface AiTool {
  description: string;
  inputDescription: Record<string, FieldDescription>;
  name?: string;
  outputDescription: Record<string, FieldDescription>;
  toolId: string;
  type: ZAiToolType.ZAI;
  zaiConfigId: string;
}
export interface ObtainMoreInformationTool {
  name?: string;
  toolId: string;
  type: ZAiToolType.OBTAIN_MORE_INFORMATION;
}
export interface StructuredOutputTool {
  description: string;
  jsonSchemaStr: string;
  name?: string;
  toolId: string;
  type: ZAiToolType.STRUCTURED_OUTPUT;
}
export interface ThirdPartyApiTool {
  description: string;
  inputDescription: Record<string, FieldDescription>;
  name?: string;
  outputDescription: Record<string, FieldDescription>;
  thirdPartyApiId: string;
  toolId: string;
  type: ZAiToolType.TPA;
}
export interface ActionflowPermission {
  allowAll?: boolean;
  allowedActionflowIds?: string[];
  checkById?: Record<string, BoolExp<ConditionBoolExp>>;
}
export interface AppConfiguration {
  authenticationConfig: AuthenticationConfig;
  buildTarget: BuildTarget[];
  iconfontScriptUrl: string;
}
export interface BackgroundImage {
  autoResize?: DataBinding;
  imageObject: DataBinding;
  imageSource: DataBinding;
}
export interface ClientsSchema {
  clientById: Record<string, ClientSchema>;
}
export interface ClonedComponentGroupConfiguration {
  groups: ClonedComponentGroup[];
}
export interface CodeComponentInputArguments {
  events: CodeComponentActionsInput[];
  propData: CodeComponentValueInput[];
  stateVariables: CodeComponentVariableAssignment[];
}
export interface ColumnSelection {
  alias?: string;
  description: string;
  name: string;
}
export interface ComponentDesign<T> {
  breakpointOverride?: Record<string, T>;
  styleTemplateId?: string;
  variantRecord?: Record<string, Record<string, T>>;
}
export interface ComponentRefactorSocialMediaSeoConfigGroup {
  generalConfig: ComponentRefactorGeneralSocialMediaSeoConfig;
  xPlatformConfig: ComponentRefactorXPlatformSeoConfig;
}
export interface ComponentRefactorTabListItem {
  componentId: string;
  title: DataBinding;
}
export interface ConditionalChildViewConfig {
  conditionalChildViewId: string;
  initIfCondition: BoolExp<ConditionBoolExp>;
  isDefaultCase: boolean;
}
export interface ConditionalFilter {
  condition: BoolExp<ConditionBoolExp>;
  filter: RequestFilter;
  id: string;
  name: string;
}
export interface CustomLLMConfig {
  apiToken: string;
  displayName: string;
  extensionParams: Record<string, string>;
  id: Identifier;
  provider: string;
  serverUrl: string;
  type: string;
}
export interface CustomTypeDefinition {
  defs?: Record<string, Schema>;
  description?: string;
  id: string;
  name: string;
  schema: Schema;
}
export interface CustomView {
  displayName: string;
  filter: BoolExp<ConditionBoolExp>;
  id: string;
  sortList: SortItem[];
  tableName: string;
  uuid: string;
  visibleColumns: ColumnItem[];
}
export interface DataModel {
  relationMetadata: RelationMetadata[];
  tableMetadata: TableMetadata[];
}
export interface DataModelEditorConfiguration {
  fieldSequenceByTableName: Record<string, DataModelFieldConfig[]>;
}
export interface DataModelFieldConfig {
  fieldName: string;
  type: DataModelFieldType;
}
export interface DataVisualizer {
  customViews: CustomView[];
}
export interface EditorConfiguration {
  typeDefinitionGroupConfiguration: TypeDefinitionGroupConfiguration;
}
export interface GeoMapMarkerConfig {
  dataSource?: DataBinding;
  multipleMarkers: boolean;
}
export interface ImageData {
  imageObject: DataBinding;
  imageSource: DataBinding;
}
export interface IndividualBorderRadius {
  borderBottomLeft: DataBinding;
  borderBottomRight: DataBinding;
  borderTopLeft: DataBinding;
  borderTopRight: DataBinding;
}
export interface IndividualBorderWidth {
  bottom?: DataBinding;
  left?: DataBinding;
  right?: DataBinding;
  top?: DataBinding;
}
export interface InteractionProperty {
  componentFrame?: ComponentFrame;
  dataAttributes?: OverrideAttributes;
  layout?: ComponentLayout;
}
export interface OverrideRecord {
  componentFrame?: ComponentFrame;
  componentHidden?: boolean;
  dataAttributes?: OverrideAttributes;
  interactionPropertyRecord?: { [key in InteractionType]?: InteractionProperty };
  isFloating?: boolean;
  layout?: ComponentLayout;
  variantRecord?: Record<string, InteractionProperty>;
  verticalLayout?: ComponentVerticalLayout;
}
export interface PageGroup {
  groupId?: string;
  groupName: string;
  pageMRefs: string[];
}
export interface PageGroupConfiguration {
  groupList: PageGroup[];
}
export interface PermissionConfig {
  actionflowPermission: ActionflowPermission;
  paymentPermission?: PaymentPermission;
  tablePermissionById: Record<string, TablePermission>;
  tpaPermission: TpaPermission;
  zAiPermission: ZAiPermission;
}
export interface PromptComponent {
  name: string;
  required: boolean;
  value: DataBinding;
}
export interface RelationMetadata {
  displayNameInSource: string;
  displayNameInTarget: string;
  id: string;
  nameInSource: string;
  nameInTarget: string;
  sourceColumn: string;
  sourceTable: string;
  targetColumn: string;
  targetTable: string;
  type: RelationType;
}
export interface RequestFilter {
  distanceArgs?: Record<string, DataBinding>;
  distinctOnFieldNames?: string[];
  sortConfigs?: SortConfig[];
  where?: BoolExprOrAlwaysTrue;
}
export interface ScheduledJob {
  actions: EventBinding[];
  id: string;
  interval: number;
  name: string;
  startImmediately: boolean;
}
export interface ScheduledJobConfiguration {
  action: CallActionFlowAction;
  cron?: string;
  cronInputType?: CronInputType;
  enabled?: boolean;
  endInstant?: number;
  executionInstant?: ExecutionInstant;
  intervalType?: RepeatTimeInterval;
  name?: string;
  removable?: boolean;
  startInstant: number;
  triggerType?: ScheduledTriggerType;
  uniqueId: string;
}
export interface SeoPathDataValueOptions {
  optionsFromDataModel: DbQuery[];
  staticOptions: string[];
}
export interface ServerConfiguration {
  customAiModelConfigs: CustomLLMConfig[];
}
export interface ServerEditorConfiguration {
  dataModel: DataModelEditorConfiguration;
}
export interface ServerSchema {
  apiWorkSpaces?: ApiWorkSpace[];
  authenticationConfig?: AuthenticationConfig;
  callbackConfigurations?: CallbackConfiguration[];
  customAiModelConfigs?: CustomLLMConfig[];
  dataModel?: DataModel;
  draftActionFlows?: BackendActionFlow[];
  editorConfiguration?: ServerEditorConfiguration;
  paymentConfigRecord?: { [key in PaymentType]?: PaymentConfiguration };
  pendingActionFlows?: BackendActionFlow[];
  roleConfigs?: RoleConfig[];
  scheduledJobConfigurations?: ScheduledJobConfiguration[];
  thirdPartyApiConfigs?: ThirdPartyApiConfig[];
  triggerConfigurations?: TriggerConfiguration[];
  types?: TypesSchema;
  zAiConfigs?: ZAiConfig[];
}
export interface SheetColumnConfig {
  title?: DataBinding;
  width?: DataBinding;
}
export interface SheetColumnConfigEntry {
  config: SheetColumnConfig;
  key: string;
}
export interface SocialMediaSeoConfigGroup {
  generalConfig: GeneralSocialMediaSeoConfig;
  xPlatformConfig: XPlatformSeoConfig;
}
export interface TabBarItem {
  icon: DataBinding;
  isHidden: DataBinding;
  mRef: string;
  screenMRef: DataBinding;
  selectedIcon: DataBinding;
  title: DataBinding;
}
export interface TabBarSetting {
  backgroundColor: DataBinding;
  color: DataBinding;
  enabled?: boolean;
  items: TabBarItem[];
  selectedColor: DataBinding;
}
export interface TableExtension {
  columnName: string;
  customEmbeddingId?: Identifier;
  generator: VectorGenerator;
  tokenCountColumn: string;
  vectorColumn: string;
}
export interface TableSelection {
  columns: ColumnSelection[];
  relations: RelationSelection[];
}
export interface TemporalData {
  day?: DataBinding;
  hour?: DataBinding;
  millisecond?: DataBinding;
  minute?: DataBinding;
  month?: DataBinding;
  second?: DataBinding;
  year?: DataBinding;
}
export interface ThirdPartyApiConfig {
  caX509PemBase64?: string;
  description?: string;
  id: string;
  method: HttpMethod;
  name: string;
  operation: ThirdPartyRequestOperation;
  pagingConfig?: TpaPagingConfig;
  parameters: ThirdPartyParameter[];
  requestContentType?: string;
  response: ThirdPartyApiResponseConfig;
  url: string;
}
export interface ThirdPartyApiResponse {
  responseContentType?: string;
  responseData?: ThirdPartyData;
  statusCode: StatusCode;
}
export interface ThirdPartyApiResponseConfig {
  permanentFailResponse: ThirdPartyApiResponse;
  successResponse: ThirdPartyApiResponse;
  temporaryFailResponse: ThirdPartyApiResponse;
}
export interface TpaFieldSelection {
  alias?: string;
  description: string;
  fields: TpaFieldSelection[];
  name: string;
}
export interface TpaPermission {
  allowAll?: boolean;
  allowedApiIds?: string[];
  checkById?: Record<string, BoolExp<ConditionBoolExp>>;
}
export interface TypeConversionDefinition {
  description?: string;
  id: string;
  inputTypeId: string;
  name: string;
  outputTypeId: string;
  rules: Record<string, DataBinding>;
}
export interface TypeDefinitionGroup {
  groupId: string;
  groupName: string;
  typeIds: string[];
}
export interface TypeDefinitionGroupConfiguration {
  enumTypeGroups: TypeDefinitionGroup[];
  objectTypeGroups: TypeDefinitionGroup[];
  typeConversionGroups: TypeDefinitionGroup[];
  ungroupedEnumType: string[];
  ungroupedObjectType: string[];
}
export interface TypesSchema {
  conversionDefinitions?: TypeConversionDefinition[];
  definitionById?: Record<string, TypeDefinition>;
  deprecatedCustomTypeDefinitions?: Record<string, CustomTypeDefinition>;
  groupConfiguration?: TypeDefinitionGroupConfiguration;
}
export interface UploadedFileConfig {
  customEmbeddingConfigId?: Identifier;
  embeddingModel?: EmbeddingModel;
  items: UploadedFileConfigItem[];
  topK?: number;
  vectorSortSource?: DataBinding;
}
export interface UserLoginCredential {
  accountIdentifier: DataBinding;
  accountIdentifierType: string;
  credential: DataBinding;
  credentialType: string;
}
export interface Variable {
  defaultValue?: DataBinding;
  displayName?: string;
  ignoreLinkQueryWhenEmpty?: boolean;
  itemType: string | null;
  name?: string;
  nullable?: boolean;
  pathComponents?: PathComponent[];
  tpaResultSource?: StatusCode;
  type: string;
  unique?: boolean;
}
export interface ZAiPermission {
  allowAll?: boolean;
  allowedZAiIds?: string[];
  checkById?: Record<string, BoolExp<ConditionBoolExp>>;
}
export interface AuthenticationConfig {
  emailAuthConfig: GeneralConfigState;
  phoneNumberConfig: GeneralConfigState;
  ssoConfigs: OAuth2Config[];
  usernameConfig: GeneralConfigState;
  wechatConfig: WechatConfigState;
  wxworkAuthConfig: WxworkAuthConfigState;
}
export interface Bound {
  include: boolean;
  value: number;
}
export interface BreakPoint {
  panelSize: PanelSize;
  scaleRange: ScaleRange;
}
export interface CellPagingConfig {
  autoplay: boolean;
  circular: boolean;
  indicatorDots: boolean;
}
export interface ClipboardActionFlowNodesFormat {
  actionFlowNodeById: Record<string, ActionFlowNode>;
  actionFlowNodeIdInOrder: string[];
  projectExId: string;
}
export interface ClipboardActionsFormat {
  eventBindings: BaseEventBinding[];
  mRefMap: Record<string, ComponentMeta>;
  platform: Platform;
}
export interface ClipboardComponentsFormat {
  componentById: Record<string, Component>;
  mRefMap: Record<string, ComponentMeta>;
  platform: Platform;
}
export interface ClipboardConditionFormat {
  condition: BoolExp<ConditionBoolExp>;
  platform: Platform;
}
export interface ClipboardConditionalFilterFormat {
  conditionalFilter: ConditionalFilter;
  platform: Platform;
  tableName: string;
}
export interface CodeAndContentType {
  code: string;
  contentType: ApiContentType;
}
export interface CodeComponentDefinition {
  event: CodeComponentInputDefinition[];
  propData: CodeComponentInputDefinition[];
  stateData: CodeComponentInputDefinition[];
}
export interface CodeComponentInputDefinition {
  name: string;
  optional: boolean;
  type: CodeComponentPropType;
}
export interface CodeComponentItemParameter {
  fieldName: string;
  type: CustomComponentItemParameterType;
}
export interface ColumnItem {
  displayName: string;
  isHidden: boolean;
  isRelation: boolean;
  sourcePathComponents: string[];
}
export interface ColumnPathComponent {
  pathComponents: PathComponent[];
}
export interface ComponentFrame {
  position: ComponentPosition;
  size: ComponentSize;
}
export interface ComponentLayout {
  arrangement?: ComponentLayoutArrangement;
  position: ComponentLayoutPosition;
  selfAlignment?: ComponentSelfAlignment;
  size: ComponentLayoutSize;
  zIndex?: number;
}
export interface ComponentLayoutArrangement {
  config: ComponentLayoutArrangementConfig;
  type: ComponentLayoutType;
}
export interface ComponentLayoutArrangementConfig {
  align: AlignItems;
  direction: ComponentLayoutFlexDirection;
  distribution: JustifyContent;
  gap: number;
  overflow: ComponentLayoutOverflow;
  wrap: boolean;
}
export interface ComponentLayoutDimension {
  bottom: number;
  left: number;
  right: number;
  top: number;
}
export interface ComponentLayoutMeasure {
  unit: ComponentLayoutUnit;
  value: number;
}
export interface ComponentLayoutMinMaxMeasure {
  unit: ComponentLayoutUnit;
  value?: number;
}
export interface ComponentLayoutPosition {
  bottom: number;
  horizontalRef: ComponentLayoutDirection;
  left: number;
  right: number;
  top: number;
  type: Position;
  verticalRef: ComponentLayoutDirection;
}
export interface ComponentLayoutSize {
  height: ComponentLayoutMeasure;
  margin?: ComponentLayoutDimension;
  maxHeight: ComponentLayoutMinMaxMeasure;
  maxWidth: ComponentLayoutMinMaxMeasure;
  minHeight: ComponentLayoutMinMaxMeasure;
  minWidth: ComponentLayoutMinMaxMeasure;
  padding?: ComponentLayoutDimension;
  width: ComponentLayoutMeasure;
}
export interface ComponentPosition {
  x: number;
  y: number;
}
export interface ComponentSelfAlignment {
  align: AlignItems;
  justify: AlignItems;
}
export interface ComponentSize {
  height: number;
  width: number;
}
export interface ComponentVerticalLayout {
  layoutMode: LayoutMode;
  location: VerticalDirection;
  margin?: number;
  minValue?: number;
  referenceMRef?: string;
}
export interface ConditionToVerify {
  conditionId: string;
  conditionType: DataConditionType;
  errorMessage?: string;
  regExp?: string;
}
export interface ConfiguredCodeComponentRepo {
  assets: string;
  comps?: Record<string, CodeComponentDefinition>;
  exId: string;
  repo: string;
  tag: string;
  version?: number;
}
export interface CopyActionFlowNodesResultFormat {
  actionFlowNodes: ActionFlowNode[];
}
export interface DataField {
  displayName?: string;
  itemType: string | null;
  name: string;
  nullable: boolean;
  type: string;
}
export interface DataLoadingConfig {
  loadMoreEnabled: boolean;
  pullDownRefreshEnabled: boolean;
  reversed: boolean;
}
export interface EnumOption {
  id: string;
  name: string;
  value?: DataBinding;
}
export interface ExecutionInstant {
  dayOfMonth?: number;
  dayOfWeek?: number;
  hourOfDay?: number;
  minuteOfHour?: number;
  monthOfYear?: number;
  secondOfMinute: number;
}
export interface FieldDescription {
  description: string;
  fields?: Record<string, FieldDescription>;
}
export interface FileSize {
  unit: FileSizeUnit;
  value: number;
}
export interface FoldingConfig {
  foldingHeight: number;
  foldingMode: FoldingMode;
}
export interface Identifier {
  id: string;
  namespace: string;
}
export interface ItemVariable {
  args: unknown;
  displayName?: string;
  itemType: string | null;
  nullable: boolean;
  pathComponents: PathComponent[];
  type: string;
}
export interface MutationOnConflictAction {
  actionType: string;
  columns: ColumnPathComponent[];
  constraints: string[];
}
export interface NumberFormatOptions {
  fixedDigits?: number;
  lowerBound?: Bound;
  postfix?: string;
  prefix?: string;
  upperBound?: Bound;
  zeroPaddingLength?: number;
}
export interface OAuth2ProviderConfig {
  authorizationUri: string;
  issuerUri?: string;
  jwkSetUri?: string;
  tokenUri: string;
  userIdAttribute: string;
  userInfoUri: string;
}
export interface OAuth2RegistrationConfig {
  authPageParams?: Record<string, Variable>;
  authorizationGrantType: OAuth2AuthorizationGrantType;
  clientAuthenticationMethod: OAuth2ClientAuthenticationMethod;
  clientId: string;
  clientSecret: string;
  loginUri: string;
  redirectUri: string;
  scope: string[];
}
export interface PanelSize {
  height: number;
  width: number;
}
export interface PathComponent {
  componentMRef?: string;
  displayName?: string;
  itemType: string | null;
  name: string;
  tpaResultSource?: StatusCode;
  type: string;
}
export interface PropertyEntry<T> {
  name: string;
  value: T;
}
export interface RefreshPathComponent {
  cellIndex?: DataBinding;
  listMRef?: string;
}
export interface RichTextEditorHeaderConfiguration {
  fontFamilyDisabled?: boolean;
  fontSizeDisabled?: boolean;
}
export interface ScaleRange {
  max: number;
  min: number;
}
export interface SchemaWithFieldName {
  field: string;
  schema: Schema;
}
export interface ScrollTransform {
  color?: string;
  offsetX: number;
  offsetY: number;
  opacity: number;
  rotate: number;
  rotate3DEnabled: boolean;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  scale: number;
}
export interface ScrollTransformConfig {
  from: ScrollTransform;
  to: ScrollTransform;
}
export interface SelectViewItem {
  key: string;
  value: string;
}
export interface SeoConfiguration {
  renderingMethod: SeoRenderingMethod;
  robotsTxtFileContent: string;
  sitemapGenerationMethod: SitemapGenerationMethod;
}
export interface SortItem {
  columnName: string;
  id: string;
  orderBy: OrderBy;
}
export interface StripeBrandInfo {
  logo: string;
  name: string;
  slogan: string;
}
export interface TpaPagingConfig {
  pageIndexPathComponents: PathComponent[];
  pageIndexStartValue: number;
  pageSizePathComponents: PathComponent[];
  type: PagingType;
}
export interface TypeEncode {
  encodeType: DataEncode;
  jsonPath?: string;
}
export interface UploadedFileConfigItem {
  enable: boolean;
  fileExId: string;
}
export enum AIContextType {
  DB_QUERY = 'dbQuery',
  TPA_QUERY = 'tpaQuery',
  UPLOADED_FILE_CONFIG = 'uploadedFileConfig',
}
export enum APIHttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
  OPTION = 'OPTION',
  HEAD = 'HEAD',
}
export enum AggregateType {
  MAX = 'max',
  MIN = 'min',
  SUM = 'sum',
  AVG = 'avg',
}
export enum AiModel {
  CHAT_GPT_4 = 'CHAT_GPT_4',
  CHAT_GPT_3_5 = 'CHAT_GPT_3_5',
  GPT_4O_MINI = 'GPT_4O_MINI',
}
export enum AlignItems {
  FLEX_START = 'flex-start',
  CENTER = 'center',
  BASELINE = 'baseline',
  FLEX_END = 'flex-end',
}
export enum ApiContentType {
  APPLICATION_JSON = 'application/json',
  URL_ENCODED = 'application/x-www-form-urlencoded',
  FORM_DATA = 'multipart/form-data',
}
export enum ArithmeticOperator {
  INCREMENT = 'increment',
  DECREMENT = 'decrement',
}
export enum BackdropFilterType {
  BLUR = 'blur',
}
export enum BackgroundImageFitType {
  FILL = 'fill',
  FIT = 'fit',
  STRETCH = 'stretch',
  CENTER = 'center',
  TILE = 'tile',
}
export enum BillingCycleTimeUnit {
  DAY = 'DAY',
  MONTH = 'MONTH',
}
export enum BillingType {
  ONE_TIME = 'ONE_TIME',
  RECURRING = 'RECURRING',
  REFUND = 'REFUND',
  UPDATE_INVOICE = 'UPDATE_INVOICE',
}
export enum BorderStyleType {
  SOLID = 'solid',
}
export enum BoxShadowType {
  OUTSET = 'outset',
  INSET = 'inset',
}
export enum BranchType {
  MUTUAL_EXCLUSION = 'MUTUAL_EXCLUSION',
  MUTUAL_TOLERANCE = 'MUTUAL_TOLERANCE',
}
export enum BuildTarget {
  ANDROID = 'ANDROID',
  IOS = 'IOS',
  WECHAT_MINIPROGRAM = 'WECHAT_MINIPROGRAM',
  MOBILE_WEB = 'MOBILE_WEB',
  WEB = 'WEB',
}
export enum BuiltInFunction {
  GET_CURRENT_DATE = 'getCurrentDate',
  GET_CURRENT_TIME = 'getCurrentTime',
  GET_TIMESTAMP = 'getTimestamp',
  GET_CLIPBOARD_DATA = 'getClipboardData',
  GET_NULL = 'getNull',
  GET_EMPTY_TEXT = 'getEmptyText',
  GET_EMPTY_ARRAY = 'getEmptyArray',
  GET_IS_IOS = 'getIsIOS',
  GET_IS_ANDROID = 'getIsAndroid',
  GET_IS_LOGGED_IN = 'getIsLoggedIn',
  GET_LOGGED_IN_USER_ROLES = 'getLoggedInUserRoles',
  GET_PAGE_URL = 'getPageUrl',
  GET_WEB_REFERRER = 'getWebReferrer',
  GET_USER_AGENT = 'getUserAgent',
}
export enum CallbackType {
  DEFAULT = 'DEFAULT',
  WECHATPAY_MINIPROGRAM = 'WECHATPAY_MINIPROGRAM',
  WECHATPAY_PARTNER_MINIPROGRAM = 'WECHATPAY_PARTNER_MINIPROGRAM',
  OTTPAY = 'OTTPAY',
  ALIPAY_WEB = 'ALIPAY_WEB',
  STRIPE_WEB = 'STRIPE_WEB',
  MALL_BOOK = 'MALL_BOOK',
}
export enum CameraFlash {
  AUTO = 'auto',
  ON = 'on',
  OFF = 'off',
  TORCH = 'torch',
}
export enum CameraFrameSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
}
export enum CameraPosition {
  FRONT = 'front',
  BACK = 'back',
}
export enum CameraResolution {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}
export enum ClientType {
  WECHAT_MINI_PROGRAM = 'WECHAT_MINI_PROGRAM',
  WEB = 'WEB',
  MOBILE = 'MOBILE',
}
export enum ClonedComponentGroupType {
  DEFAULT = 'DEFAULT',
  CUSTOM = 'CUSTOM',
}
export enum CloseModalMode {
  CLOSE_ON_TOP = 'CLOSE_ON_TOP',
  CLOSE_ALL = 'CLOSE_ALL',
}
export enum CodeComponentPropType {
  NUMBER = 'Number',
  STRING = 'String',
  BOOLEAN = 'Boolean',
  DATE = 'Date',
  TIME = 'Time',
  DATETIME = 'DateTime',
  JSON = 'Json',
  NUMBER_ARRAY = 'NumberArray',
  STRING_ARRAY = 'StringArray',
  BOOLEAN_ARRAY = 'BooleanArray',
  DATE_ARRAY = 'DateArray',
  TIME_ARRAY = 'TimeArray',
  DATETIME_ARRAY = 'DateTimeArray',
  JSON_ARRAY = 'JsonArray',
  COMPONENT = 'Component',
  EVENT_HANDLER = 'EventHandler',
  UNKNOWN = 'Unknown',
}
export enum ColumnType {
  BIGSERIAL = 'BIGSERIAL',
  BIGINT = 'BIGINT',
  INTEGER = 'INTEGER',
  FLOAT8 = 'FLOAT8',
  DECIMAL = 'DECIMAL',
  TIMESTAMPTZ = 'TIMESTAMPTZ',
  TIMETZ = 'TIMETZ',
  DATE = 'DATE',
  INTERVAL = 'INTERVAL',
  TEXT = 'TEXT',
  BOOLEAN = 'BOOLEAN',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  IMAGE_LIST = 'IMAGE_LIST',
  FILE = 'FILE',
  GEO_POINT = 'GEO_POINT',
  JSONB = 'JSONB',
}
export enum ComponentLayoutDirection {
  TOP = 'top',
  RIGHT = 'right',
  BOTTOM = 'bottom',
  LEFT = 'left',
}
export enum ComponentLayoutFlexDirection {
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical',
}
export enum ComponentLayoutOverflow {
  SCROLL = 'scroll',
  VISIBLE = 'visible',
  HIDDEN = 'hidden',
}
export enum ComponentLayoutType {
  FLEX = 'flex',
  GRID = 'grid',
}
export enum ComponentLayoutUnit {
  FIXED = 'px',
  RELATIVE = '%',
  FIT_CONTENT = 'auto',
  FILL = 'fr',
}
export enum ComponentRefactorComponentType {
  PAGE = 'PAGE',
  BUTTON = 'BUTTON',
  TEXT = 'TEXT',
  LAYOUT_VIEW = 'LAYOUT_VIEW',
  LIST = 'LIST',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  LOTTIE = 'LOTTIE',
  WECHAT_NAVIGATION_BAR = 'WECHAT_NAVIGATION_BAR',
  RICH_TEXT = 'RICH_TEXT',
  TEXT_INPUT = 'TEXT_INPUT',
  NUMBER_INPUT = 'NUMBER_INPUT',
  VIDEO_PICKER = 'VIDEO_PICKER',
  FILE_PICKER = 'FILE_PICKER',
  TAB_VIEW = 'TAB_VIEW',
  SELECT_VIEW = 'SELECT_VIEW',
  SWITCH = 'SWITCH',
  MODAL = 'MODAL',
  MAP = 'MAP',
  MAP_MARKER = 'MAP_MARKER',
  WECHAT_ADVERT_BANNER = 'WECHAT_ADVERT_BANNER',
  LOTTIE_PROGRESS_BAR = 'LOTTIE_PROGRESS_BAR',
  CALENDAR = 'CALENDAR',
  CAMERA = 'CAMERA',
  CONDITIONAL_VIEW = 'CONDITIONAL_VIEW',
  WECHAT_OFFICIAL_ACCOUNT = 'WECHAT_OFFICIAL_ACCOUNT',
  HORIZONTAL_LINE = 'HORIZONTAL_LINE',
  CODE_COMPONENT = 'CODE_COMPONENT',
  SHEET = 'SHEET',
  HTML = 'HTML',
  RICH_TEXT_EDITOR = 'RICH_TEXT_EDITOR',
  MIX_IMAGE_PICKER = 'MIX_IMAGE_PICKER',
  DATE_TIME_PICKER = 'DATE_TIME_PICKER',
  DATA_SELECTOR = 'DATA_SELECTOR',
  PROGRESS_BAR = 'PROGRESS_BAR',
}
export enum ComponentRefactorCursorType {
  IMAGE = 'image',
  KEYWORD = 'keyword',
}
export enum ComponentRefactorFontStyle {
  NORMAL = 'normal',
  ITALIC = 'italic',
  OBLIQUE = 'oblique',
}
export enum ComponentRefactorImageSource {
  EXID = 'EXID',
  URL = 'URL',
}
export enum ComponentRefactorTextAlign {
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right',
}
export enum ComponentRefactorTextDecorationLine {
  UNDERLINE = 'underline',
  LINE_THROUGH = 'line-through',
  NONE = 'none',
}
export enum ComponentRefactorVerticalDirection {
  TOP = 'top',
  BOTTOM = 'bottom',
  BOTH = 'both',
}
export enum ComponentRefactorVideoSource {
  EXID = 'EXID',
  URL = 'URL',
  YOUTUBE = 'YOUTUBE',
}
export enum ComponentType {
  MOBILE_PAGE = 'mobile-page',
  BUTTON = 'button',
  TEXT = 'text',
  CUSTOM_VIEW = 'custom-view',
  CUSTOM_LIST = 'custom-list',
  HORIZONTAL_LIST = 'horizontal-list',
  IMAGE = 'image',
  VIDEO = 'video',
  LOTTIE = 'lottie',
  ICON = 'icon',
  MOBILE_STATUS_BAR = 'mobile-status-bar',
  WECHAT_NAVIGATION_BAR = 'wechat-navigation-bar',
  SIMPLE_LIST = 'simple-list',
  SLOT_FOOTER = 'slot-footer',
  RICH_TEXT = 'rich-text',
  INPUT = 'input',
  NUMBER_INPUT = 'number-input',
  DATA_PICKER = 'data-picker',
  IMAGE_PICKER = 'image-picker',
  VIDEO_PICKER = 'video-picker',
  FILE_PICKER = 'file-picker',
  TAB_VIEW = 'tab-view',
  BLANK_CONTAINER = 'blank-container',
  SCROLL_VIEW = 'scroll-view',
  SELECT_VIEW = 'select-view',
  SWITCH = 'switch',
  MODAL_VIEW = 'modal-view',
  MULTI_IMAGE = 'multi-image',
  MULTI_IMAGE_PICKER = 'multi-image-picker',
  MAP_VIEW = 'map-view',
  MARKER = 'marker',
  ADVERT_BANNER = 'advert-banner',
  COUNT_DOWN = 'count-down',
  PROGRESS_BAR = 'progress-bar',
  CALENDER = 'calendar',
  CAMERA_VIEW = 'camera-view',
  CONDITIONAL_CONTAINER = 'conditional-container',
  CONDITIONAL_CONTAINER_CHILD = 'conditional-container-child',
  CUSTOM_MULTI_IMAGE_PICKER = 'custom-multi-image-picker',
  WECHAT_OFFICIAL_ACCOUNT = 'wechat-official-account',
  HORIZONTAL_LINE = 'horizontal-line',
  CUSTOM_COMPONENT = 'custom-component',
  SHEET = 'sheet',
  HTML = 'html',
  WEB_PAGE = 'web-page',
  PAGING_TOOLBAR = 'paging-toolbar',
  RICH_TEXT_EDITOR = 'rich-text-editor',
  REUSABLE_COMPONENT = 'reusable-component',
  INSTANCE_COMPONENT = 'instance-component',
  MIX_IMAGE_PICKER = 'mix-image-picker',
  DATE_TIME_PICKER = 'date-time-picker',
  DATA_SELECTOR = 'data-selector',
  SIMPLE_PROGRESS_BAR = 'simple-progress-bar',
}
export enum ConditionCategory {
  CONSTANT = 'constant-condition',
  EXPRESSION = 'expression-condition',
  ENVIRONMENT = 'environment-condition',
}
export enum ConstantConditionType {
  ALWAYS = 'always',
  DEFAULT = 'default',
  NEVER = 'never',
}
export enum ContentType {
  APPLICATION_JSON = 'APPLICATION_JSON',
  TEXT_PLAIN = 'TEXT_PLAIN',
  TEXT_HTML = 'TEXT_HTML',
}
export enum CountDownActionType {
  START = 'start',
  PAUSE = 'pause',
  RESET = 'reset',
}
export enum CronInputType {
  CONFIGURED = 'CONFIGURED',
  CUSTOMIZED = 'CUSTOMIZED',
}
export enum CursorKeyword {
  INHERIT = 'inherit',
  DEFAULT = 'default',
  AUTO = 'auto',
  NONE = 'none',
  POINTER = 'pointer',
  HELP = 'help',
  NOT_ALLOWED = 'not-allowed',
  PROGRESS = 'progress',
  TEXT = 'text',
}
export enum CustomComponentItemParameterType {
  ARRAY = 'ARRAY',
  BOOLEAN = 'BOOLEAN',
  FLOAT8 = 'FLOAT8',
  IMAGE = 'IMAGE',
  INTEGER = 'INTEGER',
  OBJECT = 'OBJECT',
  TEXT = 'TEXT',
}
export enum DataBindingOperation {
  CONCAT = 'concat',
}
export enum DataConditionType {
  FILLED = 'filled',
  EMPTY = 'empty',
  EMAIL = 'email',
  PHONE_NUMBER = 'phone-number',
  AUDITED_CONTENT = 'audited-content',
  REGEX = 'regex',
}
export enum DataEncode {
  NONE_ENCODE = 'NONE_ENCODE',
  JSON_STRING_ENCODE = 'JSON_STRING_ENCODE',
  JSON_MEDIA_ENCODE = 'JSON_MEDIA_ENCODE',
  URL_MEDIA_ENCODE = 'URL_MEDIA_ENCODE',
  BASE64_MEDIA_ENCODE = 'BASE64_MEDIA_ENCODE',
}
export enum DataModelFieldType {
  COLUMN = 'COLUMN',
  RELATION_IN_SOURCE = 'RELATION_IN_SOURCE',
}
export enum DateFormat {
  ELAPSED_TIME = 'elapsed-time',
  DATE = 'yyyy/MM/dd',
  MONTH_DAY = 'MM/dd',
  DATE_TIME = 'yyyy/MM/dd HH:mm',
  DAY_OF_WEEK = 'E',
  TIME = 'HH:mm',
  MONTH_DAY_YEAR = 'MM/dd/yyyy',
  MMM_DO_YYYY = 'MMM. Do, YYYY',
  DEFAULT = 'yyyy/MM/ddThh:mmTZD',
}
export enum DateTimePickerMode {
  TIME = 'TIME',
  DATE = 'DATE',
}
export enum DateTimeType {
  DATE = 'DATE',
  TIME = 'TIME',
  TIMESTAMP = 'TIMESTAMP',
}
export enum DateTimeUnit {
  YEAR = 'year',
  MONTH = 'month',
  DAY = 'day',
  HOUR = 'hour',
  MINUTE = 'minute',
  SECOND = 'second',
  MILLISECONDS = 'millisecond',
  WEEKDAY = 'weekday',
  WEEK = 'week',
}
export enum DbOperationType {
  INSERT = 'INSERT',
  UPDATE = 'UPDATE',
  INSERT_OR_UPDATE = 'INSERT_OR_UPDATE',
  DELETE = 'DELETE',
}
export enum DistanceMeasurement {
  METER = 'METER',
  KILOMETER = 'KILOMETER',
  MILE = 'MILE',
}
export enum EmbeddingModel {
  TEXT_EMBEDDING_ADA_002 = 'TEXT_EMBEDDING_ADA_002',
  ZHIPU_TEXT_EMBEDDING = 'ZHIPU_TEXT_EMBEDDING',
}
export enum EnvironmentConditionType {
  OS_TYPE = 'os-type',
  WECHAT_PERMISSION = 'wechat-permission',
}
export enum EventType {
  SWITCH_VIEW_CASE = 'switch-view-case',
  RERUN_CONDITION = 'rerun-condition',
  NAVIGATION = 'navigation',
  MUTATION = 'mutation',
  TRIGGER_MUTATION = 'trigger-mutation',
  THIRD_PARTY_API = 'thirdParty-api',
  FUNCTOR_API = 'functor-api',
  FUNCTOR = 'functor',
  BATCH_MUTATION = 'batch-mutation',
  QUERY = 'query',
  SUBSCRIPTION = 'subscription',
  SET_INPUT_VALUE = 'set-input-value',
  RESET_INPUT_VALUE = 'reset-input-value',
  SET_PAGE_DATA = 'set-page-data',
  SET_GLOBAL_DATA = 'set-global-data',
  REFRESH = 'refresh',
  REFRESH_LIST = 'refresh-list',
  REFRESH_CELL = 'refresh-cell',
  REFRESH_LOGIN_USER = 'refresh-login-user',
  USER_REGISTER = 'user-register',
  USER_LOGIN = 'user-login',
  SEND_VERIFICATION_CODE = 'send-verification-code',
  CHECK_VERIFICATION_CODE = 'check-verification-code',
  CONDITIONAL = 'conditional',
  SHOW_MODAL = 'show-modal',
  HIDE_MODAL = 'hide-modal',
  SHOW_TOAST = 'show-toast',
  OPEN_EXTERNAL_LINK = 'open-external-link',
  AUDIO = 'audio',
  VIDEO = 'video',
  FULLSCREEN_IMAGE = 'fullscreen-image',
  GET_LOCATION = 'get-location',
  OPEN_LOCATION = 'open-location',
  CHOOSE_LOCATION = 'choose-location',
  SCROLL_TO = 'scroll-to',
  UPLOAD_FILE = 'upload-file',
  SCROLL_PAGE_TO = 'scroll-page-to',
  LOTTIE = 'lottie',
  WECHAT_NOTIFICATION = 'wechat-notification',
  SMS_NOTIFICATION = 'sms-notification',
  NOTIFICATION_AUTHORIZATION = 'notification-authorization',
  GENERATE_QR_CODE = 'generate-qr-code',
  GENERATE_MINI_PROGRAM_CODE = 'generate-mini-program-code',
  SCAN_QR_CODE = 'scan-qr-code',
  PREVIEW_DOCUMENT = 'preview-document',
  SCROLL_HORIZONTAL_LIST = 'scroll-horizontal-list',
  GET_ADMINISTRATION_AREA = 'get-administration-area',
  SET_FOLD_MODE = 'set-fold-mode',
  IMAGE_PICKER_ADD_IMAGE = 'image-picker-add-image',
  IMAGE_PICKER_DELETE_IMAGE = 'image-picker-delete-image',
  IMAGE_PICKER_REPLACE_IMAGE = 'image-picker-replace-image',
  LIST_ACTION = 'list-action',
  IMAGE_FILTER = 'image-filter',
  EDIT_FILTER_AND_STICKER = 'edit-filter-and-sticker',
  ACTION_FLOW = 'action-flow',
  ZAI_TASK = 'zai-task',
  AI_CREATE_CONVERSATION = 'ai-create-conversation',
  AI_DELETE_CONVERSATION = 'ai-delete-conversation',
  AI_SEND_MESSAGE = 'ai-send-message',
  AI_OBTAIN_INFO = 'ai-obtain-info',
  AI_STOP_RESPONSE = 'ai-stop-response',
  SHARE = 'share',
  LOG = 'log',
  COUNTDOWN = 'countdown',
  SET_CLIPBOARD = 'set-clipboard',
  CALL_PHONE = 'call-phone',
  TAKE_PHOTO = 'take-photo',
  OBTAIN_PHONE_NUMBER = 'obtain-phone-number',
  OPEN_WEB_VIEW = 'open-web-view',
  CONFIGURE_CAMERA = 'configure-camera',
  OPEN_WECHAT_SETTING = 'open-wechat-setting',
  WECHAT_CONTACT = 'wechat-contact',
  OPEN_REWARDED_VIDEO_AD = 'open-rewarded-video-ad',
  OPEN_CHANNELS_LIVE = 'open-channels-live',
  NAVIGATE_TO_MINI_PROGRAM = 'navigate-to-mini-program',
  MODIFY_JSONB = 'modify-jsonb',
  USERNAME_REGISTER = 'username-register',
  PHONE_NUMBER_REGISTER = 'phone-number-register',
  EMAIL_REGISTER = 'email-register',
  USERNAME_LOGIN = 'username-login',
  PHONE_NUMBER_CODE_LOGIN = 'phone-number-login',
  PHONE_NUMBER_PASSWORD_LOGIN = 'phone-number-password-login',
  EMAIL_LOGIN = 'email-login',
  PHONE_NUMBER_RESET_PASSWORD = 'phone-number-reset-password',
  EMAIL_RESET_PASSWORD = 'email-reset-password',
  WECHAT_LOGIN = 'wechat-login',
  WEB_SILENT_LOGIN = 'web-silent-login',
  WECHAT_AUTHENTICATE_LOGIN = 'wechat-authenicate-login',
  WXWORK_AUTHENTICATE_LOGIN = 'wxwork-authenicate-login',
  ACCOUNT_BIND_PHONE_NUMBER = 'account-bind-phone-number',
  ACCOUNT_UNBIND_PHONE_NUMBER = 'account-unbind-phone-number',
  ACCOUNT_BIND_EMAIL = 'account-bind-email',
  ACCOUNT_UNBIND_EMAIL = 'account-unbind-email',
  DELETE_ACCOUNT_BY_VERIFICATION_CODE = 'delete-account-by-verification-code',
  DELETE_ACCOUNT_BY_PASSWORD = 'delete-account-by-password',
  LIST_LOAD_MORE = 'list-load-more',
  SHARE_TO_WEIBO = 'share-to-weibo',
  SHARE_TO_TWITTER = 'share-to-twitter',
  DOWNLOAD_IMAGE = 'download-image',
  DOWNLOAD_FILE = 'download-file',
  OBTAIN_WE_RUN_DATA = 'obtain-we-run-data',
  ADD_PHONE_CONTACT = 'add-phone-contact',
  PRINT_COMPONENT = 'print-component',
  WECHAT_PAYMENT = 'wechat-payment',
  WECHAT_ORDER_AND_CALL_PAYMENT = 'wechat-order-and-call-payment',
  ALI_PAYMENT = 'ali-payment',
  MALLBOOK_DEPOSIT = 'mallbook-deposit',
  COMPLETE_PERSONAL_INFO = 'complete-personal-info',
  COMPONENT_TO_IMAGE = 'component-to-image',
  SSO_LOGIN_OR_REGISTER = 'sso-login-or-register',
  SSO_BIND = 'sso-bind',
  SSO_UNBIND = 'sso-unbind',
  STRIPE_PAYMENT = 'stripe-payment',
  SCHEDULED_JOB_CONTROL = 'scheduled-job-control',
  SCROLL_TO_BOTTOM = 'scroll-to-bottom',
  WECHAT_GET_PRIVACY_SETTING = 'wechat-get-privacy-setting',
  WECHAT_OPEN_PRIVACY_CONTRACT = 'wechat-open-privacy-contract',
  WECHAT_AGREE_PRIVACY_AUTHORIZATION = 'wechat-agree-privacy-authorization',
  WECHAT_SAVE_VIDEO_TO_ALBUM = 'wechat-save-video-to-album',
  WECHAT_SHIPMENT = 'wechat-shipment',
  WECHAT_RECEIPT = 'wechat-receipt',
  WECHAT_OPEN_CHANNELS = 'wechat-open-channels',
  WECHAT_ADD_PHONE_CALENDAR = 'wechat-add-phone-calendar',
  EXPORT = 'export',
  ALIPAY_RECURRING_PAYMENT = 'alipay-recurring-payment',
  ALIPAY_CANCEL_RECURRING_PAYMENT = 'alipay-cancel-recurring-payment',
  STRIPE_RECURRING_PAYMENT = 'stripe-recurring-payment',
  STRIPE_CANCEL_RECURRING_PAYMENT = 'stripe-cancel-recurring-payment',
  WECHAT_REFUND = 'wechat-refund',
  ALIPAY_REFUND = 'alipay-refund',
  STRIPE_REFUND = 'stripe-refund',
  ANIMATION_SLIDE_EFFECT = 'animation-slide-effect',
  ANIMATION_FADE_EFFECT = 'animation-fade-effect',
  ANIMATION_SCALE_EFFECT = 'animation-scale-effect',
  ANIMATION_FLIP_EMPHASIS = 'animation-flip-emphasis',
  ANIMATION_COMMON_EMPHASIS = 'animation-common-emphasis',
  ANIMATION_SCROLLING_INTERACTION = 'animation-scrolling-interaction',
  ANIMATION_VARIANT_INTERACTION = 'animation-variant-interaction',
  SHOW_MODAL_WITH_CALLBACK_EVENTS = 'show-modal-with-callback-events',
  SET_VARIABLE_DATA = 'set-variable-data',
  CLOSE_MODAL = 'close-modal',
  NAVIGATION_GO_TO_WECHAT = 'navigation-go-to-wechat',
  NAVIGATION_GO_TO_WEB = 'navigation-go-to-web',
  NAVIGATION_GO_TO_MOBILE = 'navigation-go-to-mobile',
  NAVIGATION_GO_BACK = 'navigation-go-back',
  COMPONENT_TO_BITMAP = 'component-to-bitmap',
  DOWNLOAD_BITMAP = 'download-bitmap',
  TRANSFORM_BITMAP_TO_IMAGE = 'transform-bitmap-to-image',
  TRANSFORM_IMAGE_TO_BITMAP = 'transform-image-to-bitmap',
}
export enum FileSizeUnit {
  KB = 'KB',
  MB = 'MB',
  GB = 'GB',
  INF = 'INF',
}
export enum FileSource {
  EXID = 'EXID',
}
export enum FlexDirection {
  ROW = 'row',
  COLUMN = 'column',
}
export enum FlexWrap {
  WRAP = 'wrap',
  NOWRAP = 'nowrap',
  WRAP_REVERSE = 'wrap-reverse',
}
export enum FoldingMode {
  NONE = 'none',
  FOLDED = 'folded',
  UNFOLDED = 'unfolded',
}
export enum FullScreenImageMode {
  FROM_CURRENT_IMAGE = 'FROM_CURRENT_IMAGE',
  FROM_IMAGE_SOURCE = 'FROM_IMAGE_SOURCE',
}
export enum GeoPointGetValueType {
  LATITUDE = 'latitude',
  LONGITUDE = 'longitude',
}
export enum HeaderTag {
  H1 = 'h1',
  H2 = 'h2',
  H3 = 'h3',
  H4 = 'h4',
  H5 = 'h5',
  H6 = 'h6',
}
export enum HorizontalDirection {
  LEFT = 'left',
  RIGHT = 'right',
  BOTH = 'both',
}
export enum HorizontalLineDirection {
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical',
}
export enum HorizontalLineType {
  SOLID = 'solid',
  DASH = 'dash',
  WAVY = 'wavy',
}
export enum HtmlMode {
  CODE = 'code',
  IFRAME = 'iframe',
}
export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}
export enum ImageInputQuality {
  LOW = 'LOW',
  HIGH = 'HIGH',
}
export enum InputValueType {
  TEXT = 'TEXT',
  BIGINT = 'BIGINT',
  NUMERIC = 'Numeric',
  DECIMAL = 'DECIMAL',
}
export enum InputVariableCategory {
  GENERAL = 'GENERAL',
  URL_PATH = 'URL_PATH',
  URL_QUERY = 'URL_QUERY',
}
export enum InteractionType {
  HOVER = 'hover',
  CLICK = 'click',
  SCROLL_INTO = 'scrollInto',
  SCROLLING = 'scrolling',
}
export enum JustifyContent {
  START = 'start',
  CENTER = 'center',
  END = 'end',
  SPACE_BETWEEN = 'space-between',
  SPACE_AROUND = 'space-around',
  SPACE_EVENLY = 'space-evenly',
}
export enum KeywordLinearGradientDirectionValue {
  TO_TOP = 'to top',
  TO_BOTTOM = 'to bottom',
  TO_LEFT = 'to left',
  TO_RIGHT = 'to right',
  TO_TOP_LEFT = 'to top left',
  TO_TOP_RIGHT = 'to top right',
  TO_BOTTOM_LEFT = 'to bottom left',
  TO_BOTTOM_RIGHT = 'to bottom right',
}
export enum LayoutDisplay {
  FLEX = 'flex',
  GRID = 'grid',
  BLOCK = 'block',
  NONE = 'none',
}
export enum LayoutMode {
  FIXED = 'fixed',
  WRAP_CONTENT = 'wrap-content',
  FILL_PARENT = 'fill-parent',
}
export enum LengthUnit {
  FIXED = 'px',
  RELATIVE = '%',
  AUTO = 'auto',
}
export enum LinearGradientDirectionType {
  ANGLE = 'angle',
  KEYWORD = 'keyword',
}
export enum ListDataAccessMode {
  REMOTE = 'remote',
  LOCAL = 'local',
}
export enum ListDirection {
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical',
}
export enum ListViewAutoScrollToTopOnRefreshMode {
  ALWAYS = 'always',
  REFRESH_ACTION = 'refresh-action',
  AUTO_REFRESH = 'auto-refresh',
  NEVER = 'never',
}
export enum LiteralCategory {
  STRING = 'STRING',
  DECIMAL = 'DECIMAL',
  BIGINT = 'BIGINT',
  BOOLEAN = 'BOOLEAN',
  TIMESTAMPTZ = 'TIMESTAMPTZ',
  TIMETZ = 'TIMETZ',
  DATE = 'DATE',
  JSONB = 'JSONB',
  GEO_POINT = 'GEO_POINT',
}
export enum LottieAction {
  PLAY = 'play',
  STOP = 'stop',
  PAUSE = 'pause',
  PLAY_SEGMENTS = 'playSegments',
  SET_DIRECTION = 'setDirection',
}
export enum MapType {
  A_MAP = 'A_MAP',
  MAP_BOX = 'MAP_BOX',
}
export enum MediaAction {
  PLAY = 'play',
  PAUSE = 'pause',
  STOP = 'stop',
}
export enum MiniAppCodeType {
  WECHAT = 'wechat',
  CUSTOM = 'custom',
}
export enum ModifyJsonbActionType {
  SET_VALUE = 'setValue',
  REMOVE_JSON_NODE = 'removeJsonNode',
}
export enum MutationOp {
  INSERT = 'insert',
  UPSERT = 'upsert',
  UPDATE = 'update',
  DELETE = 'delete',
}
export enum NavigationOperation {
  GO = 'go',
  GO_BACK = 'go-back',
}
export enum NumberFormatEnum {
  COUNT_DOWN_MINUTE_SECOND = 'COUNT_DOWN_MINUTE_SECOND',
  COUNT_DOWN_HH_MM_SS = 'COUNT_DOWN_HH_MM_SS',
  METER_TO_KILOMETER = 'METER_TO_KILOMETER',
  THOUSANDS_SEPARATOR = 'THOUSANDS_SEPARATOR',
}
export enum OAuth2AuthorizationGrantType {
  AUTHORIZATION_CODE = 'AUTHORIZATION_CODE',
  CLIENT_CREDENTIALS = 'CLIENT_CREDENTIALS',
  PASSWORD = 'PASSWORD',
  JWT_BEARER = 'JWT_BEARER',
}
export enum OAuth2ClientAuthenticationMethod {
  CLIENT_SECRET_BASIC = 'CLIENT_SECRET_BASIC',
  CLIENT_SECRET_POST = 'CLIENT_SECRET_POST',
  CLIENT_SECRET_JWT = 'CLIENT_SECRET_JWT',
  PRIVATE_KEY_JWT = 'PRIVATE_KEY_JWT',
}
export enum ObjectFit {
  CONTAIN = 'contain',
  COVER = 'cover',
  FILL = 'fill',
}
export enum OrderBy {
  ASC_NULLS_LAST = 'asc_nulls_last',
  DESC_NULLS_LAST = 'desc_nulls_last',
}
export enum Overflow {
  SCROLL = 'scroll',
  VISIBLE = 'visible',
  HIDDEN = 'hidden',
  AUTO = 'auto',
}
export enum PagingType {
  SIZE_AND_INDEX = 'SIZE_AND_INDEX',
}
export enum ParamPosition {
  BODY = 'BODY',
  HEADER = 'HEADER',
  QUERY = 'QUERY',
  PATH = 'PATH',
}
export enum PaymentType {
  STRIPE = 'STRIPE',
  ALIPAY = 'ALIPAY',
  WECHAT = 'WECHAT',
}
export enum Platform {
  WECHAT = 'WECHAT',
  WEB = 'WEB',
  MOBILE = 'MOBILE',
}
export enum Position {
  RELATIVE = 'relative',
  ABSOLUTE = 'absolute',
  FIXED = 'fixed',
}
export enum ProgressBarFormat {
  NONE = 'none',
  PERCENTAGE = 'percentage',
  VALUE = 'value',
}
export enum ProgressBarMode {
  LINE = 'line',
  CIRCLE = 'circle',
}
export enum ReferenceLocation {
  CUSTOM_TYPE = 'CUSTOM_TYPE',
  DATA_MODEL = 'DATA_MODEL',
  TYPE_DEFINITION = 'TYPE_DEFINITION',
}
export enum RelationType {
  ONE_TO_ONE = 'ONE_TO_ONE',
  ONE_TO_MANY = 'ONE_TO_MANY',
  MANY_TO_MANY = 'MANY_TO_MANY',
}
export enum RepeatTimeInterval {
  EVERY_MINUTE = 'EVERY_MINUTE',
  EVERY_HOUR = 'EVERY_HOUR',
  EVERY_DAY = 'EVERY_DAY',
  EVERY_WEEK = 'EVERY_WEEK',
  EVERY_MONTH = 'EVERY_MONTH',
  EVERY_YEAR = 'EVERY_YEAR',
}
export enum ResponseConfigCategory {
  FALLBACK = 'FALLBACK',
  CUSTOM = 'CUSTOM',
}
export enum RoundingMode {
  HALF_EVEN = 'HALF_EVEN',
  HALF_UP = 'HALF_UP',
  HALF_DOWN = 'HALF_DOWN',
  UP = 'UP',
  DOWN = 'DOWN',
  CEILING = 'CEILING',
  FLOOR = 'FLOOR',
}
export enum ScheduledJobControlAction {
  START = 'start',
  PAUSE = 'pause',
}
export enum ScheduledTriggerType {
  SIMPLE_TRIGGER = 'SIMPLE_TRIGGER',
}
export enum ScreenTransitionType {
  PUSH = 'push',
  SWITCH_TO = 'switch-to',
  REDIRECT = 'redirect',
  RELAUNCH = 'reLaunch',
  NEW_TAB = 'new-tab',
}
export enum ScrollHorizontalListDirection {
  BACKWARD = 'backward',
  FORWARD = 'forward',
}
export enum ScrollPageToMode {
  COMPONENT = 'component',
  TOP = 'top',
}
export enum ScrollToMode {
  INDEX = 'index',
  BOTTOM = 'bottom',
  TOP = 'top',
  NEXT = 'next',
  PREV = 'prev',
}
export enum SelectViewSourceType {
  QUERY = 'QUERY',
  LOCAL = 'LOCAL',
}
export enum SendVerificationCodeContactType {
  PHONE = 'phone',
  EMAIL = 'email',
}
export enum SendVerificationCodeType {
  REGISTER = 'register',
  LOGIN = 'login',
  RESET = 'reset',
  BIND_ACCOUNT = 'bind-account',
  UNBIND_ACCOUNT = 'unbind-account',
  DELETE = 'delete',
}
export enum SeoRenderingMethod {
  CSR = 'CSR',
  SSR = 'SSR',
  SSG = 'SSG',
}
export enum SetDataOp {
  ASSIGN = 'assign',
  APPEND = 'append',
  REMOVE = 'remove',
}
export enum SheetDataSourceType {
  DB_QUERY = 'DB_QUERY',
}
export enum ShippingMode {
  LOGISTICS = 'LOGISTICS',
  SAME_CITY = 'SAME_CITY',
  PICK_UP = 'PICK_UP',
  DIGITAL = 'DIGITAL',
}
export enum ShowModalMode {
  ALERT = 'alert',
  CUSTOM = 'custom',
}
export enum SitemapGenerationMethod {
  AUTO = 'AUTO',
  BY_PATH_DATA = 'BY_PATH_DATA',
}
export enum SizeMinMaxUnit {
  FIXED = 'px',
  RELATIVE = '%',
}
export enum SizeUnit {
  FIXED = 'px',
  RELATIVE = '%',
  FILL = 'fr',
  FIT_CONTENT = 'fit-content',
}
export enum SocialMediaConfigValueType {
  USE_SEO_TDK = 'USE_SEO_TDK',
  DATA_BINDING = 'DATA_BINDING',
}
export enum SortType {
  DESCENDING = 'descending',
  ASCENDING = 'ascending',
}
export enum SsoPageType {
  M_REF = 'mRef',
  URL = 'url',
}
export enum SsoProtocol {
  OAUTH2 = 'OAUTH2',
}
export enum SsoType {
  GOOGLE = 'GOOGLE',
  FACEBOOK = 'FACEBOOK',
  CUSTOM_SSO = 'CUSTOM_SSO',
}
export enum StatusCode {
  SUCCESS = '2xx',
  PERMANENT_FAIL = '4xx',
  TEMPORARY_FAIL = '5xx',
}
export enum StyleSyntax {
  UNSET = 'unset',
}
export enum SwitchStyleType {
  SWITCH = 'SWITCH',
  TICK_CHECKBOX = 'TICK_CHECKBOX',
  ROUND_CHECKBOX = 'ROUND_CHECKBOX',
}
export enum TPADataType {
  TEXT = 'TEXT',
  FLOAT8 = 'FLOAT8',
  INTEGER = 'INTEGER',
  BIGINT = 'BIGINT',
  DECIMAL = 'DECIMAL',
  BOOLEAN = 'BOOLEAN',
  OBJECT = 'OBJECT',
  ARRAY = 'ARRAY',
  IMAGE = 'IMAGE',
}
export enum TabMode {
  CUSTOM = 'CUSTOM',
  NORMAL = 'NORMAL',
}
export enum TemporalUnit {
  YEAR = 'year',
  MONTH = 'month',
  DAY = 'day',
  HOUR = 'hour',
  MINUTE = 'minute',
  SECOND = 'second',
}
export enum TextDecorationStyle {
  SOLID = 'solid',
  WAVY = 'wavy',
  DASHED = 'dashed',
}
export enum TextDisplayMode {
  NORMAL = 'normal',
  RICH_TEXT = 'richText',
  MARKDOWN = 'markdown',
}
export enum ThirdPartyRequestOperation {
  QUERY = 'query',
  MUTATION = 'mutation',
}
export enum TimeDirection {
  LATER = 'later',
  BEFORE = 'before',
}
export enum TriggerType {
  DB_TRIGGER = 'DB_TRIGGER',
}
export enum TypeDefinitionCategory {
  OBJECT = 'OBJECT',
  ENUM = 'ENUM',
}
export enum TypeSchemaEnum {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  DECIMAL = 'DECIMAL',
  INTEGER = 'INTEGER',
  BOOLEAN = 'BOOLEAN',
  TIMESTAMPTZ = 'TIMESTAMPTZ',
  TIME = 'TIME',
  DATE = 'DATE',
  GEO_POINT = 'GEO_POINT',
  JSONB = 'JSONB',
  OBJECT = 'OBJECT',
  ARRAY = 'ARRAY',
  NULL = 'NULL',
}
export enum UploadSizeType {
  DEFAULT = 'default',
  ORIGINAL = 'original',
  COMPRESSED = 'compressed',
}
export enum UploadStrategy {
  DEFAULT = 'DEFAULT',
}
export enum UserLoginActionType {
  WECHAT_LOGIN = 'wechat-login',
  WECHAT_SILENT_LOGIN = 'wechat-silent-login',
  WECHAT_PHONE_NUMBER_LOGIN = 'wechat-phone-number-login',
  LOGIN = 'login',
  LOGOUT = 'logout',
}
export enum ValueBindingKind {
  LITERAL = 'literal',
  COLUMN_NAME = 'columnName',
  EMPTY = 'empty',
  VARIABLE = 'variable',
  FUNCTION = 'function',
  FORMULA = 'formula',
  THEME = 'theme',
  CONDITIONAL = 'conditional',
  LIST = 'list',
  JSON = 'json',
  ENUM_OPTION = 'enumOption',
  CUSTOM_ARRAY = 'customArray',
  CUSTOM_OBJECT = 'customObject',
  IMAGE = 'image',
  VIDEO = 'video',
  FILE = 'file',
  INPUT = 'input',
  SELECTION = 'selection',
  ARRAY_ELEMENT_MAPPING = 'arrayElementMapping',
}
export enum VectorCalculation {
  EUCLIDEAN = 'EUCLIDEAN',
  COSINE = 'COSINE',
}
export enum VectorGenerator {
  CHAT_GPT_4 = 'CHAT_GPT_4',
  TEXT_EMBEDDING_ADA_002 = 'TEXT_EMBEDDING_ADA_002',
  ZHIPU_TEXT_EMBEDDING = 'ZHIPU_TEXT_EMBEDDING',
}
export enum VerticalDirection {
  TOP_DOWN = 'top-down',
  BOTTOM_UP = 'bottom-up',
}
export enum VideoSource {
  UPLOAD = 'upload',
  VIDEO = 'video',
  YOUTUBE = 'youtube',
  URL = 'url',
}
export enum WechatOpenChannelsType {
  USER_PROFILE = 'user-profile',
  LIVE = 'live',
  ACTIVITY = 'activity',
  EVENT = 'event',
}
export enum XPlatformCardType {
  SUMMARY = 'SUMMARY',
  SUMMARY_WITH_LARGE_IMAGE = 'SUMMARY_WITH_LARGE_IMAGE',
}
export enum ZAiToolType {
  ACTION_FLOW = 'ACTION_FLOW',
  TPA = 'TPA',
  ZAI = 'ZAI',
  OBTAIN_MORE_INFORMATION = 'OBTAIN_MORE_INFORMATION',
  STRUCTURED_OUTPUT = 'STRUCTURED_OUTPUT',
}
export type BackendActionFlowNodeType = BackendOnlyActionFlowNodeType | GeneralActionFlowNodeType;

export type FrontendActionFlowNodeType = FrontendOnlyActionFlowNodeType | GeneralActionFlowNodeType;

export type CombinedStyleAttributes =
  | BlankContainerAttributes
  | ButtonAttributes
  | CalendarAttributes
  | CodeComponentAttributes
  | ConditionalContainerAttributes
  | ConditionalContainerChildAttributes
  | CountDownAttributes
  | CustomListAttributes
  | CustomMultiImagePickerAttributes
  | CustomViewAttributes
  | DataPickerAttributes
  | DataSelectorAttributes
  | DateTimePickerAttributes
  | ImageAttributes
  | ImagePickerAttributes
  | InputAttributes
  | MapViewAttributes
  | ModalViewAttributes
  | MultiImageAttributes
  | MultiImagePickerAttributes
  | NumberInputAttributes
  | OverrideAttributes
  | RichTextEditorAttributes
  | ScrollViewAttributes
  | SelectViewAttributes
  | VideoAttributes
  | VideoPickerAttributes;

export type LoginConfigState =
  | GeneralConfigState
  | OAuth2Config
  | WechatConfigState
  | WxworkAuthConfigState;

export type Emphasis =
  | AnimationCommonEmphasis
  | AnimationFlipEmphasis
  | CommonEmphasis
  | FlipEmphasis;

export type BlockEndNode = BranchMerge | ConcurrentBranchMerge | ForEachEnd | SuccessFailMerge;

export type BackgroundAttributes = CombinedStyleAttributes | DraggableScreenAttributes;

export type TextStyleAttributes =
  | ButtonAttributes
  | CountDownAttributes
  | OverrideAttributes
  | TextAttributes;

export type PropertyMappable = ArrayElementMapping | InputBinding | VariableBinding;

export type BlockCreatable =
  | BranchSeparation
  | CallAction
  | ConcurrentBranchSeparation
  | ForEachStart;

export type ColumnOperator = GenericOperator | TextOperator;

export type ExpressionConditionType = BooleanOperator | CollectionOperator | GenericOperator;

export type ComponentBinding = InputBinding;

export type GenerateImageEventBinding =
  | GenerateMiniProgramCodeEventBinding
  | GenerateQRCodeEventBinding;

export type HasGlobalTargetPageComponentIdEventBinding =
  | GenerateMiniProgramCodeEventBinding
  | NavigationActionEventBinding
  | NavigationGoBackEventBinding
  | SsoBindEventBinding
  | SsoLoginOrRegisterEventBinding
  | WechatShareEventBinding;

export type HasTargetComponentIdForAssignEventBinding =
  | ResetInputValueEventBinding
  | SetInputValueEventBinding;

export type HasTargetModalIdEventBinding = ShowModalWithCallbackEventsEventBinding;

export type NavigationGoToEventBinding =
  | MobileNavigationGotoEventBinding
  | WebNavigationGoToEventBinding
  | WechatNavigationGotoEventBinding;

export type FullScreenImageEventBinding =
  | FullScreenCurrentImageEventBinding
  | FullScreenImagesFromDataSourceEventBinding;

export type HasAIConfigIdEventBinding =
  | AICreateConversationEventBinding
  | AIDeleteConversationEventBinding
  | AIObtainInfoEventBinding
  | AISendMessageEventBinding
  | AIStopResponseEventBinding
  | ZAITaskEventBinding;

export type HasAIConfigInputEventBinding = AICreateConversationEventBinding | ZAITaskEventBinding;

export type HasAIConversationIdEventBinding =
  | AIDeleteConversationEventBinding
  | AISendMessageEventBinding
  | AIStopResponseEventBinding;

export type HasArgsEventBinding =
  | GenerateMiniProgramCodeEventBinding
  | GenerateQRCodeEventBinding
  | LogEventBinding
  | NavigateToMiniProgramEventBinding;

export type HasAssignToEventBinding =
  | AICreateConversationEventBinding
  | AISendMessageEventBinding
  | ChooseLocationEventBinding
  | EditFilterAndStickerEventBinding
  | FunctorEventBinding
  | GenerateImageEventBinding
  | GetAdministrationAreaEventBinding
  | GetLocationEventBinding
  | ImageFilterEventBinding
  | ObtainPhoneNumberEventBinding
  | ObtainWeRunDataEventBinding
  | ScanQRCodeEventBinding
  | SetDataEventBinding
  | TakePhotoEventBinding
  | TransformBitmapToImageEventBinding
  | TransformImageToBitmapEventBinding
  | UploadFileEventBinding
  | ZAITaskEventBinding;

export type HasIndexEventBinding =
  | ImagePickerDeleteImageEventBinding
  | ImagePickerReplaceImageEventBinding
  | RefreshCellEventBinding;

export type HasTargetComponentIdEventBinding =
  | ComponentToBitmapEventBinding
  | ComponentToImageEventBinding
  | ConfigureCameraEventBinding
  | CountDownEventBinding
  | ExportSheetEventBinding
  | HasGlobalTargetPageComponentIdEventBinding
  | HasTargetComponentIdForAssignEventBinding
  | HasTargetModalIdEventBinding
  | HideModalEventBinding
  | ImagePickerAddImageEventBinding
  | ImagePickerDeleteImageEventBinding
  | ImagePickerReplaceImageEventBinding
  | ListLoadMoreEventBinding
  | LottieEventBinding
  | NavigationGoToEventBinding
  | PrintComponentEventBinding
  | RefreshCellEventBinding
  | RerunConditionEventBinding
  | ScrollHorizontalListEventBinding
  | ScrollPageToEventBinding
  | ScrollToBottomEventBinding
  | ScrollToEventBinding
  | SetFoldModeEventBinding
  | SetVariableDataEventBinding
  | ShowModalEventBinding
  | SwitchViewCaseEventBinding
  | VideoEventBinding;

export type MutationRequest = CustomRequestEventBinding | MutationEventBinding;

export type SsoEventBinding =
  | SsoBindEventBinding
  | SsoLoginOrRegisterEventBinding
  | SsoUnbindEventBinding;

export type TriggerEventBinding = NotificationEventBinding | TriggerMutationEventBinding;

export type ComponentRefactorInteraction =
  | AnimationCommonEmphasis
  | AnimationFadeEffect
  | AnimationFlipEmphasis
  | AnimationScaleEffect
  | AnimationScrollingInteraction
  | AnimationSlideEffect
  | AnimationVariantInteraction;

export type EventBinding =
  | AICreateConversationEventBinding
  | AIDeleteConversationEventBinding
  | AIObtainInfoEventBinding
  | AISendMessageEventBinding
  | AIStopResponseEventBinding
  | AccountBindEmailEventBinding
  | AccountBindPhoneNumberEventBinding
  | AccountUnbindEmailEventBinding
  | AccountUnbindPhoneNumberEventBinding
  | ActionFlowEventBinding
  | AddPhoneContactEventBinding
  | AliPaymentEventBinding
  | AlipayRecurringPaymentEventBinding
  | AudioEventBinding
  | CallPhoneEventBinding
  | CancelRecurringPaymentEventBinding
  | CheckVerificationCodeEventBinding
  | ChooseLocationEventBinding
  | CloseModalEventBinding
  | CompletePersonalInfoEventBinding
  | ConditionalActionEventBinding
  | CustomRequestEventBinding
  | DeleteAccountByPasswordEventBinding
  | DeleteAccountByVerificationCodeEventBinding
  | DeprecatedWechatPaymentEventBinding
  | DownloadBitmapEventBinding
  | DownloadFileEventBinding
  | DownloadImageEventBinding
  | EditFilterAndStickerEventBinding
  | EmailLoginEventBinding
  | EmailRegisterEventBinding
  | EmailResetPasswordEventBinding
  | FullScreenImageEventBinding
  | FunctorApiEventBinding
  | FunctorEventBinding
  | GenerateQRCodeEventBinding
  | GetAdministrationAreaEventBinding
  | GetLocationEventBinding
  | HasAIConfigIdEventBinding
  | HasAIConfigInputEventBinding
  | HasAIConversationIdEventBinding
  | HasArgsEventBinding
  | HasAssignToEventBinding
  | HasIndexEventBinding
  | HasTargetComponentIdEventBinding
  | ImageFilterEventBinding
  | ListEventBinding
  | LogEventBinding
  | MallbookDepositEventBinding
  | ModifyJsonbEventBinding
  | MutationEventBinding
  | MutationRequest
  | MutationZipEventBinding
  | NavigateToMiniProgramEventBinding
  | NotificationAuthorizationEventBinding
  | ObtainPhoneNumberEventBinding
  | ObtainWeRunDataEventBinding
  | OpenChannelsLiveEventBinding
  | OpenExternalLinkEventBinding
  | OpenLocationEventBinding
  | OpenRewardedVideoAdEventBinding
  | OpenWebViewEventBinding
  | OpenWechatSettingEventBinding
  | PhoneCodeLoginEventBinding
  | PhonePasswordLoginEventBinding
  | PhoneRegisterEventBinding
  | PhoneResetPasswordEventBinding
  | PreviewDocumentEventBinding
  | RefreshEventBinding
  | RefreshListEventBinding
  | RefreshLoginUserEventBinding
  | RefundEventBinding
  | RerunConditionEventBinding
  | ScanQRCodeEventBinding
  | ScheduledJobControlEventBinding
  | SendVerificationCodeEventBinding
  | SetClipboardEventBinding
  | SetDataEventBinding
  | ShareToTwitterEventBinding
  | ShareToWeiboEventBinding
  | ShowToastEventBinding
  | SsoEventBinding
  | SsoUnbindEventBinding
  | StripePaymentEventBinding
  | StripeRecurringPaymentEventBinding
  | TakePhotoEventBinding
  | TransformBitmapToImageEventBinding
  | TransformImageToBitmapEventBinding
  | TriggerEventBinding
  | UploadFileEventBinding
  | UserLoginEventBinding
  | UserRegisterEventBinding
  | UsernameLoginEventBinding
  | UsernameRegisterEventBinding
  | WebSilentLoginEventBinding
  | WechatAddPhoneCalendarEventBinding
  | WechatAgreePrivacyAuthorizationEventBinding
  | WechatAuthenticateLoginEventBinding
  | WechatContactEventBinding
  | WechatGetPrivacySettingEventBinding
  | WechatLoginEventBinding
  | WechatOpenChannelsEventBinding
  | WechatOpenPrivacyContractEventBinding
  | WechatOrderAndCallPaymentEventBinding
  | WechatReceiptEventBinding
  | WechatSaveVideoToAlbumEventBinding
  | WechatShipmentEventBinding
  | WxworkAuthenticateLoginEventBinding
  | ZAITaskEventBinding
  | ZQuery
  | ThirdPartyQuery;

export type FormulaBinding =
  | ArrayAverageFormulaBinding
  | ArrayConcatFormulaBinding
  | ArrayFilterFormulaBinding
  | ArrayFirstItemFormulaBinding
  | ArrayGetItemFormulaBinding
  | ArrayIndexOfFormulaBinding
  | ArrayLastItemFormulaBinding
  | ArrayMappingFormulaBinding
  | ArrayMaxFormulaBinding
  | ArrayMinFormulaBinding
  | ArrayRandomItemFormulaBinding
  | ArraySliceFormulaBinding
  | ArraySumFormulaBinding
  | BasicFormulaBinding
  | CoalesceFormulaBinding
  | CombineDateAndTimeFormulaBinding
  | CreateTimeFormulaBinding
  | DateTimeFormattingFormulaBinding
  | DateTimeFormulaBinding
  | DecimalFormulaBinding
  | DecodeUrlFormulaBinding
  | DurationFormulaBinding
  | EncodeUrlFormulaBinding
  | EnumEntriesFormulaBinding
  | GeoDistanceFormulaBinding
  | GeoPointGetValueFormulaBinding
  | GetCurrentTimeFormulaBinding
  | JsonFormulaBinding
  | LogFormulaBinding
  | MathAbsFormulaBinding
  | MathPowerFormulaBinding
  | MathRandomNumberFormulaBinding
  | NumberFormattingFormulaBinding
  | RandomStringFormulaBinding
  | RegexExtractFormulaBinding
  | RegexMatchFormulaBinding
  | RegexReplaceFormulaBinding
  | SequenceFormulaBinding
  | SubstringFromStartFormulaBinding
  | SubstringToEndFormulaBinding
  | TextConcatFormulaBinding
  | TextContainFormulaBinding
  | TextFindFormulaBinding
  | TextRepeatFormulaBinding
  | TextReplaceFormulaBinding
  | TextSplitFormulaBinding
  | TextSubstituteFormulaBinding
  | TimeGetPartFormulaBinding
  | TimeOperationFormulaBinding
  | TimestampGetDateOrTimeFormulaBinding
  | ToDateTimeFormulaBinding
  | ToDecimalFormulaBinding
  | ToIntegerFormulaBinding
  | ToStringFormulaBinding
  | TrimFormulaBinding
  | UUIDFormulaBinding
  | UniqueFormulaBinding;

export type LiteralBinding =
  | BooleanLiteralBinding
  | DateLiteralBinding
  | DateTimeLiteralBinding
  | FloatLiteralBinding
  | GeoPointLiteralBinding
  | IntegerLiteralBinding
  | JsonLiteralBinding
  | StringLiteralBinding
  | TimeLiteralBinding;

export type MediaBinding = FileBinding | ImageBinding | VideoBinding;

export type DataBinding = CompositeDataBinding | SingleValueDataBinding;

export type ValueBinding =
  | ArrayElementMapping
  | ColorThemeBinding
  | ColumnNameBinding
  | ConditionalBinding
  | CustomArrayBinding
  | CustomObjectBinding
  | EmptyBinding
  | EnumOptionBinding
  | FormulaBinding
  | FunctionBinding
  | InputBinding
  | ListSourceBinding
  | LiteralBinding
  | MediaBinding
  | ObjectLiteralBinding
  | VariableBinding;

export type CodeComponentValueInput = CodeComponentMRefInput | CodeComponentVariableAssignment;

export type HasInteractions =
  | ButtonEvents
  | ImageEvents
  | RichTextEvents
  | TextEvents
  | VideoEvents
  | ViewEvents;

export type HasLifeCycle = ModalEvents | PageEvents;

export type HasOnClick =
  | ButtonEvents
  | HasInteractions
  | ImageEvents
  | MapMarkerEvents
  | TextEvents
  | ViewEvents;

export type HasOnProgressChange = LottieProgressBarEvents | ProgressBarEvents;

export type HasOnSuccess = MixImagePickerEvents | VideoPickerEvents;

export type HasOnValueChange =
  | DataSelectorEvents
  | DateTimePickerEvents
  | FilePickerEvents
  | MixImagePickerEvents
  | NumberInputEvents
  | RichTextEditorEvents
  | SelectViewEvents
  | SwitchEvents
  | TextInputEvents
  | VideoPickerEvents;

export type RemoteDataSource = ThirdPartyQuery | ZQuery;

export type AccountRoleNode = AddRoleToAccount | RemoveRoleFromAccount;

export type GeneralActionFlowNode =
  | BranchItem
  | BranchMerge
  | BranchSeparation
  | FlowEnd
  | FlowStart
  | ForEachEnd
  | ForEachStart;

export type BackendActionFlowNode =
  | AICreateConversation
  | AIDeleteConversation
  | AISendMessage
  | AIStopResponse
  | AccountRoleNode
  | CallActionFlow
  | CallThirdPartyApi
  | DeleteRecord
  | GeneralActionFlowNode
  | InsertRecord
  | QueryRecord
  | RunCustomCode
  | RunTemplateCode
  | UpdateGlobalVariables
  | UpdateRecord;

export type FrontendActionFlowNode =
  | CallAction
  | ConcurrentBranchMerge
  | ConcurrentBranchSeparation
  | GeneralActionFlowNode
  | SuccessFailMerge;

export type LayoutComponent = LayoutView;

export type RootComponent = Modal | Page;

export type InputComponent =
  | DataSelector
  | DateTimePicker
  | FilePicker
  | MixImagePicker
  | NumberInput
  | RichTextEditor
  | SelectView
  | Switch
  | TextInput
  | VideoPicker;

export type HasBuiltInOutputs = Calendar | CodeComponent | InputComponent | ListView;

export type HasCustomOutputs = RootComponent;

export type ComponentWithOptionalPrivateScope = LayoutView | ListView | Modal | Page | SelectView;

export type Container = LayoutComponent | Modal | Page;

export type HasDataSourceRefactorComponent =
  | DataSelector
  | GeoMap
  | ListView
  | SelectView
  | Sheet
  | TabView;

export type HasInputs = RootComponent;

export type HasOutputs = HasBuiltInOutputs | HasCustomOutputs;

export type HasParentComponent =
  | AdvertBanner
  | Button
  | Calendar
  | Camera
  | CodeComponent
  | ConditionalView
  | DataSelector
  | DateTimePicker
  | FilePicker
  | GeoMap
  | HorizontalLine
  | Html
  | Image
  | LayoutView
  | ListView
  | Lottie
  | LottieProgressBar
  | MapMarker
  | MixImagePicker
  | NumberInput
  | ProgressBar
  | RichText
  | RichTextEditor
  | SelectView
  | Sheet
  | Switch
  | TabView
  | Text
  | TextInput
  | Video
  | VideoPicker
  | WechatNavigationBar
  | WechatOfficialAccount;

export type HasSubComponents =
  | ComponentWithOptionalPrivateScope
  | ConditionalView
  | Container
  | GeoMap
  | ListView
  | SelectView
  | TabView;

export type HasVariables = RootComponent;

export type PublicComponent = LayoutComponent;

export type SealedComponent = RootComponent;

export type SwitchCaseComponent = ConditionalView | TabView;

export type ListMeta = CustomListMeta | HorizontalListMeta;

export type PrivateScopeGeneratedComponent =
  | CustomMultiImagePickerMeta
  | ListMeta
  | MapViewMeta
  | PageMeta
  | SelectViewMeta;

export type ScopeGeneratedComponent = PrivateScopeGeneratedComponent;

export type SwitchCaseContainer =
  | ConditionalContainerMeta
  | CustomMultiImagePickerMeta
  | ListMeta
  | SelectViewMeta
  | TabViewMeta;

export type CalendarComponent = CalendarMeta;

export type ChangeableComponent =
  | DataPickerMeta
  | DataSelectorMeta
  | DateTimePickerMeta
  | InputMeta
  | SwitchMeta;

export type ClickableComponent =
  | BlankContainerMeta
  | ButtonMeta
  | ConditionalContainerChildMeta
  | CustomViewMeta
  | IconMeta
  | ImageMeta
  | MapViewMeta
  | ModalViewMeta
  | TextMeta;

export type ContainerMeta =
  | BlankContainerMeta
  | ConditionalContainerChildMeta
  | CustomViewMeta
  | DataPickerMeta
  | DataSelectorMeta
  | GeneralContainerMeta
  | MapViewMeta
  | ModalViewMeta
  | PageMeta
  | ScopeGeneratedComponent
  | ScrollViewMeta
  | SwitchCaseContainer;

export type CountDownComponent = CountDownMeta;

export type FocusableComponent = InputMeta;

export type HasBackgroundImageComponent =
  | BlankContainerMeta
  | ButtonMeta
  | CalendarMeta
  | ConditionalContainerMeta
  | CountDownMeta
  | CustomListMeta
  | CustomMultiImagePickerMeta
  | CustomViewMeta
  | ImageMeta
  | ImagePickerMeta
  | InputMeta
  | MapViewMeta
  | ModalViewMeta
  | MultiImageMeta
  | MultiImagePickerMeta
  | NumberInputMeta
  | PageMeta
  | RichTextEditorMeta
  | ScrollViewMeta
  | SelectViewMeta
  | VideoMeta
  | VideoPickerMeta;

export type HasChangeDebounceDurationComponent = InputMeta;

export type HasCompleteActionsComponent = LottieMeta;

export type HasConditionComponent = ConditionalContainerChildMeta;

export type HasDataSourceComponent =
  | CustomListMeta
  | DataPickerMeta
  | DataSelectorMeta
  | HorizontalListMeta
  | MapViewMeta
  | SelectViewMeta;

export type HasDefaultImageListComponent = CustomMultiImagePickerMeta | MultiImagePickerMeta;

export type HasDefaultValueComponent =
  | DataPickerMeta
  | DataSelectorMeta
  | DateTimePickerMeta
  | InputMeta
  | MixImagePickerMeta
  | NumberInputMeta
  | ProgressBarMeta
  | RichTextEditorMeta
  | SelectViewMeta
  | SwitchMeta
  | TabViewMeta;

export type HasImageComponent = ImageMeta | ImagePickerMeta | MapViewMeta | MixImagePickerMeta;

export type HasInComponentData =
  | CustomMultiImagePickerMeta
  | ListMeta
  | MapViewMeta
  | SelectViewMeta
  | TabViewMeta;

export type HasOnBeginPlayActionsComponent = VideoMeta;

export type HasOnProgressChangeActionsComponent = ProgressBarMeta | SimpleProgressBarMeta;

export type HasProgressComponent = SimpleProgressBarMeta;

export type HasSuccessActionsComponent = ImagePickerMeta | MixImagePickerMeta | VideoPickerMeta;

export type HasTimeUpActionsComponent = CountDownMeta;

export type HasTitleComponent =
  | ButtonMeta
  | DataPickerMeta
  | RichTextMeta
  | TextMeta
  | WechatNavigationBarMeta;

export type HasVideoComponent = VideoMeta | VideoPickerMeta;

export type ItemClickableComponent = MultiImageMeta | MultiImagePickerMeta | SelectViewMeta;

export type MapComponent = MapViewMeta;

export type MayHaveComponentLocalDataComponent = CustomMultiImagePickerMeta | SelectViewMeta;

export type NumberPickerComponent = NumberInputMeta;

export type ScrollableComponent = CustomListMeta;

export type SelectViewComponent = SelectViewMeta;

export type UserInputComponent =
  | CountDownMeta
  | CustomMultiImagePickerMeta
  | DataPickerMeta
  | DataSelectorMeta
  | DateTimePickerMeta
  | FilePickerMeta
  | ImagePickerMeta
  | InputMeta
  | MixImagePickerMeta
  | MultiImagePickerMeta
  | NumberInputMeta
  | RichTextEditorMeta
  | SelectViewMeta
  | SwitchMeta
  | VideoPickerMeta;

export type Component =
  | Container
  | HasDataSourceRefactorComponent
  | HasInputs
  | HasOutputs
  | HasParentComponent
  | HasSubComponents
  | HasVariables
  | PublicComponent
  | SealedComponent
  | SwitchCaseComponent;

export type ComponentMeta =
  | AdvertBannerMeta
  | ButtonMeta
  | CalendarComponent
  | CalendarMeta
  | CameraViewMeta
  | ChangeableComponent
  | ClickableComponent
  | CodeComponentMeta
  | ContainerMeta
  | CountDownComponent
  | CountDownMeta
  | DateTimePickerMeta
  | FilePickerMeta
  | FocusableComponent
  | GeneralComponentMeta
  | HasBackgroundImageComponent
  | HasChangeDebounceDurationComponent
  | HasCompleteActionsComponent
  | HasConditionComponent
  | HasDataSourceComponent
  | HasDefaultImageListComponent
  | HasDefaultValueComponent
  | HasImageComponent
  | HasInComponentData
  | HasOnBeginPlayActionsComponent
  | HasOnProgressChangeActionsComponent
  | HasProgressComponent
  | HasSuccessActionsComponent
  | HasTimeUpActionsComponent
  | HasTitleComponent
  | HasVideoComponent
  | HorizontalLineMeta
  | HtmlMeta
  | IconMeta
  | ImageMeta
  | ImagePickerMeta
  | InputMeta
  | ItemClickableComponent
  | LottieMeta
  | MapComponent
  | MayHaveComponentLocalDataComponent
  | MixImagePickerMeta
  | MultiImageMeta
  | MultiImagePickerMeta
  | NumberInputMeta
  | NumberPickerComponent
  | ProgressBarMeta
  | RichTextEditorMeta
  | RichTextMeta
  | ScrollableComponent
  | SelectViewComponent
  | SheetMeta
  | SimpleProgressBarMeta
  | SwitchMeta
  | TextMeta
  | UserInputComponent
  | VideoMeta
  | VideoPickerMeta
  | WechatNavigationBarMeta;

export type InnerVariable = ReadOnlyVariable | ReadWriteVariable;

export type InputVariable = GeneralInputVariable | UrlPathInputVariable | UrlQueryInputVariable;

export type OptionalVariable = GeneralInputVariable | UrlQueryInputVariable;

export type ActionFlowNode =
  | BackendActionFlowNode
  | BlockCreatable
  | BlockEndNode
  | FrontendActionFlowNode;

export type ApiMeta = HasBodyParameterApiMeta | NoBodyParameterApiMeta;

export type CallbackResponse = ApplicationJsonResponse | TextHtmlResponse | TextPlainResponse;

export type ComponentBase = Component | ComponentMeta;

export type ComponentRefactorSocialMediaSeoConfig =
  | ComponentRefactorGeneralSocialMediaSeoConfig
  | ComponentRefactorXPlatformSeoConfig;

export type ComponentRefactorVariable =
  | InnerVariable
  | InputVariable
  | OptionalVariable
  | OutputVariable;

export type DbTrigger =
  | DbDeleteTrigger
  | DbInsertOrUpdateTrigger
  | DbInsertTrigger
  | DbUpdateTrigger;

export type HasDataSourceToDisplay = DataSelectorProperties | SelectViewProperties;

export type HasLocalDataSource = GeoMapProperties;

export type HasDataSourceProperties =
  | HasDataSourceToDisplay
  | HasLocalDataSource
  | ListViewProperties
  | SheetProperties;

export type HtmlProperties = HtmlCodeProperties | HtmlIFrameProperties;

export type SwitchCaseProperties = ConditionalViewProperties | TabViewProperties;

export type ConditionBoolExp = ConstantCondition | EnvironmentCondition | ExpressionCondition;

export type HtmlAttributes = HtmlCodeAttributes | HtmlIFrameAttributes;

export type ConcreteBoolExp = ColumnValueExp | ConditionBoolExp;

export type BoolExp<T> =
  | AndExp<ConcreteBoolExp>
  | T
  | NotExp<ConcreteBoolExp>
  | OrExp<ConcreteBoolExp>;

export type ComponentProperties =
  | AdvertBannerProperties
  | ButtonProperties
  | CalendarProperties
  | CameraProperties
  | CodeComponentConfigWithDynamicInput
  | ConditionalViewProperties
  | DataSelectorProperties
  | DateTimePickerProperties
  | GeoMapProperties
  | HasDataSourceProperties
  | HorizontalLineProperties
  | HtmlProperties
  | ImageProperties
  | ListViewProperties
  | LottieProgressBarProperties
  | LottieProperties
  | MapMarkerProperties
  | MixImagePickerProperties
  | ModalProperties
  | NumberInputProperties
  | PageProperties
  | ProgressBarProperties
  | RichTextEditorProperties
  | RichTextProperties
  | SelectViewProperties
  | SheetProperties
  | SwitchCaseProperties
  | SwitchProperties
  | TabViewProperties
  | TextInputProperties
  | TextProperties
  | VideoPickerProperties
  | VideoProperties
  | ViewProperties
  | WechatNavigationBarProperties;

export type DataAttributes =
  | AdvertBannerAttributes
  | BlankContainerAttributes
  | ButtonAttributes
  | CalendarAttributes
  | CameraViewAttributes
  | CodeComponentAttributes
  | ConditionalContainerAttributes
  | ConditionalContainerChildAttributes
  | CountDownAttributes
  | CustomListAttributes
  | CustomMultiImagePickerAttributes
  | CustomViewAttributes
  | DataPickerAttributes
  | DataSelectorAttributes
  | DateTimePickerAttributes
  | DraggableScreenAttributes
  | null
  | FilePickerAttributes
  | HorizontalLineAttributes
  | HorizontalListAttributes
  | HtmlAttributes
  | IconAttributes
  | ImageAttributes
  | ImagePickerAttributes
  | InputAttributes
  | LottieAttributes
  | MapViewAttributes
  | MixImagePickerAttributes
  | ModalViewAttributes
  | MultiImageAttributes
  | MultiImagePickerAttributes
  | NumberInputAttributes
  | OverrideAttributes
  | PagingToolbarAttributes
  | ProgressBarAttributes
  | RichTextAttributes
  | RichTextEditorAttributes
  | ScrollViewAttributes
  | SelectViewAttributes
  | SheetAttributes
  | SimpleProgressBarAttributes
  | SwitchAttributes
  | TabViewAttributes
  | TextAttributes
  | VideoAttributes
  | VideoPickerAttributes
  | WechatNavigationBarAttributes;

export type ExtraAttributesFromCalendar = CalendarAttributes | OverrideAttributes;

export type ExtraAttributesFromCountDown = CountDownAttributes | OverrideAttributes;

export type ExtraAttributesFromCustomMultiImagePicker =
  | CustomMultiImagePickerAttributes
  | OverrideAttributes;

export type ExtraAttributesFromDataPicker = DataPickerAttributes | OverrideAttributes;

export type ExtraAttributesFromDataSelector = DataSelectorAttributes | OverrideAttributes;

export type ExtraAttributesFromDateTimePicker = DateTimePickerAttributes | OverrideAttributes;

export type ExtraAttributesFromDraggableScreen = DraggableScreenAttributes | OverrideAttributes;

export type ExtraAttributesFromInput = InputAttributes | OverrideAttributes;

export type ExtraAttributesFromMapView = MapViewAttributes | OverrideAttributes;

export type ExtraAttributesFromMixImagePicker = MixImagePickerAttributes | OverrideAttributes;

export type ExtraAttributesFromMultiImage = MultiImageAttributes | OverrideAttributes;

export type ExtraAttributesFromMultiImagePicker = MultiImagePickerAttributes | OverrideAttributes;

export type ExtraAttributesFromNumberInput = NumberInputAttributes | OverrideAttributes;

export type ExtraAttributesFromProgressBar = OverrideAttributes | ProgressBarAttributes;

export type ExtraAttributesFromRichText =
  | OverrideAttributes
  | RichTextAttributes
  | RichTextEditorAttributes;

export type ExtraAttributesFromSelectView = OverrideAttributes | SelectViewAttributes;

export type ExtraAttributesFromSimpleProgressBar = OverrideAttributes | SimpleProgressBarAttributes;

export type ExtraAttributesFromSwitch = OverrideAttributes | SwitchAttributes;

export type ExtraAttributesFromTabView = OverrideAttributes | TabViewAttributes;

export type HasTitle =
  | ButtonAttributes
  | DataPickerAttributes
  | OverrideAttributes
  | TextAttributes
  | WechatNavigationBarAttributes;

export type ImageSourceAttributes =
  | CodeComponentAttributes
  | ImageAttributes
  | ImagePickerAttributes
  | MarkerIconAttributes
  | OverrideAttributes;

export type VideoSourceAttributes = OverrideAttributes | VideoAttributes | VideoPickerAttributes;

export type ObjectLiteralNode = ArrayNode | ObjectNode | ValueNode;

export type TypeSchema = ArrayTypeSchema | ObjectTypeSchema | PrimitiveTypeSchema;

export type ActionFlow = BackendActionFlow | FrontendActionFlow;

export type ClientSchema = MobileSchema | WebSchema | WechatMiniProgramSchema;

export type FormulaWithDataSource = ArrayFilterFormulaBinding | ArrayMappingFormulaBinding;

export type TriggerConfiguration = DbTriggerConfiguration;

export type HasLayoutSize =
  | AdvertBannerWrapperStyle
  | ButtonWrapperStyle
  | CalendarWrapperStyle
  | CameraWrapperStyle
  | CodeComponentWrapperStyle
  | DataSelectorWrapperStyle
  | DateTimePickerWrapperStyle
  | FilePickerWrapperStyle
  | GeoMapWrapperStyle
  | HorizontalLineWrapperStyle
  | HtmlWrapperStyle
  | ImageWrapperStyle
  | ListWrapperStyle
  | LottieWrapperStyle
  | MapMarkerWrapperStyle
  | MixImagePickerWrapperStyle
  | ModalWrapperStyle
  | NumberInputWrapperStyle
  | PageWrapperStyle
  | ProgressBarWrapperStyle
  | RichTextEditorWrapperStyle
  | RichTextWrapperStyle
  | SelectViewWrapperStyle
  | SheetWrapperStyle
  | SwitchWrapperStyle
  | TabViewWrapperStyle
  | TextInputWrapperStyle
  | TextWrapperStyle
  | VideoPickerWrapperStyle
  | VideoWrapperStyle
  | ViewWrapperStyle
  | WechatOfficialAccountWrapperStyle;

export type GridOrNoneLayoutStyle = BlockOrNoneLayoutStyle | GridLayoutStyle | NoneLayoutStyle;

export type LengthSyntaxWithValue = FixedLengthSyntax | RelativeLengthSyntax;

export type ColorStyle = LinearGradientColorStyle | PlainColorStyle;

export type ComponentStyle =
  | ButtonStyles
  | DataSelectorStyles
  | DateTimePickerStyles
  | GeneralComponentStyle<ComponentWrapperStyle>
  | ListViewStyles
  | MixImagePickerStyles
  | ProgressBarStyles
  | SheetStyles
  | SwitchStyles
  | TextInputStyles
  | TextStyles
  | ViewStyles;

export type ComponentWrapperStyle =
  | AdvertBannerWrapperStyle
  | BackgroundColorAsComponentWrapperStyle
  | ButtonWrapperStyle
  | CalendarWrapperStyle
  | CameraWrapperStyle
  | CodeComponentWrapperStyle
  | DataSelectorWrapperStyle
  | DateTimePickerWrapperStyle
  | FilePickerWrapperStyle
  | GeoMapWrapperStyle
  | GridLayoutAsComponentWrapperStyle
  | HorizontalLineWrapperStyle
  | HtmlWrapperStyle
  | ImageWrapperStyle
  | ListWrapperStyle
  | LottieProgressBarWrapperStyle
  | LottieWrapperStyle
  | MapMarkerWrapperStyle
  | MixImagePickerImageStyle
  | MixImagePickerWrapperStyle
  | ModalWrapperStyle
  | NumberInputWrapperStyle
  | PageWrapperStyle
  | PlaceholderStyle
  | ProgressBarWrapperStyle
  | RichTextEditorWrapperStyle
  | RichTextWrapperStyle
  | ScrollBarStyle
  | SelectViewWrapperStyle
  | SheetDividerStyle
  | SheetHeaderFooterStyle
  | SheetRowStyle
  | SheetWrapperStyle
  | SwitchWrapperStyle
  | TabViewWrapperStyle
  | TextInputWrapperStyle
  | TextStyleAsComponentWrapperStyle
  | TextStyleWithoutMultiLineAsComponentWrapperStyle
  | TextWrapperStyle
  | VideoPickerWrapperStyle
  | VideoWrapperStyle
  | ViewWrapperStyle
  | WechatNavigationBarWrapperStyle
  | WechatOfficialAccountWrapperStyle;

export type DimensionValues = AbsoluteOrFixedPositionStyle | PlainDimensionValues;

export type HasBackdropFilterStyle =
  | ButtonWrapperStyle
  | CodeComponentWrapperStyle
  | HtmlWrapperStyle
  | ImageWrapperStyle
  | ListWrapperStyle
  | ModalWrapperStyle
  | RichTextWrapperStyle
  | TextInputWrapperStyle
  | TextWrapperStyle
  | VideoWrapperStyle
  | ViewWrapperStyle;

export type HasBackgroundColorStyle =
  | BackgroundColorAsComponentWrapperStyle
  | ButtonWrapperStyle
  | CalendarWrapperStyle
  | DataSelectorWrapperStyle
  | DateTimePickerWrapperStyle
  | FilePickerWrapperStyle
  | HorizontalLineWrapperStyle
  | MixImagePickerImageStyle
  | NumberInputWrapperStyle
  | ProgressBarWrapperStyle
  | RichTextEditorWrapperStyle
  | SelectViewWrapperStyle
  | SheetWrapperStyle
  | TabViewWrapperStyle
  | TextInputWrapperStyle
  | TextWrapperStyle
  | VideoPickerWrapperStyle
  | WechatNavigationBarWrapperStyle;

export type HasBackgroundStyle =
  | CodeComponentWrapperStyle
  | HtmlWrapperStyle
  | ImageWrapperStyle
  | ListWrapperStyle
  | ModalWrapperStyle
  | PageWrapperStyle
  | RichTextWrapperStyle
  | ViewWrapperStyle;

export type HasBorderStyle =
  | ButtonWrapperStyle
  | CalendarWrapperStyle
  | CodeComponentWrapperStyle
  | DataSelectorWrapperStyle
  | DateTimePickerWrapperStyle
  | GeoMapWrapperStyle
  | HtmlWrapperStyle
  | ImageWrapperStyle
  | ListWrapperStyle
  | MixImagePickerImageStyle
  | ModalWrapperStyle
  | NumberInputWrapperStyle
  | RichTextEditorWrapperStyle
  | SelectViewWrapperStyle
  | SheetWrapperStyle
  | TextInputWrapperStyle
  | TextWrapperStyle
  | VideoPickerWrapperStyle
  | VideoWrapperStyle
  | ViewWrapperStyle;

export type HasBoxShadowStyle =
  | ButtonWrapperStyle
  | CalendarWrapperStyle
  | CodeComponentWrapperStyle
  | DataSelectorWrapperStyle
  | DateTimePickerWrapperStyle
  | FilePickerWrapperStyle
  | GeoMapWrapperStyle
  | HtmlWrapperStyle
  | ImageWrapperStyle
  | ListWrapperStyle
  | MixImagePickerImageStyle
  | ModalWrapperStyle
  | NumberInputWrapperStyle
  | RichTextEditorWrapperStyle
  | SelectViewWrapperStyle
  | SheetWrapperStyle
  | TextInputWrapperStyle
  | TextWrapperStyle
  | VideoPickerWrapperStyle
  | VideoWrapperStyle
  | ViewWrapperStyle;

export type HasCursorStyle =
  | ButtonWrapperStyle
  | CodeComponentWrapperStyle
  | HtmlWrapperStyle
  | ImageWrapperStyle
  | TextWrapperStyle
  | VideoWrapperStyle
  | ViewWrapperStyle;

export type HasLayout =
  | GridLayoutAsComponentWrapperStyle
  | HasLayoutSize
  | MixImagePickerImageStyle;

export type HasMargin =
  | ButtonWrapperStyle
  | CodeComponentWrapperStyle
  | DataSelectorWrapperStyle
  | DateTimePickerWrapperStyle
  | FilePickerWrapperStyle
  | HorizontalLineWrapperStyle
  | HtmlWrapperStyle
  | ImageWrapperStyle
  | ListWrapperStyle
  | LottieWrapperStyle
  | MixImagePickerWrapperStyle
  | NumberInputWrapperStyle
  | ProgressBarWrapperStyle
  | RichTextEditorWrapperStyle
  | RichTextWrapperStyle
  | SelectViewWrapperStyle
  | SwitchWrapperStyle
  | TabViewWrapperStyle
  | TextInputWrapperStyle
  | TextWrapperStyle
  | VideoPickerWrapperStyle
  | VideoWrapperStyle
  | ViewWrapperStyle;

export type HasObjectFit = ImageWrapperStyle | VideoWrapperStyle;

export type HasOpacity =
  | ButtonWrapperStyle
  | CalendarWrapperStyle
  | CodeComponentWrapperStyle
  | DataSelectorWrapperStyle
  | DateTimePickerWrapperStyle
  | FilePickerWrapperStyle
  | HorizontalLineWrapperStyle
  | HtmlWrapperStyle
  | ImageWrapperStyle
  | ListWrapperStyle
  | LottieWrapperStyle
  | MixImagePickerWrapperStyle
  | ModalWrapperStyle
  | NumberInputWrapperStyle
  | ProgressBarWrapperStyle
  | RichTextEditorWrapperStyle
  | RichTextWrapperStyle
  | SelectViewWrapperStyle
  | SheetWrapperStyle
  | SwitchWrapperStyle
  | TabViewWrapperStyle
  | TextInputWrapperStyle
  | TextWrapperStyle
  | VideoPickerWrapperStyle
  | VideoWrapperStyle
  | ViewWrapperStyle;

export type HasOverFlowStyle =
  | CodeComponentWrapperStyle
  | HtmlWrapperStyle
  | ModalWrapperStyle
  | PageWrapperStyle
  | SelectViewWrapperStyle
  | ViewWrapperStyle;

export type HasPadding =
  | ButtonWrapperStyle
  | CodeComponentWrapperStyle
  | DataSelectorWrapperStyle
  | DateTimePickerWrapperStyle
  | HorizontalLineWrapperStyle
  | HtmlWrapperStyle
  | ListWrapperStyle
  | ModalWrapperStyle
  | PageWrapperStyle
  | SelectViewWrapperStyle
  | TextInputWrapperStyle
  | ViewWrapperStyle;

export type HasPosition =
  | AdvertBannerWrapperStyle
  | ButtonWrapperStyle
  | CalendarWrapperStyle
  | CameraWrapperStyle
  | CodeComponentWrapperStyle
  | DataSelectorWrapperStyle
  | DateTimePickerWrapperStyle
  | FilePickerWrapperStyle
  | GeoMapWrapperStyle
  | HorizontalLineWrapperStyle
  | HtmlWrapperStyle
  | ImageWrapperStyle
  | ListWrapperStyle
  | LottieProgressBarWrapperStyle
  | LottieWrapperStyle
  | MixImagePickerWrapperStyle
  | ModalWrapperStyle
  | NumberInputWrapperStyle
  | ProgressBarWrapperStyle
  | RichTextEditorWrapperStyle
  | RichTextWrapperStyle
  | SelectViewWrapperStyle
  | SheetWrapperStyle
  | SwitchWrapperStyle
  | TabViewWrapperStyle
  | TextInputWrapperStyle
  | TextWrapperStyle
  | VideoPickerWrapperStyle
  | VideoWrapperStyle
  | ViewWrapperStyle
  | WechatOfficialAccountWrapperStyle;

export type HasSize = HasLayoutSize | LottieProgressBarWrapperStyle;

export type HasTextColorStyle = RichTextEditorWrapperStyle;

export type HasTextStyle = TextStyleAsComponentWrapperStyle | WechatNavigationBarWrapperStyle;

export type HasZIndex =
  | ButtonWrapperStyle
  | CalendarWrapperStyle
  | CodeComponentWrapperStyle
  | DataSelectorWrapperStyle
  | DateTimePickerWrapperStyle
  | FilePickerWrapperStyle
  | HorizontalLineWrapperStyle
  | HtmlWrapperStyle
  | ImageWrapperStyle
  | ListWrapperStyle
  | LottieWrapperStyle
  | MixImagePickerWrapperStyle
  | ModalWrapperStyle
  | NumberInputWrapperStyle
  | ProgressBarWrapperStyle
  | RichTextEditorWrapperStyle
  | RichTextWrapperStyle
  | SelectViewWrapperStyle
  | SheetWrapperStyle
  | SwitchWrapperStyle
  | TabViewWrapperStyle
  | TextInputWrapperStyle
  | TextWrapperStyle
  | VideoPickerWrapperStyle
  | VideoWrapperStyle
  | ViewWrapperStyle
  | WechatOfficialAccountWrapperStyle;

export type LayoutStyle = BlockLayoutStyle | FlexLayoutStyle | GridOrNoneLayoutStyle;

export type LengthSyntax = AutoLengthSyntax | LengthSyntaxWithValue;

export type PositionStyle = AbsoluteOrFixedPositionStyle | RelativePositionStyle;

export type SizeStyle = GeneralSizeStyle | HeightSizeStyle | WidthHeightSizeStyle;

export type ApiParameter = HasBodyParameters | NoBodyParameters;

export type BaseEventBinding = ComponentRefactorInteraction | EventBinding;

export type BindingBase = DataBinding | ValueBinding;

export type ClientConfiguration =
  | MobileClientConfiguration
  | WebClientConfiguration
  | WechatMiniProgramClientConfiguration;

export type ClonedComponentGroup = CustomClonedComponentGroup | DefaultClonedComponentGroup;

export type CodeComponentConfig =
  | CodeComponentConfigWithDynamicInput
  | DeprecatedCodeComponentConfig;

export type CodeComponentInput = CodeComponentActionsInput | CodeComponentValueInput;

export type ComponentEvents =
  | CalendarEvents
  | HasLifeCycle
  | HasOnClick
  | HasOnProgressChange
  | HasOnSuccess
  | HasOnValueChange
  | ListViewEvents
  | LottieEvents
  | ModalEvents
  | PageEvents
  | VideoEvents;

export type ConstraintMetadata =
  | ForeignKeyConstraint
  | NotNullConstraint
  | PrimaryKeyConstraint
  | UniqueConstraint;

export type DataSource =
  | DataBinding
  | DbQuery
  | ReferenceDataSource
  | RemoteDataSource
  | SelectViewLocalDataSource;

export type ImageFilterParamsType =
  | DataBinding
  | Record<string, DataBinding>
  | Record<string, DataBinding>[];

export type LinearGradientDirection = AngleLinearGradientDirection | KeywordLinearGradientDirection;

export type MapConfiguration = AMapConfiguration | MapBoxConfiguration;

export type MockedZSchemaNode =
  | AIInputZSchemaNode
  | APIInputZSchemaNode
  | ActionFlowInputZSchemaNode
  | ActionFlowsZSchemaNode
  | ApiWorkSpacesZSchemaNode
  | ComponentInputZSchemaNode
  | ComponentVariableZSchemaNode
  | GlobalDataZSchemaNode
  | LinkDataZSchemaNode
  | PageDataZSchemaNode
  | PathDataZSchemaNode
  | TpaConfigsZSchemaNode
  | ZAiConfigsZSchemaNode;

export type PaymentConfiguration = GeneralPaymentConfiguration | StripePaymentConfiguration;

export type PlatformConfiguration = WebConfiguration | WechatConfiguration;

export type QueryWithSelections = DbQuery | TpaQuery;

export type ResponseConfig = CustomResponseConfig | FallbackResponseConfig;

export type RootSchema = LiveSchema | ZSchema;

export type Schema = ReferenceSchema | TypeSchema;

export type SheetDataSource = DBQueryDataSource;

export type SocialMediaConfigValue = SocialMediaDataBindingValue | SocialMediaUseSeoTDKValue;

export type SocialMediaSeoConfig = GeneralSocialMediaSeoConfig | XPlatformSeoConfig;

export type SortConfig = BasicSortConfig | VectorSortConfig;

export type Style =
  | BackdropFilterWithBlurStyle
  | BackgroundColorStyle
  | BackgroundImageStyle
  | BackgroundStyle
  | BorderRadiusConfig
  | BorderStyle
  | BoxShadowStyle
  | ColorStyle
  | ComponentStyle
  | ComponentWrapperStyle
  | CursorStyle
  | DimensionValues
  | HasBackdropFilterStyle
  | HasBackgroundColorStyle
  | HasBackgroundStyle
  | HasBorderStyle
  | HasBoxShadowStyle
  | HasCursorStyle
  | HasLayout
  | HasMargin
  | HasObjectFit
  | HasOpacity
  | HasOverFlowStyle
  | HasPadding
  | HasPosition
  | HasSize
  | HasTextColorStyle
  | HasTextStyle
  | HasZIndex
  | LayoutStyle
  | LengthSyntax
  | LinearGradientColor
  | LinearGradientColorConfig
  | MultilineStyle
  | OverflowStyle
  | PositionStyle
  | SizeMeasure
  | SizeMinMaxMeasure
  | SizeStyle
  | TextColorAndFontSizeStyle
  | TextColorStyle
  | TextDecoration
  | TextStyle
  | TextStyleWithoutMultiline
  | TextStyleWithoutMultilineAndTextDecoration;

export type StyleOrSyntax<T> = T | StyleSyntax;

export type ThirdPartyDataMeta = ThirdPartyData | ThirdPartyParameter;

export type TypeDefinition = EnumTypeDefinition | ObjectTypeDefinition;

export type WithDataSource = ReadOnlyVariable;

export type WithDefaultValue = InputVariable | ReadWriteVariable;

export type ZAiOutputConfig = DefaultZAiOutputConfig | StructuredZAiOutputConfig;

export type ZAiTool =
  | ActionFlowTool
  | AiTool
  | ObtainMoreInformationTool
  | StructuredOutputTool
  | ThirdPartyApiTool;

export type ActionFlowNodeType = BackendActionFlowNodeType | FrontendActionFlowNodeType;

export type AuthorizationFailureEventBinding =
  | ChooseLocationEventBinding
  | GetLocationEventBinding
  | UploadFileEventBinding;

export type BoolExprOrAlwaysTrue = null | BoolExp<ColumnValueExp>;

export type BorderRadiusAttributes =
  | BlankContainerAttributes
  | ButtonAttributes
  | CodeComponentAttributes
  | ConditionalContainerAttributes
  | ConditionalContainerChildAttributes
  | CountDownAttributes
  | CustomListAttributes
  | CustomMultiImagePickerAttributes
  | CustomViewAttributes
  | DataPickerAttributes
  | DataSelectorAttributes
  | DateTimePickerAttributes
  | FilePickerAttributes
  | HorizontalLineAttributes
  | ImageAttributes
  | ImagePickerAttributes
  | InputAttributes
  | MapViewAttributes
  | MixImagePickerAttributes
  | ModalViewAttributes
  | MultiImageAttributes
  | MultiImagePickerAttributes
  | NumberInputAttributes
  | OverrideAttributes
  | RichTextEditorAttributes
  | ScrollViewAttributes
  | SelectViewAttributes
  | SheetAttributes
  | VideoAttributes
  | VideoPickerAttributes;

export type BorderStyleAttributes =
  | CombinedStyleAttributes
  | FilePickerAttributes
  | MixImagePickerAttributes
  | SheetAttributes;

export type BoxShadowStyleAttributes =
  | CombinedStyleAttributes
  | MixImagePickerAttributes
  | SheetAttributes;

export type CallActionOnFailConfig = CallActionsOnFail | TerminateWhenFail;

export type ColorType = DefaultColorType | GradientColorType;

export type ColumnSelections = string[] | 'all';

export type ConfigState = LoginConfigState;

export type CursorAttributes =
  | ButtonAttributes
  | CodeComponentAttributes
  | CustomViewAttributes
  | ImageAttributes
  | ModalViewAttributes
  | OverrideAttributes
  | TextAttributes;

export type DataFormat = DateFormat | NumberFormat[];

export type Effect =
  | AnimationFadeEffect
  | AnimationScaleEffect
  | AnimationSlideEffect
  | AnimationVariantInteraction
  | Emphasis
  | FadeEffect
  | ScaleEffect
  | SlideEffect
  | VariantInteraction;

export type ExtraAttributesFromAdvertBanner = AdvertBannerAttributes | OverrideAttributes;

export type ExtraAttributesFromCameraView = CameraViewAttributes | OverrideAttributes;

export type ExtraAttributesFromConditionalContainer =
  | ConditionalContainerAttributes
  | OverrideAttributes;

export type ExtraAttributesFromCustomList = CustomListAttributes | OverrideAttributes;

export type ExtraAttributesFromCustomView =
  | CustomViewAttributes
  | ModalViewAttributes
  | OverrideAttributes;

export type ExtraAttributesFromHorizontalLine = HorizontalLineAttributes | OverrideAttributes;

export type ExtraAttributesFromHorizontalList = HorizontalListAttributes | OverrideAttributes;

export type ExtraAttributesFromIcon = IconAttributes | OverrideAttributes;

export type ExtraAttributesFromImage =
  | CodeComponentAttributes
  | ImageAttributes
  | OverrideAttributes;

export type ExtraAttributesFromImagePicker = ImagePickerAttributes | OverrideAttributes;

export type ExtraAttributesFromLottie = LottieAttributes | OverrideAttributes;

export type ExtraAttributesFromModalView = ModalViewAttributes | OverrideAttributes;

export type ExtraAttributesFromPagingToolBar = OverrideAttributes | PagingToolbarAttributes;

export type ExtraAttributesFromRichTextEditor = OverrideAttributes | RichTextEditorAttributes;

export type ExtraAttributesFromScrollView = OverrideAttributes | ScrollViewAttributes;

export type ExtraAttributesFromSheet = OverrideAttributes | SheetAttributes;

export type ExtraAttributesFromText = TextAttributes;

export type ExtraAttributesFromVideo = OverrideAttributes | VideoAttributes;

export type ExtraAttributesFromVideoPicker = OverrideAttributes | VideoPickerAttributes;

export type FilterStyleAttributes =
  | ButtonAttributes
  | CodeComponentAttributes
  | CustomViewAttributes
  | ImageAttributes
  | ModalViewAttributes
  | OverrideAttributes
  | RichTextAttributes
  | TextAttributes
  | VideoAttributes;

export type HasAndThenNodeId =
  | AICreateConversation
  | AIDeleteConversation
  | AISendMessage
  | AIStopResponse
  | AddRoleToAccount
  | BlockEndNode
  | BranchItem
  | BranchMerge
  | CallActionFlow
  | CallThirdPartyApi
  | ConcurrentBranchMerge
  | DeleteRecord
  | FlowStart
  | ForEachEnd
  | ForEachStart
  | InsertRecord
  | QueryRecord
  | RemoveRoleFromAccount
  | RunCustomCode
  | RunTemplateCode
  | SuccessFailMerge
  | UpdateGlobalVariables
  | UpdateRecord;

export type HasBackgroundColor =
  | BackgroundAttributes
  | HorizontalLineAttributes
  | HorizontalListAttributes
  | IconAttributes
  | MixImagePickerAttributes
  | OverrideAttributes
  | SheetAttributes
  | SimpleProgressBarAttributes
  | TabViewAttributes
  | TextAttributes
  | WechatNavigationBarAttributes;

export type HasBranchItemIds = BranchSeparation | ConcurrentBranchSeparation;

export type HasBranchSeparationId = BranchItem | BranchMerge | ConcurrentBranchMerge;

export type HasClickActions =
  | BlankContainerAttributes
  | ButtonAttributes
  | ConditionalContainerChildAttributes
  | CustomViewAttributes
  | IconAttributes
  | ImageAttributes
  | MapViewAttributes
  | ModalViewAttributes
  | OverrideAttributes
  | TextAttributes;

export type HasColor =
  | ButtonAttributes
  | CountDownAttributes
  | DataSelectorAttributes
  | DateTimePickerAttributes
  | IconAttributes
  | InputAttributes
  | NumberInputAttributes
  | OverrideAttributes
  | TextAttributes;

export type HasDefaultValue =
  | DataSelectorProperties
  | DateTimePickerProperties
  | MixImagePickerProperties
  | NumberInputProperties
  | SelectViewProperties
  | SwitchProperties
  | TextInputProperties;

export type HasFontSize =
  | DataSelectorAttributes
  | DateTimePickerAttributes
  | IconAttributes
  | InputAttributes
  | OverrideAttributes
  | SheetAttributes
  | TextStyleAttributes;

export type HasHorizontalPadding =
  | CustomListAttributes
  | HorizontalListAttributes
  | MultiImageAttributes
  | OverrideAttributes;

export type HasInputArgs = FlowStart | RunCustomCode;

export type HasInputArgsDataBinding = RunCustomCode | RunTemplateCode;

export type HasLabelColor = DataPickerAttributes | OverrideAttributes | SimpleProgressBarAttributes;

export type HasMultiLine = InputAttributes | OverrideAttributes | TextStyleAttributes;

export type HasMutation = DeleteRecord | InsertRecord | UpdateRecord;

export type HasOnSuccessActions =
  | ImagePickerAttributes
  | MixImagePickerAttributes
  | OverrideAttributes
  | VideoPickerAttributes;

export type HasOutputValues = RunCustomCode;

export type HasPathComponents = PropertyMappable;

export type HasPreviousNodeId =
  | AICreateConversation
  | AIDeleteConversation
  | AISendMessage
  | AIStopResponse
  | AddRoleToAccount
  | BlockCreatable
  | BranchSeparation
  | CallAction
  | CallActionFlow
  | CallThirdPartyApi
  | ConcurrentBranchSeparation
  | DeleteRecord
  | FlowEnd
  | ForEachEnd
  | ForEachStart
  | InsertRecord
  | QueryRecord
  | RemoveRoleFromAccount
  | RunCustomCode
  | RunTemplateCode
  | UpdateGlobalVariables
  | UpdateRecord;

export type HasScheduledJobs = DraggableScreenAttributes | OverrideAttributes;

export type HasTextColor =
  | DataPickerAttributes
  | OverrideAttributes
  | SheetAttributes
  | WechatNavigationBarAttributes;

export type HasVerticalPadding = CustomListAttributes | MultiImageAttributes | OverrideAttributes;

export type Interaction =
  | CommonEmphasis
  | FadeEffect
  | FlipEmphasis
  | ScaleEffect
  | ScrollingInteraction
  | SlideEffect
  | UnknownEffect
  | VariantInteraction;

export type LiteralOrDataBinding = DataBinding | number;

export type NavigationTransitionType =
  | MobileNavigationTransitionType
  | WebNavigationTransitionType
  | WechatNavigationTransitionType;

export type NumberFormat = FormattedNumber | string;

export type NumberTransform = BinaryNumericTransform | UnaryNumericTransform;

export type OpacityAttributes =
  | ButtonAttributes
  | CodeComponentAttributes
  | CountDownAttributes
  | CustomViewAttributes
  | ImageAttributes
  | ModalViewAttributes
  | OverrideAttributes
  | RichTextAttributes
  | SheetAttributes
  | TextAttributes
  | VideoAttributes;

export type Operator =
  | BooleanOperator
  | CollectionOperator
  | ColumnOperator
  | ExpressionConditionType
  | FormulaOperator;

export type PredefinedType = PrimitiveType | SystemDefinedType;

export type PreserveCellStateProperties = ListViewProperties | SelectViewProperties;

export type PropertyDataFormattable = ComponentBinding | FunctionBinding | VariableBinding;

export type PropertyShouldUpdateOnValueChange = ComponentBinding | VariableBinding;

export type RequestResultEventBinding =
  | AICreateConversationEventBinding
  | AIDeleteConversationEventBinding
  | AIObtainInfoEventBinding
  | AISendMessageEventBinding
  | AIStopResponseEventBinding
  | AccountBindEmailEventBinding
  | AccountBindPhoneNumberEventBinding
  | AccountUnbindEmailEventBinding
  | AccountUnbindPhoneNumberEventBinding
  | ActionFlowEventBinding
  | AliPaymentEventBinding
  | AlipayRecurringPaymentEventBinding
  | CancelRecurringPaymentEventBinding
  | CheckVerificationCodeEventBinding
  | ChooseLocationEventBinding
  | CompletePersonalInfoEventBinding
  | ComponentToBitmapEventBinding
  | ComponentToImageEventBinding
  | CustomRequestEventBinding
  | DeleteAccountByPasswordEventBinding
  | DeleteAccountByVerificationCodeEventBinding
  | DeprecatedWechatPaymentEventBinding
  | EditFilterAndStickerEventBinding
  | EmailLoginEventBinding
  | EmailRegisterEventBinding
  | EmailResetPasswordEventBinding
  | GenerateMiniProgramCodeEventBinding
  | GenerateQRCodeEventBinding
  | GetAdministrationAreaEventBinding
  | GetLocationEventBinding
  | ImageFilterEventBinding
  | MutationEventBinding
  | MutationZipEventBinding
  | NavigateToMiniProgramEventBinding
  | NotificationAuthorizationEventBinding
  | ObtainPhoneNumberEventBinding
  | ObtainWeRunDataEventBinding
  | OpenChannelsLiveEventBinding
  | OpenWechatSettingEventBinding
  | PhoneCodeLoginEventBinding
  | PhonePasswordLoginEventBinding
  | PhoneRegisterEventBinding
  | PhoneResetPasswordEventBinding
  | RefundEventBinding
  | ScanQRCodeEventBinding
  | SendVerificationCodeEventBinding
  | StripePaymentEventBinding
  | StripeRecurringPaymentEventBinding
  | TakePhotoEventBinding
  | TransformBitmapToImageEventBinding
  | TransformImageToBitmapEventBinding
  | UploadFileEventBinding
  | UserLoginEventBinding
  | UserRegisterEventBinding
  | UsernameLoginEventBinding
  | UsernameRegisterEventBinding
  | WechatAddPhoneCalendarEventBinding
  | WechatAuthenticateLoginEventBinding
  | WechatContactEventBinding
  | WechatLoginEventBinding
  | WechatOpenChannelsEventBinding
  | WechatOrderAndCallPaymentEventBinding
  | WechatReceiptEventBinding
  | WechatShareEventBinding
  | WechatShipmentEventBinding
  | WxworkAuthenticateLoginEventBinding
  | ZAITaskEventBinding;

export type ScrollAttributes =
  | CustomViewAttributes
  | ModalViewAttributes
  | OverrideAttributes
  | ScrollViewAttributes;

export type ShipmentInfo = LogisticsShipmentInfo | OtherShipmentInfo;

export type ShowLoadingAnimation =
  | AICreateConversationEventBinding
  | AIDeleteConversationEventBinding
  | AIObtainInfoEventBinding
  | AISendMessageEventBinding
  | AIStopResponseEventBinding
  | ZAITaskEventBinding;

export type ShowScrollBarAttributes =
  | CustomListAttributes
  | CustomViewAttributes
  | HorizontalListAttributes;

export type StripePaymentInfo = StripePaymentEventBinding | StripeRecurringPaymentEventBinding;

export type SwitchCaseAttributes =
  | ConditionalContainerAttributes
  | OverrideAttributes
  | TabViewAttributes;

export type TabConfig = CustomTabConfig | NormalTabConfig;

export type Theme = ColorTheme;

export type TransformOperand = number | NumberTransform;

export type UploadAttributes =
  | CustomMultiImagePickerAttributes
  | ImagePickerAttributes
  | MixImagePickerAttributes
  | MultiImagePickerAttributes
  | OverrideAttributes
  | VideoPickerAttributes;

export type UploadProperties = MixImagePickerProperties | VideoPickerProperties;
