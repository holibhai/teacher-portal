import React, { useState, useRef } from 'react';
import {
  Upload,
  File,
  X,
  CheckCircle2,
  AlertCircle,
  FileText,
  FileCode,
  Video,
  Layers,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { MaterialCategory, MaterialFileType, MaterialItem } from './types';
import { mockCourses } from '../../teacher/data/mockData';

interface FileUploadDropzoneProps {
  onUploadSuccess: (newMaterials: MaterialItem[]) => void;
  onClose?: () => void;
  defaultCourseId?: string;
  defaultModuleId?: string;
  defaultLessonId?: string;
  defaultCategory?: MaterialCategory;
}

interface SelectedUploadFile {
  id: string;
  file: File;
  title: string;
  description: string;
  courseId: string;
  moduleId: string;
  category: MaterialCategory;
  progress: number;
  status: 'queued' | 'uploading' | 'completed' | 'error';
  errorMessage?: string;
  s3Key?: string;
}

const MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024; // 500 MB
const ALLOWED_EXTENSIONS = ['pdf', 'zip', 'docx', 'doc', 'mp4', 'mkv', 'pptx', 'ppt', 'java', 'py', 'ts', 'js', 'cpp'];

export const FileUploadDropzone: React.FC<FileUploadDropzoneProps> = ({
  onUploadSuccess,
  onClose,
  defaultCourseId = mockCourses[0]?.id || 'c1',
  defaultModuleId = '',
  defaultLessonId = '',
  defaultCategory = 'Lecture Slides',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [filesQueue, setFilesQueue] = useState<SelectedUploadFile[]>([]);
  const [globalError, setGlobalError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(defaultCourseId);
  const [selectedCategory, setSelectedCategory] = useState<MaterialCategory>(defaultCategory);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileTypeFromExtension = (filename: string): MaterialFileType => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    if (ext === 'pdf') return 'PDF';
    if (['zip', 'tar', 'gz', 'rar'].includes(ext)) return 'ZIP';
    if (['doc', 'docx'].includes(ext)) return 'DOCX';
    if (['mp4', 'mkv', 'mov', 'webm'].includes(ext)) return 'VIDEO';
    if (['ppt', 'pptx'].includes(ext)) return 'SLIDES';
    if (['java', 'py', 'ts', 'js', 'cpp', 'html', 'css'].includes(ext)) return 'CODE';
    return 'PDF';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFiles = (incomingFiles: FileList | File[]) => {
    setGlobalError('');
    const newItems: SelectedUploadFile[] = [];

    Array.from(incomingFiles).forEach((file) => {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';

      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        setGlobalError(`File "${file.name}" has an unsupported format (.${ext}).`);
        return;
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        setGlobalError(`File "${file.name}" exceeds the 500 MB maximum size limit.`);
        return;
      }

      newItems.push({
        id: `upload-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        file,
        title: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
        description: `Material resource for ${mockCourses.find((c) => c.id === selectedCourseId)?.code || 'Academic Course'}.`,
        courseId: selectedCourseId,
        moduleId: defaultModuleId,
        category: selectedCategory,
        progress: 0,
        status: 'queued',
      });
    });

    if (newItems.length > 0) {
      setFilesQueue((prev) => [...prev, ...newItems]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveItem = (id: string) => {
    setFilesQueue((prev) => prev.filter((item) => item.id !== id));
  };

  const startUploadPipeline = () => {
    if (filesQueue.length === 0) return;
    setIsProcessing(true);

    const activeCourse = mockCourses.find((c) => c.id === selectedCourseId) || mockCourses[0];

    // Simulate multi-part AWS S3 direct upload
    let currentItemIdx = 0;

    const processNext = () => {
      if (currentItemIdx >= filesQueue.length) {
        // Complete! Convert all to MaterialItems
        const createdMaterials: MaterialItem[] = filesQueue.map((item) => {
          const fileType = getFileTypeFromExtension(item.file.name);
          const s3Key = `mentify-materials-prod/${activeCourse.code.toLowerCase()}/${Date.now()}_${item.file.name}`;
          return {
            id: `mat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            title: item.title,
            description: item.description,
            courseId: activeCourse.id,
            courseCode: activeCourse.code,
            courseTitle: activeCourse.title,
            category: item.category,
            fileType,
            fileName: item.file.name,
            fileSizeBytes: item.file.size,
            fileSizeFormatted: formatFileSize(item.file.size),
            mimeType: item.file.type || 'application/octet-stream',
            s3Key,
            s3Bucket: 'mentify-edu-materials-east1',
            eTag: `"${Math.random().toString(36).substring(2, 12)}"`,
            uploadedBy: 'usr-prof-alex',
            uploadedByRole: 'Teacher',
            uploaderName: 'Dr. Alex Rivera',
            uploadedAt: new Date().toISOString(),
            lastAccessedAt: new Date().toISOString(),
            downloadsCount: 0,
            viewsCount: 1,
            status: 'Published',
            presignedUrl: `https://s3.us-east-1.amazonaws.com/mentify-edu-materials-east1/${s3Key}`,
            tags: [activeCourse.code, item.category, fileType],
            aiSummary: `Uploaded resource: ${item.title}. Processed and indexed into Mentify Vector Store for semantic search and AI comprehension.`,
            aiKeyConcepts: ['Course Reference', 'Syllabus Alignment', 'AWS S3 Verified'],
            samplePreviewContent: `[Mentify Document Pipeline]\nFile: ${item.file.name}\nSize: ${formatFileSize(item.file.size)}\nStatus: Verified and CloudFront Edge Cached.`,
          };
        });

        setTimeout(() => {
          setIsProcessing(false);
          onUploadSuccess(createdMaterials);
          if (onClose) onClose();
        }, 500);
        return;
      }

      const item = filesQueue[currentItemIdx];
      // Set status to uploading
      setFilesQueue((prev) =>
        prev.map((f, i) => (i === currentItemIdx ? { ...f, status: 'uploading' } : f))
      );

      let currentProg = 0;
      const interval = setInterval(() => {
        currentProg += 25;
        if (currentProg >= 100) {
          clearInterval(interval);
          setFilesQueue((prev) =>
            prev.map((f, i) =>
              i === currentItemIdx
                ? {
                    ...f,
                    progress: 100,
                    status: 'completed',
                    s3Key: `mentify-materials-prod/${activeCourse.code.toLowerCase()}/${item.file.name}`,
                  }
                : f
            )
          );
          currentItemIdx++;
          setTimeout(processNext, 200);
        } else {
          setFilesQueue((prev) =>
            prev.map((f, i) => (i === currentItemIdx ? { ...f, progress: currentProg } : f))
          );
        }
      }, 150);
    };

    processNext();
  };

  return (
    <div className="space-y-5">
      {/* Target Course & Category Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Target Academic Course
          </label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            disabled={isProcessing}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
          >
            {mockCourses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Material Classification
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as MaterialCategory)}
            disabled={isProcessing}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="Lecture Slides">Lecture Slides</option>
            <option value="Starter Code">Starter Code & Solutions</option>
            <option value="Lab Manual">Lab Manual & Guide</option>
            <option value="Reference Reading">Reference Reading & Papers</option>
            <option value="Assignment Spec">Assignment Specification</option>
            <option value="Exam Reference">Exam Reference Sheet</option>
            <option value="Video Lecture">Recorded Video Lecture</option>
          </select>
        </div>
      </div>

      {/* Drag & Drop Visual Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50/60 scale-[1.01]'
            : 'border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50'
        } ${isProcessing ? 'pointer-events-none opacity-60' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />

        <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-2xs">
          <Upload className="w-6 h-6" />
        </div>

        <h4 className="text-sm font-bold text-slate-900">
          Drag and drop files here, or <span className="text-indigo-600 underline">browse files</span>
        </h4>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Supports PDF, ZIP, DOCX, MP4, Code archives and PPTX. Up to 500 MB per file.
        </p>

        <div className="mt-3 flex items-center justify-center gap-3 text-[11px] text-slate-400 font-medium">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> S3 Encrypted (AES-256)
          </span>
          <span>·</span>
          <span>Multipart Direct Streaming</span>
          <span>·</span>
          <span>Virus Scanned</span>
        </div>
      </div>

      {/* Global Error Banner */}
      {globalError && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{globalError}</span>
        </div>
      )}

      {/* Upload Queue List */}
      {filesQueue.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span className="font-semibold">Files in Upload Queue ({filesQueue.length})</span>
            {!isProcessing && (
              <button
                type="button"
                onClick={() => setFilesQueue([])}
                className="text-slate-400 hover:text-rose-600 transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {filesQueue.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                      <File className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">{item.file.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {formatFileSize(item.file.size)} · {item.category}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.status === 'completed' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                      </span>
                    )}
                    {item.status === 'uploading' && (
                      <span className="text-[11px] font-mono text-indigo-600 font-bold">
                        {item.progress}%
                      </span>
                    )}
                    {item.status === 'queued' && !isProcessing && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-slate-400 hover:text-slate-600 p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                {(item.status === 'uploading' || item.status === 'completed') && (
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-200 rounded-full ${
                        item.status === 'completed' ? 'bg-emerald-500' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
        )}

        <button
          type="button"
          onClick={startUploadPipeline}
          disabled={filesQueue.length === 0 || isProcessing}
          className="ml-auto px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Streaming to AWS S3...</span>
            </>
          ) : (
            <>
              <span>Upload {filesQueue.length > 0 ? `${filesQueue.length} Files` : 'Materials'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
