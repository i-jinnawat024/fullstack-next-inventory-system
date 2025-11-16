import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-200 dark:text-gray-700">404</h1>
          <div className="mt-4">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              ไม่พบหน้าที่ต้องการ
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              ขออภัย ไม่พบหน้าที่คุณกำลังค้นหา
            </p>
          </div>
        </div>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          กลับหน้าหลัก
        </Link>
      </div>
    </div>
  );
}
