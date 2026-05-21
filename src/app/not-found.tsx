import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 py-16 text-center">
      <h1 className="font-display text-5xl font-bold tracking-tight text-foreground">
        404
      </h1>
      <p className="max-w-md text-muted-foreground">
        A página solicitada não existe ou foi movida.
      </p>
      <Link
        href="/"
        className="rounded-full bg-gradient-to-r from-primary to-accent px-6 py-2 text-sm font-semibold text-primary-foreground"
      >
        Voltar ao início
      </Link>
    </div>
  );
}
