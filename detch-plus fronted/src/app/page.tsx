"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, ShoppingBag, Apple, Star, Sparkles } from "lucide-react";
import LoginModal from "@/components/auth/LoginModal";
import RegisterModal from "@/components/auth/RegisterModal";

export default function Home() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [cartCount] = useState(2);

  const products = [
    {
      id: 1,
      name: "iPhone 15 Pro Max",
      subtitle: "Titanio. Tan resistente. Tan ligero. Tan Pro.",
      price: "$1,199",
      originalPrice: null,
      badge: "Nuevo",
      badgeColor: "bg-blue-600",
      status: "En stock",
      statusColor: "text-green-600",
      image: "/images/iphone-15-pro-max.png",
      features: ["Pantalla 6.7\" Super Retina XDR", "Sistema de cámaras Pro", "Chip A17 Pro"],
      colors: ["#8A8A8E", "#F5F5DC", "#2C2C2C", "#C9B037"],
      category: "Pro Max"
    },
    {
      id: 2,
      name: "iPhone 15 Plus",
      subtitle: "Pantalla grande. Batería aún más grande.",
      price: "$899",
      originalPrice: null,
      badge: null,
      badgeColor: "",
      status: "En stock",
      statusColor: "text-green-600",
      image: "/images/iphone-15-plus.png",
      features: ["Pantalla 6.7\" Super Retina XDR", "Sistema de cámaras avanzado", "Chip A16 Bionic"],
      colors: ["#FFB6C1", "#87CEEB", "#030303ff", "#90EE90"],
      category: "Plus"
    },
    {
      id: 3,
      name: "iPhone 15",
      subtitle: "Nuevo. Mejorado. Extraordinario.",
      price: "$799",
      originalPrice: null,
      badge: null,
      badgeColor: "",
      status: "Stock limitado",
      statusColor: "text-yellow-600",
      image: "/images/iphone15.png",
      features: ["Pantalla 6.1\" Super Retina XDR", "Sistema de cámaras avanzado", "Chip A16 Bionic"],
      colors: ["#FFB6C1", "#90EE90", "#87CEEB", "#FFC0CB"],
      category: ""
    },
    {
      id: 4,
      name: "iPhone 14",
      subtitle: "Tan impresionante. Tan capaz. Tan querido.",
      price: "$599",
      originalPrice: "$699",
      badge: "Oferta",
      badgeColor: "bg-red-600",
      status: "En stock",
      statusColor: "text-green-600",
      image: "/images/iphone14.png",
      features: ["Pantalla 6.1\" Super Retina XDR", "Sistema de cámaras dual", "Chip A15 Bionic"],
      colors: ["#800080", "#87CEEB", "#2C2C2C", "#FF69B4"],
      category: ""
    },
    {
      id: 5,
      name: "iPhone SE",
      subtitle: "Mucha potencia. Fácil de usar. Fácil de amar.",
      price: "$429",
      originalPrice: null,
      badge: "Mejor precio",
      badgeColor: "bg-green-600",
      status: "En stock",
      statusColor: "text-green-600",
      image: "/images/iphone-se.png",
      features: ["Pantalla 4.7\" Retina HD", "Cámara de 12MP", "Chip A15 Bionic"],
      colors: ["#2C2C2C", "#FFFFFF", "#FF0000"],
      category: "SE"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
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
              <Link href="#sobre-nosotros" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Sobre nosotros
              </Link>
              <Link href="#soporte" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Soporte
              </Link>
            </div>

            {/* Acciones de usuario */}
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
                <Search className="h-5 w-5" />
              </button>
              
              <button
                onClick={() => setIsLoginOpen(true)}
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Iniciar Sesión
              </button>

              <button className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Espaciador para navbar fija */}
      <div className="h-16"></div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-[70vh] flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                El futuro está en
                <span className="block text-blue-600">tus manos</span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                Descubre la nueva generación de iPhones con tecnología revolucionaria 
                y diseño excepcional que redefine la experiencia móvil.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="#productos"
                  className="bg-gray-900 text-white px-8 py-4 rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg text-center"
                >
                  Explorar productos
                </Link>
                
                <button className="border-2 border-gray-900 text-gray-900 px-8 py-4 rounded-lg font-semibold hover:bg-gray-900 hover:text-white transition-all duration-300 hover:transform hover:-translate-y-1">
                  Ver especificaciones
                </button>
              </div>
            </div>

            <div className="text-center lg:text-right">
              <div className="relative">
                <Image
                  src="/images/iphone-hero.png"
                  alt="iPhone 15 Pro en color titanio natural"
                  width={400}
                  height={500}
                  className="mx-auto lg:ml-auto object-contain"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-3xl -z-10"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Catálogo de Productos */}
      <main className="py-16" id="productos">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header de sección */}
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Catálogo de iPhones
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Elige el iPhone perfecto para tu estilo de vida
            </p>
          </div>

          {/* Grid de productos */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <article key={product.id} className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:transform hover:-translate-y-2 transition-all duration-300">
                
                {/* Imagen del producto */}
                <div className="relative bg-gray-50 h-80 flex items-center justify-center overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={250}
                    height={300}
                    className="object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-4 right-4 space-y-2">
                    {product.badge && (
                      <span className={`inline-block px-3 py-1 rounded-full text-white text-sm font-medium ${product.badgeColor}`}>
                        {product.badge}
                      </span>
                    )}
                  </div>

                  {product.category && (
                    <div className="absolute top-4 left-4">
                      <span className="inline-block px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-sm font-medium">
                        {product.category}
                      </span>
                    </div>
                  )}
                </div>

                {/* Contenido de la card */}
                <div className="p-6 space-y-4">
                  
                  {/* Título y descripción */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{product.subtitle}</p>
                  </div>

                  {/* Características */}
                  <ul className="space-y-1">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <Star className="h-3 w-3 text-gray-400 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* Precio y estado */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      {product.originalPrice && (
                        <span className="text-sm text-gray-400 line-through">{product.originalPrice}</span>
                      )}
                      <span className="text-2xl font-bold text-gray-900">{product.price}</span>
                      <span className="text-sm text-gray-600">/desde</span>
                    </div>
                    <span className={`text-sm font-medium ${product.statusColor}`}>
                      {product.status}
                    </span>
                  </div>

                  {/* Colores */}
                  <div className="flex space-x-2">
                    {product.colors.map((color, index) => (
                      <button
                        key={index}
                        className="w-6 h-6 rounded-full border-2 border-gray-200 hover:border-gray-400 transition-colors"
                        style={{ backgroundColor: color }}
                        aria-label={`Color ${index + 1}`}
                      />
                    ))}
                  </div>

                  {/* Botones de acción */}
                  <div className="space-y-3 pt-4">
                    <button className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
                      Agregar al carrito
                    </button>
                    <button className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                      Más información
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>

      {/* Sección adicional de características */}
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              ¿Por qué elegir DetchPlus?
            </h2>
            <p className="text-xl text-gray-300">
              Tu destino confiable para los últimos productos Apple
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <Sparkles className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold">Productos Originales</h3>
              <p className="text-gray-300">Garantía oficial Apple en todos nuestros productos</p>
            </div>

            <div className="text-center space-y-4">
              <div className="bg-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <ShoppingBag className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold">Envío Gratuito</h3>
              <p className="text-gray-300">Envío gratis en compras mayores a $500</p>
            </div>

            <div className="text-center space-y-4">
              <div className="bg-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <Star className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold">Soporte 24/7</h3>
              <p className="text-gray-300">Atención al cliente especializada siempre disponible</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
            
            {/* Información de la empresa */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center space-x-2">
                <Apple className="h-6 w-6" />
                <span className="text-xl font-bold">DetchPlus</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Tu destino confiable para los últimos productos Apple. 
                Calidad excepcional y servicio al cliente de primera clase.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Facebook</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Twitter</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Instagram</a>
              </div>
            </div>

            {/* Enlaces de productos */}
            <div>
              <h4 className="font-semibold mb-4">Productos</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">iPhone</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">iPad</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Mac</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Apple Watch</Link></li>
              </ul>
            </div>

            {/* Enlaces de soporte */}
            <div>
              <h4 className="font-semibold mb-4">Soporte</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Centro de ayuda</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Garantía</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Reparaciones</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Contacto</Link></li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="font-semibold mb-4">Newsletter</h4>
              <p className="text-gray-400 text-sm mb-4">
                Recibe las últimas noticias y ofertas
              </p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Tu email"
                  className="flex-1 px-3 py-2 bg-gray-800 text-white rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="bg-blue-600 px-4 py-2 rounded-r-lg hover:bg-blue-700 transition-colors">
                  →
                </button>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 DetchPlus. Todos los derechos reservados.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacidad</Link>
              <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Términos</Link>
              <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>

      <button onClick={() => setIsLoginOpen(true)} className="text-gray-600 hover:text-gray-900 font-medium">
        Iniciar Sesión
      </button>

            {/* Modales */}
      <LoginModal
        open={isLoginOpen}
        setOpen={setIsLoginOpen}
        onOpenRegister={() => setIsRegisterOpen(true)}
      />
      <RegisterModal
        open={isRegisterOpen}
        setOpen={setIsRegisterOpen}
        onOpenLogin={() => setIsLoginOpen(true)}
      />
    </div>
  );
}