"use client";

import { useRef, useEffect } from "react";
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
  const isPendingRef = useRef(false);

  useEffect(() => {
    if (!open) {
      isPendingRef.current = false;
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (isPendingRef.current) return;
        onOpenChange(o);
      }}
    >
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar producto" : "Agregar producto"}</DialogTitle>
        </DialogHeader>
        <ProductForm
          producto={producto || undefined}
          isEditing={!!isEditing}
          onSubmit={async (formData: FormData) => {
            if (isPendingRef.current) return;
            try {
              isPendingRef.current = true;
              await onSubmit(formData);
              onOpenChange(false);
            } finally {
              isPendingRef.current = false;
            }
          }}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}