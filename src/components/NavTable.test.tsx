import React from 'react';
import { render, screen } from '@testing-library/react';
import { NavTable } from './NavTable';
import { NavEntry } from '../types/navData';

describe('NavTable', () => {
  const navData: NavEntry[] = [
    { date: new Date('2025-05-09'), nav: 166.2945 },
    { date: new Date('2025-05-08'), nav: 168.1311 }
  ];

  it('renders table with correct data', () => {
    render(<NavTable navData={navData} />);
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('NAV')).toBeInTheDocument();
    expect(screen.getByText('2025-05-09')).toBeInTheDocument();
    expect(screen.getByText('166.29450')).toBeInTheDocument();
    expect(screen.getByText('2025-05-08')).toBeInTheDocument();
    expect(screen.getByText('168.13110')).toBeInTheDocument();
  });

  it('renders nothing if navData is empty', () => {
    const { container } = render(<NavTable navData={[]} />);
    expect(container.querySelector('table')).toBeNull();
  });
}); 