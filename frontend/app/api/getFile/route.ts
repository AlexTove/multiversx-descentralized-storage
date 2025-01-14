import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch("http://localhost:3001/get");

    if (!response.ok) {
      throw new Error("Failed to fetch data from backend");
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching files:", error);
    return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 });
  }
}
