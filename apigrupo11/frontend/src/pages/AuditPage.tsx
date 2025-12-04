import React, { useEffect } from 'react';

// Página de auditoría eliminada: redirigimos a dashboard desde el cliente
const AuditPage: React.FC = () => {
  useEffect(() => {
    try {
      window.location.replace('/dashboard');
    } catch (e) {
      // fallback
      window.location.href = '/dashboard';
    }
  }, []);

  return null;
};

export default AuditPage;
