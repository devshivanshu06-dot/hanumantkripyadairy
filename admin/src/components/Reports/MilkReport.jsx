import React, { useMemo, useState } from 'react';
import { adminAPI } from '../../api/apiService';
import { Calendar, Download, TrendingUp, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

// Helper to format Date -> "yyyy-MM-dd"
const fmt = (d) => format(d, 'yyyy-MM-dd');

const todayStr = fmt(new Date());
const sevenDaysAgoStr = fmt(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)); // inclusive last 7 days

const MilkReport = () => {
  const [fromDate, setFromDate] = useState(sevenDaysAgoStr);
  const [toDate, setToDate] = useState(todayStr);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Compute derived stats and sorted date entries
  const { entries, maxForScale, totalLitres, avgPerDay, daysCount } = useMemo(() => {
    const entries = Object.entries(report?.dates || {}).sort(
      (a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime()
    );
    const total = report?.total_litres_delivered ?? entries.reduce((s, [, v]) => s + (Number(v) || 0), 0);
    const max = entries.reduce((m, [, v]) => Math.max(m, Number(v) || 0), 0);
    const count = entries.length || 0;
    const avg = count ? total / count : 0;
    return {
      entries,
      maxForScale: max || 1,
      totalLitres: total || 0,
      avgPerDay: avg,
      daysCount: count,
    };
  }, [report]);

  const applyQuickRange = (type) => {
    const now = new Date();
    let from = new Date();
    let to = new Date();
    if (type === '7') {
      from = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);
      to = now;
    } else if (type === '30') {
      from = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000);
      to = now;
    } else if (type === 'month') {
      from = new Date(now.getFullYear(), now.getMonth(), 1);
      to = now;
    }
    setFromDate(fmt(from));
    setToDate(fmt(to));
  };

  const handleGenerateReport = async (e) => {
    e?.preventDefault?.();
    setError('');
    if (!fromDate || !toDate) {
      setError('Please select both From and To dates.');
      return;
    }
    if (new Date(fromDate) > new Date(toDate)) {
      setError('From date cannot be after To date.');
      return;
    }

    setLoading(true);
    try {
      const res = await adminAPI.getMilkReport(fromDate, toDate);
      setReport(res.data || { total_litres_delivered: 0, dates: {} });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to fetch report');
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (!report) return;
    const rows = [
      ['Milk Report'],
      [`From`, fromDate],
      [`To`, toDate],
      [],
      ['Date', 'Litres Delivered'],
      ...Object.entries(report.dates || {}).sort(
        (a, b) => new Date(a[0]) - new Date(b[0])
      ),
      [],
      ['Total Litres Delivered', report.total_litres_delivered ?? totalLitres],
      ['Average Per Day', daysCount ? avgPerDay.toFixed(2) : '0.00'],
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `milk-report_${fromDate}_to_${toDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Milk Delivery Reports</h1>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-800">Filter by Date</h2>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleGenerateReport} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              max={toDate || todayStr}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              min={fromDate}
              max={todayStr}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            />
          </div>

          <div className="flex items-end gap-3">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Generating...
                </span>
              ) : (
                'Generate'
              )}
            </button>
            <button
              type="button"
              onClick={() => applyQuickRange('7')}
              className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Last 7 days
            </button>
            <button
              type="button"
              onClick={() => applyQuickRange('30')}
              className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Last 30 days
            </button>
            <button
              type="button"
              onClick={() => applyQuickRange('month')}
              className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
            >
              This month
            </button>
          </div>
        </form>
      </div>

      {/* Stats + Download */}
      {report && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <p className="text-gray-600 text-sm font-medium">Total Litres Delivered</p>
            <p className="text-3xl font-bold text-gray-800 mt-2">{(report.total_litres_delivered ?? totalLitres).toFixed(2)} L</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <p className="text-gray-600 text-sm font-medium">Average per Day</p>
            <p className="text-3xl font-bold text-gray-800 mt-2">{avgPerDay.toFixed(2)} L</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Days</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{daysCount}</p>
            </div>
            <button
              onClick={downloadCSV}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>
      )}

      {/* Chart-like bars and table */}
      {report && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-800">Daily Breakdown</h3>
          </div>

          {entries.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No data for selected range.</div>
          ) : (
            <div className="space-y-4">
              {/* Simple horizontal bar visualization per day (no external chart lib) */}
              <div className="space-y-2">
                {entries.map(([date, litres]) => {
                  const val = Number(litres) || 0;
                  const widthPct = Math.max(2, Math.min(100, Math.round((val / maxForScale) * 100)));
                  return (
                    <div key={date} className="flex items-center gap-3">
                      <div className="w-28 text-sm text-gray-600">{date}</div>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div
                          className="h-3 bg-blue-500 rounded-full"
                          style={{ width: `${widthPct}%` }}
                          title={`${val} L`}
                        />
                      </div>
                      <div className="w-20 text-right text-sm font-medium text-gray-700">{val.toFixed(2)} L</div>
                    </div>
                  );
                })}
              </div>

              {/* Table */}
              <div className="overflow-x-auto mt-6">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 text-gray-600 font-semibold">Date</th>
                      <th className="text-left py-3 px-4 text-gray-600 font-semibold">Litres Delivered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map(([date, litres]) => (
                      <tr key={date} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-800">{date}</td>
                        <td className="py-3 px-4 text-gray-800">{Number(litres || 0).toFixed(2)} L</td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50">
                      <td className="py-3 px-4 font-semibold text-gray-800">Total</td>
                      <td className="py-3 px-4 font-semibold text-gray-800">
                        {(report.total_litres_delivered ?? totalLitres).toFixed(2)} L
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MilkReport;
