import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { 
  LayoutDashboard, BookOpen, GraduationCap, BarChart2, AlertCircle, X, 
  Brain, Database, History, RefreshCw, Zap, Layers, Calendar, Trophy, 
  Award, Crown, Settings, BookOpenCheck, LogOut
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export type ViewState = 
  | "dashboard" | "subjects" | "mock-exam" | "practice"
  | "stats" | "history"
  | "planner" | "leaderboard" | "achievements"
  | "premium" | "settings";

interface SidebarProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onLogout?: () => void;
  isPremium: boolean;
}

export function Sidebar({ currentView, onNavigate, isOpen, setIsOpen, onLogout, isPremium }: SidebarProps) {
  const menuGroups = [
    {
      label: "Core",
      items: [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "subjects", label: "Subjects", icon: BookOpen },
        { id: "mock-exam", label: "Mock Exam", icon: GraduationCap },
        { id: "practice", label: "Practice Mode", icon: Brain, badge: "NEW" },
      ]
    },
    {
      label: "Progress",
      items: [
        { id: "stats", label: "Analytics", icon: BarChart2 },
        { id: "history", label: "Exam History", icon: History },
      ]
    },
    {
      label: "Engagement",
      items: [
        { id: "planner", label: "Study Planner", icon: Calendar },
        { id: "leaderboard", label: "Leaderboard", icon: Trophy },
        { id: "achievements", label: "Achievements", icon: Award },
      ]
    },
    {
      label: "System",
      items: [
        { id: "premium", label: "Premium", icon: Crown, className: "text-yellow-600", badge: isPremium ? "PRO" : undefined },
        { id: "settings", label: "Settings", icon: Settings },
      ]
    }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <motion.div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:h-screen shadow-xl md:shadow-none flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b shrink-0">
          <div className="flex items-center">
            <GraduationCap className="w-6 h-6 text-primary mr-2" />
            <span className="font-bold text-lg tracking-tight">CSE Arena</span>
          </div>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsOpen(false)}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {menuGroups.map((group, idx) => (
            <div key={idx}>
              <h4 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {group.label}
              </h4>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <Button
                    key={item.id}
                    variant={currentView === item.id ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 relative",
                      currentView === item.id && "bg-primary/10 text-primary hover:bg-primary/15",
                      item.className
                    )}
                    onClick={() => {
                      onNavigate(item.id as ViewState);
                      setIsOpen(false);
                    }}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                    {item.badge && (
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t shrink-0 space-y-4">
          {onLogout && (
            <Button 
              variant="ghost" 
              className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={onLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log Out
            </Button>
          )}
          <div className="bg-muted/50 p-4 rounded-lg text-xs text-muted-foreground">
            <p className="font-semibold mb-1">CSE Arena</p>
            <p>v1.1.0 • Powered by AI</p>
          </div>
        </div>
      </motion.div>
    </>
  );
}
