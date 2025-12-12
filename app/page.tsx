import { redirect } from "next/navigation";
import { auth0, loginUrl } from "@/lib/auth0";

export default async function Home() {
  const session = await auth0.getSession();

  if (!session) {
    redirect(loginUrl);
  } else {
    redirect("/analytics");
  }
}
