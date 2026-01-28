"use client";

import React from "react"

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { useState, useCallback, useEffect } from "react";

const categories = [
  "All Categories",
  "Electronics",
  "Clothing",
  "Books",
  "Accessories",
  "Documents",
  "Keys",
  "Bags",
  "Sports Equipment",
  "Other",
];

export function ItemFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(() => searchParams.get("search") || "");

  // Update search state when URL params change
  useEffect(() => {
    const currentSearch = searchParams.get("search") || "";
    if (currentSearch !== search) {
      setSearch(currentSearch);
    }
  }, [searchParams, search]);

  const currentType = searchParams.get("type") || "all";
  const currentCategory = searchParams.get("category") || "all";
  const currentStatus = searchParams.get("status") || "all";

  const updateFilters = useCallback(
    (key: string, value: string) => {
      console.log(`updateFilters called with key: ${key}, value: ${value}`);
      const params = new URLSearchParams(searchParams.toString());
      if (value === "all" || value === "All Categories") {
        console.log("Deleting param:", key);
        params.delete(key);
      } else {
        console.log("Setting param:", key, value);
        params.set(key, value);
      }
      params.delete("page");
      const newUrl = `/items?${params.toString()}`;
      console.log("Pushing new URL:", newUrl);
      router.push(newUrl);
    },
    [router, searchParams]

  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters("search", search);
  };

  const clearFilters = () => {
    setSearch("");
    router.push("/items");
  };

  const hasFilters =
    currentType !== "all" ||
    currentCategory !== "all" ||
    currentStatus !== "all" ||
    search.trim() !== "";

  const activeFiltersCount = [
    currentType !== "all",
    currentCategory !== "all",
    currentStatus !== "all",
    search.trim() !== ""
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 pr-10"
        />
        {search && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              updateFilters("search", "");
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      <div className="flex flex-wrap items-center gap-3">
        <Select value={currentType} onValueChange={(v) => updateFilters("type", v)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Item Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
            <SelectItem value="found">Found</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={currentCategory === "all" ? "All Categories" : currentCategory}
          onValueChange={(v) => updateFilters("category", v)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={currentStatus} onValueChange={(v) => updateFilters("status", v)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="claimed">Claimed</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2">
            <X className="h-4 w-4" />
            Clear Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </Button>
        )}
      </div>
    </div>
  );
}
