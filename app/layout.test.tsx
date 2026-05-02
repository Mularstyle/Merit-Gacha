import { render } from '@testing-library/react';
import RootLayout, { metadata } from './layout';

// Mock Navigation component
jest.mock('@/components/Navigation', () => {
  return function MockNavigation() {
    return <nav data-testid="navigation">Mock Navigation</nav>;
  };
});

describe('RootLayout', () => {
  it('should render with Thai font support', () => {
    const { container } = render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );

    const html = container.querySelector('html');
    expect(html).toHaveAttribute('lang', 'th');
    expect(html).toHaveClass('dark');
  });

  it('should apply dark theme globally', () => {
    const { container } = render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );

    const body = container.querySelector('body');
    expect(body).toHaveClass('bg-gradient-to-b');
    expect(body).toHaveClass('from-gray-900');
    expect(body).toHaveClass('via-gray-800');
    expect(body).toHaveClass('to-black');
    expect(body).toHaveClass('text-gray-100');
  });

  it('should include Navigation component', () => {
    const { getByTestId } = render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );

    expect(getByTestId('navigation')).toBeInTheDocument();
  });

  it('should render children in main element', () => {
    const { container } = render(
      <RootLayout>
        <div data-testid="test-child">Test Content</div>
      </RootLayout>
    );

    const main = container.querySelector('main');
    expect(main).toBeInTheDocument();
    expect(main?.querySelector('[data-testid="test-child"]')).toBeInTheDocument();
  });

  it('should have correct metadata', () => {
    expect(metadata.title).toBe('ศาลพระภูมิศักดิ์สิทธิ์ Gacha');
    expect(metadata.description).toBe('Merit Gacha - Thai-inspired prayer gacha experience');
  });

  it('should use Thai font variable', () => {
    const { container } = render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );

    const body = container.querySelector('body');
    expect(body?.className).toContain('font-sans');
  });
});
