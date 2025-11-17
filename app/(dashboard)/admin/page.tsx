'use client';

import Link from 'next/link';
import { THAI_LABELS } from '@/lib/constants/thai-labels';

export default function AdminPage() {
  const adminSections = [
    {
      title: THAI_LABELS.approvalQueue,
      description: 'จัดการคำขอเบิกสินค้าที่รอการอนุมัติ',
      href: '/admin/approvals',
      icon: '✓',
    },
    {
      title: THAI_LABELS.stockAdjustments,
      description: 'ปรับปรุงสต็อกสินค้าในระบบ',
      href: '/admin/stock-adjustments',
      icon: '⚙',
    },
    {
      title: THAI_LABELS.notices,
      description: 'จัดการประกาศและข่าวสาร',
      href: '/admin/notices',
      icon: '📢',
    },
    {
      title: THAI_LABELS.reports,
      description: 'ดูรายงานและสถิติการใช้งาน',
      href: '/admin/reports',
      icon: '📊',
    },
    {
      title: THAI_LABELS.import,
      description: 'นำเข้าข้อมูลจากไฟล์ Excel',
      href: '/admin/import',
      icon: '📥',
    },
    {
      title: THAI_LABELS.products,
      description: 'จัดการข้อมูลสินค้า',
      href: '/admin/products',
      icon: '📦',
    },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
          {THAI_LABELS.adminPanel}
        </h1>
        <p className="text-sm md:text-base" style={{ color: 'var(--color-text-secondary)' }}>
          จัดการระบบและข้อมูลทั้งหมด
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {adminSections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="block p-6 rounded-lg transition-all duration-200 hover:shadow-lg"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div className="flex items-start space-x-4">
              <div
                className="text-3xl flex-shrink-0"
                style={{ color: 'var(--color-primary)' }}
              >
                {section.icon}
              </div>
              <div className="flex-1">
                <h2
                  className="text-lg font-semibold mb-2"
                  style={{ color: 'var(--color-text)' }}
                >
                  {section.title}
                </h2>
                <p
                  className="text-sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {section.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
