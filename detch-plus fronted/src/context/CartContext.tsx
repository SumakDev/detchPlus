"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  category?: string;
  maxStock?: number;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (product: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  totalItems: number;
  subtotal: number;
  iva: number;
  total: number;
  removedNotice: string | null;
  clearRemovedNotice: () => void;
  syncCartWithBackend: () => Promise<boolean>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "detchplus_cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [removedNotice, setRemovedNotice] = useState<string | null>(null);
  const itemsRef = useRef<CartItem[]>([]);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // Cargar carrito desde localStorage en mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setItems(parsed);
          itemsRef.current = parsed;
        }
      }
    } catch (e) {
      console.error("Error loading cart from localStorage", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Guardar cambios en localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error("Error saving cart to localStorage", e);
    }
  }, [items, isLoaded]);

  /**
   * Reconcilia los productos del carrito en localStorage contra el catálogo activo y su stock real en BD.
   * Si un producto fue desactivado (borrado lógico) o su stock cayó a 0, lo retira automáticamente.
   * Si la cantidad en carrito supera el stock disponible, la ajusta al máximo disponible.
   */
  const syncCartWithBackend = useCallback(async (): Promise<boolean> => {
    const currentItems = itemsRef.current;
    if (!currentItems || currentItems.length === 0) return true;

    try {
      const res = await fetch(`${API}/productos`, { cache: "no-store" });
      if (!res.ok) return true;
      const activeProducts: any[] = await res.json();
      if (!Array.isArray(activeProducts)) return true;

      const activeMap = new Map<number, any>();
      for (const p of activeProducts) {
        if (p && p.ACT_PRO !== false && p.ACT_PRO !== 0) {
          activeMap.set(Number(p.ID_PRO), p);
        }
      }

      const notices: string[] = [];
      const nextItems: CartItem[] = [];
      let changed = false;

      for (const item of currentItems) {
        const prod = activeMap.get(Number(item.id));
        if (!prod) {
          notices.push(`"${item.name}" fue retirado de tu bolsa porque ya no se encuentra activo en el catálogo.`);
          changed = true;
          continue;
        }

        const stockDisp = Number(prod.STOCK_DISPONIBLE ?? prod.stock?.CAN_DIS_STO ?? 0);
        if (stockDisp <= 0) {
          notices.push(`"${item.name}" fue retirado de tu bolsa porque se agotó su stock.`);
          changed = true;
          continue;
        }

        const currentPrice = Number(prod.PRE_VEN_PRO ?? item.price);
        let nextQty = item.quantity;

        if (item.quantity > stockDisp) {
          nextQty = stockDisp;
          notices.push(`La cantidad de "${item.name}" se ajustó a ${stockDisp} ud(s) según el stock disponible.`);
          changed = true;
        }

        if (item.maxStock !== stockDisp || item.price !== currentPrice) {
          changed = true;
        }

        nextItems.push({
          ...item,
          name: prod.DES_PRO || item.name,
          price: currentPrice,
          quantity: nextQty,
          maxStock: stockDisp,
        });
      }

      if (changed) {
        setItems(nextItems);
        itemsRef.current = nextItems;
      }

      if (notices.length > 0) {
        setRemovedNotice(notices.join(" "));
        return false;
      }

      return true;
    } catch (err) {
      console.error("Error sincronizando carrito con el servidor:", err);
      return true;
    }
  }, []);

  // Validar al cargar inicialmente y cada vez que se abre el drawer o la pestaña recupera el foco
  useEffect(() => {
    if (!isLoaded) return;
    syncCartWithBackend();
  }, [isLoaded, syncCartWithBackend]);

  useEffect(() => {
    if (isOpen && isLoaded) {
      syncCartWithBackend();
    }
  }, [isOpen, isLoaded, syncCartWithBackend]);

  useEffect(() => {
    if (!isLoaded) return;
    const handleFocus = () => {
      syncCartWithBackend();
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [isLoaded, syncCartWithBackend]);

  function addToCart(product: Omit<CartItem, "quantity">, quantity = 1) {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      const maxAllowed = product.maxStock ?? existing?.maxStock;

      if (existing) {
        const desired = existing.quantity + quantity;
        const capped = maxAllowed !== undefined ? Math.min(desired, maxAllowed) : desired;
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, ...product, quantity: capped, maxStock: maxAllowed }
            : item
        );
      }

      const initialQty = maxAllowed !== undefined ? Math.min(quantity, maxAllowed) : quantity;
      if (initialQty <= 0) return prev;
      return [...prev, { ...product, quantity: initialQty }];
    });
    setIsOpen(true);
  }

  function removeFromCart(id: number) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  function updateQuantity(id: number, quantity: number) {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const capped = item.maxStock !== undefined ? Math.min(quantity, item.maxStock) : quantity;
        return { ...item, quantity: capped };
      })
    );
  }

  function clearCart() {
    setItems([]);
  }

  function clearRemovedNotice() {
    setRemovedNotice(null);
  }

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const iva = Number((subtotal * 0.15).toFixed(2));
  const total = Number((subtotal + iva).toFixed(2));

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isOpen,
        setIsOpen,
        totalItems,
        subtotal,
        iva,
        total,
        removedNotice,
        clearRemovedNotice,
        syncCartWithBackend,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe ser utilizado dentro de un CartProvider");
  }
  return context;
}
