import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, HardDrive, Download, Eye, ExternalLink, Check, AlertCircle, X } from 'lucide-react';

export default function ExportModal({
  isOpen,
  onClose,
  approvedCount,
  authStatus,
  onExportLocal,
  onExportSheets,
  onExportDriveImages
}) {
  const [activeTab, setActiveTab] = useState('local'); // 'local', 'sheets', 'drive'

  // Local file state
  const [localFilename, setLocalFilename] = useState('Activity_Reports_Export');
  const [localFileType, setLocalFileType] = useState('xlsx'); // 'xlsx' or 'csv'

  // Google Sheets state
  const [sheetsAccount, setSheetsAccount] = useState('primary');
  const [sheetsDestType, setSheetsDestType] = useState('new'); // 'new' or 'existing'
  const [newSheetTitle, setNewSheetTitle] = useState(`Activity Reports ${new Date().toISOString().slice(0, 10)}`);
  const [existingSheets, setExistingSheets] = useState([]);
  const [selectedSheetId, setSelectedSheetId] = useState('');
  const [sheetsPreview, setSheetsPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Drive state
  const [driveYear, setDriveYear] = useState('2026');

  // Loading indicator
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (activeTab === 'sheets' && sheetsDestType === 'existing' && authStatus?.is_authenticated) {
      fetch(`/api/export/google/sheets/list?account=${sheetsAccount}`)
        .then(res => res.json())
        .then(data => {
          setExistingSheets(data.spreadsheets || []);
          if (data.spreadsheets?.length > 0) {
            setSelectedSheetId(data.spreadsheets[0].id);
          }
        })
        .catch(err => console.error(err));
    }
  }, [activeTab, sheetsDestType, sheetsAccount, authStatus]);

  if (!isOpen) return null;

  const handlePreviewSheets = async () => {
    setPreviewLoading(true);
    try {
      const res = await fetch('/api/export/google/sheets/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination_type: sheetsDestType,
          spreadsheet_id: selectedSheetId,
          new_title: newSheetTitle
        })
      });
      const data = await res.json();
      setSheetsPreview(data);
    } catch (e) {
      alert("Failed to load preview: " + e.message);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleCommitLocal = () => {
    onExportLocal({
      filename: localFilename,
      file_type: localFileType,
      mode: 'new'
    });
  };

  const handleCommitSheets = async () => {
    setIsSubmitting(true);
    try {
      await onExportSheets({
        account: sheetsAccount,
        destination_type: sheetsDestType,
        spreadsheet_id: selectedSheetId,
        new_title: newSheetTitle
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCommitDrive = async () => {
    setIsSubmitting(true);
    try {
      await onExportDriveImages({
        account: sheetsAccount,
        year: driveYear
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full border border-slate-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Export Approved Records ({approvedCount} items)
            </h3>
            <p className="text-xs text-slate-500">
              Choose your export destination and configure writing options
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2 gap-2 text-xs">
          <button
            onClick={() => setActiveTab('local')}
            className={`pb-2.5 px-3 font-medium border-b-2 transition ${
              activeTab === 'local'
                ? 'border-indigo-600 text-indigo-600 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Excel (.xlsx) / CSV
          </button>
          <button
            onClick={() => setActiveTab('sheets')}
            className={`pb-2.5 px-3 font-medium border-b-2 transition ${
              activeTab === 'sheets'
                ? 'border-indigo-600 text-indigo-600 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Google Sheets
          </button>
          <button
            onClick={() => setActiveTab('drive')}
            className={`pb-2.5 px-3 font-medium border-b-2 transition ${
              activeTab === 'drive'
                ? 'border-indigo-600 text-indigo-600 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Google Drive Images
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">

          {/* TAB 1: LOCAL FILE EXPORT */}
          {activeTab === 'local' && (
            <div className="space-y-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">File Name</label>
                <input
                  type="text"
                  value={localFilename}
                  onChange={(e) => setLocalFilename(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden focus:border-indigo-500 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Format</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`border rounded-lg p-3 flex items-center space-x-3 cursor-pointer transition ${localFileType === 'xlsx' ? 'border-indigo-600 bg-indigo-50/40' : 'border-slate-200'}`}>
                    <input
                      type="radio"
                      name="fileType"
                      checked={localFileType === 'xlsx'}
                      onChange={() => setLocalFileType('xlsx')}
                      className="text-indigo-600"
                    />
                    <div>
                      <div className="font-semibold text-slate-900">Excel Workbook (.xlsx)</div>
                      <div className="text-[11px] text-slate-500">Styled table with frozen headers</div>
                    </div>
                  </label>
                  <label className={`border rounded-lg p-3 flex items-center space-x-3 cursor-pointer transition ${localFileType === 'csv' ? 'border-indigo-600 bg-indigo-50/40' : 'border-slate-200'}`}>
                    <input
                      type="radio"
                      name="fileType"
                      checked={localFileType === 'csv'}
                      onChange={() => setLocalFileType('csv')}
                      className="text-indigo-600"
                    />
                    <div>
                      <div className="font-semibold text-slate-900">Standard CSV (.csv)</div>
                      <div className="text-[11px] text-slate-500">Universal comma-separated format</div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-md p-3 text-[11px] text-slate-600">
                <strong>Duplicate Protection:</strong> If a file named <span className="font-mono">{localFilename}.{localFileType}</span> already exists, an inspection dialog will prompt you to Append, create a New unique file, or Cancel.
              </div>

              <div className="pt-2">
                <button
                  onClick={handleCommitLocal}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-xs transition flex items-center justify-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Verify & Export Local File</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: GOOGLE SHEETS */}
          {activeTab === 'sheets' && (
            <div className="space-y-4">
              {!authStatus?.is_authenticated ? (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center space-y-2">
                  <AlertCircle className="w-6 h-6 text-amber-600 mx-auto" />
                  <div className="font-semibold text-slate-900">Google Account Required</div>
                  <div className="text-slate-600">Sign in with Google from the top navigation bar to enable direct Sheets export.</div>
                </div>
              ) : (
                <>
                  {/* Account Selector */}
                  <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <div>
                      <span className="text-slate-500">Signed-in account:</span>
                      <span className="font-semibold text-slate-800 ml-1">
                        {sheetsAccount === 'primary'
                          ? authStatus.primary_user?.email || 'Primary Account'
                          : authStatus.secondary_user?.email || 'Secondary Account'}
                      </span>
                    </div>
                    {authStatus.has_secondary && (
                      <select
                        value={sheetsAccount}
                        onChange={(e) => setSheetsAccount(e.target.value)}
                        className="border border-slate-300 rounded px-2 py-1 bg-white text-xs"
                      >
                        <option value="primary">Primary Account</option>
                        <option value="secondary">Secondary Account</option>
                      </select>
                    )}
                  </div>

                  {/* Destination Choice */}
                  <div className="grid grid-cols-2 gap-3">
                    <label className={`border rounded-lg p-3 cursor-pointer transition ${sheetsDestType === 'new' ? 'border-indigo-600 bg-indigo-50/40' : 'border-slate-200'}`}>
                      <input
                        type="radio"
                        name="sheetDest"
                        checked={sheetsDestType === 'new'}
                        onChange={() => setSheetsDestType('new')}
                        className="text-indigo-600 mr-2"
                      />
                      <span className="font-semibold text-slate-900">Create New Sheet</span>
                    </label>
                    <label className={`border rounded-lg p-3 cursor-pointer transition ${sheetsDestType === 'existing' ? 'border-indigo-600 bg-indigo-50/40' : 'border-slate-200'}`}>
                      <input
                        type="radio"
                        name="sheetDest"
                        checked={sheetsDestType === 'existing'}
                        onChange={() => setSheetsDestType('existing')}
                        className="text-indigo-600 mr-2"
                      />
                      <span className="font-semibold text-slate-900">Select Existing Sheet</span>
                    </label>
                  </div>

                  {/* Target configuration */}
                  {sheetsDestType === 'new' ? (
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">New Spreadsheet Title</label>
                      <input
                        type="text"
                        value={newSheetTitle}
                        onChange={(e) => setNewSheetTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden focus:border-indigo-500 font-mono text-xs"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">Pick Spreadsheet from Drive</label>
                      {existingSheets.length === 0 ? (
                        <input
                          type="text"
                          placeholder="Enter Google Spreadsheet ID (e.g. 1BxiMVs0XRA5...)"
                          value={selectedSheetId}
                          onChange={(e) => setSelectedSheetId(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden focus:border-indigo-500 font-mono text-xs"
                        />
                      ) : (
                        <select
                          value={selectedSheetId}
                          onChange={(e) => setSelectedSheetId(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden focus:border-indigo-500 text-xs"
                        >
                          {existingSheets.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  )}

                  {/* Preview Destination button */}
                  <div>
                    <button
                      onClick={handlePreviewSheets}
                      disabled={previewLoading}
                      className="inline-flex items-center space-x-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-medium py-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{previewLoading ? "Loading preview..." : "Preview Destination Layout"}</span>
                    </button>
                  </div>

                  {/* Preview Table */}
                  {sheetsPreview && (
                    <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 space-y-2">
                      <div className="font-semibold text-slate-700">Destination Column Preview:</div>
                      <div className="overflow-x-auto max-h-36">
                        <table className="text-[11px] border border-slate-300 w-full bg-white">
                          <thead>
                            <tr className="bg-slate-100">
                              {sheetsPreview.headers.map((h, i) => (
                                <th key={i} className="border border-slate-200 p-1 font-semibold whitespace-nowrap">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {sheetsPreview.preview_rows.map((r, ri) => (
                              <tr key={ri}>
                                {r.map((c, ci) => (
                                  <td key={ci} className="border border-slate-200 p-1 truncate max-w-[120px]">{c}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      disabled={isSubmitting}
                      onClick={handleCommitSheets}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-xs transition flex items-center justify-center space-x-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>{isSubmitting ? "Writing to Sheets..." : "Write to Google Sheets"}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 3: GOOGLE DRIVE IMAGES */}
          {activeTab === 'drive' && (
            <div className="space-y-4">
              {!authStatus?.is_authenticated ? (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center space-y-2">
                  <AlertCircle className="w-6 h-6 text-amber-600 mx-auto" />
                  <div className="font-semibold text-slate-900">Google Account Required</div>
                  <div className="text-slate-600">Sign in with Google from the top navigation bar to enable Drive image uploads.</div>
                </div>
              ) : (
                <>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
                    <div className="font-semibold text-slate-800">Drive Folder Organization Architecture:</div>
                    <div className="font-mono text-[11px] text-indigo-700 bg-white p-2 rounded border border-slate-200 leading-relaxed">
                      Activity Reports / {driveYear} / &#123;Event_Name&#125; /<br />
                      &nbsp;&nbsp;├── Event_Poster/<br />
                      &nbsp;&nbsp;├── Photos/<br />
                      &nbsp;&nbsp;└── Attendance/
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Academic Year</label>
                    <input
                      type="text"
                      value={driveYear}
                      onChange={(e) => setDriveYear(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden focus:border-indigo-500 font-mono text-xs"
                    />
                  </div>

                  <p className="text-[11px] text-slate-500">
                    Existing filenames and folder hierarchies are automatically inspected to avoid duplicate uploads.
                  </p>

                  <div className="pt-2">
                    <button
                      disabled={isSubmitting}
                      onClick={handleCommitDrive}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-xs transition flex items-center justify-center space-x-2"
                    >
                      <HardDrive className="w-4 h-4" />
                      <span>{isSubmitting ? "Uploading Images..." : "Upload Categorized Images to Google Drive"}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
