import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Item } from "@/lib/models/Item";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await connectToDatabase();

    const item = await Item.findById(id);

    if (!item || !item.imageData) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    // Convert Buffer to base64 for response
    const base64Data = item.imageData.data.toString('base64');
    const dataUrl = `data:${item.imageData.contentType};base64,${base64Data}`;

    // Return the image data
    return new NextResponse(dataUrl, {
      headers: {
        'Content-Type': item.imageData.contentType,
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      },
    });
  } catch (error) {
    console.error("Error fetching image:", error);
    return NextResponse.json(
      { error: "Failed to fetch image" },
      { status: 500 }
    );
  }
}
