import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Claim } from "@/lib/models/Claim";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileX, Eye } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

async function getAllClaims(status?: string) {
  try {
    await connectToDatabase();

    const query: Record<string, unknown> = {};
    if (status && status !== "all") {
      query.status = status;
    }

    const claims = await Claim.find(query)
      .populate("item", "title type status imageUrl")
      .populate("claimant", "name email")
      .populate("reviewedBy", "name")
      .sort({ createdAt: -1 })
      .lean();

    return claims.map((claim) => ({
      ...claim,
      _id: claim._id.toString(),
      item: claim.item
        ? {
            ...claim.item,
            _id: claim.item._id.toString(),
          }
        : null,
      claimant: claim.claimant
        ? {
            ...claim.claimant,
            _id: claim.claimant._id.toString(),
          }
        : null,
      createdAt: claim.createdAt.toISOString(),
      reviewedAt: claim.reviewedAt?.toISOString(),
    }));
  } catch {
    return [];
  }
}

export default async function AdminClaimsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const resolvedParams = await searchParams;

  if (!session) {
    redirect("/auth/signin?callbackUrl=/admin/claims");
  }

  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }

  const claims = await getAllClaims(resolvedParams.status);

  const statusColors = {
    pending: "bg-warning/10 text-warning border-warning/20",
    approved: "bg-success/10 text-success border-success/20",
    rejected: "bg-destructive/10 text-destructive border-destructive/20",
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-4xl px-4 py-8">
        <Link
          href="/admin"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">All Claims</h1>
            <p className="mt-2 text-muted-foreground">
              Review and manage user claims
            </p>
          </div>

          <div className="flex gap-2">
            <Link href="/admin/claims">
              <Button
                variant={!resolvedParams.status ? "default" : "outline"}
                size="sm"
              >
                All
              </Button>
            </Link>
            <Link href="/admin/claims?status=pending">
              <Button
                variant={resolvedParams.status === "pending" ? "default" : "outline"}
                size="sm"
              >
                Pending
              </Button>
            </Link>
            <Link href="/admin/claims?status=approved">
              <Button
                variant={resolvedParams.status === "approved" ? "default" : "outline"}
                size="sm"
              >
                Approved
              </Button>
            </Link>
            <Link href="/admin/claims?status=rejected">
              <Button
                variant={resolvedParams.status === "rejected" ? "default" : "outline"}
                size="sm"
              >
                Rejected
              </Button>
            </Link>
          </div>
        </div>

        {claims.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card py-16">
            <FileX className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-medium text-foreground">No claims found</h3>
            <p className="text-sm text-muted-foreground">
              {resolvedParams.status
                ? `No ${resolvedParams.status} claims`
                : "No claims have been submitted yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {claims.map((claim) => (
              <Card key={claim._id} className="overflow-hidden border-border bg-card">
                {claim.item && (
                  <div className="flex items-center gap-4 border-b border-border bg-muted/30 p-4">
                    {claim.item.imageUrl ? (
                      <img
                        src={claim.item.imageUrl || "/placeholder.svg"}
                        alt={claim.item.title}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                        <span className="text-xl text-muted-foreground">?</span>
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{claim.item.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {claim.item.type === "lost" ? "Lost Item" : "Found Item"}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={statusColors[claim.status as keyof typeof statusColors]}
                    >
                      {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">
                        Claimed by: {claim.claimant?.name || "Unknown"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {claim.claimant?.email}
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(claim.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <p className="mb-1 text-sm font-medium text-muted-foreground">
                      Message
                    </p>
                    <p className="line-clamp-2 text-sm text-foreground">
                      {claim.message}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/admin/claims/${claim._id}`} className="flex-1">
                      <Button variant="outline" className="w-full gap-2 bg-transparent">
                        <Eye className="h-4 w-4" />
                        Review Claim
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
