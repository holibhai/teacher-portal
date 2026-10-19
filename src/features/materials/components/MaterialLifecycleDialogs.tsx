import React, { useState } from 'react';
import { Archive, Trash2, X, AlertTriangle, RefreshCw } from 'lucide-react';
import { Material } from '../types';
import { materialApi } from '../api/materialApi';

interface MaterialArchiveDialogProps {
  isOpen: boolean;
  material: Material | null;
  onClose: () => void;
  onSuccess: (archived: Material) => void;
}

export const MaterialArchiveDialog: React.FC<MaterialArchiveDialogProps> = ({
  isOpen,
  material,
  onClose,
  onSuccess,
}) => {
  const [isArchiving, setIsArchiving] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !material) return null;

  const handleArchive = async () => {
    setIsArchiving(true);
    setError('');
    try {
      const updated = await materialApi.archiveMaterial(material.id);
      onSuccess(updated);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to archive material.');
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col text-xs">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Archive className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Archive Learning Material</h3>
              <p className="text-[11px] text-slate-500 font-mono">PUT /api/v1/materials/{material.id}/archive</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 text-rose-800 border border-rose-200">{error}</div>
          )}
          <p className="text-slate-700 font-semibold">{material.title}</p>
          <p className="text-slate-500 leading-relaxed text-[11px]">
            Archiving this material updates its status to <strong className="text-slate-700">ARCHIVED</strong>. It will be hidden from active student course packs while remaining retrievable by instructors and administrators.
          </p>
        </div>

        <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            disabled={isArchiving}
            className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-900"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleArchive}
            disabled={isArchiving}
            className="px-4 py-2 font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isArchiving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Archive className="w-3.5 h-3.5" />}
            <span>Confirm Archive</span>
          </button>
        </div>
      </div>
    </div>
  );
};

interface MaterialDeleteDialogProps {
  isOpen: boolean;
  material: Material | null;
  onClose: () => void;
  onSuccess: (deletedId: string) => void;
}

export const MaterialDeleteDialog: React.FC<MaterialDeleteDialogProps> = ({
  isOpen,
  material,
  onClose,
  onSuccess,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [confirmText, setConfirmText] = useState('');

  if (!isOpen || !material) return null;

  const isConfirmed = confirmText.trim().toLowerCase() === 'delete';

  const handleDelete = async () => {
    if (!isConfirmed) return;
    setIsDeleting(true);
    setError('');
    try {
      await materialApi.deleteMaterial(material.id);
      onSuccess(material.id);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to delete material.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col text-xs">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-rose-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Delete Material Resource</h3>
              <p className="text-[11px] text-slate-500 font-mono">DELETE /api/v1/materials/{material.id}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 text-rose-800 border border-rose-200">{error}</div>
          )}
          <p className="text-slate-700 font-semibold truncate">{material.title}</p>
          <p className="text-slate-500 leading-relaxed text-[11px]">
            This will permanently remove the material record from the Material Service database. This action is irreversible.
          </p>

          <div className="pt-2">
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Type <span className="font-mono font-bold text-rose-600">DELETE</span> to confirm:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              className="w-full px-3 py-1.5 text-xs font-mono border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-rose-500/20"
            />
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-900"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={!isConfirmed || isDeleting}
            className="px-4 py-2 font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isDeleting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            <span>Permanently Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};
