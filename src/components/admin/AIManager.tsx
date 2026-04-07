import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, FileText, BarChart3, History, Settings, 
  Zap, AlertTriangle, Construction, Rocket, Loader2, CheckCircle2
} from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { cn } from "@/lib/utils";
import { AITab } from "./types";
import { aiService } from "@/services/aiService";
import { Category, Question } from "@/types";
import { MathRenderer } from "@/components/MathRenderer";

export const AIManager = () => {
  const [activeAITab, setActiveAITab] = useState<AITab>("generation");

  const aiTabs: { id: AITab; label: string; icon: any }[] = [
    { id: "generation", label: "AI Generation", icon: Brain },
    { id: "templates", label: "Prompt Templates", icon: FileText },
    { id: "analytics", label: "Usage Analytics", icon: BarChart3 },
    { id: "history", label: "Generation History", icon: History },
    { id: "config", label: "AI Config", icon: Settings },
  ];

  return (
    <div className="space-y-6">
      {/* AI Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {aiTabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeAITab === tab.id ? "default" : "outline"}
            size="sm"
            className="whitespace-nowrap"
            onClick={() => setActiveAITab(tab.id)}
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
          </Button>
        ))}
      </div>

      {activeAITab === "generation" && <BoardSynthesis />}

      {activeAITab === "analytics" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground font-medium uppercase mb-1">Today's Cost</p>
                <p className="text-2xl font-bold">$0.00</p>
                <p className="text-[10px] text-green-600 mt-1">↓ 0% from yesterday</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground font-medium uppercase mb-1">Tokens Used</p>
                <p className="text-2xl font-bold">0</p>
                <p className="text-[10px] text-muted-foreground mt-1">Avg 0 per gen</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground font-medium uppercase mb-1">Total Generations</p>
                <p className="text-2xl font-bold">0</p>
                <p className="text-[10px] text-indigo-600 mt-1">0% success rate</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground font-medium uppercase mb-1">Top Admin</p>
                <p className="text-2xl font-bold">N/A</p>
                <p className="text-[10px] text-muted-foreground mt-1">0 generations</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Usage Trends</CardTitle>
              <CardDescription>Token consumption over the last 7 days.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground text-sm border border-dashed rounded-xl">
                No usage data available yet
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeAITab === "history" && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground font-medium border-b">
                <tr>
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">Admin</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Tokens</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">No generation history found</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {(activeAITab === "templates" || activeAITab === "config") && (
        <div className="flex flex-col items-center justify-center h-64 text-center p-8 bg-background rounded-xl border border-dashed">
          <Construction className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="font-semibold text-foreground">AI Module Coming Soon</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            The {activeAITab} management interface is currently under development.
          </p>
        </div>
      )}
    </div>
  );
};

const BoardSynthesis = () => {
  const [arena, setArena] = useState<Category>("Numerical Reasoning");
  const [mapping, setMapping] = useState("General Board Mix");
  const [itemCount, setItemCount] = useState(10);
  const [threshold, setThreshold] = useState(80);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedItems, setGeneratedItems] = useState<Question[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleInitiate = async () => {
    setIsGenerating(true);
    setSaveSuccess(false);
    try {
      const questions = await aiService.generateQuestions(arena, itemCount, "Moderate");
      setGeneratedItems(questions);
    } catch (error) {
      console.error("Generation failed", error);
      alert("AI Generation failed. Please check your connection and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToDB = async () => {
    setIsSaving(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "";
      const res = await fetch(`${apiUrl}/api/admin/questions/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions: generatedItems }),
      });
      if (res.ok) {
        setSaveSuccess(true);
        setGeneratedItems([]);
      }
    } catch (error) {
      console.error("Save failed", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
      {/* Left Sidebar - Parameters */}
      <div className="lg:col-span-4 bg-[#0F172A] rounded-3xl p-8 flex flex-col gap-8 shadow-2xl border border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center border border-blue-500/30">
            <Zap className="w-6 h-6 text-blue-500 fill-blue-500" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight uppercase">Board Synthesis</h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">TOS AI Generation Hub</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Target Arena</label>
            <select 
              value={arena}
              onChange={(e) => setArena(e.target.value as Category)}
              className="w-full bg-[#1E293B] border-none rounded-xl px-4 py-4 text-white font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer"
            >
              <option value="Numerical Reasoning">Numerical Reasoning</option>
              <option value="Verbal Reasoning">Verbal Reasoning</option>
              <option value="General Information">General Information</option>
              <option value="Clerical Ability">Clerical Ability</option>
              <option value="Logic">Logic</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Topic Mapping</label>
            <select 
              value={mapping}
              onChange={(e) => setMapping(e.target.value)}
              className="w-full bg-[#1E293B] border-none rounded-xl px-4 py-4 text-white font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer"
            >
              <option>General Board Mix</option>
              <option>Specific TOS Weighted</option>
              <option>Historical Fail-Points</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Item Count</label>
            <input 
              type="number"
              value={itemCount}
              onChange={(e) => setItemCount(parseInt(e.target.value))}
              className="w-full bg-[#1E293B] border-none rounded-xl px-4 py-4 text-white font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          <div className="space-y-4 bg-[#1E293B]/50 rounded-2xl p-6 border border-slate-800">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Trust Threshold</label>
              <span className="text-lg font-black text-white">{threshold}%</span>
            </div>
            <input 
              type="range"
              min="0"
              max="100"
              value={threshold}
              onChange={(e) => setThreshold(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        </div>

        <Button 
          onClick={handleInitiate}
          disabled={isGenerating}
          className="mt-auto w-full bg-blue-600 hover:bg-blue-700 text-white h-14 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50"
        >
          {isGenerating ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <Rocket className="w-5 h-5 mr-2" />
          )}
          Initiate Generation
        </Button>
      </div>

      {/* Right Content Area */}
      <div className="lg:col-span-8 bg-[#0F172A]/30 rounded-3xl border-2 border-dashed border-slate-800 flex flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
        
        {generatedItems.length === 0 && !isGenerating && !saveSuccess && !isSaving && (
          <div className="text-center space-y-4 relative z-10">
            <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-700">
              <Zap className="w-10 h-10 text-slate-600" />
            </div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tight">Synthesis Ready</h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto font-medium leading-relaxed">
              Enter parameters on the left to start generating TOS-weighted board items.
            </p>
          </div>
        )}

        {isGenerating && (
          <div className="text-center space-y-6 relative z-10">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto" />
              <Zap className="w-8 h-8 text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Synthesizing Items...</h3>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">Gemini AI is processing your request</p>
            </div>
          </div>
        )}

        {saveSuccess && (
          <div className="text-center space-y-4 relative z-10">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tight">Synthesis Complete</h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto font-medium">
              Successfully generated and saved {itemCount} items to the database.
            </p>
            <Button 
              variant="outline" 
              onClick={() => setSaveSuccess(false)}
              className="mt-4 border-slate-700 text-slate-400 hover:text-white"
            >
              Start New Session
            </Button>
          </div>
        )}

        {generatedItems.length > 0 && !isSaving && !saveSuccess && (
          <div className="w-full h-full flex flex-col gap-6 relative z-10">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Generated Output</h3>
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">{generatedItems.length} Items</Badge>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {generatedItems.map((item, i) => {
                if (!item) return null;
                return (
                  <div key={i} className="bg-[#1E293B] rounded-2xl p-6 border border-slate-800 hover:border-blue-500/30 transition-colors group">
                  <div className="flex gap-4">
                    <span className="text-blue-500 font-black text-lg">0{i + 1}</span>
                    <div className="space-y-4 flex-1">
                      <p className="text-white font-bold leading-relaxed">
                        <MathRenderer content={item.text} />
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {item.options.map((opt, oi) => (
                          <div key={oi} className={cn(
                            "px-4 py-2 rounded-lg text-xs font-bold",
                            oi === item.correctAnswerIndex ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-slate-800 text-slate-400"
                          )}>
                            <MathRenderer content={opt} />
                          </div>
                        ))}
                      </div>
                      {/* Show explanation in admin view too */}
                      <div className="mt-2 text-xs text-slate-400 bg-slate-800/50 p-3 rounded-lg">
                        <span className="font-bold text-slate-300 block mb-1">Explanation:</span>
                        <MathRenderer content={item.explanation} />
                      </div>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>

            <div className="pt-6 border-t border-slate-800 flex gap-4">
              <Button 
                variant="outline" 
                onClick={() => setGeneratedItems([])}
                className="flex-1 border-slate-700 text-slate-400 hover:bg-slate-800 h-12 rounded-xl font-bold uppercase tracking-widest"
              >
                Discard
              </Button>
              <Button 
                onClick={handleSaveToDB}
                className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white h-12 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20"
              >
                Commit to Database
              </Button>
            </div>
          </div>
        )}

        {isSaving && (
          <div className="text-center space-y-6 relative z-10">
            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto" />
            <h3 className="text-xl font-black text-white uppercase tracking-tight">Committing to Database...</h3>
          </div>
        )}
      </div>
    </div>
  );
};
