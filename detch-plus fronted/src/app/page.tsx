"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingBag,
  Apple,
  Star,
  Sparkles,
  Wrench,
  ArrowRight,
  Check,
  Smartphone,
  Gamepad2,
  ChevronRight,
  PackageOpen,
} from "lucide-react";
import LoginModal from "@/components/auth/LoginModal";
import RegisterModal from "@/components/auth/RegisterModal";
import ForgotPasswordModal from "@/components/auth/ForgotPasswordModal";
import CartDrawer from "@/components/cart/CartDrawer";
import ServiceTrackingModal from "@/components/support/ServiceTrackingModal";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/context/CartContext";
import UserMenu from "@/components/auth/UserMenu";
import { Button } from "@/components/ui/button";
import { resolveProductImage } from "@/lib/utils";

const API = process.env.NEXT_PUBLIC_API_URL || "";

interface PhoneProduct {
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
  rawCategory: string;
}

export default function Home() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);

  const [latestPhones, setLatestPhones] = useState<PhoneProduct[]>([]);
  const [loadingPhones, setLoadingPhones] = useState(true);
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

  // Cargar teléfonos reales desde el backend (categoría TELEFONO o smartphones recientes)
  useEffect(() => {
    async function loadLatestPhones() {
      try {
        setLoadingPhones(true);
        const res = await fetch(`${API}/productos`);
        if (!res.ok) {
          setLoadingPhones(false);
          return;
        }
        const data = await res.json();
        if (Array.isArray(data)) {
          // Filtrar específicamente productos que correspondan a telefonía / smartphones
          const phonesOnly = data.filter((p) => {
            const cat = (p.categoria?.NOM_CAT || "").toUpperCase();
            const idCat = Number(p.ID_CAT || 0);
            const name = (p.NOMBRE || "").toUpperCase();
            return (
              idCat === 1 ||
              cat === "TELEFONO" ||
              cat.includes("PHONE") ||
              name.includes("IPHONE") ||
              name.includes("GALAXY") ||
              name.includes("XIAOMI") ||
              name.includes("CELULAR")
            );
          });

          const mapped: PhoneProduct[] = phonesOnly.map((p) => {
            const precioVenta = Number(p.PRECIO_VENTA || 0);
            const stock = Number(p.STOCK_DISPONIBLE ?? (p.stock?.CAN_DIS_STO ?? 0));
            const brand = p.marca?.NOM_MAR || "Apple";
            const model = p.modelo?.NOM_MOD || "";

            return {
              id: Number(p.ID_PRO),
              name: p.NOMBRE || `iPhone #${p.ID_PRO}`,
              subtitle: p.DES_PRO || "Dispositivo garantizado y verificado por DetchPlus",
              price: precioVenta > 0 ? `$${precioVenta.toFixed(2)}` : "$499.00",
              rawPrice: precioVenta > 0 ? precioVenta : 499,
              badge: p.EST_PRO === "NUEVO" ? "Nuevo" : p.EST_PRO || "Garantizado",
              badgeColor: "bg-blue-600",
              stock,
              status: stock > 0 ? `En stock (${stock})` : "Agotado",
              statusColor: stock > 0 ? "text-emerald-600 bg-emerald-50 border-emerald-200" : "text-amber-600 bg-amber-50 border-amber-200",
              image: resolveProductImage(p.IMG_URL),
              features: [
                `Marca Oficial: ${brand}`,
                model ? `Modelo: ${model}` : "Garantía oficial DetchPlus",
                stock > 0 ? "Entrega inmediata" : "Bajo pedido",
              ],
              category: p.categoria?.NOM_CAT || "Teléfono",
              rawCategory: (p.categoria?.NOM_CAT || "TELEFONO").toUpperCase(),
            };
          });

          setLatestPhones(mapped);
        }
      } catch (err) {
        console.error("Error cargando teléfonos del backend:", err);
      } finally {
        setLoadingPhones(false);
      }
    }

    loadLatestPhones();
  }, []);

  function handleAddToCart(p: PhoneProduct) {
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
              <Link href="/" className="text-gray-900 font-semibold transition-colors">
                Inicio
              </Link>
              <Link href="/catalogo" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Catálogo
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
                Descubre los últimos dispositivos Apple y tecnología móvil con garantía oficial, asesoría personalizada y servicio técnico especializado.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link
                  href="/catalogo"
                  className="bg-gray-900 text-white px-8 py-4 rounded-xl font-semibold hover:bg-gray-800 transition-all duration-300 hover:shadow-lg text-center flex items-center justify-center gap-2"
                >
                  Explorar Catálogo Completo <ArrowRight className="w-4 h-4" />
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
                  alt="iPhone en color titanio natural"
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

      {/* Sección Dinámica: Últimos Teléfonos */}
      <section className="py-16 bg-white" id="telefonos">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header de sección con enlace al catálogo completo */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-4 border-b border-gray-100">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold mb-2">
                <Smartphone className="w-3.5 h-3.5" /> Smartphones en Stock
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Últimos Teléfonos Disponibles
              </h2>
              <p className="text-gray-500 text-sm mt-1 max-w-xl">
                Equipos móviles con stock en tiempo real, garantía oficial de DetchPlus y entrega inmediata.
              </p>
            </div>

            <Link
              href="/catalogo"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-800 transition group self-start sm:self-auto"
            >
              Ver catálogo completo
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Grid de Teléfonos */}
          {loadingPhones ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-gray-50 rounded-2xl p-6 animate-pulse space-y-4">
                  <div className="bg-gray-200 h-64 rounded-xl w-full" />
                  <div className="h-5 bg-gray-200 rounded w-2/3" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : latestPhones.length === 0 ? (
            <div className="text-center py-14 bg-gray-50 rounded-2xl border border-gray-100 p-8 max-w-lg mx-auto">
              <PackageOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-900 mb-1">
                No hay teléfonos en stock en este momento
              </h3>
              <p className="text-xs text-gray-500 mb-5">
                Próximamente incorporaremos nuevos modelos. Puedes revisar consolas, controles y accesorios en nuestro catálogo completo.
              </p>
              <Link
                href="/catalogo"
                className="inline-flex items-center gap-2 bg-gray-900 text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-gray-800 transition"
              >
                Explorar Catálogo Completo <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {latestPhones.map((phone) => (
                <article
                  key={phone.id}
                  className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Imagen del teléfono */}
                    <div className="relative bg-gray-50/70 h-72 flex items-center justify-center overflow-hidden p-6">
                      <img
                        src={phone.image}
                        alt={phone.name}
                        className="object-contain max-h-full max-w-full group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          if (!target.src.endsWith("/images/iphone15.jpg")) {
                            target.src = "/images/iphone15.jpg";
                          }
                        }}
                      />

                      {/* Badge de Categoría */}
                      <div className="absolute top-4 left-4">
                        <span className="inline-block px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-semibold border border-gray-200/60 shadow-xs">
                          {phone.category}
                        </span>
                      </div>

                      {/* Badge de Estado / Garantía */}
                      {phone.badge && (
                        <div className="absolute top-4 right-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-white text-xs font-semibold ${phone.badgeColor}`}>
                            {phone.badge}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Contenido de la card */}
                    <div className="p-6 space-y-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                          {phone.name}
                        </h3>
                        <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">
                          {phone.subtitle}
                        </p>
                      </div>

                      {/* Características */}
                      <ul className="space-y-1">
                        {phone.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-xs text-gray-600">
                            <Star className="h-3 w-3 text-amber-500 mr-2 shrink-0 fill-amber-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      {/* Precio y estado */}
                      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                        <div className="flex items-baseline space-x-1.5">
                          <span className="text-2xl font-extrabold text-gray-900">{phone.price}</span>
                          <span className="text-xs text-gray-500">USD</span>
                        </div>
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-md border ${phone.statusColor}`}>
                          {phone.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Botón de acción */}
                  <div className="p-6 pt-0">
                    <button
                      onClick={() => handleAddToCart(phone)}
                      disabled={phone.stock <= 0}
                      className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 shadow-sm flex items-center justify-center gap-2 ${
                        phone.stock > 0
                          ? "bg-gray-900 text-white hover:bg-gray-800 cursor-pointer"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      <ShoppingBag className="w-4 h-4" />
                      {phone.stock > 0 ? "Agregar a la bolsa" : "Agotado"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Banner con enlace al catálogo completo */}
          <div className="mt-14 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-gray-900 to-blue-950 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-1 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 text-blue-300 text-xs font-semibold">
                <Gamepad2 className="w-4 h-4" /> PlayStation, Nintendo Switch, Controles y Accesorios
              </div>
              <h3 className="text-xl font-bold">
                ¿Buscás consolas de videojuegos o accesorios?
              </h3>
              <p className="text-gray-300 text-xs sm:text-sm max-w-xl">
                Encontrá consolas PS5, Nintendo Switch OLED, mandos DualSense y accesorios certificados en nuestro catálogo general.
              </p>
            </div>

            <Link
              href="/catalogo"
              className="bg-white text-gray-900 hover:bg-gray-100 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap shadow-md shrink-0 flex items-center gap-2"
            >
              Explorar Todo el Catálogo <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

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
                Tu plataforma de confianza para adquirir smartphones, consolas y gestionar reparaciones técnicas oficiales.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-3">Navegación</h4>
              <ul className="space-y-2 text-xs text-gray-400">
                <li><Link href="/catalogo" className="hover:text-white transition">Catálogo</Link></li>
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
            © 2026 DetchPlus. Todos los derechos reservados.
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