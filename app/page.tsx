import { redirect } from "next/navigation";
import { auth0, ensureValidSession } from "@/lib/auth0";

export default async function Home() {
  const session = await auth0.getSession();
  ensureValidSession(session);
  redirect("/analytics");
}
