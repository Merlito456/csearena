import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, Filter, MoreVertical, Eye, Settings, 
  UserPlus, Download, Mail, ShieldAlert, Zap,
  Trophy, History, Activity, Brain, X, BookOpen, Target
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { User } from "./types";

export const UserManager = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [planFilter, setPlanFilter] = useState("All Plans");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    setLoading(true);
    const apiUrl = import.meta.env.VITE_API_URL || "";
    fetch(`${apiUrl}/api/admin/users`)
      .then(res => res.json())
      .then(data => {
        const mappedUsers = data.map((u: any) => ({
          id: u.id,
          name: u.name,
          firstName: u.first_name,
          lastName: u.last_name,
          username: u.username,
          email: u.email || "no-email@example.com",
          role: u.role,
          plan: u.is_premium ? "Premium" : "Free",
          status: u.status,
          joinedDate: new Date(u.created_at).toLocaleDateString(),
          quizzesCompleted: Number(u.quizzes_completed) || 0,
          accuracy: Math.round(Number(u.avg_accuracy)) || 0,
          lastLogin: u.last_active ? new Date(u.last_active).toLocaleString() : "Never",
          aiUsage: { explanations: 0, generations: 0, quotaRemaining: 100 },
          streak: Number(u.streak_days) || 0,
          rank: Number(u.total_xp) || 0
        }));
        setUsers(mappedUsers);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch users:", err);
        setLoading(false);
      });
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "All Roles" || user.role === roleFilter;
    const matchesPlan = planFilter === "All Plans" || user.plan === planFilter;
    const matchesStatus = statusFilter === "All Status" || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesPlan && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search by name or email..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <select 
                className="bg-background border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option>All Roles</option>
                <option>User</option>
                <option>Premium</option>
                <option>Admin</option>
                <option>Superadmin</option>
              </select>
              <select 
                className="bg-background border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
              >
                <option>All Plans</option>
                <option>Free</option>
                <option>Premium</option>
              </select>
              <select 
                className="bg-background border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option>All Status</option>
                <option>Active</option>
                <option>Suspended</option>
              </select>
              <Button variant="outline" size="icon">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 flex justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
            <thead className="bg-muted text-muted-foreground font-medium border-b">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Role & Plan</th>
                <th className="p-4">Stats</th>
                <th className="p-4">Status</th>
                <th className="p-4">Joined</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredUsers.map((user) => {
                if (!user) return null;
                return (
                  <tr key={user.id} className="hover:bg-muted/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.username ? `@${user.username}` : user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      <Badge variant="outline" className="w-fit text-[10px]">{user.role}</Badge>
                      <Badge className={cn(
                        "w-fit text-[10px]",
                        user.plan === "Premium" ? "bg-amber-500" : "bg-slate-500"
                      )}>{user.plan}</Badge>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-xs space-y-1">
                      <p><span className="text-muted-foreground">Quizzes:</span> {user.quizzesCompleted}</p>
                      <p><span className="text-muted-foreground">Accuracy:</span> {user.accuracy}%</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge className={cn(
                      "text-[10px]",
                      user.status === "Active" ? "bg-green-500" : "bg-red-500"
                    )}>{user.status}</Badge>
                  </td>
                  <td className="p-4 text-muted-foreground text-xs">
                    {user.joinedDate}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedUser(user)}>
                        <Eye className="w-4 h-4 text-slate-400" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Settings className="w-4 h-4 text-slate-400" />
                      </Button>
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
          )}
        </div>
      </Card>

      {/* User Profile Modal */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setSelectedUser(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-background rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-6 border-b flex items-center justify-between bg-muted/30">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-indigo-200">
                    {selectedUser.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">{selectedUser.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{selectedUser.role}</Badge>
                      <Badge className={selectedUser.plan === "Premium" ? "bg-amber-500" : "bg-slate-500"}>
                        {selectedUser.plan} Plan
                      </Badge>
                      <span className="text-xs text-muted-foreground ml-2">ID: {selectedUser.id}</span>
                      {selectedUser.username && (
                        <span className="text-xs text-indigo-600 font-bold ml-2">@{selectedUser.username}</span>
                      )}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedUser(null)} className="rounded-full">
                  <X className="w-6 h-6" />
                </Button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Stats & Info */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: "Quizzes", value: selectedUser.quizzesCompleted, icon: BookOpen, color: "text-blue-600" },
                        { label: "Accuracy", value: `${selectedUser.accuracy}%`, icon: Target, color: "text-emerald-600" },
                        { label: "Streak", value: selectedUser.streak, icon: Activity, color: "text-orange-600" },
                        { label: "Total XP", value: selectedUser.rank, icon: Trophy, color: "text-amber-600" },
                      ].map((stat, i) => (
                        <div key={i} className="p-4 bg-muted/30 rounded-xl border border-border">
                          <stat.icon className={cn("w-4 h-4 mb-2", stat.color)} />
                          <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* AI Usage Card */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Brain className="w-4 h-4 text-indigo-600" /> AI Usage Insights
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg">
                            <p className="text-lg font-bold text-indigo-700 dark:text-indigo-400">{selectedUser.aiUsage.explanations}</p>
                            <p className="text-[10px] text-indigo-600 dark:text-indigo-500 font-medium uppercase">Explanations</p>
                          </div>
                          <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                            <p className="text-lg font-bold text-purple-700 dark:text-purple-400">{selectedUser.aiUsage.generations}</p>
                            <p className="text-[10px] text-purple-600 dark:text-purple-500 font-medium uppercase">Generations</p>
                          </div>
                          <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
                            <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{selectedUser.aiUsage.quotaRemaining}%</p>
                            <p className="text-[10px] text-emerald-600 dark:text-emerald-500 font-medium uppercase">Quota Left</p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Daily Quota Usage</span>
                            <span className="font-medium">{100 - selectedUser.aiUsage.quotaRemaining}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-indigo-600" 
                              style={{ width: `${100 - selectedUser.aiUsage.quotaRemaining}%` }} 
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Activity Timeline Placeholder */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <History className="w-4 h-4 text-slate-600" /> Recent Activity
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {[
                            { event: "Completed Quiz: Data Structures", time: "2 hours ago", type: "quiz" },
                            { event: "Generated AI Explanation", time: "5 hours ago", type: "ai" },
                            { event: "Earned Achievement: Fast Learner", time: "1 day ago", type: "award" },
                          ].map((item, i) => (
                            <div key={i} className="flex gap-3 items-start">
                              <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5" />
                              <div>
                                <p className="text-sm text-foreground">{item.event}</p>
                                <p className="text-[10px] text-muted-foreground">{item.time}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right Column: Actions & Details */}
                  <div className="space-y-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Personal Info</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm">
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold">Email Address</p>
                          <p className="text-foreground">{selectedUser.email}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold">Joined Date</p>
                          <p className="text-foreground">{selectedUser.joinedDate}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold">Last Login</p>
                          <p className="text-foreground">{selectedUser.lastLogin}</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-amber-100 dark:border-amber-900/50 bg-amber-50/30 dark:bg-amber-950/20">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-amber-800 dark:text-amber-500">Premium Management</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {selectedUser.plan === "Free" ? (
                          <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white border-none shadow-sm h-9 text-xs">
                            <Zap className="w-3.5 h-3.5 mr-2" /> Grant Premium Access
                          </Button>
                        ) : (
                          <>
                            <Button variant="outline" className="w-full border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-900/50 h-9 text-xs">
                              Extend Subscription
                            </Button>
                            <Button variant="ghost" className="w-full text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 hover:text-red-700 dark:hover:text-red-400 h-9 text-xs">
                              Revoke Premium
                            </Button>
                          </>
                        )}
                      </CardContent>
                    </Card>

                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start text-xs h-9">
                        <Mail className="w-3.5 h-3.5 mr-2 text-muted-foreground" /> Send Email
                      </Button>
                      <Button variant="outline" className="w-full justify-start text-xs h-9 text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 hover:text-red-700 dark:hover:text-red-400 border-red-100 dark:border-red-900/50">
                        <ShieldAlert className="w-3.5 h-3.5 mr-2" /> Suspend Account
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t bg-muted/30 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setSelectedUser(null)}>Close</Button>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">Save Changes</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
