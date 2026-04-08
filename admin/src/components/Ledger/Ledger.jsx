import React, { useEffect, useMemo, useState } from 'react';
import { adminAPI } from '../../api/apiService';
import { 
  Loader2, 
  AlertCircle, 
  Search, 
  User, 
  Phone,
  Truck,
  RefreshCw
} from 'lucide-react';

// Helper: convert YYYY-MM-DD to ISO start-of-day UTC
const toISOStartOfDayUTC = (dateStr) => {
  if (!dateStr) return null;
  return new Date(`${dateStr}T00:00:00.000Z`).toISOString();
};

// Default date: today (YYYY-MM-DD)
const todayLocalStr = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// Format date for display
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const Ledger = () => {
  // Customers for dropdown
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(true);

  // Ledger data table state
  const [ledgerData, setLedgerData] = useState([]);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [tableFilters, setTableFilters] = useState({
    from_date: todayLocalStr(),
    to_date: todayLocalStr(),
    user_id: ''
  });

  // UI state
  const [message, setMessage] = useState({ type: '', text: '' });

  // Fetch customers
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await adminAPI.getCustomers();
        const data = Array.isArray(res.data) ? res.data : [];
        setCustomers(data);
      } catch (err) {
        console.error('Failed to load customers:', err);
      } finally {
        setCustomersLoading(false);
      }
    };
    fetchCustomers();
    fetchLedgerData();
  }, []);

  // Fetch ledger data
  const fetchLedgerData = async () => {
    setLedgerLoading(true);
    try {
      const params = {};
      if (tableFilters.from_date) params.from_date = tableFilters.from_date;
      if (tableFilters.to_date) params.to_date = tableFilters.to_date;
      if (tableFilters.user_id) params.user_id = tableFilters.user_id;

      const res = await adminAPI.getLedger(params);
      setLedgerData(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load ledger data:', err);
      setMessage({ type: 'error', text: 'Failed to load ledger data' });
    } finally {
      setLedgerLoading(false);
    }
  };

  const handleTableFilter = () => {
    fetchLedgerData();
  };

  const handleResetFilters = () => {
    setTableFilters({
      from_date: todayLocalStr(),
      to_date: todayLocalStr(),
      user_id: ''
    });
  };

  // Calculate totals for table
  const totals = useMemo(() => {
    return ledgerData.reduce((acc, entry) => {
      acc.totalAmount += entry.totalAmount || 0;
      return acc;
    }, { totalAmount: 0 });
  }, [ledgerData]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Delivery Ledger</h1>
        <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
           <Truck className="w-5 h-5 text-blue-600" />
           <span className="font-bold text-blue-900">Total Revenue: ₹{totals.totalAmount.toFixed(2)}</span>
        </div>
      </div>

      {message.text && (
        <div className={`p-4 rounded-lg flex items-center gap-2 bg-red-50 border border-red-200 text-red-700`}>
          <AlertCircle className="w-5 h-5" />
          <span>{message.text}</span>
        </div>
      )}

      <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Search className="w-4 h-4" /> Search & Filters
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Date
                </label>
                <input
                  type="date"
                  value={tableFilters.from_date}
                  onChange={(e) => setTableFilters({ ...tableFilters, from_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To Date
                </label>
                <input
                  type="date"
                  value={tableFilters.to_date}
                  onChange={(e) => setTableFilters({ ...tableFilters, to_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer
                </label>
                <select
                  value={tableFilters.user_id}
                  onChange={(e) => setTableFilters({ ...tableFilters, user_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">All Customers</option>
                  {customers.map((customer) => (
                    <option key={customer._id || customer.id} value={customer._id || customer.id}>
                      {customer.name} - {customer.phone}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end gap-2">
                <button
                  onClick={handleTableFilter}
                  disabled={ledgerLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-bold"
                >
                  {ledgerLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply Filter'}
                </button>
                <button
                  onClick={handleResetFilters}
                  className="p-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 bg-white"
                  title="Reset"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">
                Delivery Records ({ledgerData.length})
              </h3>
              <div className="text-sm text-gray-500">
                Showing delivered orders for selected range
              </div>
            </div>

            {ledgerLoading ? (
              <div className="p-12 text-center">
                <Loader2 className="w-10 h-10 animate-spin mx-auto text-blue-600" />
                <p className="mt-4 text-gray-600 font-medium">Fetching delivery records...</p>
              </div>
            ) : ledgerData.length === 0 ? (
              <div className="p-12 text-center">
                <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Truck className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-500 font-bold">No deliveries found for this period</p>
                <button onClick={handleResetFilters} className="mt-4 text-blue-600 hover:underline text-sm font-bold">Reset filters</button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">
                        Date & Time
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">
                        Customer Details
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">
                        Delivered Items
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">
                        Amount (₹)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-50">
                    {ledgerData.map((entry) => (
                      <tr key={entry._id} className="hover:bg-blue-50/30 transition">
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900">{formatDate(entry.date)}</div>
                          <div className="text-[10px] text-gray-400 font-bold">
                            {new Date(entry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center mr-3 border border-blue-100">
                                <User className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                                <div className="text-sm font-black text-gray-900">{entry.user_id?.name || 'Unknown'}</div>
                                <div className="text-xs text-gray-500 font-medium flex items-center gap-1">
                                    <Phone className="w-3 h-3" /> {entry.user_id?.phone || 'N/A'}
                                </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-xs font-bold text-gray-700 bg-gray-50 p-2 rounded-lg border border-gray-100 inline-block min-w-[200px]">
                            {entry.label}
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="text-sm font-black text-green-700">₹{entry.totalAmount?.toFixed(2) || '0.00'}</div>
                          <div className="text-[9px] font-black text-gray-400 uppercase">Paid via Wallet</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t border-gray-100">
                    <tr>
                      <td colSpan="3" className="px-6 py-4 text-sm font-black text-gray-900 text-right uppercase tracking-widest">
                        Grand Total:
                      </td>
                      <td className="px-6 py-4 text-sm font-black text-blue-900 bg-blue-50">
                        ₹{totals.totalAmount.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>
    </div>
  );
};

export default Ledger;