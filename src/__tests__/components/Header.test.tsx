import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Header } from '../../components/layout/Header';
import { I18nProvider } from '../../context/I18nContext';
import { ThemeProvider } from '../../context/ThemeContext';
import { THEME_STORAGE_KEY } from '../../config/institution';

vi.mock('../../components/SearchField', () => ({
  SearchField: () => <input aria-label="Search input" />,
}));

vi.mock('../../components/search/ResourceClassFilterTabs', () => ({
  ResourceClassFilterTabs: () => <nav aria-label="Resource class filters" />,
}));

function renderHeader(themeId: 'unr' | 'btaa') {
  window.localStorage.setItem(THEME_STORAGE_KEY, themeId);

  return render(
    <MemoryRouter>
      <ThemeProvider initialThemeId={themeId}>
        <I18nProvider>
          <Header />
        </I18nProvider>
      </ThemeProvider>
    </MemoryRouter>
  );
}

describe('Header', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders the UNR proof-of-concept banner as the topmost header content', () => {
    const { container } = renderHeader('unr');

    const banner = screen.getByRole('status');
    expect(banner).toHaveTextContent(
      'NOTICE: This is an experimental proof-of-concept.'
    );
    expect(banner).toHaveClass('bg-[#007ab8]');
    expect(banner).toHaveClass('border-[#041e42]');
    expect(container.querySelector('header')?.firstElementChild).toBe(banner);
    expect(container.querySelector('a[href="/map"]')).not.toBeInTheDocument();
  });

  it('does not render a sitewide banner for themes without banner config', () => {
    renderHeader('btaa');

    expect(
      screen.queryByText('NOTICE: This is an experimental proof-of-concept.')
    ).not.toBeInTheDocument();
  });
});
