import React, { useState, useEffect } from 'react';
import { useFiles } from '../../context/FileContext';
import { fileAPI, folderAPI } from '../../services/api';
import { Edit2, X, AlertCircle } from 'lucide-react';

export const RenameModal = () => {
  const { renameTarget, setRenameTarget, fetchContents, fetchStorageAndActivity } = useFiles();
  const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (renameTarget) {
      setName(renameTarget.item.name || '');
      setErrorMsg('');
    }
  }, [renameTarget]);

  if (!renameTarget) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Name cannot be empty');
      return;
    }

    setIsSubmitting(true);
    try {
      if (renameTarget.type === 'file') {
        await fileAPI.renameFile(renameTarget.item._id, name.trim());
      } else {
        await folderAPI.updateFolder(renameTarget.item._id, { name: name.trim() });
      }
      fetchContents();
      fetchStorageAndActivity();
      setRenameTarget(null);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to rename');
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
              <Edit2 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">
              Rename {renameTarget.type === 'file' ? 'File' : 'Folder'}
            </h3>
          </div>
          <button
            onClick={() => setRenameTarget(null)}
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
              New Name
            </label>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setRenameTarget(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-5 py-2 text-xs font-semibold text-white bg-sky-500 hover:bg-sky-600 active:bg-sky-700 rounded-xl shadow-md shadow-sky-500/20 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Rename'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RenameModal;
