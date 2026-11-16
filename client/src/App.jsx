import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useFiles } from './context/FileContext';
import Sidebar from './components/common/Sidebar';
import Navbar from './components/common/Navbar';
import Breadcrumbs from './components/common/Breadcrumbs';
import FolderCard from './components/files/FolderCard';
import FileCard from './components/files/FileCard';
import FileRow from './components/files/FileRow';
import FileUploadModal from './components/files/FileUploadModal';
import NewFolderModal from './components/files/NewFolderModal';
import FilePreviewModal from './components/files/FilePreviewModal';
import ShareModal from './components/files/ShareModal';
import MoveModal from './components/files/MoveModal';
import RenameModal from './components/files/RenameModal';
import AuthModal from './components/auth/AuthModal';
import StorageAnalyticsView from './pages/StorageAnalyticsView';
import SharedPage from './pages/SharedPage';
import {
  UploadCloud,
  FolderPlus,
  Inbox,
  Sparkles,
  RotateCcw,
  Trash2
} from 'lucide-react';

export function App() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    files,
    folders,
    viewMode,
    activeTab,
    isLoading: filesLoading,
    setIsUploadModalOpen,
    setIsNewFolderModalOpen,
    bulkDeleteSelected,
    searchQuery
  } = useFiles();

  const [mobileOpen, setMobileOpen] = useState(false);

  // Check if accessing a public share link (/share/:token)
  const pathname = window.location.pathname;
  if (pathname.startsWith('/share/')) {
    const token = pathname.replace('/share/', '');
    return <SharedPage token={token} />;
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthModal />;
  }

  const hasItems = folders.length > 0 || files.length > 0;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar navigation */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main workspace */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Navbar setMobileOpen={setMobileOpen} />

        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Breadcrumbs / Page Header */}
          <div className="flex items-center justify-between">
            <Breadcrumbs />

            {activeTab === 'trash' && files.length > 0 && (
              <button
                onClick={bulkDeleteSelected}
                className="px-3.5 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Empty Trash</span>
              </button>
            )}
          </div>

          {/* Conditional Views */}
          {activeTab === 'analytics' ? (
            <StorageAnalyticsView />
          ) : filesLoading ? (
            /* Loading skeletons */
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-20 bg-slate-200/70 rounded-2xl animate-pulse" />
                ))}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-44 bg-slate-200/70 rounded-2xl animate-pulse" />
                ))}
              </div>
            </div>
          ) : !hasItems ? (
            /* Empty state */
            <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center max-w-lg mx-auto my-12 shadow-xs">
              <div className="w-16 h-16 rounded-3xl bg-sky-50 text-sky-500 flex items-center justify-center mx-auto mb-4">
                <Inbox className="w-8 h-8 stroke-[1.8]" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">
                {searchQuery ? 'No matching files found' : 'This folder is empty'}
              </h3>
              <p className="text-xs text-slate-400 mb-6 max-w-sm mx-auto">
                {searchQuery
                  ? `No files or folders matched "${searchQuery}". Try another search term.`
                  : 'Start uploading your files, images, documents, and code, or create a new folder.'}
              </p>
              {!searchQuery && activeTab !== 'trash' && (
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs rounded-xl shadow-md shadow-sky-500/20 inline-flex items-center gap-2 transition-all"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload Files</span>
                  </button>
                  <button
                    onClick={() => setIsNewFolderModalOpen(true)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl inline-flex items-center gap-2 transition-all"
                  >
                    <FolderPlus className="w-4 h-4" />
                    <span>New Folder</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              {/* Folders Section (if any and not in 'recent' view) */}
              {folders.length > 0 && activeTab !== 'recent' && (
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    Folders ({folders.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {folders.map((folder) => (
                      <FolderCard key={folder._id} folder={folder} />
                    ))}
                  </div>
                </div>
              )}

              {/* Files Section */}
              {files.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    Files ({files.length})
                  </h3>

                  {viewMode === 'grid' ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {files.map((file) => (
                        <FileCard key={file._id} file={file} />
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                            <th className="w-10 px-3 py-2.5"></th>
                            <th className="px-3 py-2.5">Name</th>
                            <th className="px-3 py-2.5 hidden sm:table-cell">Type</th>
                            <th className="px-3 py-2.5">Size</th>
                            <th className="px-3 py-2.5 hidden md:table-cell">Last Modified</th>
                            <th className="px-3 py-2.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {files.map((file) => (
                            <FileRow key={file._id} file={file} />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <FileUploadModal />
      <NewFolderModal />
      <FilePreviewModal />
      <ShareModal />
      <MoveModal />
      <RenameModal />
    </div>
  );
}

export default App;
