import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../button';

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(
      screen.getByRole('button', { name: 'Click me' })
    ).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows disabled state correctly', () => {
    render(<Button disabled>Processing...</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Processing...');
  });

  it('applies correct variant styles', () => {
    render(<Button variant='secondary'>Secondary</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('bg-secondary');
    expect(button.className).toContain('text-secondary-foreground');
  });

  it('applies correct size styles', () => {
    render(<Button size='sm'>Small</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('h-9');
    expect(button.className).toContain('px-3');
  });
});
