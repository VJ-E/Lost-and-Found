"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Loader2,
  Package,
  User,
  Mail,
  Calendar,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

interface ClaimData {
  _id: string;
  status: "pending" | "approved" | "rejected";
  message: string;
  proofDescription: string;
  adminNotes?: string;
  createdAt: string;
  reviewedAt?: string;
  item: {
    _id: string;
    title: string;
    description: string;
    type: "lost" | "found";
    status: string;
    category: string;
    location: string;
    date: string;
    imageUrl?: string;
    contactInfo: string;
  };
  claimant: {
    _id: string;
    name: string;
    email: string;
  };
  reviewedBy?: {
    name: string;
  };
}

export default function AdminClaimDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();

  const [claim, setClaim] = useState<ClaimData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (sessionStatus === "loading") return;

    if (!session || session.user.role !== "admin") {
      router.push("/dashboard");
      return;
    }

    fetchClaim();
  }, [session, sessionStatus, params.id, router]);

  const fetchClaim = async () => {
    try {
      const response = await fetch(`/api/claims/${params.id}`);
      if (!response.ok) throw new Error("Failed to fetch claim");
      const data = await response.json();
      setClaim(data.claim);
      setAdminNotes(data.claim.adminNotes || "");
    } catch {
      setError("Failed to load claim");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: "approved" | "rejected") => {
    setActionLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/claims/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: action,
          adminNotes,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update claim");
      }

      router.push("/admin/claims");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setActionLoading(false);
    }
  };

  if (sessionStatus === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-4xl px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Claim Not Found</h1>
            <Link href="/admin/claims">
              <Button className="mt-4">Back to Claims</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

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
          href="/admin/claims"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Claims
        </Link>

        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Review Claim</h1>
          <Badge variant="outline" className={statusColors[claim.status]}>
            {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
          </Badge>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Item Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-video overflow-hidden rounded-lg bg-muted">
                {claim.item.imageUrl ? (
                  <img
                    src={claim.item.imageUrl || "/placeholder.svg"}
                    alt={claim.item.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Package className="h-12 w-12 text-muted-foreground/50" />
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-foreground">{claim.item.title}</h3>
                <Badge variant="secondary" className="mt-1">
                  {claim.item.category}
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground">{claim.item.description}</p>

              <div className="space-y-2 border-t border-border pt-4">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{claim.item.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">
                    {format(new Date(claim.item.date), "MMMM d, yyyy")}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{claim.item.contactInfo}</span>
                </div>
              </div>

              <Link href={`/items/${claim.item._id}`}>
                <Button variant="outline" className="w-full bg-transparent">
                  View Full Item
                </Button>
              </Link>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Claimant Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">{claim.claimant.name}</p>
                    <p className="text-sm text-muted-foreground">{claim.claimant.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Claim Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-1 text-sm font-medium text-muted-foreground">Message</p>
                  <p className="rounded-lg bg-muted/50 p-3 text-sm text-foreground">
                    {claim.message}
                  </p>
                </div>

                <div>
                  <p className="mb-1 text-sm font-medium text-muted-foreground">
                    Proof of Ownership
                  </p>
                  <p className="rounded-lg bg-muted/50 p-3 text-sm text-foreground">
                    {claim.proofDescription}
                  </p>
                </div>

                <div className="text-sm text-muted-foreground">
                  Submitted: {format(new Date(claim.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                </div>
              </CardContent>
            </Card>

            {claim.status === "pending" && (
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground">Take Action</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="adminNotes">Admin Notes (Optional)</Label>
                    <Textarea
                      id="adminNotes"
                      placeholder="Add notes about this decision..."
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleAction("approved")}
                      disabled={actionLoading}
                      className="flex-1 gap-2 bg-success text-success-foreground hover:bg-success/90"
                    >
                      {actionLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleAction("rejected")}
                      disabled={actionLoading}
                      variant="destructive"
                      className="flex-1 gap-2"
                    >
                      {actionLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {claim.status !== "pending" && claim.adminNotes && (
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground">Admin Decision</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="rounded-lg bg-muted/50 p-3 text-sm text-foreground">
                    {claim.adminNotes}
                  </p>
                  {claim.reviewedAt && claim.reviewedBy && (
                    <p className="text-sm text-muted-foreground">
                      Reviewed by {claim.reviewedBy.name} on{" "}
                      {format(new Date(claim.reviewedAt), "MMMM d, yyyy")}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
