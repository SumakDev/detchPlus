"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, ShoppingBag, Apple, Star, Sparkles, Wrench, ArrowRight, Check } from "lucide-react";
import LoginModal from "@/components/auth/LoginModal";
import RegisterModal from "@/components/auth/RegisterModal";
import ForgotPasswordModal from "@/components/auth/ForgotPasswordModal";
import CartDrawer from "@/components/cart/CartDrawer";
import ServiceTrackingModal from "@/components/support/ServiceTrackingModal";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/context/CartContext";
import UserMenu from "@/components/auth/UserMenu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { resolveProductImage } from "@/lib/utils";

const API = process.env.NEXT_PUBLIC_API_URL || "";


const INITIAL_MOCK_PRODUCTS = [
  {
    id: 1,
    name: "iPhone 15 Pro Max",
    subtitle: "Titanio. Tan resistente. Tan ligero. Tan Pro.",
    price: "$1,199",
    rawPrice: 1199,
    originalPrice: null,
    badge: "Nuevo",
    badgeColor: "bg-blue-600",
    status: "En stock",
    statusColor: "text-green-600",
    image: "/images/iphone-15-pro-max.png",
    features: ["Pantalla 6.7\" Super Retina XDR", "Sistema de cámaras Pro", "Chip A17 Pro"],
    colors: ["#8A8A8E", "#F5F5DC", "#2C2C2C", "#C9B037"],
    category: "Pro Max",
  },
  {
    id: 2,
    name: "iPhone 15 Plus",
    subtitle: "Pantalla grande. Batería aún más grande.",
    price: "$899",
    rawPrice: 899,
    originalPrice: null,
    badge: null,
    badgeColor: "",
    status: "En stock",
    statusColor: "text-green-600",
    image: "/images/iphone-15-plus.png",
    features: ["Pantalla 6.7\" Super Retina XDR", "Sistema de cámaras avanzado", "Chip A16 Bionic"],
    colors: ["#FFB6C1", "#87CEEB", "#030303ff", "#90EE90"],
    category: "Plus",
  },
  {
    id: 3,
    name: "iPhone 15",
    subtitle: "Nuevo. Mejorado. Extraordinario.",
    price: "$799",
    rawPrice: 799,
    originalPrice: null,
    badge: null,
    badgeColor: "",
    status: "Stock limitado",
    statusColor: "text-yellow-600",
    image: "/images/iphone15.jpg",
    features: ["Pantalla 6.1\" Super Retina XDR", "Sistema de cámaras avanzado", "Chip A16 Bionic"],
    colors: ["#FFB6C1", "#90EE90", "#87CEEB", "#FFC0CB"],
    category: "Estándar",
  },
  {
    id: 4,
    name: "iPhone 14",
    subtitle: "Tan impresionante. Tan capaz. Tan querido.",
    price: "$599",
    rawPrice: 599,
    originalPrice: "$699",
    badge: "Oferta",
    badgeColor: "bg-red-600",
    status: "En stock",
    statusColor: "text-green-600",
    image: "/images/iphone14.png",
    features: ["Pantalla 6.1\" Super Retina XDR", "Sistema de cámaras dual", "Chip A15 Bionic"],
    colors: ["#800080", "#87CEEB", "#2C2C2C", "#FF69B4"],
    category: "Estándar",
  },
  {
    id: 5,
    name: "iPhone SE",
    subtitle: "Mucha potencia. Fácil de usar. Fácil de amar.",
    price: "$429",
    rawPrice: 429,
    originalPrice: null,
    badge: "Mejor precio",
    badgeColor: "bg-green-600",
    status: "En stock",
    statusColor: "text-green-600",
    image: "/images/iphone-se.png",
    features: ["Pantalla 4.7\" Retina HD", "Cámara de 12MP", "Chip A15 Bionic"],
    colors: ["#2C2C2C", "#FFFFFF", "#FF0000"],
    category: "SE",
  },
];

export default function Home() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);

  const [productsList, setProductsList] = useState<any[]>(INITIAL_MOCK_PRODUCTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("TODOS");
  const [addedItemNotice, setAddedItemNotice] = useState<string | null>(null);

  const auth = useAuth();
  const cart = useCart();

  // Abrir login si viene con parámetro ?login=true
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("login") === "true") {
        setIsLoginOpen(true);
      }
    }
  }, []);

  // Cargar productos reales desde el backend
  useEffect(() => {
    async function loadDynamicProducts() {
      try {
        const res = await fetch(`${API}/productos`);
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((p) => {
            const precioVenta = Number(p.PRECIO_VENTA || 0);
            const stock = Number(p.STOCK_DISPONIBLE ?? 0);
            return {
              id: p.ID_PRO,
              name: p.NOMBRE || `Producto #${p.ID_PRO}`,
              subtitle: p.DES_PRO || "Dispositivo garantizado por DetchPlus",
              price: precioVenta > 0 ? `$${precioVenta.toFixed(2)}` : "$499.00",
              rawPrice: precioVenta > 0 ? precioVenta : 499,
              originalPrice: null,
              badge: p.EST_PRO === "NUEVO" ? "Nuevo" : p.EST_PRO || null,
              badgeColor: "bg-blue-600",
              status: stock > 0 ? `En stock (${stock})` : "Bajo pedido",
              statusColor: stock > 0 ? "text-green-600" : "text-amber-600",
              image: resolveProductImage(p.IMG_URL),
              features: [
                p.categoria?.NOM_CAT ? `Categoría: ${p.categoria.NOM_CAT}` : "Categoría General",
                p.marca?.NOM_MAR ? `Marca: ${p.marca.NOM_MAR}` : "Marca Original",
                "Garantía oficial DetchPlus",
              ],
              colors: ["#2C2C2C", "#FFFFFF", "#8A8A8E"],
              category: p.categoria?.NOM_CAT || "General",
            };
          });

          // Combinar productos de la base de datos con los mockups para un catálogo completo
          setProductsList([...mapped, ...INITIAL_MOCK_PRODUCTS]);
        }
      } catch (err) {
        console.error("Error cargando productos del backend:", err);
      }
    }
    loadDynamicProducts();
  }, []);

  function handleAddToCart(p: any) {
    cart.addToCart({
      id: p.id,
      name: p.name,
      price: p.rawPrice || 499,
      image: p.image,
      category: p.category,
    });
    setAddedItemNotice(p.name);
    setTimeout(() => setAddedItemNotice(null), 2500);
  }

  // Filtrar productos por búsqueda y categoría
  const filteredProducts = productsList.filter((p) => {
    const matchesSearch =
      searchTerm === "" ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.subtitle.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCat =
      selectedCategory === "TODOS" ||
      p.category?.toUpperCase() === selectedCategory.toUpperCase() ||
      (selectedCategory === "IPHONE" && p.name.toLowerCase().includes("iphone"));

    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen bg-white">
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
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 font-bold text-xl text-gray-900">
              <Apple className="h-6 w-6" />
              <span>DetchPlus</span>
            </Link>

            {/* Navegación central */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#productos" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Productos
              </Link>
              <button
                onClick={() => setIsTrackingOpen(true)}
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors flex items-center gap-1.5"
              >
                <Wrench className="w-4 h-4 text-blue-600" />
                Soporte & Reparaciones
              </button>
              <Link href="#sobre-nosotros" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Sobre nosotros
              </Link>
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

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-50 to-blue-50/40 min-h-[70vh] flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200/60 rounded-full text-blue-700 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" /> Nueva Colección 2026 & Servicio Autorizado
              </div>

              <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight">
                El futuro está en
                <span className="block text-blue-600">tus manos</span>
              </h1>

              <p className="text-lg text-gray-600 leading-relaxed max-w-xl">
                Descubre los últimos dispositivos Apple con garantía oficial, asesoría personalizada y servicio técnico especializado de vanguardia.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link
                  href="#productos"
                  className="bg-gray-900 text-white px-8 py-4 rounded-xl font-semibold hover:bg-gray-800 transition-all duration-300 hover:shadow-lg text-center"
                >
                  Explorar productos
                </Link>

                <button
                  onClick={() => setIsTrackingOpen(true)}
                  className="border border-gray-300 bg-white text-gray-800 px-6 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Wrench className="w-4 h-4 text-blue-600" />
                  Rastrear Reparación
                </button>
              </div>
            </div>

            <div className="text-center lg:text-right">
              <div className="relative">
                <Image
                  src="/images/iphone-hero.png"
                  alt="iPhone 15 Pro en color titanio natural"
                  width={420}
                  height={520}
                  className="mx-auto lg:ml-auto object-contain drop-shadow-2xl"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-3xl -z-10" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Catálogo de Productos */}
      <main className="py-16" id="productos">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header de sección */}
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">
              Catálogo de Dispositivos & Equipos
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto text-base">
              Productos garantizados con disponibilidad inmediata y entrega en todo el país
            </p>
          </div>

          {/* Filtros y Buscador */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10 pb-6 border-b border-gray-100">
            {/* Categorías tabs */}
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
              {["TODOS", "IPHONE", "CONSOLA", "SE", "PLUS"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wider transition ${selectedCategory === cat
                      ? "bg-gray-900 text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Input Buscador */}
            <div className="relative w-full sm:w-72">
              <Input
                type="text"
                placeholder="Buscar por nombre o modelo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 rounded-xl border-gray-200 text-sm"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Grid de productos */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-2xl">
              <p className="text-gray-500 text-base">No se encontraron productos que coincidan con tu búsqueda.</p>
              <button
                onClick={() => { setSearchTerm(""); setSelectedCategory("TODOS"); }}
                className="mt-3 text-sm font-semibold text-blue-600 hover:underline"
              >
                Restablecer filtros
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product) => (
                <article
                  key={product.id}
                  className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:transform hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Imagen del producto */}
                    <div className="relative bg-gray-50/70 h-72 flex items-center justify-center overflow-hidden p-6">
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

                      {/* Badges */}
                      <div className="absolute top-4 right-4">
                        {product.badge && (
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-white text-xs font-semibold ${product.badgeColor || "bg-blue-600"}`}
                          >
                            {product.badge}
                          </span>
                        )}
                      </div>

                      {product.category && (
                        <div className="absolute top-4 left-4">
                          <span className="inline-block px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-semibold border border-gray-200/60">
                            {product.category}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Contenido de la card */}
                    <div className="p-6 space-y-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{product.name}</h3>
                        <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">{product.subtitle}</p>
                      </div>

                      {/* Características */}
                      <ul className="space-y-1">
                        {product.features?.slice(0, 3).map((feature: string, index: number) => (
                          <li key={index} className="flex items-center text-xs text-gray-600">
                            <Star className="h-3 w-3 text-amber-500 mr-2 shrink-0 fill-amber-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      {/* Precio y estado */}
                      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                        <div className="flex items-baseline space-x-1.5">
                          <span className="text-2xl font-extrabold text-gray-900">{product.price}</span>
                          <span className="text-xs text-gray-500">USD</span>
                        </div>
                        <span className={`text-xs font-semibold ${product.statusColor}`}>{product.status}</span>
                      </div>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="p-6 pt-0 space-y-2">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="w-full bg-gray-900 text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-all duration-200 shadow-sm flex items-center justify-center gap-2"
                    >
                      <ShoppingBag className="w-4 h-4" /> Agregar a la bolsa
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Banner de Servicio Técnico */}
      <section className="bg-gradient-to-r from-gray-900 via-blue-950 to-gray-900 text-white py-16" id="soporte">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-semibold border border-blue-400/30">
                <Wrench className="w-3.5 h-3.5" /> Taller de Reparaciones DetchPlus
              </div>
              <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight">
                ¿Dejaste tu equipo en reparación?
              </h2>
              <p className="text-gray-300 text-sm leading-relaxed max-w-lg">
                Monitorea en tiempo real el diagnóstico, repuestos instalados y fecha estimada de entrega con tu número de orden o documento de identidad.
              </p>
              <Button
                onClick={() => setIsTrackingOpen(true)}
                className="bg-white text-gray-900 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition shadow-lg mt-2"
              >
                Consultar Estado de mi Dispositivo <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 space-y-4">
              <h3 className="font-bold text-lg text-white">Servicios Certificados</h3>
              <div className="grid grid-cols-2 gap-3 text-xs text-gray-200">
                <div className="bg-white/5 p-3 rounded-xl">✓ Cambio de Pantalla OLED</div>
                <div className="bg-white/5 p-3 rounded-xl">✓ Reemplazo de Batería</div>
                <div className="bg-white/5 p-3 rounded-xl">✓ Reparación de Placa Base</div>
                <div className="bg-white/5 p-3 rounded-xl">✓ Limpieza y Desbloqueo</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección adicional de características */}
      <section className="bg-white py-16 border-t border-gray-100" id="sobre-nosotros">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">¿Por qué elegir DetchPlus?</h2>
            <p className="text-gray-500 text-sm">Garantía, respaldo y experiencia en tecnología Apple</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-2xl bg-gray-50 space-y-3">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-xl flex items-center justify-center mx-auto shadow-md">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Productos Originales</h3>
              <p className="text-gray-600 text-sm">Garantía oficial y componentes de máxima autenticidad</p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-gray-50 space-y-3">
              <div className="bg-emerald-600 text-white w-12 h-12 rounded-xl flex items-center justify-center mx-auto shadow-md">
                <Wrench className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Servicio Técnico Especializado</h3>
              <p className="text-gray-600 text-sm">Técnicos certificados con repuestos originales y trazabilidad</p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-gray-50 space-y-3">
              <div className="bg-purple-600 text-white w-12 h-12 rounded-xl flex items-center justify-center mx-auto shadow-md">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Envío Rápido y Seguro</h3>
              <p className="text-gray-600 text-sm">Entrega protegida a nivel nacional con código de rastreo</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-white py-12 border-t border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Apple className="h-6 w-6" />
                <span className="text-xl font-bold">DetchPlus</span>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed">
                Tu plataforma de confianza para adquirir dispositivos Apple y gestionar reparaciones técnicas oficiales.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-3">Navegación</h4>
              <ul className="space-y-2 text-xs text-gray-400">
                <li><Link href="#productos" className="hover:text-white transition">Catálogo</Link></li>
                <li><button onClick={() => setIsTrackingOpen(true)} className="hover:text-white transition">Rastreo de Reparaciones</button></li>
                <li><Link href="/checkout" className="hover:text-white transition">Bolsa de Compras</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-3">Soporte</h4>
              <ul className="space-y-2 text-xs text-gray-400">
                <li><button onClick={() => setIsForgotPasswordOpen(true)} className="hover:text-white transition">Recuperar Contraseña</button></li>
                <li><button onClick={() => setIsTrackingOpen(true)} className="hover:text-white transition">Estado de Orden Técnica</button></li>
                <li><Link href="#soporte" className="hover:text-white transition">Contacto Técnico</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-3">Seguridad</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Todas las compras y servicios están respaldados con garantía legal y verificación de correo electrónico.
              </p>
            </div>
          </div>

          <div className="border-t border-gray-900 mt-8 pt-8 text-center text-xs text-gray-500">
            © 2024 DetchPlus. Todos los derechos reservados.
          </div>
        </div>
      </footer>

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