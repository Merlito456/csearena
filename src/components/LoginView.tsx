import { useState, useEffect } from "react";
import * as React from "react";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { BookOpenCheck, ArrowRight, AlertCircle, Shield, UserPlus, Check, Clock, X } from "lucide-react";
import { motion } from "motion/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface LoginViewProps {
  onLogin: (user: any, isAdmin?: boolean) => void;
}

interface RecentAccount {
  id: string;
  name: string;
  lastLogin: number;
}

export function LoginView({ onLogin }: LoginViewProps) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("login");
  const [recentAccounts, setRecentAccounts] = useState<RecentAccount[]>([]);
  
  // Registration State
  const [regFirstName, setRegFirstName] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [generatedId, setGeneratedId] = useState("");

  // Admin State
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminPass, setAdminPass] = useState("");

  useEffect(() => {
    const storedAccounts = localStorage.getItem("cse_recent_accounts");
    if (storedAccounts) {
      try {
        setRecentAccounts(JSON.parse(storedAccounts));
      } catch (e) {
        console.error("Failed to parse recent accounts", e);
      }
    }
  }, []);

  const saveRecentAccount = (user: any) => {
    if (!user || !user.id || user.id === "ADMIN") return;
    
    const newAccount: RecentAccount = {
      id: user.id,
      name: user.name || "User",
      lastLogin: Date.now()
    };

    setRecentAccounts(prev => {
      const filtered = prev.filter(acc => acc.id !== newAccount.id);
      const updated = [newAccount, ...filtered].slice(0, 3); // Keep top 3
      localStorage.setItem("cse_recent_accounts", JSON.stringify(updated));
      return updated;
    });
  };

  const removeRecentAccount = (accountId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentAccounts(prev => {
      const updated = prev.filter(acc => acc.id !== accountId);
      localStorage.setItem("cse_recent_accounts", JSON.stringify(updated));
      return updated;
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (isAdminMode) {
      if (adminPass === "07141994") {
        onLogin("ADMIN", true);
      } else {
        setError("Invalid admin password.");
      }
      return;
    }

    if (!identifier || !password) {
      setError("Please enter your Identifier and Password.");
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "";
      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      if (res.ok) {
        const user = await res.json();
        saveRecentAccount(user);
        onLogin(user);
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Login failed. Check your credentials.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Connection error. Please try again.");
    }
  };

  const handleRecentLogin = async (accountId: string) => {
    setIdentifier(accountId);
    setError("");
    
    if (accountId === "GUEST") {
      onLogin({ id: "GUEST", name: "GUEST USER", email: "guest@example.com" });
      return;
    }
    
    // For recent accounts, we still need a password now.
    // So we'll just populate the identifier and let the user enter the password.
    setActiveTab("login");
  };


  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!regFirstName.trim() || !regLastName.trim() || !regUsername.trim() || !regEmail.trim() || !regPassword.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newId = `CSE-${randomPart}`;

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "";
      const res = await fetch(`${apiUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id: newId, 
          firstName: regFirstName, 
          lastName: regLastName, 
          username: regUsername, 
          email: regEmail, 
          password: regPassword 
        }),
      });

      if (res.ok) {
        const newUser = await res.json();
        setGeneratedId(newId);
        setIdentifier(newId); 
        saveRecentAccount(newUser);
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("Connection error. Please try again.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIdentifier(e.target.value);
    if (error) setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
      <div className="absolute inset-0 hero-gradient pointer-events-none" />
      
      {/* Floating Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md px-4 relative z-10"
      >
        <div className="text-center mb-10 space-y-4">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-2xl mb-2 shadow-inner"
          >
            <BookOpenCheck className="w-12 h-12 text-primary" />
          </motion.div>
          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              CSE <span className="text-primary">Arena</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              {isAdminMode ? "Admin Access Portal" : "Master the Civil Service Exam with AI"}
            </p>
          </div>
        </div>

        <Card className="glass-card border-2 overflow-hidden">
          {isAdminMode ? (
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold flex items-center gap-2 text-destructive">
                  <Shield className="w-5 h-5" /> Admin Login
                </h2>
                <Button variant="ghost" size="sm" onClick={() => { setIsAdminMode(false); setError(""); }}>
                  Cancel
                </Button>
              </div>
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="admin-pass">Security Key</Label>
                  <Input
                    id="admin-pass"
                    type="password"
                    placeholder="••••••••"
                    value={adminPass}
                    onChange={(e) => { setAdminPass(e.target.value); setError(""); }}
                    className="h-12"
                  />
                </div>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}
                <Button type="submit" className="w-full h-12 bg-destructive hover:bg-destructive/90 text-white font-bold">
                  Access Secure Portal
                </Button>
              </form>
            </div>
          ) : (
            <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
              <div className="px-6 pt-4">
                <TabsList className="w-full grid grid-cols-2 h-12">
                  <TabsTrigger value="login" className="text-sm font-semibold">Sign In</TabsTrigger>
                  <TabsTrigger value="register" className="text-sm font-semibold">Create Account</TabsTrigger>
                </TabsList>
              </div>

              <CardContent className="p-8">
                <TabsContent value="login" className="mt-0 space-y-6">
                  <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="identifier" className="text-sm font-medium">Username, Email, or Reviewer ID</Label>
                        <Input
                          id="identifier"
                          placeholder="Username / Email / CSE-XXXXXX"
                          value={identifier}
                          onChange={handleChange}
                          className="h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="login-password" className="text-sm font-medium">Password</Label>
                        <Input
                          id="login-password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="h-12"
                        />
                      </div>
                    </div>
                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg"
                      >
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                      </motion.div>
                    )}
                    <Button type="submit" className="w-full h-12 text-base font-bold" size="lg">
                      Enter Arena <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </form>

                  {recentAccounts.length > 0 && (
                    <div className="mt-10 pt-8 border-t border-border/50">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                          <Clock className="w-3 h-3" /> Quick Access
                        </h3>
                      </div>
                      <div className="space-y-3">
                        {recentAccounts.map((account) => (
                          <motion.div 
                            key={account.id}
                            whileHover={{ x: 4 }}
                            onClick={() => handleRecentLogin(account.id)}
                            className="flex items-center justify-between p-4 rounded-xl border bg-background/50 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all group shadow-sm"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                                {account.name.substring(0, 1).toUpperCase()}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-bold leading-none mb-1">{account.name}</span>
                                <span className="text-[10px] text-muted-foreground font-mono tracking-tighter">{account.id}</span>
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                              onClick={(e) => removeRecentAccount(account.id, e)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="register" className="mt-0 space-y-6">
                  {!generatedId ? (
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="reg-firstname" className="text-sm font-medium">First Name</Label>
                          <Input
                            id="reg-firstname"
                            placeholder="Juan"
                            value={regFirstName}
                            onChange={(e) => { setRegFirstName(e.target.value); setError(""); }}
                            className="h-12"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="reg-lastname" className="text-sm font-medium">Last Name</Label>
                          <Input
                            id="reg-lastname"
                            placeholder="Dela Cruz"
                            value={regLastName}
                            onChange={(e) => { setRegLastName(e.target.value); setError(""); }}
                            className="h-12"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reg-username" className="text-sm font-medium">Username</Label>
                        <Input
                          id="reg-username"
                          placeholder="juan_dc"
                          value={regUsername}
                          onChange={(e) => { setRegUsername(e.target.value); setError(""); }}
                          className="h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reg-email" className="text-sm font-medium">Email Address</Label>
                        <Input
                          id="reg-email"
                          type="email"
                          placeholder="juan@example.com"
                          value={regEmail}
                          onChange={(e) => { setRegEmail(e.target.value); setError(""); }}
                          className="h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reg-password" className="text-sm font-medium">Password</Label>
                        <Input
                          id="reg-password"
                          type="password"
                          placeholder="••••••••"
                          value={regPassword}
                          onChange={(e) => { setRegPassword(e.target.value); setError(""); }}
                          className="h-12"
                        />
                      </div>
                      {error && (
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg"
                        >
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{error}</span>
                        </motion.div>
                      )}
                      <Button type="submit" className="w-full h-12 text-base font-bold" size="lg">
                        Create Account <UserPlus className="w-4 h-4 ml-2" />
                      </Button>
                    </form>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-8 text-center py-4"
                    >
                      <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto shadow-inner">
                        <Check className="w-10 h-10 text-green-500" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-bold text-2xl">You're Ready!</h3>
                        <p className="text-sm text-muted-foreground">Your unique Reviewer ID has been generated.</p>
                      </div>
                      <div className="bg-primary/5 p-6 rounded-2xl border-2 border-dashed border-primary/30 relative group">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                          Your ID
                        </div>
                        <code className="text-3xl font-mono font-black tracking-[0.2em] text-primary select-all">
                          {generatedId}
                        </code>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-xl text-xs text-muted-foreground flex items-start gap-3 text-left">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <p>Please save this ID. You will need it to access your progress, stats, and premium features across all devices.</p>
                      </div>
                      <Button onClick={() => setActiveTab("login")} className="w-full h-12 font-bold" variant="outline">
                        Proceed to Login
                      </Button>
                    </motion.div>
                  )}
                </TabsContent>
              </CardContent>
              
              <CardFooter className="flex justify-center border-t py-6 bg-muted/5">
                <Button 
                  variant="link" 
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => { setIsAdminMode(true); setError(""); }}
                >
                  <Shield className="w-3 h-3 mr-1.5" /> Administrator Access
                </Button>
              </CardFooter>
            </Tabs>
          )}
        </Card>
        
        <p className="mt-8 text-center text-xs text-muted-foreground/60 font-medium uppercase tracking-[0.2em]">
          © 2026 CSE Arena • AI-Powered Review
        </p>
      </motion.div>
    </div>
  );
}
