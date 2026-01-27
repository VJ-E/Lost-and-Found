import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Header } from "@/components/layout/header";
import { ClaimCard } from "@/components/claims/claim-card";
import { FileX } from "lucide-react";

async function getClaims() {
  const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : "http://localhost:3000";

  try {
    const response = await fetch(`${baseUrl}/api/claims`, {
      cache: "no-store",
      headers: {
        Cookie: "",
      },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.claims || [];
  } catch {
    return [];
  }
}

export default async function MyClaimsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin?callbackUrl=/my-claims");
  }

  const claims = await getClaims();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">My Claims</h1>
          <p className="mt-2 text-muted-foreground">
            Track the status of your submitted claims
          </p>
        </div>

        {claims.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card py-16">
            <FileX className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-medium text-foreground">No claims yet</h3>
            <p className="text-sm text-muted-foreground">
              {"You haven't submitted any claims yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {claims.map((claim: Parameters<typeof ClaimCard>[0]["claim"]) => (
              <ClaimCard key={claim._id} claim={claim} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
