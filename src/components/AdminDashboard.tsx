import { useState, useEffect } from "react";
import { AdminSidebar } from "./admin/AdminSidebar";
import { AdminDashboardHome } from "./admin/AdminDashboardHome";
import { UserManager } from "./admin/UserManager";
import { ContentCMS } from "./admin/ContentCMS";
import { AIManager } from "./admin/AIManager";
import { Analytics } from "./admin/Analytics";
import { SystemSettings } from "./admin/SystemSettings";
import { PaymentManager } from "./admin/PaymentManager";
import { AdminView } from "./admin/types";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "./ui/button";
import { Menu, Search, Bell } from "lucide-react";
import { ErrorBoundary } from "./ErrorBoundary";

interface AdminDashboardProps {
  onLogout: () => void;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [currentView, setCurrentView] = useState<AdminView>("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  console.log("🛠️ AdminDashboard: Rendering with view:", currentView);

  useEffect(() => {
    console.log("🛠️ AdminDashboard: Mounted");
  }, []);

  const renderContent = () => {
    console.log("🛠️ AdminDashboard: renderContent called for:", currentView);
    return (
      <ErrorBoundary fallback={
        <div className="p-8 bg-red-950/30 border border-red-900/50 rounded-lg text-red-200">
          <h2 className="text-lg font-bold mb-2">Error loading {currentView}</h2>
          <p className="text-sm">The component failed to render. Check console for details.</p>
        </div>
      }>
        {(() => {
          switch (currentView) {
            case "dashboard": return <AdminDashboardHome />;
            case "users": return <UserManager />;
            case "content": return <ContentCMS />;
            case "ai": return <AIManager />;
            case "analytics": return <Analytics />;
            case "settings": return <SystemSettings />;
            case "payments": return <PaymentManager />;
            default: return <AdminDashboardHome />;
          }
        })()}
      </ErrorBoundary>
    );
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <AdminSidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        onLogout={onLogout}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-card border-b flex items-center justify-between px-4 md:px-8 shrink-0 z-30">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </Button>
            <div className="hidden md:flex items-center bg-muted rounded-full px-4 py-1.5 w-96">
              <Search className="w-4 h-4 text-muted-foreground mr-2" />
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="bg-transparent border-none outline-none text-sm w-full text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-card" />
            </Button>
            <div className="h-8 w-px bg-border mx-1" />
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-foreground leading-none">Admin User</p>
                <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-semibold">Superadmin</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-600/20">
                AD
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground capitalize">
                  {currentView.replace('-', ' ')}
                </h1>
                <p className="text-muted-foreground mt-1">Manage your platform's {currentView} and configuration.</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Download Report</Button>
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 text-white">Refresh Data</Button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentView}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
