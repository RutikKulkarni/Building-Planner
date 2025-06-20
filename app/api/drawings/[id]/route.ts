import { type NextRequest, NextResponse } from "next/server"
import { MongoClient, ObjectId } from "mongodb"

const uri = process.env.MONGODB_URI!
const client = new MongoClient(uri)

async function connectToDatabase() {
  await client.connect()
  return client.db("building_planner")
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = await connectToDatabase()
    await db.collection("drawings").deleteOne({ _id: new ObjectId(params.id) })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting drawing:", error)
    return NextResponse.json({ error: "Failed to delete drawing" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const updates = await request.json()

    const db = await connectToDatabase()
    const result = await db.collection("drawings").updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          ...updates,
          updatedAt: new Date().toISOString(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Drawing not found" }, { status: 404 })
    }

    const updatedDrawing = await db.collection("drawings").findOne({ _id: new ObjectId(params.id) })
    return NextResponse.json(updatedDrawing)
  } catch (error) {
    console.error("Error updating drawing:", error)
    return NextResponse.json({ error: "Failed to update drawing" }, { status: 500 })
  }
}
