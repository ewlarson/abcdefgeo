import { describe, expect, it } from 'vitest';
import {
  buildSearchPageTitle,
  getSearchTitleConstraints,
} from '../../utils/searchPageTitle';

describe('searchPageTitle', () => {
  it('uses the default title when there are no query constraints', () => {
    expect(buildSearchPageTitle(new URLSearchParams())).toBe('Search Results');
  });

  it('uses the query alone when no constraints are present', () => {
    expect(buildSearchPageTitle(new URLSearchParams('q=county maps'))).toBe(
      'Search: county maps'
    );
  });

  it('combines query, facets, bbox, and advanced clauses', () => {
    const params = new URLSearchParams();
    params.set('q', 'roads');
    params.append('include_filters[schema_provider_s][]', 'Minnesota');
    params.append('exclude_filters[gbl_resourceClass_sm][]', 'Imagery');
    params.set('include_filters[geo][type]', 'bbox');
    params.set('include_filters[geo][top_left][lat]', '45');
    params.set('include_filters[geo][top_left][lon]', '-95');
    params.set('include_filters[geo][bottom_right][lat]', '40');
    params.set('include_filters[geo][bottom_right][lon]', '-90');
    params.set(
      'adv_q',
      JSON.stringify([{ op: 'AND', f: 'dct_title_s', q: 'county' }])
    );

    expect(getSearchTitleConstraints(params)).toEqual([
      'Provider: Minnesota',
      'Exclude Resource Class: Imagery',
      'Bounding Box: -95 40 -90 45',
      'AND Title: county',
    ]);
    expect(buildSearchPageTitle(params)).toBe(
      'roads / Provider: Minnesota / Exclude Resource Class: Imagery / Bounding Box: -95 40 -90 45 / AND Title: county'
    );
  });

  it('deduplicates duplicate facet constraints', () => {
    const params = new URLSearchParams();
    params.append('fq[dct_spatial_sm][]', 'Iowa');
    params.append('include_filters[dct_spatial_sm][]', 'Iowa');

    expect(getSearchTitleConstraints(params)).toEqual(['Place: Iowa']);
  });
});
