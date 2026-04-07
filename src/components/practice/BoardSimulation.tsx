import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Clock, AlertCircle, CheckCircle2, ArrowRight, Shield, Zap, Target } from "lucide-react";

interface BoardSimulationProps {
  onStartMockExam: () => void;
}

export function BoardSimulation({ onStartMockExam }: BoardSimulationProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Board Simulation</h2>
        <p className="text-muted-foreground">Real exam environment with mixed question coverage.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-primary" />
              Simulation Workflow
            </CardTitle>
            <CardDescription>Full-scale simulation using verified database questions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-background rounded-xl border border-primary/10">
              <h4 className="font-bold text-sm mb-2 uppercase tracking-wider text-primary">Workflow</h4>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <span>Select between Mini exam (20 questions) or Full simulation (100 questions).</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <span>Timer starts immediately. No hints or explanations during the session.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <span>Receive subject breakdown and pass probability at the end.</span>
                </li>
              </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-background rounded-xl border space-y-1">
                <p className="text-[10px] font-bold uppercase text-muted-foreground">Readiness Score</p>
                <p className="text-lg font-bold">82%</p>
              </div>
              <div className="p-4 bg-background rounded-xl border space-y-1">
                <p className="text-[10px] font-bold uppercase text-muted-foreground">Pass Chance</p>
                <p className="text-lg font-bold text-emerald-600">High</p>
              </div>
              <div className="p-4 bg-background rounded-xl border space-y-1">
                <p className="text-[10px] font-bold uppercase text-muted-foreground">Avg. Score</p>
                <p className="text-lg font-bold">85/100</p>
              </div>
            </div>

            <Button 
              className="w-full h-12 text-lg font-bold uppercase tracking-widest"
              onClick={onStartMockExam}
            >
              Begin Simulation <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Last Attempt</CardTitle>
              <CardDescription>March 1, 2024</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-6 bg-muted/30 rounded-2xl border-2 border-dashed">
                <p className="text-4xl font-black text-primary">78%</p>
                <p className="text-xs font-bold uppercase text-muted-foreground mt-1">Failed by 2%</p>
              </div>
              <Button variant="outline" className="w-full">Review Last Attempt</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
