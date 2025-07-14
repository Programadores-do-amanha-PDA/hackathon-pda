"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface JustificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>;
  studentName?: string;
  isLoading?: boolean;
  mode?: "create" | "edit";
  initialReason?: string;
}

export const JustificationModal: React.FC<JustificationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  studentName,
  isLoading = false,
  mode = "create",
  initialReason = "",
}) => {
  const [reason, setReason] = useState(initialReason);

  React.useEffect(() => {
    if (isOpen) {
      setReason(initialReason);
    }
  }, [isOpen, initialReason]);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error("Por favor, insira um motivo para a justificativa.");
      return;
    }

    try {
      await onSubmit(reason.trim());
      setReason("");
      onClose();
      toast.success(
        mode === "create"
          ? "Justificativa adicionada com sucesso!"
          : "Justificativa atualizada com sucesso!"
      );
    } catch {
      toast.error("Erro ao salvar justificativa. Tente novamente.");
    }
  };

  const handleClose = () => {
    setReason("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Justificar Pendência" : "Editar Pendência"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {studentName && (
            <div className="text-sm text-muted-foreground">
              Estudante: <span className="font-medium">{studentName}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="reason">Motivo da justificativa</Label>
            <Textarea
              id="reason"
              placeholder="O estudante estava fazendo o enem..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[100px]"
              disabled={isLoading}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !reason.trim()}
            className="bg-yellow-500 hover:bg-yellow-600 text-yellow-900"
          >
            {isLoading ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
