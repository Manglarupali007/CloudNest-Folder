import React, { useState, useEffect } from 'react';
import { shareAPI } from '../services/api';
import FileIcon, { formatBytes } from '../components/files/FileIcon';
import {
  Cloud,
  Download,
  Eye,
  Calendar,
  User,
  HardDrive,
  AlertCircle,
  FileCheck
} from 'lucide-react';

export const SharedPage = ({ token }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!token) return;

    setLoading(true);
    shareAPI
      .getSharedFile(token)
      .then((res) => {
        setFile(res.data.file);
        setLoading(false);
      })
      .catch((err) => {
        setErrorMsg(err.response?.data?.message || 'File not found or link expired.');
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="animate-spin w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (errorMsg || !file) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center">
          <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-2">Unavailable Link</h2>
          <p className="text-xs text-slate-500 mb-6">{errorMsg || 'This link is invalid or has expired.'}</p>
          <a
            href="/"
            className="inline-block px-5 py-2.5 bg-sky-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-sky-500/20"
          >
            Go to CloudNest Home
          </a>
        </div>
      </div>
    );
  }

  const downloadUrl = shareAPI.downloadSharedUrl(token);
  const previewUrl = shareAPI.previewSharedUrl(token);
  const isImage = file.category === 'image';
  const isPDF = file.mimeType?.includes('pdf') || file.name.endsWith('.pdf');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Navbar */}
      <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <Cloud className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-base font-bold bg-gradient-to-r from-sky-600 to-indigo-700 bg-clip-text text-transparent">
            CloudNest
          </span>
        </div>
        <a
          href="/"
          className="text-xs font-semibold text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 px-3.5 py-2 rounded-xl transition-colors"
        >
          Sign In / Open Drive
        </a>
      </header>

      {/* Main card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="max-w-2xl w-full bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          {/* File preview section if image or pdf */}
          {isImage && (
            <div className="max-h-80 bg-slate-900 flex items-center justify-center p-4 overflow-hidden border-b border-slate-100">
              <img
                src={previewUrl}
                alt={file.name}
                className="max-h-72 max-w-full object-contain rounded-lg shadow-md"
              />
            </div>
          )}

          <div className="p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0">
                <FileIcon
                  category={file.category}
                  mimeType={file.mimeType}
                  name={file.name}
                  className="w-8 h-8"
                />
              </div>
              <div className="min-w-0">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-1.5">
                  <FileCheck className="w-3 h-3" />
                  <span>Public Shared Asset</span>
                </div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 truncate" title={file.name}>
                  {file.name}
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Shared by <span className="text-slate-700 font-medium">{file.owner}</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs mb-8">
              <div>
                <span className="text-slate-400 block mb-0.5">Size</span>
                <span className="font-semibold text-slate-800">{formatBytes(file.size)}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Category</span>
                <span className="font-semibold text-slate-800 capitalize">{file.category}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Downloads</span>
                <span className="font-semibold text-slate-800">{file.downloadCount}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <a
                href={downloadUrl}
                download={file.name}
                className="w-full sm:flex-1 py-3 px-4 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-sky-500/20 flex items-center justify-center gap-2 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download File ({formatBytes(file.size)})</span>
              </a>

              {isPDF && (
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
                >
                  <Eye className="w-4 h-4" />
                  <span>Open PDF in New Tab</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400">
        CloudNest File Hub • Secure Cloud Storage & Sharing
      </footer>
    </div>
  );
};

export default SharedPage;
