import { StorageService, PartnerConfig } from './StorageService';

export interface ApprovalRequest {
  id: string;
  type: 'disable_protection' | 'remove_app' | 'change_settings';
  requestedAt: number;
  expiresAt?: number;
  approved: boolean;
  approvedAt?: number;
}

export const PartnerService = {
  // Setup partner
  async setupPartner(config: PartnerConfig): Promise<void> {
    await StorageService.setPartnerConfig({
      ...config,
      connectedAt: Date.now(),
    });
  },

  // Get current partner config
  async getPartner(): Promise<PartnerConfig | null> {
    return StorageService.getPartnerConfig();
  },

  // Check if partner is configured
  async hasPartner(): Promise<boolean> {
    const config = await StorageService.getPartnerConfig();
    return config !== null;
  },

  // Request approval for an action
  async requestApproval(type: ApprovalRequest['type']): Promise<ApprovalRequest> {
    const config = await StorageService.getPartnerConfig();

    const request: ApprovalRequest = {
      id: Date.now().toString(),
      type,
      requestedAt: Date.now(),
      approved: false,
    };

    if (!config) {
      // No partner configured, auto-approve
      request.approved = true;
      request.approvedAt = Date.now();
      return request;
    }

    if (config.type === 'self') {
      // Self-accountability: set expiration based on time delay
      const delayHours = config.timeDelay || 24;
      request.expiresAt = Date.now() + (delayHours * 60 * 60 * 1000);
    } else {
      // Friend/Parent: would need to send email notification
      // For now, we just create the pending request
      await this.sendPartnerNotification(config.email!, type);
    }

    return request;
  },

  // Check if approval request has expired (for self-accountability)
  isApprovalExpired(request: ApprovalRequest): boolean {
    if (!request.expiresAt) return false;
    return Date.now() >= request.expiresAt;
  },

  // Simulate sending notification to partner
  async sendPartnerNotification(
    email: string,
    requestType: ApprovalRequest['type']
  ): Promise<void> {
    // In a real app, this would send an email or push notification
    // For MVP, this is a placeholder
    console.log(`Notification sent to ${email} for ${requestType}`);
  },

  // Check remaining time for self-accountability delay
  getRemainingTime(request: ApprovalRequest): {
    hours: number;
    minutes: number;
    seconds: number;
    totalSeconds: number;
  } {
    if (!request.expiresAt) {
      return { hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 };
    }

    const remaining = Math.max(0, request.expiresAt - Date.now());
    const totalSeconds = Math.floor(remaining / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return { hours, minutes, seconds, totalSeconds };
  },

  // Format remaining time in Arabic-friendly format
  formatRemainingTime(request: ApprovalRequest, isArabic: boolean = true): string {
    const { hours, minutes } = this.getRemainingTime(request);

    if (isArabic) {
      return `${hours} ساعة و ${minutes} دقيقة`;
    }
    return `${hours}h ${minutes}m`;
  },

  // Remove partner
  async removePartner(): Promise<void> {
    await StorageService.clearPartnerConfig();
  },
};

export default PartnerService;
