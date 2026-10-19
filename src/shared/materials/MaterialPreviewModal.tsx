import React, { useState } from 'react';
import {
  X,
  Download,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  FileText,
  FileCode,
  Video,
  Sparkles,
  Copy,
  Check,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Share2,
  Shield,
  Clock,
  Layers,
  Search,
} from 'lucide-react';
import { MaterialItem } from './types';

interface MaterialPreviewModalProps {
  isOpen: boolean;
  material: MaterialItem | null;
  onClose: () => void;
  onOpenAIAnalysis?: (material: MaterialItem) => void;
  onDownload?: (material: MaterialItem) => void;
}

export const MaterialPreviewModal: React.FC<MaterialPreviewModalProps> = ({
  isOpen,
  material,
  onClose,
  onOpenAIAnalysis,
  onDownload,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const totalPages = 14;
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [videoSpeed, setVideoSpeed] = useState<string>('1.0x');
  const [copiedCode, setCopiedCode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMetadataDrawer, setShowMetadataDrawer] = useState(true);

  if (!isOpen || !material) return null;

  const handleCopyCode = () => {
    if (material.samplePreviewContent) {
      navigator.clipboard.writeText(material.samplePreviewContent);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-6xl h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Modal Top Bar */}
        <div className="h-14 px-4 sm:px-6 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 shrink-0">
              {material.courseCode}
            </span>
            <h3 className="text-sm font-bold text-slate-900 truncate" title={material.title}>
              {material.title}
            </h3>
            <span className="hidden sm:inline-block text-[11px] font-mono text-slate-400">
              ({material.fileSizeFormatted})
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onOpenAIAnalysis && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAIAnalysis(material);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Mentify AI Document Studio</span>
                <span className="sm:hidden">AI Study</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onDownload ? onDownload(material) : alert(`Downloading ${material.fileName}...`)}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Presigned S3 Download</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Body: Document Viewer + Collapsible Metadata Inspector */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Viewer Canvas */}
          <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden relative">
            {/* Viewer Controls Toolbar */}
            <div className="h-10 px-4 bg-slate-800 text-slate-300 flex items-center justify-between text-xs border-b border-slate-700 select-none shrink-0">
              <div className="flex items-center gap-3">
                {material.fileType === 'PDF' && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="p-1 rounded hover:bg-slate-700 disabled:opacity-40"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="font-mono text-[11px]">
                      Page {currentPage} / {totalPages}
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
                )}

                {(material.fileType === 'CODE' || material.fileType === 'ZIP') && (
                  <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                    <FileCode className="w-3.5 h-3.5" /> Source Code Workspace Preview
                  </span>
                )}

                {material.fileType === 'VIDEO' && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsPlayingVideo(!isPlayingVideo)}
                      className="px-2 py-0.5 bg-indigo-600 text-white rounded hover:bg-indigo-500 font-semibold"
                    >
                      {isPlayingVideo ? 'Pause' : 'Play'}
                    </button>
                    <span className="text-[11px] font-mono">1080p Full HD · S3 Streaming</span>
                  </div>
                )}
              </div>

              {/* Zoom & Display Controls */}
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
                <button
                  type="button"
                  onClick={() => setShowMetadataDrawer(!showMetadataDrawer)}
                  className="ml-2 px-2 py-0.5 text-[11px] bg-slate-700 hover:bg-slate-600 rounded text-slate-200 transition-colors"
                >
                  {showMetadataDrawer ? 'Hide Details' : 'Show Details'}
                </button>
              </div>
            </div>

            {/* Content Rendering Canvas */}
            <div className="flex-1 overflow-auto p-4 sm:p-8 flex items-center justify-center">
              {/* PDF Preview Mode */}
              {material.fileType === 'PDF' && (
                <div
                  style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                  className="bg-white text-slate-900 rounded-lg shadow-2xl p-8 sm:p-12 w-full max-w-2xl min-h-[600px] transition-transform duration-150 space-y-6"
                >
                  <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 block">
                        Mentify Academic Document Repository
                      </span>
                      <h2 className="text-lg font-bold text-slate-900 mt-0.5">{material.title}</h2>
                    </div>
                    <span className="text-xs font-mono text-slate-400">Page {currentPage} of {totalPages}</span>
                  </div>

                  <div className="prose prose-sm max-w-none text-slate-700 space-y-4 text-xs sm:text-sm leading-relaxed">
                    <p className="font-semibold text-slate-900">
                      Module Section: {material.moduleTitle || 'General Curriculum Reference'}
                    </p>
                    <p>
                      {material.description}
                    </p>

                    {/* Sample Structured Document Graphics Simulation */}
                    <div className="my-6 p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 border-b border-slate-200 pb-2">
                        <span>Figure {currentPage}.1 — Algorithmic Invariants & Proof</span>
                        <span>Complexity: O(log n)</span>
                      </div>
                      <div className="p-3 bg-white rounded border border-slate-200/80">
                        <code>
                          {material.samplePreviewContent || `// Invariant Definition\nBalanceFactor(N) = Height(N.Left) - Height(N.Right)\nif (BF > 1 && Key < N.Left.Key) return rotateRight(N);`}
                        </code>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                        Key Invariants & Theorems
                      </h4>
                      <ul className="list-disc pl-5 space-y-1 text-slate-600">
                        {material.aiKeyConcepts?.map((c, i) => (
                          <li key={i}>{c}</li>
                        )) || (
                          <>
                            <li>Strict mathematical boundary validation across all edge nodes.</li>
                            <li>Amortized time bounds verified by aggregate potential method.</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Code or ZIP Preview Mode */}
              {(material.fileType === 'CODE' || material.fileType === 'ZIP') && (
                <div
                  style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                  className="bg-slate-950 text-slate-100 rounded-xl shadow-2xl border border-slate-800 w-full max-w-3xl overflow-hidden font-mono text-xs"
                >
                  <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      </div>
                      <span className="text-slate-400 text-[11px] ml-2">{material.fileName}</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition-colors text-[11px]"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                    </button>
                  </div>

                  <div className="p-4 overflow-x-auto text-[11px] leading-relaxed select-text">
                    <pre className="text-slate-300">
                      <code>{material.samplePreviewContent || `// Source File: ${material.fileName}\npackage edu.mentify.sample;\n\npublic class Solution {\n    public static void main(String[] args) {\n        System.out.println("Mentify Cloud S3 Storage Pipeline");\n    }\n}`}</code>
                    </pre>
                  </div>
                </div>
              )}

              {/* Video Preview Mode */}
              {material.fileType === 'VIDEO' && (
                <div className="w-full max-w-3xl bg-black rounded-xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col">
                  <div className="relative aspect-video bg-slate-950 flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                    
                    <button
                      type="button"
                      onClick={() => setIsPlayingVideo(!isPlayingVideo)}
                      className="w-16 h-16 rounded-full bg-indigo-600/90 text-white flex items-center justify-center hover:bg-indigo-600 hover:scale-105 transition-all shadow-xl z-10"
                    >
                      {isPlayingVideo ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
                    </button>

                    <div className="absolute bottom-4 left-4 right-4 text-white z-10 space-y-2">
                      <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden cursor-pointer">
                        <div className="w-1/3 h-full bg-indigo-500 rounded-full" />
                      </div>
                      <div className="flex items-center justify-between text-xs text-white/80">
                        <div className="flex items-center gap-2">
                          <span>17:42 / 52:14</span>
                          <span>·</span>
                          <span>H.264 High Profile</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setVideoSpeed((s) => (s === '1.0x' ? '1.5x' : s === '1.5x' ? '2.0x' : '1.0x'))}
                            className="px-1.5 py-0.5 bg-white/10 rounded font-mono hover:bg-white/20"
                          >
                            {videoSpeed}
                          </button>
                          <Volume2 className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* DOCX or Slides Preview Mode */}
              {(material.fileType === 'DOCX' || material.fileType === 'SLIDES') && (
                <div
                  style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                  className="bg-white text-slate-900 rounded-lg shadow-2xl p-8 sm:p-12 w-full max-w-2xl min-h-[500px] transition-transform space-y-5"
                >
                  <div className="border-b border-slate-200 pb-4">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase">Office Open XML Document Reader</span>
                    <h2 className="text-lg font-bold text-slate-900 mt-1">{material.title}</h2>
                    <p className="text-xs text-slate-500 mt-0.5">{material.description}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs whitespace-pre-wrap leading-relaxed text-slate-800">
                    {material.samplePreviewContent || 'Standard document specification content extracted via Mentify DOCX ingestion pipeline.'}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Collapsible Metadata Drawer */}
          {showMetadataDrawer && (
            <div className="w-80 border-l border-slate-200 bg-white p-5 overflow-y-auto space-y-5 shrink-0 text-xs">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block">
                  Material Details
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-1">{material.fileName}</h4>
                <p className="text-slate-500 mt-1 leading-relaxed">{material.description}</p>
              </div>

              {/* S3 Storage Specifications */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                  AWS S3 Storage Specs
                </span>
                <div className="space-y-1.5 font-mono text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Bucket</span>
                    <span className="text-slate-800 font-semibold truncate block">{material.s3Bucket}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Object Key</span>
                    <span className="text-slate-700 text-[10px] break-all block">{material.s3Key}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">ETag Checksum</span>
                    <span className="text-slate-600 text-[10px]">{material.eTag}</span>
                  </div>
                </div>
              </div>

              {/* Access Audit */}
              <div className="space-y-2">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Audit & Engagement
                </span>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 text-[10px] block">Downloads</span>
                    <span className="text-sm font-bold text-slate-900 font-mono">{material.downloadsCount}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 text-[10px] block">Views</span>
                    <span className="text-sm font-bold text-slate-900 font-mono">{material.viewsCount}</span>
                  </div>
                </div>
              </div>

              {/* Uploader Info */}
              <div className="pt-2 border-t border-slate-100 space-y-1">
                <span className="text-[10px] text-slate-400">Uploaded by:</span>
                <p className="font-semibold text-slate-800">{material.uploaderName} ({material.uploadedByRole})</p>
                <p className="text-[10px] text-slate-400 font-mono">
                  {new Date(material.uploadedAt).toLocaleString()}
                </p>
              </div>

              {/* Tags */}
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Metadata Tags
                </span>
                <div className="flex flex-wrap gap-1">
                  {material.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
