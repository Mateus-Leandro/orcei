/**
 * Ordenação de resultados de busca por relevância no cliente.
 */

/** Score atribuído a um texto que não corresponde ao termo (o pior possível). */
export const NO_MATCH = Number.POSITIVE_INFINITY;

/** Remove acentos, apara as pontas e normaliza para minúsculas. */
export function normalizeSearchText(value: string | number | null | undefined): string {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Pontua a relevância de um texto em relação ao termo — quanto menor, melhor:
{@link NO_MATCH}
{@link normalizeSearchText}
 */
export function searchRelevanceScore(
  text: string | number | null | undefined,
  term: string,
): number {
  const normalizedText = normalizeSearchText(text);

  if (!normalizedText || !term) return NO_MATCH;
  if (normalizedText === term) return 0;
  if (normalizedText.startsWith(term)) return 1;
  if (normalizedText.split(/\s+/).some((word) => word.startsWith(term))) return 2;
  if (normalizedText.includes(term)) return 3;
  return NO_MATCH;
}

/**
 * Reordena `items` por relevância ao `term`, do mais relevante para o menos.
 */
export function sortBySearchRelevance<T>(
  items: T[],
  term: string,
  searchableFields: (item: T) => Array<string | number | null | undefined>,
): T[] {
  const normalizedTerm = normalizeSearchText(term);
  if (!normalizedTerm) return items;

  return items
    .map((item, index) => ({
      item,
      index,
      score: Math.min(
        ...searchableFields(item).map((field) => searchRelevanceScore(field, normalizedTerm)),
      ),
    }))
    .sort((a, b) => a.score - b.score || a.index - b.index)
    .map((entry) => entry.item);
}
