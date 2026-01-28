import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Item } from "@/lib/models/Item";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await connectToDatabase();

    const item = await Item.findById(id)
      .populate("reportedBy", "name email")
      .populate("claimedBy", "name email")
      .lean();

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Serialize item for client consumption
    const serializedItem = {
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
    };

    return NextResponse.json({ item: serializedItem });
  } catch (error) {
    console.error("Error fetching item:", error);
    return NextResponse.json(
      { error: "Failed to fetch item" },
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

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    
    // Check if the request is FormData (for image upload) or JSON
    const contentType = request.headers.get("content-type") || "";
    let formData: FormData;
    let updates: Record<string, unknown> = {};

    if (contentType.includes("multipart/form-data")) {
      formData = await request.formData();
      
      const title = formData.get('title') as string;
      const description = formData.get('description') as string;
      const category = formData.get('category') as string;
      const location = formData.get('location') as string;
      const date = formData.get('date') as string;
      const contactInfo = formData.get('contactInfo') as string;
      const status = formData.get('status') as string;
      const imageFile = formData.get('image') as File | null;
      const removeImage = formData.get('removeImage') as string;

      // Build updates object
      if (title !== undefined) updates.title = title;
      if (description !== undefined) updates.description = description;
      if (category !== undefined) updates.category = category;
      if (location !== undefined) updates.location = location;
      if (date !== undefined) updates.date = new Date(date);
      if (contactInfo !== undefined) updates.contactInfo = contactInfo;
      if (status !== undefined) updates.status = status;

      // Handle image upload
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
        
        updates.imageData = {
          data: buffer,
          contentType: imageFile.type,
          size: imageFile.size,
        };
      } else if (removeImage === "true") {
        updates.imageData = null;
      }
    } else {
      // Handle JSON request (backward compatibility)
      const body = await request.json();
      
      const allowedUpdates = [
        "title",
        "description", 
        "category",
        "location",
        "date",
        "contactInfo",
        "status",
      ];

      for (const key of allowedUpdates) {
        if (body[key] !== undefined) {
          updates[key] = body[key];
        }
      }
    }

    await connectToDatabase();

    const item = await Item.findById(id);

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const isOwner = item.reportedBy.toString() === session.user.id;
    const isAdmin = session.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (updates.status === "resolved") {
      updates.resolvedAt = new Date();
    }

    const updatedItem = await Item.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    })
      .populate("reportedBy", "name email")
      .lean();

    if (!updatedItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Serialize updated item for client consumption
    const serializedItem = {
      ...updatedItem,
      _id: updatedItem._id.toString(),
      reportedBy: updatedItem.reportedBy ? {
        ...updatedItem.reportedBy,
        _id: updatedItem.reportedBy._id.toString()
      } : null,
      claimedBy: updatedItem.claimedBy ? {
        ...updatedItem.claimedBy,
        _id: updatedItem.claimedBy._id.toString()
      } : null,
      createdAt: updatedItem.createdAt.toISOString(),
      updatedAt: updatedItem.updatedAt.toISOString(),
      date: updatedItem.date.toISOString(),
      // Convert Buffer to base64 string for client-side consumption
      imageData: updatedItem.imageData ? {
        data: updatedItem.imageData.data.toString('base64'),
        contentType: updatedItem.imageData.contentType,
        size: updatedItem.imageData.size,
      } : null,
    };

    return NextResponse.json({ item: serializedItem });
  } catch (error) {
    console.error("Error updating item:", error);
    return NextResponse.json(
      { error: "Failed to update item" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const item = await Item.findById(id);

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const isOwner = item.reportedBy.toString() === session.user.id;
    const isAdmin = session.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await Item.findByIdAndDelete(id);

    return NextResponse.json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Error deleting item:", error);
    return NextResponse.json(
      { error: "Failed to delete item" },
      { status: 500 }
    );
  }
}
