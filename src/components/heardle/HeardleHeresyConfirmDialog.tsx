"use client";

import { IconHeresySkull } from "@/components/mission-icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { HERESY_COOLDOWN_MS } from "@/lib/heardle-heresy-cooldown";
import { cn } from "@/lib/utils";

type HeardleHeresyConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  pending?: boolean;
};

export function HeardleHeresyConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  pending = false,
}: HeardleHeresyConfirmDialogProps) {
  const lockMinutes = Math.max(1, Math.round(HERESY_COOLDOWN_MS / 60_000));
  const lockPhrase =
    lockMinutes === 1 ? "about one minute" : `about ${lockMinutes} minutes`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "gap-6 border-destructive/30 bg-card/95 shadow-[0_0_32px_-8px_oklch(0.55_0.22_25_/_0.35)] sm:max-w-md",
        )}
        showCloseButton={!pending}
      >
        <DialogHeader className="items-center gap-3 text-center sm:items-center">
          <div
            className="flex size-14 items-center justify-center rounded-full border border-destructive/40 bg-destructive/10 ring-2 ring-destructive/20"
            aria-hidden
          >
            <IconHeresySkull className="size-8 text-destructive" filled />
          </div>
          <DialogTitle className="font-black tracking-wide text-destructive">
            Heresy?
          </DialogTitle>
          <DialogDescription className="text-center text-sm leading-relaxed">
            Are you sure?
            </DialogDescription>
        </DialogHeader>
        <DialogFooter className="border-t-0 bg-transparent p-0 pt-0 sm:flex-row sm:justify-center sm:gap-3">
          <Button
            type="button"
            variant="outline"
            className="min-w-[7rem] font-black uppercase tracking-wider"
            disabled={pending}
            aria-label="Cancel and keep playing"
            onClick={() => onOpenChange(false)}
          >
            No
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="min-w-[7rem] gap-2 font-black uppercase tracking-wider"
            disabled={pending}
            aria-label="Confess heresy"
            onClick={() => void onConfirm()}
          >
            {pending ? (
              "Recording…"
            ) : (
              <>
                <IconHeresySkull className="size-4 shrink-0" filled />
                Yes!
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
