import Sidebar from './Sidebar';
import Header from './Header';

interface AppLayoutProps {
  children:   React.ReactNode;
  title:      string;
  subtitle?:  string;
  actions?:   React.ReactNode;
}

export default function AppLayout({ children, title, subtitle, actions }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen bg-[#F8F9FA]">
      <Sidebar />

      <div className="flex-1 ml-[240px] flex flex-col min-h-screen">
        <Header title={title} breadcrumb={subtitle} actions={actions} />
        <main className="flex-1 p-7">
          {children}
        </main>
      </div>
    </div>
  );
}