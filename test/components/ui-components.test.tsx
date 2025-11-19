import { render, screen, fireEvent } from '@testing-library/react';
import { Button, Input, Modal, Table } from '@/components/ui';

describe('UI Components', () => {
  describe('Button', () => {
    it('should render button with text', () => {
      render(<Button>Test Button</Button>);
      expect(screen.getByRole('button')).toHaveTextContent('Test Button');
    });

    it('should handle click events', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click Me</Button>);
      
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should show loading state', () => {
      render(<Button loading>Loading Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button.querySelector('svg')).toBeInTheDocument();
    });

    it('should apply different variants', () => {
      const { rerender } = render(<Button variant="primary">Primary</Button>);
      let button = screen.getByRole('button');
      expect(button).toHaveStyle({ backgroundColor: 'var(--color-primary)' });

      rerender(<Button variant="secondary">Secondary</Button>);
      button = screen.getByRole('button');
      expect(button).toHaveStyle({ backgroundColor: 'var(--color-surface)' });
    });
  });

  describe('Input', () => {
    it('should render input with label', () => {
      render(<Input label="Test Label" />);
      
      expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
      expect(screen.getByText('Test Label')).toBeInTheDocument();
    });

    it('should show required indicator', () => {
      render(<Input label="Required Field" required />);
      
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('should display error message', () => {
      render(<Input label="Test" error="This field is required" />);
      
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('should display helper text', () => {
      render(<Input label="Test" helperText="Helper text here" />);
      
      expect(screen.getByText('Helper text here')).toBeInTheDocument();
    });

    it('should handle input changes', () => {
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} />);
      
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'test value' } });
      
      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe('Modal', () => {
    it('should not render when closed', () => {
      render(
        <Modal isOpen={false} onClose={() => {}}>
          <div>Modal Content</div>
        </Modal>
      );
      
      expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();
    });

    it('should render when open', () => {
      render(
        <Modal isOpen={true} onClose={() => {}}>
          <div>Modal Content</div>
        </Modal>
      );
      
      expect(screen.getByText('Modal Content')).toBeInTheDocument();
    });

    it('should render with title', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Test Modal">
          <div>Modal Content</div>
        </Modal>
      );
      
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
    });

    it('should call onClose when close button clicked', () => {
      const handleClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={handleClose} title="Test Modal">
          <div>Modal Content</div>
        </Modal>
      );
      
      const closeButton = screen.getByLabelText('ปิด');
      fireEvent.click(closeButton);
      
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Table', () => {
    const mockData = [
      { id: 1, name: 'Item 1', quantity: 10 },
      { id: 2, name: 'Item 2', quantity: 20 },
    ];

    const mockColumns = [
      { key: 'id', header: 'ID' },
      { key: 'name', header: 'Name' },
      { key: 'quantity', header: 'Quantity' },
    ];

    it('should render table with data', () => {
      render(<Table data={mockData} columns={mockColumns} />);
      
      expect(screen.getByText('ID')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Quantity')).toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });

    it('should show loading state', () => {
      render(<Table data={[]} columns={mockColumns} loading={true} />);
      
      expect(screen.getByText('กำลังโหลด...')).toBeInTheDocument();
    });

    it('should show empty message', () => {
      render(<Table data={[]} columns={mockColumns} emptyMessage="No data found" />);
      
      expect(screen.getByText('No data found')).toBeInTheDocument();
    });

    it('should handle row clicks', () => {
      const handleRowClick = vi.fn();
      render(<Table data={mockData} columns={mockColumns} onRowClick={handleRowClick} />);
      
      const firstRow = screen.getByText('Item 1').closest('tr');
      fireEvent.click(firstRow!);
      
      expect(handleRowClick).toHaveBeenCalledWith(mockData[0]);
    });
  });
});