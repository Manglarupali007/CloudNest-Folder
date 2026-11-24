import React, { useState, useEffect } from 'react';
import { useFiles } from '../../context/FileContext';
import { useToast } from '../../context/ToastContext';
import { fileAPI } from '../../services/api';
import FileIcon, { formatBytes, getCategoryColor } from './FileIcon';
import TagModal from './TagModal';
import axios from 'axios';
import {
  X,
  Download,
  Share2,
  Star,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  FileText,
  Calendar,
  HardDrive,
  Eye,
  File,
  Edit3,
  Save,
  Tag
} from 'lucide-react';

export const FilePreviewModal = () => {
  const { previewFile, setPreviewFile, setShareFile, toggleStar, fetchContents, fetchStorageAndActivity } =
    useFiles();
  const { showToast } = useToast();

  const [textContent, setTextContent] = useState('');
  const [loadingText, setLoadingText] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);

  useEffect(() => {
    setIsEditing(false);
    if (!previewFile) {
      setTextContent('');
      return;
    }

    if (
      previewFile.category === 'code' ||
      previewFile.mimeType?.includes('text') ||
      previewFile.mimeType?.includes('json') ||
      previewFile.name.endsWith('.md') ||
      previewFile.name.endsWith('.json') ||
      previewFile.name.endsWith('.txt') ||
      previewFile.name.endsWith('.js')
    ) {
      setLoadingText(true);
      const token = localStorage.getItem('cloudnest_token');
      axios
        .get(fileAPI.previewUrl(previewFile._id), {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'text'
        })
        .then((res) => {
          setTextContent(res.data);
          setLoadingText(false);
        })
        .catch((err) => {
          console.error('Failed to load text preview:', err);
          setTextContent('Error loading text preview.');
          setLoadingText(false);
        });
    }
  }, [previewFile]);

  if (!previewFile) return null;

  const previewUrl = fileAPI.previewUrl(previewFile._id);
  const isImage = previewFile.category === 'image';
  const isVideo = previewFile.category === 'video';
  const isAudio = previewFile.category === 'audio';
  const isPDF = previewFile.mimeType?.includes('pdf') || previewFile.name.endsWith('.pdf');
  const isText =
    previewFile.category === 'code' ||
    previewFile.mimeType?.includes('text') ||
    previewFile.mimeType?.includes('json') ||
    previewFile.name.endsWith('.md') ||
    previewFile.name.endsWith('.txt') ||
    previewFile.name.endsWith('.js');

  const copyCode = () => {
    navigator.clipboard.writeText(textContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    window.open(fileAPI.downloadUrl(previewFile._id), '_blank');
  };

  const handleSaveContent = async () => {
    setIsSaving(true);
    try {
      const res = await fileAPI.updateFileContent(previewFile._id, textContent);
      showToast(`Saved changes to ${previewFile.name}!`, 'success');
      setIsEditing(false);
      setPreviewFile(res.data.file);
      fetchContents();
      fetchStorageAndActivity();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save changes', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const formattedDate = new Date(previewFile.createdAt).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-150">
        <div
          className={`bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-200 border border-slate-700/20 ${
            isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-5xl h-[88vh]'
          }`}
        >
          {/* Top Header */}
          <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <FileIcon
                category={previewFile.category}
                mimeType={previewFile.mimeType}
                name={previewFile.name}
                className="w-6 h-6 shrink-0"
              />
              <div className="min-w-0">
                <h3 className="text-sm font-semibold truncate text-slate-100" title={previewFile.name}>
                  {previewFile.name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>{formatBytes(previewFile.size)}</span>
                  <span>•</span>
                  <span className="capitalize">{previewFile.category}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {isText && (
                <>
                  {isEditing ? (
                    <button
                      onClick={handleSaveContent}
                      disabled={isSaving}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isSaving ? 'Saving...' : 'Save File'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-semibold rounded-xl border border-slate-700 transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Content</span>
                    </button>
                  )}
                </>
              )}

              <button
                onClick={() => toggleStar(previewFile, 'file')}
                className={`p-2 rounded-xl transition-colors ${
                  previewFile.isStarred
                    ? 'text-amber-400 hover:bg-slate-800'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title="Star"
              >
                <Star className={`w-4 h-4 ${previewFile.isStarred ? 'fill-amber-400' : ''}`} />
              </button>

              <button
                onClick={() => {
                  setShareFile(previewFile);
                }}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                title="Share"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>

              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors hidden sm:block"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setPreviewFile(null)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content Body */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-900/5">
            {/* Main preview viewport */}
            <div className="flex-1 flex items-center justify-center p-4 overflow-auto bg-slate-950/90 relative">
              {isImage && (
                <img
                  src={previewUrl}
                  alt={previewFile.name}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                />
              )}

              {isPDF && (
                <iframe
                  src={previewUrl}
                  title={previewFile.name}
                  className="w-full h-full rounded-lg bg-white border border-slate-700"
                />
              )}

              {isVideo && (
                <video
                  src={previewUrl}
                  controls
                  autoPlay
                  className="max-w-full max-h-full rounded-lg shadow-lg"
                />
              )}

              {isAudio && (
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl flex flex-col items-center gap-4 shadow-2xl max-w-md w-full">
                  <FileIcon category="audio" className="w-16 h-16 text-amber-400" />
                  <span className="text-sm font-semibold text-white text-center">
                    {previewFile.name}
                  </span>
                  <audio src={previewUrl} controls className="w-full mt-2" />
                </div>
              )}

              {isText && (
                <div className="w-full h-full bg-slate-900 rounded-xl p-4 flex flex-col border border-slate-800 shadow-inner">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 font-mono text-sky-400">
                      {isEditing ? 'Editing Mode' : 'Source Viewer'}
                    </span>
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <button
                          onClick={() => setIsEditing(false)}
                          className="px-2 py-0.5 text-xs text-slate-400 hover:text-white"
                        >
                          Cancel
                        </button>
                      ) : (
                        <button
                          onClick={copyCode}
                          className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
                        >
                          {copied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {isEditing ? (
                    <textarea
                      value={textContent}
                      onChange={(e) => setTextContent(e.target.value)}
                      className="flex-1 w-full bg-slate-950 font-mono text-xs leading-relaxed text-slate-100 p-3 rounded-lg focus:outline-none resize-none selection:bg-sky-500 selection:text-white"
                      spellCheck={false}
                    />
                  ) : (
                    <div className="flex-1 overflow-auto font-mono text-xs text-sky-200 bg-slate-950/80 p-4 rounded-lg select-text leading-relaxed whitespace-pre">
                      {loadingText ? 'Loading document text...' : textContent}
                    </div>
                  )}
                </div>
              )}

              {!isImage && !isPDF && !isVideo && !isAudio && !isText && (
                <div className="text-center p-8 bg-slate-900 border border-slate-800 rounded-2xl max-w-sm">
                  <FileIcon
                    category={previewFile.category}
                    mimeType={previewFile.mimeType}
                    className="w-16 h-16 mx-auto mb-3"
                  />
                  <h4 className="text-sm font-semibold text-white mb-1">
                    Preview not available
                  </h4>
                  <p className="text-xs text-slate-400 mb-4">
                    This file format does not support inline preview. Download it to view on your device.
                  </p>
                  <button
                    onClick={handleDownload}
                    className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-2 shadow-md shadow-sky-500/20"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download File</span>
                  </button>
                </div>
              )}
            </div>

            {/* Details Sidebar */}
            <div className="w-full md:w-80 bg-white border-l border-slate-200 p-6 flex flex-col justify-between shrink-0 overflow-y-auto">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                  File Details
                </h4>

                <div className="space-y-4 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Name</span>
                    <span className="font-semibold text-slate-800 break-all">
                      {previewFile.name}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">Size</span>
                    <span className="font-semibold text-slate-800">
                      {formatBytes(previewFile.size)} ({previewFile.size.toLocaleString()} bytes)
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">Type</span>
                    <span className="font-semibold text-slate-800 font-mono">
                      {previewFile.mimeType || 'unknown'}
                    </span>
                  </div>

                  {/* Tags */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-slate-400">Labels & Tags</span>
                      <button
                        onClick={() => setIsTagModalOpen(true)}
                        className="text-sky-600 hover:text-sky-700 font-semibold text-[11px] hover:underline"
                      >
                        Edit Tags
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {previewFile.tags && previewFile.tags.length > 0 ? (
                        previewFile.tags.map((t) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-medium text-[10px]"
                          >
                            #{t}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">No tags assigned</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">Uploaded</span>
                    <span className="font-semibold text-slate-800">{formattedDate}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">Downloads</span>
                    <span className="font-semibold text-slate-800">
                      {previewFile.downloadCount || 0} times
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">Access</span>
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full font-medium ${
                        previewFile.isPublic
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {previewFile.isPublic ? 'Publicly Shared' : 'Private'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 space-y-2">
                <button
                  onClick={handleDownload}
                  className="w-full py-2.5 px-4 bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Original</span>
                </button>
                <button
                  onClick={() => setShareFile(previewFile)}
                  className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200/70 text-slate-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share Link</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <TagModal
        file={previewFile}
        isOpen={isTagModalOpen}
        onClose={() => setIsTagModalOpen(false)}
      />
    </>
  );
};

export default FilePreviewModal;
