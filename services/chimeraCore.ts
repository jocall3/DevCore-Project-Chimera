
import { 
  UniqueID, 
  FeatureStatus, 
  FeatureAccessibility, 
  EnhancedFeature, 
  ServiceCategory, 
  ServiceIntegrationStatus, 
  ExternalServiceDefinition,
  NotificationMessage,
  AuditRecord,
  FeatureConfiguration
} from '../types';

// --- ID GENERATOR ---
export class IDGenerator {
  private static instance: IDGenerator;
  private currentId: number = 0;
  private prefix: string;

  private constructor(prefix: string = 'chimera') {
    this.prefix = prefix;
  }

  public static getInstance(): IDGenerator {
    if (!IDGenerator.instance) IDGenerator.instance = new IDGenerator();
    return IDGenerator.instance;
  }

  public generate(): UniqueID {
    this.currentId += 1;
    return `${this.prefix}-${Date.now().toString(36)}-${this.currentId.toString(36)}`;
  }
}
export const GlobalIDGenerator = IDGenerator.getInstance();

// --- AUDIT LOG SERVICE ---
export class AuditLogService {
  private static instance: AuditLogService;
  private auditLogs: AuditRecord[] = [];
  private listeners: Set<(logs: AuditRecord[]) => void> = new Set();

  public static getInstance(): AuditLogService {
    if (!AuditLogService.instance) AuditLogService.instance = new AuditLogService();
    return AuditLogService.instance;
  }

  public recordAction(actorId: UniqueID, action: string, targetType: string, targetId: UniqueID, newValue?: any, context?: any) {
    const record: AuditRecord = {
      id: GlobalIDGenerator.generate(),
      timestamp: new Date(),
      actorId,
      action,
      targetType,
      targetId,
      newValue,
      context
    };
    this.auditLogs.unshift(record);
    if (this.auditLogs.length > 1000) this.auditLogs.pop();
    this.notify();
  }

  public getLogs() { return this.auditLogs; }

  public subscribe(l: (logs: AuditRecord[]) => void) {
    this.listeners.add(l);
    l(this.auditLogs);
    return () => this.listeners.delete(l);
  }

  private notify() { this.listeners.forEach(l => l([...this.auditLogs])); }
}
export const AppAudit = AuditLogService.getInstance();

// --- NOTIFICATION SERVICE ---
export class NotificationService {
  private static instance: NotificationService;
  private notifications: NotificationMessage[] = [];
  private listeners: Set<(n: NotificationMessage[]) => void> = new Set();

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) NotificationService.instance = new NotificationService();
    return NotificationService.instance;
  }

  public publish(type: NotificationMessage['type'], title: string, message: string, actionUrl?: string) {
    const n: NotificationMessage = {
      id: GlobalIDGenerator.generate(),
      timestamp: new Date(),
      type, title, message, actionUrl,
      read: false
    };
    this.notifications.unshift(n);
    this.notify();
    return n.id;
  }

  public markAsRead(id: string) {
    const n = this.notifications.find(not => not.id === id);
    if (n) {
      n.read = true;
      this.notify();
    }
  }

  public subscribe(l: (n: NotificationMessage[]) => void) {
    this.listeners.add(l);
    l(this.notifications);
    return () => this.listeners.delete(l);
  }

  private notify() { this.listeners.forEach(l => l([...this.notifications])); }
}
export const AppNotification = NotificationService.getInstance();

// --- TELEMETRY SERVICE ---
export class TelemetryService {
  private static instance: TelemetryService;
  public static getInstance(): TelemetryService {
    if (!TelemetryService.instance) TelemetryService.instance = new TelemetryService();
    return TelemetryService.instance;
  }
  public track(event: string, payload: any) {
    console.debug(`[Telemetry] ${event}`, payload);
  }
}
export const AppTelemetry = TelemetryService.getInstance();

// --- USER ACCESS SERVICE ---
export class UserAccessService {
  private static instance: UserAccessService;
  private currentUserId: UniqueID = 'admin-001';
  private permissions: Set<string> = new Set(['admin', 'beta-access', 'enterprise']);

  public static getInstance(): UserAccessService {
    if (!UserAccessService.instance) UserAccessService.instance = new UserAccessService();
    return UserAccessService.instance;
  }

  public getUserId() { return this.currentUserId; }
  public hasPermission(p: string) { return this.permissions.has(p); }
}
export const AppUserAccess = UserAccessService.getInstance();

// --- FEATURE FLAG SERVICE ---
export class FeatureFlagService {
  private static instance: FeatureFlagService;
  private flags: Map<UniqueID, boolean> = new Map();

  public static getInstance(): FeatureFlagService {
    if (!FeatureFlagService.instance) FeatureFlagService.instance = new FeatureFlagService();
    return FeatureFlagService.instance;
  }

  public setFlag(id: UniqueID, enabled: boolean) {
    this.flags.set(id, enabled);
    AppAudit.recordAction(AppUserAccess.getUserId(), 'FLAG_TOGGLED', 'Feature', id, enabled);
  }

  public isEnabled(id: UniqueID) { return this.flags.get(id) || false; }
}
export const AppFeatureFlags = FeatureFlagService.getInstance();

// --- SERVICE REGISTRY ---
export class ServiceRegistry {
  private static instance: ServiceRegistry;
  private services: Map<UniqueID, ExternalServiceDefinition> = new Map();
  private listeners: Set<(s: ExternalServiceDefinition[]) => void> = new Set();

  public static getInstance(): ServiceRegistry {
    if (!ServiceRegistry.instance) ServiceRegistry.instance = new ServiceRegistry();
    return ServiceRegistry.instance;
  }

  public register(service: ExternalServiceDefinition) {
    this.services.set(service.id, service);
    this.notify();
  }

  public getAll() { return Array.from(this.services.values()); }

  public subscribe(l: (s: ExternalServiceDefinition[]) => void) {
    this.listeners.add(l);
    l(this.getAll());
    return () => this.listeners.delete(l);
  }

  private notify() { this.listeners.forEach(l => l(this.getAll())); }
}
export const AppServiceRegistry = ServiceRegistry.getInstance();

// --- FEATURE MANAGER SERVICE ---
export class FeatureManagerService {
  private static instance: FeatureManagerService;
  private features: Map<UniqueID, EnhancedFeature> = new Map();
  private listeners: Set<(f: EnhancedFeature[]) => void> = new Set();

  public static getInstance(): FeatureManagerService {
    if (!FeatureManagerService.instance) FeatureManagerService.instance = new FeatureManagerService();
    return FeatureManagerService.instance;
  }

  public register(features: EnhancedFeature[]) {
    features.forEach(f => {
      this.features.set(f.id, f);
      AppFeatureFlags.setFlag(f.id, f.config.isEnabled);
    });
    this.notify();
  }

  public getFeatures() {
    return Array.from(this.features.values());
  }

  public toggleFeature(id: UniqueID, enabled: boolean) {
    const f = this.features.get(id);
    if (f) {
      AppFeatureFlags.setFlag(id, enabled);
      f.config.isEnabled = enabled;
      AppTelemetry.track('feature_toggle', { id, enabled });
      this.notify();
    }
  }

  public updateConfig(id: UniqueID, config: Partial<FeatureConfiguration>) {
    const f = this.features.get(id);
    if (f) {
      f.config = { ...f.config, ...config };
      AppAudit.recordAction(AppUserAccess.getUserId(), 'CONFIG_UPDATE', 'Feature', id, f.config);
      this.notify();
    }
  }

  public subscribe(l: (f: EnhancedFeature[]) => void) {
    this.listeners.add(l);
    l(this.getFeatures());
    return () => this.listeners.delete(l);
  }

  private notify() { this.listeners.forEach(l => l(this.getFeatures())); }
}
export const AppFeatureManager = FeatureManagerService.getInstance();
