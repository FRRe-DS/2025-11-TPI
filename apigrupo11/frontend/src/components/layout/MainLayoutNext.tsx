import type React from 'react';
import { theme } from '../../styles/theme';
import SidebarNext from './SidebarNext';
import TopHeader from './TopHeader';

interface MainLayoutProps {
  children: React.ReactNode;
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: '100vw',
    backgroundColor: theme.colors.background,
    fontFamily: theme.fonts.body,
    overflow: 'hidden',
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
    overflow: 'hidden',
  },
  mainContent: {
    flex: 1,
    overflow: 'auto',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
};

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div style={styles.container}>
      <TopHeader />
      <div style={styles.mainWrapper}>
        <SidebarNext />
        <div style={styles.contentWrapper}>
          <main style={styles.mainContent}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
