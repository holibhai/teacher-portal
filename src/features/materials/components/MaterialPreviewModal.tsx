import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  FileText,
  FileCode,
  Image as ImageIcon,
  Video,
  Music,
  ExternalLink,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Material, MaterialDownloadResponse } from '../types';
import { MATERIAL_TYPE_LABELS, formatBytes } from '../constants';
import { materialApi } from '../api/materialApi';

interface MaterialPreviewModalProps {
  isOpen: boolean;
  material: Material | null;
  onClose: () => void;
  onOpenDetails?: (material: Material) => void;
}

export const MaterialPreviewModal: React.FC<MaterialPreviewModalProps> = ({
  isOpen,
  material,
  onClose,
  onOpenDetails,
}) => {
  const [downloadData, setDownloadData] = useState<MaterialDownloadResponse | null>(null);
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [urlError, setUrlError] = useState('');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 8;

  // Fetch or refresh download URL
  const fetchFreshDownloadUrl = async (id: string) => {
    setIsLoadingUrl(true);
    setUrlError('');
    try {
      const data = await materialApi.getMaterialDownloadUrl(id);
      setDownloadData(data);
    } catch (err: any) {
      setUrlError(err.message || 'Failed to obtain fresh authorized preview token.');
    } finally {
      setIsLoadingUrl(false);
    }
  };

  useEffect(() => {
    if (isOpen && material) {
      setCurrentPage(1);
      setZoomLevel(100);
      fetchFreshDownloadUrl(material.id);
    } else {
      setDownloadData(null);
    }
  }, [isOpen, material?.id]);

  if (!isOpen || !material) return null;

  const isExpired = downloadData
    ? new Date(downloadData.expiresAt).getTime() <= Date.now()
    : false;

  const handleDownload = () => {
    if (isExpired) {
      fetchFreshDownloadUrl(material.id);
    } else if (downloadData?.downloadUrl) {
      window.open(downloadData.downloadUrl, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-5xl h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Top Bar */}
        <div className="h-14 px-4 sm:px-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 shrink-0">
              {material.type}
            </span>
            <h3 className="text-sm font-bold text-slate-900 truncate" title={material.title}>
              {material.title}
            </h3>
            <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
              ({formatBytes(material.fileSize)})
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onOpenDetails && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenDetails(material);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                Metadata Details
              </button>
            )}

            <button
              type="button"
              onClick={handleDownload}
              disabled={isLoadingUrl || material.status !== 'AVAILABLE'}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isLoadingUrl ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">
                {isExpired ? 'Refresh Token' : 'Authorized Download'}
              </span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status & Expiry Banner */}
        <div className="px-4 py-2 bg-slate-900 text-slate-300 text-xs flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-slate-400 font-mono text-[11px]">
              Original File: <strong className="text-slate-200">{material.originalFilename}</strong>
            </span>
            {material.status !== 'AVAILABLE' && (
              <span className="text-amber-400 flex items-center gap-1 text-[11px] font-semibold">
                <Clock className="w-3.5 h-3.5" /> Processing Material... Preview might be restricted.
              </span>
            )}
          </div>

          {downloadData && (
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
              <Clock className="w-3 h-3 text-emerald-400" />
              <span>
                Token valid until: {new Date(downloadData.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}
        </div>

        {/* Viewer Controls Toolbar (for PDF / Document zoom) */}
        {material.type === 'PDF' && (
          <div className="h-10 px-4 bg-slate-800 text-slate-300 flex items-center justify-between text-xs border-b border-slate-700 shrink-0 select-none">
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1 rounded hover:bg-slate-700 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-mono text-[11px]">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1 rounded hover:bg-slate-700 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(50, z - 25))}
                className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[11px] w-12 text-center">{zoomLevel}%</span>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(200, z + 25))}
                className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Canvas Area */}
        <div className="flex-1 bg-slate-900 overflow-auto p-4 sm:p-8 flex items-center justify-center">
          {urlError ? (
            <div className="p-6 bg-slate-800 text-slate-200 rounded-xl border border-slate-700 text-center space-y-3 max-w-md">
              <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
              <p className="text-xs text-rose-400 font-semibold">{urlError}</p>
              <button
                type="button"
                onClick={() => fetchFreshDownloadUrl(material.id)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
              >
                Retry Token Request
              </button>
            </div>
          ) : material.type === 'PDF' ? (
            /* PDF Document Canvas */
            <div
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
              className="bg-white text-slate-900 rounded-xl shadow-2xl p-8 sm:p-12 w-full max-w-2xl min-h-[600px] transition-transform duration-150 space-y-6"
            >
              <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 block">
                    Mentify Educational Material Viewer
                  </span>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-1">{material.title}</h2>
                </div>
                <span className="text-xs font-mono text-slate-400">Page {currentPage} of {totalPages}</span>
              </div>

              <div className="prose prose-sm max-w-none text-slate-700 text-xs sm:text-sm leading-relaxed space-y-4">
                <p>{material.description || 'Verified course curriculum document stream.'}</p>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800 space-y-2">
                  <div className="text-[11px] text-slate-400 border-b border-slate-200 pb-1">
                    Section {currentPage}.0 — Document Content Stream
                  </div>
                  <p className="leading-relaxed">
                    Binary stream authenticated via Keycloak federated session. Content-Type: {material.contentType}.
                  </p>
                </div>
              </div>
            </div>
          ) : material.type === 'VIDEO' ? (
            /* Video Media Player */
            <div className="w-full max-w-3xl bg-black rounded-xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col">
              <div className="relative aspect-video bg-slate-950 flex items-center justify-center">
                <Video className="w-16 h-16 text-indigo-500 opacity-80" />
                <div className="absolute bottom-4 left-4 right-4 text-white text-xs bg-black/60 p-3 rounded-lg backdrop-blur-xs flex items-center justify-between font-mono">
                  <span>{material.originalFilename}</span>
                  <span>{formatBytes(material.fileSize)}</span>
                </div>
              </div>
            </div>
          ) : material.type === 'AUDIO' ? (
            /* Audio Player */
            <div className="w-full max-w-md bg-white rounded-xl p-6 shadow-2xl border border-slate-200 space-y-4 text-center">
              <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <Music className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{material.title}</h4>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{material.originalFilename}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 font-mono">
                Duration & stream ready via Material Service download endpoint
              </div>
            </div>
          ) : material.type === 'ARCHIVE' ? (
            /* Code / Archive Inspector */
            <div className="w-full max-w-2xl bg-slate-950 text-slate-100 rounded-xl shadow-2xl border border-slate-800 p-6 space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-indigo-400 font-bold">Archive Package Inspector</span>
                <span className="text-slate-500">{formatBytes(material.fileSize)}</span>
              </div>
              <div className="space-y-1 text-slate-300">
                <p className="text-emerald-400 font-bold">{material.originalFilename}</p>
                <p className="text-slate-500 text-[11px]">Checksum: {material.checksum || 'N/A'}</p>
                <div className="pt-2 text-slate-400 text-[11px] leading-relaxed">
                  {material.description || 'Source code archive. Ready for authorized download and extraction.'}
                </div>
              </div>
            </div>
          ) : (
            /* Default Document Viewer */
            <div className="bg-white text-slate-900 rounded-xl shadow-2xl p-8 w-full max-w-xl text-center space-y-4">
              <FileText className="w-12 h-12 text-indigo-500 mx-auto" />
              <h3 className="font-bold text-slate-900 text-base">{material.title}</h3>
              <p className="text-xs text-slate-500 font-mono">{material.originalFilename}</p>
              <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
                {material.description || 'This document can be opened and downloaded using your authenticated institutional credentials.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
