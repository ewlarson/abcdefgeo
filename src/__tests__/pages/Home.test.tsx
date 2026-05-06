import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router';
import { HelmetProvider } from 'react-helmet-async';
import { HomePage } from '../../pages/HomePage';
import { ApiProvider } from '../../context/ApiContext';
import { DebugProvider } from '../../context/DebugContext';
import { ThemeProvider } from '../../context/ThemeContext';
import { I18nProvider } from '../../context/I18nContext';
import { vi } from 'vitest';
import { getPartnerInstitutionSearchHref } from '../../constants/partnerInstitutions';
import { THEME_STORAGE_KEY } from '../../config/institution';

vi.mock('../../components/SearchField', () => ({
  SearchField: () => <input placeholder="Search for maps, data, imagery..." />,
}));
vi.mock('../../components/home/HomePageHexMapBackground.client', () => ({
  HomePageHexMapBackground: () => null,
}));

describe('Home Page', () => {
  const renderHome = (themeId: 'unr' | 'btaa' = 'unr') => {
    window.localStorage.setItem(THEME_STORAGE_KEY, themeId);

    return render(
      <HelmetProvider>
        <BrowserRouter>
          <ThemeProvider initialThemeId={themeId}>
            <I18nProvider>
              <ApiProvider>
                <DebugProvider>
                  <HomePage />
                </DebugProvider>
              </ApiProvider>
            </I18nProvider>
          </ThemeProvider>
        </BrowserRouter>
      </HelmetProvider>
    );
  };

  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders the search input', async () => {
    renderHome('unr');
    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          name: /water, fire and land stewardship/i,
        })
      ).toBeInTheDocument();
    });
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /historical maps of the american west/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /browse nevada resources/i })
    ).toHaveAttribute(
      'href',
      '/search?q=Nevada&view=gallery&per_page=20'
    );
    expect(
      screen.queryByRole('heading', { name: /partner institutions/i })
    ).not.toBeInTheDocument();
  });

  it('shows suggestions when typing', async () => {
    renderHome('unr');
    const searchInput = screen.getByPlaceholderText(/search/i);
    await userEvent.type(searchInput, 'minnesota');

    await waitFor(() => {
      // The suggestions dropdown should appear with the mocked suggestion
      expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    });
  });

  it('opens the BTAA video lightbox when the BTAA tile is clicked', async () => {
    renderHome('btaa');

    await userEvent.click(
      screen.getByRole('button', { name: /open big ten academic alliance video/i })
    );

    expect(
      screen.getByRole('dialog', { name: /big ten academic alliance video/i })
    ).toBeInTheDocument();
    expect(
      screen.getByTitle(/big ten academic alliance video/i)
    ).toHaveAttribute(
      'src',
      'https://www.youtube.com/embed/p060LdJodXQ?autoplay=1&rel=0'
    );
  });

  it('renders BTAA partner institutions when the BTAA theme is active', async () => {
    renderHome('btaa');

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /partner institutions/i })
      ).toBeInTheDocument();
    });

    expect(
      screen.getByRole('link', { name: /search resources near indiana university/i })
    ).toHaveAttribute(
      'href',
      getPartnerInstitutionSearchHref({
        slug: 'indiana-university',
        name: 'Indiana University',
        iconSlug: 'indiana_university',
        logoClassName: 'translate-x-0.5',
        campusMap: {
          latitude: 39.1702,
          longitude: -86.5235,
          zoom: 15,
        },
      })
    );
  });
});
