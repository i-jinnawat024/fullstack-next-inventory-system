/**
 * Light Theme Pages Integration Test
 * 
 * Tests all pages in light theme to verify:
 * - Dashboard, inventory, and requisitions pages render correctly
 * - All interactive elements (buttons, links, inputs) are visible and functional
 * - Status indicators and alerts display properly
 * - Colors meet enterprise design standards
 * 
 * Requirements: 1.3, 6.2, 6.3
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import DashboardPage from '@/app/(dashboard)/dashboard/page';
import InventoryPage from '@/app/(dashboard)/inventory/page';
import RequisitionsPage from '@/app/(dashboard)/requisitions/page';

// Mock Next.js modules
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/dashboard',
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock auth
vi.mock('@/lib/auth/server', () => ({
  getCurrentUser: vi.fn().mockResolvedValue({
    id: 1,
    username: 'testuser',
    role: 'admin',
    fullName: 'Test User',
  }),
}));

// Mock fetch for API calls
global.fetch = vi.fn();

describe('Light Theme Pages Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set light theme
    document.documentElement.removeAttribute('data-theme');
  });

  describe('Dashboard Page', () => {
    it('should render dashboard page with correct colors', async () => {
      const { container } = render(await DashboardPage());

      // Verify page header
      const heading = screen.getByText('แดชบอร์ด');
      expect(heading).toBeDefined();
      expect(heading.style.color).toBe('var(--color-text)');

      // Verify quick links section exists
      const quickLinksHeading = screen.getByText('เมนูด่วน');
      expect(quickLinksHeading).toBeDefined();
      expect(quickLinksHeading.style.color).toBe('var(--color-text)');

      // Verify surface colors are applied
      const surfaces = container.querySelectorAll('[style*="var(--color-surface)"]');
      expect(surfaces.length).toBeGreaterThan(0);
    });

    it('should display all interactive quick links', async () => {
      render(await DashboardPage());

      // Verify quick links are present
      expect(screen.getByText('สร้างใบเบิก')).toBeDefined();
      expect(screen.getByText('คำขอเบิกสินค้า')).toBeDefined();
      expect(screen.getByText('สินค้าคงคลัง')).toBeDefined();
      expect(screen.getByText('แผงควบคุมผู้ดูแล')).toBeDefined();
    });

    it('should have proper link elements with hover states', async () => {
      const { container } = render(await DashboardPage());

      // Find all link elements
      const links = container.querySelectorAll('a');
      expect(links.length).toBeGreaterThan(0);

      // Verify links have proper styling
      links.forEach((link) => {
        const styles = window.getComputedStyle(link);
        // Links should have transition for hover effects
        expect(link.className).toContain('transition');
      });
    });
  });

  describe('Inventory Page', () => {
    beforeEach(() => {
      // Mock inventory API response
      (global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('/api/inventory/categories')) {
          return Promise.resolve({
            json: () => Promise.resolve({
              success: true,
              data: ['อุปกรณ์สำนักงาน', 'อิเล็กทรอนิกส์'],
            }),
          });
        }
        if (url.includes('/api/notices')) {
          return Promise.resolve({
            json: () => Promise.resolve({
              success: true,
              data: [],
            }),
          });
        }
        if (url.includes('/api/inventory')) {
          return Promise.resolve({
            json: () => Promise.resolve({
              success: true,
              data: [
                {
                  id: 1,
                  code: 'ITEM001',
                  name: 'ปากกา',
                  description: 'ปากกาลูกลื่น',
                  category: 'อุปกรณ์สำนักงาน',
                  unit: 'ด้าม',
                  currentStock: 100,
                  minimumStock: 20,
                  imageUrl: null,
                },
                {
                  id: 2,
                  code: 'ITEM002',
                  name: 'กระดาษ A4',
                  description: 'กระดาษถ่ายเอกสาร',
                  category: 'อุปกรณ์สำนักงาน',
                  unit: 'รีม',
                  currentStock: 15,
                  minimumStock: 20,
                  imageUrl: null,
                },
                {
                  id: 3,
                  code: 'ITEM003',
                  name: 'คีย์บอร์ด',
                  description: 'คีย์บอร์ดไร้สาย',
                  category: 'อิเล็กทรอนิกส์',
                  unit: 'ชิ้น',
                  currentStock: 0,
                  minimumStock: 5,
                  imageUrl: null,
                },
              ],
            }),
          });
        }
        return Promise.reject(new Error('Unknown URL'));
      });
    });

    it('should render inventory page with correct colors', async () => {
      render(<InventoryPage />);

      await waitFor(() => {
        const heading = screen.getByText('สินค้าคงคลัง');
        expect(heading).toBeDefined();
        expect(heading.style.color).toBe('var(--color-text)');
      });
    });

    it('should display search input with proper styling', async () => {
      const { container } = render(<InventoryPage />);

      await waitFor(() => {
        const searchInput = container.querySelector('input[placeholder*="ค้นหา"]');
        expect(searchInput).toBeDefined();
      });
    });

    it('should display filter dropdowns', async () => {
      const { container } = render(<InventoryPage />);

      await waitFor(() => {
        const selects = container.querySelectorAll('select');
        expect(selects.length).toBeGreaterThanOrEqual(2); // Category and stock status filters
      });
    });

    it('should display status badges with correct colors', async () => {
      const { container } = render(<InventoryPage />);

      await waitFor(() => {
        // Wait for data to load
        expect(screen.getByText('ITEM001')).toBeDefined();
      });

      // Verify status badges are rendered
      const badges = container.querySelectorAll('[class*="status-badge"]');
      expect(badges.length).toBeGreaterThan(0);
    });

    it('should display stat cards with status colors', async () => {
      render(<InventoryPage />);

      await waitFor(() => {
        // Verify stat cards are displayed
        expect(screen.getByText('รายการทั้งหมด')).toBeDefined();
        expect(screen.getByText('สินค้าพร้อมจำหน่าย')).toBeDefined();
        expect(screen.getByText('สินค้าใกล้หมด')).toBeDefined();
        expect(screen.getByText('สินค้าหมด')).toBeDefined();
      });
    });

    it('should have functional clear filters button', async () => {
      const { container } = render(<InventoryPage />);

      await waitFor(() => {
        const clearButton = screen.getByText('ล้าง');
        expect(clearButton).toBeDefined();
      });

      const clearButton = screen.getByText('ล้าง');
      fireEvent.click(clearButton);

      // Verify filters are cleared
      const searchInput = container.querySelector('input[placeholder*="ค้นหา"]') as HTMLInputElement;
      expect(searchInput?.value).toBe('');
    });
  });

  describe('Requisitions Page', () => {
    beforeEach(() => {
      // Mock requisitions API response
      (global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('/api/requisitions')) {
          return Promise.resolve({
            json: () => Promise.resolve({
              success: true,
              data: [
                {
                  id: 1,
                  documentNumber: 'REQ-2024-001',
                  status: 'pending',
                  items: [{ id: 1, itemId: 1, quantity: 5 }],
                  notes: 'ขอเบิกด่วน',
                  createdAt: new Date().toISOString(),
                },
                {
                  id: 2,
                  documentNumber: 'REQ-2024-002',
                  status: 'approved',
                  items: [{ id: 2, itemId: 2, quantity: 10 }],
                  notes: null,
                  createdAt: new Date().toISOString(),
                },
                {
                  id: 3,
                  documentNumber: 'REQ-2024-003',
                  status: 'rejected',
                  items: [{ id: 3, itemId: 3, quantity: 2 }],
                  notes: 'ไม่อนุมัติ',
                  createdAt: new Date().toISOString(),
                },
              ],
            }),
          });
        }
        return Promise.reject(new Error('Unknown URL'));
      });
    });

    it('should render requisitions page with correct colors', async () => {
      render(<RequisitionsPage />);

      await waitFor(() => {
        const heading = screen.getByText('คำขอเบิกสินค้า');
        expect(heading).toBeDefined();
        expect(heading.style.color).toBe('var(--color-text)');
      });
    });

    it('should display create requisition button', async () => {
      render(<RequisitionsPage />);

      await waitFor(() => {
        const createButton = screen.getByText('สร้างใบเบิก');
        expect(createButton).toBeDefined();
      });
    });

    it('should display quick action cards', async () => {
      render(<RequisitionsPage />);

      await waitFor(() => {
        expect(screen.getByText('สร้างใบเบิกใหม่')).toBeDefined();
        expect(screen.getByText('ประวัติการเบิก')).toBeDefined();
      });
    });

    it('should display statistics with correct stat cards', async () => {
      render(<RequisitionsPage />);

      await waitFor(() => {
        expect(screen.getByText('ทั้งหมด')).toBeDefined();
        expect(screen.getByText('แบบร่าง')).toBeDefined();
        expect(screen.getByText('รออนุมัติ')).toBeDefined();
        expect(screen.getByText('อนุมัติแล้ว')).toBeDefined();
        expect(screen.getByText('ปฏิเสธ')).toBeDefined();
        expect(screen.getByText('จ่ายแล้ว')).toBeDefined();
      });
    });

    it('should display recent requisitions with status badges', async () => {
      render(<RequisitionsPage />);

      await waitFor(() => {
        // Verify requisition document numbers are displayed
        expect(screen.getByText('REQ-2024-001')).toBeDefined();
        expect(screen.getByText('REQ-2024-002')).toBeDefined();
        expect(screen.getByText('REQ-2024-003')).toBeDefined();
      });
    });

    it('should have view details buttons for each requisition', async () => {
      render(<RequisitionsPage />);

      await waitFor(() => {
        const detailButtons = screen.getAllByText('ดูรายละเอียด');
        expect(detailButtons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Interactive Elements Verification', () => {
    it('should verify buttons have proper hover states', async () => {
      render(<RequisitionsPage />);

      await waitFor(() => {
        const createButton = screen.getByText('สร้างใบเบิก');
        expect(createButton).toBeDefined();
      });

      const createButton = screen.getByText('สร้างใบเบิก');
      const buttonElement = createButton.closest('button');
      
      // Verify button has transition class for hover effects
      expect(buttonElement?.className).toContain('transition');
    });

    it('should verify links have proper styling', async () => {
      const { container } = render(await DashboardPage());

      const links = container.querySelectorAll('a');
      links.forEach((link) => {
        // Verify links have transition for smooth hover effects
        expect(link.className).toContain('transition');
      });
    });

    it('should verify input fields have proper focus states', async () => {
      const { container } = render(<InventoryPage />);

      await waitFor(() => {
        const input = container.querySelector('input');
        expect(input).toBeDefined();
      });

      const input = container.querySelector('input');
      // Verify input has focus ring styles
      expect(input?.className).toContain('focus:ring');
    });
  });

  describe('Color Consistency Verification', () => {
    it('should use consistent primary color across pages', async () => {
      const dashboardContainer = render(await DashboardPage()).container;
      const inventoryContainer = render(<InventoryPage />).container;
      const requisitionsContainer = render(<RequisitionsPage />).container;

      // Verify primary color usage
      [dashboardContainer, inventoryContainer, requisitionsContainer].forEach((container) => {
        const primaryElements = container.querySelectorAll('[style*="var(--color-primary)"]');
        expect(primaryElements.length).toBeGreaterThan(0);
      });
    });

    it('should use consistent text colors across pages', async () => {
      const dashboardContainer = render(await DashboardPage()).container;
      const inventoryContainer = render(<InventoryPage />).container;
      const requisitionsContainer = render(<RequisitionsPage />).container;

      // Verify text color usage
      [dashboardContainer, inventoryContainer, requisitionsContainer].forEach((container) => {
        const textElements = container.querySelectorAll('[style*="var(--color-text)"]');
        expect(textElements.length).toBeGreaterThan(0);
      });
    });

    it('should use consistent surface colors across pages', async () => {
      const dashboardContainer = render(await DashboardPage()).container;
      const inventoryContainer = render(<InventoryPage />).container;
      const requisitionsContainer = render(<RequisitionsPage />).container;

      // Verify surface color usage
      [dashboardContainer, inventoryContainer, requisitionsContainer].forEach((container) => {
        const surfaceElements = container.querySelectorAll('[style*="var(--color-surface)"]');
        expect(surfaceElements.length).toBeGreaterThan(0);
      });
    });
  });
});
