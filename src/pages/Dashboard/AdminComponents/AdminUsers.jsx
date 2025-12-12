// src/pages/Dashboard/AdminComponents/AdminUsers.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  Ban,
  CheckCircle,
  AlertCircle,
  Loader,
  Filter,
  Eye,
} from 'lucide-react';
import { getAllUsers, updateUserStatus, banUser, unbanUser, deleteUser } from '../../../utils/adminApi';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await getAllUsers({
          page,
          limit: 10,
          search,
          role: roleFilter,
          status: statusFilter,
        });
        setUsers(response.data || response.users || []);
        setTotalPages(response.totalPages || 1);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchUsers();
    }, 500);

    return () => clearTimeout(timer);
  }, [search, roleFilter, statusFilter, page]);

  const handleBanUser = async (userId) => {
    if (!window.confirm('Are you sure you want to ban this user?')) return;
    try {
      await banUser(userId, 'Violation of terms');
      setUsers(users.map((u) => (u._id === userId ? { ...u, status: 'banned' } : u)));
    } catch (err) {
      alert('Error banning user');
    }
  };

  const handleUnbanUser = async (userId) => {
    try {
      await unbanUser(userId);
      setUsers(users.map((u) => (u._id === userId ? { ...u, status: 'active' } : u)));
    } catch (err) {
      alert('Error unbanning user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Permanently delete this user? This action cannot be undone.')) return;
    try {
      await deleteUser(userId);
      setUsers(users.filter((u) => u._id !== userId));
    } catch (err) {
      alert('Error deleting user');
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: { bg: 'bg-red-100', text: 'text-red-700' },
      lecture: { bg: 'bg-blue-100', text: 'text-blue-700' },
      student: { bg: 'bg-green-100', text: 'text-green-700' },
    };
    const badge = badges[role] || { bg: 'bg-gray-100', text: 'text-gray-700' };
    return <span className={`${badge.bg} ${badge.text} text-xs font-semibold px-3 py-1 rounded-full`}>{role}</span>;
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
      banned: { icon: Ban, color: 'text-red-600', bg: 'bg-red-100' },
      suspended: { icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-100' },
    };
    const badge = badges[status] || badges.active;
    return (
      <div className={`${badge.bg} rounded-full p-2 w-fit`}>
        <badge.icon className={`w-4 h-4 ${badge.color}`} />
      </div>
    );
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Filter size={20} /> Filters & Search
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search by Name or Email</label>
            <input
              type="text"
              placeholder="Type to search..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="lecture">Lecturer</option>
              <option value="student">Student</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="banned">Banned</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearch('');
                setRoleFilter('');
                setStatusFilter('');
                setPage(1);
              }}
              className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-6 h-6 animate-spin text-blue-600" />
            <p className="ml-2 text-gray-600">Loading users...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 border-b border-red-200 text-red-700">{error}</div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user, index) => (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                          {user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <span className="font-medium text-gray-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{getRoleBadge(user.role)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(user.status || 'active')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowModal(true);
                          }}
                          className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                        >
                          <Eye size={18} />
                        </button>
                        {user.status === 'banned' ? (
                          <button
                            onClick={() => handleUnbanUser(user._id)}
                            className="p-2 hover:bg-green-50 rounded-lg text-green-600 transition-colors"
                            title="Unban User"
                          >
                            <CheckCircle size={18} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBanUser(user._id)}
                            className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                            title="Ban User"
                          >
                            <Ban size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 disabled:opacity-50 hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 disabled:opacity-50 hover:bg-gray-50 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AdminUsers;
