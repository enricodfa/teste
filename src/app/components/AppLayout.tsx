import Sidebar from './Sidebar';
import Header from './Header';

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  breadcrumb?: string;
  headerActions?: React.ReactNode;
}

export default function AppLayout({ children, title, breadcrumb, headerActions }: AppLayoutProps) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar />
      <div
        style={{
          flex: 1,
          marginLeft: 'var(--sidebar-width)',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        <Header title={title} breadcrumb={breadcrumb} actions={headerActions} />
        <main style={{ flex: 1, padding: '28px 32px' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
