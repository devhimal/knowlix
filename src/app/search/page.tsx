"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Filter, SlidersHorizontal, ArrowUpDown, FileText, Book as BookIcon, Star, Zap, Clock, DollarSign, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useResources } from "@/context/ResourceContext";
import { useBooks } from "@/context/BookContext";
import { SearchEngine, mapResourceToSearchable, mapBookToSearchable, SearchableItem } from "@/lib/search/SearchEngine";
import { SmartSearch } from "@/components/SmartSearch";

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams?.get("q") || "";
  
  const { resources, fetchResources } = useResources();
  const { books, fetchBooks } = useBooks();

  const [filters, setFilters] = useState({
    category: "all",
    type: "all",
    isFree: undefined as boolean | undefined,
    minRating: 0,
  });

  const [sortBy, setSortBy] = useState("relevance");

  useEffect(() => {
    fetchResources();
    fetchBooks();
  }, [fetchResources, fetchBooks]);

  const searchableItems = useMemo(() => {
    const mappedResources = resources.map(mapResourceToSearchable);
    const mappedBooks = books.map(mapBookToSearchable);
    return [...mappedResources, ...mappedBooks];
  }, [resources, books]);

  const engine = useMemo(() => new SearchEngine(searchableItems), [searchableItems]);

  const { filteredItems, message } = useMemo(() => {
    const searchResult = engine.search(query, filters);
    let items = Array.isArray(searchResult) ? searchResult : searchResult.items;
    const msg = Array.isArray(searchResult) ? "" : searchResult.message;

    // Filter to only show approved resources (books don't have a status in the interface yet)
    items = items.filter(item => {
      if (item.itemType === 'resource') {
        return item.originalItem.status === 'approved';
      }
      return true; // Books currently all show up
    });

    // Apply secondary filters not handled by engine
    if (filters.type !== 'all') {
      items = items.filter(item => item.itemType === filters.type || item.type === filters.type);
    }

    // Sort items
    const sorted = [...items];
    if (sortBy === "newest") {
      sorted.sort((a, b) => new Date(b.originalItem.created_at).getTime() - new Date(a.originalItem.created_at).getTime());
    } else if (sortBy === "rating") {
      sorted.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "price_low") {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price_high") {
      sorted.sort((a, b) => b.price - a.price);
    }

    return { filteredItems: sorted, message: msg };
  }, [engine, query, filters, sortBy]);

  const categories = useMemo(() => {
    const cats = new Set(searchableItems.map(i => i.category));
    return Array.from(cats);
  }, [searchableItems]);

  const highlightMatch = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === highlight.toLowerCase() ? 
            <span key={i} className="bg-yellow-100 text-yellow-900 font-bold">{part}</span> : 
            part
        )}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-primary py-12 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-6">Search Results</h1>
          <SmartSearch />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-72 shrink-0">
            <Card className="p-6 sticky top-24 shadow-sm border-none">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Filter className="h-4 w-4" /> Filters
                </h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs text-primary"
                  onClick={() => setFilters({ category: "all", type: "all", isFree: undefined, minRating: 0 })}
                >
                  Reset
                </Button>
              </div>

              <div className="space-y-8">
                <div>
                  <Label className="text-sm font-semibold mb-3 block">Category</Label>
                  <Select value={filters.category} onValueChange={(v) => setFilters(f => ({ ...f, category: v }))}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-semibold mb-3 block">Content Type</Label>
                  <div className="space-y-2">
                    {[
                      { id: 'all', label: 'All Types' },
                      { id: 'resource', label: 'Resources' },
                      { id: 'book', label: 'Books' }
                    ].map(t => (
                      <div key={t.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`type-${t.id}`} 
                          checked={filters.type === t.id}
                          onCheckedChange={() => setFilters(f => ({ ...f, type: t.id }))}
                        />
                        <label htmlFor={`type-${t.id}`} className="text-sm cursor-pointer">{t.label}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold mb-3 block">Pricing</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="free-only" 
                        checked={filters.isFree === true}
                        onCheckedChange={(checked) => setFilters(f => ({ ...f, isFree: checked ? true : undefined }))}
                      />
                      <label htmlFor="free-only" className="text-sm cursor-pointer font-medium text-green-600">Free Only</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="premium-only" 
                        checked={filters.isFree === false}
                        onCheckedChange={(checked) => setFilters(f => ({ ...f, isFree: checked ? false : undefined }))}
                      />
                      <label htmlFor="premium-only" className="text-sm cursor-pointer font-medium text-amber-600">Premium Only</label>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold mb-3 block">Minimum Rating</Label>
                  <div className="flex flex-wrap gap-2">
                    {[4, 3, 2].map(r => (
                      <Button 
                        key={r}
                        variant={filters.minRating === r ? "default" : "outline"}
                        size="sm"
                        className="rounded-full h-8 px-3"
                        onClick={() => setFilters(f => ({ ...f, minRating: f.minRating === r ? 0 : r }))}
                      >
                        <Star className={`h-3 w-3 mr-1 ${filters.minRating === r ? "fill-white" : "fill-yellow-400 text-yellow-400"}`} />
                        {r}+
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="text-sm text-gray-500">
                Found <span className="font-bold text-gray-900">{filteredItems.length}</span> results 
                {query && <span> for "<span className="font-bold text-primary">{query}</span>"</span>}
              </div>

              <div className="flex items-center gap-2 bg-white p-1 rounded-lg border">
                <div className="p-2 text-gray-400">
                  <ArrowUpDown className="h-4 w-4" />
                </div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="border-none shadow-none w-[160px] focus:ring-0">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="rating">Top Rated</SelectItem>
                    <SelectItem value="price_low">Price: Low to High</SelectItem>
                    <SelectItem value="price_high">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {message && (
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-6 flex items-center gap-3 text-blue-800">
                <Zap className="h-5 w-5 fill-blue-500 text-blue-500" />
                <p className="text-sm font-medium">{message}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredItems.map(item => (
                <Card 
                  key={item.id} 
                  className="p-5 flex flex-col gap-4 hover:shadow-xl transition-all cursor-pointer group border-none shadow-sm"
                  onClick={() => router.push(item.itemType === 'book' ? `/books/${item.id}` : `/resources/${item.id}`)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-4 rounded-2xl shrink-0 group-hover:scale-110 transition-transform ${item.itemType === 'book' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                      {item.itemType === 'book' ? <BookIcon className="h-8 w-8" /> : <FileText className="h-8 w-8" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider">
                          {item.itemType}
                        </Badge>
                        <Badge variant={item.isFree ? "outline" : "secondary"} className={item.isFree ? "text-green-600 border-green-200 bg-green-50" : "bg-amber-100 text-amber-700"}>
                          {item.isFree ? "Free" : `NPR ${item.price}`}
                        </Badge>
                      </div>
                      <h3 className="font-bold text-xl text-gray-900 group-hover:text-primary transition-colors line-clamp-1">
                        {highlightMatch(item.title, query)}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {highlightMatch(item.description, query)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1 font-bold text-gray-700">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        {item.rating.toFixed(1)}
                        <span className="text-gray-400 font-normal">({item.totalRatings})</span>
                      </div>
                      <div className="text-gray-400">•</div>
                      <div className="text-gray-600 font-medium">{item.category}</div>
                    </div>
                    <div className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(item.originalItem.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </Card>
              ))}

              {filteredItems.length === 0 && (
                <div className="col-span-full py-20 text-center">
                  <div className="bg-gray-100 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="h-10 w-10 text-gray-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">No results found</h2>
                  <p className="text-gray-500">Try adjusting your filters or search terms.</p>
                  <Button variant="outline" className="mt-6" onClick={() => setFilters({ category: "all", type: "all", isFree: undefined, minRating: 0 })}>
                    Clear All Filters
                  </Button>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center">Loading search results...</div>}>
      <SearchResults />
    </Suspense>
  );
}
