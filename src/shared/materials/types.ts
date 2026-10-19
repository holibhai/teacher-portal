export type MaterialFileType =
  | 'PDF'
  | 'ZIP'
  | 'DOCX'
  | 'VIDEO'
  | 'SLIDES'
  | 'CODE'
  | 'IMAGE';

export type MaterialCategory =
  | 'Lecture Slides'
  | 'Starter Code'
  | 'Lab Manual'
  | 'Reference Reading'
  | 'Assignment Spec'
  | 'Exam Reference'
  | 'Video Lecture';

export type MaterialStatus = 'Published' | 'Draft' | 'Archived';

export interface AIDocumentQuestion {
  question: string;
  answer: string;
  pageOrSection?: string;
}

export interface MaterialItem {
  id: string;
  title: string;
  description: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  moduleId?: string;
  moduleTitle?: string;
  lessonId?: string;
  lessonTitle?: string;
  category: MaterialCategory;
  fileType: MaterialFileType;
  fileName: string;
  fileSizeBytes: number;
  fileSizeFormatted: string;
  mimeType: string;
  s3Key: string;
  s3Bucket: string;
  eTag: string;
  uploadedBy: string;
  uploadedByRole: 'Teacher' | 'Admin' | 'Student';
  uploaderName: string;
  uploadedAt: string;
  lastAccessedAt: string;
  downloadsCount: number;
  viewsCount: number;
  status: MaterialStatus;
  presignedUrl?: string;
  presignedUrlExpiresAt?: string;
  tags: string[];
  aiSummary?: string;
  aiKeyConcepts?: string[];
  aiStudyQuestions?: AIDocumentQuestion[];
  samplePreviewContent?: string;
  isStudentSubmission?: boolean;
  studentId?: string;
  studentName?: string;
}

export interface StorageAuditStats {
  totalStorageBytes: number;
  totalStorageFormatted: string;
  totalFilesCount: number;
  totalDownloadsCount: number;
  monthlyBandwidthFormatted: string;
  bucketRegion: string;
  storageByFormat: { format: MaterialFileType; percentage: number; sizeFormatted: string }[];
}

export interface UploadQueueItem {
  id: string;
  file: File | { name: string; size: number; type: string };
  title: string;
  description: string;
  courseId: string;
  moduleId?: string;
  lessonId?: string;
  category: MaterialCategory;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  errorMessage?: string;
}
