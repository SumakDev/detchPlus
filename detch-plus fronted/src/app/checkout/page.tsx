"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { Apple, ShoppingBag, ArrowLeft, CheckCircle2, ShieldCheck, Truck, CreditCard, Banknote, Building2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API = process.env.NEXT_PUBLIC_API_URL || "";

export const ECUADOR_LOCATIONS: Record<string, string[]> = {
  "Azuay": ["Cuenca", "Gualaceo", "Paute", "Santa Isabel", "Camilo Ponce Enríquez", "Chordeleg", "Girón", "Sígsig", "San Fernando", "Nabón", "Oña", "Pucará", "El Pan", "Sevilla de Oro", "Guachapala"],
  "Bolívar": ["Guaranda", "San Miguel", "Chimbo", "Caluma", "Echeandía", "Chillanes", "Las Naves"],
  "Cañar": ["Azogues", "La Troncal", "Cañar", "Biblián", "Déleg", "El Tambo", "Suscal"],
  "Carchi": ["Tulcán", "San Gabriel (Montúfar)", "Mira", "Bolívar", "Espejo", "Huaca"],
  "Chimborazo": ["Riobamba", "Guano", "Alausí", "Colta", "Chambo", "Cumandá", "Guamote", "Pallatanga", "Penipe", "Chunchi"],
  "Cotopaxi": ["Latacunga", "Salcedo", "Pujilí", "Saquisilí", "La Maná", "Sigchos", "Pangua"],
  "El Oro": ["Machala", "Pasaje", "Santa Rosa", "Huaquillas", "Arenillas", "Piñas", "Zaruma", "Portovelo", "El Guabo", "Atahualpa", "Balsas", "Chilla", "Las Lajas", "Marcabelí"],
  "Esmeraldas": ["Esmeraldas", "Atacames", "Quinindé", "San Lorenzo", "Muisne", "Rioverde", "Eloy Alfaro"],
  "Galápagos": ["Puerto Baquerizo Moreno (San Cristóbal)", "Puerto Ayora (Santa Cruz)", "Puerto Villamil (Isabela)"],
  "Guayas": ["Guayaquil", "Durán", "Samborondón", "Daule", "Milagro", "El Triunfo", "Naranjal", "Balzar", "Playas (General Villamil)", "Salitre", "Pedro Carbo", "Yaguachi", "Santa Lucía", "Palestina", "Colimes", "Bucay", "Isidro Ayora", "Lomas de Sargentillo", "Marcelino Maridueña", "Nobol", "Simón Bolívar"],
  "Imbabura": ["Ibarra", "Otavalo", "Cotacachi", "Antonio Ante (Atuntaqui)", "Pimampiro", "Urcuquí"],
  "Loja": ["Loja", "Catamayo", "Cariamanga (Calvas)", "Macará", "Saraguro", "Vilcabamba", "Celica", "Alamor (Puyango)", "Chaguarpamba", "Espíndola", "Gonzanamá", "Pindal", "Quilanga", "Sozoranga", "Zapotillo"],
  "Los Ríos": ["Babahoyo", "Quevedo", "Buena Fe", "Ventanas", "Vinces", "Valencia", "Montalvo", "Mocache", "Baba", "Puebloviejo", "Urdaneta", "Palenque", "Quinsaloma"],
  "Manabí": ["Portoviejo", "Manta", "Chone", "Montecristi", "Jipijapa", "Bahía de Caráquez (Sucre)", "El Carmen", "Calceta (Bolívar)", "Pedernales", "Tosagua", "Rocafuerte", "Santa Ana", "San Vicente", "Jama", "Jaramijó", "Paján", "Pichincha", "Puerto López", "Flavio Alfaro", "Junín", "Olmedo", "24 de Mayo"],
  "Morona Santiago": ["Macas (Morona)", "Sucúa", "Gualaquiza", "Limón Indanza", "Palora", "Santiago de Méndez", "Logroño", "Taisha", "Tiwintza", "Huamboya", "San Juan Bosco", "Pablo Sexto"],
  "Napo": ["Tena", "Archidona", "El Chaco", "Baeza (Quijos)", "Carlos Julio Arosemena Tola"],
  "Orellana": ["Puerto Francisco de Orellana (El Coca)", "La Joya de los Sachas", "Loreto", "Aguarico"],
  "Pastaza": ["Puyo (Pastaza)", "Mera", "Santa Clara", "Arajuno"],
  "Pichincha": ["Quito", "Rumiñahui (Sangolquí)", "Cayambe", "Mejía (Machachi)", "Pedro Moncayo (Tabacundo)", "San Miguel de los Bancos", "Pedro Vicente Maldonado", "Puerto Quito"],
  "Santa Elena": ["Santa Elena", "La Libertad", "Salinas"],
  "Santo Domingo de los Tsáchilas": ["Santo Domingo", "La Concordia"],
  "Sucumbíos": ["Nueva Loja (Lago Agrio)", "Shushufindi", "Cáscales", "Cuyabeno", "Gonzalo Pizarro", "Putumayo", "Sucumbíos"],
  "Tungurahua": ["Ambato", "Baños de Agua Santa", "Pelileo", "Píllaro", "Cevallos", "Mocha", "Patate", "Quero", "Tisaleo"],
  "Zamora Chinchipe": ["Zamora", "Yantzaza", "El Pangui", "Centinela del Cóndor", "Chinchipe", "Nangaritza", "Palanda", "Paquisha", "Yacuambi"]
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, iva, total, clearCart } = useCart();
  const auth = useAuth();
  const isLoggedIn = !!auth.user;

  // Form states
  const [nombres, setNombres] = useState("");
  const [email, setEmail] = useState("");
  const [cedula, setCedula] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [provincia, setProvincia] = useState("Pichincha");
  const [ciudad, setCiudad] = useState("Quito");
  const [ciudadPersonalizada, setCiudadPersonalizada] = useState("");
  const [referencia, setReferencia] = useState("");
  const [metodoPago, setMetodoPago] = useState<"EFECTIVO" | "TRANSFERENCIA" | "TARJ_CRED">("EFECTIVO");
  const [notas, setNotas] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<any | null>(null);

  // Auto-llenado de datos cuando el usuario está logueado
  useEffect(() => {
    if (auth.user) {
      const fullName = [auth.user.NOM_USU, auth.user.APE_USU].filter(Boolean).join(" ").trim() ||
        auth.user.USUARIO ||
        auth.user.USR_USU ||
        "";
      if (fullName) setNombres(fullName);
      if (auth.user.EMAIL || auth.user.COR_USU) setEmail(auth.user.EMAIL || auth.user.COR_USU || "");
      if (auth.user.CEDULA || auth.user.ID_PERSONA) setCedula(auth.user.CEDULA || auth.user.ID_PERSONA || "");
      if (auth.user.TEL_USU) setTelefono(auth.user.TEL_USU);
      if (auth.user.DIRECCION) setDireccion(auth.user.DIRECCION);

      const userProv = auth.user.PROVINCIA || "";
      const userCity = auth.user.CIUDAD || "";
      if (userProv && ECUADOR_LOCATIONS[userProv]) {
        setProvincia(userProv);
        const cities = ECUADOR_LOCATIONS[userProv] || [];
        if (userCity) {
          if (cities.includes(userCity)) {
            setCiudad(userCity);
          } else {
            setCiudad("OTRA");
            setCiudadPersonalizada(userCity);
          }
        } else {
          setCiudad(cities[0] || "");
        }
      } else if (userCity) {
        setCiudad("OTRA");
        setCiudadPersonalizada(userCity);
      }
    }
  }, [auth.user]);

  function handleProvinciaChange(newProv: string) {
    setProvincia(newProv);
    const cities = ECUADOR_LOCATIONS[newProv] || [];
    if (cities.length > 0) {
      setCiudad(cities[0]);
    } else {
      setCiudad("OTRA");
    }
    setCiudadPersonalizada("");
  }

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (items.length === 0) {
      setErrorMsg("Tu carrito está vacío. Agrega productos antes de continuar.");
      return;
    }

    const finalCiudad = (ciudad === "OTRA" ? ciudadPersonalizada : ciudad).trim();
    if (!provincia) {
      setErrorMsg("Por favor selecciona tu provincia de entrega.");
      return;
    }
    if (!finalCiudad) {
      setErrorMsg("Por favor selecciona o especifica tu ciudad de entrega.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ID_USU: auth.user?.ID_USU || 1,
        nombreContacto: nombres,
        email,
        cedula,
        telefono,
        direccion: `${direccion} ${referencia ? `(Ref: ${referencia})` : ""}`.trim(),
        ciudad: finalCiudad,
        provincia,
        metodoPago,
        notas,
        items: items.map((i) => ({
          id: i.id,
          cantidad: i.quantity,
          precio: i.price,
        })),
      };

      const res = await fetch(`${API}/ped_onl`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(auth.token ? { Authorization: `Bearer ${auth.token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "No se pudo procesar el pedido.");
      }

      setCompletedOrder(data);
      clearCart();
    } catch (err: any) {
      setErrorMsg(err?.message || "Ocurrió un error al procesar tu compra.");
    } finally {
      setLoading(false);
    }
  }

  // Si la orden ya se completó, mostrar pantalla de confirmación tipo Apple
  if (completedOrder) {
    const orderData = completedOrder.order || {};
    return (
      <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 animate-in zoom-in duration-300">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">¡Gracias por tu compra!</h1>
            <p className="text-gray-500 text-sm mt-2">
              Tu pedido ha sido recibido y está siendo preparado por nuestro equipo especializado.
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200/60 text-left space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Número de Pedido</span>
              <span className="font-mono font-bold text-gray-900 text-base">{orderData.NUM_PED_ONL || "PED-CONFIRMADO"}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Código de Rastreo</span>
              <span className="font-mono text-blue-600 font-semibold">{completedOrder.trackingCode || orderData.COD_SEG_PED || "DP-TRACK-001"}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Método de Pago</span>
              <span className="font-medium text-gray-900 capitalize">{orderData.MET_PAG_PED?.toLowerCase() || metodoPago.toLowerCase()}</span>
            </div>
            <div className="flex justify-between items-center text-sm font-bold text-gray-900 pt-2 border-t border-gray-200">
              <span>Total Pagado / Por Pagar</span>
              <span>${Number(orderData.TOT_PED_ONL || total).toFixed(2)}</span>
            </div>
          </div>

          {metodoPago === "TRANSFERENCIA" && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-left text-xs text-blue-900 space-y-2">
              <p className="font-bold flex items-center gap-1.5 text-blue-950">
                <Building2 className="w-4 h-4" /> Datos Bancarios para Transferencia:
              </p>
              <p>• <strong>Banco:</strong> Banco Pichincha (Cta. Corriente)</p>
              <p>• <strong>Número:</strong> 2100458923</p>
              <p>• <strong>Titular:</strong> DetchPlus Soluciones Tecnológicas S.A.</p>
              <p>• <strong>RUC:</strong> 1792837482001</p>
              <p className="text-gray-500 italic mt-1">Por favor envía el comprobante con tu número de pedido a pagos@detchplus.com o vía WhatsApp.</p>
            </div>
          )}

          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => router.push("/")}
              className="bg-gray-900 text-white px-8 py-3 rounded-xl font-semibold hover:bg-gray-800 transition"
            >
              Volver a la Tienda
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Si no hay productos en el carrito
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-md border border-gray-100 p-8 text-center space-y-4">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Tu carrito de compras está vacío</h2>
          <p className="text-sm text-gray-500">
            Aún no has seleccionado ningún producto para comprar. Explora nuestro catálogo y agrega lo que necesites.
          </p>
          <Button
            onClick={() => router.push("/")}
            className="w-full bg-gray-900 text-white rounded-xl py-3 font-medium hover:bg-gray-800 transition"
          >
            Explorar Catálogo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/40">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-900 font-bold text-lg">
            <Apple className="w-6 h-6" />
            <span>DetchPlus</span>
          </Link>
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Seguir comprando
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Finalizar Compra</h1>
          <p className="text-gray-500 text-sm mt-1">Completa tus datos de envío y selecciona tu método de pago</p>
        </div>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Form (8 cols) */}
          <div className="lg:col-span-7 space-y-8">
            {/* Step 1: Información de contacto */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs">1</span>
                  Datos del Comprador
                </h2>
                {isLoggedIn && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Datos bloqueados por tu cuenta ({auth.user?.USR_USU || auth.user?.EMAIL})
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nombres" className="flex items-center justify-between">
                    <span>Nombres y Apellidos *</span>
                    {isLoggedIn && <Lock className="w-3.5 h-3.5 text-gray-400" />}
                  </Label>
                  <Input
                    id="nombres"
                    value={nombres}
                    onChange={(e) => setNombres(e.target.value)}
                    placeholder="Ej. Jonathan Boada"
                    required
                    readOnly={isLoggedIn}
                    className={`mt-1 transition ${isLoggedIn ? "bg-gray-100 text-gray-700 font-medium cursor-not-allowed border-gray-200 select-none" : ""}`}
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="flex items-center justify-between">
                    <span>Correo Electrónico *</span>
                    {isLoggedIn && <Lock className="w-3.5 h-3.5 text-gray-400" />}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ejemplo@correo.com"
                    required
                    readOnly={isLoggedIn}
                    className={`mt-1 transition ${isLoggedIn ? "bg-gray-100 text-gray-700 font-medium cursor-not-allowed border-gray-200 select-none" : ""}`}
                  />
                </div>
                <div>
                  <Label htmlFor="cedula" className="flex items-center justify-between">
                    <span>Cédula o RUC *</span>
                    {isLoggedIn && !!cedula && <Lock className="w-3.5 h-3.5 text-gray-400" />}
                  </Label>
                  <Input
                    id="cedula"
                    value={cedula}
                    onChange={(e) => setCedula(e.target.value)}
                    placeholder="10 dígitos"
                    required
                    readOnly={isLoggedIn && !!auth.user?.CEDULA}
                    className={`mt-1 transition ${isLoggedIn && !!auth.user?.CEDULA ? "bg-gray-100 text-gray-700 font-medium cursor-not-allowed border-gray-200 select-none" : ""}`}
                  />
                  {isLoggedIn && !auth.user?.CEDULA && (
                    <p className="text-[11px] text-amber-600 mt-1">Ingresa tu cédula para tu factura fiscal.</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="telefono" className="flex items-center justify-between">
                    <span>Teléfono / WhatsApp *</span>
                    {isLoggedIn && !!telefono && <Lock className="w-3.5 h-3.5 text-gray-400" />}
                  </Label>
                  <Input
                    id="telefono"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="0991234567"
                    required
                    readOnly={isLoggedIn && !!auth.user?.TEL_USU}
                    className={`mt-1 transition ${isLoggedIn && !!auth.user?.TEL_USU ? "bg-gray-100 text-gray-700 font-medium cursor-not-allowed border-gray-200 select-none" : ""}`}
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Dirección de entrega */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs">2</span>
                Dirección de Entrega
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Provincia PRIMERO */}
                <div>
                  <Label htmlFor="provincia" className="font-semibold text-gray-800">
                    Provincia *
                  </Label>
                  <select
                    id="provincia"
                    value={provincia}
                    onChange={(e) => handleProvinciaChange(e.target.value)}
                    required
                    className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-xs focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                  >
                    <option value="">Selecciona tu provincia...</option>
                    {Object.keys(ECUADOR_LOCATIONS).sort().map((prov) => (
                      <option key={prov} value={prov}>
                        {prov}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Ciudad / Cantón que depende de la provincia */}
                <div>
                  <Label htmlFor="ciudad" className="font-semibold text-gray-800">
                    Ciudad / Cantón *
                  </Label>
                  <select
                    id="ciudad"
                    value={ciudad}
                    disabled={!provincia}
                    onChange={(e) => {
                      setCiudad(e.target.value);
                      if (e.target.value !== "OTRA") setCiudadPersonalizada("");
                    }}
                    required
                    className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-xs focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    {!provincia && <option value="">Primero selecciona una provincia</option>}
                    {provincia && (ECUADOR_LOCATIONS[provincia] || []).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    {provincia && <option value="OTRA">Otra ciudad / cantón...</option>}
                  </select>

                  {ciudad === "OTRA" && (
                    <Input
                      id="ciudadPersonalizada"
                      value={ciudadPersonalizada}
                      onChange={(e) => setCiudadPersonalizada(e.target.value)}
                      placeholder="Escribe el nombre de tu cantón o parroquia *"
                      required
                      className="mt-2 text-sm"
                    />
                  )}
                </div>

                {/* 3. Dirección exacta */}
                <div className="sm:col-span-2">
                  <Label htmlFor="direccion" className="font-semibold text-gray-800">
                    Dirección exacta (Calle y Número) *
                  </Label>
                  <Input
                    id="direccion"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    placeholder="Av. Cevallos y Montalvo / Calle principal y secundaria"
                    required
                    className="mt-1"
                  />
                </div>

                {/* 4. Referencia de entrega */}
                <div className="sm:col-span-2">
                  <Label htmlFor="referencia" className="font-medium text-gray-700">
                    Referencia de entrega
                  </Label>
                  <Input
                    id="referencia"
                    value={referencia}
                    onChange={(e) => setReferencia(e.target.value)}
                    placeholder="Frente a la farmacia, portón negro o casa de 2 pisos"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Método de pago */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs">3</span>
                Método de Pago
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition text-center ${
                    metodoPago === "EFECTIVO"
                      ? "border-gray-900 bg-gray-50 text-gray-900 font-semibold"
                      : "border-gray-200 hover:border-gray-300 text-gray-600"
                  }`}
                >
                  <input
                    type="radio"
                    name="metodoPago"
                    value="EFECTIVO"
                    checked={metodoPago === "EFECTIVO"}
                    onChange={() => setMetodoPago("EFECTIVO")}
                    className="sr-only"
                  />
                  <Banknote className="w-6 h-6 mb-2 text-gray-800" />
                  <span className="text-sm">Efectivo / Contra Entrega</span>
                  <span className="text-[11px] text-gray-400 mt-1">Paga al recibir</span>
                </label>

                <label
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition text-center ${
                    metodoPago === "TRANSFERENCIA"
                      ? "border-gray-900 bg-gray-50 text-gray-900 font-semibold"
                      : "border-gray-200 hover:border-gray-300 text-gray-600"
                  }`}
                >
                  <input
                    type="radio"
                    name="metodoPago"
                    value="TRANSFERENCIA"
                    checked={metodoPago === "TRANSFERENCIA"}
                    onChange={() => setMetodoPago("TRANSFERENCIA")}
                    className="sr-only"
                  />
                  <Building2 className="w-6 h-6 mb-2 text-blue-600" />
                  <span className="text-sm">Transferencia Bancaria</span>
                  <span className="text-[11px] text-gray-400 mt-1">Pichincha / Guayaquil</span>
                </label>

                <label
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition text-center ${
                    metodoPago === "TARJ_CRED"
                      ? "border-gray-900 bg-gray-50 text-gray-900 font-semibold"
                      : "border-gray-200 hover:border-gray-300 text-gray-600"
                  }`}
                >
                  <input
                    type="radio"
                    name="metodoPago"
                    value="TARJ_CRED"
                    checked={metodoPago === "TARJ_CRED"}
                    onChange={() => setMetodoPago("TARJ_CRED")}
                    className="sr-only"
                  />
                  <CreditCard className="w-6 h-6 mb-2 text-purple-600" />
                  <span className="text-sm">Tarjeta Crédito / Débito</span>
                  <span className="text-[11px] text-gray-400 mt-1">Datafast / Pos</span>
                </label>
              </div>

              <div>
                <Label htmlFor="notas">Notas adicionales para el pedido (Opcional)</Label>
                <Input
                  id="notas"
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  placeholder="Instrucciones especiales de empaque o entrega..."
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary (5 cols) */}
          <div className="lg:col-span-5">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm sticky top-24 space-y-6">
              <h2 className="text-lg font-bold text-gray-900">Resumen del Pedido</h2>

              {/* Items List */}
              <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between text-sm">
                    <div className="flex-1 pr-3">
                      <p className="font-semibold text-gray-900 truncate">{item.name}</p>
                      <p className="text-xs text-gray-400">Cantidad: {item.quantity} × ${item.price.toFixed(2)}</p>
                    </div>
                    <span className="font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-gray-100 pt-4 space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>IVA (15%)</span>
                  <span className="font-medium text-gray-900">${iva.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5"><Truck className="w-4 h-4 text-emerald-600" /> Envío a domicilio</span>
                  <span className="text-emerald-600 font-bold">Gratis</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-extrabold text-gray-900">
                  <span>Total Final</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                  {errorMsg}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition shadow-lg text-base"
              >
                {loading ? "Procesando Pedido..." : `Confirmar y Pagar $${total.toFixed(2)}`}
              </Button>

              <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Compra protegida y garantizada por DetchPlus</span>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
