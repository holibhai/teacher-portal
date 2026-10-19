import React, { useState } from 'react';
import {
  X,
  FileText,
  Shield,
  Key,
  Clock,
  Copy,
  Check,
  Save,
  Trash2,
  Archive,
  Download,
  ExternalLink,
  Layers,
  Sparkles,
} from 'lucide-react';
import { MaterialItem, MaterialStatus, MaterialCategory } from './types';

interface MaterialDetailsModalProps {
  isOpen: boolean;
  material: MaterialItem | null;
  onClose: () => void;
  onUpdateMetadata: (updated: MaterialItem) => void;
  onDeleteRequest?: (material: MaterialItem) => void;
  onOpenAIAnalysis?: (material: MaterialItem) => void;
}

export const MaterialDetailsModal: React.FC<MaterialDetailsModalProps> = ({
  isOpen,
  material,
  onClose,
  onUpdateMetadata,
  onDeleteRequest,
  onOpenAIAnalysis,
}) => {
  if (!isOpen || !material) return null;

  const [title, setTitle] = useState(material.title);
  const [description, setDescription] = useState(material.description);
  const [category, setCategory] = useState<MaterialCategory>(material.category);
  const [status, setStatus] = useState<MaterialStatus>(material.status);
  const [presignedDurationMinutes, setPresignedDurationMinutes] = useState(60);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const generatedPresignedUrl = `https://s3.us-east-1.amazonaws.com/${material.s3Bucket}/${material.s3Key}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Expires=${presignedDurationMinutes * 60}&X-Amz-Signature=c58f01b9e28e8`;

  const handleCopyPresigned = () => {
    navigator.clipboard.writeText(generatedPresignedUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      onUpdateMetadata({
        ...material,
        title,
        description,
        category,
        status,
      });
      setTimeout(() => setSaveSuccess(false), 2000);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Material Metadata & S3 Config</h3>
              <p className="text-xs text-slate-500 font-mono">{material.fileName}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Tabs / Form */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Quick AI & Download Strip */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/70 border border-indigo-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span className="font-semibold text-indigo-950 text-xs">AI Document Intelligence Ready</span>
            </div>
            {onOpenAIAnalysis && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAIAnalysis(material);
                }}
                className="px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-white hover:bg-indigo-100 border border-indigo-200 rounded-md shadow-2xs transition-colors cursor-pointer"
              >
                Launch Studio
              </button>
            )}
          </div>

          {/* S3 Storage Specifications Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                AWS S3 Storage Infrastructure
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <Shield className="w-3 h-3 text-emerald-600" /> AES-256 Server-Side Encrypted
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-[11px]">
              <div>
                <span className="text-slate-400 text-[10px] block">Target S3 Bucket</span>
                <span className="text-slate-800 font-bold">{material.s3Bucket}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Object MIME Type</span>
                <span className="text-slate-800">{material.mimeType}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-400 text-[10px] block">Canonical S3 Object Key</span>
                <span className="text-slate-700 text-[10px] break-all bg-white p-1.5 rounded border border-slate-200 block">
                  {material.s3Key}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">ETag Hash Checksum</span>
                <span className="text-slate-700">{material.eTag}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Raw File Size</span>
                <span className="text-slate-700">{material.fileSizeFormatted} ({material.fileSizeBytes} bytes)</span>
              </div>
            </div>
          </div>

          {/* Presigned Download URL Generator */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-indigo-600" /> S3 Presigned URL Generator
              </span>
              <div className="flex items-center gap-1 text-slate-500">
                <Clock className="w-3 h-3" />
                <span className="text-[11px]">Expires in:</span>
                <select
                  value={presignedDurationMinutes}
                  onChange={(e) => setPresignedDurationMinutes(Number(e.target.value))}
                  className="px-1.5 py-0.5 border border-slate-200 rounded text-[11px] bg-slate-50 font-semibold"
                >
                  <option value={15}>15 mins</option>
                  <option value={60}>1 hour</option>
                  <option value={1440}>24 hours</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={generatedPresignedUrl}
                className="flex-1 px-2.5 py-1.5 text-[11px] font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-600 select-all"
              />
              <button
                type="button"
                onClick={handleCopyPresigned}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs flex items-center gap-1 shrink-0 cursor-pointer"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUrl ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-400">
              Presigned tokens grant temporary direct read access to Amazon S3 without exposing credentials.
            </p>
          </div>

          {/* Editable Metadata Form */}
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Display Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description & Pedagogy Notes
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as MaterialCategory)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
                >
                  <option value="Lecture Slides">Lecture Slides</option>
                  <option value="Starter Code">Starter Code</option>
                  <option value="Lab Manual">Lab Manual</option>
                  <option value="Reference Reading">Reference Reading</option>
                  <option value="Assignment Spec">Assignment Spec</option>
                  <option value="Exam Reference">Exam Reference</option>
                  <option value="Video Lecture">Video Lecture</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Publication Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as MaterialStatus)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
                >
                  <option value="Published">Published (Students Visible)</option>
                  <option value="Draft">Draft (Instructors Only)</option>
                  <option value="Archived">Archived (Read-Only)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              {onDeleteRequest && (
                <button
                  type="button"
                  onClick={() => onDeleteRequest(material)}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete or Archive</span>
                </button>
              )}

              <div className="flex items-center gap-2 ml-auto">
                {saveSuccess && (
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Saved!
                  </span>
                )}
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Updating S3...' : 'Save Changes'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
