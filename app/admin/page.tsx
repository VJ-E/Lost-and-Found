import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Item } from "@/lib/models/Item";
import { Claim } from "@/lib/models/Claim";
import { User } from "@/lib/models/User";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Package,
  FileText,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

async function getAdminStats() {
  try {
    await connectToDatabase();

    const [
      totalItems,
      lostItems,
      foundItems,
      openItems,
      claimedItems,
      resolvedItems,
      totalClaims,
      pendingClaims,
      approvedClaims,
      rejectedClaims,
      totalUsers,
      recentItems,
      recentClaims,
    ] = await Promise.all([
      Item.countDocuments(),
      Item.countDocuments({ type: "lost" }),
      Item.countDocuments({ type: "found" }),
      Item.countDocuments({ status: "open" }),
      Item.countDocuments({ status: "claimed" }),
      Item.countDocuments({ status: "resolved" }),
      Claim.countDocuments(),
      Claim.countDocuments({ status: "pending" }),
      Claim.countDocuments({ status: "approved" }),
      Claim.countDocuments({ status: "rejected" }),
      User.countDocuments(),
      Item.find()
        .populate("reportedBy", "name email")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Claim.find()
        .populate("item", "title type")
        .populate("claimant", "name email")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    return {
      stats: {
        items: {
          total: totalItems,
          lost: lostItems,
          found: foundItems,
          open: openItems,
          claimed: claimedItems,
          resolved: resolvedItems,
        },
        claims: {
          total: totalClaims,
          pending: pendingClaims,
          approved: approvedClaims,
          rejected: rejectedClaims,
        },
        users: { total: totalUsers },
      },
      recentItems: recentItems.map((item) => ({
        ...item,
        _id: item._id.toString(),
        createdAt: item.createdAt.toISOString(),
      })),
      recentClaims: recentClaims.map((claim) => ({
        ...claim,
        _id: claim._id.toString(),
        item: claim.item
          ? { ...claim.item, _id: claim.item._id.toString() }
          : null,
        createdAt: claim.createdAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return {
      stats: {
        items: { total: 0, lost: 0, found: 0, open: 0, claimed: 0, resolved: 0 },
        claims: { total: 0, pending: 0, approved: 0, rejected: 0 },
        users: { total: 0 },
      },
      recentItems: [],
      recentClaims: [],
    };
  }
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin?callbackUrl=/admin");
  }

  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }

  const { stats, recentItems, recentClaims } = await getAdminStats();

  const statusColors = {
    pending: "bg-warning/10 text-warning border-warning/20",
    approved: "bg-success/10 text-success border-success/20",
    rejected: "bg-destructive/10 text-destructive border-destructive/20",
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Overview of all Lost & Found activity
          </p>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Items
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stats.items.total}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.items.lost} lost, {stats.items.found} found
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Open Items
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {stats.items.open}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.items.claimed} claimed, {stats.items.resolved} resolved
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
              <div className="text-2xl font-bold text-warning">
                {stats.claims.pending}
              </div>
              <p className="text-xs text-muted-foreground">Requires review</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Users
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stats.users.total}
              </div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Claims
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stats.claims.total}
              </div>
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
              <div className="text-2xl font-bold text-success">
                {stats.claims.approved}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Rejected Claims
              </CardTitle>
              <XCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {stats.claims.rejected}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-foreground">Recent Items</CardTitle>
              <Link href="/items">
                <Button variant="ghost" size="sm" className="gap-1">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentItems.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No items yet
                </p>
              ) : (
                <div className="space-y-4">
                  {recentItems.map((item: Record<string, unknown>) => (
                    <Link
                      key={item._id as string}
                      href={`/items/${item._id}`}
                      className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                    >
                      <div>
                        <p className="font-medium text-foreground">
                          {item.title as string}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {(item.reportedBy as { name?: string })?.name || "Unknown"} -{" "}
                          {formatDistanceToNow(new Date(item.createdAt as string), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          item.type === "lost"
                            ? "border-destructive/20 bg-destructive/10 text-destructive"
                            : "border-primary/20 bg-primary/10 text-primary"
                        }
                      >
                        {item.type === "lost" ? "Lost" : "Found"}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-foreground">Recent Claims</CardTitle>
              <Link href="/admin/claims">
                <Button variant="ghost" size="sm" className="gap-1">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentClaims.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No claims yet
                </p>
              ) : (
                <div className="space-y-4">
                  {recentClaims.map((claim: Record<string, unknown>) => (
                    <Link
                      key={claim._id as string}
                      href={`/admin/claims/${claim._id}`}
                      className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                    >
                      <div>
                        <p className="font-medium text-foreground">
                          {(claim.item as { title?: string })?.title || "Unknown Item"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          By {(claim.claimant as { name?: string })?.name || "Unknown"} -{" "}
                          {formatDistanceToNow(new Date(claim.createdAt as string), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          statusColors[claim.status as keyof typeof statusColors]
                        }
                      >
                        {(claim.status as string).charAt(0).toUpperCase() +
                          (claim.status as string).slice(1)}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
