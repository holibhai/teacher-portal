import React, { useState } from 'react';
import {
  X,
  Download,
  Eye,
  Clock,
  Calendar,
  User,
  BookOpen,
  FileText,
  Shield,
  Hash,
  RefreshCw,
  Edit2,
  Archive,
  Trash2,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import { Material } from '../types';
import {
  MATERIAL_PURPOSE_LABELS,
  MATERIAL_TYPE_LABELS,
  formatBytes,
} from '../constants';
import { MaterialStatusBadge } from './MaterialStatusBadge';
import { materialApi } from '../api/materialApi';

interface MaterialDetailsModalProps {
  isOpen: boolean;
  material: Material | null;
  onClose: () => void;
  onOpenPreview?: (material: Material) => void;
  onOpenEdit?: (material: Material) => void;
  onOpenArchive?: (material: Material) => void;
  onOpenDelete?: (material: Material) => void;
  canEdit?: boolean;
}

export const MaterialDetailsModal: React.FC<MaterialDetailsModalProps> = ({
  isOpen,
  material,
  onClose,
  onOpenPreview,
  onOpenEdit,
  onOpenArchive,
  onOpenDelete,
  canEdit = true,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');
  const [copiedChecksum, setCopiedChecksum] = useState(false);

  if (!isOpen || !material) return null;

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadError('');
    try {
      const response = await materialApi.getMaterialDownloadUrl(material.id);
      if (response && response.downloadUrl) {
        // Open download stream
        window.open(response.downloadUrl, '_blank');
      } else {
        throw new Error('No download URL returned from Material Service.');
      }
    } catch (err: any) {
      setDownloadError(err.message || 'Unable to retrieve authorized download URL.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyChecksum = () => {
    if (material.checksum) {
      navigator.clipboard.writeText(material.checksum);
      setCopiedChecksum(true);
      setTimeout(() => setCopiedChecksum(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Material Resource Details</h3>
              <p className="text-[11px] text-slate-400 font-mono">ID: {material.id}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {downloadError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              {downloadError}
            </div>
          )}

          {/* Title & Status */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono uppercase font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                {MATERIAL_TYPE_LABELS[material.type] || material.type}
              </span>
              <MaterialStatusBadge status={material.status} size="md" />
            </div>
            <h2 className="text-base font-bold text-slate-900">{material.title}</h2>
            {material.description ? (
              <p className="text-slate-600 leading-relaxed pt-1">{material.description}</p>
            ) : (
              <p className="text-slate-400 italic text-[11px]">No description provided.</p>
            )}
          </div>

          {/* Core Backend Attributes Grid */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 font-mono text-[11px]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-sans">
              Verified Backend Metadata
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block text-[10px] font-sans">Original Filename</span>
                <span className="text-slate-800 font-semibold truncate block" title={material.originalFilename}>
                  {material.originalFilename}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-sans">Content MIME Type</span>
                <span className="text-slate-800 truncate block">{material.contentType}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-sans">Exact File Size</span>
                <span className="text-slate-800 font-semibold">
                  {formatBytes(material.fileSize)} ({material.fileSize.toLocaleString()} bytes)
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-sans">Purpose Classification</span>
                <span className="text-slate-800 font-sans font-medium">
                  {MATERIAL_PURPOSE_LABELS[material.purpose] || material.purpose}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-sans">Associated Course ID</span>
                <span className="text-slate-800">{material.courseId || 'None'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-sans">Uploaded By</span>
                <span className="text-slate-800">{material.uploadedBy}</span>
              </div>
            </div>

            {/* SHA-256 Checksum */}
            {material.checksum && (
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between text-[10px] font-sans text-slate-400 mb-1">
                  <span>SHA-256 Content Integrity Checksum</span>
                  <button
                    type="button"
                    onClick={handleCopyChecksum}
                    className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    {copiedChecksum ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedChecksum ? 'Copied' : 'Copy Hash'}</span>
                  </button>
                </div>
                <div className="p-2 bg-white rounded border border-slate-200 text-[10px] text-slate-600 break-all select-all font-mono">
                  {material.checksum}
                </div>
              </div>
            )}

            {/* Audit Timestamps */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200 text-[10px] text-slate-500 font-sans">
              <div>
                <span className="text-slate-400 block">Created At:</span>
                <span>{new Date(material.createdAt).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Last Updated:</span>
                <span>{new Date(material.updatedAt).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
            <div className="flex items-center gap-2">
              {onOpenPreview && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenPreview(material);
                  }}
                  className="px-3 py-1.5 font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>Preview</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleDownload}
                disabled={isDownloading || material.status !== 'AVAILABLE'}
                className="px-3.5 py-1.5 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDownloading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Requesting Fresh URL...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </>
                )}
              </button>
            </div>

            {canEdit && (
              <div className="flex items-center gap-1.5">
                {onOpenEdit && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenEdit(material);
                    }}
                    className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
                    title="Edit Metadata"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}

                {onOpenArchive && material.status !== 'ARCHIVED' && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenArchive(material);
                    }}
                    className="p-1.5 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg cursor-pointer"
                    title="Archive Material"
                  >
                    <Archive className="w-3.5 h-3.5" />
                  </button>
                )}

                {onOpenDelete && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenDelete(material);
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                    title="Delete Material"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
