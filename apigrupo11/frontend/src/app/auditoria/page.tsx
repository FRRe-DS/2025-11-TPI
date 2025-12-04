import { redirect } from 'next/navigation';

// Página de auditoría eliminada: redirigimos automáticamente al dashboard.
export default function AuditRedirect() {
  redirect('/dashboard');
}
