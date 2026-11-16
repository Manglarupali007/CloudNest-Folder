import React from 'react';
import { useFiles } from '../../context/FileContext';
import { fileAPI } from '../../services/api';
import FileIcon, { formatBytes, getCategoryColor } from './FileIcon';
import {
  Star,
  Eye,
  Download,
  Share2,
  Trash2,
  RotateCcw,
  Check,
  Globe
} from 'lucide-react';

export const FileRow = ({ file }) => {
  const {
    selectedFileIds,
    toggleSelectFile,
    setPreviewFile,
    setShareFile,
    toggleStar,
    moveToTrash,
    restoreItem,
    deletePermanently,
    activeTab
  } = useFiles();

  const isSelected = selectedFileIds.includes(file._id);
  const colorStyle = getCategoryColor(file.category);

  const formattedDate = new Date(file.updatedAt || file.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <tr
      onClick={() => setPreviewFile(file)}
      className={`border-b border-slate-100 hover:bg-slate-50/80 transition-colors cursor-pointer group text-xs ${
        isSelected ? 'bg-sky-50/40' : ''
      }`}
    >
      {/* Checkbox */}
      <td className="w-10 px-3 py-3" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => toggleSelectFile(file._id)}
          className={`w-5 h-5 rounded flex items-center justify-center transition-all ${
            isSelected
              ? 'bg-sky-500 text-white'
              : 'border border-slate-300 text-slate-400 opacity-0 group-hover:opacity-100'
          }`}
        >
          {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
        </button>
      </td>

      {/* Name and Icon */}
      <td className="px-3 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <FileIcon
            category={file.category}
            mimeType={file.mimeType}
            name={file.name}
            className="w-5 h-5 shrink-0"
          />
          <div className="min-w-0">
            <span className="font-medium text-slate-800 truncate block group-hover:text-sky-600 transition-colors">
              {file.name}
            </span>
          </div>
          {file.isPublic && (
            <span title="Shared publicly" className="text-emerald-500 shrink-0">
              <Globe className="w-3.5 h-3.5" />
            </span>
          )}
        </div>
      </td>

      {/* Category */}
      <td className="px-3 py-3 hidden sm:table-cell">
        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium border ${colorStyle.bg}`}>
          {file.category}
        </span>
      </td>

      {/* Size */}
      <td className="px-3 py-3 text-slate-500 whitespace-nowrap">
        {formatBytes(file.size)}
      </td>

      {/* Modified date */}
      <td className="px-3 py-3 text-slate-400 whitespace-nowrap hidden md:table-cell">
        {formattedDate}
      </td>

      {/* Actions */}
      <td className="px-3 py-3 text-right" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {activeTab === 'trash' ? (
            <>
              <button
                onClick={() => restoreItem(file, 'file')}
                title="Restore file"
                className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => deletePermanently(file, 'file')}
                title="Delete forever"
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => toggleStar(file, 'file')}
                title="Star"
                className={`p-1.5 rounded-lg transition-colors ${
                  file.isStarred ? 'text-amber-500' : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${file.isStarred ? 'fill-amber-400' : ''}`} />
              </button>
              <button
                onClick={() => setPreviewFile(file)}
                title="Preview"
                className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => window.open(fileAPI.downloadUrl(file._id), '_blank')}
                title="Download"
                className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setShareFile(file)}
                title="Share link"
                className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => moveToTrash(file, 'file')}
                title="Trash"
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
};

export default FileRow;
