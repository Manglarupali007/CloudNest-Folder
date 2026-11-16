import React, { useState } from 'react';
import { useFiles } from '../../context/FileContext';
import { useAuth } from '../../context/AuthContext';
import StorageMeter from './StorageMeter';
import {
  Cloud,
  HardDrive,
  Clock,
  Star,
  Share2,
  Trash2,
  BarChart3,
  Plus,
  Upload,
  FolderPlus,
  LogOut,
  UserCheck
} from 'lucide-react';

export const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const {
    activeTab,
    setActiveTab,
    navigateToRoot,
    storageData,
    setIsUploadModalOpen,
    setIsNewFolderModalOpen
  } = useFiles();
  const { user, logout } = useAuth();
  const [newDropdownOpen, setNewDropdownOpen] = useState(false);

  const navItems = [
    {
      id: 'drive',
      name: 'My Cloud',
      icon: HardDrive,
      count: storageData?.totalFiles,
      action: () => {
        setActiveTab('drive');
        navigateToRoot();
      }
    },
    {
      id: 'recent',
      name: 'Recent',
      icon: Clock,
      action: () => setActiveTab('recent')
    },
    {
      id: 'starred',
      name: 'Starred',
      icon: Star,
      count: storageData?.starredCount,
      action: () => setActiveTab('starred')
    },
    {
      id: 'shared',
      name: 'Shared Links',
      icon: Share2,
      action: () => setActiveTab('shared')
    },
    {
      id: 'trash',
      name: 'Trash',
      icon: Trash2,
      count: storageData?.trashCount,
      action: () => setActiveTab('trash')
    },
    {
      id: 'analytics',
      name: 'Storage Insights',
      icon: BarChart3,
      action: () => setActiveTab('analytics')
    }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <Cloud className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-lg font-bold bg-gradient-to-r from-sky-600 to-indigo-700 bg-clip-text text-transparent">
              CloudNest
            </span>
            <span className="block text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              File Hub
            </span>
          </div>
        </div>

        {/* Action button */}
        <div className="p-4 relative">
          <button
            onClick={() => setNewDropdownOpen(!newDropdownOpen)}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white rounded-xl shadow-md shadow-sky-500/25 transition-all font-medium text-sm hover:scale-[1.01] active:scale-[0.99]"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>New Upload</span>
          </button>

          {/* New dropdown menu */}
          {newDropdownOpen && (
            <>
              <div
                onClick={() => setNewDropdownOpen(false)}
                className="fixed inset-0 z-20"
              />
              <div className="absolute top-16 left-4 right-4 bg-white rounded-xl shadow-xl border border-slate-200/80 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => {
                    setNewDropdownOpen(false);
                    setIsUploadModalOpen(true);
                  }}
                  className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-medium">File Upload</div>
                    <div className="text-xs text-slate-400">Upload documents, photos, media</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setNewDropdownOpen(false);
                    setIsNewFolderModalOpen(true);
                  }}
                  className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <FolderPlus className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-medium">New Folder</div>
                    <div className="text-xs text-slate-400">Organize with custom folders</div>
                  </div>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  item.action();
                  if (setMobileOpen) setMobileOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-sky-50 text-sky-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-sky-600' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-sky-200/60 text-sky-800'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Storage meter section */}
        <div className="p-4 border-t border-slate-100">
          <StorageMeter />
        </div>

        {/* User profile footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center text-white font-semibold text-xs shrink-0 shadow-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-slate-800 truncate">
                {user?.name || 'Cloud User'}
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                {user?.email || 'user@cloudnest.io'}
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            title="Log out"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
