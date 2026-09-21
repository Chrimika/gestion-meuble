import { NextResponse } from "next/server";
// Force dynamic — exclut cette route du static export (Electron utilise IPC à la place)
export const dynamic = "force-dynamic";
import { 
  getCategoriesDB, 
  addCategoryDB, 
  deleteCategoryDB 
} from "@/lib/db";

export async function GET() {
  try {
    const categories = getCategoriesDB();
    return NextResponse.json(categories);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    if (!name) {
      return NextResponse.json({ error: "Le nom est requis" }, { status: 400 });
    }
    const newCategory = addCategoryDB(name);
    return NextResponse.json(newCategory);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID requis" }, { status: 400 });
    }
    deleteCategoryDB(id);
    const categories = getCategoriesDB();
    return NextResponse.json(categories);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
