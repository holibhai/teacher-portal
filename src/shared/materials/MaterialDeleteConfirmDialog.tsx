import React, { useState } from 'react';
import { AlertTriangle, Archive, Trash2, X, Check, ShieldAlert } from 'lucide-react';
import { MaterialItem } from './types';

interface MaterialDeleteConfirmDialogProps {
  isOpen: boolean;
  material: MaterialItem | null;
  onClose: () => void;
  onConfirmArchive: (material: MaterialItem) => void;
  onConfirmPermanentDelete: (material: MaterialItem) => void;
}

export const MaterialDeleteConfirmDialog: React.FC<MaterialDeleteConfirmDialogProps> = ({
  isOpen,
  material,
  onClose,
  onConfirmArchive,
  onConfirmPermanentDelete,
}) => {
  if (!isOpen || !material) return null;

  const [confirmInput, setConfirmInput] = useState('');
  const [deleteMode, setDeleteMode] = useState<'archive' | 'permanent'>('archive');
  const [isProcessing, setIsProcessing] = useState(false);

  const isConfirmed =
    deleteMode === 'archive' || confirmInput.trim().toLowerCase() === 'delete';

  const handleAction = () => {
    if (!isConfirmed) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      if (deleteMode === 'archive') {
        onConfirmArchive(material);
      } else {
        onConfirmPermanentDelete(material);
      }
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5 text-amber-700">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Manage Material Lifecycle</h3>
              <p className="text-[11px] text-slate-500 font-mono">{material.courseCode} · {material.fileType}</p>
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

        {/* Body */}
        <div className="p-6 space-y-4 text-xs">
          <div>
            <p className="text-slate-700 font-semibold mb-1 truncate">{material.title}</p>
            <p className="text-slate-500 leading-relaxed text-[11px]">
              This file is currently stored in bucket <code className="text-slate-800 font-mono">{material.s3Bucket}</code>. Select whether to safely archive or permanently purge it.
            </p>
          </div>

          {/* Option Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setDeleteMode('archive')}
              className={`py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                deleteMode === 'archive'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Archive className="w-3.5 h-3.5 text-amber-600" />
              <span>Archive (Safe)</span>
            </button>

            <button
              type="button"
              onClick={() => setDeleteMode('permanent')}
              className={`py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                deleteMode === 'permanent'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-rose-600'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Permanent Delete</span>
            </button>
          </div>

          {deleteMode === 'archive' ? (
            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-amber-900 space-y-1">
              <span className="font-bold block">Archival Policy</span>
              <p className="text-[11px] leading-relaxed">
                Archived materials remain securely preserved in S3 Glacier/Standard tier but will be hidden from student course packs. Instructors and admins can restore it at any time.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                  <span>Irreversible AWS S3 Removal</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  This will trigger an S3 <code className="font-mono">DeleteObject</code> command. Any presigned URLs and student bookmarks will become permanently invalid.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Type <span className="font-mono font-bold text-rose-600">DELETE</span> to confirm:
                </label>
                <input
                  type="text"
                  value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value)}
                  placeholder="DELETE"
                  className="w-full px-3 py-1.5 text-xs font-mono border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-rose-500/20"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!isConfirmed || isProcessing}
            onClick={handleAction}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
              deleteMode === 'archive'
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-rose-600 hover:bg-rose-700 text-white'
            }`}
          >
            {deleteMode === 'archive' ? (
              <>
                <Archive className="w-3.5 h-3.5" />
                <span>Confirm Archive</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Permanently Purge S3 File</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
