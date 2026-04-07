import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Check, X, Search, Filter, ExternalLink, Clock, User, CreditCard } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Loading } from "../Loading";

export function PaymentManager() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/payments?status=${filter}`);
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (requestId: string, status: "verified" | "rejected") => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "";
      const res = await fetch(`${apiUrl}/api/admin/payments/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, status })
      });
      
      if (res.ok) {
        fetchRequests();
      } else {
        console.error("Failed to update payment status.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex bg-muted border rounded-xl p-1 shadow-sm">
          <Button 
            variant={filter === "pending" ? "default" : "ghost"} 
            size="sm" 
            onClick={() => setFilter("pending")}
            className="rounded-lg"
          >
            Pending
          </Button>
          <Button 
            variant={filter === "verified" ? "default" : "ghost"} 
            size="sm" 
            onClick={() => setFilter("verified")}
            className="rounded-lg"
          >
            Verified
          </Button>
          <Button 
            variant={filter === "rejected" ? "default" : "ghost"} 
            size="sm" 
            onClick={() => setFilter("rejected")}
            className="rounded-lg"
          >
            Rejected
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manual Payment Requests</CardTitle>
          <CardDescription>
            Verify GCash reference numbers submitted by users to grant premium access.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-20 flex justify-center">
              <Loading />
            </div>
          ) : requests.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No {filter} payment requests found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-4 px-4 font-medium text-muted-foreground">User</th>
                    <th className="py-4 px-4 font-medium text-muted-foreground">Plan</th>
                    <th className="py-4 px-4 font-medium text-muted-foreground">Amount</th>
                    <th className="py-4 px-4 font-medium text-muted-foreground">Ref #</th>
                    <th className="py-4 px-4 font-medium text-muted-foreground">Date</th>
                    <th className="py-4 px-4 font-medium text-muted-foreground text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <tr key={req.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                            {req.user_name?.charAt(0) || "U"}
                          </div>
                          <div>
                            <p className="font-bold">{req.user_name}</p>
                            <p className="text-[10px] text-muted-foreground">{req.user_email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className="capitalize">{req.plan_id}</Badge>
                      </td>
                      <td className="py-4 px-4 font-bold text-green-600 dark:text-green-500">
                        ₱{req.amount}
                      </td>
                      <td className="py-4 px-4">
                        <code className="bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-2 py-1 rounded text-xs font-mono">{req.reference_number}</code>
                      </td>
                      <td className="py-4 px-4 text-muted-foreground text-xs">
                        {new Date(req.created_at).toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-right">
                        {req.status === "pending" ? (
                          <div className="flex justify-end gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 border-red-100 dark:border-red-900/50"
                              onClick={() => handleVerify(req.id, "rejected")}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white"
                              onClick={() => handleVerify(req.id, "verified")}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <Badge variant={req.status === "verified" ? "default" : "destructive"} className="capitalize">
                            {req.status}
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
