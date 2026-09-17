import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import UploadQueue from './components/UploadQueue';
import ReviewEditor from './components/ReviewEditor';
import BatchTableReview from './components/BatchTableReview';
import ExportModal from './components/ExportModal';
import ConflictModal from './components/ConflictModal';
import CompletionSummary from './components/CompletionSummary';
import { Layers, FileSpreadsheet, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [authStatus, setAuthStatus] = useState(null);
  const [queue, setQueue] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [activeView, setActiveView] = useState('queue'); // 'queue', 'batch', 'editor', 'summary'
  
  // Modals
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [collisionInfo, setCollisionInfo] = useState(null);
  const [pendingLocalExport, setPendingLocalExport] = useState(null);
  const [exportResult, setExportResult] = useState(null);

  // Fetch Auth Status
  const fetchAuthStatus = () => {
    fetch('/api/auth/status')
      .then(res => res.json())
      .then(data => setAuthStatus(data))
      .catch(err => console.error("Error fetching auth:", err));
  };

  // Fetch Queue
  const fetchQueue = () => {
    fetch('/api/documents/queue')
      .then(res => res.json())
      .then(data => setQueue(data.documents || []))
      .catch(err => console.error("Error fetching queue:", err));
  };

  useEffect(() => {
    fetchAuthStatus();
    fetchQueue();
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    fetchAuthStatus();
  };

  const handleUploadFiles = async (fileList) => {
    const formData = new FormData();
    for (let i = 0; i < fileList.length; i++) {
      formData.append('files', fileList[i]);
    }

    try {
      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        fetchQueue();
      }
    } catch (e) {
      alert("Failed to upload files: " + e.message);
    }
  };

  const handleRemoveDoc = async (docId) => {
    try {
      await fetch(`/api/documents/${docId}`, { method: 'DELETE' });
      fetchQueue();
      if (selectedDocId === docId) {
        setSelectedDocId(null);
        setActiveView('queue');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleStartExtraction = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/extract/run', { method: 'POST' });
      if (res.ok) {
        fetchQueue();
        setActiveView('batch');
      }
    } catch (e) {
      alert("Extraction error: " + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectDoc = (docId) => {
    setSelectedDocId(docId);
    setActiveView('editor');
  };

  const handleDocApproved = (docId) => {
    fetchQueue();
    setActiveView('batch');
  };

  const handleApproveAll = async () => {
    try {
      const res = await fetch('/api/review/approve-all', { method: 'POST' });
      if (res.ok) {
        fetchQueue();
      }
    } catch (e) {
      alert("Error approving all: " + e.message);
    }
  };

  // Local File Export with Collision Detection
  const handleExportLocal = async (config) => {
    try {
      const collisionRes = await fetch('/api/export/check-collision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: config.filename,
          file_type: config.file_type
        })
      });
      const collisionData = await collisionRes.json();

      if (collisionData.exists) {
        setCollisionInfo(collisionData);
        setPendingLocalExport(config);
      } else {
        // Safe to write directly as new
        executeLocalExport(config, 'new');
      }
    } catch (e) {
      alert("Collision check error: " + e.message);
    }
  };

  const executeLocalExport = async (config, mode) => {
    try {
      const res = await fetch('/api/export/file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: config.filename,
          file_type: config.file_type,
          mode: mode
        })
      });
      const data = await res.json();
      if (res.ok) {
        setIsExportModalOpen(false);
        setCollisionInfo(null);
        setPendingLocalExport(null);
        setExportResult({
          message: `Exported ${data.exported_count} approved records to ${data.file_name}.`,
          file_name: data.file_name,
          download_url: data.download_url
        });
        setActiveView('summary');
      } else {
        alert("Export error: " + data.detail);
      }
    } catch (e) {
      alert("Export failed: " + e.message);
    }
  };

  // Google Sheets Export
  const handleExportSheets = async (config) => {
    try {
      const res = await fetch('/api/export/google/sheets/commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      const data = await res.json();
      if (res.ok) {
        setIsExportModalOpen(false);
        setExportResult({
          message: `Successfully wrote ${data.exported_count} approved records to Google Sheets.`,
          spreadsheet_url: data.spreadsheet_url
        });
        setActiveView('summary');
      } else {
        alert("Sheets export failed: " + data.detail);
      }
    } catch (e) {
      alert("Sheets export error: " + e.message);
    }
  };

  // Google Drive Images Export
  const handleExportDriveImages = async (config) => {
    try {
      const res = await fetch('/api/export/google/drive/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      const data = await res.json();
      if (res.ok) {
        setIsExportModalOpen(false);
        setExportResult({
          message: "Uploaded categorized images to Google Drive according to standard folder architecture.",
          drive_results: data.results
        });
        setActiveView('summary');
      } else {
        alert("Drive export error: " + data.detail);
      }
    } catch (e) {
      alert("Drive upload error: " + e.message);
    }
  };

  const approvedCount = queue.filter(d => d.status === 'approved').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <Navbar
        authStatus={authStatus}
        onRefreshAuth={fetchAuthStatus}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Navigation Tabs if not in summary or deep edit */}
        {activeView !== 'summary' && activeView !== 'editor' && (
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveView('queue')}
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  activeView === 'queue'
                    ? 'bg-white border border-slate-300 text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                <span>Upload & Queue</span>
                {queue.length > 0 && (
                  <span className="bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded-full text-[10px]">
                    {queue.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveView('batch')}
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  activeView === 'batch'
                    ? 'bg-white border border-slate-300 text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Batch Review</span>
                {approvedCount > 0 && (
                  <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full text-[10px] font-semibold">
                    {approvedCount} approved
                  </span>
                )}
              </button>
            </div>

            {approvedCount > 0 && (
              <button
                onClick={() => setIsExportModalOpen(true)}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-medium shadow-xs transition"
              >
                <span>Export Approved ({approvedCount})</span>
              </button>
            )}
          </div>
        )}

        {/* View Routing */}
        {activeView === 'queue' && (
          <UploadQueue
            queue={queue}
            onUploadFiles={handleUploadFiles}
            onRemoveDoc={handleRemoveDoc}
            onStartExtraction={handleStartExtraction}
            isProcessing={isProcessing}
            onSelectDoc={handleSelectDoc}
          />
        )}

        {activeView === 'batch' && (
          <BatchTableReview
            documents={queue}
            onSelectDoc={handleSelectDoc}
            onApproveAll={handleApproveAll}
            onProceedToExport={() => setIsExportModalOpen(true)}
          />
        )}

        {activeView === 'editor' && (
          <ReviewEditor
            docId={selectedDocId}
            onBack={() => setActiveView(queue.some(d => d.status === 'extracted') ? 'batch' : 'queue')}
            onDocApproved={handleDocApproved}
          />
        )}

        {activeView === 'summary' && (
          <CompletionSummary
            result={exportResult}
            onReset={() => {
              setExportResult(null);
              fetchQueue();
              setActiveView('queue');
            }}
          />
        )}
      </main>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        approvedCount={approvedCount}
        authStatus={authStatus}
        onExportLocal={handleExportLocal}
        onExportSheets={handleExportSheets}
        onExportDriveImages={handleExportDriveImages}
      />

      {/* Existing File Conflict Dialog */}
      <ConflictModal
        collisionInfo={collisionInfo}
        onAppend={() => {
          if (pendingLocalExport) {
            executeLocalExport(pendingLocalExport, 'append');
          }
        }}
        onCreateNew={() => {
          if (pendingLocalExport) {
            executeLocalExport(pendingLocalExport, 'new');
          }
        }}
        onCancel={() => {
          setCollisionInfo(null);
          setPendingLocalExport(null);
        }}
      />
    </div>
  );
}
