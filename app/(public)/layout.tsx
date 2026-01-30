// app/(public)/layout.tsx
// Layout público neutro (sem estilo visual)

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
      </body>
    </html>
  );
}