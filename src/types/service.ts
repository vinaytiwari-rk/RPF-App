// src/types/service.ts

export interface ServiceSubmission {
  userId: string;
  citizenName: string;
  citizenPhone: string;
  serviceName: string;
  submissionData: Record<string, any>;
  createdAt: Date | string;
}
