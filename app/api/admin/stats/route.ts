import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Item } from "@/lib/models/Item";
import { Claim } from "@/lib/models/Claim";
import { User } from "@/lib/models/User";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

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
    ]);

    const recentItems = await Item.find()
      .populate("reportedBy", "name email")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const recentClaims = await Claim.find()
      .populate("item", "title type")
      .populate("claimant", "name email")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return NextResponse.json({
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
        users: {
          total: totalUsers,
        },
      },
      recentItems,
      recentClaims,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
