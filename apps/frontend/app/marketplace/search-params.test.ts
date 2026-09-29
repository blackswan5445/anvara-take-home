import { describe, expect, it } from 'vitest';
import { pageWindow, parseFilters, toQueryString } from './search-params';

describe('parseFilters', () => {
  it('keeps valid filters', () => {
    expect(
      parseFilters({
        q: ' podcast ',
        type: 'PODCAST',
        sort: 'price_asc',
        page: '2',
        available: 'true',
      })
    ).toEqual({
      q: 'podcast',
      type: 'PODCAST',
      sort: 'price_asc',
      page: '2',
      available: 'true',
    });
  });

  it('drops malformed values instead of forwarding them to the API', () => {
    expect(parseFilters({ type: 'BILLBOARD', sort: 'evil', page: '-1', available: 'yes' })).toEqual(
      {
        q: undefined,
        type: undefined,
        sort: undefined,
        page: undefined,
        available: undefined,
      }
    );
    expect(parseFilters({ page: ['3', '4'] }).page).toBe('3');
  });

  it('builds a query string without empty values', () => {
    expect(toQueryString({ q: 'a b', type: undefined, page: '2' })).toBe('?q=a+b&page=2');
    expect(toQueryString({})).toBe('');
  });
});

describe('pageWindow', () => {
  it('shows neighbours of the current page with gaps', () => {
    expect(pageWindow(6, 20)).toEqual([1, 'gap', 5, 6, 7, 'gap', 20]);
    expect(pageWindow(1, 3)).toEqual([1, 2, 3]);
    expect(pageWindow(2, 2)).toEqual([1, 2]);
  });
});
