import React, { useState } from 'react';
import { useFiles } from '../../context/FileContext';
import { folderAPI } from '../../services/api';
import { FolderPlus, X, AlertCircle } from 'lucide-react';

const colors = [
  { id: 'blue', bg: 'bg-sky-500', ring: 'ring-sky-400' },
  { id: 'indigo', bg: 'bg-indigo-500', ring: 'ring-indigo-400' },
  { id: 'purple', bg: 'bg-purple-500', ring: 'ring-purple-400' },
  { id: 'emerald', bg: 'bg-emerald-500', ring: 'ring-emerald-400' },
  { id: 'amber', bg: 'bg-amber-500', ring: 'ring-amber-400' },
  { id: 'rose', bg: 'bg-rose-500', ring: 'ring-rose-400' },
  { id: 'slate', bg: 'bg-slate-500', ring: 'ring-slate-400' }
];

export const NewFolderModal = () => {
  const {
    isNewFolderModalOpen,
    setIsNewFolderModalOpen,
    currentFolder,
    fetchContents,
    fetchStorageAndActivity
  } = useFiles();

  const [folderName, setFolderName] = useState('');
  const [selectedColor, setSelectedColor] = useState('blue');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isNewFolderModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!folderName.trim()) {
      setErrorMsg('Please enter a folder name');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    try {
      await folderAPI.createFolder({
        name: folderName.trim(),
        parent: currentFolder ? currentFolder._id : null,
        color: selectedColor
      });

      fetchContents();
      fetchStorageAndActivity();
      setFolderName('');
      setIsNewFolderModalOpen(false);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to create folder');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <FolderPlus className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">New Folder</h3>
          </div>
          <button
            onClick={() => {
              setIsNewFolderModalOpen(false);
              setFolderName('');
              setErrorMsg('');
            }}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Folder Name
            </label>
            <input
              type="text"
              autoFocus
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="e.g. Design Projects"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all"
            />
          </div>

          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Folder Color Tag
            </label>
            <div className="flex items-center gap-2">
              {colors.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setSelectedColor(c.id)}
                  className={`w-7 h-7 rounded-full ${c.bg} transition-all ${
                    selectedColor === c.id
                      ? `ring-4 ${c.ring} scale-110 shadow-xs`
                      : 'opacity-80 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsNewFolderModalOpen(false);
                setFolderName('');
              }}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !folderName.trim()}
              className="px-5 py-2 text-xs font-semibold text-white bg-sky-500 hover:bg-sky-600 active:bg-sky-700 rounded-xl shadow-md shadow-sky-500/20 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Folder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewFolderModal;
