import type {
  AMapConfiguration,
  MapBoxConfiguration,
  AuthenticationConfig,
  DataModel,
} from './index.ts';
import { MapType } from './index.ts';

export const DEFAULT_AUTHENTICATION_CONFIG: AuthenticationConfig = {
  usernameConfig: { enabled: true },
  phoneNumberConfig: { enabled: true },
  emailAuthConfig: { enabled: true },
  wechatConfig: { enabled: true },
  wxworkAuthConfig: { enabled: true },
  ssoConfigs: [],
};

export const DEFAULT_A_MAP_CONFIGURATION: AMapConfiguration = {
  type: MapType.A_MAP,
  key: '',
  secret: '',
};

export const DEFAULT_MAP_BOX_CONFIGURATION: MapBoxConfiguration = {
  type: MapType.MAP_BOX,
  token: '',
};

export const DEFAULT_DATA_MODEL: DataModel = {
  tableMetadata: [],
  relationMetadata: [],
};
