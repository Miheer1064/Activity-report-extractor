import React, { useRef } from 'react';
import { UploadCloud, FileText, Trash2, Play, CheckCircle, Clock, AlertCircle, Eye } from 'lucide-react';

export default function UploadQueue({
  queue,
  onUploadFiles,
  onRemoveDoc,
  onStartExtraction,
  isProcessing,
  onSelectDoc
}) {
  const fileInputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUploadFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onUploadFiles(e.target.files);
    }
  };

  const queuedCount = queue.filter(d => d.status === 'queued').length;
  const readyCount = queue.filter(d => d.status === 'extracted' || d.status === 'approved').length;

  return (
    <div className="space-y-6">
      {/* Drag and drop upload card */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-white hover:bg-slate-50/70 transition rounded-xl p-8 text-center cursor-pointer shadow-xs"
      >
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept=".docx,.doc,.pdf"
          onChange={handleFileSelect}
          className="hidden"
        />
        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <UploadCloud className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900">
          Upload Activity Report Documents
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Drag & drop .docx or .pdf files here, or browse files from your computer
        </p>
        <div className="mt-4 flex items-center justify-center space-x-2 text-xs text-slate-400">
          <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-mono">.docx</span>
          <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-mono">.pdf</span>
          <span>• Multiple files supported</span>
        </div>
      </div>

      {/* Queue list card */}
      {queue.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Processing Queue ({queue.length} documents)
              </h2>
              <p className="text-xs text-slate-500">
                {queuedCount > 0 ? `${queuedCount} awaiting extraction` : "All documents processed"}
              </p>
            </div>
            {queuedCount > 0 && (
              <button
                disabled={isProcessing}
                onClick={onStartExtraction}
                className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-medium shadow-xs disabled:opacity-50 transition"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isProcessing ? "Processing Queue..." : "Start Sequential Extraction"}</span>
              </button>
            )}
          </div>

          <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto">
            {queue.map((doc) => (
              <div key={doc.id} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="p-2 rounded bg-slate-100 text-slate-600 shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-900 truncate">
                      {doc.filename}
                    </p>
                    <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-0.5">
                      {doc.images_count > 0 && (
                        <span>{doc.images_count} images found</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  {/* Status Badges */}
                  {doc.status === 'queued' && (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
                      <Clock className="w-3 h-3" />
                      <span>Queued</span>
                    </span>
                  )}
                  {doc.status === 'processing' && (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                      <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                      <span>Extracting...</span>
                    </span>
                  )}
                  {doc.status === 'extracted' && (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                      <AlertCircle className="w-3 h-3" />
                      <span>Ready for Review</span>
                    </span>
                  )}
                  {doc.status === 'approved' && (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle className="w-3 h-3" />
                      <span>Approved</span>
                    </span>
                  )}
                  {doc.status === 'error' && (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
                      <span>Error</span>
                    </span>
                  )}

                  {/* Actions */}
                  {doc.has_fields && (
                    <button
                      onClick={() => onSelectDoc(doc.id)}
                      className="inline-flex items-center space-x-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 rounded hover:bg-indigo-50"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Review</span>
                    </button>
                  )}

                  <button
                    onClick={() => onRemoveDoc(doc.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded"
                    title="Remove from queue"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
