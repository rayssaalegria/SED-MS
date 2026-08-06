/**
 * Abstrações para futuras integrações governamentais.
 * A implementação atual usa Supabase; troque o adapter sem alterar as features.
 */

export interface AuthProvider {
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
  resetPassword(email: string): Promise<void>;
  updatePassword(newPassword: string): Promise<void>;
}

export interface FileStorage {
  upload(path: string, file: File | Blob): Promise<{ path: string }>;
  getSignedUrl(path: string, expiresInSeconds?: number): Promise<string>;
  remove(path: string): Promise<void>;
}

export interface AuditLogger {
  record(input: {
    action: string;
    entity?: string;
    entityId?: string;
    previousValue?: unknown;
    newValue?: unknown;
    organizationId?: string;
  }): Promise<void>;
}

export interface GovernmentApiClient {
  /** Stub para APIs estaduais/federais futuras */
  healthCheck(): Promise<{ ok: boolean; provider: string }>;
}
