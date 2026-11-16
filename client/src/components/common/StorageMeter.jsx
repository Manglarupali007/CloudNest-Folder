import React from 'react';
import { useFiles } from '../../context/FileContext';
import { formatBytes } from '../files/FileIcon';
import { HardDrive, ChevronRight } from 'lucide-react';

export const StorageMeter = () => {
  const { storageData, setActiveTab } = useFiles();

  if (!storageData) {
    return (
      <div className="p-4 bg-slate-100 rounded-xl animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
        <div className="h-2 bg-slate-200 rounded w-full"></div>
      </div>
    );
  }

  const { used, limit, percent, breakdown } = storageData;

  // Breakdown percentages for multi-segmented bar
  const total = limit || 524288000;
  const imgPct = Math.min(100, ((breakdown?.image?.bytes || 0) / total) * 100);
  const docPct = Math.min(100, ((breakdown?.document?.bytes || 0) / total) * 100);
  const codePct = Math.min(100, ((breakdown?.code?.bytes || 0) / total) * 100);
  const mediaPct = Math.min(100, (((breakdown?.video?.bytes || 0) + (breakdown?.audio?.bytes || 0)) / total) * 100);
  const otherPct = Math.min(100, (((breakdown?.archive?.bytes || 0) + (breakdown?.other?.bytes || 0)) / total) * 100);

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:border-sky-300 transition-all">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-slate-700 font-semibold text-xs uppercase tracking-wider">
          <HardDrive className="w-4 h-4 text-sky-500" />
          <span>Storage</span>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
          {percent}%
        </span>
      </div>

      <div className="mb-2">
        <div className="flex justify-between items-baseline text-xs mb-1">
          <span className="text-slate-800 font-medium">{formatBytes(used)}</span>
          <span className="text-slate-400">of {formatBytes(limit)}</span>
        </div>

        {/* Multi-segmented bar */}
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
          <div style={{ width: `${imgPct}%` }} className="bg-emerald-500 transition-all duration-500" title="Images" />
          <div style={{ width: `${docPct}%` }} className="bg-sky-500 transition-all duration-500" title="Documents" />
          <div style={{ width: `${codePct}%` }} className="bg-purple-500 transition-all duration-500" title="Code" />
          <div style={{ width: `${mediaPct}%` }} className="bg-rose-500 transition-all duration-500" title="Media" />
          <div style={{ width: `${otherPct}%` }} className="bg-amber-500 transition-all duration-500" title="Other" />
        </div>
      </div>

      {/* Mini legend */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Images</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-sky-500"></span>
          <span>Docs</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-purple-500"></span>
          <span>Code</span>
        </div>
      </div>

      <button
        onClick={() => setActiveTab('analytics')}
        className="w-full mt-3 py-1.5 px-2 flex items-center justify-center gap-1 text-xs font-medium text-sky-600 hover:text-sky-700 hover:bg-sky-50/80 rounded-lg transition-colors border border-dashed border-sky-200"
      >
        <span>View Insights & Cleanup</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default StorageMeter;
