import React from 'react';
import {
  FileText,
  FileImage,
  FileCode,
  FileSpreadsheet,
  Music,
  Video,
  Archive,
  File as GenericFile
} from 'lucide-react';

export const formatBytes = (bytes, decimals = 1) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const getCategoryColor = (category) => {
  switch (category) {
    case 'image':
      return { bg: 'bg-emerald-50 text-emerald-600 border-emerald-200', dot: 'bg-emerald-500' };
    case 'document':
      return { bg: 'bg-sky-50 text-sky-600 border-sky-200', dot: 'bg-sky-500' };
    case 'video':
      return { bg: 'bg-rose-50 text-rose-600 border-rose-200', dot: 'bg-rose-500' };
    case 'audio':
      return { bg: 'bg-amber-50 text-amber-600 border-amber-200', dot: 'bg-amber-500' };
    case 'archive':
      return { bg: 'bg-orange-50 text-orange-600 border-orange-200', dot: 'bg-orange-500' };
    case 'code':
      return { bg: 'bg-purple-50 text-purple-600 border-purple-200', dot: 'bg-purple-500' };
    default:
      return { bg: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-500' };
  }
};

export const FileIcon = ({ category, mimeType, name, className = "w-6 h-6" }) => {
  const ext = name ? name.split('.').pop().toLowerCase() : '';

  if (category === 'image' || (mimeType && mimeType.startsWith('image/'))) {
    return <FileImage className={`${className} text-emerald-500`} />;
  }

  if (['xls', 'xlsx', 'csv'].includes(ext)) {
    return <FileSpreadsheet className={`${className} text-teal-600`} />;
  }

  if (category === 'document' || ['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(ext)) {
    return <FileText className={`${className} text-sky-500`} />;
  }

  if (category === 'code' || ['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json', 'py', 'md'].includes(ext)) {
    return <FileCode className={`${className} text-purple-500`} />;
  }

  if (category === 'video' || (mimeType && mimeType.startsWith('video/'))) {
    return <Video className={`${className} text-rose-500`} />;
  }

  if (category === 'audio' || (mimeType && mimeType.startsWith('audio/'))) {
    return <Music className={`${className} text-amber-500`} />;
  }

  if (category === 'archive' || ['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
    return <Archive className={`${className} text-orange-500`} />;
  }

  return <GenericFile className={`${className} text-slate-500`} />;
};

export default FileIcon;
