import React from 'react';
import { CheckCheck, Eye, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function BatchTableReview({
  documents,
  onSelectDoc,
  onApproveAll,
  onProceedToExport
}) {
  const approvedCount = documents.filter(d => d.status === 'approved').length;
  const readyCount = documents.filter(d => d.status === 'extracted').length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden space-y-0">
      <div className="px-5 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Multi-Document Batch Review
          </h2>
          <p className="text-xs text-slate-500">
            {approvedCount} of {documents.length} approved • Data is never saved automatically without your confirmation
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {readyCount > 0 && (
            <button
              onClick={onApproveAll}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium border border-slate-300 transition"
            >
              <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Approve All Extracted</span>
            </button>
          )}

          <button
            disabled={approvedCount === 0}
            onClick={onProceedToExport}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-md text-xs font-medium shadow-xs transition"
          >
            <span>Export Approved Records ({approvedCount})</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
              <th className="py-2.5 px-4">Document File</th>
              <th className="py-2.5 px-4">Status</th>
              <th className="py-2.5 px-4">Activity Title</th>
              <th className="py-2.5 px-4">Type</th>
              <th className="py-2.5 px-4">Speaker</th>
              <th className="py-2.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {documents.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  No documents in queue. Upload files to get started.
                </td>
              </tr>
            ) : (
              documents.map((doc) => {
                const title = doc.fields?.general_information?.title || "—";
                const type = doc.fields?.general_information?.type || "—";
                const speaker = doc.fields?.speaker_details?.name || "—";
                const isApproved = doc.status === 'approved';

                return (
                  <tr key={doc.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-medium text-slate-900 max-w-[200px] truncate">
                      {doc.filename}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {isApproved ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Approved</span>
                        </span>
                      ) : doc.status === 'extracted' ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          <AlertCircle className="w-3 h-3" />
                          <span>Ready for Review</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
                          <Clock className="w-3 h-3" />
                          <span>{doc.status}</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 max-w-[240px] truncate text-slate-700">
                      {title}
                    </td>
                    <td className="py-3 px-4 max-w-[140px] truncate text-slate-600">
                      {type}
                    </td>
                    <td className="py-3 px-4 max-w-[160px] truncate text-slate-600">
                      {speaker}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => onSelectDoc(doc.id)}
                        className="inline-flex items-center space-x-1 text-indigo-600 hover:text-indigo-900 font-medium bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded transition"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Review</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
