export type Role = 'staff' | 'student';

export interface UploadedFile {
  name: string;
  dataUrl: string; // Base64 string for simulation purposes
  type: string;
  uploadedAt: string;
}

export interface StudentRecord {
  id: string;
  name: string;
  studentId: string;
  internshipFiles: UploadedFile[];
  participationFiles: UploadedFile[];
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}