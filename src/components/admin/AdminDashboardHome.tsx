import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, TrendingUp, TrendingDown, DollarSign, Zap, 
  Target, AlertTriangle, FileText, UserPlus, Brain
} from "lucide-react";
import { cn } from "@/lib/utils";

export const AdminDashboardHome = () => {
  console.log("🏠 AdminDashboardHome: Rendering");
  const [stats, setStats] = useState<any>(null);
  const [revenue, setRevenue] = useState<any[]>([]);
  const [weakTopics, setWeakTopics] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "";
        const [statsRes, revRes, weakRes, leadRes, alertsRes] = await Promise.all([
          fetch(`${apiUrl}/api/admin/dashboard-stats`).catch(() => null),
          fetch(`${apiUrl}/api/admin/revenue`).catch(() => null),
          fetch(`${apiUrl}/api/admin/weak-topics`).catch(() => null),
          fetch(`${apiUrl}/api/admin/leaderboard`).catch(() => null),
          fetch(`${apiUrl}/api/admin/alerts`).catch(() => null)
        ]);

        const statsData = statsRes?.ok ? await statsRes.json().catch(() => null) : null;
        const revData = revRes?.ok ? await revRes.json().catch(() => []) : [];
        const weakData = weakRes?.ok ? await weakRes.json().catch(() => []) : [];
        const leadData = leadRes?.ok ? await leadRes.json().catch(() => []) : [];
        const alertsData = alertsRes?.ok ? await alertsRes.json().catch(() => []) : [];

        setStats(statsData || { totalUsers: 0, premiumUsers: 0, totalQuizzes: 0, revenueToday: 0, aiUsageToday: 0 });
        setRevenue(revData || []);
        setWeakTopics(weakData || []);
        setLeaderboard(leadData || []);
        setAlerts(alertsData || []);
      } catch (error) {
        console.error("Failed to fetch admin dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-12 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: stats?.totalUsers?.toLocaleString() || "0", trend: "+0%", up: true, icon: Users, color: "text-blue-600" },
          { label: "Premium Users", value: stats?.premiumUsers?.toLocaleString() || "0", trend: "+0%", up: true, icon: Zap, color: "text-amber-600" },
          { label: "Total Quizzes", value: stats?.totalQuizzes?.toLocaleString() || "0", trend: "+0%", up: true, icon: Target, color: "text-green-600" },
          { label: "Revenue Today", value: `₱${stats?.revenueToday?.toLocaleString() || "0"}`, trend: "+0%", up: true, icon: DollarSign, color: "text-emerald-600" },
        ].map((kpi, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
                <kpi.icon className={cn("h-4 w-4", kpi.color)} />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{kpi.value}</span>
                <span className={cn(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5",
                  kpi.up ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"
                )}>
                  {kpi.up ? <TrendingUp className="w-2 h-2" /> : <TrendingDown className="w-2 h-2" />}
                  {kpi.trend}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue & Activity</CardTitle>
            <CardDescription>Monthly revenue growth and user engagement trends.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] min-h-[350px] w-full flex items-center justify-center border border-dashed rounded-xl text-muted-foreground">
              Chart temporarily disabled for diagnostics
            </div>
          </CardContent>
        </Card>

        {/* Weakest Topics */}
        <Card>
          <CardHeader>
            <CardTitle>Weak Topic Analytics</CardTitle>
            <CardDescription>Topics where users struggle the most.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {weakTopics.length > 0 ? weakTopics.map((topic, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-foreground">{topic.topic}</span>
                  <span className="text-red-600 font-bold">{topic.failRate}% Fail Rate</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-500 rounded-full" 
                    style={{ width: `${topic.failRate}%` }} 
                  />
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-muted-foreground text-sm">No data available yet</div>
            )}
            <Button variant="outline" className="w-full text-xs">
              <Zap className="w-3 h-3 mr-2" /> Generate Targeted Content
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leaderboard Snapshot */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
            <CardDescription>Current leaderboard leaders.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leaderboard.length > 0 ? leaderboard.map((user) => (
                <div key={user.rank} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                      {user.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-[10px] text-muted-foreground">Rank #{user.rank}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/50">
                    {user.score}
                  </Badge>
                </div>
              )) : (
                <div className="text-center py-8 text-muted-foreground text-sm">No leaderboard data yet</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* System Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>System Alerts</CardTitle>
            <CardDescription>Critical updates and notifications.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {alerts.length > 0 ? alerts.map((alert, i) => (
              <div key={i} className={cn(
                "flex gap-3 p-3 border rounded-xl",
                alert.type === "warning" ? "bg-amber-50 border-amber-100 dark:bg-amber-950/30 dark:border-amber-900/50" : 
                alert.type === "error" ? "bg-red-50 border-red-100 dark:bg-red-950/30 dark:border-red-900/50" : 
                "bg-blue-50 border-blue-100 dark:bg-blue-950/30 dark:border-blue-900/50"
              )}>
                <AlertTriangle className={cn(
                  "w-5 h-5 shrink-0",
                  alert.type === "warning" ? "text-amber-600 dark:text-amber-500" : 
                  alert.type === "error" ? "text-red-600 dark:text-red-500" : 
                  "text-blue-600 dark:text-blue-500"
                )} />
                <div>
                  <p className={cn(
                    "text-sm font-medium",
                    alert.type === "warning" ? "text-amber-900 dark:text-amber-200" : 
                    alert.type === "error" ? "text-red-900 dark:text-red-200" : 
                    "text-blue-900 dark:text-blue-200"
                  )}>{alert.title}</p>
                  <p className={cn(
                    "text-xs",
                    alert.type === "warning" ? "text-amber-700 dark:text-amber-300/70" : 
                    alert.type === "error" ? "text-red-700 dark:text-red-300/70" : 
                    "text-blue-700 dark:text-blue-300/70"
                  )}>{alert.message}</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-muted-foreground text-sm">No active alerts. System is healthy.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
