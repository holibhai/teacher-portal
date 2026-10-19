import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  File,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { Material, MaterialPurpose } from '../types';
import {
  MAX_TITLE_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MAX_FILE_SIZE_BYTES,
  MATERIAL_PURPOSE_LABELS,
  formatBytes,
} from '../constants';
import { materialApi } from '../api/materialApi';

interface CourseOption {
  id: string;
  code: string;
  title: string;
}

interface MaterialUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newMaterial: Material) => void;
  authorizedCourses: CourseOption[];
  defaultCourseId?: string;
  defaultPurpose?: MaterialPurpose;
  allowedPurposes?: MaterialPurpose[];
}

export const MaterialUploadModal: React.FC<MaterialUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  authorizedCourses,
  defaultCourseId,
  defaultPurpose = 'LEARNING_MATERIAL',
  allowedPurposes = [
    'LEARNING_MATERIAL',
    'ASSIGNMENT_ATTACHMENT',
    'SUBMISSION_ATTACHMENT',
    'AI_SOURCE',
    'ANNOUNCEMENT_ATTACHMENT',
    'OTHER',
  ],
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [purpose, setPurpose] = useState<MaterialPurpose>(defaultPurpose);
  const [courseId, setCourseId] = useState(defaultCourseId || authorizedCourses[0]?.id || '');
  const [file, setFile] = useState<File | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelection = (selectedFile: File) => {
    setErrorMessage('');
    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage(`File exceeds maximum size limit of ${formatBytes(MAX_FILE_SIZE_BYTES)}.`);
      return;
    }
    if (selectedFile.size === 0) {
      setErrorMessage('Selected file is empty.');
      return;
    }

    setFile(selectedFile);
    // Autofill title if empty
    if (!title.trim()) {
      const cleanName = selectedFile.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setTitle(cleanName.slice(0, MAX_TITLE_LENGTH));
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
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Client-side validation matching backend rules
    if (!title.trim()) {
      setErrorMessage('Title must not be blank.');
      return;
    }
    if (title.length > MAX_TITLE_LENGTH) {
      setErrorMessage(`Title cannot exceed ${MAX_TITLE_LENGTH} characters.`);
      return;
    }
    if (description.length > MAX_DESCRIPTION_LENGTH) {
      setErrorMessage(`Description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters.`);
      return;
    }
    if (!courseId) {
      setErrorMessage('Please select a course.');
      return;
    }
    if (!file) {
      setErrorMessage('Please choose a file to upload.');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      if (description.trim()) {
        formData.append('description', description.trim());
      }
      formData.append('purpose', purpose);
      formData.append('courseId', courseId);
      formData.append('file', file);

      const created = await materialApi.uploadMaterial(formData, (percent) => {
        setUploadProgress(percent);
      });

      onSuccess(created);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to upload material to backend service.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div>
            <h3 className="text-base font-bold text-slate-900">Upload Learning Material</h3>
            <p className="text-xs text-slate-500 font-mono">POST /api/v1/materials</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* File Picker Drag and Drop */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              File Attachment <span className="text-rose-500">*</span>
            </label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !isSubmitting && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-50/50 scale-[1.01]'
                  : 'border-slate-200 hover:border-indigo-400 bg-slate-50/50'
              } ${isSubmitting ? 'pointer-events-none opacity-60' : ''}`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => e.target.files && e.target.files[0] && handleFileSelection(e.target.files[0])}
              />

              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    <File className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-slate-900 text-xs truncate max-w-xs">{file.name}</p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {formatBytes(file.size)} · {file.type || 'application/octet-stream'}
                    </p>
                  </div>
                  <span className="text-indigo-600 text-[11px] font-semibold underline ml-2">Change</span>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-800">
                    Drag and drop file here, or <span className="text-indigo-600 underline">browse</span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Max size: {formatBytes(MAX_FILE_SIZE_BYTES)}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700">
                Title <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                {title.length}/{MAX_TITLE_LENGTH}
              </span>
            </div>
            <input
              type="text"
              value={title}
              maxLength={MAX_TITLE_LENGTH}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Lecture 12: AVL Trees & Rotations Invariant"
              required
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700">Description (Optional)</label>
              <span className="text-[10px] text-slate-400 font-mono">
                {description.length}/{MAX_DESCRIPTION_LENGTH}
              </span>
            </div>
            <textarea
              rows={2}
              value={description}
              maxLength={MAX_DESCRIPTION_LENGTH}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide context, syllabus objectives, or instructions..."
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 leading-relaxed"
            />
          </div>

          {/* Course and Purpose */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Authorized Course <span className="text-rose-500">*</span>
              </label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
              >
                {authorizedCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Material Purpose
              </label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value as MaterialPurpose)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
              >
                {allowedPurposes.map((p) => (
                  <option key={p} value={p}>
                    {MATERIAL_PURPOSE_LABELS[p]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Progress bar during upload */}
          {isSubmitting && (
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs text-slate-600 font-mono">
                <span>Uploading multipart data...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-200"
                  style={{ width: `${Math.max(uploadProgress, 10)}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-900 rounded-lg cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Submitting to Service...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Material</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
