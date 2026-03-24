import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { folders, users } from "@repo/db";
import { eq } from "drizzle-orm";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await db
    .select()
    .from(folders)
    .where(eq(folders.userId, userId))
    .orderBy(folders.createdAt);

  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name } = await req.json();
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });

  await db.insert(users).values({ id: userId }).onConflictDoNothing();

  const [folder] = await db
    .insert(folders)
    .values({ userId, name })
    .returning();

  return NextResponse.json(folder);
}
