import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

// Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * GET /api/company-policies - List all company policies
 * GET /api/company-policies?id=xxx - Get specific company policy by ID
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
      // Get specific company policy
      const companyPolicy = await convex.query(api.companyPolicies.getById, {
        id: id as Id<"companyPolicies">,
      });

      if (!companyPolicy) {
        return NextResponse.json({ error: "Company policy not found" }, { status: 404 });
      }

      return NextResponse.json({ success: true, companyPolicy });
    }

    if (companyName) {
      // Get policies for a specific company
      const companyPolicies = await convex.query(api.companyPolicies.getByCompany, {
        companyName,
      });
      return NextResponse.json({ success: true, companyPolicies });
    }

    // Return list of all company policies
    const companyPolicies = await convex.query(api.companyPolicies.list, { limit: 50 });
    return NextResponse.json({ success: true, companyPolicies });
  } catch (error) {
    console.error("[Company Policies API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch company policies" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/company-policies?id=xxx - Delete a company policy
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

    await convex.mutation(api.companyPolicies.remove, {
      id: id as Id<"companyPolicies">,
    });

    return NextResponse.json({ success: true, message: "Company policy deleted" });
  } catch (error) {
    console.error("[Company Policies API] Delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete company policy" },
      { status: 500 }
    );
  }
}

