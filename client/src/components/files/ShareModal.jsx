import React, { useState, useEffect } from 'react';
import { useFiles } from '../../context/FileContext';
import { shareAPI } from '../../services/api';
import {
  Share2,
  X,
  Copy,
  Check,
  Globe,
  Lock,
  Clock,
  Trash2,
  Download
} from 'lucide-react';

export const ShareModal = () => {
  const { shareFile, setShareFile, fetchContents } = useFiles();
  const [copied, setCopied] = useState(false);
  const [expiresIn, setExpiresIn] = useState('0'); // 0 = never
  const [shareToken, setShareToken] = useState(shareFile?.shareToken || '');
  const [isPublic, setIsPublic] = useState(shareFile?.isPublic || false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (shareFile) {
      setShareToken(shareFile.shareToken || '');
      setIsPublic(shareFile.isPublic || false);
    }
  }, [shareFile]);

  if (!shareFile) return null;

  const publicUrl = shareToken
    ? `${window.location.origin}/share/${shareToken}`
    : '';

  const handleGenerateLink = async () => {
    setIsLoading(true);
    try {
      const res = await shareAPI.createShareLink(shareFile._id, expiresIn);
      setShareToken(res.data.shareToken);
      setIsPublic(true);
      fetchContents();
    } catch (err) {
      console.error('Failed to create share link:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeLink = async () => {
    setIsLoading(true);
    try {
      await shareAPI.revokeShareLink(shareFile._id);
      setShareToken('');
      setIsPublic(false);
      fetchContents();
    } catch (err) {
      console.error('Failed to revoke share link:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!publicUrl) return;
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Share File</h3>
              <p className="text-[11px] text-slate-400 truncate max-w-[240px]">
                {shareFile.name}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShareFile(null)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl mb-4">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isPublic ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-800">
                  {isPublic ? 'Anyone with the link can view' : 'Restricted (Private)'}
                </div>
                <div className="text-[11px] text-slate-400">
                  {isPublic ? 'Public direct access enabled' : 'Only you have access'}
                </div>
              </div>
            </div>

            {isPublic ? (
              <button
                onClick={handleRevokeLink}
                disabled={isLoading}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition-colors border border-rose-200"
              >
                Revoke Link
              </button>
            ) : (
              <button
                onClick={handleGenerateLink}
                disabled={isLoading}
                className="text-xs font-semibold text-white bg-sky-500 hover:bg-sky-600 px-3 py-1.5 rounded-lg shadow-xs transition-colors"
              >
                Enable Link
              </button>
            )}
          </div>

          {isPublic && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Shareable Link
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    readOnly
                    value={publicUrl}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 select-all focus:outline-none"
                  />
                  <button
                    onClick={copyToClipboard}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      copied
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Link Expiration</span>
                </label>
                <select
                  value={expiresIn}
                  onChange={(e) => setExpiresIn(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-200"
                >
                  <option value="0">Never expires</option>
                  <option value="1">Expires in 24 hours</option>
                  <option value="7">Expires in 7 days</option>
                  <option value="30">Expires in 30 days</option>
                </select>
              </div>

              <div className="p-3 bg-sky-50/70 border border-sky-100 rounded-xl text-[11px] text-sky-800 flex items-center justify-between">
                <span>Total Public Downloads:</span>
                <span className="font-bold">{shareFile.downloadCount || 0}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={() => setShareFile(null)}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
