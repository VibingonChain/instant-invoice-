export default function ErrorPage() {
  return (
    <div className="space-y-4 text-center">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="text-gray-400">
        An unexpected error occurred. Please try again or contact the invoice sender.
      </p>
      <a
        href="/"
        className="inline-block rounded-lg bg-brand-green px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
      >
        Create New Invoice
      </a>
    </div>
  );
}
