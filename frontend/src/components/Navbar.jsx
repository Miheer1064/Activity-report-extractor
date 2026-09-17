import React from 'react';
import { FileText, LogIn, LogOut, CheckCircle2, UserCheck, RefreshCw } from 'lucide-react';

export default function Navbar({ authStatus, onRefreshAuth, onLogout }) {
  const isAuth = authStatus?.is_authenticated;
  const primaryUser = authStatus?.primary_user;

  const handleLogin = (accountType = 'primary') => {
    fetch(`/api/auth/google/login?account_type=${accountType}`)
      .then(res => res.json())
      .then(data => {
        if (data.auth_url) {
          window.location.href = data.auth_url;
        } else if (data.error) {
          alert(`Google Auth Notice: ${data.error}`);
        }
      })
      .catch(err => {
        alert("Failed to contact auth server: " + err.message);
      });
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-slate-900 leading-tight">
              Activity Report Automation
            </h1>
            <p className="text-xs text-slate-500 font-normal">
              Extract, Validate & Export to Google Sheets, CSV, Excel & Drive
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {isAuth ? (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full text-xs text-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-medium truncate max-w-[140px]">
                  {primaryUser?.email || "Google Connected"}
                </span>
              </div>
              <button
                onClick={() => handleLogin('secondary')}
                className="text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded border border-slate-300 font-medium transition flex items-center space-x-1"
                title="Connect another account for Sheets/Drive exports"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Switch / Add Account</span>
              </button>
              <button
                onClick={onLogout}
                className="text-slate-400 hover:text-rose-600 p-1.5 rounded transition"
                title="Disconnect Google Account"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleLogin('primary')}
                className="inline-flex items-center space-x-2 px-3.5 py-1.5 text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign in with Google</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
