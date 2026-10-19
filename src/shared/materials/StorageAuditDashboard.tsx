import React from 'react';
import {
  HardDrive,
  Database,
  Download,
  Activity,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  TrendingUp,
  Layers,
  FileText,
  Video,
  FileCode,
} from 'lucide-react';
import { StorageAuditStats } from './types';
import { mockStorageAuditStats } from './mockMaterialData';

interface StorageAuditDashboardProps {
  stats?: StorageAuditStats;
}

export const StorageAuditDashboard: React.FC<StorageAuditDashboardProps> = ({
  stats = mockStorageAuditStats,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              AWS S3 Storage Telemetry & Bandwidth Audit
            </h3>
            <p className="text-xs text-slate-500 font-mono">
              Bucket: <span className="font-semibold text-slate-700">mentify-edu-materials-east1</span> · Region: {stats.bucketRegion}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" /> 100% FERPA Compliant
          </span>
        </div>
      </div>

      {/* KPI 4-Card Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">S3 Active Storage</span>
            <HardDrive className="w-4 h-4 text-indigo-600" />
          </div>
          <span className="text-xl font-bold font-mono text-slate-900">
            {stats.totalStorageFormatted}
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">of 100 GB Tier (43%)</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Total S3 Objects</span>
            <Layers className="w-4 h-4 text-indigo-600" />
          </div>
          <span className="text-xl font-bold font-mono text-slate-900">
            {stats.totalFilesCount}
          </span>
          <span className="text-[11px] text-emerald-600 font-semibold block mt-0.5">+24 this week</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Total Downloads</span>
            <Download className="w-4 h-4 text-indigo-600" />
          </div>
          <span className="text-xl font-bold font-mono text-slate-900">
            {stats.totalDownloadsCount.toLocaleString()}
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Via presigned tokens</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Monthly Bandwidth</span>
            <Activity className="w-4 h-4 text-indigo-600" />
          </div>
          <span className="text-xl font-bold font-mono text-slate-900">
            {stats.monthlyBandwidthFormatted}
          </span>
          <span className="text-[11px] text-indigo-600 font-semibold block mt-0.5">CloudFront 94% cache hit</span>
        </div>
      </div>

      {/* Storage By Format Distribution Bar */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700">Storage Distribution by Asset Class</span>
          <span className="font-mono text-slate-400">Total: {stats.totalStorageFormatted}</span>
        </div>

        {/* Visual segmented bar */}
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
          <div style={{ width: '58%' }} className="bg-indigo-600 h-full" title="Video Lectures 58%" />
          <div style={{ width: '26%' }} className="bg-violet-400 h-full" title="PDF Decks 26%" />
          <div style={{ width: '11%' }} className="bg-amber-400 h-full" title="ZIP Archives 11%" />
          <div style={{ width: '5%' }} className="bg-emerald-400 h-full" title="Documents 5%" />
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
            <span className="text-slate-600">Video Lectures:</span>
            <span className="font-mono font-bold text-slate-900">25.0 GB (58%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-violet-400" />
            <span className="text-slate-600">PDF Decks:</span>
            <span className="font-mono font-bold text-slate-900">11.2 GB (26%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="text-slate-600">ZIP Code Archives:</span>
            <span className="font-mono font-bold text-slate-900">4.7 GB (11%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-slate-600">Documents:</span>
            <span className="font-mono font-bold text-slate-900">2.1 GB (5%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
