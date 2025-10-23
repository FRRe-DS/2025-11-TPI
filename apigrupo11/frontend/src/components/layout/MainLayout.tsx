import type React from 'react';
import { Outlet } from 'react-router-dom';
import { theme } from '../../styles/theme';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';

interface MainLayoutProps {
  children?: React.ReactNode;
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: '100vw',
    backgroundColor: theme.colors.background,
    fontFamily: theme.fonts.body,
    overflow: 'hidden', // mantiene el layout sin scroll global
  },
  mainWrapper: {
    display: 'flex',
    flex: 1,
    minHeight: 0,
  },
  contentWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    overflow: 'hidden', // antes bloqueaba el scroll, lo dejamos
  },
  pageContent: {
    flex: 1,
    overflowY: 'auto', // 🔹 permite desplazamiento vertical
    height: '100%',
    padding: '2rem',
  },
};

export const MainLayout: React.FC<MainLayoutProps> = () => {
  return (
    <div style={styles.container}>
      <div style={styles.mainWrapper}>
        <Sidebar />
        <div style={styles.contentWrapper}>
          <TopHeader />
          <main style={styles.pageContent}>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
