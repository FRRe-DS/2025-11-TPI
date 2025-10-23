import type { Metadata } from 'next';
import '../index.css';

export const metadata: Metadata = {
  title: 'Stock Management System',
  description: 'Sistema de gestión de inventario y stock',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
