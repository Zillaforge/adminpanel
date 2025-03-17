export type ValidationResult = string | boolean;

export interface QuotaTitlesInterface {
  title: string;
  subTitle: string;
  keyQuota: string;
  keyCurrent: string;
}

export interface QuotaEmitObjectInterface {
  type: string;
  result: boolean;
}

export interface UserFieldConfigInterface {
  key: string;
  title: string;
  hintType: string;
  isRequired: boolean;
  isTextArea: boolean;
  isEditable: boolean;
}

export interface UserEditInterface {
  account: string;
  displayName: string;
  email: string;
  password: string;
  description: string;
  department: string;
  title: string;
  telephone: string;
}

export interface UserInfoInterface {
  account: string;
  email: string;
  displayName: string;
  userId: string;
  namespace: string;
  mfa: boolean;
  frozen: boolean;
  description: string;
  extra?: Record<string, any>;
  frozenState?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
  isMember?: boolean;
}

export interface ProjectInfoInterface {
  projectId: string;
  displayName: string;
  codeName?: string;
  namespace: string;
  frozen: boolean;
  frozenState?: string;
  description: string;
  extra?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMembershipInterface {
  membershipId: string;
  projectId: string;
  frozen: boolean;
  user: UserInfoInterface;
  extra?: Record<string, any>;
  tenantRole: string;
  globalPermissionId: string;
  userPermissionId: string;
  // post-process
  id: string;
  account: string;
  status: string;
  userPermission: string;
  project?: ProjectInfoInterface;
}

export interface HintContentInterface {
  icon: string;
  color: string;
  text: string;
}

export interface BreadcrumbItem {
  text: string;
  disabled: boolean;
  action?: () => void;
}

export interface FlavorInterface {
  id: string;
  name: string;
  gpuType: string;
  gpu: string;
  cpu: string | number;
  memory: string | number;
  disk?: string | number;
  environment?: string;
  permission: string;
  createdAt: string;
}

export interface NetworkItemInterface {
  id: string;
  name: string;
  namespace: string;
  zone: string;
  cidr: string;
  default: string | boolean;
  createdAt: string;
}

export interface ProjectNetworkConfigInterface {
  projectId: string;
  publicZoneId: string;
  publicZoneName: string;
  privateZoneId: string;
  privateZoneName: string;
}

export interface ProjExternalNetworkItemInterface {
  projectId: string;
  name: string;
  codeName: string;
  type: string;
  networkConfig: ProjectNetworkConfigInterface;
}

export interface NetworkProviderItemInterface {
  id: string;
  name: string;
  description: string;
  cidr: string;
  securityGroupId: string;
  security_groups: Array<Record<string, any>>;
  security_groupIds: string[];
}

export interface NetworkProviderCreateInterface {
  providerNetworkId: string;
  name: string;
  description: string;
  securityGroupId: string;
}

export interface SecurityRuleInterface {
  id: string;
  networkType: string;
  fromPort: number;
  toPort: number;
  protocol: string;
  cidr: string;
}

export interface SecurityGroupInterface {
  uuid: string;
  name: string;
  ingress: SecurityRuleInterface[];
  egress: SecurityRuleInterface[];
}

export interface ProjectCreateParams {
  projectName: string;
  projectSysCode: string;
  memberAccounts: UserInfoInterface[];
}
