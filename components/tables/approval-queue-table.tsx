'use client';

import { useState } from 'react';
import { Requisition, InventoryItem, User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { StatusBadge, StatusType } from '@/components/ui/status-badge';
import { THAI_LABELS } from '@/lib/constants/thai-labels';
import { formatDate } from '@/lib/utils/format';

interface ApprovalQueueTableProps {
  requisitions: Requisition[];
  inventory: InventoryItem[];
  users: User[];
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
  onIssue: (id: string) => Promise<void>;
  loading?: boolean;
}

interface RequisitionDetailModalProps {
  requisition: Requisition | null;
  inventory: InventoryItem[];
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
  onIssue: (id: string) => Promise<void>;
}

function RequisitionDetailModal({
  requisition,
  inventory,
  user,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onIssue
}: RequisitionDetailModalProps) {
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!requisition || !user) return null;

  const handleApprove = async () => {
    setLoading(true);
    try {
      await onApprove(requisition.id);
      onClose();
    } catch (error) {
      console.error('Error approving requisition:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    
    setLoading(true);
    try {
      await onReject(requisition.id, rejectReason);
      onClose();
      setRejectReason('');
      setShowRejectForm(false);
    } catch (error) {
      console.error('Error rejecting requisition:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleIssue = async () => {
    setLoading(true);
    try {
      await onIssue(requisition.id);
      onClose();
    } catch (error) {
      console.error('Error issuing requisition:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="รายละเอียดคำขอเบิกสินค้า" size="lg">
      <div className="p-6 space-y-6">
        {/* Header Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
              {THAI_LABELS.documentNumber}
            </label>
            <p className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
              {requisition.documentNumber}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
              {THAI_LABELS.status}
            </label>
            <StatusBadge status={requisition.status as StatusType} size="sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
              ผู้ขอเบิก
            </label>
            <p style={{ color: 'var(--color-text)' }}>{user.name}</p>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{user.department}</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
              {THAI_LABELS.requestDate}
            </label>
            <p style={{ color: 'var(--color-text)' }}>{formatDate(requisition.createdAt)}</p>
          </div>
        </div>

        {/* Items */}
        <div>
          <h3 className="text-lg font-medium mb-3" style={{ color: 'var(--color-text)' }}>
            รายการสินค้าที่ขอเบิก
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <th className="text-left py-2 px-3 text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    {THAI_LABELS.productCode}
                  </th>
                  <th className="text-left py-2 px-3 text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    {THAI_LABELS.productName}
                  </th>
                  <th className="text-right py-2 px-3 text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    {THAI_LABELS.quantity}
                  </th>
                  <th className="text-right py-2 px-3 text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    {THAI_LABELS.remaining}
                  </th>
                </tr>
              </thead>
              <tbody>
                {requisition.items.map((item, index) => {
                  const inventoryItem = inventory.find(inv => inv.id === item.inventoryItemId);
                  return (
                    <tr key={index} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td className="py-2 px-3 text-sm" style={{ color: 'var(--color-text)' }}>
                        {inventoryItem?.code || '-'}
                      </td>
                      <td className="py-2 px-3 text-sm" style={{ color: 'var(--color-text)' }}>
                        {inventoryItem?.name || '-'}
                      </td>
                      <td className="py-2 px-3 text-sm text-right" style={{ color: 'var(--color-text)' }}>
                        {item.quantity} {inventoryItem?.unit || ''}
                      </td>
                      <td className="py-2 px-3 text-sm text-right" style={{ color: 'var(--color-text)' }}>
                        {inventoryItem?.currentStock || 0} {inventoryItem?.unit || ''}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes */}
        {requisition.notes && (
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
              {THAI_LABELS.notes}
            </label>
            <p
              className="p-3 rounded-md text-sm"
              style={{
                backgroundColor: 'var(--color-bg-secondary)',
                color: 'var(--color-text)',
                border: '1px solid var(--color-border)'
              }}
            >
              {requisition.notes}
            </p>
          </div>
        )}

        {/* Rejection Reason */}
        {requisition.status === 'rejected' && requisition.rejectionReason && (
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
              เหตุผลในการปฏิเสธ
            </label>
            <p
              className="p-3 rounded-md text-sm"
              style={{
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                border: '1px solid #fecaca'
              }}
            >
              {requisition.rejectionReason}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
          {requisition.status === 'pending' && (
            <>
              <Button
                variant="danger"
                onClick={() => setShowRejectForm(true)}
                disabled={loading}
              >
                {THAI_LABELS.reject}
              </Button>
              <Button
                variant="primary"
                onClick={handleApprove}
                loading={loading}
              >
                {THAI_LABELS.approve}
              </Button>
            </>
          )}
          
          {requisition.status === 'approved' && (
            <Button
              variant="primary"
              onClick={handleIssue}
              loading={loading}
            >
              {THAI_LABELS.issue}
            </Button>
          )}
        </div>

        {/* Reject Form */}
        {showRejectForm && (
          <div
            className="p-4 rounded-md"
            style={{
              backgroundColor: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)'
            }}
          >
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
              เหตุผลในการปฏิเสธ
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-3 rounded-md text-sm resize-none"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)'
              }}
              rows={3}
              placeholder="กรุณาระบุเหตุผลในการปฏิเสธ..."
            />
            <div className="flex justify-end space-x-2 mt-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setShowRejectForm(false);
                  setRejectReason('');
                }}
              >
                {THAI_LABELS.cancel}
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleReject}
                disabled={!rejectReason.trim() || loading}
                loading={loading}
              >
                ยืนยันการปฏิเสธ
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

export function ApprovalQueueTable({
  requisitions,
  inventory,
  users,
  onApprove,
  onReject,
  onIssue,
  loading = false
}: ApprovalQueueTableProps) {
  const [selectedRequisition, setSelectedRequisition] = useState<Requisition | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handleViewDetails = (requisition: Requisition) => {
    setSelectedRequisition(requisition);
    setIsDetailModalOpen(true);
  };

  const selectedUser = selectedRequisition 
    ? users.find(user => user.id === selectedRequisition.userId) || null
    : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--color-primary)' }}></div>
          <p style={{ color: 'var(--color-text-secondary)' }}>{THAI_LABELS.loading}</p>
        </div>
      </div>
    );
  }

  if (requisitions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
          ไม่มีคำขอที่รอการอนุมัติ
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
              <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--color-text)' }}>
                {THAI_LABELS.documentNumber}
              </th>
              <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--color-text)' }}>
                ผู้ขอเบิก
              </th>
              <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--color-text)' }}>
                {THAI_LABELS.requestDate}
              </th>
              <th className="text-center py-3 px-4 font-medium" style={{ color: 'var(--color-text)' }}>
                {THAI_LABELS.status}
              </th>
              <th className="text-center py-3 px-4 font-medium" style={{ color: 'var(--color-text)' }}>
                จำนวนรายการ
              </th>
              <th className="text-center py-3 px-4 font-medium" style={{ color: 'var(--color-text)' }}>
                การดำเนินการ
              </th>
            </tr>
          </thead>
          <tbody>
            {requisitions.map((requisition) => {
              const user = users.find(u => u.id === requisition.userId);
              return (
                <tr
                  key={requisition.id}
                  className="hover:opacity-80 transition-opacity duration-200"
                  style={{ borderBottom: '1px solid var(--color-border)' }}
                >
                  <td className="py-3 px-4">
                    <span className="font-medium" style={{ color: 'var(--color-text)' }}>
                      {requisition.documentNumber}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium" style={{ color: 'var(--color-text)' }}>
                        {user?.name || '-'}
                      </p>
                      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        {user?.department || '-'}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4" style={{ color: 'var(--color-text)' }}>
                    {formatDate(requisition.createdAt)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <StatusBadge status={requisition.status as StatusType} size="sm" />
                  </td>
                  <td className="py-3 px-4 text-center" style={{ color: 'var(--color-text)' }}>
                    {requisition.items.length}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleViewDetails(requisition)}
                      className='cursor-pointer'
                    >
                      ดูรายละเอียด
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <RequisitionDetailModal
        requisition={selectedRequisition}
        inventory={inventory}
        user={selectedUser}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedRequisition(null);
        }}
        onApprove={onApprove}
        onReject={onReject}
        onIssue={onIssue}
      />
    </>
  );
}