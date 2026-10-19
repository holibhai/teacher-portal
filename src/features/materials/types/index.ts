/**
 * Exact Mentify Material Service Backend Data Transfer Objects and Enums.
 * Sourced directly from Mentify-backend Material Service contracts.
 */

export type MaterialPurpose =
  | 'LEARNING_MATERIAL'
  | 'ASSIGNMENT_ATTACHMENT'
  | 'SUBMISSION_ATTACHMENT'
  | 'AI_SOURCE'
  | 'ANNOUNCEMENT_ATTACHMENT'
  | 'OTHER';

export type MaterialType =
  | 'PDF'
  | 'DOCUMENT'
  | 'PRESENTATION'
  | 'SPREADSHEET'
  | 'IMAGE'
  | 'VIDEO'
  | 'AUDIO'
  | 'ARCHIVE'
  | 'OTHER';

export type MaterialStatus =
  | 'UPLOADED'
  | 'PROCESSING'
  | 'AVAILABLE'
  | 'ARCHIVED'
  | 'DELETED'
  | 'FAILED';

/**
 * Exact Material Entity as returned by the backend.
 * Do not add client-side synthetic properties such as fileUrl, bucketUrl,
 * teacherName, gradeName, resourceId, or visibility.
 */
export interface Material {
  id: string;
  title: string;
  description: string | null;
  originalFilename: string;
  contentType: string;
  fileSize: number;
  type: MaterialType;
  purpose: MaterialPurpose;
  status: MaterialStatus;
  uploadedBy: string;
  courseId: string | null;
  checksum: string | null;
  createdAt: string;
  updatedAt: string;
  storageKey?: string; // internal storage key returned on upload, not a public download URL
}

/**
 * Upload Material Request (multipart/form-data)
 */
export interface UploadMaterialFormData {
  title: string;
  description?: string;
  purpose?: MaterialPurpose;
  courseId: string;
  file: File;
}

/**
 * Exact Update Material Request payload.
 * Only title and description can be updated via PUT /api/v1/materials/{materialId}.
 */
export interface UpdateMaterialRequest {
  title: string;
  description: string | null;
}

/**
 * Exact Download Response from GET /api/v1/materials/{materialId}/download
 */
export interface MaterialDownloadResponse extends Material {
  downloadUrl: string;
  expiresAt: string;
}

/**
 * Spring Data Page structure returned by GET /api/v1/materials
 */
export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; // 0-indexed page number
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

/**
 * Standard Mentify API Response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp?: string;
}

/**
 * Filter parameters supported by GET /api/v1/materials
 */
export interface MaterialFilterParams {
  search?: string;
  type?: MaterialType;
  purpose?: MaterialPurpose;
  status?: MaterialStatus;
  uploadedBy?: string;
  courseId?: string;
  moduleId?: string;
  lessonId?: string;
  createdFrom?: string;
  createdTo?: string;
  page?: number;
  size?: number;
  sort?: string;
}
