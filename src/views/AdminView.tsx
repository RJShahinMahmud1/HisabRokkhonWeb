import React, { useState, useEffect } from 'react';
import { Shield, Flag, Users as UsersIcon, MessageSquareOff, Trash2, Ban, CheckCircle, XCircle } from 'lucide-react';
import { fetchReports, fetchUsersList, dismissReport, resolveReport, deletePostByAdmin, setUserBanStatus, setUserMessageStatus } from '../lib/adminService';
import { useAppStore } from '../store';

export function AdminView() {
  const { lang } = useAppStore();
  const [activeTab, setActiveTab] = useState<'reports' | 'users'>('reports');
  const [reports, setReports] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const [fetchedReports, fetchedUsers] = await Promise.all([
        fetchReports(),
        fetchUsersList()
    ]);
    setReports(fetchedReports);
    setUsers(fetchedUsers);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDismissReport = async (id: string) => {
      await dismissReport(id);
      loadData();
  };

  const handleResolveAndRemovePost = async (report: any) => {
      await deletePostByAdmin(report.postOwnerId, report.postId);
      await resolveReport(report.id);
      loadData();
  };

  const handleToggleBan = async (user: any) => {
      await setUserBanStatus(user.id || user.uid, !user.banned);
      loadData();
  };

  const handleToggleMessages = async (user: any) => {
      await setUserMessageStatus(user.id || user.uid, !user.messagesDisabled);
      loadData();
  };

  return (
    <div className="pb-24 pt-6 px-4 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
          <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
      </div>

      <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl max-w-sm mb-6">
        <button
          onClick={() => setActiveTab('reports')}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition ${activeTab === 'reports' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <div className="flex items-center justify-center gap-2">
            <Flag className="w-4 h-4" /> Reports
          </div>
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition ${activeTab === 'users' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <div className="flex items-center justify-center gap-2">
            <UsersIcon className="w-4 h-4" /> Users
          </div>
        </button>
      </div>

      {loading ? (
          <div className="text-center py-10 opacity-50">Loading admin data...</div>
      ) : activeTab === 'reports' ? (
          <div className="space-y-4">
              {reports.filter(r => r.status === 'pending').map((report) => (
                  <div key={report.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                      <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2 mb-2">
                                  <span className="bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">Reported Post</span>
                                  <span className="text-xs text-slate-500">Post ID: {report.postId}</span>
                              </div>
                              <p className="text-sm font-medium text-slate-900 dark:text-white">Reason: {report.reason}</p>
                              <div className="text-xs text-slate-500">
                                  <p>Reporter: {report.reporterId}</p>
                                  <p>Owner: {report.postOwnerId}</p>
                              </div>
                          </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex gap-3">
                          <button 
                              onClick={() => handleResolveAndRemovePost(report)}
                              className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition"
                          >
                              <Trash2 className="w-4 h-4" /> Remove Post
                          </button>
                          <button 
                              onClick={() => handleDismissReport(report.id)}
                              className="flex items-center gap-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-sm font-semibold transition"
                          >
                              <XCircle className="w-4 h-4" /> Dismiss Report
                          </button>
                      </div>
                  </div>
              ))}
              {reports.filter(r => r.status === 'pending').length === 0 && (
                  <div className="text-center py-10 opacity-50 dark:text-white font-medium">No pending reports.</div>
              )}
          </div>
      ) : (
          <div className="space-y-4">
              {users.map((u) => (
                  <div key={u.uid} className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                          <img src={u.avatarUrl || 'https://via.placeholder.com/40'} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                          <div>
                              <p className="font-semibold text-slate-900 dark:text-white">{u.name}</p>
                              <p className="text-xs text-slate-500">{u.email}</p>
                          </div>
                      </div>
                      <div className="flex gap-2">
                          <button 
                              onClick={() => handleToggleMessages(u)}
                              className={`p-2 rounded-lg transition ${u.messagesDisabled ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-slate-100 text-slate-500 hover:bg-orange-50 dark:bg-slate-700 dark:hover:bg-slate-600'}`}
                              title={u.messagesDisabled ? 'Enable Messages' : 'Disable Messages'}
                          >
                              <MessageSquareOff className="w-5 h-5" />
                          </button>
                          <button 
                              onClick={() => handleToggleBan(u)}
                              className={`p-2 rounded-lg transition ${u.banned ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' : 'bg-slate-100 text-slate-500 hover:bg-rose-50 dark:bg-slate-700 dark:hover:bg-slate-600'}`}
                              title={u.banned ? 'Unban User' : 'Ban User'}
                          >
                              <Ban className="w-5 h-5" />
                          </button>
                      </div>
                  </div>
              ))}
          </div>
      )}
    </div>
  );
}
