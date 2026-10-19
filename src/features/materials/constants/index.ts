import {
  FileText,
  FileCode,
  FileSpreadsheet,
  Image,
  Video,
  Music,
  Archive,
  File,
  Presentation,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Archive as ArchiveIcon,
  HelpCircle,
  Sparkles,
  BookOpen,
  FileCheck,
  Megaphone,
} from 'lucide-react';
import React from 'react';
import { MaterialPurpose, MaterialStatus, MaterialType } from '../types';

export const MAX_TITLE_LENGTH = 200;
export const MAX_DESCRIPTION_LENGTH = 2000;
export const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100MB limit

/**
 * Display names for MaterialPurpose
 */
export const MATERIAL_PURPOSE_LABELS: Record<MaterialPurpose, string> = {
  LEARNING_MATERIAL: 'Learning Material',
  ASSIGNMENT_ATTACHMENT: 'Assignment Attachment',
  SUBMISSION_ATTACHMENT: 'Submission Attachment',
  AI_SOURCE: 'AI Knowledge Source',
  ANNOUNCEMENT_ATTACHMENT: 'Announcement Attachment',
  OTHER: 'Other Resource',
};

/**
 * Display names for MaterialType
 */
export const MATERIAL_TYPE_LABELS: Record<MaterialType, string> = {
  PDF: 'PDF Document',
  DOCUMENT: 'Word / Text Document',
  PRESENTATION: 'Presentation Slide Deck',
  SPREADSHEET: 'Spreadsheet / Workbook',
  IMAGE: 'Image / Diagram',
  VIDEO: 'Video Recording',
  AUDIO: 'Audio Clip',
  ARCHIVE: 'ZIP / Code Archive',
  OTHER: 'File Attachment',
};

/**
 * Display metadata for MaterialStatus
 */
export const MATERIAL_STATUS_CONFIG: Record<
  MaterialStatus,
  { label: string; badgeClasses: string; icon: React.ComponentType<{ className?: string }> }
> = {
  AVAILABLE: {
    label: 'Available',
    badgeClasses: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: CheckCircle2,
  },
  PROCESSING: {
    label: 'Processing',
    badgeClasses: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: Clock,
  },
  UPLOADED: {
    label: 'Uploaded',
    badgeClasses: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Clock,
  },
  ARCHIVED: {
    label: 'Archived',
    badgeClasses: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: ArchiveIcon,
  },
  FAILED: {
    label: 'Failed',
    badgeClasses: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: AlertTriangle,
  },
  DELETED: {
    label: 'Deleted',
    badgeClasses: 'bg-red-50 text-red-700 border-red-200',
    icon: XCircle,
  },
};

/**
 * Icons mapped to MaterialType
 */
export const MATERIAL_TYPE_ICONS: Record<
  MaterialType,
  React.ComponentType<{ className?: string }>
> = {
  PDF: FileText,
  DOCUMENT: FileText,
  PRESENTATION: Presentation,
  SPREADSHEET: FileSpreadsheet,
  IMAGE: Image,
  VIDEO: Video,
  AUDIO: Music,
  ARCHIVE: Archive,
  OTHER: File,
};

/**
 * Icons mapped to MaterialPurpose
 */
export const MATERIAL_PURPOSE_ICONS: Record<
  MaterialPurpose,
  React.ComponentType<{ className?: string }>
> = {
  LEARNING_MATERIAL: BookOpen,
  ASSIGNMENT_ATTACHMENT: FileCheck,
  SUBMISSION_ATTACHMENT: FileCode,
  AI_SOURCE: Sparkles,
  ANNOUNCEMENT_ATTACHMENT: Megaphone,
  OTHER: File,
};

/**
 * File size formatter helper (bytes -> human-readable)
 */
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

/**
 * MIME type to MaterialType classifier
 */
export const inferMaterialType = (filename: string, mimeType?: string): MaterialType => {
  const ext = filename.split('.').pop()?.toLowerCase() || '';

  if (ext === 'pdf' || mimeType === 'application/pdf') return 'PDF';
  if (['doc', 'docx', 'odt', 'rtf', 'txt'].includes(ext)) return 'DOCUMENT';
  if (['ppt', 'pptx', 'odp', 'key'].includes(ext)) return 'PRESENTATION';
  if (['xls', 'xlsx', 'csv', 'ods'].includes(ext)) return 'SPREADSHEET';
  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) return 'IMAGE';
  if (['mp4', 'mkv', 'mov', 'webm', 'avi'].includes(ext)) return 'VIDEO';
  if (['mp3', 'wav', 'ogg', 'm4a', 'flac'].includes(ext)) return 'AUDIO';
  if (['zip', 'tar', 'gz', '7z', 'rar', 'java', 'py', 'ts', 'js', 'cpp', 'c', 'cs'].includes(ext))
    return 'ARCHIVE';

  return 'OTHER';
};
