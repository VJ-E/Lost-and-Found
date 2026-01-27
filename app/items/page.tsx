import { Suspense } from "react";
import { Header } from "@/components/layout/header";
import { ItemFilters } from "@/components/items/item-filters";
import { ItemCard } from "@/components/items/item-card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Package } from "lucide-react";
import Link from "next/link";

interface SearchParams {
  type?: string;
  category?: string;
  status?: string;
  search?: string;
  page?: string;
}

async function getItems(searchParams: SearchParams) {
  const params = new URLSearchParams();

  if (searchParams.type) params.set("type", searchParams.type);
  if (searchParams.category) params.set("category", searchParams.category);
  if (searchParams.status) params.set("status", searchParams.status);
  if (searchParams.search) params.set("search", searchParams.search);
  params.set("page", searchParams.page || "1");
  params.set("limit", "12");

  const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : "http://localhost:3000";

  try {
    const response = await fetch(`${baseUrl}/api/items?${params.toString()}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return { items: [], pagination: { page: 1, pages: 1, total: 0 } };
    }

    return response.json();
  } catch {
    return { items: [], pagination: { page: 1, pages: 1, total: 0 } };
  }
}

export default async function ItemsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolvedParams = await searchParams;
  const { items, pagination } = await getItems(resolvedParams);
  const currentPage = parseInt(resolvedParams.page || "1");

  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams();
    if (resolvedParams.type) params.set("type", resolvedParams.type);
    if (resolvedParams.category) params.set("category", resolvedParams.category);
    if (resolvedParams.status) params.set("status", resolvedParams.status);
    if (resolvedParams.search) params.set("search", resolvedParams.search);
    params.set("page", String(page));
    return `/items?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Browse Items</h1>
          <p className="mt-2 text-muted-foreground">
            Search through lost and found items on campus
          </p>
        </div>

        <Suspense fallback={<div className="h-24 animate-pulse rounded-lg bg-muted" />}>
          <ItemFilters />
        </Suspense>

        <div className="mt-8">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card py-16">
              <Package className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-medium text-foreground">No items found</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Try adjusting your filters or search terms
              </p>
              <Link href="/items/new">
                <Button>Report an Item</Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-muted-foreground">
                Showing {items.length} of {pagination.total} items
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {items.map((item: Parameters<typeof ItemCard>[0]["item"]) => (
                  <ItemCard key={item._id} item={item} />
                ))}
              </div>

              {pagination.pages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  {currentPage > 1 ? (
                    <Link href={buildPageUrl(currentPage - 1)}>
                      <Button variant="outline" size="icon">
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                    </Link>
                  ) : (
                    <Button variant="outline" size="icon" disabled>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  )}

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <Link key={page} href={buildPageUrl(page)}>
                          <Button
                            variant={currentPage === page ? "default" : "outline"}
                            size="icon"
                          >
                            {page}
                          </Button>
                        </Link>
                      );
                    })}
                  </div>

                  {currentPage < pagination.pages ? (
                    <Link href={buildPageUrl(currentPage + 1)}>
                      <Button variant="outline" size="icon">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  ) : (
                    <Button variant="outline" size="icon" disabled>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
