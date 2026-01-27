import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Item } from "@/lib/models/Item";
import { Header } from "@/components/layout/header";
import { ItemCard } from "@/components/items/item-card";
import { Button } from "@/components/ui/button";
import { Package, Plus } from "lucide-react";
import Link from "next/link";

async function getMyItems(userId: string) {
  try {
    await connectToDatabase();
    const items = await Item.find({ reportedBy: userId })
      .sort({ createdAt: -1 })
      .lean();

    return items.map((item) => ({
      ...item,
      _id: item._id.toString(),
      reportedBy: item.reportedBy?.toString(),
      claimedBy: item.claimedBy?.toString(),
      date: item.date.toISOString(),
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      resolvedAt: item.resolvedAt?.toISOString(),
    }));
  } catch {
    return [];
  }
}

export default async function MyItemsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin?callbackUrl=/my-items");
  }

  const items = await getMyItems(session.user.id);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Items</h1>
            <p className="mt-2 text-muted-foreground">
              Manage items you have reported
            </p>
          </div>
          <Link href="/items/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Report Item
            </Button>
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card py-16">
            <Package className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-medium text-foreground">No items yet</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              {"You haven't reported any lost or found items yet"}
            </p>
            <Link href="/items/new">
              <Button>Report Your First Item</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
