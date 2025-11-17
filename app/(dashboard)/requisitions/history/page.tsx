'use client';

import { useState, useEffect } from 'react';
import { Requisition, InventoryItem, User } from '@/lib/types';
import { Table, Column } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { StatusBadge, StatusType } from '@/components/ui/status-badge';
import { THAI_LABELS } from '@/lib/constants/thai-labels';
import { formatDate } from '@/lib/utils/format';
import jsPDF from 'jspdf';

interface RequisitionWithDetails extends Requisition {
  itemDetails?: (InventoryItem & { requestedQuantity: number })[];
  userDetails?: User;
}

export default function RequisitionHistoryPage() {
  const [requisitions, setRequisitions] = useState<RequisitionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequisition, setSelectedRequisition] = useState<RequisitionWithDetails | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Fetch requisitions
  const fetchRequisitions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/requisitions?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        // Fetch item details for each requisition
        const requisitionsWithDetails = await Promise.all(
          result.data.map(async (req: Requisition) => {
            const itemDetails = await Promise.all(
              req.items.map(async (item) => {
                try {
                  const itemResponse = await fetch(`/api/inventory/${item.inventoryItemId}`);
                  const itemResult = await itemResponse.json();
                  if (itemResult.success) {
                    return {
                      ...itemResult.data,
                      requestedQuantity: item.quantity
                    };
                  }
                  return null;
                } catch (error) {
                  console.error('Error fetching item details:', error);
                  return null;
                }
              })
            );

            return {
              ...req,
              itemDetails: itemDetails.filter(Boolean)
            };
          })
        );

        setRequisitions(requisitionsWithDetails);
      } else {
        console.error('Failed to fetch requisitions:', result.error);
      }
    } catch (error) {
      console.error('Error fetching requisitions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequisitions();
  }, [statusFilter]);

  // Get status label for PDF export
  const getStatusLabel = (status: Requisition['status']) => {
    const statusMap = {
      draft: THAI_LABELS.draft,
      pending: THAI_LABELS.pending,
      approved: THAI_LABELS.approved,
      rejected: THAI_LABELS.rejected,
      issued: THAI_LABELS.issued
    };
    return statusMap[status] || status;
  };



  // Show requisition details
  const showDetails = (requisition: RequisitionWithDetails) => {
    setSelectedRequisition(requisition);
    setShowDetailModal(true);
  };

  // Export to PDF
  const exportToPDF = (requisition: RequisitionWithDetails) => {
    const doc = new jsPDF();
    
    // Set font (using default font for Thai support)
    doc.setFontSize(16);
    doc.text('ใบเบิกสินค้า', 20, 20);
    
    doc.setFontSize(12);
    doc.text(`เลขที่เอกสาร: ${requisition.documentNumber}`, 20, 35);
    doc.text(`วันที่สร้าง: ${formatDate(requisition.createdAt)}`, 20, 45);
    doc.text(`สถานะ: ${getStatusLabel(requisition.status)}`, 20, 55);
    
    if (requisition.notes) {
      doc.text(`หมายเหตุ: ${requisition.notes}`, 20, 65);
    }
    
    // Items table header
    doc.text('รายการสินค้า:', 20, 80);
    doc.text('รหัส', 20, 90);
    doc.text('ชื่อสินค้า', 60, 90);
    doc.text('จำนวน', 140, 90);
    doc.text('หน่วย', 170, 90);
    
    // Items
    let yPos = 100;
    requisition.itemDetails?.forEach((item, index) => {
      doc.text(item.code, 20, yPos);
      doc.text(item.name.substring(0, 30), 60, yPos); // Truncate long names
      doc.text(item.requestedQuantity.toString(), 140, yPos);
      doc.text(item.unit, 170, yPos);
      yPos += 10;
    });
    
    // Approval info
    if (requisition.approvedBy && requisition.approvedAt) {
      yPos += 10;
      doc.text(`อนุมัติโดย: ${requisition.approvedBy}`, 20, yPos);
      doc.text(`วันที่อนุมัติ: ${formatDate(requisition.approvedAt)}`, 20, yPos + 10);
    }
    
    if (requisition.rejectionReason) {
      yPos += 10;
      doc.text(`เหตุผลที่ปฏิเสธ: ${requisition.rejectionReason}`, 20, yPos);
    }
    
    // Save PDF
    doc.save(`requisition-${requisition.documentNumber}.pdf`);
  };

  // Table columns
  const columns: Column<RequisitionWithDetails>[] = [
    {
      key: 'documentNumber',
      header: THAI_LABELS.documentNumber,
      width: '140px',
      render: (req) => (
        <span className="font-mono text-sm" style={{ color: 'var(--color-primary)' }}>
          {req.documentNumber}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: THAI_LABELS.requestDate,
      width: '120px',
      render: (req) => formatDate(req.createdAt),
    },
    {
      key: 'status',
      header: THAI_LABELS.status,
      width: '120px',
      align: 'center',
      render: (req) => <StatusBadge status={req.status as StatusType} size="sm" />,
    },
    {
      key: 'items',
      header: 'รายการสินค้า',
      render: (req) => (
        <div>
          <div className="text-sm font-medium">
            {req.itemDetails?.length || req.items.length} รายการ
          </div>
          <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            {req.itemDetails?.slice(0, 2).map(item => item.name).join(', ')}
            {(req.itemDetails?.length || 0) > 2 && '...'}
          </div>
        </div>
      ),
    },
    {
      key: 'notes',
      header: THAI_LABELS.notes,
      render: (req) => (
        <div className="text-sm max-w-xs truncate" title={req.notes}>
          {req.notes || '-'}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'การดำเนินการ',
      width: '160px',
      align: 'center',
      render: (req) => (
        <div className="flex gap-2 justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => showDetails(req)}
          >
            ดูรายละเอียด
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportToPDF(req)}
          >
            {THAI_LABELS.export}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
          {THAI_LABELS.requisitionHistory}
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          ดูประวัติการเบิกสินค้าและสถานะการอนุมัติ
        </p>
      </div>

      {/* Filters */}
      <div
        className="p-4 rounded-lg border"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
            กรองตามสถานะ:
          </label>
          <select
            className="px-3 py-2 rounded-md border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
            }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">{THAI_LABELS.allStatuses}</option>
            <option value="draft">{THAI_LABELS.draft}</option>
            <option value="pending">{THAI_LABELS.pending}</option>
            <option value="approved">{THAI_LABELS.approved}</option>
            <option value="rejected">{THAI_LABELS.rejected}</option>
            <option value="issued">{THAI_LABELS.issued}</option>
          </select>
        </div>
      </div>

      {/* Requisitions Table */}
      <div
        className="rounded-lg border"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        <Table
          data={requisitions}
          columns={columns}
          loading={loading}
          emptyMessage="ไม่พบประวัติการเบิกสินค้า"
        />
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="รายละเอียดใบเบิกสินค้า"
        size="lg"
      >
        {selectedRequisition && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  {THAI_LABELS.documentNumber}
                </label>
                <div className="font-mono text-sm" style={{ color: 'var(--color-primary)' }}>
                  {selectedRequisition.documentNumber}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  {THAI_LABELS.status}
                </label>
                <div>
                  <StatusBadge status={selectedRequisition.status as StatusType} size="sm" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  วันที่สร้าง
                </label>
                <div>{formatDate(selectedRequisition.createdAt)}</div>
              </div>
              {selectedRequisition.approvedAt && (
                <div>
                  <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    วันที่อนุมัติ
                  </label>
                  <div>{formatDate(selectedRequisition.approvedAt)}</div>
                </div>
              )}
            </div>

            {/* Items */}
            <div>
              <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-text)' }}>
                รายการสินค้า
              </h3>
              <div
                className="rounded-lg border"
                style={{
                  backgroundColor: 'var(--color-bg-secondary)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ borderBottomColor: 'var(--color-border)' }} className="border-b">
                        <th className="text-left p-3 text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                          รหัสสินค้า
                        </th>
                        <th className="text-left p-3 text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                          ชื่อสินค้า
                        </th>
                        <th className="text-center p-3 text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                          จำนวนที่ขอ
                        </th>
                        <th className="text-center p-3 text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                          หน่วย
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedRequisition.itemDetails?.map((item, index) => (
                        <tr key={index} style={{ borderBottomColor: 'var(--color-border)' }} className="border-b last:border-b-0">
                          <td className="p-3">
                            <span className="font-mono text-sm" style={{ color: 'var(--color-primary)' }}>
                              {item.code}
                            </span>
                          </td>
                          <td className="p-3">
                            <div>
                              <div className="font-medium">{item.name}</div>
                              <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                {item.description}
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-center font-semibold">
                            {item.requestedQuantity.toLocaleString()}
                          </td>
                          <td className="p-3 text-center">
                            {item.unit}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Notes */}
            {selectedRequisition.notes && (
              <div>
                <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  {THAI_LABELS.notes}
                </label>
                <div
                  className="mt-1 p-3 rounded-md border"
                  style={{
                    backgroundColor: 'var(--color-bg-secondary)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  {selectedRequisition.notes}
                </div>
              </div>
            )}

            {/* Rejection Reason */}
            {selectedRequisition.rejectionReason && (
              <div>
                <label className="text-sm font-medium" style={{ color: 'var(--color-error)' }}>
                  เหตุผลที่ปฏิเสธ
                </label>
                <div
                  className="mt-1 p-3 rounded-md border"
                  style={{
                    backgroundColor: 'var(--color-error)10',
                    borderColor: 'var(--color-error)',
                    color: 'var(--color-error)',
                  }}
                >
                  {selectedRequisition.rejectionReason}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <Button
                variant="outline"
                onClick={() => exportToPDF(selectedRequisition)}
              >
                {THAI_LABELS.export} PDF
              </Button>
              <Button
                onClick={() => setShowDetailModal(false)}
              >
                {THAI_LABELS.close}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}