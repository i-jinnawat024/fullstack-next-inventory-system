'use client';

import { useState, useEffect } from 'react';
import { THAI_LABELS } from '@/lib/constants/thai-labels';
import { RequisitionReport, User, InventoryItem } from '@/lib/types';

export default function ReportsPage() {
  const [report, setReport] = useState<RequisitionReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  
  // Filters
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  useEffect(() => {
    fetchUsers();
    fetchInventory();
    generateReport();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/auth/users');
      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchInventory = async () => {
    try {
      const response = await fetch('/api/inventory');
      const data = await response.json();
      if (data.success) {
        setInventory(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    }
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedUserId) params.append('userId', selectedUserId);
      if (selectedProductId) params.append('productId', selectedProductId);
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);

      const response = await fetch(`/api/reports?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setReport(data.data);
      } else {
        alert(data.error?.message || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
      alert('เกิดข้อผิดพลาดในการสร้างรายงาน');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = () => {
    generateReport();
  };

  const handleClearFilters = () => {
    setSelectedUserId('');
    setSelectedProductId('');
    setDateFrom('');
    setDateTo('');
    setTimeout(() => generateReport(), 0);
  };

  const exportToCSV = () => {
    if (!report) return;

    let csv = 'รายงานการเบิกสินค้า\n\n';
    csv += 'สรุปภาพรวม\n';
    csv += `จำนวนการเบิกทั้งหมด,${report.totalRequisitions}\n`;
    csv += `อนุมัติแล้ว,${report.approvedRequisitions}\n`;
    csv += `ปฏิเสธ,${report.rejectedRequisitions}\n`;
    csv += `รอการอนุมัติ,${report.pendingRequisitions}\n\n`;

    csv += 'สินค้าที่ถูกเบิกมากที่สุด\n';
    csv += 'ชื่อสินค้า,จำนวนที่เบิก\n';
    report.mostRequestedItems.forEach(item => {
      csv += `${item.itemName},${item.totalRequested}\n`;
    });

    csv += '\nกิจกรรมของผู้ใช้\n';
    csv += 'ชื่อผู้ใช้,จำนวนการเบิก\n';
    report.userActivity.forEach(user => {
      csv += `${user.userName},${user.totalRequisitions}\n`;
    });

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `report-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {THAI_LABELS.reports}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          รายงานการเบิกสินค้าและสถิติการใช้งาน
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {THAI_LABELS.filter}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ผู้ใช้
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">ทั้งหมด</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              สินค้า
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">ทั้งหมด</option>
              {inventory.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              วันที่เริ่มต้น
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              วันที่สิ้นสุด
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleFilterChange}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? THAI_LABELS.loading : 'สร้างรายงาน'}
          </button>
          <button
            onClick={handleClearFilters}
            disabled={loading}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
          >
            {THAI_LABELS.clear}
          </button>
          {report && (
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              {THAI_LABELS.export} CSV
            </button>
          )}
        </div>
      </div>

      {/* Report Results */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{THAI_LABELS.loading}</p>
        </div>
      )}

      {!loading && report && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                จำนวนการเบิกทั้งหมด
              </h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {report.totalRequisitions}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                อนุมัติแล้ว
              </h3>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {report.approvedRequisitions}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                ปฏิเสธ
              </h3>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                {report.rejectedRequisitions}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                รอการอนุมัติ
              </h3>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {report.pendingRequisitions}
              </p>
            </div>
          </div>

          {/* Most Requested Items */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              สินค้าที่ถูกเบิกมากที่สุด
            </h2>
            {report.mostRequestedItems.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        อันดับ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        ชื่อสินค้า
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        จำนวนที่เบิก
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {report.mostRequestedItems.map((item, index) => (
                      <tr key={item.itemId}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {item.itemName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {item.totalRequested}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">{THAI_LABELS.noData}</p>
            )}
          </div>

          {/* User Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              กิจกรรมของผู้ใช้
            </h2>
            {report.userActivity.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        ชื่อผู้ใช้
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        จำนวนการเบิก
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {report.userActivity.map((user) => (
                      <tr key={user.userId}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {user.userName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {user.totalRequisitions}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">{THAI_LABELS.noData}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
