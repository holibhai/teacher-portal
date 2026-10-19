import React, { useState, useEffect, useCallback } from 'react';
import {
  FolderOpen,
  Plus,
  Upload,
  Grid,
  List,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { Material, MaterialFilterParams, SpringPage } from '../../features/materials/types';
import { materialApi } from '../../features/materials/api/materialApi';
import { MaterialFilters } from '../../features/materials/components/MaterialFilters';
import { MaterialListView } from '../../features/materials/components/MaterialListView';
import { MaterialUploadModal } from '../../features/materials/components/MaterialUploadModal';
import { MaterialEditModal } from '../../features/materials/components/MaterialEditModal';
import { MaterialDetailsModal } from '../../features/materials/components/MaterialDetailsModal';
import { MaterialPreviewModal } from '../../features/materials/components/MaterialPreviewModal';
import {
  MaterialArchiveDialog,
  MaterialDeleteDialog,
} from '../../features/materials/components/MaterialLifecycleDialogs';
import { mockCourses } from '../data/mockData';

export const MaterialLibraryView: React.FC = () => {
  // Course map for code and title lookup
  const coursesMap = mockCourses.reduce((acc, c) => {
    acc[c.id] = { code: c.code, title: c.title };
    return acc;
  }, {} as Record<string, { code: string; title: string }>);

  const authorizedCourses = mockCourses.map((c) => ({
    id: c.id,
    code: c.code,
    title: c.title,
  }));

  // Filter & Page state
  const [filters, setFilters] = useState<MaterialFilterParams>({
    page: 0,
    size: 10,
    sort: 'createdAt,desc',
  });

  const [pageData, setPageData] = useState<SpringPage<Material>>({
    content: [],
    totalElements: 0,
    totalPages: 0,
    size: 10,
    number: 0,
    first: true,
    last: true,
    numberOfElements: 0,
    empty: true,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [previewMaterial, setPreviewMaterial] = useState<Material | null>(null);
  const [detailsMaterial, setDetailsMaterial] = useState<Material | null>(null);
  const [editMaterial, setEditMaterial] = useState<Material | null>(null);
  const [archiveMaterial, setArchiveMaterial] = useState<Material | null>(null);
  const [deleteMaterial, setDeleteMaterial] = useState<Material | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadMaterials = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await materialApi.getMaterials(filters);
      setPageData(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch materials from Material Service.');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadMaterials();
  }, [loadMaterials]);

  const handleDownload = async (mat: Material) => {
    try {
      const res = await materialApi.getMaterialDownloadUrl(mat.id);
      if (res && res.downloadUrl) {
        window.open(res.downloadUrl, '_blank');
        showToast(`Download token issued for "${mat.originalFilename}"`);
      }
    } catch (err: any) {
      showToast(err.message || 'Unable to download file.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs flex items-center gap-2 border border-slate-700 animate-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Course Learning Materials
            </h1>
            <span className="text-[11px] font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 font-bold">
              Material Service Connected
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage, upload, preview, and organize learning resources for your assigned courses.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Grid / Table Mode Switch */}
          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-white shadow-2xs text-indigo-600' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Grid View"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-white shadow-2xs text-indigo-600' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsUploadOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Course Material</span>
          </button>
        </div>
      </div>

      {/* Query Filters */}
      <MaterialFilters
        filters={filters}
        onFilterChange={(updated) => setFilters(updated)}
        courses={authorizedCourses}
      />

      {/* Materials List & Server Pagination */}
      <MaterialListView
        pageData={pageData}
        isLoading={isLoading}
        viewMode={viewMode}
        onPageChange={(newPage) => setFilters((prev) => ({ ...prev, page: newPage }))}
        onSizeChange={(newSize) => setFilters((prev) => ({ ...prev, size: newSize, page: 0 }))}
        onPreview={(mat) => setPreviewMaterial(mat)}
        onDownload={handleDownload}
        onDetails={(mat) => setDetailsMaterial(mat)}
        onEdit={(mat) => setEditMaterial(mat)}
        onArchive={(mat) => setArchiveMaterial(mat)}
        onDelete={(mat) => setDeleteMaterial(mat)}
        canManage={true}
        coursesMap={coursesMap}
      />

      {/* Upload Modal (POST /api/v1/materials) */}
      <MaterialUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={(created) => {
          showToast(`Successfully uploaded "${created.title}"`);
          loadMaterials();
        }}
        authorizedCourses={authorizedCourses}
        defaultCourseId={authorizedCourses[0]?.id}
      />

      {/* Edit Modal (PUT /api/v1/materials/{id}) */}
      <MaterialEditModal
        isOpen={Boolean(editMaterial)}
        material={editMaterial}
        onClose={() => setEditMaterial(null)}
        onSuccess={(updated) => {
          showToast(`Updated metadata for "${updated.title}"`);
          loadMaterials();
        }}
      />

      {/* Details Modal (GET /api/v1/materials/{id}) */}
      <MaterialDetailsModal
        isOpen={Boolean(detailsMaterial)}
        material={detailsMaterial}
        onClose={() => setDetailsMaterial(null)}
        onOpenPreview={(mat) => setPreviewMaterial(mat)}
        onOpenEdit={(mat) => setEditMaterial(mat)}
        onOpenArchive={(mat) => setArchiveMaterial(mat)}
        onOpenDelete={(mat) => setDeleteMaterial(mat)}
        canEdit={true}
      />

      {/* Preview Modal (GET /api/v1/materials/{id}/download) */}
      <MaterialPreviewModal
        isOpen={Boolean(previewMaterial)}
        material={previewMaterial}
        onClose={() => setPreviewMaterial(null)}
        onOpenDetails={(mat) => setDetailsMaterial(mat)}
      />

      {/* Archive Dialog (PUT /api/v1/materials/{id}/archive) */}
      <MaterialArchiveDialog
        isOpen={Boolean(archiveMaterial)}
        material={archiveMaterial}
        onClose={() => setArchiveMaterial(null)}
        onSuccess={(archived) => {
          showToast(`Archived "${archived.title}"`);
          loadMaterials();
        }}
      />

      {/* Delete Dialog (DELETE /api/v1/materials/{id}) */}
      <MaterialDeleteDialog
        isOpen={Boolean(deleteMaterial)}
        material={deleteMaterial}
        onClose={() => setDeleteMaterial(null)}
        onSuccess={() => {
          showToast('Material permanently deleted.');
          loadMaterials();
        }}
      />
    </div>
  );
};
