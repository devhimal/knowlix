import Fuse from 'fuse.js';

export interface SearchableItem {
  id: string;
  title: string;
  description: string;
  type: 'notes' | 'book' | 'assignment' | 'guide';
  category: string;
  author: string;
  tags: string[];
  rating: number;
  totalRatings: number;
  price: number;
  isFree: boolean;
  itemType: 'resource' | 'book';
  thumbnail?: string;
  originalItem: any;
}

const FUSE_OPTIONS = {
  keys: [
    { name: 'title', weight: 1.0 },
    { name: 'author', weight: 0.8 },
    { name: 'description', weight: 0.7 },
    { name: 'category', weight: 0.4 },
    { name: 'tags', weight: 0.4 }
  ],
  includeScore: true,
  threshold: 0.5,
  ignoreLocation: true,
  distance: 1000,
  useExtendedSearch: false,
  minMatchCharLength: 2,
};

export class SearchEngine {
  private fuse: Fuse<SearchableItem>;
  private items: SearchableItem[];

  constructor(items: SearchableItem[]) {
    this.items = items;
    this.fuse = new Fuse(items, FUSE_OPTIONS);
  }

  search(query: string, filters?: any) {
    if (!query || query.trim().length < 2) {
      if (!filters || Object.keys(filters).length === 0) {
        return { items: this.items.slice(0, 10), message: "" };
      }
      let filtered = [...this.items];
      filtered = this.applyFilters(filtered, filters);
      return { items: filtered.slice(0, 10), message: "" };
    }

    const normalizedQuery = query.toLowerCase().trim();
    const queryWords = normalizedQuery.split(/\s+/).filter(w => w.length >= 2);
    const queryNoSpace = normalizedQuery.replace(/\s+/g, '');

    // ─── STRATEGY 1: AGGRESSIVE SUBSTRING MATCH (Check ALL fields) ──────────
    // This catches copy-pasted descriptions even with weird formatting
    const substringMatches = this.items.filter(item => {
      const fields = [
        item.title,
        item.description,
        item.author,
        item.category,
        ...item.tags
      ].map(f => (f || '').toLowerCase());

      const contentCombined = fields.join(' ');
      const contentNoSpace = fields.join('').replace(/\s+/g, '');

      return contentCombined.includes(normalizedQuery) || contentNoSpace.includes(queryNoSpace);
    }).map(item => ({ ...item, searchScore: 0 }));

    // ─── STRATEGY 2: KEYWORD SURFACING (If any significant word matches) ───
    // This catches "This guide covers bachelors-management-bim" by finding "bachelors-management-bim"
    const wordMatches = this.items.filter(item => {
      if (substringMatches.some(m => m.id === item.id)) return false;
      
      const content = `${item.title} ${item.description} ${item.author} ${item.category} ${item.tags.join(' ')}`.toLowerCase();
      
      // Count how many significant words (3+ chars) match
      const matchedSignificantWords = queryWords.filter(word => word.length >= 3 && content.includes(word));
      
      // If ANY significant word from query matches, we include it (with lower priority)
      return matchedSignificantWords.length > 0;
    }).map(item => {
      // Priority based on how many words matched
      const content = `${item.title} ${item.description} ${item.author} ${item.category} ${item.tags.join(' ')}`.toLowerCase();
      const matchedWords = queryWords.filter(word => content.includes(word));
      const score = 0.5 - (matchedWords.length / queryWords.length) * 0.4; // 0.1 to 0.5
      return { ...item, searchScore: score };
    });

    // ─── STRATEGY 3: FUSE.JS FUZZY MATCH ────────────────────────────────────
    const fuzzyResults = this.fuse.search(query)
      .filter(r => 
        !substringMatches.some(m => m.id === r.item.id) && 
        !wordMatches.some(m => m.id === r.item.id)
      )
      .map(r => ({
        ...r.item,
        searchScore: r.score || 0.6
      }));

    // Combine all results
    let results = [...substringMatches, ...wordMatches, ...fuzzyResults];

    // Sort by combined priority/score
    results.sort((a, b) => (a.searchScore || 0) - (b.searchScore || 0));

    // Apply filters to search results
    results = this.applyFilters(results, filters);

    // ─── FALLBACK: NO RESULTS FOUND ─────────────────────────────────────────
    if (results.length === 0) {
      return {
        items: this.items.slice(0, 5),
        message: "No exact match found. Showing popular results..."
      };
    }

    return { items: results, message: "" };
  }

  private applyFilters(items: any[], filters?: any) {
    if (!filters) return items;
    let filtered = [...items];

    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(r => r.category.toLowerCase() === filters.category.toLowerCase());
    }
    if (filters.isFree !== undefined) {
      filtered = filtered.filter(r => r.isFree === filters.isFree);
    }
    if (filters.minRating) {
      filtered = filtered.filter(r => r.rating >= filters.minRating);
    }
    if (filters.type && filters.type !== 'all') {
      filtered = filtered.filter(item => item.itemType === filters.type || item.type === filters.type);
    }

    return filtered;
  }
}

export const mapResourceToSearchable = (resource: any): SearchableItem => ({
  id: resource.id,
  title: resource.title || '',
  description: resource.description || '',
  type: (resource.type as any) || 'notes',
  category: resource.category?.name || resource.category?.id || 'Uncategorized',
  author: resource.uploader || resource.uploader_name || 'Anonymous',
  tags: [resource.subjectName || '', resource.semester || ''].filter(Boolean),
  rating: resource.average_rating || 0,
  totalRatings: resource.total_ratings || 0,
  price: resource.price || 0,
  isFree: resource.isFree ?? true,
  itemType: 'resource',
  originalItem: resource
});

export const mapBookToSearchable = (book: any): SearchableItem => ({
  id: book.id,
  title: book.title || '',
  description: book.description || '',
  type: 'book',
  category: book.genre || 'Book',
  author: book.author || 'Unknown',
  tags: [book.condition || ''].filter(Boolean),
  rating: book.average_rating || 0,
  totalRatings: book.total_ratings || 0,
  price: book.price || 0,
  isFree: book.type === 'free',
  itemType: 'book',
  thumbnail: book.cover_image_url,
  originalItem: book
});
