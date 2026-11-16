import React, { useState, useRef } from 'react';
import { useFiles } from '../../context/FileContext';
import { fileAPI } from '../../services/api';
import { formatBytes } from './FileIcon';
import {
  UploadCloud,
  X,
  File,
  CheckCircle,
  AlertCircle,
  Folder
} from 'lucide-react';

export const FileUploadModal = () => {
  const {
    isUploadModalOpen,
    setIsUploadModalOpen,
    currentFolder,
    fetchContents,
    fetchStorageAndActivity,
    triggerCelebration
  } = useFiles();

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  if (!isUploadModalOpen) return null;

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (newFiles) => {
    setErrorMsg('');
    setSelectedFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setErrorMsg('');
    setUploadProgress(10);

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append('files', file);
    });

    if (currentFolder) {
      formData.append('folderId', currentFolder._id);
    }

    try {
      await fileAPI.uploadFiles(formData, (percent) => {
        setUploadProgress(percent);
      });

      triggerCelebration();
      fetchContents();
      fetchStorageAndActivity();
      setTimeout(() => {
        setIsUploadModalOpen(false);
        setSelectedFiles([]);
        setUploadProgress(null);
      }, 500);
    } catch (err) {
      console.error('Upload failed:', err);
      setUploadProgress(null);
      setErrorMsg(
        err.response?.data?.message || 'Upload failed. Please check file size or storage quota.'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800">Upload Files</h3>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
              <span>Target:</span>
              <span className="font-medium text-sky-600 flex items-center gap-1">
                <Folder className="w-3.5 h-3.5" />
                {currentFolder ? currentFolder.name : 'Root Folder'}
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              setIsUploadModalOpen(false);
              setSelectedFiles([]);
              setErrorMsg('');
              setUploadProgress(null);
            }}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal body */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Dropzone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-sky-500 bg-sky-50/50 scale-[1.01]'
                : 'border-slate-300 hover:border-sky-400 bg-slate-50/50 hover:bg-sky-50/20'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              className="hidden"
            />
            <div className="w-14 h-14 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mb-3 shadow-inner">
              <UploadCloud className="w-8 h-8 stroke-[1.8]" />
            </div>
            <p className="text-sm font-semibold text-slate-800 mb-1">
              Drag & Drop files here, or <span className="text-sky-600 underline">browse</span>
            </p>
            <p className="text-xs text-slate-400">
              Supports documents, images, video, audio, code & archives (up to 100MB per file)
            </p>
          </div>

          {/* Selected files list */}
          {selectedFiles.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-2">
                <span>Selected Files ({selectedFiles.length})</span>
                <span>
                  {formatBytes(selectedFiles.reduce((sum, f) => sum + f.size, 0))}
                </span>
              </div>

              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                {selectedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200/70 rounded-xl text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <File className="w-4 h-4 text-sky-500 shrink-0" />
                      <span className="font-medium text-slate-800 truncate">
                        {file.name}
                      </span>
                      <span className="text-slate-400 shrink-0">
                        ({formatBytes(file.size)})
                      </span>
                    </div>
                    {uploadProgress === null && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(idx);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Progress bar */}
          {uploadProgress !== null && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs font-medium text-slate-600 mb-1.5">
                <span>Uploading files...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  style={{ width: `${uploadProgress}%` }}
                  className="h-full bg-gradient-to-r from-sky-500 to-indigo-600 transition-all duration-200"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            onClick={() => {
              setIsUploadModalOpen(false);
              setSelectedFiles([]);
              setUploadProgress(null);
            }}
            disabled={uploadProgress !== null}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/70 rounded-xl transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || uploadProgress !== null}
            className="px-5 py-2 text-xs font-semibold text-white bg-sky-500 hover:bg-sky-600 active:bg-sky-700 rounded-xl shadow-md shadow-sky-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploadProgress !== null ? 'Uploading...' : `Upload (${selectedFiles.length})`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileUploadModal;
