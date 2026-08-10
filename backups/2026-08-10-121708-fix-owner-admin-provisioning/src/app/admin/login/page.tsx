import type { Metadata } from "next";
import { Logo } from "@/components/shop/Logo";
import { signInWithGoogle } from "./actions";

export const metadata: Metadata = {
  title: "Shop Back Office | Shop NeumoPractice",
};

export const dynamic = "force-dynamic";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const errorMessage = getErrorMessage(params.error);
  const shouldShowSignOut = params.error === "unauthorized" || params.error === "disabled";

  return (
    <main className="admin-auth-page">
      <section className="admin-auth-card">
        <Logo />
        <div>
          <p className="admin-eyebrow">Shop Back Office</p>
          <h1>Acceso administrativo</h1>
          <p>Continúa con la cuenta Google autorizada para operar Shop NeumoPractice.</p>
        </div>
        {errorMessage ? <p className="admin-auth-error">{errorMessage}</p> : null}
        {shouldShowSignOut ? (
          <form action="/auth/signout" method="post">
            <button className="admin-google-button" type="submit">
              Cerrar sesión
            </button>
          </form>
        ) : (
          <form action={signInWithGoogle}>
            <button className="admin-google-button" type="submit">
              <span aria-hidden="true">G</span>
              Continuar con Google
            </button>
          </form>
        )}
      </section>
    </main>
  );
}

function getErrorMessage(error?: string) {
  if (error === "unauthorized") {
    return "Esta cuenta no tiene acceso al Back Office de Shop NeumoPractice.";
  }

  if (error === "disabled") {
    return "Esta cuenta administrativa está desactivada.";
  }

  if (error === "oauth_unavailable") {
    return "La configuración pública de Supabase no está completa para iniciar sesión.";
  }

  return "";
}
