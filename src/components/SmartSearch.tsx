"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Search, FileText, Book as BookIcon, Star, Zap, ChevronRight, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useResources } from "@/context/ResourceContext";
import { useBooks } from "@/context/BookContext";
import { SearchEngine, mapResourceToSearchable, mapBookToSearchable, SearchableItem } from "@/lib/search/SearchEngine";

export function SmartSearch() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchableItem[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { resources, fetchAllResources } = useResources();
  const { books, fetchBooks } = useBooks();

  // Combine resources and books into a single searchable list
  const searchableItems = useMemo(() => {
    const mappedResources = resources.map(mapResourceToSearchable);
    const mappedBooks = books.map(mapBookToSearchable);
    return [...mappedResources, ...mappedBooks];
  }, [resources, books]);

  const engine = useMemo(() => new SearchEngine(searchableItems), [searchableItems]);

  useEffect(() => {
    fetchAllResources();
    fetchBooks();
  }, [fetchAllResources, fetchBooks]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        setLoading(true);
        const searchResult = engine.search(query);
        if (Array.isArray(searchResult)) {
          setResults(searchResult);
          setMessage("");
        } else {
          setResults(searchResult.items);
          setMessage(searchResult.message);
        }
        setLoading(false);
      } else {
        setResults([]);
        setMessage("");
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, engine]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleItemClick = (item: SearchableItem) => {
    setIsOpen(false);
    setQuery("");
    const path = item.itemType === 'book' ? `/books/${item.id}` : `/resources/${item.id}`;
    router.push(path);
  };

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
    <div className="relative w-full max-w-xl mx-auto" ref={searchRef}>
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input
          placeholder="Search for notes, books, assignments..."
          className="pl-10 h-12 text-lg shadow-sm border-2 group-focus-within:border-primary transition-all rounded-xl"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        {query && (
          <button 
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {isOpen && (query || loading) && (
        <Card className="absolute top-full mt-2 w-full z-50 overflow-hidden shadow-2xl border-none rounded-2xl animate-in fade-in slide-in-from-top-2">
          {loading ? (
            <div className="p-8 text-center flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Searching high and low...</p>
            </div>
          ) : (
            <>
              {message && (
                <div className="px-4 py-2 bg-blue-50 text-blue-700 text-xs font-medium border-b flex items-center gap-2">
                  <Zap className="h-3 w-3 fill-blue-700" />
                  {message}
                </div>
              )}
              
              <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
                {results.length > 0 ? (
                  results.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      className="p-4 hover:bg-gray-50 cursor-pointer border-b last:border-none flex items-start gap-4 transition-colors group"
                    >
                      <div className={`p-3 rounded-xl shrink-0 ${item.itemType === 'book' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                        {item.itemType === 'book' ? <BookIcon className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h4 className="font-bold text-gray-900 truncate group-hover:text-primary transition-colors">
                            {highlightMatch(item.title, query)}
                          </h4>
                          <Badge variant={item.isFree ? "outline" : "secondary"} className={item.isFree ? "text-green-600 border-green-200 bg-green-50" : "bg-amber-100 text-amber-700"}>
                            {item.isFree ? "Free" : `NPR ${item.price}`}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                          <span className="flex items-center gap-1 font-semibold text-gray-700">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            {item.rating.toFixed(1)}
                          </span>
                          <span>•</span>
                          <span>{item.category}</span>
                          <span>•</span>
                          <span className="truncate">{item.author}</span>
                        </div>
                        
                        <p className="text-sm text-gray-500 line-clamp-1 italic">
                          {highlightMatch(item.description, query)}
                        </p>
                      </div>
                      
                      <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all self-center" />
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <Search className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No results found for "{query}"</p>
                    <p className="text-xs text-gray-400 mt-1">Try searching for something else</p>
                  </div>
                )}
              </div>
              
              {results.length > 0 && (
                <button 
                  onClick={() => {
                    setIsOpen(false);
                    router.push(`/search?q=${encodeURIComponent(query)}`);
                  }}
                  className="w-full py-3 bg-gray-50 hover:bg-gray-100 text-primary font-bold text-sm border-t transition-colors flex items-center justify-center gap-2"
                >
                  View All {results.length} Results
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </>
          )}
        </Card>
      )}
    </div>
  );
}
