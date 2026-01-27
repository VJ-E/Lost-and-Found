import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Claim } from "@/lib/models/Claim";
import { Item } from "@/lib/models/Item";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const itemId = searchParams.get("itemId");

    await connectToDatabase();

    const query: Record<string, unknown> = {};

    if (session.user.role !== "admin") {
      query.claimant = session.user.id;
    }

    if (status && status !== "all") {
      query.status = status;
    }

    if (itemId) {
      query.item = itemId;
    }

    const claims = await Claim.find(query)
      .populate("item", "title type status imageUrl")
      .populate("claimant", "name email")
      .populate("reviewedBy", "name")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ claims });
  } catch (error) {
    console.error("Error fetching claims:", error);
    return NextResponse.json(
      { error: "Failed to fetch claims" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { itemId, message, proofDescription } = await request.json();

    if (!itemId || !message || !proofDescription) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const item = await Item.findById(itemId);

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    if (item.status !== "open") {
      return NextResponse.json(
        { error: "Item is no longer available for claims" },
        { status: 400 }
      );
    }

    if (item.reportedBy.toString() === session.user.id) {
      return NextResponse.json(
        { error: "You cannot claim your own item" },
        { status: 400 }
      );
    }

    const existingClaim = await Claim.findOne({
      item: itemId,
      claimant: session.user.id,
    });

    if (existingClaim) {
      return NextResponse.json(
        { error: "You have already submitted a claim for this item" },
        { status: 400 }
      );
    }

    const claim = await Claim.create({
      item: itemId,
      claimant: session.user.id,
      message,
      proofDescription,
      status: "pending",
    });

    await Item.findByIdAndUpdate(itemId, { status: "claimed" });

    return NextResponse.json({ claim }, { status: 201 });
  } catch (error) {
    console.error("Error creating claim:", error);
    return NextResponse.json(
      { error: "Failed to create claim" },
      { status: 500 }
    );
  }
}
