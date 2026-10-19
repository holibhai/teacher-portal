import React, { useState, useEffect, useCallback } from 'react';
import {
  BookOpen,
  Upload,
  Lock,
  Grid,
  List,
  CheckCircle2,
  FileCheck,
  ShieldCheck,
} from 'lucide-react';
import { Material, MaterialFilterParams, SpringPage } from '../../features/materials/types';
import { materialApi } from '../../features/materials/api/materialApi';
import { MaterialFilters } from '../../features/materials/components/MaterialFilters';
import { MaterialListView } from '../../features/materials/components/MaterialListView';
import { MaterialUploadModal } from '../../features/materials/components/MaterialUploadModal';
import { MaterialDetailsModal } from '../../features/materials/components/MaterialDetailsModal';
import { MaterialPreviewModal } from '../../features/materials/components/MaterialPreviewModal';
import { mockCourses } from '../../teacher/data/mockData';

export const StudentMaterialsView: React.FC = () => {
  // Current Student: Maya Lin (stu-001) enrolled in CS-201, CS-350, CS-420
  const currentStudentId = 'stu-001';

  // Only enrolled courses
  const enrolledCourses = mockCourses
    .filter((c) => ['c1', 'c2', 'c3'].includes(c.id))
    .map((c) => ({
      id: c.id,
      code: c.code,
      title: c.title,
    }));

  const coursesMap = mockCourses.reduce((acc, c) => {
    acc[c.id] = { code: c.code, title: c.title };
    return acc;
  }, {} as Record<string, { code: string; title: string }>);

  const [activeSection, setActiveSection] = useState<'course-materials' | 'my-submissions'>('course-materials');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const [filters, setFilters] = useState<MaterialFilterParams>({
    page: 0,
    size: 10,
    sort: 'createdAt,desc',
    status: 'AVAILABLE', // Students only see available materials
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
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [previewMaterial, setPreviewMaterial] = useState<Material | null>(null);
  const [detailsMaterial, setDetailsMaterial] = useState<Material | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadMaterials = useCallback(async () => {
    setIsLoading(true);
    try {
      const queryParams: MaterialFilterParams = {
        ...filters,
        status: 'AVAILABLE',
      };

      if (activeSection === 'my-submissions') {
        queryParams.purpose = 'SUBMISSION_ATTACHMENT';
        queryParams.uploadedBy = currentStudentId;
      } else {
        // General course materials
        if (!queryParams.purpose) {
          // If no specific purpose chosen, exclude other private submission attachments
        }
      }

      const raw = await materialApi.getMaterials(queryParams);

      // Student security enforcement:
      // Filter out submission attachments of other students
      const studentSafeContent = raw.content.filter((m) => {
        if (activeSection === 'course-materials') {
          return m.purpose !== 'SUBMISSION_ATTACHMENT';
        }
        return m.purpose === 'SUBMISSION_ATTACHMENT' && m.uploadedBy === currentStudentId;
      });

      setPageData({
        ...raw,
        content: studentSafeContent,
        totalElements: studentSafeContent.length,
        empty: studentSafeContent.length === 0,
      });
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch materials.');
    } finally {
      setIsLoading(false);
    }
  }, [filters, activeSection]);

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
              My Learning Materials & Course Packs
            </h1>
            <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Student Enrolled
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Browse lecture decks, lab manuals, and authorized course resources for your enrolled classes.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
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
            onClick={() => setIsSubmitModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Submission Attachment</span>
          </button>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs">
        <button
          type="button"
          onClick={() => {
            setActiveSection('course-materials');
            setFilters((prev) => ({ ...prev, page: 0, purpose: undefined }));
          }}
          className={`py-3 px-4 font-semibold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
            activeSection === 'course-materials'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Course Learning Packs</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveSection('my-submissions');
            setFilters((prev) => ({ ...prev, page: 0, purpose: 'SUBMISSION_ATTACHMENT' }));
          }}
          className={`py-3 px-4 font-semibold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
            activeSection === 'my-submissions'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Lock className="w-4 h-4 text-emerald-600" />
          <span>My Private Submission Attachments</span>
        </button>
      </div>

      {activeSection === 'my-submissions' && (
        <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            FERPA Student Privacy Enforcement: Only your own submission attachments ({currentStudentId}) are visible. Submissions from other students are strictly isolated.
          </span>
        </div>
      )}

      {/* Filters */}
      <MaterialFilters
        filters={filters}
        onFilterChange={(updated) => setFilters(updated)}
        courses={enrolledCourses}
      />

      {/* List with SpringPage pagination */}
      <MaterialListView
        pageData={pageData}
        isLoading={isLoading}
        viewMode={viewMode}
        onPageChange={(newPage) => setFilters((prev) => ({ ...prev, page: newPage }))}
        onSizeChange={(newSize) => setFilters((prev) => ({ ...prev, size: newSize, page: 0 }))}
        onPreview={(mat) => setPreviewMaterial(mat)}
        onDownload={handleDownload}
        onDetails={(mat) => setDetailsMaterial(mat)}
        canManage={false} // Students CANNOT edit, archive, or delete
        coursesMap={coursesMap}
      />

      {/* Student Submission Upload Modal (SUBMISSION_ATTACHMENT only) */}
      <MaterialUploadModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSuccess={(created) => {
          showToast(`Submitted attachment "${created.title}" successfully.`);
          setActiveSection('my-submissions');
          loadMaterials();
        }}
        authorizedCourses={enrolledCourses}
        defaultPurpose="SUBMISSION_ATTACHMENT"
        allowedPurposes={['SUBMISSION_ATTACHMENT']}
      />

      {/* Details Modal (Student read-only) */}
      <MaterialDetailsModal
        isOpen={Boolean(detailsMaterial)}
        material={detailsMaterial}
        onClose={() => setDetailsMaterial(null)}
        onOpenPreview={(mat) => setPreviewMaterial(mat)}
        canEdit={false} // Student read-only
      />

      {/* Preview Modal */}
      <MaterialPreviewModal
        isOpen={Boolean(previewMaterial)}
        material={previewMaterial}
        onClose={() => setPreviewMaterial(null)}
        onOpenDetails={(mat) => setDetailsMaterial(mat)}
      />
    </div>
  );
};
