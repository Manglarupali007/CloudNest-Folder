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
import NewDocumentModal from './components/files/NewDocumentModal';
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
  Trash2,
  Folder,
  Plus
} from 'lucide-react';

export function App() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    files,
    folders,
    currentFolder,
    breadcrumbs,
    viewMode,
    activeTab,
    isLoading: filesLoading,
    setIsUploadModalOpen,
    openUploadModal,
    setIsNewFolderModalOpen,
    isNewDocModalOpen,
    setIsNewDocModalOpen,
    bulkDeleteSelected,
    searchQuery
  } = useFiles();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [isWindowDragging, setIsWindowDragging] = useState(false);

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

  const handleGlobalDragOver = (e) => {
    e.preventDefault();
    if (activeTab === 'drive') {
      setIsWindowDragging(true);
    }
  };

  const handleGlobalDragLeave = (e) => {
    // Check if dragging left the window
    if (e.relatedTarget === null) {
      setIsWindowDragging(false);
    }
  };

  const handleGlobalDrop = (e) => {
    e.preventDefault();
    setIsWindowDragging(false);
    if (activeTab === 'drive' && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      openUploadModal(currentFolder);
    }
  };

  return (
    <div
      onDragOver={handleGlobalDragOver}
      onDragLeave={handleGlobalDragLeave}
      onDrop={handleGlobalDrop}
      className="min-h-screen bg-slate-50 flex relative"
    >
      {/* Drag & Drop Window Overlay */}
      {isWindowDragging && (
        <div className="fixed inset-0 z-50 bg-sky-900/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 pointer-events-none animate-in fade-in duration-150">
          <div className="bg-white border-2 border-dashed border-sky-500 rounded-3xl p-10 flex flex-col items-center text-center max-w-md shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mb-4 animate-bounce">
              <UploadCloud className="w-9 h-9" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              Drop files to upload
            </h3>
            <p className="text-xs text-slate-500">
              Uploading directly into{' '}
              <span className="font-semibold text-sky-600">
                {currentFolder ? currentFolder.name : 'My Cloud (Root)'}
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Sidebar navigation */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main workspace */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Navbar setMobileOpen={setMobileOpen} />

        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Breadcrumbs / Page Header & Top Action Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <Breadcrumbs />

            <div className="flex items-center gap-2 self-start sm:self-auto">
              {activeTab === 'drive' && (
                <>
                  <button
                    onClick={() => openUploadModal(currentFolder)}
                    className="px-3.5 py-2 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-sky-500/20 inline-flex items-center gap-2 transition-all hover:scale-[1.02]"
                    title={currentFolder ? `Upload to ${currentFolder.name}` : 'Upload to My Cloud'}
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload Files {currentFolder ? `to ${currentFolder.name}` : ''}</span>
                  </button>

                  <button
                    onClick={() => setIsNewFolderModalOpen(true)}
                    className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200/80 shadow-xs inline-flex items-center gap-1.5 transition-all"
                  >
                    <FolderPlus className="w-4 h-4 text-slate-500" />
                    <span className="hidden sm:inline">New Folder</span>
                  </button>

                  <button
                    onClick={() => setIsNewDocModalOpen(true)}
                    className="px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-emerald-500/20 inline-flex items-center gap-1.5 transition-all hover:scale-[1.02]"
                    title="Write a note, markdown or code file in browser"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">New Note / Doc</span>
                  </button>
                </>
              )}

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
          </div>

          {/* Active Folder Banner (when inside a folder) */}
          {currentFolder && activeTab === 'drive' && (
            <div className="bg-gradient-to-r from-sky-50/80 to-indigo-50/80 border border-sky-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white text-sky-600 border border-sky-200 shadow-xs flex items-center justify-center shrink-0">
                  <Folder className="w-6 h-6 text-sky-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-slate-800">{currentFolder.name}</h2>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-white text-sky-700 border border-sky-200 font-medium">
                      {files.length} {files.length === 1 ? 'file' : 'files'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Location: {breadcrumbs.length > 1 ? breadcrumbs.map(b => b.name).join(' / ') : 'My Cloud'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openUploadModal(currentFolder)}
                  className="px-3.5 py-1.5 bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5 transition-all"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Add More Files</span>
                </button>
              </div>
            </div>
          )}

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
                    onClick={() => openUploadModal(currentFolder)}
                    className="px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs rounded-xl shadow-md shadow-sky-500/20 inline-flex items-center gap-2 transition-all"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload Files {currentFolder ? `to ${currentFolder.name}` : ''}</span>
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
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Folders ({folders.length})
                    </h3>
                  </div>
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
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Files ({files.length})
                    </h3>
                    {activeTab === 'drive' && (
                      <button
                        onClick={() => openUploadModal(currentFolder)}
                        className="text-xs font-medium text-sky-600 hover:text-sky-700 hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Upload more files</span>
                      </button>
                    )}
                  </div>

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
      <NewDocumentModal
        isOpen={isNewDocModalOpen}
        onClose={() => setIsNewDocModalOpen(false)}
      />
      <FilePreviewModal />
      <ShareModal />
      <MoveModal />
      <RenameModal />
    </div>
  );
}

export default App;
