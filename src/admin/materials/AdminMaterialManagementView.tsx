import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  Upload,
  Grid,
  List,
  CheckCircle2,
  FileText,
  Layers,
  Database,
  Archive,
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
import { mockCourses } from '../../teacher/data/mockData';
import { formatBytes } from '../../features/materials/constants';

export const AdminMaterialManagementView: React.FC = () => {
  const coursesMap = mockCourses.reduce((acc, c) => {
    acc[c.id] = { code: c.code, title: c.title };
    return acc;
  }, {} as Record<string, { code: string; title: string }>);

  const authorizedCourses = mockCourses.map((c) => ({
    id: c.id,
    code: c.code,
    title: c.title,
  }));

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
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
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
      showToast(err.message || 'Failed to fetch materials.');
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

  // Metrics derived purely from backend page data
  const totalStorageSize = pageData.content.reduce((sum, m) => sum + m.fileSize, 0);
  const availableCount = pageData.content.filter((m) => m.status === 'AVAILABLE').length;
  const archivedCount = pageData.content.filter((m) => m.status === 'ARCHIVED').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Toast */}
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
              Institution Material Administration
            </h1>
            <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
              <Shield className="w-3 h-3" /> Admin Super-User
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Audit, inspect, regulate, and manage learning material entities across all institutional courses.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50 p-0.5">
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
          </div>

          <button
            type="button"
            onClick={() => setIsUploadOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Admin Upload Material</span>
          </button>
        </div>
      </div>

      {/* Metrics Strip Derived Strictly from Backend Data */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-slate-400 text-[11px] font-medium block">Total Materials</span>
          <span className="text-lg font-bold font-mono text-slate-900 mt-1 block">
            {pageData.totalElements}
          </span>
          <span className="text-[10px] text-slate-400">Recorded in Material Service</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-slate-400 text-[11px] font-medium block">Active (Available)</span>
          <span className="text-lg font-bold font-mono text-emerald-600 mt-1 block">
            {availableCount}
          </span>
          <span className="text-[10px] text-slate-400">Accessible by enrolled students</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-slate-400 text-[11px] font-medium block">Archived</span>
          <span className="text-lg font-bold font-mono text-slate-600 mt-1 block">
            {archivedCount}
          </span>
          <span className="text-[10px] text-slate-400">Preserved in read-only state</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-slate-400 text-[11px] font-medium block">Page File Size Sum</span>
          <span className="text-lg font-bold font-mono text-indigo-600 mt-1 block">
            {formatBytes(totalStorageSize)}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">Calculated from byte sizes</span>
        </div>
      </div>

      {/* Query Filters */}
      <MaterialFilters
        filters={filters}
        onFilterChange={(updated) => setFilters(updated)}
        courses={authorizedCourses}
      />

      {/* List with Server-Side Pagination */}
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

      {/* Modals */}
      <MaterialUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={(created) => {
          showToast(`Admin successfully uploaded "${created.title}"`);
          loadMaterials();
        }}
        authorizedCourses={authorizedCourses}
      />

      <MaterialEditModal
        isOpen={Boolean(editMaterial)}
        material={editMaterial}
        onClose={() => setEditMaterial(null)}
        onSuccess={(updated) => {
          showToast(`Updated metadata for "${updated.title}"`);
          loadMaterials();
        }}
      />

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

      <MaterialPreviewModal
        isOpen={Boolean(previewMaterial)}
        material={previewMaterial}
        onClose={() => setPreviewMaterial(null)}
        onOpenDetails={(mat) => setDetailsMaterial(mat)}
      />

      <MaterialArchiveDialog
        isOpen={Boolean(archiveMaterial)}
        material={archiveMaterial}
        onClose={() => setArchiveMaterial(null)}
        onSuccess={(archived) => {
          showToast(`Archived "${archived.title}"`);
          loadMaterials();
        }}
      />

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
