import React from 'react';
import {
  Eye,
  Download,
  Edit2,
  Archive,
  Trash2,
  FolderOpen,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Info,
} from 'lucide-react';
import { Material, SpringPage } from '../types';
import {
  MATERIAL_TYPE_ICONS,
  MATERIAL_TYPE_LABELS,
  MATERIAL_PURPOSE_LABELS,
  formatBytes,
} from '../constants';
import { MaterialStatusBadge } from './MaterialStatusBadge';

interface MaterialListViewProps {
  pageData: SpringPage<Material>;
  isLoading: boolean;
  viewMode: 'grid' | 'table';
  onPageChange: (newPage: number) => void;
  onSizeChange: (newSize: number) => void;
  onPreview: (material: Material) => void;
  onDownload: (material: Material) => void;
  onDetails: (material: Material) => void;
  onEdit?: (material: Material) => void;
  onArchive?: (material: Material) => void;
  onDelete?: (material: Material) => void;
  canManage?: boolean;
  coursesMap?: Record<string, { code: string; title: string }>;
}

export const MaterialListView: React.FC<MaterialListViewProps> = ({
  pageData,
  isLoading,
  viewMode,
  onPageChange,
  onSizeChange,
  onPreview,
  onDownload,
  onDetails,
  onEdit,
  onArchive,
  onDelete,
  canManage = false,
  coursesMap = {},
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Loading Skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 animate-pulse"
            >
              <div className="flex justify-between items-center">
                <div className="h-4 w-16 bg-slate-200 rounded" />
                <div className="h-4 w-20 bg-slate-200 rounded" />
              </div>
              <div className="h-5 w-3/4 bg-slate-200 rounded" />
              <div className="h-3 w-full bg-slate-100 rounded" />
              <div className="h-8 w-full bg-slate-50 rounded pt-2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (pageData.empty || pageData.content.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto">
          <FolderOpen className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-800">No Learning Materials Found</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          No records match the active query filters on the Material Service.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pageData.content.map((mat) => {
            const TypeIcon = MATERIAL_TYPE_ICONS[mat.type] || FolderOpen;
            const courseInfo = mat.courseId ? coursesMap[mat.courseId] : null;

            return (
              <div
                key={mat.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {courseInfo && (
                        <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 shrink-0">
                          {courseInfo.code}
                        </span>
                      )}
                      <span className="text-[11px] font-mono text-slate-400 uppercase font-medium truncate">
                        {mat.type}
                      </span>
                    </div>
                    <MaterialStatusBadge status={mat.status} size="sm" />
                  </div>

                  {/* Icon + Title */}
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                      <TypeIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4
                        onClick={() => onPreview(mat)}
                        className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 hover:text-indigo-600 transition-colors cursor-pointer"
                        title={mat.title}
                      >
                        {mat.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
                        {mat.originalFilename}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  {mat.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {mat.description}
                    </p>
                  )}

                  {/* Purpose Tag */}
                  <div className="pt-1">
                    <span className="text-[10px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded border border-slate-100 font-medium">
                      {MATERIAL_PURPOSE_LABELS[mat.purpose] || mat.purpose}
                    </span>
                  </div>
                </div>

                {/* Bottom Meta & Action Bar */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>{formatBytes(mat.fileSize)}</span>
                    <span>{new Date(mat.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center justify-between gap-1 pt-1">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onPreview(mat)}
                        className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 border border-slate-200 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onDownload(mat)}
                        disabled={mat.status !== 'AVAILABLE'}
                        className="p-1 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer disabled:opacity-40"
                        title="Authorized Download"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onDetails(mat)}
                        className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-lg cursor-pointer"
                        title="Details"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>

                      {canManage && onEdit && (
                        <button
                          type="button"
                          onClick={() => onEdit(mat)}
                          className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-lg cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {canManage && onArchive && mat.status !== 'ARCHIVED' && (
                        <button
                          type="button"
                          onClick={() => onArchive(mat)}
                          className="p-1 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg cursor-pointer"
                          title="Archive"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {canManage && onDelete && (
                        <button
                          type="button"
                          onClick={() => onDelete(mat)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Title & Original File</th>
                  <th className="py-3 px-4">Course</th>
                  <th className="py-3 px-4">Purpose</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pageData.content.map((mat) => {
                  const TypeIcon = MATERIAL_TYPE_ICONS[mat.type] || FolderOpen;
                  const courseInfo = mat.courseId ? coursesMap[mat.courseId] : null;

                  return (
                    <tr key={mat.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 max-w-xs sm:max-w-md">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 text-indigo-600 flex items-center justify-center shrink-0">
                            <TypeIcon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p
                              onClick={() => onPreview(mat)}
                              className="font-semibold text-slate-900 truncate hover:text-indigo-600 cursor-pointer"
                            >
                              {mat.title}
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono truncate">
                              {mat.originalFilename}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                        {courseInfo ? courseInfo.code : mat.courseId || '—'}
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        <span className="text-[11px]">
                          {MATERIAL_PURPOSE_LABELS[mat.purpose] || mat.purpose}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-500">
                        {formatBytes(mat.fileSize)}
                      </td>

                      <td className="py-3 px-4">
                        <MaterialStatusBadge status={mat.status} size="sm" />
                      </td>

                      <td className="py-3 px-4 text-slate-500 text-[11px] font-mono">
                        {new Date(mat.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => onPreview(mat)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
                            title="Preview"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDownload(mat)}
                            disabled={mat.status !== 'AVAILABLE'}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg cursor-pointer disabled:opacity-40"
                            title="Download"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDetails(mat)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
                            title="Details"
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>
                          {canManage && onEdit && (
                            <button
                              type="button"
                              onClick={() => onEdit(mat)}
                              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {canManage && onArchive && mat.status !== 'ARCHIVED' && (
                            <button
                              type="button"
                              onClick={() => onArchive(mat)}
                              className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg cursor-pointer"
                              title="Archive"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {canManage && onDelete && (
                            <button
                              type="button"
                              onClick={() => onDelete(mat)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Spring Data Page Server-Side Pagination Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="text-slate-500 font-mono">
          Showing{' '}
          <strong className="text-slate-800">
            {pageData.number * pageData.size + 1}
          </strong>{' '}
          to{' '}
          <strong className="text-slate-800">
            {Math.min((pageData.number + 1) * pageData.size, pageData.totalElements)}
          </strong>{' '}
          of <strong className="text-slate-800">{pageData.totalElements}</strong> materials
        </div>

        <div className="flex items-center gap-3">
          {/* Page Size Selector */}
          <div className="flex items-center gap-1.5 text-slate-500">
            <span>Per page:</span>
            <select
              value={pageData.size}
              onChange={(e) => onSizeChange(Number(e.target.value))}
              className="px-2 py-1 text-xs border border-slate-200 rounded-md bg-white text-slate-700 font-mono"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          {/* Stepper Buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={pageData.first || pageData.number <= 0}
              onClick={() => onPageChange(pageData.number - 1)}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 transition-colors"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-2 font-mono text-slate-700 font-semibold">
              Page {pageData.number + 1} of {pageData.totalPages}
            </span>

            <button
              type="button"
              disabled={pageData.last || pageData.number >= pageData.totalPages - 1}
              onClick={() => onPageChange(pageData.number + 1)}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 transition-colors"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
