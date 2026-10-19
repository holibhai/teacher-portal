import React from 'react';
import { Search, Filter, RotateCcw, ArrowUpDown } from 'lucide-react';
import { MaterialFilterParams, MaterialPurpose, MaterialStatus, MaterialType } from '../types';
import { MATERIAL_PURPOSE_LABELS, MATERIAL_TYPE_LABELS } from '../constants';

interface CourseOption {
  id: string;
  code: string;
  title: string;
}

interface MaterialFiltersProps {
  filters: MaterialFilterParams;
  onFilterChange: (updated: MaterialFilterParams) => void;
  courses: CourseOption[];
  hideCourseFilter?: boolean;
}

export const MaterialFilters: React.FC<MaterialFiltersProps> = ({
  filters,
  onFilterChange,
  courses,
  hideCourseFilter = false,
}) => {
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      search: e.target.value,
      page: 0, // Reset to first page when filtering
    });
  };

  const handleSelectChange = (key: keyof MaterialFilterParams, value: string) => {
    onFilterChange({
      ...filters,
      [key]: value === 'ALL' ? undefined : value,
      page: 0,
    });
  };

  const handleReset = () => {
    onFilterChange({
      page: 0,
      size: filters.size || 10,
      sort: 'createdAt,desc',
    });
  };

  const hasActiveFilters = Boolean(
    filters.search ||
      filters.type ||
      filters.purpose ||
      filters.status ||
      filters.courseId ||
      filters.createdFrom ||
      filters.createdTo
  );

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3 text-xs">
      {/* Top Search & Primary Selectors */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, original filename..."
            value={filters.search || ''}
            onChange={handleTextChange}
            className="w-full pl-9 pr-3 py-2 text-xs text-slate-900 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {!hideCourseFilter && (
            <select
              value={filters.courseId || 'ALL'}
              onChange={(e) => handleSelectChange('courseId', e.target.value)}
              className="px-2.5 py-1.5 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-hidden font-medium"
            >
              <option value="ALL">All Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code}
                </option>
              ))}
            </select>
          )}

          {/* Type Filter */}
          <select
            value={filters.type || 'ALL'}
            onChange={(e) => handleSelectChange('type', e.target.value)}
            className="px-2.5 py-1.5 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-hidden font-medium"
          >
            <option value="ALL">All Types</option>
            {(Object.keys(MATERIAL_TYPE_LABELS) as MaterialType[]).map((t) => (
              <option key={t} value={t}>
                {MATERIAL_TYPE_LABELS[t]}
              </option>
            ))}
          </select>

          {/* Purpose Filter */}
          <select
            value={filters.purpose || 'ALL'}
            onChange={(e) => handleSelectChange('purpose', e.target.value)}
            className="px-2.5 py-1.5 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-hidden font-medium"
          >
            <option value="ALL">All Purposes</option>
            {(Object.keys(MATERIAL_PURPOSE_LABELS) as MaterialPurpose[]).map((p) => (
              <option key={p} value={p}>
                {MATERIAL_PURPOSE_LABELS[p]}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filters.status || 'ALL'}
            onChange={(e) => handleSelectChange('status', e.target.value)}
            className="px-2.5 py-1.5 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-hidden font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="PROCESSING">Processing</option>
            <option value="UPLOADED">Uploaded</option>
            <option value="ARCHIVED">Archived</option>
            <option value="FAILED">Failed</option>
          </select>

          {/* Sort Selector */}
          <select
            value={filters.sort || 'createdAt,desc'}
            onChange={(e) => handleSelectChange('sort', e.target.value)}
            className="px-2.5 py-1.5 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-hidden font-medium"
          >
            <option value="createdAt,desc">Newest First</option>
            <option value="createdAt,asc">Oldest First</option>
            <option value="title,asc">Title (A-Z)</option>
            <option value="fileSize,desc">Largest File</option>
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
