import { describe, it, expect, beforeEach } from 'vitest';
import { mockDb } from '@/lib/database/mock-database';

describe('Notices API', () => {
  describe('Notice Management', () => {
    it('should create a new notice', async () => {
      const notice = await mockDb.createNotice({
        title: 'ประกาศทดสอบ',
        content: 'เนื้อหาประกาศทดสอบ',
        isActive: true,
        createdBy: '1'
      });

      expect(notice).toBeTruthy();
      expect(notice.title).toBe('ประกาศทดสอบ');
      expect(notice.content).toBe('เนื้อหาประกาศทดสอบ');
      expect(notice.isActive).toBe(true);
      expect(notice.createdBy).toBe('1');
    });

    it('should retrieve active notices only', async () => {
      // Create active notice
      await mockDb.createNotice({
        title: 'ประกาศเปิดใช้งาน',
        content: 'เนื้อหา',
        isActive: true,
        createdBy: '1'
      });

      // Create inactive notice
      const inactiveNotice = await mockDb.createNotice({
        title: 'ประกาศปิดใช้งาน',
        content: 'เนื้อหา',
        isActive: false,
        createdBy: '1'
      });

      const activeNotices = await mockDb.findActiveNotices();
      
      // Should not include inactive notice
      expect(activeNotices.every(n => n.isActive)).toBe(true);
      expect(activeNotices.find(n => n.id === inactiveNotice.id)).toBeUndefined();
    });

    it('should retrieve all notices including inactive', async () => {
      const initialCount = (await mockDb.findAllNotices()).length;

      // Create notices
      await mockDb.createNotice({
        title: 'ประกาศ 1',
        content: 'เนื้อหา',
        isActive: true,
        createdBy: '1'
      });

      await mockDb.createNotice({
        title: 'ประกาศ 2',
        content: 'เนื้อหา',
        isActive: false,
        createdBy: '1'
      });

      const allNotices = await mockDb.findAllNotices();
      expect(allNotices.length).toBe(initialCount + 2);
    });

    it('should update notice', async () => {
      const notice = await mockDb.createNotice({
        title: 'ประกาศเดิม',
        content: 'เนื้อหาเดิม',
        isActive: true,
        createdBy: '1'
      });

      const updated = await mockDb.updateNotice(notice.id, {
        title: 'ประกาศใหม่',
        content: 'เนื้อหาใหม่'
      });

      expect(updated).toBeTruthy();
      expect(updated!.title).toBe('ประกาศใหม่');
      expect(updated!.content).toBe('เนื้อหาใหม่');
      expect(updated!.isActive).toBe(true); // Should remain unchanged
    });

    it('should toggle notice active status', async () => {
      const notice = await mockDb.createNotice({
        title: 'ประกาศ',
        content: 'เนื้อหา',
        isActive: true,
        createdBy: '1'
      });

      // Deactivate
      const deactivated = await mockDb.updateNotice(notice.id, {
        isActive: false
      });

      expect(deactivated!.isActive).toBe(false);

      // Reactivate
      const reactivated = await mockDb.updateNotice(notice.id, {
        isActive: true
      });

      expect(reactivated!.isActive).toBe(true);
    });

    it('should delete notice', async () => {
      const notice = await mockDb.createNotice({
        title: 'ประกาศที่จะลบ',
        content: 'เนื้อหา',
        isActive: true,
        createdBy: '1'
      });

      const deleted = await mockDb.deleteNotice(notice.id);
      expect(deleted).toBe(true);

      const found = await mockDb.findNoticeById(notice.id);
      expect(found).toBeNull();
    });

    it('should return null when updating non-existent notice', async () => {
      const updated = await mockDb.updateNotice('999', {
        title: 'ทดสอบ'
      });

      expect(updated).toBeNull();
    });

    it('should return false when deleting non-existent notice', async () => {
      const deleted = await mockDb.deleteNotice('999');
      expect(deleted).toBe(false);
    });
  });

  describe('Notice Display', () => {
    it('should display notices on inventory page', async () => {
      // Create active notices
      const notice1 = await mockDb.createNotice({
        title: 'ประกาศสำคัญ',
        content: 'กรุณาอ่านประกาศนี้',
        isActive: true,
        createdBy: '1'
      });

      const notice2 = await mockDb.createNotice({
        title: 'แจ้งเตือน',
        content: 'มีการปรับปรุงระบบ',
        isActive: true,
        createdBy: '1'
      });

      const activeNotices = await mockDb.findActiveNotices();
      
      expect(activeNotices.length).toBeGreaterThanOrEqual(2);
      expect(activeNotices.find(n => n.id === notice1.id)).toBeTruthy();
      expect(activeNotices.find(n => n.id === notice2.id)).toBeTruthy();
    });

    it('should sort notices by creation date (newest first)', async () => {
      // Create notices with delays to ensure different timestamps
      const notice1 = await mockDb.createNotice({
        title: 'ประกาศแรก',
        content: 'เนื้อหา',
        isActive: true,
        createdBy: '1'
      });

      await new Promise(resolve => setTimeout(resolve, 10));

      const notice2 = await mockDb.createNotice({
        title: 'ประกาศที่สอง',
        content: 'เนื้อหา',
        isActive: true,
        createdBy: '1'
      });

      const notices = await mockDb.findActiveNotices();
      
      // Find our test notices
      const idx1 = notices.findIndex(n => n.id === notice1.id);
      const idx2 = notices.findIndex(n => n.id === notice2.id);
      
      // notice2 should come before notice1 (newer first)
      expect(idx2).toBeLessThan(idx1);
    });
  });
});
