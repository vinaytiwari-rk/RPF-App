// src/types/service.ts
import type { Timestamp } from "firebase/firestore";

export interface ServiceSubmission {
  userId: string;
  citizenName: string;
  citizenPhone: string;
  serviceName: string;
  submissionData: Record<string, any>;
  createdAt: Timestamp | Date;
}
