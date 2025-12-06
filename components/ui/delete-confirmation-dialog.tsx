"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Shield, Loader2 } from "lucide-react";

interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  title: string;
  description: string;
  itemName: string;
  itemType: "product-spec" | "company-policy" | "analysis";
  warningMessage?: string;
}

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  itemName,
  itemType,
  warningMessage,
}: DeleteConfirmationDialogProps) {
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The text user must type to confirm deletion
  const requiredText = itemName.substring(0, 20).trim();

  const handleConfirm = async () => {
    if (confirmText !== requiredText) {
      setError("Confirmation text does not match");
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      await onConfirm();
      setConfirmText("");
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      setConfirmText("");
      setError(null);
      onOpenChange(false);
    }
  };

  const getTypeLabel = () => {
    switch (itemType) {
      case "product-spec":
        return "Product Specification";
      case "company-policy":
        return "Company Policy Document";
      case "analysis":
        return "Compliance Analysis";
      default:
        return "Document";
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <AlertDialogTitle className="text-lg">{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          {/* Security Warning */}
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-destructive mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-destructive">
                  This action cannot be undone
                </p>
                <p className="text-muted-foreground mt-1">
                  {warningMessage ||
                    `This will permanently delete the ${getTypeLabel()} and all associated data. Any compliance analyses linked to this document will also be affected.`}
                </p>
              </div>
            </div>
          </div>

          {/* Item Info */}
          <div className="rounded-lg bg-muted p-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              {getTypeLabel()} to delete:
            </p>
            <p className="font-medium text-foreground mt-1 break-all">
              {itemName}
            </p>
          </div>

          {/* Confirmation Input */}
          <div className="space-y-2">
            <Label htmlFor="confirm-delete" className="text-sm">
              To confirm, type{" "}
              <span className="font-mono font-bold text-foreground bg-muted px-1.5 py-0.5 rounded">
                {requiredText}
              </span>{" "}
              below:
            </Label>
            <Input
              id="confirm-delete"
              type="text"
              value={confirmText}
              onChange={(e) => {
                setConfirmText(e.target.value);
                setError(null);
              }}
              placeholder={`Type "${requiredText}" to confirm`}
              className={error ? "border-destructive" : ""}
              disabled={isDeleting}
              autoComplete="off"
              autoFocus
            />
            {error && (
              <p className="text-xs text-destructive">{error}</p>
            )}
          </div>
        </div>

        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={confirmText !== requiredText || isDeleting}
            className="gap-2"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4" />
                Delete Permanently
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

