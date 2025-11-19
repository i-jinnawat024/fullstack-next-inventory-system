'use client';

import { useState, useEffect } from 'react';
import { THAI_LABELS } from '@/lib/constants/thai-labels';
import { formatDate } from '@/lib/utils/format';
import { Notice } from '@/lib/types';

interface EnrichedNotice extends Notice {
  createdByUser: {
    id: string;
    name: string;
  } | null;
}

export default function NoticesPage() {
  const [notices, setNotices] = useState<EnrichedNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    isActive: true
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notices?all=true');
      if (response.ok) {
        const data = await response.json();
        setNotices(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching notices:', err);
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.title || !formData.content) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    try {
      setSubmitting(true);
      const url = editingId ? `/api/notices/${editingId}` : '/api/notices';
      const method = editingId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(editingId ? 'อัปเดตประกาศสำเร็จ' : 'สร้างประกาศสำเร็จ');
        setFormData({ title: '', content: '', isActive: true });
        setShowForm(false);
        setEditingId(null);
        fetchNotices();
      } else {
        setError(data.error?.message || 'เกิดข้อผิดพลาด');
      }
    } catch (err) {
      console.error('Error saving notice:', err);
      setError('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (notice: Notice) => {
    setFormData({
      title: notice.title,
      content: notice.content,
      isActive: notice.isActive
    });
    setEditingId(notice.id);
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบประกาศนี้?')) {
      return;
    }

    try {
      const response = await fetch(`/api/notices/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setSuccess('ลบประกาศสำเร็จ');
        fetchNotices();
      } else {
        const data = await response.json();
        setError(data.error?.message || 'เกิดข้อผิดพลาด');
      }
    } catch (err) {
      console.error('Error deleting notice:', err);
      setError('เกิดข้อผิดพลาดในการลบข้อมูล');
    }
  };

  const handleToggleActive = async (notice: Notice) => {
    try {
      const response = await fetch(`/api/notices/${notice.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !notice.isActive })
      });

      if (response.ok) {
        setSuccess(notice.isActive ? 'ปิดการใช้งานประกาศสำเร็จ' : 'เปิดการใช้งานประกาศสำเร็จ');
        fetchNotices();
      } else {
        const data = await response.json();
        setError(data.error?.message || 'เกิดข้อผิดพลาด');
      }
    } catch (err) {
      console.error('Error toggling notice:', err);
      setError('เกิดข้อผิดพลาดในการอัปเดตข้อมูล');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ title: '', content: '', isActive: true });
    setError('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">{THAI_LABELS.loading}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{THAI_LABELS.notices}</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) handleCancel();
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {showForm ? THAI_LABELS.cancel : 'สร้างประกาศใหม่'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      {showForm && (
        <div className="mb-6 p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? 'แก้ไขประกาศ' : 'สร้างประกาศใหม่'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                หัวข้อ *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                เนื้อหา *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                rows={5}
                required
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="isActive" className="text-sm font-medium">
                เปิดใช้งาน
              </label>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? THAI_LABELS.loading : THAI_LABELS.save}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                {THAI_LABELS.cancel}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {notices.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            {THAI_LABELS.noData}
          </div>
        ) : (
          notices.map((notice) => (
            <div key={notice.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold">{notice.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded ${
                      notice.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {notice.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                    </span>
                  </div>
                  <p className="text-gray-600 whitespace-pre-wrap">{notice.content}</p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(notice)}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    {THAI_LABELS.edit}
                  </button>
                  <button
                    onClick={() => handleToggleActive(notice)}
                    className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                  >
                    {notice.isActive ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                  </button>
                  <button
                    onClick={() => handleDelete(notice.id)}
                    className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                  >
                    {THAI_LABELS.delete}
                  </button>
                </div>
              </div>
              <div className="text-sm text-gray-500 mt-2">
                สร้างโดย: {notice.createdByUser?.name || '-'} | 
                สร้างเมื่อ: {formatDate(notice.createdAt)} | 
                อัปเดตเมื่อ: {formatDate(notice.updatedAt)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
