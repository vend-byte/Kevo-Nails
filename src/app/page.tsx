export default function HomePage() {
  return (
    <main className="min-h-screen bg-brand-black text-brand-white">
      <section className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center gap-6 px-6 text-center">
        <span className="text-sm uppercase tracking-[0.3em] text-brand-blue-light">
          Kevo Nails Academy
        </span>
        <h1 className="text-4xl font-semibold sm:text-6xl">
          Where Passion <span className="text-brand-blue-light">Meets</span> Precision
        </h1>
        <p className="max-w-xl text-brand-white/70">
          Professional nail services and hands-on nail technician training.
          Book an appointment or apply to our academy — built out in the
          upcoming development phases.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="/book"
            className="rounded-full bg-brand-blue-light px-6 py-3 font-medium text-white transition hover:opacity-90"
          >
            Book Appointment
          </a>
          <a
            href="/apply"
            className="rounded-full border border-white/30 px-6 py-3 font-medium transition hover:bg-white/10"
          >
            Apply to the Academy
          </a>
        </div>
      </section>
    </main>
  );
}
