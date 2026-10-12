import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function resolveProductImage(img?: string | null): string {
  if (!img) return "/images/iphone15.jpg";
  if (img.startsWith("http://") || img.startsWith("https://")) return img;
  if (img.startsWith("/images/")) return img;
  const apiBase = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/api\/?$/, "");
  const cleanPath = img.startsWith("/") ? img : `/uploads/${img}`;
  if (apiBase) return `${apiBase}${cleanPath}`;
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return `http://localhost:4000${cleanPath}`;
  }
  return cleanPath;
}
