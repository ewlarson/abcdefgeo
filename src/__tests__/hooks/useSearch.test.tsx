import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { useSearch } from '../../hooks/useSearch';
import { ApiProvider } from '../../context/ApiContext';
import { DebugProvider } from '../../context/DebugContext';
import { fetchSearchResults } from '../../services/api';

vi.mock('../../services/api', () => ({
  fetchSearchResults: vi.fn(),
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <ApiProvider>
      <DebugProvider>{children}</DebugProvider>
    </ApiProvider>
  </BrowserRouter>
);

const renderUseSearch = (initialSearchParams = '') => {
  window.history.pushState(
    {},
    '',
    initialSearchParams ? `/?${initialSearchParams}` : '/'
  );

  return renderHook(() => useSearch(), {
    wrapper: TestWrapper,
  });
};

describe('useSearch', () => {
  const mockFetchSearchResults = vi.mocked(fetchSearchResults);

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchSearchResults.mockResolvedValue({
      jsonapi: { version: '1.0', profile: [] },
      data: [],
      links: { self: '', first: '', last: '' },
      meta: {
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        perPage: 20,
        query: '',
      },
      included: [],
    });
  });

  afterEach(() => {
    window.history.pushState({}, '', '/');
  });

  it('skips search when no query or filters are provided', async () => {
    const { result } = renderUseSearch();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.results).toBeNull();
    expect(mockFetchSearchResults).not.toHaveBeenCalled();
  });

  it('fetches query searches with the shared 20-result page size', async () => {
    renderUseSearch('q=geospatial%20data');

    await waitFor(() => {
      expect(mockFetchSearchResults).toHaveBeenCalledWith(
        'geospatial data',
        1,
        20,
        [],
        expect.any(Function),
        'relevance',
        [],
        [],
        undefined,
        expect.any(URLSearchParams)
      );
    });
  });

  it('fetches bbox-only searches', async () => {
    renderUseSearch(
      'include_filters[geo][type]=bbox' +
        '&include_filters[geo][field]=dcat_bbox' +
        '&include_filters[geo][top_left][lat]=45' +
        '&include_filters[geo][top_left][lon]=-95' +
        '&include_filters[geo][bottom_right][lat]=40' +
        '&include_filters[geo][bottom_right][lon]=-90'
    );

    await waitFor(() => {
      expect(mockFetchSearchResults).toHaveBeenCalledWith(
        '',
        1,
        20,
        [],
        expect.any(Function),
        'relevance',
        [],
        [],
        undefined,
        expect.any(URLSearchParams)
      );
    });
  });

  it('preserves geo bbox params when updating regular facets', async () => {
    const { result } = renderUseSearch(
      'q=&include_filters[geo][type]=bbox' +
        '&include_filters[geo][field]=dcat_bbox' +
        '&include_filters[geo][top_left][lat]=45' +
        '&include_filters[geo][top_left][lon]=-95' +
        '&include_filters[geo][bottom_right][lat]=40' +
        '&include_filters[geo][bottom_right][lon]=-90' +
        '&include_filters[gbl_resourceClass_sm][]=Maps'
    );

    await waitFor(() => {
      expect(mockFetchSearchResults).toHaveBeenCalledTimes(1);
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.updateSearch({
        facets: [{ field: 'schema_provider_s', value: 'Minnesota' }],
      });
    });

    await waitFor(() => {
      expect(mockFetchSearchResults).toHaveBeenCalledWith(
        '',
        1,
        20,
        [{ field: 'schema_provider_s', value: 'Minnesota' }],
        expect.any(Function),
        'relevance',
        [],
        [],
        undefined,
        expect.any(URLSearchParams)
      );
      expect(result.current.isLoading).toBe(false);
    });

    const params = new URLSearchParams(window.location.search);
    expect(params.get('include_filters[geo][type]')).toBe('bbox');
    expect(params.get('include_filters[geo][top_left][lat]')).toBe('45');
    expect(params.get('include_filters[gbl_resourceClass_sm][]')).toBeNull();
    expect(params.get('include_filters[schema_provider_s][]')).toBe(
      'Minnesota'
    );
  });

  it('returns default perPage when no results are loaded', () => {
    const { result } = renderUseSearch();

    expect(result.current.perPage).toBe(20);
  });
});
