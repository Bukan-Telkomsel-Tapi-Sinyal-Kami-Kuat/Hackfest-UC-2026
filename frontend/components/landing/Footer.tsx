export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-white">
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[var(--color-text-muted)]">
        <div className="flex items-center gap-2.5">
          <div className="grid place-items-center w-7 h-7 rounded-md bg-[var(--color-blue-600)] text-white font-bold text-xs">V</div>
          <span className="font-semibold text-[var(--color-text-primary)]">VISEA</span>
          <span className="opacity-60">© 2026</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-[var(--color-blue-700)]">Privasi</a>
          <a href="#" className="hover:text-[var(--color-blue-700)]">Syarat</a>
          <a href="#" className="hover:text-[var(--color-blue-700)]">Kontak</a>
        </div>
      </div>
    </footer>
  );
}
