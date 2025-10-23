"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Producto, ProductoFormData } from "@/types/product";
import ProductForm from "./ProductForm";

export default function ProductUpsertDialog({
  open,
  onOpenChange,
  producto,
  isEditing,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  producto?: Producto | null;
  isEditing?: boolean;
  onSubmit: (data: ProductoFormData) => Promise<void> | void;
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
            // Convert FormData to ProductoFormData
            const productoData: ProductoFormData = {
              ID_CAT: Number(formData.get('ID_CAT')) || 0,
              ID_MAR: Number(formData.get('ID_MAR')) || 0,
              ORG_PRO: String(formData.get('ORG_PRO') || ''),
              EST_PRO: String(formData.get('EST_PRO') || ''),
              ACT_PRO: String(formData.get('ACT_PRO') || ''),
              // Include any other fields needed from formData
              ...Object.fromEntries(formData) as any
            };
            await onSubmit(productoData);
            onOpenChange(false);
          }}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}