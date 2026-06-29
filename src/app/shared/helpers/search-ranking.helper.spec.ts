import {
  NO_MATCH,
  normalizeSearchText,
  searchRelevanceScore,
  sortBySearchRelevance,
} from './search-ranking.helper';

describe('search-ranking.helper', () => {
  describe('normalizeSearchText', () => {
    it('deve normalizar maiúsculas, acentos e espaços', () => {
      expect(normalizeSearchText('  Cimento ')).toBe('cimento');
      expect(normalizeSearchText('Café')).toBe('cafe');
      expect(normalizeSearchText(2179)).toBe('2179');
      expect(normalizeSearchText(null)).toBe('');
    });
  });

  describe('searchRelevanceScore', () => {
    it('deve pontuar do mais relevante (0) ao menos relevante', () => {
      expect(searchRelevanceScore('Cimento', 'cimento')).toBe(0);
      expect(searchRelevanceScore('Cimento cp2', 'cimento')).toBe(1);
      expect(searchRelevanceScore('Bebedouro cimento', 'cimento')).toBe(2);
      expect(searchRelevanceScore('Saco de Cimentos', 'cimento')).toBe(3);
      expect(searchRelevanceScore('Argamassa', 'cimento')).toBe(NO_MATCH);
    });
  });

  describe('sortBySearchRelevance', () => {
    const products = [
      { code: 3249, name: 'Bebedouro cimento 0,80x0,50 medio' },
      { code: 2179, name: 'Cimento cp2 ROCA a prazo' },
      { code: 2178, name: 'Cimento cp2 ROCA a vista' },
    ];

    it('deve trazer quem começa com o termo primeiro, mantendo a ordem da API nos empates', () => {
      const ordered = sortBySearchRelevance(products, 'cimento', (p) => [p.code, p.name]);
      expect(ordered.map((p) => p.code)).toEqual([2179, 2178, 3249]);
    });

    it('deve priorizar correspondência exata de código', () => {
      const ordered = sortBySearchRelevance(products, '3249', (p) => [p.code, p.name]);
      expect(ordered[0].code).toBe(3249);
    });

    it('deve devolver a lista intacta para termo vazio', () => {
      const ordered = sortBySearchRelevance(products, '   ', (p) => [p.code, p.name]);
      expect(ordered).toBe(products);
    });
  });
});
