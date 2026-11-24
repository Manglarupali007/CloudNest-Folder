import React, { useState } from 'react';
import { useFiles } from '../../context/FileContext';
import { fileAPI } from '../../services/api';
import FileIcon, { formatBytes } from './FileIcon';
import TagModal from './TagModal';
import {
  Star,
  MoreVertical,
  Eye,
  Download,
  Share2,
  FolderInput,
  Edit2,
  Trash2,
  RotateCcw,
  Check,
  Globe,
  Tag
} from 'lucide-react';

export const FileCard = ({ file }) => {
  const {
    selectedFileIds,
    toggleSelectFile,
    setPreviewFile,
    setShareFile,
    setMoveTarget,
    setRenameTarget,
    toggleStar,
    moveToTrash,
    restoreItem,
    deletePermanently,
    activeTab
  } = useFiles();

  const [menuOpen, setMenuOpen] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const isSelected = selectedFileIds.includes(file._id);
  const isImage = file.category === 'image';

  const handleDownload = (e) => {
    e.stopPropagation();
    window.open(fileAPI.downloadUrl(file._id), '_blank');
  };

  const handlePreview = (e) => {
    e.stopPropagation();
    setPreviewFile(file);
  };

  return (
    <>
      <div
        onClick={(e) => {
          if (!e.target.closest('button')) {
            setPreviewFile(file);
          }
        }}
        className={`group relative bg-white border rounded-2xl overflow-hidden shadow-xs hover:shadow-xl hover:shadow-sky-500/10 hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between ${
          isSelected
            ? 'border-sky-500 ring-2 ring-sky-300 bg-sky-50/20'
            : 'border-slate-200/90 hover:border-sky-400'
        }`}
      >
        {/* Top Header Controls */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
          {/* Selection checkbox */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSelectFile(file._id);
            }}
            className={`w-6 h-6 rounded-md flex items-center justify-center transition-all ${
              isSelected
                ? 'bg-sky-500 text-white shadow-xs'
                : 'bg-white/95 text-slate-400 border border-slate-300 opacity-0 group-hover:opacity-100 hover:border-sky-400'
            }`}
          >
            {isSelected && <Check className="w-4 h-4 stroke-[2.5]" />}
          </button>

          <div className="flex items-center gap-1 bg-white/90 backdrop-blur-md rounded-xl p-0.5 shadow-sm border border-slate-200/60">
            {/* Public share indicator */}
            {file.isPublic && (
              <span
                title="File has public share link"
                className="p-1 text-emerald-600 bg-emerald-50 rounded-lg"
              >
                <Globe className="w-3.5 h-3.5" />
              </span>
            )}

            {/* Star button */}
            {activeTab !== 'trash' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleStar(file, 'file');
                }}
                className={`p-1 rounded-lg transition-colors ${
                  file.isStarred
                    ? 'text-amber-500 hover:text-amber-600'
                    : 'text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${file.isStarred ? 'fill-amber-400' : ''}`} />
              </button>
            )}

            {/* More options menu */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(!menuOpen);
                }}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
              >
                <MoreVertical className="w-3.5 h-3.5" />
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
                  <div className="absolute right-0 top-7 w-48 bg-white rounded-xl shadow-xl border border-slate-200/80 py-1.5 z-40 text-xs animate-in fade-in zoom-in-95 duration-100">
                    {activeTab === 'trash' ? (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpen(false);
                            restoreItem(file, 'file');
                          }}
                          className="w-full px-3 py-2 flex items-center gap-2.5 text-slate-700 hover:bg-slate-50 text-left"
                        >
                          <RotateCcw className="w-4 h-4 text-sky-500" />
                          <span>Restore File</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpen(false);
                            deletePermanently(file, 'file');
                          }}
                          className="w-full px-3 py-2 flex items-center gap-2.5 text-rose-600 hover:bg-rose-50 text-left font-medium"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete Forever</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={(e) => {
                            setMenuOpen(false);
                            handlePreview(e);
                          }}
                          className="w-full px-3 py-2 flex items-center gap-2.5 text-slate-700 hover:bg-slate-50 text-left"
                        >
                          <Eye className="w-4 h-4 text-slate-400" />
                          <span>Preview</span>
                        </button>
                        <button
                          onClick={(e) => {
                            setMenuOpen(false);
                            handleDownload(e);
                          }}
                          className="w-full px-3 py-2 flex items-center gap-2.5 text-slate-700 hover:bg-slate-50 text-left"
                        >
                          <Download className="w-4 h-4 text-slate-400" />
                          <span>Download</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpen(false);
                            setShareFile(file);
                          }}
                          className="w-full px-3 py-2 flex items-center gap-2.5 text-slate-700 hover:bg-slate-50 text-left"
                        >
                          <Share2 className="w-4 h-4 text-slate-400" />
                          <span>Share Link</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpen(false);
                            setIsTagModalOpen(true);
                          }}
                          className="w-full px-3 py-2 flex items-center gap-2.5 text-indigo-700 hover:bg-indigo-50 text-left font-medium"
                        >
                          <Tag className="w-4 h-4 text-indigo-500" />
                          <span>Manage Tags</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpen(false);
                            setMoveTarget({ item: file, type: 'file' });
                          }}
                          className="w-full px-3 py-2 flex items-center gap-2.5 text-slate-700 hover:bg-slate-50 text-left"
                        >
                          <FolderInput className="w-4 h-4 text-slate-400" />
                          <span>Move to Folder</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpen(false);
                            setRenameTarget({ item: file, type: 'file' });
                          }}
                          className="w-full px-3 py-2 flex items-center gap-2.5 text-slate-700 hover:bg-slate-50 text-left"
                        >
                          <Edit2 className="w-4 h-4 text-slate-400" />
                          <span>Rename</span>
                        </button>
                        <div className="my-1 border-t border-slate-100" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpen(false);
                            moveToTrash(file, 'file');
                          }}
                          className="w-full px-3 py-2 flex items-center gap-2.5 text-rose-600 hover:bg-rose-50 text-left"
                        >
                          <Trash2 className="w-4 h-4" />
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

        {/* Thumbnail area */}
        <div className="h-36 bg-gradient-to-b from-slate-50/90 to-slate-100/70 flex items-center justify-center p-3 overflow-hidden border-b border-slate-100/80">
          {isImage ? (
            <img
              src={fileAPI.previewUrl(file._id)}
              alt={file.name}
              loading="lazy"
              className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300 shadow-2xs"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 group-hover:scale-110 transition-transform duration-200">
              <FileIcon
                category={file.category}
                mimeType={file.mimeType}
                name={file.name}
                className="w-12 h-12"
              />
            </div>
          )}
        </div>

        {/* Metadata footer */}
        <div className="p-3.5 bg-white">
          <h4 className="text-xs font-semibold text-slate-800 truncate mb-1" title={file.name}>
            {file.name}
          </h4>

          {/* Tags preview */}
          {file.tags && file.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {file.tags.slice(0, 2).map((t) => (
                <span
                  key={t}
                  className="px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-semibold border border-indigo-100"
                >
                  #{t}
                </span>
              ))}
              {file.tags.length > 2 && (
                <span className="text-[10px] text-slate-400 font-semibold self-center">
                  +{file.tags.length - 2}
                </span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>{formatBytes(file.size)}</span>
            <span className="capitalize">{file.category}</span>
          </div>
        </div>
      </div>

      <TagModal
        file={file}
        isOpen={isTagModalOpen}
        onClose={() => setIsTagModalOpen(false)}
      />
    </>
  );
};

export default FileCard;
