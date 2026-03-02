import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api/apiService';
import { Search, Edit2, Save, X, UserCheck, UserX } from 'lucide-react';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', is_active: true });

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    const filtered = customers.filter(
      (customer) =>
        customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.includes(searchTerm)
    );
    setFilteredCustomers(filtered);
  }, [searchTerm, customers]);

  const fetchCustomers = async () => {
    try {
      const response = await adminAPI.getCustomers();
      setCustomers(response.data || []);
      setFilteredCustomers(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setLoading(false);
    }
  };

  const handleEdit = (customer) => {
    setEditingId(customer.id);
    setEditForm({
      name: customer.name,
      is_active: customer.is_active,
    });
  };

  const handleSave = async (id) => {
    try {
      await adminAPI.updateCustomer(id, editForm);
      await fetchCustomers();
      setEditingId(null);
    } catch (error) {
      console.error('Error updating customer:', error);
      alert('Failed to update customer');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({ name: '', is_active: true });
  };

  const toggleStatus = async (customer) => {
    try {
      await adminAPI.updateCustomer(customer.id, {
        name: customer.name,
        is_active: !customer.is_active,
      });
      await fetchCustomers();
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Customer Management</h1>
        <div className="text-sm text-gray-600">
          Total: {customers.length} | Active: {customers.filter(c => c.is_active).length}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 text-gray-600 font-semibold">ID</th>
                <th className="text-left py-4 px-6 text-gray-600 font-semibold">Name</th>
                <th className="text-left py-4 px-6 text-gray-600 font-semibold">Phone</th>
                <th className="text-left py-4 px-6 text-gray-600 font-semibold">Status</th>
                <th className="text-left py-4 px-6 text-gray-600 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6 text-gray-700">{customer.id}</td>
                    <td className="py-4 px-6">
                      {editingId === customer.id ? (
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForm({ ...editForm, name: e.target.value })
                          }
                          className="border border-gray-300 rounded px-2 py-1 w-full"
                        />
                      ) : (
                        <span className="text-gray-800 font-medium">{customer.name}</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-gray-700">{customer.phone}</td>
                    <td className="py-4 px-6">
                      {editingId === customer.id ? (
                        <select
                          value={editForm.is_active}
                          onChange={(e) =>
                            setEditForm({ ...editForm, is_active: e.target.value === 'true' })
                          }
                          className="border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="true">Active</option>
                          <option value="false">Inactive</option>
                        </select>
                      ) : (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            customer.is_active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {customer.is_active ? 'Active' : 'Inactive'}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        {editingId === customer.id ? (
                          <>
                            <button
                              onClick={() => handleSave(customer.id)}
                              className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                              title="Save"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={handleCancel}
                              className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEdit(customer)}
                              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => toggleStatus(customer)}
                              className={`p-2 ${
                                customer.is_active
                                  ? 'bg-red-500 hover:bg-red-600'
                                  : 'bg-green-500 hover:bg-green-600'
                              } text-white rounded-lg transition`}
                              title={customer.is_active ? 'Deactivate' : 'Activate'}
                            >
                              {customer.is_active ? (
                                <UserX className="w-4 h-4" />
                              ) : (
                                <UserCheck className="w-4 h-4" />
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500">
                    No customers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Customers;