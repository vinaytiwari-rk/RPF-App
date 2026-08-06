import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import GenericAdminTab from '../components/GenericAdminTab';
import FileUpload from '../components/FileUpload';
import { GraduationCap, Utensils, Pill, BookOpen, UserPlus, Dog, Leaf, Church, Tractor, Landmark, Hammer, Globe2 } from 'lucide-react';
import {
  Settings, Monitor, Home, Users, Shield, Bell, CheckCircle,
  XCircle, Image as ImageIcon, MessageSquare, LayoutTemplate,
  Loader2, LogOut, Check, ChevronRight, Activity, Database, Menu, X, Heart, CreditCard, Stethoscope, Briefcase, FileText, ActivitySquare, AlertTriangle, Droplet
} from 'lucide-react';

export default function GodAdminPanel() {
  const { user, token, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Data states
  const [settings, setSettings] = useState<any>({});
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [camps, setCamps] = useState<any[]>([]);
  const [grievances, setGrievances] = useState<any[]>([]);
  const [womenComplaints, setWomenComplaints] = useState<any[]>([]);
  const [bloodDonors, setBloodDonors] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '' });

  useEffect(() => {
    fetchSettings();
    fetchAnnouncements();
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const res = await axios.get('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } });
        setUsers(res.data.data || []);
      } else if (activeTab === 'volunteers') {
        const res = await axios.get('/api/admin/volunteers', { headers: { Authorization: `Bearer ${token}` } });
        setVolunteers(res.data.data || []);
      } else if (activeTab === 'donations') {
        const res = await axios.get('/api/admin/donations', { headers: { Authorization: `Bearer ${token}` } });
        setDonations(res.data.data || []);
      } else if (activeTab === 'cards') {
        const res = await axios.get('/api/admin/jan-seva-cards', { headers: { Authorization: `Bearer ${token}` } });
        setCards(res.data.data || []);
      } else if (activeTab === 'camps') {
        const res = await axios.get('/api/admin/health-camps', { headers: { Authorization: `Bearer ${token}` } });
        setCamps(res.data.data || []);
      } else if (activeTab === 'grievances') {
        const res = await axios.get('/api/admin/grievances', { headers: { Authorization: `Bearer ${token}` } });
        setGrievances(res.data.data || []);
      } else if (activeTab === 'women') {
        const res = await axios.get('/api/admin/women_complaints', { headers: { Authorization: `Bearer ${token}` } });
        setWomenComplaints(res.data.data || []);
      } else if (activeTab === 'blood') {
        const res = await axios.get('/api/admin/blood_donors', { headers: { Authorization: `Bearer ${token}` } });
        setBloodDonors(res.data.data || []);
      } else if (activeTab === 'blogs') {
        const res = await axios.get('/api/admin/blogs', { headers: { Authorization: `Bearer ${token}` } });
        setBlogs(res.data.data || []);
      } else if (activeTab === 'jobs') {
        const res = await axios.get('/api/admin/jobs', { headers: { Authorization: `Bearer ${token}` } });
        setJobs(res.data.data || []);
      } else if (activeTab === 'campaigns') {
        const res = await axios.get('/api/admin/campaigns', { headers: { Authorization: `Bearer ${token}` } });
        setCampaigns(res.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching tab data:', error);
    }
    setLoading(false);
  };

  const fetchSettings = async () => {
    try {
      const res = await axios.get('/api/admin/settings');
      if (res.data.success) {
        setSettings(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
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

  const createAnnouncement = async () => {
    if (!newAnnouncement.title || !newAnnouncement.content) return alert('Fill all fields');
    try {
      await axios.post('/api/admin/announcements', newAnnouncement, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewAnnouncement({ title: '', content: '' });
      fetchAnnouncements();
    } catch (error) {
      console.error('Error creating announcement:', error);
    }
  };

  const deleteAnnouncement = async (id: string) => {
    try {
      await axios.delete(`/api/admin/announcements/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAnnouncements();
    } catch (error) {
      console.error('Error deleting announcement:', error);
    }
  };

  const updateVolunteerStatus = async (id: string, status: string) => {
    try {
      await axios.put(`/api/admin/volunteers/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData(); // refresh list
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const updateGrievanceStatus = async (id: string, status: string) => {
    try {
      await axios.put(`/api/admin/grievances/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (error) {
      console.error('Error updating grievance:', error);
    }
  };

  const tabs = [
    { id: 'users', label: 'Users Directory', icon: <Users size={20} /> },
    { id: 'volunteers', label: 'Volunteers', icon: <Shield size={20} /> },
    { id: 'donations', label: 'Donations', icon: <Heart size={20} /> },
    { id: 'grievances', label: 'Grievance Portal', icon: <AlertTriangle size={20} /> },
    { id: 'women', label: 'Women Empowerment', icon: <ActivitySquare size={20} /> },
    { id: 'blood', label: 'Blood Donation', icon: <Droplet size={20} /> },
    { id: 'cards', label: 'Jan Seva Cards', icon: <CreditCard size={20} /> },
    { id: 'camps', label: 'Health Camps', icon: <Stethoscope size={20} /> },
    { id: 'blogs', label: 'Articles & Blogs', icon: <FileText size={20} /> },
    { id: 'jobs', label: 'Jobs', icon: <Briefcase size={20} /> },
    { id: 'campaigns', label: 'Campaigns', icon: <MessageSquare size={20} /> },
    { id: 'visual', label: 'Home Screen / App Settings', icon: <Monitor size={20} /> },
    { id: 'announcements', label: 'Announcements', icon: <Bell size={20} /> },
    { id: 'scholarships', label: 'Scholarships', icon: <GraduationCap size={20} /> },
    { id: 'food_support', label: 'Food Support', icon: <Utensils size={20} /> },
    { id: 'medicine_support', label: 'Medicine Support', icon: <Pill size={20} /> },
    { id: 'education_aid', label: 'Education Aid', icon: <BookOpen size={20} /> },
    { id: 'senior_citizens', label: 'Senior Citizens', icon: <UserPlus size={20} /> },
    { id: 'animal_welfare', label: 'Animal Welfare', icon: <Dog size={20} /> },
    { id: 'environment', label: 'Environment', icon: <Leaf size={20} /> },
    { id: 'religious_culture', label: 'Religious & Culture', icon: <Church size={20} /> },
    { id: 'disaster_management', label: 'Disaster Management', icon: <AlertTriangle size={20} /> },
    { id: 'farmer_support', label: 'Farmer Support', icon: <Tractor size={20} /> },
    { id: 'government_schemes', label: 'Government Schemes', icon: <Landmark size={20} /> },
    { id: 'skills_training', label: 'Skills Training', icon: <Hammer size={20} /> },
    { id: 'global_guide', label: 'Global Guide', icon: <Globe2 size={20} /> },

  ];

  if (!user || (user.role !== 'admin' && user.role !== 'super_admin' && user.role !== 'superadmin')) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 text-gray-900">
        <div className="text-center space-y-4">
          <Shield size={64} className="mx-auto text-red-500" />
          <h1 className="text-3xl font-bold">Access Denied</h1>
          <p className="text-gray-500">You must be an administrator to view this page.</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    const customLoadingTabs = ['users', 'volunteers', 'donations', 'cards', 'grievances', 'women', 'blood', 'jobs'];
    if (loading && customLoadingTabs.includes(activeTab)) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      );
    }

    switch (activeTab) {
      case 'users':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-500">
                <thead className="bg-gray-50 text-gray-700 uppercase">
                  <tr>
                    <th className="px-6 py-4 font-semibold">User</th>
                    <th className="px-6 py-4 font-semibold">Contact</th>
                    <th className="px-6 py-4 font-semibold">Role</th>
                    <th className="px-6 py-4 font-semibold">Badges</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{u.name || 'N/A'}</td>
                      <td className="px-6 py-4">{u.phone || u.email || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${u.role === 'admin' || u.role.includes('super') ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'}`}>
                          {u.role || 'citizen'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {u.isVolunteer && <span className="mr-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">Volunteer</span>}
                        {u.isDonor && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">Donor</span>}
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No users found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'volunteers':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-500">
                <thead className="bg-gray-50 text-gray-700 uppercase">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Name</th>
                    <th className="px-6 py-4 font-semibold">Reg. No</th>
                    <th className="px-6 py-4 font-semibold">Contact</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {volunteers.map(v => (
                    <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{v.name}</td>
                      <td className="px-6 py-4 font-mono text-xs">{v.registration_number || 'N/A'}</td>
                      <td className="px-6 py-4">{v.mobile || v.email || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          v.status === 'approved' ? 'bg-green-100 text-green-800' : 
                          v.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {v.status || 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 flex gap-2">
                        {v.status !== 'approved' && (
                          <button onClick={() => updateVolunteerStatus(v.id, 'approved')} className="text-green-600 hover:bg-green-50 p-1.5 rounded-lg transition-colors" title="Approve">
                            <CheckCircle size={18} />
                          </button>
                        )}
                        {v.status !== 'rejected' && (
                          <button onClick={() => updateVolunteerStatus(v.id, 'rejected')} className="text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors" title="Reject">
                            <XCircle size={18} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {volunteers.length === 0 && (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No volunteers found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'donations':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-500">
                <thead className="bg-gray-50 text-gray-700 uppercase">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Date</th>
                    <th className="px-6 py-4 font-semibold">Donor Name</th>
                    <th className="px-6 py-4 font-semibold">Amount (₹)</th>
                    <th className="px-6 py-4 font-semibold">Receipt No</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {donations.map(d => (
                    <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">{new Date(d.created_at || d.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{d.donor_name}</td>
                      <td className="px-6 py-4 text-emerald-600 font-bold">₹{d.amount}</td>
                      <td className="px-6 py-4 font-mono text-xs">{d.receipt_number || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {d.status || 'Success'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {donations.length === 0 && (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No donations found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
        
      case 'cards':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-500">
                <thead className="bg-gray-50 text-gray-700 uppercase">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Name</th>
                    <th className="px-6 py-4 font-semibold">Card Type</th>
                    <th className="px-6 py-4 font-semibold">Mobile</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {cards.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{c.fullName || c.name}</td>
                      <td className="px-6 py-4 capitalize">{c.cardType}</td>
                      <td className="px-6 py-4">{c.mobile || c.phone}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                          {c.status || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {cards.length === 0 && (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No Jan Seva Cards found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'camps':
        return <GenericAdminTab endpoint="/api/admin/health-camps" title="Health Camps" columns={["title", "description", "date", "location"]} />;

      case 'grievances':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-500">
                <thead className="bg-gray-50 text-gray-700 uppercase">
                  <tr>
                    <th className="px-6 py-4 font-semibold">User</th>
                    <th className="px-6 py-4 font-semibold">Category</th>
                    <th className="px-6 py-4 font-semibold">Description</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {grievances.map(g => (
                    <tr key={g.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{g.user_id}</td>
                      <td className="px-6 py-4">{g.category}</td>
                      <td className="px-6 py-4 max-w-xs truncate">{g.description}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${g.status === 'Resolved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {g.status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {g.status !== 'Resolved' && (
                          <button onClick={() => updateGrievanceStatus(g.id, 'Resolved')} className="text-indigo-600 hover:text-indigo-900 font-medium text-xs">
                            Mark Resolved
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {grievances.length === 0 && (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No grievances found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'women':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-500">
                <thead className="bg-gray-50 text-gray-700 uppercase">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Date</th>
                    <th className="px-6 py-4 font-semibold">Submitter</th>
                    <th className="px-6 py-4 font-semibold">Subject</th>
                    <th className="px-6 py-4 font-semibold">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {womenComplaints.map(w => (
                    <tr key={w.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">{new Date(w.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{w.user_id}</td>
                      <td className="px-6 py-4">{w.subject}</td>
                      <td className="px-6 py-4 max-w-xs truncate">{w.description}</td>
                    </tr>
                  ))}
                  {womenComplaints.length === 0 && (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No complaints found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'blood':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-500">
                <thead className="bg-gray-50 text-gray-700 uppercase">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Name</th>
                    <th className="px-6 py-4 font-semibold">Blood Group</th>
                    <th className="px-6 py-4 font-semibold">Location</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bloodDonors.map(b => (
                    <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{b.name}</td>
                      <td className="px-6 py-4 font-bold text-red-600">{b.blood_group}</td>
                      <td className="px-6 py-4">{b.location}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${b.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {b.is_active ? 'Available' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {bloodDonors.length === 0 && (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No blood donors found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'blogs':
        return <GenericAdminTab endpoint="/api/admin/blogs" title="Articles & Blogs" columns={["title", "description", "author"]} />;

      case 'jobs':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-500">
                <thead className="bg-gray-50 text-gray-700 uppercase">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Title</th>
                    <th className="px-6 py-4 font-semibold">Company</th>
                    <th className="px-6 py-4 font-semibold">Location</th>
                    <th className="px-6 py-4 font-semibold">Posted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {jobs.map(j => (
                    <tr key={j.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{j.title}</td>
                      <td className="px-6 py-4">{j.company}</td>
                      <td className="px-6 py-4">{j.location}</td>
                      <td className="px-6 py-4">{new Date(j.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {jobs.length === 0 && (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No jobs found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'campaigns':
        return <GenericAdminTab endpoint="/api/admin/campaigns" title="Campaigns" columns={["title", "description", "goalAmount", "raisedAmount"]} />;

      case 'visual':
        return (
          <div className="max-w-4xl space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Monitor className="text-indigo-600" size={20} />
                Splash Screen Settings
              </h3>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Splash Animation Type</label>
                  <select
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                    value={settings.splash_animation || 'fade'}
                    onChange={(e) => saveSettings({ splash_animation: e.target.value })}
                  >
                    <option value="fade">Fade In</option>
                    <option value="slide">Slide Up</option>
                    <option value="zoom">Zoom Out</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Splash Duration (ms)</label>
                  <input
                    type="number"
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={settings.splash_duration || 2000}
                    onChange={(e) => saveSettings({ splash_duration: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <FileUpload 
                    label="App Logo URL"
                    defaultUrl={settings.splash_logo || ''}
                    onUploadSuccess={(url) => saveSettings({ splash_logo: url })}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <ImageIcon className="text-indigo-600" size={20} />
                Login Background Image
              </h3>
              <div className="space-y-4">
                <FileUpload 
                  label="Login Background Image"
                  defaultUrl={settings.login_bg_image || ''}
                  onUploadSuccess={(url) => saveSettings({ login_bg_image: url })}
                />
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <MessageSquare className="text-indigo-600" size={20} />
                Marquee Notice Configuration
              </h3>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Notice Text (English)</label>
                  <textarea
                    rows={3}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={settings.marquee_text_en || ''}
                    onChange={(e) => saveSettings({ marquee_text_en: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Notice Text (Hindi)</label>
                  <textarea
                    rows={3}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={settings.marquee_text_hi || ''}
                    onChange={(e) => saveSettings({ marquee_text_hi: e.target.value })}
                  />
                </div>
                <div className="flex items-center gap-3 bg-indigo-50 text-indigo-800 p-4 rounded-lg border border-indigo-100">
                  <input
                    type="checkbox"
                    id="marqueeEnabled"
                    checked={settings.marquee_enabled ?? true}
                    onChange={(e) => saveSettings({ marquee_enabled: e.target.checked })}
                    className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                  />
                  <label htmlFor="marqueeEnabled" className="font-medium">Enable Marquee Notice on Home Screen</label>
                </div>
              </div>
            </div>
          </div>
        );

      case 'announcements':
        return <GenericAdminTab endpoint="/api/admin/announcements" title="Announcements" />;
      case 'scholarships': return <GenericAdminTab endpoint="/api/admin/scholarships" title="Scholarships" columns={['title', 'description']} />;
      case 'food_support': return <GenericAdminTab endpoint="/api/admin/food_support" title="Food Support" columns={['title', 'description']} />;
      case 'medicine_support': return <GenericAdminTab endpoint="/api/admin/medicine_support" title="Medicine Support" columns={['title', 'description']} />;
      case 'education_aid': return <GenericAdminTab endpoint="/api/admin/education_aid" title="Education Aid" columns={['title', 'description']} />;
      case 'senior_citizens': return <GenericAdminTab endpoint="/api/admin/senior_citizens" title="Senior Citizens" columns={['title', 'description']} />;
      case 'animal_welfare': return <GenericAdminTab endpoint="/api/admin/animal_welfare" title="Animal Welfare" columns={['title', 'description']} />;
      case 'environment': return <GenericAdminTab endpoint="/api/admin/environment" title="Environment" columns={['title', 'description']} />;
      case 'religious_culture': return <GenericAdminTab endpoint="/api/admin/religious_culture" title="Religious & Culture" columns={['title', 'description']} />;
      case 'disaster_management': return <GenericAdminTab endpoint="/api/admin/disaster_management" title="Disaster Management" columns={['title', 'description']} />;
      case 'farmer_support': return <GenericAdminTab endpoint="/api/admin/farmer_support" title="Farmer Support" columns={['title', 'description']} />;
      case 'government_schemes': return <GenericAdminTab endpoint="/api/admin/government_schemes" title="Government Schemes" columns={['title', 'description']} />;
      case 'skills_training': return <GenericAdminTab endpoint="/api/admin/skills_training" title="Skills Training" columns={['title', 'description']} />;
      case 'global_guide': return <GenericAdminTab endpoint="/api/admin/global_guide" title="Global Guide" columns={['title', 'description']} />;

      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} lg:static lg:w-72`}>
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 text-indigo-600 mb-1">
              <Database className="w-7 h-7" />
              <h1 className="text-xl font-extrabold tracking-tight text-gray-900">Admin Control</h1>
            </div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">God Mode Enabled</p>
          </div>
          <button className="lg:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <div className={activeTab === tab.id ? 'text-indigo-600' : 'text-gray-400'}>
                {tab.icon}
              </div>
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-3">
            <p className="text-xs font-medium text-gray-500 mb-1 uppercase">Logged in as</p>
            <p className="text-sm font-bold text-gray-900 truncate">{user?.name || user?.id || 'Administrator'}</p>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-red-600 font-medium rounded-xl hover:bg-red-50 hover:border-red-200 transition-all shadow-sm"
          >
            <LogOut size={18} />
            Secure Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 py-4 px-6 flex items-center gap-4 lg:hidden sticky top-0 z-30 shadow-sm">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>
          <h2 className="text-lg font-bold text-gray-900">
            {tabs.find(t => t.id === activeTab)?.label}
          </h2>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="hidden lg:block mb-8">
            <h2 className="text-2xl font-extrabold text-gray-900">
              {tabs.find(t => t.id === activeTab)?.label}
            </h2>
            <p className="text-sm text-gray-500 font-medium mt-1">Manage and configure system data</p>
          </div>
          
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </main>

      {/* Saving Indicator */}
      {saving && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-bounce z-50">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
          <span className="text-sm font-semibold">Syncing changes...</span>
        </div>
      )}
    </div>
  );
}




