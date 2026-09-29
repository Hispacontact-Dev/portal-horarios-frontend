import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold">Iniciar sesión</h1>
      <LoginForm />
    </div>
  );
}
