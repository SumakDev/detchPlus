"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  ShoppingBag,
  Apple,
  Star,
  Sparkles,
  Wrench,
  Check,
  SlidersHorizontal,
  ArrowUpDown,
  Smartphone,
  Gamepad2,
  Headphones,
  Watch,
  Layers,
  ArrowLeft,
  PackageX,
  Heart,
  MessageSquare,
  X,
} from "lucide-react";
import LoginModal from "@/components/auth/LoginModal";
import RegisterModal from "@/components/auth/RegisterModal";
import ForgotPasswordModal from "@/components/auth/ForgotPasswordModal";
import CartDrawer from "@/components/cart/CartDrawer";
import ServiceTrackingModal from "@/components/support/ServiceTrackingModal";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/context/CartContext";
import UserMenu from "@/components/auth/UserMenu";
import { formatEstadoProducto } from "@/types/product";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { resolveProductImage } from "@/lib/utils";

const API = process.env.NEXT_PUBLIC_API_URL || "";

interface CatalogProduct {
  id: number;
  name: string;
  subtitle: string;
  price: string;
  rawPrice: number;
  badge: string | null;
  badgeColor: string;
  stock: number;
  status: string;
  statusColor: string;
  image: string;
  features: string[];
  category: string;
  categoryRaw: string;
  brand: string;
  model: string;
  date: string;
}

export default function CatalogoPage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);

  const [productsList, setProductsList] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("TODOS");
  const [sortBy, setSortBy] = useState<string>("recent");
  const [addedItemNotice, setAddedItemNotice] = useState<string | null>(null);

  const auth = useAuth();
  const cart = useCart();

  // Lista de deseos (LIS_DES)
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);

  // Modal de reseñas (RES_PRO)
  const [reviewProduct, setReviewProduct] = useState<CatalogProduct | null>(null);
  const [reviewsList, setReviewsList] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState("");
  const [newComment, setNewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!auth.user?.ID_USU) {
      setWishlistIds([]);
      return;
    }
    fetch(`${API}/lis_des?idUsu=${auth.user.ID_USU}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setWishlistIds(data.map((d: any) => Number(d.ID_PRO)));
        }
      })
      .catch(() => {});
  }, [auth.user?.ID_USU]);

  async function handleToggleWishlist(p: CatalogProduct) {
    if (!auth.user?.ID_USU) {
      setIsLoginOpen(true);
      return;
    }
    try {
      const res = await fetch(`${API}/lis_des`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ID_USU: auth.user.ID_USU, ID_PRO: p.id }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.removed) {
          setWishlistIds((prev) => prev.filter((id) => id !== p.id));
        } else {
          setWishlistIds((prev) => (prev.includes(p.id) ? prev : [...prev, p.id]));
        }
      }
    } catch (e) {
      console.error("Error actualizando lista de deseos:", e);
    }
  }

  async function openReviewsModal(p: CatalogProduct) {
    setReviewProduct(p);
    setNewRating(5);
    setNewTitle("");
    setNewComment("");
    setReviewsLoading(true);
    try {
      const res = await fetch(`${API}/res_pro?idPro=${p.id}&est=APROBADA`);
      const data = res.ok ? await res.json() : [];
      setReviewsList(Array.isArray(data) ? data : []);
    } catch {
      setReviewsList([]);
    } finally {
      setReviewsLoading(false);
    }
  }

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!reviewProduct) return;
    if (!auth.user?.ID_USU) {
      setIsLoginOpen(true);
      return;
    }
    setSubmittingReview(true);
    try {
      const res = await fetch(`${API}/res_pro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ID_USU: auth.user.ID_USU,
          ID_PRO: reviewProduct.id,
          CAL_RES_PRO: newRating,
          TIT_RES_PRO: newTitle.trim() || null,
          COM_RES_PRO: newComment.trim() || null,
        }),
      });
      if (res.ok) {
        const updatedRes = await fetch(`${API}/res_pro?idPro=${reviewProduct.id}&est=APROBADA`);
        const updatedData = updatedRes.ok ? await updatedRes.json() : [];
        setReviewsList(Array.isArray(updatedData) ? updatedData : []);
        setNewTitle("");
        setNewComment("");
      }
    } catch (err) {
      console.error("Error enviando reseña:", err);
    } finally {
      setSubmittingReview(false);
    }
  }

  // Cargar productos directamente desde la base de datos
  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const res = await fetch(`${API}/productos`);
        if (!res.ok) {
          setLoading(false);
          return;
        }
        const data = await res.json();
        if (Array.isArray(data)) {
          const mapped: CatalogProduct[] = data.map((p) => {
            const precioVenta = Number(p.PRECIO_VENTA || 0);
            const stock = Number(p.STOCK_DISPONIBLE ?? (p.stock?.CAN_DIS_STO ?? 0));
            const categoryName = p.categoria?.NOM_CAT || "GENERAL";
            const brandName = p.marca?.NOM_MAR || "Original";
            const modelName = p.modelo?.NOM_MOD || "";

            return {
              id: Number(p.ID_PRO),
              name: p.NOMBRE || `Producto #${p.ID_PRO}`,
              subtitle: p.DES_PRO || "Dispositivo garantizado y verificado por DetchPlus",
              price: precioVenta > 0 ? `$${precioVenta.toFixed(2)}` : "$499.00",
              rawPrice: precioVenta > 0 ? precioVenta : 499,
              badge: formatEstadoProducto(p.EST_PRO) || null,
              badgeColor: "bg-blue-600",
              stock,
              status: stock > 0 ? `En stock (${stock})` : "Agotado",
              statusColor: stock > 0 ? "text-emerald-600 bg-emerald-50 border-emerald-200" : "text-amber-600 bg-amber-50 border-amber-200",
              image: resolveProductImage(p.IMG_URL),
              features: [
                categoryName ? `Categoría: ${categoryName}` : "Garantía Oficial",
                brandName ? `Marca: ${brandName}` : "Calidad Certificada",
                stock > 0 ? "Envío express disponible" : "Bajo pedido",
              ],
              category: categoryName,
              categoryRaw: categoryName.toUpperCase(),
              brand: brandName,
              model: modelName,
              date: p.FEC_ING_PRO || "",
            };
          });

          setProductsList(mapped);
        }
      } catch (err) {
        console.error("Error cargando productos en el catálogo:", err);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  function handleAddToCart(p: CatalogProduct) {
    if (p.stock <= 0) return;
    cart.addToCart({
      id: p.id,
      name: p.name,
      price: p.rawPrice,
      image: p.image,
      category: p.category,
    });
    setAddedItemNotice(p.name);
    setTimeout(() => setAddedItemNotice(null), 2500);
  }

  // Lista dinámica de categorías basadas en los datos reales
  const categoryFilters = useMemo(() => {
    const set = new Set<string>();
    productsList.forEach((p) => {
      if (p.categoryRaw) set.add(p.categoryRaw);
    });
    // Garantizar que estén al menos las principales para navegación clara
    ["TELEFONO", "CONSOLA", "ACCESORIO"].forEach((c) => set.add(c));
    return ["TODOS", ...Array.from(set)];
  }, [productsList]);

  // Filtrado y ordenamiento de productos
  const filteredProducts = useMemo(() => {
    let list = productsList.filter((p) => {
      const matchSearch =
        searchTerm.trim() === "" ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.model.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCategory =
        selectedCategory === "TODOS" ||
        p.categoryRaw === selectedCategory.toUpperCase() ||
        (selectedCategory === "TELEFONO" && (p.categoryRaw === "TELEFONO" || p.name.toLowerCase().includes("iphone"))) ||
        (selectedCategory === "CONSOLA" && (p.categoryRaw === "CONSOLA" || p.name.toLowerCase().includes("playstation") || p.name.toLowerCase().includes("switch")));

      return matchSearch && matchCategory;
    });

    if (sortBy === "price_asc") {
      list.sort((a, b) => a.rawPrice - b.rawPrice);
    } else if (sortBy === "price_desc") {
      list.sort((a, b) => b.rawPrice - a.rawPrice);
    } else if (sortBy === "name_asc") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "recent") {
      list.sort((a, b) => b.id - a.id);
    }

    return list;
  }, [productsList, searchTerm, selectedCategory, sortBy]);

  const getCategoryLabel = (cat: string) => {
    switch (cat.toUpperCase()) {
      case "TODOS":
        return "Todos los productos";
      case "TELEFONO":
        return "Smartphones & Teléfonos";
      case "CONSOLA":
        return "Consolas & Gaming";
      case "ACCESORIO":
        return "Accesorios";
      case "RELOJ":
        return "Smartwatches";
      case "ESTUCHE":
        return "Estuches & Fundas";
      default:
        return cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat.toUpperCase()) {
      case "TELEFONO":
        return <Smartphone className="w-4 h-4" />;
      case "CONSOLA":
        return <Gamepad2 className="w-4 h-4" />;
      case "ACCESORIO":
        return <Headphones className="w-4 h-4" />;
      case "RELOJ":
        return <Watch className="w-4 h-4" />;
      default:
        return <Layers className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col justify-between">
      {/* Toast flotante al agregar al carrito */}
      {addedItemNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span className="text-sm font-medium">
            Agregado a tu bolsa: <strong>{addedItemNotice}</strong>
          </span>
        </div>
      )}

      {/* Navegación Principal */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 font-bold text-xl text-gray-900">
              <Apple className="h-6 w-6" />
              <span>DetchPlus</span>
            </Link>

            {/* Navegación central */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Inicio
              </Link>
              <Link href="/catalogo" className="text-blue-600 font-semibold transition-colors border-b-2 border-blue-600 pb-0.5">
                Catálogo
              </Link>
              <button
                onClick={() => setIsTrackingOpen(true)}
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors flex items-center gap-1.5"
              >
                <Wrench className="w-4 h-4 text-blue-600" />
                Soporte & Reparaciones
              </button>
            </div>

            {/* Acciones de usuario */}
            <div className="flex items-center space-x-3">
              {auth.user ? (
                <UserMenu user={auth.user} onLogout={auth.logout} />
              ) : (
                <>
                  <button
                    onClick={() => setIsLoginOpen(true)}
                    className="text-gray-600 hover:text-gray-900 font-medium transition-colors text-sm"
                  >
                    Iniciar Sesión
                  </button>
                  <button
                    onClick={() => setIsRegisterOpen(true)}
                    className="bg-gray-900 text-white px-3.5 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm"
                  >
                    Registrarse
                  </button>
                </>
              )}

              {/* Botón Carrito interactivo */}
              <button
                onClick={() => cart.setIsOpen(true)}
                className="relative p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors ml-1"
                aria-label="Abrir Carrito"
              >
                <ShoppingBag className="h-5 w-5" />
                {cart.totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[11px] font-bold rounded-full h-5 w-5 flex items-center justify-center animate-in zoom-in">
                    {cart.totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Espaciador para navbar fija */}
      <div className="h-16" />

      {/* Header del Catálogo */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold mb-3 border border-blue-100">
                <Sparkles className="w-3.5 h-3.5" /> Tienda Oficial DetchPlus
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                Catálogo de Productos
              </h1>
              <p className="text-gray-500 text-sm sm:text-base mt-2 max-w-2xl">
                Descubre nuestra variedad de smartphones, consolas de videojuegos, mandos y accesorios originales con stock real garantizado.
              </p>
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition self-start md:self-auto"
            >
              <ArrowLeft className="w-4 h-4" /> Volver al Inicio
            </Link>
          </div>
        </div>
      </header>

      {/* Contenido Principal con Filtros y Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Barra de Filtros y Búsqueda */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            {/* Buscador */}
            <div className="relative flex-1 max-w-lg">
              <Input
                type="text"
                placeholder="Buscar por nombre, marca o modelo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 rounded-xl border-gray-200 text-sm focus:ring-2 focus:ring-blue-500"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 px-1.5 py-0.5 rounded"
                >
                  Limpiar
                </button>
              )}
            </div>

            {/* Ordenamiento y Contador */}
            <div className="flex items-center gap-3 justify-between md:justify-end">
              <div className="flex items-center gap-2 text-xs text-gray-500 font-medium whitespace-nowrap">
                <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                <span>Ordenar:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-gray-50 border border-gray-200 text-gray-800 text-xs rounded-lg px-2.5 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="recent">Más recientes</option>
                  <option value="price_asc">Precio: menor a mayor</option>
                  <option value="price_desc">Precio: mayor a menor</option>
                  <option value="name_asc">Nombre: A - Z</option>
                </select>
              </div>

              <div className="text-xs font-semibold px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg whitespace-nowrap">
                {filteredProducts.length} {filteredProducts.length === 1 ? "producto" : "productos"}
              </div>
            </div>
          </div>

          {/* Categorías Tabs */}
          <div className="pt-2 border-t border-gray-100 flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-1 flex items-center gap-1 shrink-0">
              <SlidersHorizontal className="w-3 h-3" /> Categorías:
            </span>
            {categoryFilters.map((cat) => {
              const isSelected = selectedCategory.toUpperCase() === cat.toUpperCase();
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition shrink-0 ${
                    isSelected
                      ? "bg-gray-900 text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {getCategoryIcon(cat)}
                  {getCategoryLabel(cat)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Estado de Carga */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse space-y-4">
                <div className="bg-gray-100 h-52 rounded-xl w-full" />
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
                <div className="h-8 bg-gray-100 rounded w-full pt-4" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          /* Estado Vacío */
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-xs max-w-xl mx-auto px-6">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 mx-auto mb-4">
              <PackageX className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              No se encontraron productos
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              No encontramos resultados que coincidan con la categoría seleccionada o los términos de búsqueda.
            </p>
            <Button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("TODOS");
              }}
              className="bg-gray-900 text-white rounded-xl text-xs px-6 py-2.5 font-semibold hover:bg-gray-800"
            >
              Restablecer filtros
            </Button>
          </div>
        ) : (
          /* Grid de Productos */
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <article
                key={product.id}
                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Contenedor de Imagen */}
                  <div className="relative bg-gray-50/70 h-64 flex items-center justify-center p-6 overflow-hidden">
                    <img
                      src={resolveProductImage(product.image)}
                      alt={product.name}
                      className="object-contain max-h-full max-w-full group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        if (!target.src.endsWith("/images/iphone15.jpg")) {
                          target.src = "/images/iphone15.jpg";
                        }
                      }}
                    />

                    {/* Badge de Categoría */}
                    <div className="absolute top-3 left-3">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-sm text-gray-700 text-[11px] font-bold border border-gray-200/60 shadow-xs">
                        {product.category}
                      </span>
                    </div>

                    {/* Badge de Condición o Novedad y Botón Lista de Deseos */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      {product.badge && (
                        <span className={`inline-block px-2.5 py-1 rounded-lg text-white text-[11px] font-bold ${product.badgeColor}`}>
                          {product.badge}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleToggleWishlist(product)}
                        title={wishlistIds.includes(product.id) ? "Quitar de mi lista de deseos" : "Guardar en lista de deseos"}
                        className={`p-2 rounded-full border shadow-xs transition ${
                          wishlistIds.includes(product.id)
                            ? "bg-rose-50 border-rose-200 text-rose-600"
                            : "bg-white/95 border-gray-200/70 text-gray-500 hover:text-rose-600"
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${wishlistIds.includes(product.id) ? "fill-rose-600 text-rose-600" : ""}`} />
                      </button>
                    </div>
                  </div>

                  {/* Detalles del Producto */}
                  <div className="p-5 space-y-3">
                    <div>
                      <div className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider mb-0.5">
                        {product.brand}
                      </div>
                      <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-gray-500 text-xs line-clamp-2 mt-1 leading-relaxed">
                        {product.subtitle}
                      </p>
                    </div>

                    {/* Especificaciones clave */}
                    <ul className="space-y-1 pt-1">
                      {product.features.slice(0, 2).map((feat, idx) => (
                        <li key={idx} className="flex items-center text-[11px] text-gray-600">
                          <Star className="h-3 w-3 text-amber-500 mr-1.5 shrink-0 fill-amber-500" />
                          <span className="truncate">{feat}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Precio y Disponibilidad */}
                    <div className="flex items-baseline justify-between pt-3 border-t border-gray-100">
                      <div>
                        <span className="text-xl font-extrabold text-gray-900">{product.price}</span>
                        <span className="text-[11px] text-gray-500 ml-1">USD</span>
                      </div>

                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${product.statusColor}`}>
                        {product.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Botones de Acción (Bolsa + Reseñas) */}
                <div className="p-5 pt-0 flex items-center gap-2">
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock <= 0}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs ${
                      product.stock > 0
                        ? "bg-gray-900 text-white hover:bg-gray-800 hover:shadow-md cursor-pointer active:scale-98"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    {product.stock > 0 ? "Agregar a la bolsa" : "Agotado"}
                  </button>
                  <button
                    type="button"
                    onClick={() => openReviewsModal(product)}
                    title="Ver y escribir reseñas"
                    className="py-2.5 px-3 rounded-xl text-xs font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition flex items-center gap-1"
                  >
                    <MessageSquare className="w-4 h-4 text-amber-500" />
                    <span>Reseñas</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-950 text-white py-12 border-t border-gray-900 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Apple className="h-6 w-6" />
                <span className="text-xl font-bold">DetchPlus</span>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed">
                Plataforma oficial para la adquisición de smartphones, consolas de videojuegos y servicio técnico certificado.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-3">Navegación</h4>
              <ul className="space-y-2 text-xs text-gray-400">
                <li><Link href="/" className="hover:text-white transition">Inicio</Link></li>
                <li><Link href="/catalogo" className="hover:text-white transition">Catálogo Completo</Link></li>
                <li><Link href="/checkout" className="hover:text-white transition">Bolsa de Compras</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-3">Soporte</h4>
              <ul className="space-y-2 text-xs text-gray-400">
                <li><button onClick={() => setIsTrackingOpen(true)} className="hover:text-white transition">Rastreo de Reparaciones</button></li>
                <li><button onClick={() => setIsForgotPasswordOpen(true)} className="hover:text-white transition">Recuperar Contraseña</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-3">Garantía</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Todos los productos y servicios cuentan con garantía oficial, facturación electrónica y seguimiento en tiempo real.
              </p>
            </div>
          </div>

          <div className="border-t border-gray-900 mt-8 pt-8 text-center text-xs text-gray-500">
            © 2026 DetchPlus. Todos los derechos reservados.
          </div>
        </div>
      </footer>

      {/* Modal de Reseñas de Producto (RES_PRO) */}
      {reviewProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[88vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Opiniones de Clientes</span>
                <h3 className="text-base font-bold text-gray-900 line-clamp-1">{reviewProduct.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setReviewProduct(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5 flex-1">
              {/* Lista de reseñas */}
              <div className="space-y-3">
                {reviewsLoading ? (
                  <p className="text-xs text-gray-400 text-center py-4">Cargando reseñas...</p>
                ) : reviewsList.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-4 bg-gray-50 rounded-xl border border-gray-100">
                    Este producto aún no tiene reseñas. ¡Sé el primero en calificarlo!
                  </p>
                ) : (
                  reviewsList.map((r) => {
                    const author = [r.usuario?.NOM_USU, r.usuario?.APE_USU].filter(Boolean).join(" ") || `Usuario #${r.ID_USU}`;
                    const stars = Number(r.CAL_RES_PRO || 5);
                    return (
                      <div key={r.ID_RES_PRO} className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-900">{author}</span>
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3.5 h-3.5 ${s <= stars ? "text-amber-500 fill-amber-500" : "text-gray-300"}`}
                              />
                            ))}
                          </div>
                        </div>
                        {r.TIT_RES_PRO && <p className="text-xs font-semibold text-gray-800">{r.TIT_RES_PRO}</p>}
                        {r.COM_RES_PRO && <p className="text-xs text-gray-600 leading-relaxed">{r.COM_RES_PRO}</p>}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Formulario para dejar reseña */}
              <form onSubmit={handleSubmitReview} className="border-t border-gray-100 pt-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">Escribir una reseña</h4>
                {!auth.user ? (
                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-900 flex items-center justify-between">
                    <span>Inicia sesión para calificar este producto.</span>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        setReviewProduct(null);
                        setIsLoginOpen(true);
                      }}
                      className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Iniciar Sesión
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600">Tu calificación:</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setNewRating(s)}
                            className="p-0.5"
                          >
                            <Star
                              className={`w-5 h-5 ${s <= newRating ? "text-amber-500 fill-amber-500" : "text-gray-300"}`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <Input
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Título breve (ej. Excelente calidad)"
                      className="text-xs h-9"
                    />
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Comparte tu experiencia con este producto..."
                      rows={3}
                      required
                      className="w-full rounded-xl border border-gray-200 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Button
                      type="submit"
                      disabled={submittingReview}
                      className="w-full bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold h-9 rounded-xl"
                    >
                      {submittingReview ? "Publicando..." : "Publicar Reseña"}
                    </Button>
                  </>
                )}
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modales del Sistema */}
      <LoginModal
        open={isLoginOpen}
        setOpen={setIsLoginOpen}
        onOpenRegister={() => {
          setIsLoginOpen(false);
          setIsRegisterOpen(true);
        }}
        onOpenForgotPassword={() => {
          setIsLoginOpen(false);
          setIsForgotPasswordOpen(true);
        }}
        onSuccess={async ({ token }: { token?: string; user?: any }) => {
          if (token) await auth.loginWithToken(token);
          setIsLoginOpen(false);
        }}
      />

      <RegisterModal
        open={isRegisterOpen}
        setOpen={setIsRegisterOpen}
        onOpenLogin={() => {
          setIsRegisterOpen(false);
          setIsLoginOpen(true);
        }}
        onSuccess={async ({ token }: { token?: string; user?: any }) => {
          if (token) await auth.loginWithToken(token);
          setIsRegisterOpen(false);
        }}
      />

      <ForgotPasswordModal
        open={isForgotPasswordOpen}
        setOpen={setIsForgotPasswordOpen}
        onOpenLogin={() => {
          setIsForgotPasswordOpen(false);
          setIsLoginOpen(true);
        }}
      />

      {/* Cajón de Carrito deslizable */}
      <CartDrawer />

      {/* Modal de Seguimiento de Servicio Técnico */}
      <ServiceTrackingModal
        open={isTrackingOpen}
        setOpen={setIsTrackingOpen}
      />
    </div>
  );
}
