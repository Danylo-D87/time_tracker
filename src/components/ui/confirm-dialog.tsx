"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useState } from "react";

interface ConfirmDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
    title: string;
    description: string;
    confirmLabel?: string;
    variant?: "danger" | "default";
}

export function ConfirmDialog({
    open,
    onClose,
    onConfirm,
    title,
    description,
    confirmLabel = "Delete",
    variant = "danger",
}: ConfirmDialogProps) {
    const [isLoading, setIsLoading] = useState(false);

    async function handleConfirm() {
        setIsLoading(true);
        try {
            await onConfirm();
            onClose();
        } catch {
            // Error handled by caller (toast)
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="rounded-3xl border-border bg-surface sm:max-w-[380px]">
                <DialogHeader className="flex flex-col items-center gap-3 text-center">
                    {variant === "danger" && (
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10">
                            <AlertTriangle
                                className="h-6 w-6 text-destructive"
                                strokeWidth={1.5}
                            />
                        </div>
                    )}
                    <DialogTitle className="text-lg font-semibold text-foreground">
                        {title}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-text-secondary">
                        {description}
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="gap-2 pt-4 sm:justify-center">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        disabled={isLoading}
                        className="rounded-xl text-text-secondary hover:text-foreground"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className={
                            variant === "danger"
                                ? "rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                : "rounded-xl bg-white text-black hover:bg-white/90"
                        }
                    >
                        {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        {confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
