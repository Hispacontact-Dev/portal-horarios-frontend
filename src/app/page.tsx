import { redirect } from "next/navigation";

// TODO: redirigir a /dashboard o /login según exista sesión (el middleware ya cubre esto en runtime).
export default function RootPage() {
  redirect("/login");
}
