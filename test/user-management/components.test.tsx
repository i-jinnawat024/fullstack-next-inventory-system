import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserForm } from '@/components/admin/user-form';
import { UserList } from '@/components/admin/user-list';
import { ProfileEditForm } from '@/components/profile/profile-edit-form';
import { ChangePasswordForm } from '@/components/profile/change-password-form';
import { UserResponse } from '@/lib/types/user-management';

// Mock user data
const mockUser: UserResponse = {
  id: '1',
  firstName: 'สมชาย',
  lastName: 'ใจดี',
  email: 'somchai@example.com',
  department: 'IT',
  role: 'user',
  isActive: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const mockAdminUser: UserResponse = {
  id: '2',
  firstName: 'สมหญิง',
  lastName: 'ใจงาม',
  email: 'somying@example.com',
  department: 'HR',
  role: 'admin',
  isActive: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

describe('UserForm Component', () => {
  describe('Create Mode', () => {
    it('should render all required fields', () => {
      const mockOnSubmit = vi.fn();
      const mockOnCancel = vi.fn();

      render(
        <UserForm
          mode="create"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByPlaceholderText('กรอกชื่อ')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('กรอกนามสกุล')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('example@company.com')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('กรอกรหัสผ่าน')).toBeInTheDocument();
      expect(screen.getByLabelText(/แผนก/)).toBeInTheDocument();
      expect(screen.getByLabelText(/บทบาท/)).toBeInTheDocument();
    });

    it('should show validation errors for empty required fields', async () => {
      const mockOnSubmit = vi.fn();
      const mockOnCancel = vi.fn();

      render(
        <UserForm
          mode="create"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const submitButton = screen.getByRole('button', { name: /บันทึก/ });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('กรุณากรอกชื่อ')).toBeInTheDocument();
        expect(screen.getByText('กรุณากรอกนามสกุล')).toBeInTheDocument();
        expect(screen.getByText('กรุณากรอกอีเมล')).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show validation error for invalid email', async () => {
      const mockOnSubmit = vi.fn();
      const mockOnCancel = vi.fn();

      render(
        <UserForm
          mode="create"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const emailInput = screen.getByPlaceholderText('example@company.com');
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.blur(emailInput);

      const submitButton = screen.getByRole('button', { name: /บันทึก/ });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('รูปแบบอีเมลไม่ถูกต้อง')).toBeInTheDocument();
      });
    });

    it('should show validation error for short password', async () => {
      const mockOnSubmit = vi.fn();
      const mockOnCancel = vi.fn();

      render(
        <UserForm
          mode="create"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const passwordInput = screen.getByPlaceholderText('กรอกรหัสผ่าน');
      fireEvent.change(passwordInput, { target: { value: '123' } });
      fireEvent.blur(passwordInput);

      const submitButton = screen.getByRole('button', { name: /บันทึก/ });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร')).toBeInTheDocument();
      });
    });

    it('should toggle password visibility', () => {
      const mockOnSubmit = vi.fn();
      const mockOnCancel = vi.fn();

      render(
        <UserForm
          mode="create"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const passwordInput = screen.getByPlaceholderText('กรอกรหัสผ่าน') as HTMLInputElement;
      expect(passwordInput.type).toBe('password');

      const toggleButton = screen.getByLabelText(/แสดงรหัสผ่าน/);
      fireEvent.click(toggleButton);

      expect(passwordInput.type).toBe('text');

      fireEvent.click(toggleButton);
      expect(passwordInput.type).toBe('password');
    });

    it('should submit form with valid data', async () => {
      const mockOnSubmit = vi.fn().mockResolvedValue(undefined);
      const mockOnCancel = vi.fn();

      render(
        <UserForm
          mode="create"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      fireEvent.change(screen.getByPlaceholderText('กรอกชื่อ'), { target: { value: 'สมชาย' } });
      fireEvent.change(screen.getByPlaceholderText('กรอกนามสกุล'), { target: { value: 'ใจดี' } });
      fireEvent.change(screen.getByPlaceholderText('example@company.com'), { target: { value: 'somchai@example.com' } });
      fireEvent.change(screen.getByPlaceholderText('กรอกรหัสผ่าน'), { target: { value: 'password123' } });
      fireEvent.change(screen.getByLabelText(/แผนก/), { target: { value: 'IT' } });
      fireEvent.change(screen.getByLabelText(/บทบาท/), { target: { value: 'user' } });

      const submitButton = screen.getByRole('button', { name: /บันทึก/ });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
        const callArgs = mockOnSubmit.mock.calls[0][0];
        expect(callArgs).toEqual({
          firstName: 'สมชาย',
          lastName: 'ใจดี',
          email: 'somchai@example.com',
          password: 'password123',
          department: 'IT',
          role: 'user',
        });
      });
    });

    it('should call onCancel when cancel button is clicked', () => {
      const mockOnSubmit = vi.fn();
      const mockOnCancel = vi.fn();

      render(
        <UserForm
          mode="create"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /ยกเลิก/ });
      fireEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('should disable form during submission', () => {
      const mockOnSubmit = vi.fn();
      const mockOnCancel = vi.fn();

      render(
        <UserForm
          mode="create"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isSubmitting={true}
        />
      );

      const submitButton = screen.getByRole('button', { name: /กำลังบันทึก/ });
      expect(submitButton).toBeDisabled();

      const inputs = screen.getAllByRole('textbox');
      inputs.forEach(input => {
        expect(input).toBeDisabled();
      });
    });
  });

  describe('Edit Mode', () => {
    it('should render with initial data', () => {
      const mockOnSubmit = vi.fn();
      const mockOnCancel = vi.fn();

      render(
        <UserForm
          mode="edit"
          initialData={mockUser}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByDisplayValue('สมชาย')).toBeInTheDocument();
      expect(screen.getByDisplayValue('ใจดี')).toBeInTheDocument();
      expect(screen.getByDisplayValue('somchai@example.com')).toBeInTheDocument();
      expect(screen.getByLabelText(/สถานะ/)).toBeInTheDocument();
    });

    it('should not show password field in edit mode', () => {
      const mockOnSubmit = vi.fn();
      const mockOnCancel = vi.fn();

      render(
        <UserForm
          mode="edit"
          initialData={mockUser}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.queryByLabelText(/^รหัสผ่าน$/)).not.toBeInTheDocument();
    });

    it('should submit form with updated data', async () => {
      const mockOnSubmit = vi.fn().mockResolvedValue(undefined);
      const mockOnCancel = vi.fn();

      render(
        <UserForm
          mode="edit"
          initialData={mockUser}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const firstNameInput = screen.getByDisplayValue('สมชาย');
      fireEvent.change(firstNameInput, { target: { value: 'สมศักดิ์' } });

      const submitButton = screen.getByRole('button', { name: /บันทึก/ });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });
  });
});

describe('UserList Component', () => {
  const mockUsers: UserResponse[] = [mockUser, mockAdminUser];

  it('should render user list with data', () => {
    render(<UserList users={mockUsers} />);

    expect(screen.getByText('สมชาย ใจดี')).toBeInTheDocument();
    expect(screen.getByText('สมหญิง ใจงาม')).toBeInTheDocument();
    expect(screen.getByText('somchai@example.com')).toBeInTheDocument();
    expect(screen.getByText('somying@example.com')).toBeInTheDocument();
  });

  it('should display role badges correctly', () => {
    render(<UserList users={mockUsers} />);

    expect(screen.getByText('ผู้ใช้งาน')).toBeInTheDocument();
    expect(screen.getByText('ผู้ดูแลระบบ')).toBeInTheDocument();
  });

  it('should display status badges correctly', () => {
    render(<UserList users={mockUsers} />);

    const activeStatuses = screen.getAllByText('เปิดใช้งาน');
    expect(activeStatuses).toHaveLength(2);
  });

  it('should render action buttons for each user', () => {
    render(<UserList users={mockUsers} />);

    const viewButtons = screen.getAllByRole('button', { name: /ดูรายละเอียด/ });
    const editButtons = screen.getAllByRole('button', { name: /แก้ไข/ });

    expect(viewButtons).toHaveLength(2);
    expect(editButtons).toHaveLength(2);
  });

  it('should show loading state', () => {
    render(<UserList users={[]} loading={true} />);

    expect(screen.getByText('กำลังโหลด...')).toBeInTheDocument();
  });

  it('should show empty message when no users', () => {
    render(<UserList users={[]} />);

    expect(screen.getByText('ไม่มีผู้ใช้งานในระบบ')).toBeInTheDocument();
  });

  it('should render department information', () => {
    render(<UserList users={mockUsers} />);

    expect(screen.getByText('IT')).toBeInTheDocument();
    expect(screen.getByText('HR')).toBeInTheDocument();
  });
});

describe('ProfileEditForm Component', () => {
  it('should render with user data', () => {
    const mockOnSubmit = vi.fn();
    const mockOnCancel = vi.fn();

    render(
      <ProfileEditForm
        user={mockUser}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByDisplayValue('สมชาย')).toBeInTheDocument();
    expect(screen.getByDisplayValue('ใจดี')).toBeInTheDocument();
    expect(screen.getByDisplayValue('somchai@example.com')).toBeInTheDocument();
  });

  it('should show read-only fields', () => {
    const mockOnSubmit = vi.fn();
    const mockOnCancel = vi.fn();

    render(
      <ProfileEditForm
        user={mockUser}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('ข้อมูลที่ไม่สามารถแก้ไขได้')).toBeInTheDocument();
    expect(screen.getByText('IT')).toBeInTheDocument();
    expect(screen.getByText('ผู้ใช้งาน')).toBeInTheDocument();
  });

  it('should show validation errors', async () => {
    const mockOnSubmit = vi.fn();
    const mockOnCancel = vi.fn();

    render(
      <ProfileEditForm
        user={mockUser}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const firstNameInput = screen.getByDisplayValue('สมชาย');
    fireEvent.change(firstNameInput, { target: { value: '' } });
    fireEvent.blur(firstNameInput);

    const submitButton = screen.getByRole('button', { name: /บันทึก/ });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('กรุณากรอกชื่อ')).toBeInTheDocument();
    });
  });

  it('should submit form with valid data', async () => {
    const mockOnSubmit = vi.fn().mockResolvedValue(undefined);
    const mockOnCancel = vi.fn();

    render(
      <ProfileEditForm
        user={mockUser}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const firstNameInput = screen.getByDisplayValue('สมชาย');
    fireEvent.change(firstNameInput, { target: { value: 'สมศักดิ์' } });

    const submitButton = screen.getByRole('button', { name: /บันทึก/ });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
      const callArgs = mockOnSubmit.mock.calls[0][0];
      expect(callArgs).toEqual({
        firstName: 'สมศักดิ์',
        lastName: 'ใจดี',
        email: 'somchai@example.com',
      });
    });
  });

  it('should call onCancel when cancel button is clicked', () => {
    const mockOnSubmit = vi.fn();
    const mockOnCancel = vi.fn();

    render(
      <ProfileEditForm
        user={mockUser}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /ยกเลิก/ });
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('should disable submit button when form is not dirty', () => {
    const mockOnSubmit = vi.fn();
    const mockOnCancel = vi.fn();

    render(
      <ProfileEditForm
        user={mockUser}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const submitButton = screen.getByRole('button', { name: /บันทึก/ });
    expect(submitButton).toBeDisabled();
  });

  it('should disable form during submission', () => {
    const mockOnSubmit = vi.fn();
    const mockOnCancel = vi.fn();

    render(
      <ProfileEditForm
        user={mockUser}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isSubmitting={true}
      />
    );

    const submitButton = screen.getByRole('button', { name: /กำลังบันทึก/ });
    expect(submitButton).toBeDisabled();
  });
});

describe('ChangePasswordForm Component', () => {
  it('should render all password fields', () => {
    const mockOnSubmit = vi.fn();

    render(<ChangePasswordForm onSubmit={mockOnSubmit} />);

    expect(screen.getByPlaceholderText('กรอกรหัสผ่านปัจจุบัน')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('กรอกรหัสผ่านใหม่')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('กรอกรหัสผ่านใหม่อีกครั้ง')).toBeInTheDocument();
  });

  it('should toggle password visibility for all fields', () => {
    const mockOnSubmit = vi.fn();

    render(<ChangePasswordForm onSubmit={mockOnSubmit} />);

    const currentPasswordInput = screen.getByPlaceholderText('กรอกรหัสผ่านปัจจุบัน') as HTMLInputElement;
    const newPasswordInput = screen.getByPlaceholderText('กรอกรหัสผ่านใหม่') as HTMLInputElement;
    const confirmPasswordInput = screen.getByPlaceholderText('กรอกรหัสผ่านใหม่อีกครั้ง') as HTMLInputElement;

    expect(currentPasswordInput.type).toBe('password');
    expect(newPasswordInput.type).toBe('password');
    expect(confirmPasswordInput.type).toBe('password');

    const toggleButtons = screen.getAllByLabelText(/แสดงรหัสผ่าน/);
    fireEvent.click(toggleButtons[0]);

    expect(currentPasswordInput.type).toBe('text');
  });

  it('should show password strength indicator', () => {
    const mockOnSubmit = vi.fn();

    render(<ChangePasswordForm onSubmit={mockOnSubmit} />);

    const newPasswordInput = screen.getByPlaceholderText('กรอกรหัสผ่านใหม่');
    fireEvent.change(newPasswordInput, { target: { value: 'weak' } });

    expect(screen.getByText('ความแข็งแรงของรหัสผ่าน:')).toBeInTheDocument();
    expect(screen.getByText('อ่อนแอ')).toBeInTheDocument();
  });

  it('should update password strength indicator', () => {
    const mockOnSubmit = vi.fn();

    render(<ChangePasswordForm onSubmit={mockOnSubmit} />);

    const newPasswordInput = screen.getByPlaceholderText('กรอกรหัสผ่านใหม่');
    
    fireEvent.change(newPasswordInput, { target: { value: 'StrongP@ss123' } });

    expect(screen.getByText('แข็งแรง')).toBeInTheDocument();
  });

  it('should show validation error for password mismatch', async () => {
    const mockOnSubmit = vi.fn();

    render(<ChangePasswordForm onSubmit={mockOnSubmit} />);

    fireEvent.change(screen.getByPlaceholderText('กรอกรหัสผ่านปัจจุบัน'), { target: { value: 'oldpass123' } });
    fireEvent.change(screen.getByPlaceholderText('กรอกรหัสผ่านใหม่'), { target: { value: 'newpass123' } });
    fireEvent.change(screen.getByPlaceholderText('กรอกรหัสผ่านใหม่อีกครั้ง'), { target: { value: 'different123' } });

    const submitButton = screen.getByRole('button', { name: /เปลี่ยนรหัสผ่าน/ });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน')).toBeInTheDocument();
    });
  });

  it('should show validation errors for empty fields', async () => {
    const mockOnSubmit = vi.fn();

    render(<ChangePasswordForm onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByRole('button', { name: /เปลี่ยนรหัสผ่าน/ });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('กรุณากรอกรหัสผ่านปัจจุบัน')).toBeInTheDocument();
      expect(screen.getByText('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร')).toBeInTheDocument();
      expect(screen.getByText('กรุณายืนยันรหัสผ่านใหม่')).toBeInTheDocument();
    });
  });

  it('should submit form with valid data', async () => {
    const mockOnSubmit = vi.fn().mockResolvedValue(undefined);

    render(<ChangePasswordForm onSubmit={mockOnSubmit} />);

    fireEvent.change(screen.getByPlaceholderText('กรอกรหัสผ่านปัจจุบัน'), { target: { value: 'oldpass123' } });
    fireEvent.change(screen.getByPlaceholderText('กรอกรหัสผ่านใหม่'), { target: { value: 'newpass123' } });
    fireEvent.change(screen.getByPlaceholderText('กรอกรหัสผ่านใหม่อีกครั้ง'), { target: { value: 'newpass123' } });

    const submitButton = screen.getByRole('button', { name: /เปลี่ยนรหัสผ่าน/ });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
      const callArgs = mockOnSubmit.mock.calls[0][0];
      expect(callArgs).toEqual({
        currentPassword: 'oldpass123',
        newPassword: 'newpass123',
        confirmPassword: 'newpass123',
      });
    });
  });

  it('should call onCancel when cancel button is clicked', () => {
    const mockOnSubmit = vi.fn();
    const mockOnCancel = vi.fn();

    render(<ChangePasswordForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const cancelButton = screen.getByRole('button', { name: /ยกเลิก/ });
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('should disable form during submission', () => {
    const mockOnSubmit = vi.fn();

    render(<ChangePasswordForm onSubmit={mockOnSubmit} isSubmitting={true} />);

    const submitButton = screen.getByRole('button', { name: /กำลังเปลี่ยนรหัสผ่าน/ });
    expect(submitButton).toBeDisabled();

    const inputs = screen.getAllByLabelText(/รหัสผ่าน/);
    inputs.forEach(input => {
      expect(input).toBeDisabled();
    });
  });

  it('should show password requirements checklist', () => {
    const mockOnSubmit = vi.fn();

    render(<ChangePasswordForm onSubmit={mockOnSubmit} />);

    const newPasswordInput = screen.getByPlaceholderText('กรอกรหัสผ่านใหม่');
    fireEvent.change(newPasswordInput, { target: { value: 'test' } });

    expect(screen.getByText('รหัสผ่านควรมี:')).toBeInTheDocument();
    expect(screen.getByText('อย่างน้อย 8 ตัวอักษร')).toBeInTheDocument();
    expect(screen.getByText('ตัวอักษรพิมพ์ใหญ่')).toBeInTheDocument();
    expect(screen.getByText('ตัวอักษรพิมพ์เล็ก')).toBeInTheDocument();
    expect(screen.getByText('ตัวเลข')).toBeInTheDocument();
  });
});
