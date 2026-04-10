import React, { useCallback, useState } from "react";
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface UploadZoneProps {
  onUpload: (file: File, type: "bill" | "policy") => void;
  type: "bill" | "policy";
  isAnalyzing: boolean;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onUpload, type, isAnalyzing }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onUpload(file, type);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file, type);
  };

  return (
    <Card
      className={cn(
        "relative flex flex-col items-center justify-center p-8 border-2 border-dashed transition-all duration-200",
        isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/20",
        isAnalyzing && "opacity-50 pointer-events-none"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleFileChange}
        accept={type === "bill" ? "image/*,application/pdf" : "application/pdf"}
      />
      
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="p-4 rounded-full bg-primary/10 text-primary">
          {isAnalyzing ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : type === "bill" ? (
            <FileText className="w-8 h-8" />
          ) : (
            <Upload className="w-8 h-8" />
          )}
        </div>
        
        <div>
          <h3 className="text-lg font-semibold">
            {isAnalyzing ? "Analyzing Document..." : `Upload ${type === "bill" ? "Medical Bill" : "Insurance Policy"}`}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Drag and drop or click to upload
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <CheckCircle className="w-3 h-3 text-green-500" />
          <span>Secure & Private</span>
          <span className="mx-1">•</span>
          <AlertCircle className="w-3 h-3 text-blue-500" />
          <span>AI-Powered Audit</span>
        </div>
      </div>
    </Card>
  );
};
