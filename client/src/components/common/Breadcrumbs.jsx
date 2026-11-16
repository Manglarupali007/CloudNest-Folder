import React from 'react';
import { useFiles } from '../../context/FileContext';
import { ChevronRight, Home, Folder } from 'lucide-react';

export const Breadcrumbs = () => {
  const { currentFolder, breadcrumbs, navigateToFolder, navigateToRoot, activeTab } = useFiles();

  if (activeTab !== 'drive') {
    let title = 'My Files';
    if (activeTab === 'recent') title = 'Recent Files';
    if (activeTab === 'starred') title = 'Starred Items';
    if (activeTab === 'shared') title = 'Shared with Link';
    if (activeTab === 'trash') title = 'Trash Bin';
    if (activeTab === 'analytics') title = 'Storage Insights & Analytics';

    return (
      <div className="flex items-center gap-2 text-slate-800 font-semibold text-lg py-1">
        <span>{title}</span>
      </div>
    );
  }

  return (
    <nav className="flex items-center gap-1.5 text-sm font-medium text-slate-600 overflow-x-auto py-1">
      {/* Root */}
      <button
        onClick={navigateToRoot}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors ${
          !currentFolder
            ? 'bg-white text-sky-600 font-semibold shadow-xs border border-slate-200/60'
            : 'hover:bg-slate-200/60 text-slate-600 hover:text-slate-900'
        }`}
      >
        <Home className="w-4 h-4 text-sky-500" />
        <span>My Cloud</span>
      </button>

      {/* Breadcrumbs trail */}
      {breadcrumbs.map((crumb, idx) => {
        const isLast = idx === breadcrumbs.length - 1;
        return (
          <React.Fragment key={crumb.id}>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            <button
              onClick={() => navigateToFolder({ _id: crumb.id, name: crumb.name })}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg truncate max-w-[200px] transition-colors ${
                isLast
                  ? 'bg-white text-sky-600 font-semibold shadow-xs border border-slate-200/60'
                  : 'hover:bg-slate-200/60 text-slate-600 hover:text-slate-900'
              }`}
            >
              <Folder className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate">{crumb.name}</span>
            </button>
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
