"use client";

import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resolveProductImage } from "@/lib/utils";

export default function CartDrawer() {
  const {
    items,
    isOpen,
    setIsOpen,
    updateQuantity,
    removeFromCart,
    subtotal,
    iva,
    total,
    totalItems,
    removedNotice,
    clearRemovedNotice,
    syncCartWithBackend,
  } = useCart();
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={() => setIsOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex sm:pl-10">
        <div className="w-full sm:w-screen max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-900">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Tu Bolsa de Compras</h2>
                <p className="text-xs text-gray-500">{totalItems} {totalItems === 1 ? "artículo" : "artículos"}</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Alerta de productos retirados por falta de stock o desactivación */}
          {removedNotice && (
            <div className="mx-4 mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start justify-between gap-2.5 text-amber-900 text-xs">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{removedNotice}</span>
              </div>
              <button
                onClick={clearRemovedNotice}
                className="text-amber-600 hover:text-amber-900 p-0.5 rounded"
                title="Cerrar aviso"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 sm:space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">Tu bolsa está vacía</h3>
                <p className="text-sm text-gray-500 max-w-xs mb-6">
                  Descubre los últimos dispositivos Apple y tecnología premium para agregar a tu pedido.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsOpen(false);
                    router.push("/catalogo");
                  }}
                  className="rounded-xl px-6"
                >
                  Explorar catálogo
                </Button>
              </div>
            ) : (
              items.map((item) => {
                const atMaxStock = item.maxStock !== undefined && item.quantity >= item.maxStock;
                return (
                  <div
                    key={item.id}
                    className="flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition"
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-lg border border-gray-200/60 p-2 flex items-center justify-center relative shrink-0 overflow-hidden">
                      {item.image ? (
                        <img
                          src={resolveProductImage(item.image)}
                          alt={item.name}
                          className="object-contain max-h-full max-w-full"
                          onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement;
                            if (!target.src.endsWith("/images/iphone15.jpg")) {
                              target.src = "/images/iphone15.jpg";
                            }
                          }}
                        />
                      ) : (
                        <ShoppingBag className="w-6 h-6 text-gray-300" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-semibold text-gray-900 truncate pr-2">
                            {item.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-gray-400 hover:text-red-600 transition p-1 shrink-0"
                            title="Eliminar producto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          {item.category && (
                            <p className="text-xs text-gray-400 capitalize">{item.category}</p>
                          )}
                          {item.maxStock !== undefined && (
                            <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                              Máx. {item.maxStock} disp.
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-2 py-1 text-gray-500 hover:bg-gray-100 transition"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2.5 text-xs font-semibold text-gray-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={atMaxStock}
                            title={atMaxStock ? `Stock máximo disponible alcanzado (${item.maxStock})` : "Aumentar cantidad"}
                            className="px-2 py-1 text-gray-500 hover:bg-gray-100 transition disabled:opacity-35 disabled:cursor-not-allowed"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <p className="text-sm font-bold text-gray-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-gray-100 bg-gray-50/60 space-y-4">
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>IVA (15%)</span>
                  <span className="font-medium text-gray-900">${iva.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Envío</span>
                  <span className="text-emerald-600 font-semibold">Gratis</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between text-base font-bold text-gray-900">
                  <span>Total estimado</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <Button
                onClick={async () => {
                  const isAllValid = await syncCartWithBackend();
                  if (!isAllValid) return;
                  setIsOpen(false);
                  router.push("/checkout");
                }}
                className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-semibold hover:bg-gray-800 transition shadow-lg flex items-center justify-center gap-2"
              >
                Continuar al Pago <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
