import React, { useState, useEffect } from 'react';
import { useFiles } from '../../context/FileContext';
import { useToast } from '../../context/ToastContext';
import { fileAPI, folderAPI } from '../../services/api';
import {
  FileCode,
  X,
  Save,
  Folder,
  Eye,
  Edit3,
  Columns,
  Bold,
  Italic,
  Heading,
  List,
  CheckSquare,
  Code,
  Sparkles
} from 'lucide-react';

const formatOptions = [
  { ext: 'md', label: 'Markdown Note (.md)', mime: 'text/markdown' },
  { ext: 'txt', label: 'Plain Text (.txt)', mime: 'text/plain' },
  { ext: 'json', label: 'JSON Document (.json)', mime: 'application/json' },
  { ext: 'js', label: 'JavaScript Script (.js)', mime: 'application/javascript' },
  { ext: 'py', label: 'Python Script (.py)', mime: 'text/x-python' }
];

export const NewDocumentModal = ({ isOpen, onClose }) => {
  const { currentFolder, uploadTargetFolder, fetchContents, fetchStorageAndActivity, triggerCelebration } =
    useFiles();
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [extension, setExtension] = useState('md');
  const [content, setContent] = useState('');
  const [targetFolderId, setTargetFolderId] = useState('root');
  const [availableFolders, setAvailableFolders] = useState([]);
  const [viewMode, setViewMode] = useState('split'); // 'edit' | 'preview' | 'split'
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setContent('# Welcome to your new CloudNest Note\n\nStart typing your ideas, notes, or code here.\n\n- [x] Create project plan\n- [ ] Review documentation\n\n```json\n{\n  "status": "active",\n  "author": "You"\n}\n```');
      setExtension('md');
      setTargetFolderId(uploadTargetFolder?._id || currentFolder?._id || 'root');

      folderAPI
        .getFolders({ all: 'true' })
        .then((res) => {
          setAvailableFolders(res.data.folders || []);
        })
        .catch((err) => console.error(err));
    }
  }, [isOpen, uploadTargetFolder, currentFolder]);

  if (!isOpen) return null;

  const insertSnippet = (prefix, suffix = '') => {
    setContent((prev) => prev + `\n${prefix}text${suffix}`);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      showToast('Please provide a document title', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await fileAPI.createDocument({
        name: title.trim(),
        content,
        extension,
        folderId: targetFolderId === 'root' ? null : targetFolderId
      });

      triggerCelebration();
      showToast(`Document "${title.trim()}.${extension}" created successfully!`, 'success');
      fetchContents();
      fetchStorageAndActivity();
      onClose();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create document', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Simple Markdown renderer for live preview
  const renderMarkdown = (text) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('# ')) {
        return <h1 key={idx} className="text-xl font-bold text-slate-900 border-b pb-1 mb-2">{line.replace('# ', '')}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={idx} className="text-lg font-bold text-slate-800 mt-3 mb-1">{line.replace('## ', '')}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={idx} className="text-base font-semibold text-slate-800 mt-2 mb-1">{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('- [x] ') || line.startsWith('- [ ] ')) {
        const isChecked = line.startsWith('- [x] ');
        return (
          <div key={idx} className="flex items-center gap-2 text-xs py-0.5 text-slate-700">
            <input type="checkbox" readOnly checked={isChecked} className="rounded text-sky-500 pointer-events-none" />
            <span className={isChecked ? 'line-through text-slate-400' : ''}>{line.substring(6)}</span>
          </div>
        );
      }
      if (line.startsWith('- ')) {
        return <li key={idx} className="text-xs text-slate-700 ml-4 list-disc">{line.replace('- ', '')}</li>;
      }
      if (line.startsWith('```')) {
        return <div key={idx} className="text-[11px] font-mono text-sky-400 bg-slate-900 px-2 py-0.5 rounded-t">{line}</div>;
      }
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }
      return <p key={idx} className="text-xs text-slate-700 leading-relaxed">{line}</p>;
    });
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl h-[88vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-sky-600 to-indigo-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-white border border-white/20">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <span>New Cloud Document</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-400/20 text-sky-200 border border-sky-300/30">
                  Live Editor
                </span>
              </h3>
              <p className="text-[11px] text-sky-200">
                Write notes, markdown documents, or code scripts directly in CloudNest
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={isSubmitting || !title.trim()}
              className="px-4 py-2 bg-white text-sky-700 hover:bg-sky-50 active:bg-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Saving...' : 'Save to Cloud'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Settings Bar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex flex-1 items-center gap-2 min-w-[280px]">
            <input
              type="text"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Document title (e.g. Project_Meeting_Notes)..."
              className="flex-1 px-3 py-2 bg-white border border-slate-200 focus:border-sky-500 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
            <select
              value={extension}
              onChange={(e) => setExtension(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 font-semibold text-sky-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-200 cursor-pointer"
            >
              {formatOptions.map((opt) => (
                <option key={opt.ext} value={opt.ext}>
                  .{opt.ext}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-xl">
              <Folder className="w-3.5 h-3.5 text-sky-500" />
              <select
                value={targetFolderId}
                onChange={(e) => setTargetFolderId(e.target.value)}
                className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer max-w-[150px] truncate"
              >
                <option value="root">My Cloud (Root)</option>
                {availableFolders.map((f) => (
                  <option key={f._id} value={f._id}>
                    Folder: {f.name}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-white border border-slate-200 rounded-xl p-0.5">
              <button
                onClick={() => setViewMode('edit')}
                title="Editor Only"
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'edit' ? 'bg-sky-50 text-sky-600 font-semibold' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('split')}
                title="Split View"
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'split' ? 'bg-sky-50 text-sky-600 font-semibold' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('preview')}
                title="Live Preview Only"
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'preview' ? 'bg-sky-50 text-sky-600 font-semibold' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Markdown Quick Toolbar */}
        {extension === 'md' && viewMode !== 'preview' && (
          <div className="px-6 py-2 bg-slate-100/70 border-b border-slate-200 flex items-center gap-1.5 text-xs text-slate-600 shrink-0 overflow-x-auto">
            <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">Shortcuts:</span>
            <button
              onClick={() => insertSnippet('**', '**')}
              className="p-1 hover:bg-slate-200 rounded text-slate-700"
              title="Bold"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertSnippet('*', '*')}
              className="p-1 hover:bg-slate-200 rounded text-slate-700"
              title="Italic"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertSnippet('## ')}
              className="p-1 hover:bg-slate-200 rounded text-slate-700"
              title="Heading"
            >
              <Heading className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertSnippet('- ')}
              className="p-1 hover:bg-slate-200 rounded text-slate-700"
              title="List"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertSnippet('- [ ] ')}
              className="p-1 hover:bg-slate-200 rounded text-slate-700"
              title="Task Checkbox"
            >
              <CheckSquare className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertSnippet('```\n', '\n```')}
              className="p-1 hover:bg-slate-200 rounded text-slate-700"
              title="Code block"
            >
              <Code className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Main Content Workspace */}
        <div className="flex-1 flex overflow-hidden">
          {/* Editor textarea */}
          {(viewMode === 'edit' || viewMode === 'split') && (
            <div className={`flex-1 flex flex-col p-4 bg-slate-900 text-sky-100 ${viewMode === 'split' ? 'border-r border-slate-800' : ''}`}>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your document content here..."
                className="w-full flex-1 bg-transparent font-mono text-xs leading-relaxed text-slate-100 placeholder-slate-500 focus:outline-none resize-none selection:bg-sky-500 selection:text-white"
                spellCheck={false}
              />
            </div>
          )}

          {/* Live Preview Viewport */}
          {(viewMode === 'preview' || viewMode === 'split') && (
            <div className="flex-1 p-6 bg-slate-50/50 overflow-y-auto">
              <div className="max-w-prose mx-auto bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs min-h-full">
                <div className="border-b border-slate-100 pb-2 mb-4 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-semibold uppercase tracking-wider text-sky-600">Document Live Render</span>
                  <span>{title || 'Untitled'}.{extension}</span>
                </div>
                <div className="space-y-2">
                  {renderMarkdown(content)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-6 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <div className="flex items-center gap-3">
            <span>{wordCount} words</span>
            <span>•</span>
            <span>{charCount} characters</span>
            <span>•</span>
            <span className="capitalize font-mono">{extension} mode</span>
          </div>

          <div className="flex items-center gap-1.5 text-sky-600 font-semibold">
            <Sparkles className="w-3 h-3" />
            <span>Cloud-synced upon saving</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewDocumentModal;
