import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-paper px-5 py-6 text-ink">
      <div className="mx-auto flex max-w-md flex-col gap-4">
        <h1 className="text-3xl font-black">Lloyd Orders</h1>
        <Link className="rounded-lg bg-ink px-5 py-4 text-center font-bold text-white" href="/waiter">
          Waiter
        </Link>
        <Link className="rounded-lg border-2 border-ink px-5 py-4 text-center font-bold" href="/bar">
          Bar
        </Link>
        <Link className="rounded-lg border-2 border-ink px-5 py-4 text-center font-bold" href="/admin/products">
          Products Admin
        </Link>
      </div>
    </main>
  );
}
