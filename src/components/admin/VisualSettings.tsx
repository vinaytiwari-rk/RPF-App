import React from 'react';
import { Monitor, Image as ImageIcon, MessageSquare } from 'lucide-react';
import FileUpload from '../FileUpload';

interface VisualSettingsProps {
    settings: any;
    saveSettings: (updates: any) => void;
}

export const VisualSettings: React.FC<VisualSettingsProps> = ({ settings, saveSettings }) => {
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
};
