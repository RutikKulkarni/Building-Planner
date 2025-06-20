import { type NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import type { DrawingData } from "@/types";

const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);

async function connectToDatabase() {
  await client.connect();
  return client.db("building_planner");
}

export async function GET() {
  try {
    const db = await connectToDatabase();
    const drawings = await db
      .collection("drawings")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(drawings);
  } catch (error) {
    console.error("Error fetching drawings:", error);
    return NextResponse.json(
      { error: "Failed to fetch drawings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const drawing: DrawingData = await request.json();

    const db = await connectToDatabase();
    const result = await db.collection("drawings").insertOne({
      ...drawing,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const savedDrawing = await db
      .collection("drawings")
      .findOne({ _id: result.insertedId });

    return NextResponse.json(savedDrawing);
  } catch (error) {
    console.error("Error saving drawing:", error);
    return NextResponse.json(
      { error: "Failed to save drawing" },
      { status: 500 }
    );
  }
}
