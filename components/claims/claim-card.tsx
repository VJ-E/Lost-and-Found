"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface ClaimCardProps {
  claim: {
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
      type: "lost" | "found";
      status: string;
      imageUrl?: string;
    };
    claimant: {
      name: string;
      email: string;
    };
    reviewedBy?: {
      name: string;
    };
  };
  showItem?: boolean;
}

export function ClaimCard({ claim, showItem = true }: ClaimCardProps) {
  const statusColors = {
    pending: "bg-warning/10 text-warning border-warning/20",
    approved: "bg-success/10 text-success border-success/20",
    rejected: "bg-destructive/10 text-destructive border-destructive/20",
  };

  return (
    <Card className="overflow-hidden">
      {showItem && claim.item && (
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
        </div>
      )}

      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className={statusColors[claim.status]}>
            {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {formatDistanceToNow(new Date(claim.createdAt), { addSuffix: true })}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <p className="mb-1 text-sm font-medium text-muted-foreground">Message</p>
          <p className="text-sm text-foreground">{claim.message}</p>
        </div>

        <div>
          <p className="mb-1 text-sm font-medium text-muted-foreground">
            Proof of Ownership
          </p>
          <p className="text-sm text-foreground">{claim.proofDescription}</p>
        </div>

        {claim.adminNotes && (
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="mb-1 text-sm font-medium text-muted-foreground">
              Admin Notes
            </p>
            <p className="text-sm text-foreground">{claim.adminNotes}</p>
          </div>
        )}

        {claim.reviewedAt && claim.reviewedBy && (
          <p className="text-xs text-muted-foreground">
            Reviewed by {claim.reviewedBy.name}{" "}
            {formatDistanceToNow(new Date(claim.reviewedAt), { addSuffix: true })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
