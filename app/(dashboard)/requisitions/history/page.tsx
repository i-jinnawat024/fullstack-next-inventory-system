"use client";

import { useState, useEffect } from "react";
import { Requisition, InventoryItem, User } from "@/lib/types";
import { Table, Column } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { StatusBadge, StatusType } from "@/components/ui/status-badge";
import { THAI_LABELS } from "@/lib/constants/thai-labels";
import { formatDate } from "@/lib/utils/format";
import jsPDF from "jspdf";

interface RequisitionWithDetails extends Requisition {
  itemDetails?: (InventoryItem & { requestedQuantity: number })[];
  userDetails?: User;
}

export default function RequisitionHistoryPage() {
  const [requisitions, setRequisitions] = useState<RequisitionWithDetails[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [selectedRequisition, setSelectedRequisition] =
    useState<RequisitionWithDetails | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Fetch requisitions
  const fetchRequisitions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
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
                  const itemResponse = await fetch(
                    `/api/inventory/${item.inventoryItemId}`
                  );
                  const itemResult = await itemResponse.json();
                  if (itemResult.success) {
                    return {
                      ...itemResult.data,
                      requestedQuantity: item.quantity,
                    };
                  }
                  return null;
                } catch (error) {
                  console.error("Error fetching item details:", error);
                  return null;
                }
              })
            );

            return {
              ...req,
              itemDetails: itemDetails.filter(Boolean),
            };
          })
        );

        setRequisitions(requisitionsWithDetails);
      } else {
        console.error("Failed to fetch requisitions:", result.error);
      }
    } catch (error) {
      console.error("Error fetching requisitions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequisitions();
  }, [statusFilter]);

  // Get status label for PDF export
  const getStatusLabel = (status: Requisition["status"]) => {
    const statusMap = {
      draft: THAI_LABELS.draft,
      pending: THAI_LABELS.pending,
      approved: THAI_LABELS.approved,
      rejected: THAI_LABELS.rejected,
      issued: THAI_LABELS.issued,
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
    doc.text("ใบเบิกสินค้า", 20, 20);

    doc.setFontSize(12);
    doc.text(`เลขที่เอกสาร: ${requisition.documentNumber}`, 20, 35);
    doc.text(`วันที่สร้าง: ${formatDate(requisition.createdAt)}`, 20, 45);
    doc.text(`สถานะ: ${getStatusLabel(requisition.status)}`, 20, 55);

    if (requisition.notes) {
      doc.text(`หมายเหตุ: ${requisition.notes}`, 20, 65);
    }

    // Items table header
    doc.text("รายการสินค้า:", 20, 80);
    doc.text("รหัส", 20, 90);
    doc.text("ชื่อสินค้า", 60, 90);
    doc.text("จำนวน", 140, 90);
    doc.text("หน่วย", 170, 90);

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
      doc.text(
        `วันที่อนุมัติ: ${formatDate(requisition.approvedAt)}`,
        20,
        yPos + 10
      );
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
      key: "documentNumber",
      header: THAI_LABELS.documentNumber,
      width: "140px",
      render: (req) => (
        <span
          className="font-mono text-sm"
          style={{ color: "var(--color-primary)" }}
        >
          {req.documentNumber}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: THAI_LABELS.requestDate,
      width: "120px",
      render: (req) => formatDate(req.createdAt),
    },
    {
      key: "status",
      header: THAI_LABELS.status,
      width: "120px",
      align: "center",
      render: (req) => (
        <StatusBadge status={req.status as StatusType} size="sm" />
      ),
    },
    {
      key: "items",
      header: "รายการสินค้า",
      render: (req) => (
        <div>
          <div className="text-sm font-medium">
            {req.itemDetails?.length || req.items.length} รายการ
          </div>
          <div
            className="text-xs"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {req.itemDetails
              ?.slice(0, 2)
              .map((item) => item.name)
              .join(", ")}
            {(req.itemDetails?.length || 0) > 2 && "..."}
          </div>
        </div>
      ),
    },
    {
      key: "notes",
      header: THAI_LABELS.notes,
      render: (req) => (
        <div className="text-sm max-w-xs truncate" title={req.notes}>
          {req.notes || "-"}
        </div>
      ),
    },
    {
      key: "actions",
      header: "การดำเนินการ",
      width: "160px",
      align: "center",
      render: (req) => (
        <div className="flex gap-2 justify-center">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => showDetails(req)}
            className="cursor-pointer whitespace-nowrap min-w-[64px]"
          >
            ดูรายละเอียด
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => exportToPDF(req)}
            className="whitespace-nowrap min-w-[64px] cursor-pointer"
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
        <h1
          className="text-2xl font-bold"
          style={{ color: "var(--color-text)" }}
        >
          {THAI_LABELS.requisitionHistory}
        </h1>
        <p
          className="text-sm mt-1"
          style={{ color: "var(--color-text-secondary)" }}
        >
          ดูประวัติการเบิกสินค้าและสถานะการอนุมัติ
        </p>
      </div>

      {/* Filters */}
      <div
        className="p-4 rounded-lg border"
        style={{
          backgroundColor: "var(--color-surface)",
          borderColor: "var(--color-border)",
        }}
      >
        <div className="flex items-center gap-4">
          <label
            className="text-sm font-medium"
            style={{ color: "var(--color-text)" }}
          >
            กรองตามสถานะ:
          </label>
          <select
            className="px-3 py-2 rounded-md border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary"
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-border)",
              color: "var(--color-text)",
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
          backgroundColor: "var(--color-surface)",
          borderColor: "var(--color-border)",
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
          <div className="p-6 space-y-8">
            {/* Header Card - ข้อมูลหลัก */}
            <div
              className="rounded-2xl border bg-card/50 backdrop-blur-sm p-6 shadow-sm"
              style={{ borderColor: "var(--color-border)" }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    เลขที่เอกสาร
                  </p>
                  <p className="mt-1.5 font-mono text-lg font-bold text-primary">
                    {selectedRequisition.documentNumber}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    สถานะ
                  </p>
                  <div className="mt-2">
                    <StatusBadge
                      status={selectedRequisition.status as StatusType}
                      size="lg"
                    />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    วันที่สร้าง
                  </p>
                  <p className="mt-1.5 font-medium">
                    {formatDate(selectedRequisition.createdAt)}
                  </p>
                </div>
                {selectedRequisition.approvedAt && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      วันที่อนุมัติ
                    </p>
                    <p className="mt-1.5 font-medium text-green-600 dark:text-green-400">
                      {formatDate(selectedRequisition.approvedAt)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* รายการสินค้า */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="i-lucide-package w-5 h-5"></span>
                รายการสินค้าที่เบิก
              </h3>

              <div
                className="rounded-2xl border overflow-hidden shadow-md"
                style={{ borderColor: "var(--color-border)" }}
              >
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-foreground/80">
                          รหัสสินค้า
                        </th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-foreground/80">
                          ชื่อสินค้า
                        </th>
                        <th className="text-center px-6 py-4 text-sm font-semibold text-foreground/80">
                          จำนวนที่ขอ
                        </th>
                        <th className="text-center px-6 py-4 text-sm font-semibold text-foreground/80">
                          หน่วย
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {selectedRequisition.itemDetails?.map((item, index) => (
                        <tr
                          key={index}
                          className="hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-6 py-5">
                            <span className="font-mono text-primary font-semibold">
                              {item.code}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <div>
                              <p className="font-medium text-foreground">
                                {item.name}
                              </p>
                              {item.description && (
                                <p className="text-sm text-muted-foreground mt-0.5">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-5 text-center">
                            <span className="text-lg font-bold text-primary">
                              {item.requestedQuantity.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-center font-medium text-muted-foreground">
                            {item.unit}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* หมายเหตุ */}
            {selectedRequisition.notes && (
              <div
                className="rounded-xl border bg-muted/30 p-5"
                style={{ borderColor: "var(--color-border)" }}
              >
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  หมายเหตุ
                </p>
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {selectedRequisition.notes}
                </p>
              </div>
            )}

            {/* เหตุผลที่ปฏิเสธ */}
            {selectedRequisition.rejectionReason && (
              <div className="rounded-xl border-2 border-destructive/30 bg-destructive/5 p-5">
                <p className="text-sm font-semibold text-destructive mb-2 flex items-center gap-2">
                  <span className="i-lucide-alert-triangle w-5 h-5"></span>
                  เหตุผลที่ปฏิเสธ
                </p>
                <p className="text-destructive font-medium leading-relaxed">
                  {selectedRequisition.rejectionReason}
                </p>
              </div>
            )}

            {/* ปุ่ม Actions */}
            <div className="flex flex-wrap justify-end gap-3 pt-6 border-t border-border">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => exportToPDF(selectedRequisition)}
                className="gap-2 cursor-pointer"
                
              >
                <span className="i-lucide-download w-4 h-4 " ></span>
                Export PDF
              </Button>
              <Button
                size="lg"
                onClick={() => setShowDetailModal(false)}
                className="min-w-32 cursor-pointer"
              >
                ปิด
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
