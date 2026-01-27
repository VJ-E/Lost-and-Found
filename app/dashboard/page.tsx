import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Item } from "@/lib/models/Item";
import { Claim } from "@/lib/models/Claim";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, FileText, CheckCircle, Clock, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";

async function getUserStats(userId: string) {
  try {
    await connectToDatabase();

    const [
      totalItems,
      openItems,
      resolvedItems,
      totalClaims,
      pendingClaims,
      approvedClaims,
    ] = await Promise.all([
      Item.countDocuments({ reportedBy: userId }),
      Item.countDocuments({ reportedBy: userId, status: "open" }),
      Item.countDocuments({ reportedBy: userId, status: "resolved" }),
      Claim.countDocuments({ claimant: userId }),
      Claim.countDocuments({ claimant: userId, status: "pending" }),
      Claim.countDocuments({ claimant: userId, status: "approved" }),
    ]);

    return {
      items: { total: totalItems, open: openItems, resolved: resolvedItems },
      claims: { total: totalClaims, pending: pendingClaims, approved: approvedClaims },
    };
  } catch {
    return {
      items: { total: 0, open: 0, resolved: 0 },
      claims: { total: 0, pending: 0, approved: 0 },
    };
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin?callbackUrl=/dashboard");
  }

  const stats = await getUserStats(session.user.id);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {session.user.name?.split(" ")[0]}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {"Here's an overview of your activity"}
          </p>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                My Items
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.items.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.items.open} open, {stats.items.resolved} resolved
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                My Claims
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.claims.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.claims.pending} pending
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Claims
              </CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{stats.claims.pending}</div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Approved Claims
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{stats.claims.approved}</div>
              <p className="text-xs text-muted-foreground">Successfully claimed</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/items/new" className="block">
                <Button className="w-full justify-start gap-2 bg-transparent" variant="outline">
                  <Plus className="h-4 w-4" />
                  Report a Lost or Found Item
                </Button>
              </Link>
              <Link href="/items" className="block">
                <Button className="w-full justify-start gap-2 bg-transparent" variant="outline">
                  <Package className="h-4 w-4" />
                  Browse All Items
                </Button>
              </Link>
              <Link href="/my-items" className="block">
                <Button className="w-full justify-start gap-2 bg-transparent" variant="outline">
                  <FileText className="h-4 w-4" />
                  View My Items
                </Button>
              </Link>
              <Link href="/my-claims" className="block">
                <Button className="w-full justify-start gap-2 bg-transparent" variant="outline">
                  <CheckCircle className="h-4 w-4" />
                  View My Claims
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  1
                </div>
                <div>
                  <p className="font-medium text-foreground">Report an Item</p>
                  <p className="text-sm text-muted-foreground">
                    Lost something? Found something? Report it with details.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  2
                </div>
                <div>
                  <p className="font-medium text-foreground">Browse & Claim</p>
                  <p className="text-sm text-muted-foreground">
                    Search for your item and submit a claim with proof.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  3
                </div>
                <div>
                  <p className="font-medium text-foreground">Get Verified</p>
                  <p className="text-sm text-muted-foreground">
                    Admin reviews your claim and approves if valid.
                  </p>
                </div>
              </div>
              <Link
                href="/items"
                className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                Start browsing items
                <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
