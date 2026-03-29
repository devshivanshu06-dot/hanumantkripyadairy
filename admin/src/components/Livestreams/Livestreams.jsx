import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api/apiService';
import { Video, Save, AlertCircle, Droplets, Thermometer, FlaskConical } from 'lucide-react';

const Livestreams = () => {
  const [data, setData] = useState({
    youtube_url: '',
    fat: '',
    snf: '',
    ph: '',
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchLivestreams();
  }, []);

  const fetchLivestreams = async () => {
    try {
      const res = await adminAPI.getLivestreams();
      if (res.data) {
        setData({
          youtube_url: res.data.youtube_url || '',
          fat: res.data.fat?.toString() || '',
          snf: res.data.snf?.toString() || '',
          ph: res.data.ph?.toString() || '',
        });
      }
    } catch (error) {
      console.error('Error fetching livestreams:', error);
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await adminAPI.updateLivestreams({
        ...data,
        fat: parseFloat(data.fat) || 0,
        snf: parseFloat(data.snf) || 0,
        ph: parseFloat(data.ph) || 0,
      });
      setMessage({ type: 'success', text: 'Livestream settings updated successfully!' });
    } catch (error) {
      console.error('Error updating livestreams:', error);
      setMessage({ type: 'error', text: 'Failed to update livestream settings' });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Transparency Feed Management</h1>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <Video className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-800">Update Configuration</h2>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-bold text-gray-700 border-b pb-2">Transparency Video</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">YouTube URL or ID</label>
                <input
                  type="text"
                  value={data.youtube_url}
                  onChange={(e) => setData({ ...data, youtube_url: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="https://youtube.com/watch?v=... (Optional)"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-gray-700 border-b pb-2">Milk Quality Parameters</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-blue-500" /> Fat (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={data.fat}
                  onChange={(e) => setData({ ...data, fat: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="e.g. 4.7"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-blue-500" /> SNF (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={data.snf}
                  onChange={(e) => setData({ ...data, snf: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="e.g. 8.4"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-blue-500" /> pH Value
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={data.ph}
                  onChange={(e) => setData({ ...data, ph: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="e.g. 6.7"
                  required
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full md:w-auto px-10 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 disabled:opacity-50"
            >
              <Save className="w-6 h-6" />
              <span>{loading ? 'Saving Changes...' : 'Save Configuration'}</span>
            </button>
          </div>
        </form>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-bold text-blue-900 mb-4">Current Transparency Feed Settings:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 text-sm text-blue-800">
            <p><strong>YouTube Feed:</strong> {data.youtube_url || 'Not set'}</p>
          </div>
          <div className="space-y-2 text-sm text-blue-800">
            <p><strong>Fat:</strong> {data.fat || '0'}%</p>
            <p><strong>SNF:</strong> {data.snf || '0'}%</p>
            <p><strong>pH:</strong> {data.ph || '0'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Livestreams;