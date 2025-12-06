import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

// Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * GET /api/product-specs - List all product specifications
 * GET /api/product-specs?id=xxx - Get specific product spec by ID
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const companyName = searchParams.get("companyName");

    if (id) {
      // Get specific product spec
      const productSpec = await convex.query(api.productSpecs.getById, {
        id: id as Id<"productSpecs">,
      });

      if (!productSpec) {
        return NextResponse.json({ error: "Product spec not found" }, { status: 404 });
      }

      return NextResponse.json({ success: true, productSpec });
    }

    if (companyName) {
      // Get specs for a specific company
      const productSpecs = await convex.query(api.productSpecs.getByCompany, {
        companyName,
      });
      return NextResponse.json({ success: true, productSpecs });
    }

    // Return list of all product specs
    const productSpecs = await convex.query(api.productSpecs.list, { limit: 50 });
    return NextResponse.json({ success: true, productSpecs });
  } catch (error) {
    console.error("[Product Specs API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch product specs" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/product-specs?id=xxx - Delete a product specification
 * Requires confirmation - this is a destructive operation
 */
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    // Verify the document exists before deletion
    const existingDoc = await convex.query(api.productSpecs.getById, {
      id: id as Id<"productSpecs">,
    });

    if (!existingDoc) {
      return NextResponse.json({ error: "Product spec not found" }, { status: 404 });
    }

    // Log the deletion for audit purposes
    console.log(`[AUDIT] User ${userId} deleting product spec: ${id} (${existingDoc.productName})`);

    // Perform deletion
    await convex.mutation(api.productSpecs.remove, {
      id: id as Id<"productSpecs">,
    });

    return NextResponse.json({ 
      success: true, 
      message: "Product specification deleted successfully",
      deletedId: id,
      deletedName: existingDoc.productName,
    });
  } catch (error) {
    console.error("[Product Specs API] Delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete product specification" },
      { status: 500 }
    );
  }
}

