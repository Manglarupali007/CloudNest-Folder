import React, { useState, useEffect } from 'react';
import { useFiles } from '../../context/FileContext';
import { fileAPI, folderAPI } from '../../services/api';
import { FolderInput, X, Folder, Home, Check } from 'lucide-react';

export const MoveModal = () => {
  const { moveTarget, setMoveTarget, fetchContents, fetchStorageAndActivity } = useFiles();
  const [allFolders, setAllFolders] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState('root');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (moveTarget) {
      folderAPI.getFolders({ all: 'true' }).then((res) => {
        // Exclude current item if it's a folder to prevent circular nesting
        let list = res.data.folders || [];
        if (moveTarget.type === 'folder') {
          list = list.filter((f) => f._id !== moveTarget.item._id);
        }
        setAllFolders(list);
      });
    }
  }, [moveTarget]);

  if (!moveTarget) return null;

  const handleMove = async () => {
    setIsSubmitting(true);
    try {
      if (moveTarget.type === 'file') {
        await fileAPI.moveFile(moveTarget.item._id, selectedFolderId);
      }
      fetchContents();
      fetchStorageAndActivity();
      setMoveTarget(null);
    } catch (err) {
      console.error('Failed to move item:', err);
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
              <FolderInput className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Move to Folder</h3>
              <p className="text-[11px] text-slate-400 truncate max-w-[240px]">
                {moveTarget.item.name}
              </p>
            </div>
          </div>
          <button
            onClick={() => setMoveTarget(null)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Select Destination
          </label>

          <div className="border border-slate-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto divide-y divide-slate-100">
            {/* Root Option */}
            <button
              onClick={() => setSelectedFolderId('root')}
              className={`w-full px-3.5 py-2.5 flex items-center justify-between text-left text-xs transition-colors ${
                selectedFolderId === 'root'
                  ? 'bg-sky-50 text-sky-700 font-semibold'
                  : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Home className="w-4 h-4 text-sky-500" />
                <span>My Cloud (Root Directory)</span>
              </div>
              {selectedFolderId === 'root' && <Check className="w-4 h-4 text-sky-600" />}
            </button>

            {/* Folder list */}
            {allFolders.map((folder) => (
              <button
                key={folder._id}
                onClick={() => setSelectedFolderId(folder._id)}
                className={`w-full px-3.5 py-2.5 flex items-center justify-between text-left text-xs transition-colors ${
                  selectedFolderId === folder._id
                    ? 'bg-sky-50 text-sky-700 font-semibold'
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Folder className="w-4 h-4 text-indigo-500" />
                  <span className="truncate">{folder.name}</span>
                </div>
                {selectedFolderId === folder._id && <Check className="w-4 h-4 text-sky-600" />}
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            onClick={() => setMoveTarget(null)}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleMove}
            disabled={isSubmitting}
            className="px-5 py-2 text-xs font-semibold text-white bg-sky-500 hover:bg-sky-600 rounded-xl shadow-md shadow-sky-500/20 transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Moving...' : 'Move Here'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoveModal;
