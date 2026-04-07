import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useTheme } from "@/components/theme-provider";
import { 
  User, Settings, Bell, Palette, Shield, CreditCard, Info, 
  LogOut, Trash2, Moon, Sun, Monitor, Smartphone, Mail, Lock,
  Brain, Target, Trophy, Zap, Download, RefreshCw, ArrowLeft,
  CheckCircle2, AlertCircle
} from "lucide-react";
import { storageService } from "@/services/storageService";
import { cn } from "@/lib/utils";

interface SettingsViewProps {
  onBack: () => void;
  userId: string | null;
  userName: string;
  userEmail: string;
  onUpdateProfile: (name: string, email: string) => void;
}

export function SettingsView({ onBack, userId, userName, userEmail, onUpdateProfile }: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState("account");
  const { theme, setTheme } = useTheme();
  
  const [name, setName] = useState(userName);
  const [email, setEmail] = useState(userEmail);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSaveProfile = async () => {
    if (!userId) return;
    setIsSaving(true);
    setMessage(null);
    try {
      if (userId === "GUEST") {
        const updatedUser = { id: userId, name, email };
        storageService.saveUser(updatedUser);
        onUpdateProfile(updatedUser.name, updatedUser.email);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        const apiUrl = import.meta.env.VITE_API_URL || "";
        const res = await fetch(`${apiUrl}/api/user/update`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: userId, name, email }),
        });
        if (res.ok) {
          const updatedUser = await res.json();
          onUpdateProfile(updatedUser.name, updatedUser.email);
          setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } else {
          setMessage({ type: 'error', text: 'Failed to update profile.' });
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Connection error.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6 text-primary" />
            Settings
          </h2>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <Card className="md:col-span-1 h-fit">
          <CardContent className="p-2">
            <nav className="space-y-1">
              {[
                { id: "account", label: "Account", icon: User },
                { id: "study", label: "Study Preferences", icon: Target },
                { id: "notifications", label: "Notifications", icon: Bell },
                { id: "appearance", label: "Appearance", icon: Palette },
                { id: "privacy", label: "Privacy & Security", icon: Shield },
                { id: "subscription", label: "Subscription", icon: CreditCard },
                { id: "about", label: "About", icon: Info },
              ].map((item) => (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab(item.id)}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Button>
              ))}
            </nav>
          </CardContent>
        </Card>

        {/* Content Area */}
        <div className="md:col-span-3 space-y-6">
          {activeTab === "account" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your personal details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-20 h-20">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                        {name ? name.split(' ').map(n => n[0]).join('') : "JD"}
                      </AvatarFallback>
                    </Avatar>
                    <Button variant="outline">Change Avatar</Button>
                  </div>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        className=""
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                        className=""
                      />
                    </div>
                    {message && (
                      <div className={cn(
                        "text-sm p-3 rounded-lg flex items-center gap-2",
                        message.type === 'success' ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"
                      )}>
                        {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        {message.text}
                      </div>
                    )}
                    <Button 
                      onClick={handleSaveProfile} 
                      disabled={isSaving}
                      className="w-fit"
                    >
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Danger Zone</CardTitle>
                  <CardDescription>Irreversible actions.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Sign Out</div>
                      <div className="text-sm text-muted-foreground">Log out of your account on this device.</div>
                    </div>
                    <Button variant="outline" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                      <LogOut className="w-4 h-4 mr-2" /> Sign Out
                    </Button>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                      <div className="font-medium text-red-500">Delete Account</div>
                      <div className="text-sm text-muted-foreground">Permanently delete your account and data.</div>
                    </div>
                    <Button variant="destructive">
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "study" && (
            <Card>
              <CardHeader>
                <CardTitle>Study Preferences</CardTitle>
                <CardDescription>Customize your learning experience.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Default Difficulty</Label>
                      <div className="text-sm text-muted-foreground">Set your preferred question difficulty.</div>
                    </div>
                    <Select defaultValue="moderate">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                        <SelectItem value="adaptive">Adaptive (AI)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Daily Question Goal</Label>
                      <div className="text-sm text-muted-foreground">Target number of questions per day.</div>
                    </div>
                    <Select defaultValue="20">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select goal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 Questions</SelectItem>
                        <SelectItem value="20">20 Questions</SelectItem>
                        <SelectItem value="50">50 Questions</SelectItem>
                        <SelectItem value="100">100 Questions</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto-Show Explanations</Label>
                      <div className="text-sm text-muted-foreground">Show answer explanation immediately.</div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Exam Timer</Label>
                      <div className="text-sm text-muted-foreground">Show countdown timer during quizzes.</div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <div className="pt-6 border-t">
                  <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                    <Brain className="w-4 h-4 text-primary" /> AI Settings
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Adaptive Difficulty</Label>
                        <div className="text-sm text-muted-foreground">Let AI adjust difficulty based on performance.</div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Smart Flashcard Generation</Label>
                        <div className="text-sm text-muted-foreground">Auto-create flashcards from mistakes.</div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Manage your alerts and reminders.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Daily Study Reminder</Label>
                      <div className="text-sm text-muted-foreground">Get reminded to study every day.</div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Streak Alerts</Label>
                      <div className="text-sm text-muted-foreground">Notifications about your streak status.</div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>New Content Updates</Label>
                      <div className="text-sm text-muted-foreground">When new quizzes or features are added.</div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Achievement Unlocked</Label>
                      <div className="text-sm text-muted-foreground">Celebrate your milestones.</div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "appearance" && (
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize the look and feel.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button 
                        variant={theme === "light" ? "default" : "outline"} 
                        className="justify-start"
                        onClick={() => setTheme("light")}
                      >
                        <Sun className="w-4 h-4 mr-2" /> Light
                      </Button>
                      <Button 
                        variant={theme === "dark" ? "default" : "outline"} 
                        className="justify-start"
                        onClick={() => setTheme("dark")}
                      >
                        <Moon className="w-4 h-4 mr-2" /> Dark
                      </Button>
                      <Button 
                        variant={theme === "system" ? "default" : "outline"} 
                        className="justify-start"
                        onClick={() => setTheme("system")}
                      >
                        <Monitor className="w-4 h-4 mr-2" /> System
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Reduce Motion</Label>
                      <div className="text-sm text-muted-foreground">Minimize animations for better performance.</div>
                    </div>
                    <Switch />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "privacy" && (
            <Card>
              <CardHeader>
                <CardTitle>Privacy & Security</CardTitle>
                <CardDescription>Control your data and visibility.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Public Profile</Label>
                      <div className="text-sm text-muted-foreground">Allow others to see your profile.</div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Leaderboard Visibility</Label>
                      <div className="text-sm text-muted-foreground">Show your rank on public leaderboards.</div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="pt-4 border-t space-y-4">
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="w-4 h-4 mr-2" /> Export My Data
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50">
                      <RefreshCw className="w-4 h-4 mr-2" /> Reset Progress
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "subscription" && (
            <Card>
              <CardHeader>
                <CardTitle>Subscription</CardTitle>
                <CardDescription>Manage your plan and billing.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-lg text-primary">Free Plan</div>
                    <div className="text-sm text-muted-foreground">Basic access</div>
                  </div>
                  <Button>Upgrade to Premium</Button>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Plan Features</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" /> 5 Quizzes per day
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" /> Basic Analytics
                    </li>
                    <li className="flex items-center gap-2 opacity-50">
                      <Lock className="w-3 h-3" /> Unlimited AI Explanations
                    </li>
                    <li className="flex items-center gap-2 opacity-50">
                      <Lock className="w-3 h-3" /> Adaptive Mock Exams
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "about" && (
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
                <CardDescription>App information and legal.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                    <Zap className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="font-bold">CSE Arena</div>
                    <div className="text-sm text-muted-foreground">Version 1.1.0</div>
                  </div>
                </div>
                
                <div className="space-y-2 pt-4">
                  <Button variant="link" className="h-auto p-0 text-muted-foreground">Terms of Service</Button>
                  <br />
                  <Button variant="link" className="h-auto p-0 text-muted-foreground">Privacy Policy</Button>
                  <br />
                  <Button variant="link" className="h-auto p-0 text-muted-foreground">Send Feedback</Button>
                </div>

                <div className="text-xs text-muted-foreground pt-4 border-t">
                  © 2024 CSE Arena. All rights reserved.
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function Check(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
