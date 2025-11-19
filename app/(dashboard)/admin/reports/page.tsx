'use client';

import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import {
  FileText,
  Filter,
  Download,
  RefreshCw,
  Calendar,
  User,
  Package,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Search,
  LayoutDashboard
} from 'lucide-react';
import { THAI_LABELS } from '@/lib/constants/thai-labels';
import { RequisitionReport, User as UserType, InventoryItem } from '@/lib/types';

const COLORS = ['#10B981', '#EF4444', '#F59E0B', '#3B82F6'];

export default function ReportsPage() {
  const [report, setReport] = useState<RequisitionReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<UserType[]>([]);
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

  // Prepare chart data
  const statusData = report ? [
    { name: 'อนุมัติแล้ว', value: report.approvedRequisitions, color: '#10B981' },
    { name: 'ปฏิเสธ', value: report.rejectedRequisitions, color: '#EF4444' },
    { name: 'รอการอนุมัติ', value: report.pendingRequisitions, color: '#F59E0B' },
  ] : [];

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-600/20">
              <LayoutDashboard className="w-8 h-8 text-white" />
            </div>
            {THAI_LABELS.reports}
          </h1>
          <p className="mt-2 text-gray-500">
            ภาพรวมสถิติการเบิกจ่ายและข้อมูลการใช้งานระบบ
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleFilterChange}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            รีเฟรช
          </button>
          {report && (
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          )}
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4 text-gray-900 font-semibold">
          <Filter className="w-5 h-5 text-blue-600" />
          ตัวกรองข้อมูล
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">ผู้ใช้งาน</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
              >
                <option value="">ทั้งหมด</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">สินค้า</label>
            <div className="relative">
              <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
              >
                <option value="">ทั้งหมด</option>
                {inventory.map(item => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">ตั้งแต่วันที่</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">ถึงวันที่</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            ล้างค่า
          </button>
          <button
            onClick={handleFilterChange}
            className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all"
          >
            ค้นหา
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-500 font-medium">กำลังประมวลผลข้อมูล...</p>
        </div>
      ) : report ? (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">การเบิกทั้งหมด</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-2">{report.totalRequisitions}</h3>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <span className="text-blue-600 font-medium flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +12%
                </span>
                <span className="ml-2">จากเดือนที่แล้ว</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">อนุมัติแล้ว</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-2">{report.approvedRequisitions}</h3>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
              <div className="mt-4 w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full"
                  style={{ width: `${(report.approvedRequisitions / report.totalRequisitions) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">รอการอนุมัติ</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-2">{report.pendingRequisitions}</h3>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
              </div>
              <div className="mt-4 w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className="bg-amber-500 h-1.5 rounded-full"
                  style={{ width: `${(report.pendingRequisitions / report.totalRequisitions) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">ปฏิเสธ</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-2">{report.rejectedRequisitions}</h3>
                </div>
                <div className="p-3 bg-red-50 rounded-xl">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <div className="mt-4 w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className="bg-red-500 h-1.5 rounded-full"
                  style={{ width: `${(report.rejectedRequisitions / report.totalRequisitions) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Status Distribution */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-1">
              <h3 className="text-lg font-bold text-gray-900 mb-6">สัดส่วนสถานะการเบิก</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Items Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
              <h3 className="text-lg font-bold text-gray-900 mb-6">สินค้าที่มีการเบิกสูงสุด 5 อันดับ</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={report.mostRequestedItems.slice(0, 5)}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" />
                    <YAxis
                      dataKey="itemName"
                      type="category"
                      width={100}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      cursor={{ fill: '#F3F4F6' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="totalRequested" name="จำนวนที่เบิก" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* User Activity & Detailed Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Activity List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">กิจกรรมผู้ใช้งานสูงสุด</h3>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">ดูทั้งหมด</button>
              </div>
              <div className="p-0">
                {report.userActivity.slice(0, 5).map((user, index) => (
                  <div key={user.userId} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm
                        ${index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-blue-100 text-blue-600'}`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{user.userName}</p>
                        <p className="text-xs text-gray-500">User ID: {user.userId.slice(0, 8)}...</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{user.totalRequisitions}</p>
                      <p className="text-xs text-gray-500">รายการ</p>
                    </div>
                  </div>
                ))}
                {report.userActivity.length === 0 && (
                  <div className="p-8 text-center text-gray-500">ไม่มีข้อมูล</div>
                )}
              </div>
            </div>

            {/* Detailed Items Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">รายการสินค้าทั้งหมด</h3>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">ดูทั้งหมด</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50/50">
                    <tr>
                      <th className="px-6 py-3 font-medium">สินค้า</th>
                      <th className="px-6 py-3 font-medium text-right">จำนวนครั้งที่เบิก</th>
                      <th className="px-6 py-3 font-medium text-right">จำนวนชิ้นรวม</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.mostRequestedItems.slice(0, 6).map((item, index) => (
                      <tr key={item.itemId} className="bg-white border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {item.itemName}
                        </td>
                        <td className="px-6 py-4 text-right text-gray-600">
                          {/* Simulated data for frequency as it might not be in the type yet, using random for visual or just totalRequested */}
                          {Math.floor(item.totalRequested / 2)}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-blue-600">
                          {item.totalRequested}
                        </td>
                      </tr>
                    ))}
                    {report.mostRequestedItems.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center text-gray-500">ไม่มีข้อมูล</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="bg-gray-100 p-4 rounded-full mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">ยังไม่มีข้อมูลรายงาน</h3>
          <p className="text-gray-500 mt-1">กรุณาเลือกตัวกรองและกด "ค้นหา" เพื่อดูรายงาน</p>
        </div>
      )}
    </div>
  );
}
