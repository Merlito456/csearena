import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Trophy, Medal, Crown, Flame, Target, Star, ArrowUp, ArrowDown, Minus, Loader2 } from "lucide-react";
import { motion } from "motion/react";

interface LeaderboardViewProps {
  onBack: () => void;
  userId: string;
  userName: string;
}

interface UserRank {
  id: string;
  rank: number;
  name: string;
  xp: number;
  accuracy: number;
  streak: number;
  avatar?: string;
  change: "up" | "down" | "same";
}

export function LeaderboardView({ onBack, userId, userName }: LeaderboardViewProps) {
  const [period, setPeriod] = useState("weekly");
  const [users, setUsers] = useState<UserRank[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/leaderboard?period=${period}`);
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [period]);

  const topUsers = users.slice(0, 3);
  const otherUsers = users.slice(3);
  const currentUserRank = users.find(u => u.id === userId);

  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1: return "text-yellow-500 bg-yellow-100 border-yellow-200";
      case 2: return "text-gray-400 bg-gray-100 border-gray-200";
      case 3: return "text-amber-600 bg-amber-100 border-amber-200";
      default: return "text-primary bg-primary/10 border-primary/20";
    }
  };

  const getChangeIcon = (change: string) => {
    switch (change) {
      case "up": return <ArrowUp className="w-3 h-3 text-green-500" />;
      case "down": return <ArrowDown className="w-3 h-3 text-red-500" />;
      default: return <Minus className="w-3 h-3 text-muted-foreground" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          Leaderboard
        </h2>
        <div className="flex bg-muted p-1 rounded-lg">
          {["Daily", "Weekly", "Monthly"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p.toLowerCase())}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                period === p.toLowerCase() 
                  ? "bg-background shadow text-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Podium Section */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading leaderboard...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
          <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
          <h3 className="text-lg font-semibold">No rankings yet</h3>
          <p className="text-muted-foreground">Be the first to top the leaderboard!</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4 items-end mb-8 pt-8">
            {/* 2nd Place */}
            {topUsers[1] && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center"
              >
                <div className="relative mb-2">
                  <Avatar className="w-16 h-16 border-4 border-gray-200">
                    <AvatarFallback className="bg-gray-100 text-gray-600 font-bold text-xl">
                      {topUsers[1].name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gray-200 text-gray-700 text-xs font-bold px-2 py-0.5 rounded-full border border-white">
                    #2
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-sm truncate w-24">{topUsers[1].name}</div>
                  <div className="text-xs text-muted-foreground font-medium">{topUsers[1].xp} XP</div>
                </div>
                <div className="h-24 w-full bg-gradient-to-t from-gray-200 to-gray-50 rounded-t-lg mt-2 border-x border-t border-gray-200" />
              </motion.div>
            )}

            {/* 1st Place */}
            {topUsers[0] && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center z-10"
              >
                <div className="relative mb-2">
                  <Crown className="w-8 h-8 text-yellow-500 absolute -top-10 left-1/2 -translate-x-1/2 animate-bounce" />
                  <Avatar className="w-20 h-20 border-4 border-yellow-400 shadow-lg shadow-yellow-200">
                    <AvatarFallback className="bg-yellow-100 text-yellow-700 font-bold text-2xl">
                      {topUsers[0].name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-sm font-bold px-3 py-0.5 rounded-full border-2 border-white">
                    #1
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-base truncate w-28">{topUsers[0].name}</div>
                  <div className="text-sm text-yellow-600 font-bold">{topUsers[0].xp} XP</div>
                </div>
                <div className="h-32 w-full bg-gradient-to-t from-yellow-200 to-yellow-50 rounded-t-lg mt-2 border-x border-t border-yellow-200 shadow-lg" />
              </motion.div>
            )}

            {/* 3rd Place */}
            {topUsers[2] && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col items-center"
              >
                <div className="relative mb-2">
                  <Avatar className="w-16 h-16 border-4 border-amber-200">
                    <AvatarFallback className="bg-amber-100 text-amber-700 font-bold text-xl">
                      {topUsers[2].name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-200 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full border border-white">
                    #3
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-sm truncate w-24">{topUsers[2].name}</div>
                  <div className="text-xs text-muted-foreground font-medium">{topUsers[2].xp} XP</div>
                </div>
                <div className="h-20 w-full bg-gradient-to-t from-amber-200 to-amber-50 rounded-t-lg mt-2 border-x border-t border-amber-200" />
              </motion.div>
            )}
          </div>

          {/* List Section */}
          <Card>
            <CardContent className="p-0">
              {otherUsers.map((user, index) => (
                <motion.div 
                  key={user.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + (index * 0.05) }}
                  className={`flex items-center gap-4 p-4 border-b last:border-0 hover:bg-muted/50 transition-colors ${user.id === userId ? 'bg-primary/5' : ''}`}
                >
                  <div className="w-8 text-center font-bold text-muted-foreground">{user.rank}</div>
                  <div className="flex items-center justify-center w-6">
                    {getChangeIcon(user.change)}
                  </div>
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{user.name} {user.id === userId && <Badge variant="outline" className="ml-2 text-[10px] h-4">You</Badge>}</div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Target className="w-3 h-3" /> {user.accuracy}% Acc
                      </span>
                      {user.streak > 0 && (
                        <span className="flex items-center gap-1">
                          <Flame className="w-3 h-3 text-orange-500" /> {user.streak} Day Streak
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-primary">{user.xp} XP</div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* Current User Sticky Footer */}
          {currentUserRank && (
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t md:sticky md:bottom-4 md:border md:rounded-xl md:shadow-lg z-20">
              <div className="max-w-4xl mx-auto flex items-center gap-4">
                <div className="w-8 text-center font-bold text-primary">{currentUserRank.rank}</div>
                <div className="flex items-center justify-center w-6">
                  {getChangeIcon(currentUserRank.change)}
                </div>
                <Avatar className="w-10 h-10 border-2 border-primary">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">YOU</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-bold text-sm">You</div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Target className="w-3 h-3" /> {currentUserRank.accuracy}% Acc
                    </span>
                    {currentUserRank.streak > 0 && (
                      <span className="flex items-center gap-1">
                        <Flame className="w-3 h-3 text-orange-500" /> {currentUserRank.streak} Day Streak
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-primary text-lg">{currentUserRank.xp} XP</div>
                  <div className="text-[10px] text-muted-foreground">Ranked #{currentUserRank.rank}</div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
