import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Header } from "@/components/layout/header";
import { ClaimForm } from "@/components/claims/claim-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Calendar, Mail, User, Package, Edit, ArrowLeft, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

async function getItem(id: string) {
  const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : "http://localhost:3000";

  try {
    const response = await fetch(`${baseUrl}/api/items/${id}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.item;
  } catch {
    return null;
  }
}

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const item = await getItem(id);

  if (!item) {
    notFound();
  }

  const isOwner = session?.user?.id === item.reportedBy?._id;
  const isAdmin = session?.user?.role === "admin";
  const canClaim = session && !isOwner && item.status === "open";

  const statusColors = {
    open: "bg-success/10 text-success border-success/20",
    claimed: "bg-warning/10 text-warning border-warning/20",
    resolved: "bg-muted text-muted-foreground border-border",
  };

  const typeColors = {
    lost: "bg-destructive/10 text-destructive border-destructive/20",
    found: "bg-primary/10 text-primary border-primary/20",
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-4xl px-4 py-8">
        <Link
          href="/items"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Items
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-lg border border-border bg-card">
              <div className="relative aspect-video bg-muted">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl || "/placeholder.svg"}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Package className="h-16 w-16 text-muted-foreground/50" />
                  </div>
                )}
                <div className="absolute left-4 top-4 flex gap-2">
                  <Badge variant="outline" className={typeColors[item.type as keyof typeof typeColors]}>
                    {item.type === "lost" ? "Lost" : "Found"}
                  </Badge>
                  <Badge variant="outline" className={statusColors[item.status as keyof typeof statusColors]}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </Badge>
                </div>
              </div>

              <div className="p-6">
                <h1 className="mb-2 text-2xl font-bold text-foreground">{item.title}</h1>
                <Badge variant="secondary" className="mb-4">
                  {item.category}
                </Badge>

                <p className="whitespace-pre-wrap text-foreground">{item.description}</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Location</p>
                    <p className="text-sm text-muted-foreground">{item.location}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Date {item.type === "lost" ? "Lost" : "Found"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(item.date), "MMMM d, yyyy")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Reported by</p>
                    <p className="text-sm text-muted-foreground">
                      {item.reportedBy?.name || "Anonymous"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Contact</p>
                    <p className="text-sm text-muted-foreground">{item.contactInfo}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {item.status === "resolved" ? (
                  <div className="flex items-center gap-2 rounded-lg bg-success/10 p-3 text-success">
                    <CheckCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">This item has been resolved</span>
                  </div>
                ) : canClaim ? (
                  <ClaimForm
                    itemId={item._id}
                    itemTitle={item.title}
                    itemType={item.type}
                  />
                ) : !session ? (
                  <Link href={`/auth/signin?callbackUrl=/items/${item._id}`} className="block">
                    <Button className="w-full">Sign in to claim</Button>
                  </Link>
                ) : isOwner ? (
                  <p className="text-center text-sm text-muted-foreground">
                    This is your item
                  </p>
                ) : (
                  <p className="text-center text-sm text-muted-foreground">
                    This item is being processed
                  </p>
                )}

                {(isOwner || isAdmin) && (
                  <Link href={`/items/${item._id}/edit`}>
                    <Button variant="outline" className="w-full gap-2 bg-transparent">
                      <Edit className="h-4 w-4" />
                      Edit Item
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
