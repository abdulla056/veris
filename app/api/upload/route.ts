import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the uploaded file
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Validate file type
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "uploads");
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Create user-specific directory
    const userDir = join(uploadsDir, userId);
    if (!existsSync(userDir)) {
      await mkdir(userDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${timestamp}_${sanitizedFilename}`;
    const filepath = join(userDir, filename);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // In a real application, you would:
    // 1. Store file metadata in a database
    // 2. Process the PDF (extract text, analyze content)
    // 3. Run AI compliance checks
    // 4. Generate audit reports

    // Return success response with file details
    return NextResponse.json({
      success: true,
      file: {
        id: timestamp.toString(),
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
        status: "processing",
      },
      message: "File uploaded successfully. Compliance audit in progress...",
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file. Please try again." },
      { status: 500 }
    );
  }
}

// Get user's uploaded documents
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // In a real application, fetch from database
    // For now, return mock data
    return NextResponse.json({
      documents: [
        {
          id: "1",
          name: "Global Transfer Feature v2.pdf",
          uploadedAt: "2025-12-05T10:30:00Z",
          status: "completed",
          riskLevel: "high",
        },
        {
          id: "2",
          name: "e-Wallet Signup Flow.pdf",
          uploadedAt: "2025-12-04T14:20:00Z",
          status: "completed",
          riskLevel: "low",
        },
      ],
    });
  } catch (error) {
    console.error("Get documents error:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}

