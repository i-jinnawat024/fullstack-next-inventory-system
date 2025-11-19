import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'เข้าสู่ระบบ - ระบบเบิกสินค้าคลังสินค้า',
  description: 'เข้าสู่ระบบเบิกสินค้าคลังสินค้า',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}