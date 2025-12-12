// src/pages/Dashboard/AdminComponents/AdminEnrollments.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  DollarSign,
  AlertCircle,
  Loader,
  Filter,
  Eye,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';
import { getAllEnrollments, processRefund } from '../../../utils/adminApi';

const AdminEnrollments = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        setLoading(true);
        const response = await getAllEnrollments({
          page,
          limit: 10,
          search,
          paymentStatus: statusFilter,
        });
        setEnrollments(response.data || response.enrollments || []);
        setTotalPages(response.totalPages || 1);
      } catch (err) {
        console.error('Error fetching enrollments:', err);
        setError('Failed to load enrollments');
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchEnrollments();
    }, 500);

    return () => clearTimeout(timer);
  }, [search, statusFilter, page]);

  const handleRefund = async (enrollmentId) => {
    if (!window.confirm('Process refund for this enrollment?')) return;
    try {
      await processRefund(enrollmentId, 'Admin initiated refund');
      setEnrollments(
        enrollments.map((e) => (e._id === enrollmentId ? { ...e, paymentStatus: 'refunded' } : e))
      );
    } catch (err) {
      alert('Error processing refund');
    }
  };

  const getPaymentStatusBadge = (status) => {
    const badges = {
      success: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100' },
      pending: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
      failed: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' },
      refunded: { icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-100' },
    };
    const badge = badges[status] || badges.pending;
    return (
      <div className="flex items-center gap-2">
        <div className={`${badge.bg} rounded-full p-2 w-fit`}>
          <badge.icon className={`w-4 h-4 ${badge.color}`} />
        </div>
        <span className="font-medium text-gray-900 capitalize">{status}</span>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Student or Course</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="success">Success</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearch('');
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

      {/* Enrollments Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-6 h-6 animate-spin text-blue-600" />
            <p className="ml-2 text-gray-600">Loading enrollments...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 border-b border-red-200 text-red-700">{error}</div>
        ) : enrollments.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No enrollments found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Enrolled</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {enrollments.map((enrollment, index) => (
                  <motion.tr
                    key={enrollment._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                          {enrollment.studentId?.name?.charAt(0)?.toUpperCase() || 'S'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{enrollment.studentId?.name}</p>
                          <p className="text-xs text-gray-600">{enrollment.studentId?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="font-medium text-gray-900">{enrollment.courseId?.title}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="font-bold text-blue-600">₹{enrollment.courseId?.price}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getPaymentStatusBadge(enrollment.paymentStatus)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(enrollment.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors">
                          <Eye size={18} />
                        </button>
                        {enrollment.paymentStatus === 'success' && (
                          <button
                            onClick={() => handleRefund(enrollment._id)}
                            className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                          >
                            <DollarSign size={18} />
                          </button>
                        )}
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

export default AdminEnrollments;
