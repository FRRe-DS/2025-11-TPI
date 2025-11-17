import type { Metadata } from 'next';
import '../index.css';
import Provider from "./SessionProvider"

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
      <body className="">
        <Provider>
          {children}
        </Provider>
      </body>
    </html>
  );
}
