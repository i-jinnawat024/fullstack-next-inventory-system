'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Requisition } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { StatusBadge, StatusType } from '@/components/ui/status-badge';
import { StatCard } from '@/components/dashboard/stat-card';
import { THAI_LABELS } from '@/lib/constants/thai-labels';
import { formatDate } from '@/lib/utils/format';

export default function RequisitionsPage() {
  const [recentRequisitions, setRecentRequisitions] = useState<Requisition[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    issued: 0
  });
  const [loading, setLoading] = useState(true);

  // Fetch recent requisitions and stats
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/requisitions');
      const result = await response.json();

      if (result.success) {
        const requisitions = result.data;
        setRecentRequisitions(requisitions.slice(0, 5)); // Show only 5 most recent

        // Calculate stats
        const stats = {
          total: requisitions.length,
          draft: requisitions.filter((r: Requisition) => r.status === 'draft').length,
          pending: requisitions.filter((r: Requisition) => r.status === 'pending').length,
          approved: requisitions.filter((r: Requisition) => r.status === 'approved').length,
          rejected: requisitions.filter((r: Requisition) => r.status === 'rejected').length,
          issued: requisitions.filter((r: Requisition) => r.status === 'issued').length,
        };
        setStats(stats);
      }
    } catch (error) {
      console.error('Error fetching requisitions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);



  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
            {THAI_LABELS.requisitions}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            จัดการการเบิกสินค้าและติดตามสถานะ
          </p>
        </div>
        <Link href="/requisitions/create">
          <Button>
            {THAI_LABELS.createRequisition}
          </Button>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/requisitions/create">
          <div
            className="p-6 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-primary)20' }}
              >
                <svg
                  className="w-6 h-6"
                  style={{ color: 'var(--color-primary)' }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>
                  สร้างใบเบิกใหม่
                </h3>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  เบิกสินค้าจากคลังสินค้า
                </p>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/requisitions/history">
          <div
            className="p-6 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-success)20' }}
              >
                <svg
                  className="w-6 h-6"
                  style={{ color: 'var(--color-success)' }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>
                  ประวัติการเบิก
                </h3>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  ดูประวัติและสถานะการเบิก
                </p>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Statistics */}
      <div>
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
          สถิติการเบิกสินค้า
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard
            title="ทั้งหมด"
            value={stats.total}
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            color="var(--color-text)"
          />
          <StatCard
            title={THAI_LABELS.draft}
            value={stats.draft}
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            }
            color="var(--color-text-secondary)"
          />
          <StatCard
            title={THAI_LABELS.pending}
            value={stats.pending}
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="var(--color-warning)"
          />
          <StatCard
            title={THAI_LABELS.approved}
            value={stats.approved}
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="var(--color-success)"
          />
          <StatCard
            title={THAI_LABELS.rejected}
            value={stats.rejected}
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="var(--color-error)"
          />
          <StatCard
            title={THAI_LABELS.issued}
            value={stats.issued}
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            }
            color="var(--color-primary)"
          />
        </div>
      </div>

      {/* Recent Requisitions */}
      <div
        className="p-6 rounded-lg border"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
            การเบิกล่าสุด
          </h2>
          <Link href="/requisitions/history">
            <Button variant="secondary" size="sm">
              ดูทั้งหมด
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-8" style={{ color: 'var(--color-text-secondary)' }}>
            {THAI_LABELS.loading}
          </div>
        ) : recentRequisitions.length === 0 ? (
          <div className="text-center py-8" style={{ color: 'var(--color-text-secondary)' }}>
            ยังไม่มีการเบิกสินค้า
          </div>
        ) : (
          <div className="space-y-3">
            {recentRequisitions.map((requisition) => (
              <div
                key={requisition.id}
                className="flex items-center justify-between p-4 rounded-md border"
                style={{
                  backgroundColor: 'var(--color-bg-secondary)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm" style={{ color: 'var(--color-primary)' }}>
                      {requisition.documentNumber}
                    </span>
                    <StatusBadge status={requisition.status as StatusType} size="sm" />
                  </div>
                  <div className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                    {requisition.items.length} รายการ • {formatDate(requisition.createdAt)}
                  </div>
                  {requisition.notes && (
                    <div className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                      {requisition.notes}
                    </div>
                  )}
                </div>
                <Link href={`/requisitions/history`}>
                  <Button variant="secondary" size="sm">
                    ดูรายละเอียด
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}