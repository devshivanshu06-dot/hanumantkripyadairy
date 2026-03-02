// import React, { useEffect, useMemo, useState } from 'react';
// import { adminAPI } from '../../api/apiService';
// import { CheckCircle2, ClipboardList, Loader2, AlertCircle } from 'lucide-react';

// // Helper: convert YYYY-MM-DD to ISO start-of-day UTC
// const toISOStartOfDayUTC = (dateStr) => {
//   if (!dateStr) return null;
//   // Force midnight UTC to avoid timezone shifts on backend
//   return new Date(`${dateStr}T00:00:00.000Z`).toISOString();
// };

// // Default date: today (YYYY-MM-DD)
// const todayLocalStr = () => {
//   const d = new Date();
//   const yyyy = d.getFullYear();
//   const mm = String(d.getMonth() + 1).padStart(2, '0');
//   const dd = String(d.getDate()).padStart(2, '0');
//   return `${yyyy}-${mm}-${dd}`;
// };

// // Validate Mongo ObjectId (24 hex chars)
// const isValidObjectId = (v) => /^[a-fA-F0-9]{24}$/.test(String(v || '').trim());

// const Ledger = () => {
//   // Customers for dropdown
//   const [customers, setCustomers] = useState([]);
//   const [customersLoading, setCustomersLoading] = useState(true);
//   const [customerSearch, setCustomerSearch] = useState('');

//   // Form state
//   const [form, setForm] = useState({
//     user_id: '',
//     date: todayLocalStr(),
//     litres_delivered: '',
//     balance: '',
//     bottle_returned: false,
//   });

//   // UI state
//   const [submitting, setSubmitting] = useState(false);
//   const [message, setMessage] = useState({ type: '', text: '' });

//   useEffect(() => {
//     const fetchCustomers = async () => {
//       try {
//         const res = await adminAPI.getCustomers();
//         const data = Array.isArray(res.data) ? res.data : [];
//         setCustomers(data);
//       } catch (err) {
//         console.error('Failed to load customers:', err);
//         setMessage({ type: 'error', text: 'Failed to load customers' });
//       } finally {
//         setCustomersLoading(false);
//       }
//     };
//     fetchCustomers();
//   }, []);

//   // Filtered customers based on search box
//   const filteredCustomers = useMemo(() => {
//     const q = customerSearch.trim().toLowerCase();
//     if (!q) return customers;
//     return customers.filter((c) => {
//       const name = (c.name || '').toLowerCase();
//       const phone = (c.phone || '').toLowerCase();
//       return name.includes(q) || phone.includes(q);
//     });
//   }, [customers, customerSearch]);

//   const validate = () => {
//     if (!form.user_id) return 'Please select a customer.';
//     if (!isValidObjectId(form.user_id)) return 'Invalid customer id (expected Mongo ObjectId).';
//     if (!form.date) return 'Please select a date.';
//     const litres = Number(form.litres_delivered);
//     if (!Number.isFinite(litres) || litres < 0) return 'Litres delivered must be a number >= 0.';
//     const balance = Number(form.balance);
//     if (!Number.isFinite(balance)) return 'Balance must be a number (0 if none).';
//     return '';
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setMessage({ type: '', text: '' });

//     const error = validate();
//     if (error) {
//       setMessage({ type: 'error', text: error });
//       return;
//     }

//     const payload = {
//       user_id: form.user_id, // Mongo _id string
//       date: toISOStartOfDayUTC(form.date),
//       litres_delivered: Number(form.litres_delivered),
//       balance: Number(form.balance),
//       bottle_returned: Boolean(form.bottle_returned),
//     };

//     setSubmitting(true);
//     try {
//       await adminAPI.addLedgerEntry(payload);
//       setMessage({ type: 'success', text: 'Ledger entry added successfully!' });
//       // Reset some fields, keep customer and date for faster multiple entries
//       setForm((prev) => ({
//         ...prev,
//         litres_delivered: '',
//         balance: '',
//         bottle_returned: false,
//       }));
//     } catch (err) {
//       console.error('Failed to add ledger entry:', err);
//       setMessage({
//         type: 'error',
//         text: err.response?.data?.message || 'Failed to add ledger entry',
//       });
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <h1 className="text-3xl font-bold text-gray-800">Ledger Management</h1>
//       </div>

//       <div className="bg-white rounded-xl shadow-md p-6">
//         <div className="flex items-center gap-3 mb-6">
//           <ClipboardList className="w-6 h-6 text-blue-600" />
//           <h2 className="text-xl font-semibold text-gray-800">Add Delivery Entry</h2>
//         </div>

//         {message.text && (
//           <div
//             className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
//               message.type === 'success'
//                 ? 'bg-green-50 border border-green-200 text-green-700'
//                 : 'bg-red-50 border border-red-200 text-red-700'
//             }`}
//           >
//             {message.type === 'success' ? (
//               <CheckCircle2 className="w-5 h-5" />
//             ) : (
//               <AlertCircle className="w-5 h-5" />
//             )}
//             <span>{message.text}</span>
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-6">
//           {/* Customer select with search */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Customer
//             </label>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
//               <input
//                 type="text"
//                 value={customerSearch}
//                 onChange={(e) => setCustomerSearch(e.target.value)}
//                 placeholder="Search customers by name or phone..."
//                 className="col-span-1 md:col-span-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
//               />
//               <select
//                 value={form.user_id}
//                 onChange={(e) => setForm({ ...form, user_id: e.target.value })}
//                 disabled={customersLoading}
//                 className="col-span-1 md:col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
//                 required
//               >
//                 <option value="">{customersLoading ? 'Loading...' : 'Select a customer'}</option>
//                 {filteredCustomers.map((c) => {
//                   const userId = c._id || c.id; // Prefer Mongo _id
//                   if (!userId) return null; // skip entries without an id
//                   return (
//                     <option key={userId} value={userId}>
//                       {(c.name || 'Unnamed')}{c.phone ? ` - ${c.phone}` : ''}{c.is_active === false ? ' (inactive)' : ''}
//                     </option>
//                   );
//                 })}
//               </select>
//             </div>
//           </div>

//           {/* Date, Litres, Balance */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Date
//               </label>
//               <input
//                 type="date"
//                 value={form.date}
//                 onChange={(e) => setForm({ ...form, date: e.target.value })}
//                 max={todayLocalStr()}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Litres Delivered
//               </label>
//               <input
//                 type="number"
//                 step="0.1"
//                 min="0"
//                 placeholder="e.g., 2"
//                 value={form.litres_delivered}
//                 onChange={(e) => setForm({ ...form, litres_delivered: e.target.value })}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Balance (₹)
//               </label>
//               <input
//                 type="number"
//                 step="0.01"
//                 placeholder="e.g., 100"
//                 value={form.balance}
//                 onChange={(e) => setForm({ ...form, balance: e.target.value })}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
//                 required
//               />
//             </div>
//           </div>

//           {/* Bottle returned */}
//           <div className="flex items-center gap-3">
//             <input
//               id="bottle_returned"
//               type="checkbox"
//               checked={form.bottle_returned}
//               onChange={(e) => setForm({ ...form, bottle_returned: e.target.checked })}
//               className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
//             />
//             <label htmlFor="bottle_returned" className="text-sm text-gray-700">
//               Bottle returned
//             </label>
//           </div>

//           {/* Actions */}
//           <div className="flex items-center gap-3">
//             <button
//               type="submit"
//               disabled={submitting}
//               className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {submitting ? (
//                 <span className="flex items-center gap-2">
//                   <Loader2 className="w-4 h-4 animate-spin" /> Saving...
//                 </span>
//               ) : (
//                 'Add Entry'
//               )}
//             </button>
//             <button
//               type="button"
//               onClick={() =>
//                 setForm({
//                   user_id: '',
//                   date: todayLocalStr(),
//                   litres_delivered: '',
//                   balance: '',
//                   bottle_returned: false,
//                 })
//               }
//               className="px-6 py-2.5 border rounded-lg text-gray-700 hover:bg-gray-50"
//             >
//               Reset
//             </button>
//           </div>
//         </form>
//       </div>

//       <div className="text-sm text-gray-500">
//         Note: The date is saved in UTC as start of day. Ensure your backend expects ISO strings.
//       </div>
//     </div>
//   );
// };

// export default Ledger;



import React, { useEffect, useMemo, useState } from 'react';
import { adminAPI } from '../../api/apiService';
import { 
  CheckCircle2, 
  ClipboardList, 
  Loader2, 
  AlertCircle, 
  Search, 
  User, 
  Phone,
  Plus,
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
  const [customerSearch, setCustomerSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Form state
  const [form, setForm] = useState({
    user_id: '',
    date: todayLocalStr(),
    litres_delivered: '',
    balance: '',
    bottle_returned: false,
  });

  // Selected customer name for display
  const [selectedCustomerName, setSelectedCustomerName] = useState('');

  // Ledger data table state
  const [ledgerData, setLedgerData] = useState([]);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [tableFilters, setTableFilters] = useState({
    from_date: '',
    to_date: '',
    user_id: ''
  });

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('add'); // 'add' or 'view'

  // Fetch customers
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await adminAPI.getCustomers();
        const data = Array.isArray(res.data) ? res.data : [];
        setCustomers(data);
      } catch (err) {
        console.error('Failed to load customers:', err);
        setMessage({ type: 'error', text: 'Failed to load customers' });
      } finally {
        setCustomersLoading(false);
      }
    };
    fetchCustomers();
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

  // Load ledger data when tab changes to view
  useEffect(() => {
    if (activeTab === 'view') {
      fetchLedgerData();
    }
  }, [activeTab]);

  // Filtered customers based on search box
  const filteredCustomers = useMemo(() => {
    const q = customerSearch.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) => {
      const name = (c.name || '').toLowerCase();
      const phone = (c.phone || '').toLowerCase();
      return name.includes(q) || phone.includes(q);
    });
  }, [customers, customerSearch]);

  const handleCustomerSelect = (customer) => {
    setForm({ ...form, user_id: customer._id || customer.id });
    setSelectedCustomerName(`${customer.name} - ${customer.phone}`);
    setCustomerSearch('');
    setShowDropdown(false);
  };

  const validate = () => {
    if (!form.user_id) return 'Please select a customer.';
    if (!form.date) return 'Please select a date.';
    const litres = Number(form.litres_delivered);
    if (!Number.isFinite(litres) || litres < 0) return 'Litres delivered must be a number >= 0.';
    const balance = Number(form.balance);
    if (!Number.isFinite(balance)) return 'Balance must be a number (0 if none).';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    const error = validate();
    if (error) {
      setMessage({ type: 'error', text: error });
      return;
    }

    const payload = {
      user_id: form.user_id,
      date: toISOStartOfDayUTC(form.date),
      litres_delivered: Number(form.litres_delivered),
      balance: Number(form.balance),
      bottle_returned: Boolean(form.bottle_returned),
    };

    setSubmitting(true);
    try {
      await adminAPI.addLedgerEntry(payload);
      setMessage({ type: 'success', text: 'Ledger entry added successfully!' });
      
      // Reset form
      setForm({
        user_id: '',
        date: todayLocalStr(),
        litres_delivered: '',
        balance: '',
        bottle_returned: false,
      });
      setSelectedCustomerName('');
      
      // Refresh table data if on view tab
      if (activeTab === 'view') {
        fetchLedgerData();
      }
    } catch (err) {
      console.error('Failed to add ledger entry:', err);
      setMessage({
        type: 'error',
        text: err.response?.data?.error || 'Failed to add ledger entry',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleTableFilter = () => {
    fetchLedgerData();
  };

  const handleResetFilters = () => {
    setTableFilters({
      from_date: '',
      to_date: '',
      user_id: ''
    });
  };

  // Calculate totals for table
  const totals = useMemo(() => {
    return ledgerData.reduce((acc, entry) => {
      acc.totalLitres += entry.litres_delivered || 0;
      acc.totalBalance += entry.balance || 0;
      return acc;
    }, { totalLitres: 0, totalBalance: 0 });
  }, [ledgerData]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Ledger Management</h1>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('add')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'add'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Add Entry
          </button>
          <button
            onClick={() => setActiveTab('view')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'view'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <ClipboardList className="w-4 h-4 inline mr-2" />
            View Entries ({ledgerData.length})
          </button>
        </nav>
      </div>

      {message.text && (
        <div
          className={`p-4 rounded-lg flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* ADD ENTRY TAB */}
      {activeTab === 'add' && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-6">
            <Plus className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Add Delivery Entry</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Search Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer *
              </label>
              <div className="relative">
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={customerSearch}
                      onChange={(e) => {
                        setCustomerSearch(e.target.value);
                        setShowDropdown(true);
                      }}
                      onFocus={() => setShowDropdown(true)}
                      placeholder="Search customers by name or phone..."
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={selectedCustomerName}
                      placeholder="Selected customer will appear here"
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>
                </div>

                {/* Dropdown */}
                {showDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredCustomers.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-gray-500">
                        {customersLoading ? 'Loading customers...' : 'No customers found'}
                      </div>
                    ) : (
                      filteredCustomers.map((customer) => (
                        <div
                          key={customer._id || customer.id}
                          onClick={() => handleCustomerSelect(customer)}
                          className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <User className="w-4 h-4 text-gray-400" />
                              <span className="font-medium">{customer.name || 'Unnamed'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Phone className="w-3 h-3" />
                              {customer.phone}
                            </div>
                          </div>
                          {customer.is_active === false && (
                            <span className="text-xs text-red-500 ml-7">Inactive</span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Date, Litres, Balance */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  max={todayLocalStr()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Litres Delivered *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="e.g., 2"
                  value={form.litres_delivered}
                  onChange={(e) => setForm({ ...form, litres_delivered: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Balance (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g., 100"
                  value={form.balance}
                  onChange={(e) => setForm({ ...form, balance: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>
            </div>

            {/* Bottle returned */}
            <div className="flex items-center gap-3">
              <input
                id="bottle_returned"
                type="checkbox"
                checked={form.bottle_returned}
                onChange={(e) => setForm({ ...form, bottle_returned: e.target.checked })}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="bottle_returned" className="text-sm text-gray-700">
                Bottle returned
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                  </span>
                ) : (
                  'Add Entry'
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setForm({
                    user_id: '',
                    date: todayLocalStr(),
                    litres_delivered: '',
                    balance: '',
                    bottle_returned: false,
                  });
                  setSelectedCustomerName('');
                  setCustomerSearch('');
                }}
                className="px-6 py-2.5 border rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Reset Form
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VIEW ENTRIES TAB */}
      {activeTab === 'view' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Filters</h3>
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {ledgerLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                </button>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Reset
                </button>
                <button
                  onClick={fetchLedgerData}
                  disabled={ledgerLoading}
                  className="p-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  title="Refresh"
                >
                  <RefreshCw className={`w-4 h-4 ${ledgerLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                Ledger Entries ({ledgerData.length})
              </h3>
            </div>

            {ledgerLoading ? (
              <div className="p-8 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                <p className="mt-2 text-gray-600">Loading ledger data...</p>
              </div>
            ) : ledgerData.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No ledger entries found
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Phone
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Litres
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Balance (₹)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Bottle Returned
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Added On
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {ledgerData.map((entry) => (
                        <tr key={entry._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(entry.date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {entry.user_id?.name || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {entry.user_id?.phone || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {entry.litres_delivered}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ₹{entry.balance?.toFixed(2) || '0.00'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                entry.bottle_returned
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {entry.bottle_returned ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(entry.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan="3" className="px-6 py-3 text-sm font-semibold text-gray-900 text-right">
                          Totals:
                        </td>
                        <td className="px-6 py-3 text-sm font-semibold text-gray-900">
                          {totals.totalLitres.toFixed(1)} L
                        </td>
                        <td className="px-6 py-3 text-sm font-semibold text-gray-900">
                          ₹{totals.totalBalance.toFixed(2)}
                        </td>
                        <td colSpan="2"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Ledger;