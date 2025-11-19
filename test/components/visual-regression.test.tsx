import { render } from '@testing-library/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table } from '@/components/ui/table';
import { StatCard } from '@/components/dashboard/stat-card';

describe('Visual Regression Tests', () => {
  describe('Light Theme Snapshots', () => {
    beforeEach(() => {
      // Set light theme
      document.documentElement.removeAttribute('data-theme');
    });

    describe('Button Component', () => {
      it('should match snapshot for primary button', () => {
        const { container } = render(<Button variant="primary">Primary Button</Button>);
        expect(container.firstChild).toMatchSnapshot();
      });

      it('should match snapshot for secondary button', () => {
        const { container } = render(<Button variant="secondary">Secondary Button</Button>);
        expect(container.firstChild).toMatchSnapshot();
      });

      it('should match snapshot for tertiary button', () => {
        const { container } = render(<Button variant="tertiary">Tertiary Button</Button>);
        expect(container.firstChild).toMatchSnapshot();
      });

      it('should match snapshot for danger button', () => {
        const { container } = render(<Button variant="danger">Danger Button</Button>);
        expect(container.firstChild).toMatchSnapshot();
      });

      it('should match snapshot for loading button', () => {
        const { container } = render(<Button loading>Loading Button</Button>);
        expect(container.firstChild).toMatchSnapshot();
      });

      it('should match snapshot for disabled button', () => {
        const { container } = render(<Button disabled>Disabled Button</Button>);
        expect(container.firstChild).toMatchSnapshot();
      });
    });

    describe('Input Component', () => {
      it('should match snapshot for basic input', () => {
        const { container } = render(<Input label="Basic Input" placeholder="Enter text" />);
        expect(container.firstChild).toMatchSnapshot();
      });

      it('should match snapshot for required input', () => {
        const { container } = render(<Input label="Required Input" required />);
        expect(container.firstChild).toMatchSnapshot();
      });

      it('should match snapshot for input with error', () => {
        const { container } = render(
          <Input label="Error Input" error="This field is required" />
        );
        expect(container.firstChild).toMatchSnapshot();
      });

      it('should match snapshot for input with helper text', () => {
        const { container } = render(
          <Input label="Helper Input" helperText="This is helper text" />
        );
        expect(container.firstChild).toMatchSnapshot();
      });
    });

    describe('Table Component', () => {
      const mockData = [
        { id: 1, name: 'Item 1', quantity: 10, status: 'Active' },
        { id: 2, name: 'Item 2', quantity: 20, status: 'Inactive' },
      ];

      const mockColumns = [
        { key: 'id', header: 'ID' },
        { key: 'name', header: 'Name' },
        { key: 'quantity', header: 'Quantity', align: 'right' as const },
        { key: 'status', header: 'Status' },
      ];

      it('should match snapshot for table with data', () => {
        const { container } = render(<Table data={mockData} columns={mockColumns} />);
        expect(container.firstChild).toMatchSnapshot();
      });

      it('should match snapshot for loading table', () => {
        const { container } = render(<Table data={[]} columns={mockColumns} loading />);
        expect(container.firstChild).toMatchSnapshot();
      });

      it('should match snapshot for empty table', () => {
        const { container } = render(
          <Table data={[]} columns={mockColumns} emptyMessage="No data available" />
        );
        expect(container.firstChild).toMatchSnapshot();
      });
    });

    describe('StatCard Component', () => {
      it('should match snapshot for stat card with trend up', () => {
        const { container } = render(
          <StatCard
            title="Total Items"
            value={1234}
            icon="📦"
            trend={{ value: 12.5, direction: 'up' }}
          />
        );
        expect(container.firstChild).toMatchSnapshot();
      });

      it('should match snapshot for stat card with trend down', () => {
        const { container } = render(
          <StatCard
            title="Pending Orders"
            value={56}
            icon="⏳"
            trend={{ value: 8.3, direction: 'down' }}
          />
        );
        expect(container.firstChild).toMatchSnapshot();
      });

      it('should match snapshot for stat card without trend', () => {
        const { container } = render(
          <StatCard
            title="Total Users"
            value={789}
            icon="👥"
          />
        );
        expect(container.firstChild).toMatchSnapshot();
      });

      it('should match snapshot for loading stat card', () => {
        const { container } = render(
          <StatCard
            title="Loading"
            value={0}
            icon="📊"
            loading
          />
        );
        expect(container.firstChild).toMatchSnapshot();
      });
    });
  });

  describe('Dark Theme Snapshots', () => {
    beforeEach(() => {
      // Set dark theme
      document.documentElement.setAttribute('data-theme', 'dark');
    });

    afterEach(() => {
      // Clean up
      document.documentElement.removeAttribute('data-theme');
    });

    describe('Button Component', () => {
      it('should match snapshot for primary button in dark theme', () => {
        const { container } = render(<Button variant="primary">Primary Button</Button>);
        expect(container.firstChild).toMatchSnapshot();
      });

      it('should match snapshot for secondary button in dark theme', () => {
        const { container } = render(<Button variant="secondary">Secondary Button</Button>);
        expect(container.firstChild).toMatchSnapshot();
      });

      it('should match snapshot for tertiary button in dark theme', () => {
        const { container } = render(<Button variant="tertiary">Tertiary Button</Button>);
        expect(container.firstChild).toMatchSnapshot();
      });

      it('should match snapshot for danger button in dark theme', () => {
        const { container } = render(<Button variant="danger">Danger Button</Button>);
        expect(container.firstChild).toMatchSnapshot();
      });
    });

    describe('Input Component', () => {
      it('should match snapshot for basic input in dark theme', () => {
        const { container } = render(<Input label="Basic Input" placeholder="Enter text" />);
        expect(container.firstChild).toMatchSnapshot();
      });

      it('should match snapshot for input with error in dark theme', () => {
        const { container } = render(
          <Input label="Error Input" error="This field is required" />
        );
        expect(container.firstChild).toMatchSnapshot();
      });
    });

    describe('Table Component', () => {
      const mockData = [
        { id: 1, name: 'Item 1', quantity: 10, status: 'Active' },
        { id: 2, name: 'Item 2', quantity: 20, status: 'Inactive' },
      ];

      const mockColumns = [
        { key: 'id', header: 'ID' },
        { key: 'name', header: 'Name' },
        { key: 'quantity', header: 'Quantity', align: 'right' as const },
        { key: 'status', header: 'Status' },
      ];

      it('should match snapshot for table with data in dark theme', () => {
        const { container } = render(<Table data={mockData} columns={mockColumns} />);
        expect(container.firstChild).toMatchSnapshot();
      });

      it('should match snapshot for loading table in dark theme', () => {
        const { container } = render(<Table data={[]} columns={mockColumns} loading />);
        expect(container.firstChild).toMatchSnapshot();
      });
    });

    describe('StatCard Component', () => {
      it('should match snapshot for stat card with trend in dark theme', () => {
        const { container } = render(
          <StatCard
            title="Total Items"
            value={1234}
            icon="📦"
            trend={{ value: 12.5, direction: 'up' }}
          />
        );
        expect(container.firstChild).toMatchSnapshot();
      });

      it('should match snapshot for stat card without trend in dark theme', () => {
        const { container } = render(
          <StatCard
            title="Total Users"
            value={789}
            icon="👥"
          />
        );
        expect(container.firstChild).toMatchSnapshot();
      });
    });
  });
});
