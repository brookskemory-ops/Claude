import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-site flex flex-col items-center py-32 text-center">
      <p className="text-6xl font-bold tracking-tight">404</p>
      <h1 className="mt-4 text-xl font-semibold">Page not found</h1>
      <p className="mt-2 text-ink-muted">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <Link href="/" className="btn-primary mt-8">
        Back to Home
      </Link>
    </div>
  );
}
