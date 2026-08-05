import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Settings, Monitor, Home, Users, Shield, Bell, CheckCircle,
  XCircle, Image as ImageIcon, MessageSquare, LayoutTemplate,
  Loader2, LogOut, Check, ChevronRight, Activity, Database
} from 'lucide-react';

export default function GodAdminPanel() {
  const { user, token, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('visual');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<any>({});
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '' });

  useEffect(() => {
    fetchSettings();
    fetchAnnouncements();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get('/api/admin/settings');
      if (res.data.success) {
        setSettings(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await axios.get('/api/admin/announcements');
      if (res.data.success) {
        setAnnouncements(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };

  const saveSettings = async (updates: any) => {
    setSaving(true);
    try {
      const res = await axios.post('/api/admin/settings', updates, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setSettings(res.data.data);
        alert('Settings updated successfully!');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const createAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/admin/announcements', newAnnouncement, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setAnnouncements([res.data.data, ...announcements]);
        setNewAnnouncement({ title: '', content: '' });
      }
    } catch (error) {
      console.error('Error creating announcement:', error);
    }
  };

  const deleteAnnouncement = async (id: number) => {
    try {
      const res = await axios.delete(`/api/admin/announcements/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setAnnouncements(announcements.filter(a => a.id !== id));
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
    }
  };

  const tabs = [
    { id: 'visual', label: 'Visual & Theme', icon: <Monitor size={20} /> },
    { id: 'marquee', label: 'Marquee Notice', icon: <MessageSquare size={20} /> },
    { id: 'home', label: 'Home & Layout', icon: <Home size={20} /> },
    { id: 'announcements', label: 'Announcements', icon: <Bell size={20} /> },
    { id: 'users', label: 'User Security', icon: <Shield size={20} /> },
  ];

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
        <div className="text-center space-y-4">
          <Shield size={64} className="mx-auto text-red-500" />
          <h1 className="text-3xl font-bold">Access Denied</h1>
          <p className="text-slate-400">You must be an administrator to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3 text-indigo-400 mb-2">
            <Database className="w-8 h-8" />
            <h1 className="text-xl font-bold text-white tracking-tight">God Panel</h1>
          </div>
          <p className="text-xs text-slate-500">System Configuration Hub</p>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              {tab.icon}
              {tab.label}
              {activeTab === tab.id && <ChevronRight size={16} className="ml-auto" />}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/50 rounded-lg mb-4">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-400 truncate">System Admin</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/20 transition-colors"
          >
            <LogOut size={16} />
            Exit Panel
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative bg-gradient-to-br from-slate-950 to-slate-900">
        <div className="absolute top-0 left-0 w-full h-96 bg-indigo-500/5 blur-3xl pointer-events-none"></div>
        
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : (
          <div className="p-8 max-w-5xl mx-auto relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  {tabs.find(t => t.id === activeTab)?.label}
                </h2>
                <p className="text-slate-400">Configure global parameters and system defaults.</p>
              </div>
              {saving && (
                <div className="flex items-center gap-2 text-indigo-400 bg-indigo-500/10 px-4 py-2 rounded-full text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving changes...
                </div>
              )}
            </div>

            {/* TAB CONTENT */}
            <div className="space-y-6">
              
              {/* VISUAL THEME TAB */}
              {activeTab === 'visual' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                      <LayoutTemplate size={20} className="text-indigo-400" />
                      Splash & Logo
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-slate-400 mb-1">Splash Animation Type</label>
                        <select
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                          value={settings.splash_animation || 'fade'}
                          onChange={(e) => saveSettings({ splash_animation: e.target.value })}
                        >
                          <option value="fade">Fade In</option>
                          <option value="slide">Slide Up</option>
                          <option value="zoom">Zoom Out</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-slate-400 mb-1">Splash Duration (ms)</label>
                        <input
                          type="number"
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-indigo-500"
                          value={settings.splash_duration || 2000}
                          onChange={(e) => saveSettings({ splash_duration: parseInt(e.target.value) })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-slate-400 mb-1">App Logo URL</label>
                        <input
                          type="text"
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-indigo-500"
                          value={settings.splash_logo || ''}
                          onChange={(e) => saveSettings({ splash_logo: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                      <ImageIcon size={20} className="text-pink-400" />
                      Login Background
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-slate-400 mb-1">Background Image URL</label>
                        <input
                          type="text"
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-indigo-500"
                          value={settings.login_bg_image || ''}
                          onChange={(e) => saveSettings({ login_bg_image: e.target.value })}
                        />
                      </div>
                      <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                        {settings.login_bg_image && (
                          <img src={settings.login_bg_image} alt="Preview" className="w-full h-32 object-cover rounded-md" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* MARQUEE TAB */}
              {activeTab === 'marquee' && (
                <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl">
                  <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <Activity size={20} className="text-amber-400" />
                    Global Scrolling Notice
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Marquee Text</label>
                      <textarea
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-indigo-500 min-h-[100px]"
                        value={settings.marquee_text || ''}
                        onChange={(e) => setSettings({ ...settings, marquee_text: e.target.value })}
                        onBlur={(e) => saveSettings({ marquee_text: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm text-slate-400 mb-1">Speed (s)</label>
                        <input
                          type="number"
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white"
                          value={settings.marquee_speed || 2}
                          onChange={(e) => saveSettings({ marquee_speed: parseFloat(e.target.value) })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-slate-400 mb-1">Text Color</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            className="h-11 w-11 rounded-lg cursor-pointer bg-slate-800 border border-slate-700 p-1"
                            value={settings.marquee_color || '#ffffff'}
                            onChange={(e) => saveSettings({ marquee_color: e.target.value })}
                          />
                          <input
                            type="text"
                            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white"
                            value={settings.marquee_color || '#ffffff'}
                            readOnly
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-slate-400 mb-1">Background Color</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            className="h-11 w-11 rounded-lg cursor-pointer bg-slate-800 border border-slate-700 p-1"
                            value={settings.marquee_bg_color || '#000080'}
                            onChange={(e) => saveSettings({ marquee_bg_color: e.target.value })}
                          />
                          <input
                            type="text"
                            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white"
                            value={settings.marquee_bg_color || '#000080'}
                            readOnly
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Live Preview */}
                    <div className="mt-8 border border-slate-800 rounded-lg overflow-hidden">
                      <div className="bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-400 border-b border-slate-700">LIVE PREVIEW</div>
                      <div 
                        className="py-3 px-2 overflow-hidden whitespace-nowrap"
                        style={{ backgroundColor: settings.marquee_bg_color, color: settings.marquee_color }}
                      >
                        <div className="inline-block animate-[marquee_20s_linear_infinite]">
                          {settings.marquee_text}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* HOME TAB */}
              {activeTab === 'home' && (
                <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl">
                  <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <Home size={20} className="text-emerald-400" />
                    Home Page Layout
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Founder Message</label>
                      <textarea
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white min-h-[100px]"
                        value={settings.founder_message || ''}
                        onChange={(e) => setSettings({ ...settings, founder_message: e.target.value })}
                        onBlur={(e) => saveSettings({ founder_message: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Founder Image URL</label>
                      <input
                        type="text"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white"
                        value={settings.founder_image || ''}
                        onChange={(e) => saveSettings({ founder_image: e.target.value })}
                      />
                    </div>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-xl cursor-pointer hover:bg-slate-800 transition-colors flex-1">
                        <input 
                          type="checkbox" 
                          className="w-5 h-5 rounded border-slate-600 text-indigo-500 focus:ring-indigo-500"
                          checked={settings.show_widgets !== false}
                          onChange={(e) => saveSettings({ show_widgets: e.target.checked })}
                        />
                        <div>
                          <p className="text-white font-medium">Show Widgets</p>
                          <p className="text-xs text-slate-400">Display stats/widgets on home screen</p>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-xl cursor-pointer hover:bg-slate-800 transition-colors flex-1">
                        <input 
                          type="checkbox" 
                          className="w-5 h-5 rounded border-slate-600 text-indigo-500 focus:ring-indigo-500"
                          checked={settings.show_notices !== false}
                          onChange={(e) => saveSettings({ show_notices: e.target.checked })}
                        />
                        <div>
                          <p className="text-white font-medium">Show Notices Block</p>
                          <p className="text-xs text-slate-400">Display latest announcements block</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* ANNOUNCEMENTS TAB */}
              {activeTab === 'announcements' && (
                <div className="space-y-6">
                  <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl">
                    <h3 className="text-lg font-semibold text-white mb-4">Post New Announcement</h3>
                    <form onSubmit={createAnnouncement} className="space-y-4">
                      <div>
                        <input
                          type="text"
                          placeholder="Announcement Title"
                          required
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                          value={newAnnouncement.title}
                          onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                        />
                      </div>
                      <div>
                        <textarea
                          placeholder="Announcement Content..."
                          required
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 min-h-[120px]"
                          value={newAnnouncement.content}
                          onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                        />
                      </div>
                      <button 
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
                      >
                        <Bell size={18} />
                        Publish Announcement
                      </button>
                    </form>
                  </div>

                  <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                    <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-white">Active Announcements</h3>
                      <span className="bg-indigo-500/20 text-indigo-400 text-xs font-bold px-3 py-1 rounded-full">
                        {announcements.length} Total
                      </span>
                    </div>
                    <div className="divide-y divide-slate-800/50 max-h-[400px] overflow-y-auto">
                      {announcements.map((item) => (
                        <div key={item.id} className="p-6 hover:bg-slate-800/30 transition-colors flex justify-between items-start gap-4">
                          <div>
                            <h4 className="text-white font-medium mb-1">{item.title}</h4>
                            <p className="text-sm text-slate-400 mb-2">{item.content}</p>
                            <p className="text-xs text-slate-500">
                              {new Date(item.created_at).toLocaleString()}
                            </p>
                          </div>
                          <button
                            onClick={() => deleteAnnouncement(item.id)}
                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete Announcement"
                          >
                            <XCircle size={20} />
                          </button>
                        </div>
                      ))}
                      {announcements.length === 0 && (
                        <div className="p-8 text-center text-slate-500">
                          No announcements found.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* USER SECURITY TAB */}
              {activeTab === 'users' && (
                <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl">
                  <div className="text-center py-12">
                    <Shield size={48} className="mx-auto text-indigo-500 mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold text-white mb-2">User Security Management</h3>
                    <p className="text-slate-400 max-w-md mx-auto">
                      User administration features have been migrated to the dedicated User Management API.
                      Use the search bar above to find and manage specific users.
                    </p>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </main>
    </div>
  );
}
