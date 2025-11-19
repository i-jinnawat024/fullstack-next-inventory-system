'use client';

import { useNotification } from '@/lib/contexts/notification-context';
import { Button } from '@/components/ui/button';

/**
 * Demo component to test the notification system
 * Shows all notification types and features
 */
export function NotificationDemo() {
  const { showSuccess, showError, showWarning, showInfo } = useNotification();

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h2
          className="text-2xl font-semibold mb-2"
          style={{ color: 'var(--color-text)' }}
        >
          ทดสอบระบบแจ้งเตือน
        </h2>
        <p
          className="text-sm"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          คลิกปุ่มด้านล่างเพื่อทดสอบการแจ้งเตือนแต่ละประเภท
        </p>
      </div>

      <div className="space-y-4">
        {/* Success Notification */}
        <div>
          <h3
            className="text-sm font-medium mb-2"
            style={{ color: 'var(--color-text)' }}
          >
            Success Notification (สีเขียว)
          </h3>
          <div className="flex gap-2">
            <Button
              variant="primary"
              onClick={() =>
                showSuccess('บันทึกสำเร็จ', 'ข้อมูลของคุณถูกบันทึกเรียบร้อยแล้ว')
              }
            >
              แสดงการแจ้งเตือนสำเร็จ
            </Button>
            <Button
              variant="secondary"
              onClick={() => showSuccess('อนุมัติสำเร็จ')}
            >
              แสดงแบบสั้น
            </Button>
          </div>
        </div>

        {/* Error Notification */}
        <div>
          <h3
            className="text-sm font-medium mb-2"
            style={{ color: 'var(--color-text)' }}
          >
            Error Notification (สีแดง)
          </h3>
          <div className="flex gap-2">
            <Button
              variant="danger"
              onClick={() =>
                showError(
                  'เกิดข้อผิดพลาด',
                  'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง'
                )
              }
            >
              แสดงการแจ้งเตือนข้อผิดพลาด
            </Button>
            <Button
              variant="secondary"
              onClick={() => showError('บันทึกไม่สำเร็จ')}
            >
              แสดงแบบสั้น
            </Button>
          </div>
        </div>

        {/* Warning Notification */}
        <div>
          <h3
            className="text-sm font-medium mb-2"
            style={{ color: 'var(--color-text)' }}
          >
            Warning Notification (สีเหลือง)
          </h3>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() =>
                showWarning(
                  'คำเตือน',
                  'สต็อกสินค้าใกล้หมด กรุณาเติมสต็อกโดยเร็ว'
                )
              }
            >
              แสดงการแจ้งเตือนคำเตือน
            </Button>
            <Button
              variant="secondary"
              onClick={() => showWarning('สต็อกใกล้หมด')}
            >
              แสดงแบบสั้น
            </Button>
          </div>
        </div>

        {/* Info Notification */}
        <div>
          <h3
            className="text-sm font-medium mb-2"
            style={{ color: 'var(--color-text)' }}
          >
            Info Notification (สีน้ำเงิน)
          </h3>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() =>
                showInfo(
                  'ข้อมูล',
                  'ระบบจะปิดปรับปรุงในวันที่ 1 มกราคม 2567 เวลา 00:00-06:00 น.'
                )
              }
            >
              แสดงการแจ้งเตือนข้อมูล
            </Button>
            <Button
              variant="secondary"
              onClick={() => showInfo('กำลังโหลดข้อมูล...')}
            >
              แสดงแบบสั้น
            </Button>
          </div>
        </div>

        {/* Multiple Notifications */}
        <div>
          <h3
            className="text-sm font-medium mb-2"
            style={{ color: 'var(--color-text)' }}
          >
            Multiple Notifications (ทดสอบการซ้อนกัน)
          </h3>
          <Button
            variant="primary"
            onClick={() => {
              showInfo('กำลังประมวลผล...', 'กรุณารอสักครู่');
              setTimeout(() => {
                showSuccess('ขั้นตอนที่ 1 สำเร็จ', 'กำลังดำเนินการขั้นตอนถัดไป');
              }, 500);
              setTimeout(() => {
                showSuccess('ขั้นตอนที่ 2 สำเร็จ', 'กำลังดำเนินการขั้นตอนสุดท้าย');
              }, 1000);
              setTimeout(() => {
                showSuccess('เสร็จสมบูรณ์', 'ทุกขั้นตอนเสร็จสิ้นแล้ว');
              }, 1500);
            }}
          >
            แสดงหลายการแจ้งเตือน
          </Button>
        </div>

        {/* Custom Duration */}
        <div>
          <h3
            className="text-sm font-medium mb-2"
            style={{ color: 'var(--color-text)' }}
          >
            Custom Duration (ระยะเวลาแสดงผล)
          </h3>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() =>
                showInfo('แสดง 2 วินาที', 'จะหายไปอัตโนมัติใน 2 วินาที', 2000)
              }
            >
              2 วินาที
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                showInfo('แสดง 10 วินาที', 'จะหายไปอัตโนมัติใน 10 วินาที', 10000)
              }
            >
              10 วินาที
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                showWarning(
                  'แสดงตลอด',
                  'ต้องปิดด้วยตนเอง (กดปุ่ม X)',
                  0
                )
              }
            >
              ไม่หายอัตโนมัติ
            </Button>
          </div>
        </div>

        {/* Stress Test */}
        <div>
          <h3
            className="text-sm font-medium mb-2"
            style={{ color: 'var(--color-text)' }}
          >
            Stress Test (ทดสอบประสิทธิภาพ)
          </h3>
          <Button
            variant="tertiary"
            onClick={() => {
              for (let i = 1; i <= 10; i++) {
                setTimeout(() => {
                  const types = ['success', 'error', 'warning', 'info'] as const;
                  const type = types[Math.floor(Math.random() * types.length)];
                  const funcs = { success: showSuccess, error: showError, warning: showWarning, info: showInfo };
                  funcs[type](`การแจ้งเตือนที่ ${i}`, `ทดสอบการแสดงผลหลายๆ การแจ้งเตือน`);
                }, i * 200);
              }
            }}
          >
            แสดง 10 การแจ้งเตือนติดกัน
          </Button>
        </div>
      </div>

      <div
        className="mt-8 p-4 rounded-lg"
        style={{
          backgroundColor: 'var(--color-surface-hover)',
          borderLeft: '4px solid var(--color-info)',
        }}
      >
        <h4
          className="font-semibold mb-2"
          style={{ color: 'var(--color-text)' }}
        >
          💡 คำแนะนำ
        </h4>
        <ul
          className="text-sm space-y-1"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <li>• การแจ้งเตือนจะปรากฏที่มุมขวาบน</li>
          <li>• จะหายไปอัตโนมัติหลังจาก 5 วินาที (ถ้าไม่ได้กำหนดเวลาเอง)</li>
          <li>• สามารถปิดด้วยตนเองได้โดยคลิกปุ่ม X</li>
          <li>• การแจ้งเตือนหลายๆ อันจะซ้อนกันในแนวตั้ง</li>
          <li>• สีจะเปลี่ยนตามธีมที่เลือก (สว่าง/มืด)</li>
        </ul>
      </div>
    </div>
  );
}
