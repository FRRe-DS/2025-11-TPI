"use client";

import React, { useEffect, useState } from 'react';
import MainLayout from '../../components/layout/MainLayoutNext';
import { theme } from '../../styles/theme';
import { useRouter } from 'next/navigation';

const styles: { [key: string]: React.CSSProperties } = {
  container: { maxWidth: 800, margin: '0 auto', background: theme.colors.surface, padding: theme.spacing.lg, borderRadius: theme.borderRadius.lg },
  title: { fontSize: theme.fontSizes.h1, fontWeight: 800, marginBottom: theme.spacing.lg, fontFamily: theme.fonts.body, color: theme.colors.textPrimary },
  field: { display: 'flex', flexDirection: 'column', gap: theme.spacing.xs, marginBottom: theme.spacing.md },
  label: { fontSize: theme.fontSizes.caption, color: theme.colors.textSecondary, fontWeight: 600 },
  input: { padding: '10px', borderRadius: theme.borderRadius.sm, border: `1px solid ${theme.colors.border}`, background: theme.colors.background },
  actions: { display: 'flex', gap: theme.spacing.sm, marginTop: theme.spacing.md }
};

export default function ProfilePage() {
  const [user, setUser] = useState({ email: '', firstName: '', lastName: '', phone: '' });
  const router = useRouter();

  useEffect(() => {
    try {
      const raw = localStorage.getItem('local_user_v1');
      if (raw) setUser(JSON.parse(raw));
    } catch (e) {}
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    try {
      localStorage.setItem('local_user_v1', JSON.stringify(user));
      window.dispatchEvent(new Event('userUpdated'));
    } catch (e) {}
    // opcional: toast
    router.push('/');
  };

  return (
    <MainLayout>
      <div style={styles.container}>
        <h2 style={styles.title}>Perfil</h2>
        <div style={styles.field}>
          <label style={styles.label}>Email</label>
          <input name="email" style={styles.input} value={user.email} onChange={handleChange} />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Nombre</label>
          <input name="firstName" style={styles.input} value={user.firstName} onChange={handleChange} />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Apellido</label>
          <input name="lastName" style={styles.input} value={user.lastName} onChange={handleChange} />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Teléfono</label>
          <input name="phone" style={styles.input} value={user.phone} onChange={handleChange} />
        </div>

        <div style={styles.actions}>
          <button onClick={handleSave} style={{ padding: '10px 16px', background: theme.colors.primary, color: theme.colors.textOnPrimary, border: 'none', borderRadius: theme.borderRadius.md }}>Guardar cambios</button>
        </div>
      </div>
    </MainLayout>
  );
}
