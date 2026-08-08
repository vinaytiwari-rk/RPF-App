import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import FileUpload from '../FileUpload';
import { CmsConfig } from '../../context/AppContext';
import { Save, User, Quote, Activity, FileText } from 'lucide-react';
import { Skeleton } from '../ui/Skeleton';

export const CmsSettings = () => {
    const { token } = useAuth();
    const [cms, setCms] = useState<CmsConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchCms = async () => {
            try {
                const res = await axios.get('/api/cms');
                if (res.data.success) {
                    setCms(res.data.cms);
                }
            } catch (err) {
                console.error("Failed to load CMS data", err);
            }
            setLoading(false);
        };
        fetchCms();
    }, []);

    const handleChange = (key: string, value: any) => {
        if (!cms) return;
        setCms({ ...cms, [key]: value });
    };

    const handleOffsetChange = (key: string, value: string) => {
        if (!cms) return;
        setCms({
            ...cms,
            statsOffsets: {
                ...cms.statsOffsets,
                beneficiaries: cms.statsOffsets?.beneficiaries || 0,
                volunteers: cms.statsOffsets?.volunteers || 0,
                healthCamps: cms.statsOffsets?.healthCamps || 0,
                campaigns: cms.statsOffsets?.campaigns || 0,
                [key]: parseInt(value) || 0
            }
        });
    };

    const handleSave = async () => {
        if (!cms) return;
        setSaving(true);
        try {
            await axios.post('/api/cms', cms, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('CMS Data saved successfully! Refresh page to see changes.');
        } catch (err) {
            console.error("Save failed", err);
            alert('Failed to save CMS Data.');
        }
        setSaving(false);
    };

    if (loading || !cms) {
        return <div className="space-y-4"><Skeleton className="h-10" /><Skeleton className="h-[200px]" /></div>;
    }

    return (
        <div className="max-w-4xl space-y-6 pb-20">
            <div className="flex justify-end">
                <button 
                    onClick={handleSave} 
                    disabled={saving}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                    <Save size={18} />
                    {saving ? "Saving..." : "Save All Changes"}
                </button>
            </div>

            {/* General Site Config */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <FileText className="text-indigo-600" size={20} />
                    General Site Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="col-span-2">
                        <FileUpload 
                            label="Site Logo Image URL"
                            defaultUrl={cms.logoImgUrl || ''}
                            onUploadSuccess={(url) => handleChange('logoImgUrl', url)}
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">About Text (English)</label>
                        <textarea className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-indigo-500" rows={3} value={cms.aboutTextEn || ''} onChange={(e) => handleChange('aboutTextEn', e.target.value)} />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">About Text (Hindi)</label>
                        <textarea className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-indigo-500" rows={3} value={cms.aboutTextHi || ''} onChange={(e) => handleChange('aboutTextHi', e.target.value)} />
                    </div>
                </div>
            </div>

            {/* Founder Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <User className="text-indigo-600" size={20} />
                    Founder Profile
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Founder Name</label>
                        <input type="text" className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-indigo-500" value={cms.founderName || ''} onChange={(e) => handleChange('founderName', e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Founder Designation</label>
                        <input type="text" className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-indigo-500" value={cms.founderDesignation || ''} onChange={(e) => handleChange('founderDesignation', e.target.value)} />
                    </div>
                    <div className="col-span-2">
                        <FileUpload 
                            label="Founder Image URL"
                            defaultUrl={cms.founderImgUrl || ''}
                            onUploadSuccess={(url) => handleChange('founderImgUrl', url)}
                        />
                    </div>
                </div>
            </div>

            {/* Quotes */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Quote className="text-indigo-600" size={20} />
                    Quotes & Messaging
                </h3>
                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Quote of the Day (English)</label>
                        <textarea className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-indigo-500" rows={2} value={cms.quoteOfTheDayEn || ''} onChange={(e) => handleChange('quoteOfTheDayEn', e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Quote of the Day (Hindi)</label>
                        <textarea className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-indigo-500" rows={2} value={cms.quoteOfTheDayHi || ''} onChange={(e) => handleChange('quoteOfTheDayHi', e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Our Impact - Bottom Text (English)</label>
                        <textarea className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-indigo-500" rows={2} value={cms.impactBottomTextEn || ''} onChange={(e) => handleChange('impactBottomTextEn', e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Our Impact - Bottom Text (Hindi)</label>
                        <textarea className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-indigo-500" rows={2} value={cms.impactBottomTextHi || ''} onChange={(e) => handleChange('impactBottomTextHi', e.target.value)} />
                    </div>
                </div>
            </div>

            {/* Impact Stats Offset */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Activity className="text-indigo-600" size={20} />
                    Impact Statistics Offset (Add dummy numbers)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Beneficiaries Offset</label>
                        <input type="number" className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-indigo-500" value={cms.statsOffsets?.beneficiaries || 0} onChange={(e) => handleOffsetChange('beneficiaries', e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Volunteers Offset</label>
                        <input type="number" className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-indigo-500" value={cms.statsOffsets?.volunteers || 0} onChange={(e) => handleOffsetChange('volunteers', e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Health Camps Offset</label>
                        <input type="number" className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-indigo-500" value={cms.statsOffsets?.healthCamps || 0} onChange={(e) => handleOffsetChange('healthCamps', e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Campaigns Offset</label>
                        <input type="number" className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-indigo-500" value={cms.statsOffsets?.campaigns || 0} onChange={(e) => handleOffsetChange('campaigns', e.target.value)} />
                    </div>
                </div>
            </div>
        </div>
    );
};
