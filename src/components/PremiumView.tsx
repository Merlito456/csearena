import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Check, X, Crown, Zap, Star, Shield, Sparkles, Phone, Copy, FileText, Award, Download } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Loading } from "./Loading";

interface PremiumViewProps {
  onBack: () => void;
  userId: string | null;
}

export function PremiumView({ onBack, userId }: PremiumViewProps) {
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  
  useEffect(() => {
    const checkPremium = async () => {
      if (!userId || userId === "GUEST") return;
      try {
        const res = await fetch(`/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: userId })
        });
        if (res.ok) {
          const user = await res.json();
          setIsPremiumUser(user.is_premium);
        }
      } catch (e) {
        console.error(e);
      }
    };
    checkPremium();
  }, [userId]);

  const features = [
    { name: "Practice Quizzes", free: "Limited (5/day)", premium: "Unlimited" },
    { name: "AI Explanations", free: "Basic", premium: "Detailed & Adaptive" },
    { name: "Mock Exams", free: "1 Full Exam", premium: "Unlimited Adaptive Exams" },
    { name: "Smart Review", free: <X className="w-4 h-4 text-muted-foreground" />, premium: <Check className="w-4 h-4 text-green-500" /> },
    { name: "Weakness Analysis", free: <X className="w-4 h-4 text-muted-foreground" />, premium: <Check className="w-4 h-4 text-green-500" /> },
    { name: "Flashcard Generator", free: <X className="w-4 h-4 text-muted-foreground" />, premium: <Check className="w-4 h-4 text-green-500" /> },
    { name: "No Ads", free: <X className="w-4 h-4 text-muted-foreground" />, premium: <Check className="w-4 h-4 text-green-500" /> },
  ];

  const plans = [
    {
      id: "monthly",
      name: "Monthly",
      price: "₱150",
      amount: 150,
      period: "/ month",
      description: "Perfect for short-term review",
      features: ["Full access for 30 days", "Cancel anytime"],
      popular: false,
      color: "bg-card",
      btnVariant: "outline" as const
    },
    {
      id: "quarterly",
      name: "Quarterly",
      price: "₱399",
      amount: 399,
      period: "/ 3 months",
      description: "Best for standard review period",
      features: ["Save 15%", "Full access for 90 days"],
      popular: true,
      color: "bg-primary/5 border-primary",
      btnVariant: "default" as const
    },
    {
      id: "lifetime",
      name: "Lifetime",
      price: "₱999",
      amount: 999,
      period: "one-time",
      description: "Pay once, own it forever",
      features: ["Best Value", "Future updates included", "Priority Support"],
      popular: false,
      color: "bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200",
      btnVariant: "default" as const,
      isLifetime: true
    }
  ];

  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [showManualPayment, setShowManualPayment] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null);
  const [referenceNumber, setReferenceNumber] = useState("");
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);
  const [manualMessage, setManualMessage] = useState("");
  const [receiptData, setReceiptData] = useState<any>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  useEffect(() => {
    if (isPremiumUser && userId) {
      fetchReceipt();
    }
  }, [isPremiumUser, userId]);

  const fetchReceipt = async () => {
    try {
      const res = await fetch(`/api/payments/receipt/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setReceiptData(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleChoosePlan = async (plan: typeof plans[0]) => {
    setSelectedPlan(plan);
    // Show payment method selection or just default to PayMongo for now?
    // User requested "add a payment option aside from paymongo"
    // So I'll show a choice.
    setShowManualPayment(true);
  };

  const handlePayMongo = async () => {
    if (!selectedPlan) return;
    setLoadingPlan(selectedPlan.id);
    setShowManualPayment(false);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "";
      const response = await fetch(`${apiUrl}/api/paymongo/create-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: selectedPlan.amount,
          description: `${selectedPlan.name} premium access`,
          userId: userId || "GUEST"
        })
      });

      const data = await response.json();
      if (data.checkout_url) {
        window.open(data.checkout_url, "_blank");
      } else {
        setManualMessage("Failed to create payment link. Please try again.");
      }
    } catch (error) {
      console.error("Payment Error:", error);
      setManualMessage("An error occurred. Please try again.");
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleSubmitManual = async () => {
    if (!selectedPlan || !referenceNumber) return;
    setIsSubmittingManual(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "";
      const response = await fetch(`${apiUrl}/api/payments/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          planId: selectedPlan.id,
          amount: selectedPlan.amount,
          referenceNumber
        })
      });

      if (response.ok) {
        setManualMessage("Payment request submitted! Please wait for admin verification.");
        setTimeout(() => {
          setShowManualPayment(false);
          setReferenceNumber("");
          setManualMessage("");
        }, 3000);
      } else {
        setManualMessage("Failed to submit payment request.");
      }
    } catch (error) {
      console.error(error);
      setManualMessage("An error occurred.");
    } finally {
      setIsSubmittingManual(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setManualMessage("Copied to clipboard!");
    setTimeout(() => setManualMessage(""), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm font-medium mb-2"
        >
          <Crown className="w-4 h-4 fill-current" />
          <span>{isPremiumUser ? "Premium Active" : "Go Premium"}</span>
        </motion.div>
        <h1 className="text-4xl font-bold tracking-tight">
          {isPremiumUser ? "Welcome to the Elite Tier" : "Unlock Your Full Potential"}
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {isPremiumUser 
            ? "You have full access to all AI-powered tools, adaptive exams, and detailed analytics. Happy studying!"
            : "Get unlimited access to AI-powered tools, adaptive exams, and detailed analytics to guarantee your passing score."}
        </p>
        
        {isPremiumUser && (
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            <Button onClick={onBack} variant="outline">
              Back to Dashboard
            </Button>
            <Button onClick={() => setShowReceipt(true)} className="bg-primary text-white">
              <FileText className="w-4 h-4 mr-2" /> View Receipt & Certificate
            </Button>
          </div>
        )}
      </div>

      {/* Manual Payment Dialog */}
      <Dialog open={showManualPayment} onOpenChange={setShowManualPayment}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Choose Payment Method</DialogTitle>
            <DialogDescription>
              Select how you want to pay for the {selectedPlan?.name} plan.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-primary/10 p-3 rounded-lg border border-primary/20 mb-2">
                <p className="text-sm font-semibold text-primary flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Recommended: Manual Payment
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  For faster activation, we suggest using our manual GCash transfer method.
                </p>
              </div>

              <Button 
                variant="outline" 
                className="h-auto py-4 flex flex-col items-start gap-1 border-2 opacity-70 cursor-not-allowed"
                disabled
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold">Pay via PayMongo</span>
                  <Badge variant="secondary" className="text-[10px]">Under Construction</Badge>
                </div>
                <span className="text-xs text-muted-foreground">GCash, Maya, Cards, Over-the-counter (Coming Soon)</span>
              </Button>
              
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or pay manually</span>
                </div>
              </div>

              <div className="bg-muted/30 p-4 rounded-lg space-y-4 border border-dashed border-muted-foreground/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold text-xs">G</div>
                    <div>
                      <p className="text-sm font-bold">GCash Manual Transfer</p>
                      <p className="text-xs text-muted-foreground">09669343065 / John Carlo Rabanes</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => copyToClipboard("09669343065")}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ref" className="text-xs">Reference Number</Label>
                  <Input 
                    id="ref" 
                    placeholder="Enter GCash Ref #" 
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                  />
                </div>

                <div className="bg-yellow-50 p-3 rounded text-[10px] text-yellow-800 border border-yellow-100">
                  <p className="font-bold mb-1">Instructions:</p>
                  <ol className="list-decimal ml-4 space-y-1">
                    <li>Send ₱{selectedPlan?.amount} to the GCash number above.</li>
                    <li>Input the Reference Number and click Submit.</li>
                    <li>Text <b>09669343065</b> for instant activation.</li>
                  </ol>
                </div>

                {manualMessage && (
                  <div className="text-sm text-center font-medium text-indigo-600 bg-indigo-50 p-2 rounded">
                    {manualMessage}
                  </div>
                )}

                <Button 
                  className="w-full" 
                  disabled={!referenceNumber || isSubmittingManual}
                  onClick={handleSubmitManual}
                >
                  {isSubmittingManual ? "Submitting..." : "Submit Reference Number"}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Receipt & Certificate Dialog */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Official Documents</DialogTitle>
          </DialogHeader>
          
          <AnimatePresence mode="wait">
            {receiptData ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8 py-4"
              >
                {/* Official Receipt */}
                <div className="border rounded-xl p-6 bg-white shadow-sm space-y-6 font-mono text-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 bg-green-100 text-green-700 font-bold text-[10px] rotate-12 translate-x-4 -translate-y-1 border border-green-200">
                    OFFICIAL RECEIPT
                  </div>
                  <div className="text-center border-b pb-4">
                    <h3 className="font-bold text-lg">CSE ARENA PREMIUM</h3>
                    <p className="text-xs text-muted-foreground">Digital Learning Solutions</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-muted-foreground text-[10px] uppercase">Receipt No.</p>
                      <p className="font-bold">{receiptData.receiptNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-muted-foreground text-[10px] uppercase">Date</p>
                      <p className="font-bold">{new Date(receiptData.date).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="space-y-2 border-t pt-4">
                    <div className="flex justify-between">
                      <span>Customer:</span>
                      <span className="font-bold">{receiptData.userName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Plan:</span>
                      <span className="font-bold">Premium Access</span>
                    </div>
                    <div className="flex justify-between border-t border-dashed pt-2 mt-4 text-lg">
                      <span className="font-bold">TOTAL:</span>
                      <span className="font-bold">PAID</span>
                    </div>
                  </div>

                  <div className="text-center text-[10px] text-muted-foreground pt-4">
                    Thank you for choosing CSE Arena!
                  </div>
                </div>

                {/* Certificate */}
                <div className="border-8 border-double border-yellow-600 p-8 bg-amber-50/30 text-center space-y-6 relative">
                  <div className="absolute top-4 left-4 opacity-10">
                    <Award className="w-24 h-24 text-yellow-800" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-serif font-bold text-yellow-900">Certificate of Enrollment</h2>
                    <p className="text-sm italic text-yellow-800">This is to certify that</p>
                  </div>
                  
                  <div className="py-4">
                    <h3 className="text-3xl font-serif font-bold border-b-2 border-yellow-600 inline-block px-8">
                      {receiptData.userName}
                    </h3>
                  </div>

                  <p className="text-sm text-yellow-900 max-w-md mx-auto">
                    is officially enrolled in the <b>CSE Arena Premium Review Program</b> and is granted full access to all elite study materials, AI mentors, and mock examinations.
                  </p>

                  <div className="pt-8 flex justify-between items-end px-8">
                    <div className="text-left">
                      <p className="text-[10px] text-yellow-800">Valid Until:</p>
                      <p className="font-bold text-yellow-900">{new Date(receiptData.expiry).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <div className="w-32 border-b border-yellow-900 mb-1"></div>
                      <p className="text-[10px] text-yellow-800 uppercase">Program Director</p>
                    </div>
                  </div>
                </div>

                <Button className="w-full" variant="outline" onClick={() => window.print()}>
                  <Download className="w-4 h-4 mr-2" /> Download / Print Documents
                </Button>
              </motion.div>
            ) : (
              <div className="py-20 text-center">
                <Loading />
              </div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>

      {!isPremiumUser && (
        <>
          {/* Usage Alert */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between max-w-2xl mx-auto"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 rounded-full">
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-blue-900">You've used 85% of your free AI explanations.</p>
                <p className="text-sm text-blue-700">Upgrade now to continue learning without limits.</p>
              </div>
            </div>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">Upgrade</Button>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 + (index * 0.1) }}
                className="relative"
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-bold shadow-md z-10">
                    Most Popular
                  </div>
                )}
                {plan.isLifetime && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md z-10 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" /> Best Value
                  </div>
                )}
                <Card className={`h-full flex flex-col ${plan.color} ${plan.popular ? 'shadow-lg scale-105 border-primary' : ''} transition-all hover:shadow-xl`}>
                  <CardHeader>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                    <ul className="space-y-3">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-500 shrink-0" />
                          {feature}
                        </li>
                      ))}
                      {/* Common features for all premium plans */}
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500 shrink-0" />
                        Unlimited AI Smart Review
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500 shrink-0" />
                        Adaptive Mock Exams
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      variant={plan.btnVariant} 
                      size="lg"
                      disabled={loadingPlan !== null}
                      onClick={() => handleChoosePlan(plan)}
                    >
                      {loadingPlan === plan.id ? "Processing..." : `Choose ${plan.name}`}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* Feature Comparison Table */}
      {!isPremiumUser && (
        <div className="flex justify-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground"
            onClick={() => window.location.reload()}
          >
            Already paid? Refresh to update status
          </Button>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-center">Compare Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4 px-4 font-medium text-muted-foreground">Feature</th>
                  <th className="text-center py-4 px-4 font-medium text-muted-foreground w-1/4">Free</th>
                  <th className="text-center py-4 px-4 font-bold text-primary w-1/4 bg-primary/5 rounded-t-lg">Premium</th>
                </tr>
              </thead>
              <tbody>
                {features.map((feature, index) => (
                  <tr key={index} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-4 px-4 font-medium">{feature.name}</td>
                    <td className="py-4 px-4 text-center text-muted-foreground">{feature.free}</td>
                    <td className="py-4 px-4 text-center font-medium bg-primary/5">{feature.premium}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Testimonial */}
      <div className="bg-muted/50 rounded-2xl p-8 text-center space-y-4">
        <div className="flex justify-center gap-1">
          {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />)}
        </div>
        <blockquote className="text-lg font-medium italic text-muted-foreground">
          "I failed the exam twice before using this app. The AI Smart Review really helped me focus on my weak points. I finally passed with an 88% rating!"
        </blockquote>
        <div>
          <div className="font-bold">Sarah M.</div>
          <div className="text-xs text-muted-foreground">Passed August 2024 Exam</div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="flex flex-wrap justify-center gap-8 text-muted-foreground grayscale opacity-70">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5" /> Secure Payment
        </div>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" /> AI Powered
        </div>
        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5" /> Satisfaction Guarantee
        </div>
      </div>
    </div>
  );
}
