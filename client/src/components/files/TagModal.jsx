import React, { useState, useEffect } from 'react';
import { fileAPI } from '../../services/api';
import { useFiles } from '../../context/FileContext';
import { useToast } from '../../context/ToastContext';
import { Tag, X, Plus, Check } from 'lucide-react';

const PRESET_TAGS = ['Important', 'Work', 'Finance', 'Personal', 'Draft', 'Receipt', 'Archive'];

export const TagModal = ({ file, isOpen, onClose }) => {
  const { fetchContents } = useFiles();
  const { showToast } = useToast();
  const [tags, setTags] = useState([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (file) {
      setTags(file.tags || []);
      setNewTagInput('');
    }
  }, [file, isOpen]);

  if (!isOpen || !file) return null;

  const handleAddTag = (tagToAdd) => {
    const trimmed = tagToAdd.trim().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await fileAPI.updateTags(file._id, tags);
      showToast('Tags updated successfully', 'success');
      fetchContents();
      onClose();
    } catch (err) {
      showToast('Failed to update tags', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Manage File Tags</h3>
              <p className="text-[11px] text-slate-400 truncate max-w-[240px]">{file.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Active Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Current Tags</label>
            {tags.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No tags assigned yet. Add one below!</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-full text-xs font-semibold"
                  >
                    <span>#{t}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="p-0.5 hover:bg-indigo-200/50 rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Add custom tag */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Add New Tag</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag(newTagInput);
                  }
                }}
                placeholder="Type tag (e.g. Q4-Report) & hit enter..."
                className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
              <button
                type="button"
                onClick={() => handleAddTag(newTagInput)}
                className="px-3 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Preset quick suggestions */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Suggested Tags
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_TAGS.map((preset) => {
                const isSelected = tags.includes(preset);
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => (isSelected ? handleRemoveTag(preset) : handleAddTag(preset))}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 hover:bg-slate-200/70 text-slate-600'
                    }`}
                  >
                    #{preset}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Tags'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TagModal;
