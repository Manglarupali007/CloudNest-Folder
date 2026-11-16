import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fileAPI, folderAPI, shareAPI, analyticsAPI } from '../services/api';
import { useAuth } from './AuthContext';
import confetti from 'canvas-confetti';

const FileContext = createContext();

export const FileProvider = ({ children }) => {
  const { isAuthenticated, refreshUser } = useAuth();

  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [activeTab, setActiveTab] = useState('drive'); // 'drive', 'recent', 'starred', 'shared', 'trash', 'analytics'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedFileIds, setSelectedFileIds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Storage and analytics
  const [storageData, setStorageData] = useState(null);
  const [activities, setActivities] = useState([]);

  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [shareFile, setShareFile] = useState(null);
  const [moveTarget, setMoveTarget] = useState(null); // { item, type: 'file' | 'folder' }
  const [renameTarget, setRenameTarget] = useState(null); // { item, type: 'file' | 'folder' }

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.8 }
      });
    } catch (e) {
      // ignore
    }
  };

  // Fetch folders and files based on current state
  const fetchContents = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);

    try {
      const fileParams = {
        sortBy,
        sortOrder,
        search: searchQuery || undefined,
        category: activeCategory !== 'all' ? activeCategory : undefined
      };

      const folderParams = {
        search: searchQuery || undefined
      };

      if (activeTab === 'trash') {
        fileParams.trash = 'true';
        folderParams.trash = 'true';
      } else if (activeTab === 'starred') {
        fileParams.starred = 'true';
        folderParams.starred = 'true';
      } else if (activeTab === 'shared') {
        // Special share tab handled separately
      } else if (activeTab === 'recent') {
        fileParams.sortBy = 'createdAt';
        fileParams.sortOrder = 'desc';
      } else {
        // Normal Drive view
        if (currentFolder) {
          fileParams.folder = currentFolder._id;
          folderParams.parent = currentFolder._id;
        } else {
          fileParams.folder = 'root';
          folderParams.parent = 'root';
        }
      }

      if (activeTab === 'shared') {
        const shareRes = await shareAPI.getMyShares();
        setFiles(shareRes.data.files || []);
        setFolders([]);
      } else {
        const [filesRes, foldersRes] = await Promise.all([
          fileAPI.getFiles(fileParams),
          activeTab === 'recent' ? Promise.resolve({ data: { folders: [] } }) : folderAPI.getFolders(folderParams)
        ]);

        setFiles(filesRes.data.files || []);
        setFolders(foldersRes.data.folders || []);
      }

      // If we are in a folder, load breadcrumbs
      if (currentFolder) {
        try {
          const detailRes = await folderAPI.getFolder(currentFolder._id);
          setBreadcrumbs(detailRes.data.breadcrumbs || []);
        } catch (e) {
          // Fallback breadcrumbs
          setBreadcrumbs([{ id: currentFolder._id, name: currentFolder.name }]);
        }
      } else {
        setBreadcrumbs([]);
      }
    } catch (error) {
      console.error('Failed to load drive items:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, activeTab, currentFolder, searchQuery, activeCategory, sortBy, sortOrder]);

  // Fetch storage statistics and recent activities
  const fetchStorageAndActivity = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const [storageRes, activityRes] = await Promise.all([
        analyticsAPI.getStorageOverview(),
        analyticsAPI.getRecentActivities(25)
      ]);
      setStorageData(storageRes.data.storage);
      setActivities(activityRes.data.activities || []);
      refreshUser();
    } catch (err) {
      console.error('Failed to fetch storage & activity info:', err);
    }
  }, [isAuthenticated, refreshUser]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchContents();
    }
  }, [fetchContents, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchStorageAndActivity();
    }
  }, [fetchStorageAndActivity, isAuthenticated]);

  // Folder navigation
  const navigateToFolder = (folder) => {
    setCurrentFolder(folder);
    setSelectedFileIds([]);
  };

  const navigateToRoot = () => {
    setCurrentFolder(null);
    setSelectedFileIds([]);
  };

  // Toggle star
  const toggleStar = async (item, type = 'file') => {
    try {
      if (type === 'file') {
        await fileAPI.toggleStar(item._id);
      } else {
        await folderAPI.toggleStar(item._id);
      }
      fetchContents();
      fetchStorageAndActivity();
    } catch (err) {
      console.error('Failed to star item:', err);
    }
  };

  // Move to trash
  const moveToTrash = async (item, type = 'file') => {
    try {
      if (type === 'file') {
        await fileAPI.trashFile(item._id);
      } else {
        await folderAPI.trashFolder(item._id);
      }
      fetchContents();
      fetchStorageAndActivity();
    } catch (err) {
      console.error('Failed to trash item:', err);
    }
  };

  // Restore item
  const restoreItem = async (item, type = 'file') => {
    try {
      if (type === 'file') {
        await fileAPI.restoreFile(item._id);
      } else {
        await folderAPI.restoreFolder(item._id);
      }
      fetchContents();
      fetchStorageAndActivity();
    } catch (err) {
      console.error('Failed to restore item:', err);
    }
  };

  // Delete permanently
  const deletePermanently = async (item, type = 'file') => {
    try {
      if (type === 'file') {
        await fileAPI.deletePermanently(item._id);
      } else {
        await folderAPI.deletePermanently(item._id);
      }
      fetchContents();
      fetchStorageAndActivity();
    } catch (err) {
      console.error('Failed to permanently delete item:', err);
    }
  };

  // Bulk actions
  const toggleSelectFile = (fileId) => {
    setSelectedFileIds((prev) =>
      prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]
    );
  };

  const selectAllFiles = () => {
    if (selectedFileIds.length === files.length) {
      setSelectedFileIds([]);
    } else {
      setSelectedFileIds(files.map((f) => f._id));
    }
  };

  const bulkTrashSelected = async () => {
    if (selectedFileIds.length === 0) return;
    try {
      await fileAPI.bulkTrash(selectedFileIds);
      setSelectedFileIds([]);
      fetchContents();
      fetchStorageAndActivity();
    } catch (err) {
      console.error('Bulk trash failed:', err);
    }
  };

  const bulkDeleteSelected = async () => {
    if (selectedFileIds.length === 0) return;
    try {
      await fileAPI.bulkDelete(selectedFileIds);
      setSelectedFileIds([]);
      fetchContents();
      fetchStorageAndActivity();
    } catch (err) {
      console.error('Bulk delete failed:', err);
    }
  };

  return (
    <FileContext.Provider
      value={{
        files,
        folders,
        currentFolder,
        breadcrumbs,
        activeTab,
        setActiveTab,
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
        toggleSelectFile,
        selectAllFiles,
        isLoading,
        storageData,
        activities,
        fetchContents,
        fetchStorageAndActivity,
        navigateToFolder,
        navigateToRoot,
        toggleStar,
        moveToTrash,
        restoreItem,
        deletePermanently,
        bulkTrashSelected,
        bulkDeleteSelected,
        triggerCelebration,
        // Modal states
        isUploadModalOpen,
        setIsUploadModalOpen,
        isNewFolderModalOpen,
        setIsNewFolderModalOpen,
        previewFile,
        setPreviewFile,
        shareFile,
        setShareFile,
        moveTarget,
        setMoveTarget,
        renameTarget,
        setRenameTarget
      }}
    >
      {children}
    </FileContext.Provider>
  );
};

export const useFiles = () => useContext(FileContext);
