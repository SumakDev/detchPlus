"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ClientForm from "@/components/ClientForm";
import { Cliente, ClienteFormData } from "@/types/client";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEditing?: boolean;
  cliente?: Cliente | null;
  onSubmit: (data: ClienteFormData) => void | Promise<void>;
  className?: string;
};

export default function ClientUpsertDialog({ open, onOpenChange, isEditing, cliente, onSubmit, className }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`sm:max-w-lg ${className || ""}`}>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Cliente" : "Agregar Cliente"}</DialogTitle>
        </DialogHeader>

        <ClientForm
          cliente={cliente ?? undefined}
          isEditing={!!isEditing}
          onSubmit={async (data) => {
            await onSubmit(data);
            onOpenChange(false);
          }}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}