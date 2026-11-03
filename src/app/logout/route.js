import { redirect } from "next/navigation";
import { clearCurrentUser } from "@/lib/mock-auth";

export async function POST() {
  await clearCurrentUser();
  return redirect("/");
}

export async function GET() {
  await clearCurrentUser();
  return redirect("/");
}
