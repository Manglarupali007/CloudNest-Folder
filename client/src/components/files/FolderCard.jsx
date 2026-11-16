import React, { useState } from 'react';
import { useFiles } from '../../context/FileContext';
import {
  Folder,
  Star,
  MoreVertical,
  Edit2,
  Trash2,
  RotateCcw,
  Palette
} from 'lucide-react';

const folderColors = {
  blue: 'text-sky-500 fill-sky-100/50',
  purple: 'text-purple-500 fill-purple-100/50',
  emerald: 'text-emerald-500 fill-emerald-100/50',
  amber: 'text-amber-500 fill-amber-100/50',
  rose: 'text-rose-500 fill-rose-100/50',
  slate: 'text-slate-500 fill-slate-100/50',
  indigo: 'text-indigo-500 fill-indigo-100/50'
};

export const FolderCard = ({ folder }) => {
  const {
    navigateToFolder,
    toggleStar,
    moveToTrash,
    restoreItem,
    deletePermanently,
    setRenameTarget,
    activeTab
  } = useFiles();

  const [menuOpen, setMenuOpen] = useState(false);
  const colorClass = folderColors[folder.color] || folderColors.blue;

  const handleOpenFolder = () => {
    if (activeTab === 'trash') return;
    navigateToFolder(folder);
  };

  return (
    <div
      onDoubleClick={handleOpenFolder}
      onClick={(e) => {
        // Single click also works for seamless navigation
        if (!e.target.closest('button')) {
          handleOpenFolder();
        }
      }}
      className="group relative bg-white border border-slate-200/80 hover:border-sky-300 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <Folder className={`w-8 h-8 ${colorClass} transition-transform group-hover:scale-105 shrink-0`} />
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-slate-800 truncate group-hover:text-sky-600 transition-colors">
              {folder.name}
            </h4>
            <span className="text-xs text-slate-400">
              {folder.itemCount || 0} {folder.itemCount === 1 ? 'item' : 'items'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-0.5">
          {/* Star toggle */}
          {activeTab !== 'trash' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleStar(folder, 'folder');
              }}
              className={`p-1.5 rounded-lg transition-colors ${
                folder.isStarred
                  ? 'text-amber-500 hover:text-amber-600'
                  : 'text-slate-300 hover:text-slate-500 opacity-0 group-hover:opacity-100'
              }`}
            >
              <Star className={`w-4 h-4 ${folder.isStarred ? 'fill-amber-400' : ''}`} />
            </button>
          )}

          {/* More options menu */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                  }}
                  className="fixed inset-0 z-30"
                />
                <div className="absolute right-0 top-8 w-44 bg-white rounded-xl shadow-xl border border-slate-200/80 py-1.5 z-40 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {activeTab === 'trash' ? (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpen(false);
                          restoreItem(folder, 'folder');
                        }}
                        className="w-full px-3 py-2 flex items-center gap-2 text-slate-700 hover:bg-slate-50 text-left"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-sky-500" />
                        <span>Restore Folder</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpen(false);
                          deletePermanently(folder, 'folder');
                        }}
                        className="w-full px-3 py-2 flex items-center gap-2 text-rose-600 hover:bg-rose-50 text-left font-medium"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Forever</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpen(false);
                          setRenameTarget({ item: folder, type: 'folder' });
                        }}
                        className="w-full px-3 py-2 flex items-center gap-2 text-slate-700 hover:bg-slate-50 text-left"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>Rename Folder</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpen(false);
                          moveToTrash(folder, 'folder');
                        }}
                        className="w-full px-3 py-2 flex items-center gap-2 text-rose-600 hover:bg-rose-50 text-left"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Move to Trash</span>
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FolderCard;
