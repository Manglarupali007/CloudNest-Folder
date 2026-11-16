import React from 'react';
import { useFiles } from '../context/FileContext';
import { formatBytes, getCategoryColor } from '../components/files/FileIcon';
import {
  HardDrive,
  FileImage,
  FileText,
  FileCode,
  Video,
  Music,
  Archive,
  Clock,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Folder
} from 'lucide-react';

export const StorageAnalyticsView = () => {
  const { storageData, activities, setActiveTab, navigateToFolder } = useFiles();

  if (!storageData) return null;

  const { used, limit, percent, breakdown, totalFiles, totalFolders, starredCount, trashCount } =
    storageData;
  const freeBytes = Math.max(0, (limit || 524288000) - used);

  const categoryCards = [
    {
      id: 'image',
      title: 'Images & Photos',
      icon: FileImage,
      color: 'emerald',
      data: breakdown?.image
    },
    {
      id: 'document',
      title: 'Documents & PDFs',
      icon: FileText,
      color: 'sky',
      data: breakdown?.document
    },
    {
      id: 'code',
      title: 'Code & Scripts',
      icon: FileCode,
      color: 'purple',
      data: breakdown?.code
    },
    {
      id: 'video',
      title: 'Videos & Recordings',
      icon: Video,
      color: 'rose',
      data: breakdown?.video
    },
    {
      id: 'audio',
      title: 'Audio & Music',
      icon: Music,
      color: 'amber',
      data: breakdown?.audio
    },
    {
      id: 'archive',
      title: 'Archives & ZIPs',
      icon: Archive,
      color: 'orange',
      data: breakdown?.archive
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner Overview */}
      <div className="bg-gradient-to-r from-sky-600 via-sky-700 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-sky-900/10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="max-w-md">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-sky-200 mb-3 border border-white/10">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cloud Storage Analytics</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {formatBytes(used)} <span className="text-sky-200 font-normal text-lg">of {formatBytes(limit)}</span>
          </h2>
          <p className="text-xs sm:text-sm text-sky-100 mt-2">
            You are using {percent}% of your storage quota. You have {formatBytes(freeBytes)} of free cloud space remaining.
          </p>

          <div className="flex items-center gap-4 mt-6 text-xs">
            <div className="bg-white/10 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-white/10">
              <span className="text-sky-200 block text-[10px] uppercase tracking-wider font-semibold">Total Files</span>
              <span className="text-base font-bold">{totalFiles}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-white/10">
              <span className="text-sky-200 block text-[10px] uppercase tracking-wider font-semibold">Folders</span>
              <span className="text-base font-bold">{totalFolders}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-white/10">
              <span className="text-sky-200 block text-[10px] uppercase tracking-wider font-semibold">Starred</span>
              <span className="text-base font-bold">{starredCount}</span>
            </div>
          </div>
        </div>

        {/* Circular Progress Gauge */}
        <div className="relative w-40 h-40 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="currentColor"
              strokeWidth="10"
              className="text-white/20"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="currentColor"
              strokeWidth="10"
              strokeDasharray={2 * Math.PI * 40}
              strokeDashoffset={2 * Math.PI * 40 * (1 - percent / 100)}
              strokeLinecap="round"
              className="text-sky-300 transition-all duration-1000"
              fill="transparent"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-extrabold">{percent}%</span>
            <span className="text-[10px] uppercase tracking-wider text-sky-200 font-semibold">Quota Used</span>
          </div>
        </div>
      </div>

      {/* Category Breakdown Grid */}
      <div>
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">
          Storage Breakdown by File Type
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryCards.map((card) => {
            const Icon = card.icon;
            const bytes = card.data?.bytes || 0;
            const count = card.data?.count || 0;
            const catPct = limit ? Math.min(100, (bytes / limit) * 100).toFixed(1) : '0';

            return (
              <div
                key={card.id}
                className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-sky-600" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{card.title}</h4>
                      <span className="text-[11px] text-slate-400">
                        {count} {count === 1 ? 'file' : 'files'}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-700">{formatBytes(bytes)}</span>
                </div>

                <div>
                  <div className="flex justify-between items-center text-[11px] text-slate-400 mb-1">
                    <span>{catPct}% of limit</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${catPct}%` }}
                      className="h-full bg-sky-500 rounded-full transition-all duration-500"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Timeline */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-800 uppercase tracking-wider">
            <Clock className="w-4 h-4 text-sky-500" />
            <span>Recent Activity Stream</span>
          </div>
          <span className="text-xs text-slate-400">{activities.length} recent actions</span>
        </div>

        {activities.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No recent activity recorded yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {activities.map((act) => {
              const formattedTime = new Date(act.createdAt).toLocaleString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div key={act._id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                      {act.targetType === 'folder' ? (
                        <Folder className="w-4 h-4" />
                      ) : (
                        <FileText className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-slate-800 truncate">
                        <span className="capitalize font-semibold text-sky-700 mr-1.5">
                          {act.action.replace('_', ' ')}
                        </span>
                        <span>{act.targetName}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {act.targetType}
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 shrink-0 whitespace-nowrap">
                    {formattedTime}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StorageAnalyticsView;
