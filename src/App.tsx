import React, { useState, useEffect } from "react";
import { 
  Heart, 
  Shield, 
  FileText, 
  History, 
  Settings, 
  Plus, 
  Search,
  ChevronRight,
  Menu,
  X,
  Sparkles,
  ArrowLeft,
  AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UploadZone } from "./components/UploadZone";
import { AnalysisView } from "./components/AnalysisView";
import { 
  analyzeMedicalBill, 
  analyzeInsurancePolicy, 
  detectConflicts, 
  generateAppealLetter,
  BillAnalysis,
  InsuranceAnalysis,
  ConflictResult
} from "./services/geminiService";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentBill, setCurrentBill] = useState<BillAnalysis | null>(null);
  const [currentPolicy, setCurrentPolicy] = useState<InsuranceAnalysis | null>(null);
  const [conflicts, setConflicts] = useState<ConflictResult | null>(null);
  const [appealLetter, setAppealLetter] = useState<string | null>(null);
  const [isAppealModalOpen, setIsAppealModalOpen] = useState(false);

  const handleFileUpload = async (file: File, type: "bill" | "policy") => {
    setIsAnalyzing(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = (e.target?.result as string).split(",")[1];
        if (type === "bill") {
          const result = await analyzeMedicalBill(base64, file.type);
          setCurrentBill(result);
          if (currentPolicy) {
            const conflictResult = await detectConflicts(result, currentPolicy);
            setConflicts(conflictResult);
          }
        } else {
          const result = await analyzeInsurancePolicy(base64);
          setCurrentPolicy(result);
          if (currentBill) {
            const conflictResult = await detectConflicts(currentBill, result);
            setConflicts(conflictResult);
          }
        }
        setIsAnalyzing(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error analyzing document:", error);
      setIsAnalyzing(false);
    }
  };

  const handleGenerateAppeal = async (conflict: any) => {
    if (!currentBill || !currentPolicy) return;
    setIsAnalyzing(true);
    try {
      const letter = await generateAppealLetter(conflict, currentBill, currentPolicy);
      setAppealLetter(letter);
      setIsAppealModalOpen(true);
    } catch (error) {
      console.error("Error generating appeal:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans selection:bg-primary/20">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">Health-Admin</h1>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Surrogate Advocacy</p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => setActiveTab("dashboard")} className={`text-sm font-medium transition-colors ${activeTab === "dashboard" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>Dashboard</button>
              <button onClick={() => setActiveTab("library")} className={`text-sm font-medium transition-colors ${activeTab === "library" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>Documents</button>
              <button onClick={() => setActiveTab("advocacy")} className={`text-sm font-medium transition-colors ${activeTab === "advocacy" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>Advocacy</button>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Search className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Settings className="w-5 h-5" />
              </Button>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-blue-400 border-2 border-white shadow-sm" />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {activeTab === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Hero Section */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-none px-3 py-1">
                    <Sparkles className="w-3 h-3 mr-1" /> AI Advocate Active
                  </Badge>
                  <h2 className="text-4xl font-bold tracking-tight">Family Health Command</h2>
                  <p className="text-muted-foreground">Manage bills, audit insurance, and protect your family's finances.</p>
                </div>
                <div className="flex gap-3">
                  <Button className="rounded-full px-6 shadow-lg shadow-primary/20">
                    <Plus className="w-4 h-4 mr-2" /> New Case
                  </Button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <FileText className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">+2 this month</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Active Audits</p>
                    <p className="text-2xl font-bold">12</p>
                  </CardContent>
                </Card>
                <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">3 urgent</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Detected Conflicts</p>
                    <p className="text-2xl font-bold">08</p>
                  </CardContent>
                </Card>
                <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                        <Heart className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">Lifetime</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Total Savings</p>
                    <p className="text-2xl font-bold">$4,280.50</p>
                  </CardContent>
                </Card>
              </div>

              {/* Main Workspace */}
              <div className="space-y-6">
                {!currentBill ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <UploadZone 
                      type="bill" 
                      onUpload={handleFileUpload} 
                      isAnalyzing={isAnalyzing} 
                    />
                    <UploadZone 
                      type="policy" 
                      onUpload={handleFileUpload} 
                      isAnalyzing={isAnalyzing} 
                    />
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <Button variant="ghost" size="sm" onClick={() => setCurrentBill(null)} className="text-muted-foreground">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Upload
                      </Button>
                      <div className="flex gap-2">
                        {!currentPolicy && (
                          <Button variant="outline" size="sm" className="relative overflow-hidden">
                            <Plus className="w-4 h-4 mr-2" /> Add Policy for Audit
                            <input 
                              type="file" 
                              className="absolute inset-0 opacity-0 cursor-pointer" 
                              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "policy")}
                              accept="application/pdf"
                            />
                          </Button>
                        )}
                      </div>
                    </div>
                    <AnalysisView 
                      bill={currentBill} 
                      policy={currentPolicy || undefined} 
                      conflicts={conflicts || undefined}
                      onGenerateAppeal={handleGenerateAppeal}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "library" && (
            <motion.div
              key="library"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="py-12 text-center space-y-4"
            >
              <History className="w-16 h-16 mx-auto text-muted-foreground opacity-20" />
              <h3 className="text-xl font-semibold">Document History</h3>
              <p className="text-muted-foreground max-w-md mx-auto">Your analyzed bills and policies will appear here for long-term tracking and archival.</p>
              <Button variant="outline" onClick={() => setActiveTab("dashboard")}>Go to Dashboard</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Appeal Modal */}
      <Dialog open={isAppealModalOpen} onOpenChange={setIsAppealModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              Generated Appeal Letter
            </DialogTitle>
            <DialogDescription>
              Review and customize this letter before sending it to your provider.
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <ScrollArea className="flex-1 p-6 bg-muted/30 rounded-md font-serif text-lg leading-relaxed">
            <div className="whitespace-pre-wrap">
              {appealLetter}
            </div>
          </ScrollArea>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setIsAppealModalOpen(false)}>Close</Button>
            <Button onClick={() => {
              navigator.clipboard.writeText(appealLetter || "");
              alert("Copied to clipboard!");
            }}>
              Copy to Clipboard
            </Button>
            <Button className="bg-primary shadow-lg shadow-primary/20">
              Download PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="mt-20 border-t border-muted bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" />
                <span className="font-bold text-lg">Health-Admin Surrogate</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-xs">
                Empowering families to navigate the complex world of medical bureaucracy with AI-driven advocacy.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-sm uppercase tracking-wider">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">How it Works</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-sm uppercase tracking-wider">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact Advocacy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Feedback</a></li>
              </ul>
            </div>
          </div>
          <Separator className="my-8" />
          <p className="text-center text-xs text-muted-foreground">
            © 2026 Health-Admin Surrogate. Not a law firm or medical provider. AI results should be reviewed by a professional.
          </p>
        </div>
      </footer>
    </div>
  );
}
