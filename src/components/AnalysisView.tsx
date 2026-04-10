import React from "react";
import { BillAnalysis, ConflictResult, InsuranceAnalysis } from "@/src/services/geminiService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, CheckCircle2, DollarSign, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AnalysisViewProps {
  bill: BillAnalysis;
  policy?: InsuranceAnalysis;
  conflicts?: ConflictResult;
  onGenerateAppeal: (conflict: any) => void;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({ bill, policy, conflicts, onGenerateAppeal }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Bill Summary */}
      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold">Bill Analysis: {bill.providerName}</CardTitle>
          <Badge variant="outline" className="text-xs">
            {bill.dateOfService}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
            <div className="p-3 bg-primary/10 rounded-full">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Amount Charged</p>
              <p className="text-2xl font-bold">${bill.totalAmount.toFixed(2)}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Line Items</h4>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-3">
                {bill.items.map((item, idx) => (
                  <div key={idx} className="flex items-start justify-between p-3 border rounded-md hover:bg-muted/30 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">{item.code || "N/A"}</span>
                        <p className="text-sm font-medium">{item.description}</p>
                      </div>
                      {item.potentialError && (
                        <p className="text-xs text-amber-600 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> {item.potentialError}
                        </p>
                      )}
                    </div>
                    <p className="text-sm font-bold">${item.amount.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      {/* Advocacy Panel */}
      <div className="space-y-6">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              Advocacy Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {conflicts ? (
              <>
                <div className="p-4 bg-white rounded-lg border shadow-sm">
                  <p className="text-sm text-muted-foreground">Potential Savings Identified</p>
                  <p className="text-3xl font-bold text-green-600">${conflicts.savingsPotential.toFixed(2)}</p>
                </div>
                
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Detected Conflicts</p>
                  {conflicts.conflicts.map((conflict, idx) => (
                    <div key={idx} className="p-3 bg-white border rounded-md space-y-2">
                      <p className="text-sm font-medium">{conflict.itemDescription}</p>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Billed: ${conflict.billAmount}</span>
                        <span className="text-green-600 font-semibold">Expected: ${conflict.expectedAmount}</span>
                      </div>
                      <p className="text-xs text-muted-foreground italic">"{conflict.reason}"</p>
                      <Button 
                        size="sm" 
                        className="w-full mt-2" 
                        onClick={() => onGenerateAppeal(conflict)}
                      >
                        Generate Appeal <ArrowRight className="w-3 h-3 ml-2" />
                      </Button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8 space-y-2">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground opacity-20" />
                <p className="text-sm text-muted-foreground">
                  {policy 
                    ? "No conflicts detected yet. Analyzing items against your policy..." 
                    : "Upload your Insurance Policy to detect billing conflicts and save money."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {policy && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Active Policy: {policy.planName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {policy.coverageDetails.slice(0, 3).map((detail, idx) => (
                  <div key={idx} className="flex justify-between text-xs py-1 border-b last:border-0">
                    <span className="font-medium">{detail.category}</span>
                    <span className="text-muted-foreground">{detail.coverage}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
