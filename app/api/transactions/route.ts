import { NextResponse } from "next/server";
import { 
  getTransactionsDB, 
  saveTransactionDB, 
  deleteTransactionDB, 
  resetTransactionsDB 
} from "@/lib/db";

export async function GET() {
  try {
    const transactions = getTransactionsDB();
    return NextResponse.json(transactions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const updated = saveTransactionDB(body);
    return NextResponse.json(updated);
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
    const updated = deleteTransactionDB(id);
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    if (body.action === "reset") {
      const reset = resetTransactionsDB();
      return NextResponse.json(reset);
    }
    return NextResponse.json({ error: "Action invalide" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
