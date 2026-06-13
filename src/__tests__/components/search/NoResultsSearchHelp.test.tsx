import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NoResultsSearchHelp } from '../../../components/search/NoResultsSearchHelp';
import { fetchNominatimSearch, fetchSuggestions } from '../../../services/api';

vi.mock('../../../services/api', () => ({
  fetchNominatimSearch: vi.fn(),
  fetchSuggestions: vi.fn(),
}));

const renderHelp = (query: string) =>
  render(
    <MemoryRouter initialEntries={[`/search?q=${encodeURIComponent(query)}`]}>
      <NoResultsSearchHelp
        query={query}
        advancedSearchHref="/search?showAdvanced=true"
      />
    </MemoryRouter>
  );

describe('NoResultsSearchHelp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows empty suggestion states when services return no matches', async () => {
    vi.mocked(fetchSuggestions).mockResolvedValue([]);
    vi.mocked(fetchNominatimSearch).mockResolvedValue({ data: [] });

    renderHelp('zzzzzz');

    expect(screen.getByText('No search results found')).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByText('No close keyword suggestions found.')
      ).toBeInTheDocument();
      expect(
        screen.getByText('No matching geographic areas found.')
      ).toBeInTheDocument();
    });
  });

  it('links to suggested searches and geographic areas', async () => {
    vi.mocked(fetchSuggestions).mockResolvedValue([
      {
        type: 'suggestion',
        id: '1',
        attributes: { text: 'Minnesota', score: 1 },
      },
    ]);
    vi.mocked(fetchNominatimSearch).mockResolvedValue({
      data: [
        {
          type: 'gazetteer_place',
          id: 'osm-1',
          attributes: {
            name: 'Minneapolis',
            display_name: 'Minneapolis, Hennepin County, Minnesota',
            placetype: 'city',
            min_latitude: 44.8,
            max_latitude: 45.1,
            min_longitude: -93.4,
            max_longitude: -93.1,
          },
        },
      ],
    });

    renderHelp('minnesota');

    expect(
      await screen.findByRole('link', { name: 'Minnesota' })
    ).toHaveAttribute('href', '/search?q=Minnesota');
    expect(screen.getByRole('link', { name: /Minneapolis/i })).toHaveAttribute(
      'href',
      expect.stringContaining('include_filters%5Bgeo%5D%5Btype%5D=bbox')
    );
  });
});
