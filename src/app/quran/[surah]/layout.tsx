// Tells Next.js's static exporter to pre-render all 114 surah pages.
// Without this, /quran/[surah] would fail under `output: 'export'`.

export function generateStaticParams() {
  return Array.from({ length: 114 }, (_, i) => ({ surah: String(i + 1) }));
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
