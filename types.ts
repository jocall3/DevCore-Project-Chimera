
export type UniqueID = string;

export interface Feature {
  id: UniqueID;
  name: string;
  description: string;
  icon: string;
  category: string;
}

export enum FeatureStatus {
  Draft = 'Draft',
  UnderDevelopment = 'Under Development',
  Alpha = 'Alpha Release',
  Beta = 'Beta Release',
  Active = 'Active',
  Deprecated = 'Deprecated',
  Archived = 'Archived',
  Experimental = 'Experimental',
  RollbackPending = 'Rollback Pending',
  AwaitingApproval = 'Awaiting Approval',
}

export enum FeatureAccessibility {
  Public = 'Public',
  Private = 'Private',
  LimitedAudience = 'Limited Audience',
  EnterpriseClients = 'Enterprise Clients',
  PremiumTier = 'Premium Tier',
  AIControlled = 'AI Controlled',
}

export interface FeatureMetadata {
  tags: string[];
  keywords: string[];
  documentationUrl?: string;
  githubRepoUrl?: string;
  jiraTicketId?: string;
  aiGeneratedDescription?: string;
  createdAt: Date;
  updatedAt: Date;
  version: string;
}

export interface FeatureDependency {
  dependencyId: UniqueID;
  type: 'hard' | 'soft';
  minimumVersion?: string;
}

export interface FeatureExtension {
  id: UniqueID;
  name: string;
  description: string;
  type: 'integration' | 'sub-feature' | 'plugin';
  config: Record<string, any>;
  status: FeatureStatus;
  enabledByDefault: boolean;
}

export interface FeatureConfiguration {
  isEnabled: boolean;
  audienceSegmentIds?: UniqueID[];
  percentageRollout?: number;
  abTestGroup?: 'A' | 'B' | 'Control';
  settings?: Record<string, any>;
}

export interface EnhancedFeature extends Feature {
  status: FeatureStatus;
  accessibility: FeatureAccessibility;
  metadata: FeatureMetadata;
  dependencies: FeatureDependency[];
  extensions: FeatureExtension[];
  config: FeatureConfiguration;
  externalServiceIntegrations?: UniqueID[];
}

export enum ServiceCategory {
  Payments = 'Payments',
  CRM = 'CRM',
  Analytics = 'Analytics',
  CloudCompute = 'Cloud Compute',
  Communication = 'Communication',
  Database = 'Database',
  Security = 'Security',
  AI_ML = 'AI/ML Platforms',
  Blockchain = 'Blockchain & Web3',
  IoT = 'IoT & Edge',
  Finance = 'Financial Services',
}

export enum ServiceIntegrationStatus {
  Configured = 'Configured',
  Connecting = 'Connecting',
  Active = 'Active',
  Inactive = 'Inactive',
  Error = 'Error',
  UnderMaintenance = 'Under Maintenance',
}

export interface ExternalServiceDefinition {
  id: UniqueID;
  name: string;
  description: string;
  category: ServiceCategory;
  baseUrl: string;
  authenticationMethod: 'API_KEY' | 'OAuth2' | 'JWT' | 'None';
  currentStatus: ServiceIntegrationStatus;
  lastChecked: Date;
  capabilities: string[];
  metadata: FeatureMetadata;
}

export interface AIChatMessage {
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: Date;
}

export interface NotificationMessage {
  id: UniqueID;
  timestamp: Date;
  type: 'info' | 'success' | 'warning' | 'error' | 'urgent';
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
}

export interface AuditRecord {
  id: UniqueID;
  timestamp: Date;
  actorId: UniqueID;
  action: string;
  targetType: string;
  targetId: UniqueID;
  newValue?: any;
  context?: Record<string, any>;
}
