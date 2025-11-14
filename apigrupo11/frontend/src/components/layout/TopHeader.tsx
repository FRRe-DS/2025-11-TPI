import React, { useState, useRef, useEffect } from 'react';
import { theme } from '../../styles/theme';
import { IconButton } from '../ui/IconButton';
import { FiBell, FiUser } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

const styles: { [key: string]: React.CSSProperties } = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
    backgroundColor: theme.colors.surface,
    height: '72px',
    boxSizing: 'border-box',
    borderBottom: `1px solid ${theme.colors.border}`,
    boxShadow: '0 2px 8px rgba(16,24,40,0.04)',
    position: 'relative',
  },
  logoText: {
    fontSize: '22px',
    fontWeight: '800',
    margin: 0,
    color: theme.colors.textPrimary,
    letterSpacing: '-0.5px',
  },
  centerTitle: {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    textAlign: 'center',
  },
  dropdown: {
    position: 'absolute',
    top: '64px',
    right: 0,
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    minWidth: '200px',
    boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
    zIndex: 1000,
    padding: theme.spacing.sm,
  },
  dropdownItem: {
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    cursor: 'pointer',
    color: theme.colors.textPrimary,
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.sm,
    position: 'absolute',
    right: theme.spacing.lg,
    top: '50%',
    transform: 'translateY(-50%)',
  },
};

const TopHeader: React.FC = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const router = useRouter();
  const [notifications, setNotifications] = useState<
    { id: number; text: string; read: boolean; date: string }[]
  >([]);
  const notifRef = useRef<HTMLDivElement | null>(null);
  const accountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleNotificationsUpdated = () => {
      try {
        const raw = localStorage.getItem('local_notifications_v1');
        if (raw) setNotifications(JSON.parse(raw));
      } catch (err) {
        /* ignore */
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (notifRef.current && !notifRef.current.contains(target)) {
        setShowNotifications(false);
      }
      if (accountRef.current && !accountRef.current.contains(target)) {
        setShowAccount(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    window.addEventListener('notificationsUpdated', handleNotificationsUpdated);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      window.removeEventListener('notificationsUpdated', handleNotificationsUpdated);
    };
  }, []);

  // Cargamos notificaciones desde localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('local_notifications_v1');
      if (raw) {
        setNotifications(JSON.parse(raw));
        return;
      }
    } catch (err) {
      console.warn('No se pudo leer notificaciones de localStorage', err);
    }

    // No crear mock automáticamente: empezamos con lista vacía
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      try {
        localStorage.setItem('local_notifications_v1', JSON.stringify(next));
      } catch (err) {
        console.warn('Error guardando notificaciones', err);
      }
      return next;
    });
  };


  return (
    <header style={styles.header}>
      <div style={styles.centerTitle}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6 }}>Stock system</h1>
      </div>
      <div style={styles.actions}>
        <div style={{ position: 'relative' }} ref={notifRef}>
          <IconButton
            icon={<FiBell />}
            onClick={() => setShowNotifications((s) => !s)}
            badgeCount={unreadCount}
          />
          {showNotifications && (
            <div style={styles.dropdown}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>Notificaciones</strong>
                  <div style={{ display: 'flex', gap: theme.spacing.sm }}>
                    <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: theme.colors.danger }} onClick={() => {
                      // borrar todas
                      setNotifications([]);
                      try { localStorage.removeItem('local_notifications_v1'); } catch(e){}
                    }}>
                      Eliminar todas
                    </button>
                  </div>
                </div>
                <div style={{ marginTop: theme.spacing.sm, maxHeight: '260px', overflowY: 'auto' }}>
                  {notifications.length === 0 && <div style={{ ...styles.dropdownItem, color: theme.colors.textSecondary }}>No hay notificaciones</div>}
                  {notifications.map((n) => (
                    <div key={n.id} style={{ ...styles.dropdownItem, opacity: n.read ? 0.6 : 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div onClick={() => markAsRead(n.id)} style={{ cursor: 'pointer' }}>
                        <div style={{ fontSize: '13px' }}>{n.text}</div>
                        <div style={{ fontSize: '11px', color: theme.colors.textSecondary }}>{new Date(n.date).toLocaleString()}</div>
                      </div>
                      <button style={{ background: 'transparent', border: 'none', color: theme.colors.danger, cursor: 'pointer' }} onClick={() => {
                        setNotifications((prev) => {
                          const next = prev.filter(x => x.id !== n.id);
                          try { localStorage.setItem('local_notifications_v1', JSON.stringify(next)); } catch(e){}
                          return next;
                        });
                      }}>Eliminar</button>
                    </div>
                  ))}
                </div>
            </div>
          )}
        </div>

        <div style={{ position: 'relative' }} ref={accountRef}>
          <IconButton
            icon={<FiUser />}
            onClick={() => router.push('/perfil')}
          />
        </div>
      </div>
    </header>
  );
};

export default TopHeader;
