import React from 'react';
import { CheckCircle2, Download, ExternalLink, RefreshCw } from 'lucide-react';

export default function CompletionSummary({
  result,
  onReset
}) {
  if (!result) return null;

  return (
    <div className="bg-white rounded-xl border border-emerald-200 shadow-sm p-6 text-center max-w-xl mx-auto space-y-4">
      <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle2 className="w-6 h-6" />
      </div>

      <div>
        <h3 className="text-base font-semibold text-slate-900">
          Export Completed Successfully!
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          {result.message || "Your approved data has been safely processed and exported without data loss."}
        </p>
      </div>

      {/* Local download link */}
      {result.download_url && (
        <div className="pt-2">
          <a
            href={result.download_url}
            download
            className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
          >
            <Download className="w-4 h-4" />
            <span>Download {result.file_name}</span>
          </a>
        </div>
      )}

      {/* Google Sheets external link */}
      {result.spreadsheet_url && (
        <div className="pt-2">
          <a
            href={result.spreadsheet_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open Google Spreadsheet</span>
          </a>
        </div>
      )}

      {/* Drive images summary */}
      {result.drive_results && (
        <div className="text-left bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1">
          <div className="font-semibold text-slate-700">Uploaded to Google Drive:</div>
          {result.drive_results.map((res, i) => (
            <div key={i} className="text-slate-600 flex justify-between">
              <span>{res.event_name} ({res.uploaded_count} images)</span>
              <span className="font-mono text-[11px] text-slate-400">{res.folder_path}</span>
            </div>
          ))}
        </div>
      )}

      <div className="pt-4 border-t border-slate-100">
        <button
          onClick={onReset}
          className="inline-flex items-center space-x-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Return to Dashboard</span>
        </button>
      </div>
    </div>
  );
}
