import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Header } from "@/components/layout/header";
import { ItemForm } from "@/components/items/item-form";

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

export default async function EditItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (!session) {
    redirect(`/auth/signin?callbackUrl=/items/${id}/edit`);
  }

  const item = await getItem(id);

  if (!item) {
    notFound();
  }

  const isOwner = session.user.id === item.reportedBy?._id;
  const isAdmin = session.user.role === "admin";

  if (!isOwner && !isAdmin) {
    redirect(`/items/${id}`);
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-2xl px-4 py-8">
        <ItemForm
          mode="edit"
          initialData={{
            _id: item._id,
            title: item.title,
            description: item.description,
            category: item.category,
            type: item.type,
            location: item.location,
            date: item.date,
            imageUrl: item.imageUrl,
            contactInfo: item.contactInfo,
          }}
        />
      </main>
    </div>
  );
}
