import React, { useState } from 'react';
import { adminAPI } from '../../api/apiService';
import { Video, Save, AlertCircle } from 'lucide-react';

const Livestreams = () => {
  const [urls, setUrls] = useState({
    analyzer_cam_url: '',
    packing_cam_url: '',
    combo_cam_url: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await adminAPI.updateLivestreams(urls);
      setMessage({ type: 'success', text: 'Livestream URLs updated successfully!' });
    } catch (error) {
      console.error('Error updating livestreams:', error);
      setMessage({ type: 'error', text: 'Failed to update livestream URLs' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Livestream Management</h1>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <Video className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-800">Update Camera URLs</h2>
        </div>

        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            <AlertCircle className="w-5 h-5" />
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Analyzer Camera URL
            </label>
            <input
              type="url"
              value={urls.analyzer_cam_url}
              onChange={(e) => setUrls({ ...urls, analyzer_cam_url: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="https://example.com/analyzer-stream"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Packing Camera URL
            </label>
            <input
              type="url"
              value={urls.packing_cam_url}
              onChange={(e) => setUrls({ ...urls, packing_cam_url: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="https://example.com/packing-stream"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Combo Camera URL
            </label>
            <input
              type="url"
              value={urls.combo_cam_url}
              onChange={(e) => setUrls({ ...urls, combo_cam_url: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="https://example.com/combo-stream"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            <span>{loading ? 'Updating...' : 'Update URLs'}</span>
          </button>
        </form>

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Current Livestream URLs:</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p><strong>Analyzer:</strong> {urls.analyzer_cam_url || 'Not set'}</p>
            <p><strong>Packing:</strong> {urls.packing_cam_url || 'Not set'}</p>
            <p><strong>Combo:</strong> {urls.combo_cam_url || 'Not set'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Livestreams;