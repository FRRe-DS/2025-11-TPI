import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { theme } from '../../styles/theme';
import { Button } from '../ui/Button';

interface UserData {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

const styles: { [key: string]: React.CSSProperties } = {
  field: { display: 'flex', flexDirection: 'column', gap: theme.spacing.xs, marginBottom: theme.spacing.md },
  label: { fontSize: theme.fontSizes.caption, color: theme.colors.textSecondary, fontWeight: 600 },
  input: { padding: '8px', borderRadius: theme.borderRadius.sm, border: `1px solid ${theme.colors.border}`, background: theme.colors.surface }
};

export const ProfileModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [user, setUser] = useState<UserData>({});

  useEffect(() => {
    if (!isOpen) return;
    try {
      const raw = localStorage.getItem('local_user_v1');
      if (raw) setUser(JSON.parse(raw));
      else setUser({});
    } catch (e) {
      setUser({});
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    try {
      localStorage.setItem('local_user_v1', JSON.stringify(user));
      // opcional: notificar
      window.dispatchEvent(new Event('userUpdated'));
    } catch (e) {
      console.warn('Error guardando usuario', e);
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Perfil" width="520px">
      <div>
        <div style={styles.field}>
          <label style={styles.label}>Email</label>
          <input name="email" style={styles.input} value={user.email || ''} onChange={handleChange} />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Nombre</label>
          <input name="firstName" style={styles.input} value={user.firstName || ''} onChange={handleChange} />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Apellido</label>
          <input name="lastName" style={styles.input} value={user.lastName || ''} onChange={handleChange} />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Teléfono</label>
          <input name="phone" style={styles.input} value={user.phone || ''} onChange={handleChange} />
        </div>

        <div style={{ display: 'flex', gap: theme.spacing.sm, marginTop: theme.spacing.md }}>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleSave}>Guardar cambios</Button>
        </div>
      </div>
    </Modal>
  );
};

export default ProfileModal;
