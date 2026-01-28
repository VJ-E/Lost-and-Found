import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Item } from "@/lib/models/Item";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    await connectToDatabase();

    const query: Record<string, unknown> = {};

    if (type && type !== "all") {
      query.type = type;
    }

    if (category && category !== "all") {
      query.category = category;
    }

    if (status && status !== "all") {
      query.status = status;
    } else {
      query.status = { $in: ["open", "claimed"] };
    }

    if (search) {
      query.$text = { $search: search };
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Item.find(query)
        .populate("reportedBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Item.countDocuments(query),
    ]);

    // Serialize items for client consumption
    const serializedItems = items.map(item => ({
      ...item,
      _id: item._id.toString(),
      reportedBy: item.reportedBy ? {
        ...item.reportedBy,
        _id: item.reportedBy._id.toString()
      } : null,
      claimedBy: item.claimedBy ? {
        ...item.claimedBy,
        _id: item.claimedBy._id.toString()
      } : null,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      date: item.date.toISOString(),
      // Convert Buffer to base64 string for client-side consumption
      imageData: item.imageData ? {
        data: item.imageData.data.toString('base64'),
        contentType: item.imageData.contentType,
        size: item.imageData.size,
      } : null,
    }));

    return NextResponse.json({
      items: serializedItems,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json(
      { error: "Failed to fetch items" },
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

    const formData = await request.formData();
    
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const type = formData.get('type') as string;
    const location = formData.get('location') as string;
    const date = formData.get('date') as string;
    const contactInfo = formData.get('contactInfo') as string;
    const imageFile = formData.get('image') as File | null;

    if (!title || !description || !category || !type || !location || !date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let imageData = null;
    
    if (imageFile && imageFile.size > 0) {
      // Validate file type
      if (!imageFile.type.startsWith('image/')) {
        return NextResponse.json(
          { error: "Invalid file type. Please upload an image." },
          { status: 400 }
        );
      }

      // Validate file size (5MB)
      if (imageFile.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Image size must be less than 5MB" },
          { status: 400 }
        );
      }

      // Convert file to buffer
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      imageData = {
        data: buffer,
        contentType: imageFile.type,
        size: imageFile.size,
      };
    }

    await connectToDatabase();

    const item = await Item.create({
      title,
      description,
      category,
      type,
      location,
      date: new Date(date),
      imageData,
      contactInfo: contactInfo || session.user.email,
      reportedBy: session.user.id,
      status: "open",
    });

    // Populate and serialize the created item
    const populatedItem = await Item.findById(item._id)
      .populate("reportedBy", "name email")
      .lean();

    if (!populatedItem) {
      return NextResponse.json({ error: "Failed to create item" }, { status: 500 });
    }

    const serializedItem = {
      ...populatedItem,
      _id: populatedItem._id.toString(),
      reportedBy: populatedItem.reportedBy ? {
        ...populatedItem.reportedBy,
        _id: populatedItem.reportedBy._id.toString()
      } : null,
      createdAt: populatedItem.createdAt.toISOString(),
      updatedAt: populatedItem.updatedAt.toISOString(),
      date: populatedItem.date.toISOString(),
      // Convert Buffer to base64 string for client-side consumption
      imageData: populatedItem.imageData ? {
        data: populatedItem.imageData.data.toString('base64'),
        contentType: populatedItem.imageData.contentType,
        size: populatedItem.imageData.size,
      } : null,
    };

    return NextResponse.json({ item: serializedItem }, { status: 201 });
  } catch (error) {
    console.error("Error creating item:", error);
    return NextResponse.json(
      { error: "Failed to create item" },
      { status: 500 }
    );
  }
}
