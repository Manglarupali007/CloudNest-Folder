import React from 'react';
import { useFiles } from '../../context/FileContext';
import { useAuth } from '../../context/AuthContext';
import {
  Menu,
  Search,
  X,
  LayoutGrid,
  List,
  ArrowUpDown,
  Trash2,
  CheckSquare,
  Square,
  Sparkles,
  Filter
} from 'lucide-react';

export const Navbar = ({ setMobileOpen }) => {
  const {
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    selectedFileIds,
    selectAllFiles,
    files,
    bulkTrashSelected,
    bulkDeleteSelected,
    activeTab
  } = useFiles();

  const { user } = useAuth();

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'image', label: 'Images' },
    { id: 'document', label: 'Documents' },
    { id: 'code', label: 'Code' },
    { id: 'video', label: 'Videos' },
    { id: 'archive', label: 'Archives' }
  ];

  const handleSortChange = (e) => {
    const value = e.target.value;
    if (value === 'name_asc') {
      setSortBy('name');
      setSortOrder('asc');
    } else if (value === 'name_desc') {
      setSortBy('name');
      setSortOrder('desc');
    } else if (value === 'date_desc') {
      setSortBy('createdAt');
      setSortOrder('desc');
    } else if (value === 'date_asc') {
      setSortBy('createdAt');
      setSortOrder('asc');
    } else if (value === 'size_desc') {
      setSortBy('size');
      setSortOrder('desc');
    } else if (value === 'size_asc') {
      setSortBy('size');
      setSortOrder('asc');
    }
  };

  const isAllSelected = files.length > 0 && selectedFileIds.length === files.length;

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 py-3 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Mobile menu button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Universal Search Bar */}
        <div className="flex-1 max-w-2xl relative">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in CloudNest (e.g. report.pdf, photo, code)..."
              className="w-full pl-10 pr-9 py-2 bg-slate-100 hover:bg-slate-100/80 focus:bg-white text-sm text-slate-800 placeholder-slate-400 rounded-xl border border-transparent focus:border-sky-300 focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 p-0.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          {/* Sorting Dropdown */}
          <div className="relative hidden sm:block">
            <select
              onChange={handleSortChange}
              value={`${sortBy}_${sortOrder}`}
              className="text-xs font-medium bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg px-2.5 py-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-200 transition-colors"
            >
              <option value="date_desc">Modified: Newest</option>
              <option value="date_asc">Modified: Oldest</option>
              <option value="name_asc">Name: A to Z</option>
              <option value="name_desc">Name: Z to A</option>
              <option value="size_desc">Size: Largest</option>
              <option value="size_asc">Size: Smallest</option>
            </select>
          </div>

          {/* Grid / List View Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/60">
            <button
              onClick={() => setViewMode('grid')}
              title="Grid View"
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-sky-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              title="List View"
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-sky-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-400 mr-1" />
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                activeCategory === cat.id
                  ? 'bg-sky-500 text-white shadow-xs shadow-sky-500/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Selected items bulk actions bar */}
        {selectedFileIds.length > 0 && (
          <div className="flex items-center gap-2 bg-sky-50 text-sky-900 border border-sky-200/80 px-3 py-1 rounded-full text-xs animate-in fade-in slide-in-from-right-4 duration-150">
            <button
              onClick={selectAllFiles}
              className="flex items-center gap-1 font-medium hover:text-sky-700"
            >
              {isAllSelected ? (
                <CheckSquare className="w-3.5 h-3.5 text-sky-600" />
              ) : (
                <Square className="w-3.5 h-3.5 text-sky-600" />
              )}
              <span>{selectedFileIds.length} selected</span>
            </button>

            <span className="text-sky-300">|</span>

            {activeTab === 'trash' ? (
              <button
                onClick={bulkDeleteSelected}
                className="flex items-center gap-1 font-medium text-rose-600 hover:text-rose-700"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Permanently</span>
              </button>
            ) : (
              <button
                onClick={bulkTrashSelected}
                className="flex items-center gap-1 font-medium text-rose-600 hover:text-rose-700"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Move to Trash</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
