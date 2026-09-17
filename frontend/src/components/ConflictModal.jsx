import React from 'react';
import { AlertTriangle, Plus, FileSpreadsheet, X } from 'lucide-react';

export default function ConflictModal({
  collisionInfo,
  onAppend,
  onCreateNew,
  onCancel
}) {
  if (!collisionInfo || !collisionInfo.exists) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center space-x-3 bg-amber-50/50">
          <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              File Already Exists
            </h3>
            <p className="text-xs text-slate-500">
              A file with this name was found at the destination path.
            </p>
          </div>
        </div>

        {/* Existing file metadata card */}
        <div className="p-6 space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">File Name:</span>
              <span className="font-semibold text-slate-800 truncate max-w-[280px]">{collisionInfo.file_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">File Type:</span>
              <span className="uppercase font-mono text-slate-700">{collisionInfo.file_type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Location / Path:</span>
              <span className="text-slate-700 truncate max-w-[280px] font-mono text-[11px]" title={collisionInfo.file_path}>
                {collisionInfo.file_path}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">File Size:</span>
              <span className="text-slate-700">{collisionInfo.size_formatted}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Last Modified:</span>
              <span className="text-slate-700">{collisionInfo.last_modified}</span>
            </div>
            {collisionInfo.existing_rows >= 0 && (
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Existing Rows:</span>
                <span className="text-slate-700">{collisionInfo.existing_rows} records</span>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-600">
            To prevent accidental data loss, files are never overwritten automatically. How would you like to proceed?
          </p>

          {/* Action options */}
          <div className="space-y-2 pt-2">
            <button
              onClick={onAppend}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 text-left transition group"
            >
              <div className="flex items-center space-x-3">
                <FileSpreadsheet className="w-4 h-4 text-indigo-600 shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600">
                    1. Append to Existing File
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Add new rows below the existing records without touching previous data
                  </div>
                </div>
              </div>
            </button>

            <button
              onClick={onCreateNew}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 text-left transition group"
            >
              <div className="flex items-center space-x-3">
                <Plus className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600">
                    2. Create New File
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Save into a fresh file with an auto-generated timestamped name
                  </div>
                </div>
              </div>
            </button>

            <button
              onClick={onCancel}
              className="w-full flex items-center justify-between px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 text-left transition"
            >
              <div className="flex items-center space-x-3">
                <X className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-xs font-medium">3. Cancel Operation</span>
              </div>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
