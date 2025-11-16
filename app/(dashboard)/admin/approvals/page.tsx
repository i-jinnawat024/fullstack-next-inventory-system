'use client';

import { useState, useEffect } from 'react';
import { Requisition, InventoryItem, User, ApiResponse } from '@/lib/types';
import { ApprovalQueueTable } from '@/components/tables/approval-queue-table';
import { THAI_LABELS } from '@/lib/constants/thai-labels';

export default function ApprovalsPage() {
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('pending');

  // Fetch all data
  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch requisitions
      const reqParams = new URLSearchParams();
      if (statusFilter !== 'all') {
        reqParams.append('status', statusFilter);
      }
      
      const reqResponse = await fetch(`/api/requisitions?${reqParams.toString()}`);
      const reqData: ApiResponse<Requisition[]> = await reqResponse.json();
      
      if (!reqData.success) {
        throw new Error(reqData.error?.message || 'Failed to fetch requisitions');
      }

      // Fetch inventory
      const invResponse = await fetch('/api/inventory');
      const invData: ApiResponse<InventoryItem[]> = await invResponse.json();
      
      if (!invData.success) {
        throw new Error(invData.error?.message || 'Failed to fetch inventory');
      }

      // Fetch users (admin endpoint to get all users)
      const usersResponse = await fetch('/api/users');
      const usersData: ApiResponse<User[]> = await usersResponse.json();
      
      if (!usersData.success) {
        throw new Error(usersData.error?.message || 'Failed to fetch users');
      }

      setRequisitions(reqData.data || []);
      setInventory(invData.data || []);
      setUsers(usersData.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/requisitions/${id}/approve`, {
        method: 'POST',
      });

      const data: ApiResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to approve requisition');
      }

      // Refresh data
      await fetchData();
    } catch (err) {
      console.error('Error approving requisition:', err);
      alert(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการอนุมัติคำขอ');
      throw err;
    }
  };

  const handleReject = async (id: string, reason: string) => {
    try {
      const response = await fetch(`/api/requisitions/${id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      const data: ApiResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to reject requisition');
      }

      // Refresh data
      await fetchData();
    } catch (err) {
      console.error('Error rejecting requisition:', err);
      alert(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการปฏิเสธคำขอ');
      throw err;
    }
  };

  const handleIssue = async (id: string) => {
    try {
      const response = await fetch(`/api/requisitions/${id}/issue`, {
        method: 'POST',
      });

      const data: ApiResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to issue requisition');
      }

      // Refresh data
      await fetchData();
    } catch (err) {
      console.error('Error issuing requisition:', err);
      alert(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการจ่ายสินค้า');
      throw err;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
          {THAI_LABELS.approvalQueue}
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          จัดการคำขอเบิกสินค้าที่รอการอนุมัติ
        </p>
      </div>

      {/* Status Filter */}
      <div className="mb-6">
        <div className="flex space-x-2">
          {[
            { value: 'pending', label: THAI_LABELS.pending },
            { value: 'approved', label: THAI_LABELS.approved },
            { value: 'rejected', label: THAI_LABELS.rejected },
            { value: 'issued', label: THAI_LABELS.issued },
            { value: 'all', label: 'ทั้งหมด' }
          ].map((status) => (
            <button
              key={status.value}
              onClick={() => setStatusFilter(status.value)}
              className="px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              style={{
                backgroundColor: statusFilter === status.value ? 'var(--color-primary)' : 'var(--color-surface)',
                color: statusFilter === status.value ? '#ffffff' : 'var(--color-text)',
                border: `1px solid ${statusFilter === status.value ? 'var(--color-primary)' : 'var(--color-border)'}`
              }}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div
          className="mb-6 p-4 rounded-md"
          style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626'
          }}
        >
          <p className="font-medium">เกิดข้อผิดพลาด</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Approval Queue Table */}
      <div
        className="rounded-lg overflow-hidden"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)'
        }}
      >
        <ApprovalQueueTable
          requisitions={requisitions}
          inventory={inventory}
          users={users}
          onApprove={handleApprove}
          onReject={handleReject}
          onIssue={handleIssue}
          loading={loading}
        />
      </div>
    </div>
  );
}