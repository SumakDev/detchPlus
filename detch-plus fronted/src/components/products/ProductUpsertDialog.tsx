"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ProductForm from "./ProductForm";

export default function ProductUpsertDialog({
  open,
  onOpenChange,
  producto,
  isEditing,
  onSubmit, // (form: FormData) => Promise<void> | void
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  producto?: any | null;
  isEditing?: boolean;
  onSubmit: (form: FormData) => Promise<void> | void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar producto" : "Agregar producto"}</DialogTitle>
        </DialogHeader>
        <ProductForm
          producto={producto || undefined}
          isEditing={!!isEditing}
          onSubmit={async (formData: FormData) => {
            // IMPORTANTE: no transformar, enviar el FormData tal cual
            await onSubmit(formData);
            onOpenChange(false);
          }}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}