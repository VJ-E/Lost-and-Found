import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Claim } from "@/lib/models/Claim";
import { Item } from "@/lib/models/Item";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await connectToDatabase();

    const claim = await Claim.findById(id)
      .populate("item")
      .populate("claimant", "name email")
      .populate("reviewedBy", "name")
      .lean();

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    const isClaimant = claim.claimant._id.toString() === session.user.id;
    const isAdmin = session.user.role === "admin";

    if (!isClaimant && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ claim });
  } catch (error) {
    console.error("Error fetching claim:", error);
    return NextResponse.json(
      { error: "Failed to fetch claim" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    const { status, adminNotes } = await request.json();

    if (!status || !["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    await connectToDatabase();

    const claim = await Claim.findById(id);

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    if (claim.status !== "pending") {
      return NextResponse.json(
        { error: "Claim has already been reviewed" },
        { status: 400 }
      );
    }

    claim.status = status;
    claim.adminNotes = adminNotes;
    claim.reviewedBy = session.user.id;
    claim.reviewedAt = new Date();
    await claim.save();

    if (status === "approved") {
      await Item.findByIdAndUpdate(claim.item, {
        status: "resolved",
        claimedBy: claim.claimant,
        resolvedAt: new Date(),
      });

      await Claim.updateMany(
        { item: claim.item, _id: { $ne: claim._id } },
        { status: "rejected", adminNotes: "Another claim was approved" }
      );
    } else {
      const otherPendingClaims = await Claim.countDocuments({
        item: claim.item,
        status: "pending",
        _id: { $ne: claim._id },
      });

      if (otherPendingClaims === 0) {
        await Item.findByIdAndUpdate(claim.item, { status: "open" });
      }
    }

    const updatedClaim = await Claim.findById(id)
      .populate("item")
      .populate("claimant", "name email")
      .populate("reviewedBy", "name")
      .lean();

    return NextResponse.json({ claim: updatedClaim });
  } catch (error) {
    console.error("Error updating claim:", error);
    return NextResponse.json(
      { error: "Failed to update claim" },
      { status: 500 }
    );
  }
}
