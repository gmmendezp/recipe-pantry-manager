import { matchesSearch } from '../lib/search';

type FilterConfig<T> = {
  filters?: Array<(item: T) => boolean>;
  searchFields: (item: T) => Array<null | string | undefined>;
  searchQuery: string;
};

export function useFilteredList<T>(
  items: T[],
  { filters = [], searchFields, searchQuery }: FilterConfig<T>,
) {
  return items.filter(
    (item) =>
      matchesSearch(searchFields(item), searchQuery) &&
      filters.every((filter) => filter(item)),
  );
}
