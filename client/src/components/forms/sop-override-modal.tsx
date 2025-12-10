import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, X, CheckCircle2, Camera } from "lucide-react";
import { type SOPStep } from "@/lib/sop-templates";

interface SOPOverrideModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobCardId: string;
  incompleteRequiredSteps: SOPStep[];
  onOverride: (reason: string) => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

export default function SOPOverrideModal({
  open,
  onOpenChange,
  jobCardId,
  incompleteRequiredSteps,
  onOverride,
  onCancel,
  isProcessing = false
}: SOPOverrideModalProps) {
  const [overrideReason, setOverrideReason] = useState("");
  const [reasonError, setReasonError] = useState("");

  const handleOverride = () => {
    if (!overrideReason.trim()) {
      setReasonError("Override reason is required");
      return;
    }

    if (overrideReason.trim().length < 10) {
      setReasonError("Please provide a detailed reason (minimum 10 characters)");
      return;
    }

    setReasonError("");
    onOverride(overrideReason.trim());
  };

  const handleCancel = () => {
    setOverrideReason("");
    setReasonError("");
    onCancel();
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      handleCancel();
    }
    onOpenChange(open);
  };

  const handleReasonChange = (value: string) => {
    setOverrideReason(value);
    if (reasonError) {
      setReasonError("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl w-full max-h-[80vh] flex flex-col">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              SOP Override Required
            </DialogTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleCancel}
              data-testid="button-close-override-modal"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 space-y-4">
          {/* Alert */}
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-red-800">
              <strong>Job Card {jobCardId}</strong> has incomplete required SOP steps that must be 
              completed before advancing. If you need to override these requirements, please provide 
              a detailed reason below.
            </AlertDescription>
          </Alert>

          {/* Incomplete Steps List */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-gray-800">
              Incomplete Required Steps ({incompleteRequiredSteps.length})
            </h3>
            
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {incompleteRequiredSteps.map((step, index) => (
                <div 
                  key={step.stepId}
                  className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-5 h-5 border-2 border-red-300 rounded bg-white"></div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-red-800">
                        {index + 1}. {step.name}
                        <span className="text-red-500 ml-1">*</span>
                      </span>
                      <Badge variant="secondary" className="text-xs px-2 py-0 bg-red-100 text-red-700 border-red-200">
                        Required
                      </Badge>
                      {step.photoRequired && (
                        <div className="flex items-center gap-1 text-xs text-red-600">
                          <Camera className="h-3 w-3" />
                          Photo Required
                        </div>
                      )}
                    </div>
                    
                    {step.description && (
                      <p className="text-xs text-red-700 mt-1">{step.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Override Reason */}
          <div className="space-y-2">
            <Label htmlFor="override-reason" className="text-sm font-medium text-gray-700">
              Override Reason <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="override-reason"
              value={overrideReason}
              onChange={(e) => handleReasonChange(e.target.value)}
              placeholder="Please provide a detailed explanation for why these required steps are being skipped. This will be logged for quality assurance purposes."
              className={`min-h-[100px] resize-none ${reasonError ? 'border-red-300 focus:border-red-500' : ''}`}
              data-testid="textarea-override-reason"
            />
            {reasonError && (
              <p className="text-sm text-red-600">{reasonError}</p>
            )}
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>Minimum 10 characters required</span>
              <span>{overrideReason.length}/500</span>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <strong>Warning:</strong> Overriding required SOP steps may impact service quality 
                and customer satisfaction. This action will be logged and may be reviewed by management.
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-4">
          <div className="flex justify-end gap-3 w-full">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isProcessing}
              data-testid="button-cancel-override"
            >
              Cancel
            </Button>
            <Button
              onClick={handleOverride}
              disabled={isProcessing || !overrideReason.trim()}
              className="bg-red-600 hover:bg-red-700 text-white"
              data-testid="button-confirm-override"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Override & Continue
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}