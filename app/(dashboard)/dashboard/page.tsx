import Link from 'next/link';
import { THAI_LABELS } from '@/lib/constants/thai-labels';
import { getCurrentUser } from '@/lib/auth/server';
import { redirect } from 'next/navigation';

// Force dynamic rendering to avoid hydration mismatch
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  // Define all quick links
  const allQuickLinks = [
    {
      title: THAI_LABELS.createRequisition,
      description: 'สร้างคำขอเบิกสินค้าใหม่',
      href: '/requisitions/create',
      icon: '➕',
      color: 'var(--color-primary)',
      roles: ['user', 'admin'],
    },
    {
      title: THAI_LABELS.requisitions,
      description: 'ดูคำขอเบิกสินค้าของฉัน',
      href: '/requisitions',
      icon: '📋',
      color: '#60a5fa',
      roles: ['user', 'admin'],
    },
    {
      title: THAI_LABELS.inventory,
      description: 'ตรวจสอบสินค้าคงคลัง',
      href: '/inventory',
      icon: '📦',
      color: '#34d399',
      roles: ['user', 'admin'],
    },
    {
      title: THAI_LABELS.adminPanel,
      description: 'จัดการระบบ (สำหรับผู้ดูแล)',
      href: '/admin',
      icon: '⚙',
      color: '#a78bfa',
      roles: ['admin'],
    },
  ];

  // Filter quick links based on user role
  const quickLinks = allQuickLinks.filter(link => link.roles.includes(user.role));

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Page Header - Responsive spacing */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
          {THAI_LABELS.dashboard}
        </h1>
        <p className="text-sm md:text-base" style={{ color: 'var(--color-text-secondary)' }}>
          {/* ภาพรวมระบบเบิกสินค้า • อัปเดตอัตโนมัติทุก 30 วินาที */}
          ภาพรวมระบบเบิกสินค้า
        </p>
      </div>

      {/* Key Metrics Section - Responsive spacing and grid */}
      {/* <section className="mb-6 md:mb-8">
        <h2 className="text-lg md:text-xl font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
          ตัวชี้วัดหลัก
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatCard
            title="คำขอรออนุมัติ"
            value={stats.pendingRequisitions}
            icon="⏳"
            color="#fbbf24"
            loading={loading}
            trend={stats.pendingRequisitions > 5 ? { value: 12, direction: 'up' } : undefined}
          />
          <StatCard
            title="สินค้าใกล้หมด"
            value={stats.lowStockItems}
            icon="⚠️"
            color="#f87171"
            loading={loading}
            trend={stats.lowStockItems > 0 ? { value: 8, direction: 'down' } : undefined}
          />
          <StatCard
            title="คำขอทั้งหมด"
            value={stats.totalRequisitions}
            icon="📊"
            color="#60a5fa"
            loading={loading}
          />
          <StatCard
            title="รายการสินค้า"
            value={stats.totalItems}
            icon="📦"
            color="#34d399"
            loading={loading}
          />
        </div>
      </section> */}

      {/* Charts Section - Responsive spacing and grid */}
      {/* <section className="mb-6 md:mb-8">
        <h2 className="text-lg md:text-xl font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
          แนวโน้มและสถิติ
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <div
            className="p-6 rounded-lg"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
              แนวโน้มการเบิกสินค้า (6 เดือนล่าสุด)
            </h3>
            <LineChart
              data={trendData}
              xAxisKey="month"
              lines={[
                { dataKey: 'requisitions', name: 'คำขอทั้งหมด', color: '#60a5fa' },
                { dataKey: 'issued', name: 'จ่ายแล้ว', color: '#34d399' },
              ]}
              loading={loading}
              height={280}
            />
          </div>

          <div
            className="p-6 rounded-lg"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
              การกระจายสถานะคำขอ
            </h3>
            <DonutChart
              data={statusDistribution}
              loading={loading}
              height={280}
            />
          </div>
        </div>
      </section> */}

      {/* Status Breakdown Section - Responsive spacing and grid */}
      {/* <section className="mb-6 md:mb-8">
        <h2 className="text-lg md:text-xl font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
          รายละเอียดสถานะ
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          <StatCard
            title="อนุมัติแล้ว"
            value={stats.approvedRequisitions}
            icon="✅"
            color="#34d399"
            loading={loading}
          />
          <StatCard
            title="จ่ายแล้ว"
            value={stats.issuedRequisitions}
            icon="📦"
            color="#60a5fa"
            loading={loading}
          />
          <StatCard
            title="ปฏิเสธ"
            value={stats.rejectedRequisitions}
            icon="❌"
            color="#f87171"
            loading={loading}
          />
        </div>
      </section> */}

      {/* Quick Links Section - Responsive spacing and grid */}
      <section>
        <h2 className="text-lg md:text-xl font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
          เมนูด่วน
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block p-6 rounded-lg transition-all duration-200 hover:shadow-lg"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div className="text-center">
                <div
                  className="text-4xl mb-3"
                  style={{ color: link.color }}
                >
                  {link.icon}
                </div>
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: 'var(--color-text)' }}
                >
                  {link.title}
                </h3>
                <p
                  className="text-sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {link.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
