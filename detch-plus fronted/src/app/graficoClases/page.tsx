import React from 'react';
import Head from 'next/head';
import Link from "next/link";

interface Field {
  icon: 'pk' | 'fk' | 'regular' | 'index';
  text: string;
}

interface Table {
  name: string;
  emoji: string;
  category: 'core' | 'users' | 'ecommerce' | 'inventory' | 'financial' | 'service' | 'support' | 'system';
  position: { top: number; left: number };
  fields: Field[];
}

const SistemaVentaiPhones: React.FC = () => {
  const tables: Table[] = [
    // PRODUCTOS CORE
    {
      name: 'productos',
      emoji: '📱',
      category: 'core',
      position: { top: 50, left: 50 },
      fields: [
        { icon: 'pk', text: '_id: ObjectId' },
        { icon: 'index', text: 'codigoBarras: String' },
        { icon: 'index', text: 'imei: String' },
        { icon: 'fk', text: 'categoria: ObjectId' },
        { icon: 'fk', text: 'marca: ObjectId' },
        { icon: 'regular', text: 'modelo: String' },
        { icon: 'regular', text: 'descripcion: String' },
        { icon: 'regular', text: 'imagenes: [String]' },
        { icon: 'regular', text: 'origen: Enum' },
        { icon: 'regular', text: 'estado: Enum' },
        { icon: 'regular', text: 'detalles: Object' },
        { icon: 'regular', text: 'stock: Object' },
        { icon: 'regular', text: 'precios: Object' },
        { icon: 'regular', text: 'metadatos: Object' }
      ]
    },
    {
      name: 'categorias',
      emoji: '📂',
      category: 'core',
      position: { top: 50, left: 320 },
      fields: [
        { icon: 'pk', text: '_id: ObjectId' },
        { icon: 'index', text: 'nombre: Enum' },
        { icon: 'regular', text: 'descripcion: String' },
        { icon: 'regular', text: 'activo: Boolean' }
      ]
    },
    {
      name: 'marcas',
      emoji: '🏷️',
      category: 'core',
      position: { top: 50, left: 520 },
      fields: [
        { icon: 'pk', text: '_id: ObjectId' },
        { icon: 'index', text: 'nombre: String' },
        { icon: 'regular', text: 'descripcion: String' },
        { icon: 'regular', text: 'logo: String' },
        { icon: 'regular', text: 'activo: Boolean' }
      ]
    },
    {
      name: 'proveedores',
      emoji: '🏪',
      category: 'core',
      position: { top: 50, left: 720 },
      fields: [
        { icon: 'pk', text: '_id: ObjectId' },
        { icon: 'regular', text: 'nombre: String' },
        { icon: 'index', text: 'ruc: String' },
        { icon: 'regular', text: 'telefono: String' },
        { icon: 'regular', text: 'email: String' },
        { icon: 'regular', text: 'direccion: String' }
      ]
    },
    // USUARIOS Y AUTENTICACIÓN
    {
      name: 'usuarios',
      emoji: '👤',
      category: 'users',
      position: { top: 300, left: 50 },
      fields: [
        { icon: 'pk', text: '_id: ObjectId' },
        { icon: 'index', text: 'username: String' },
        { icon: 'index', text: 'email: String' },
        { icon: 'regular', text: 'passwordHash: String' },
        { icon: 'fk', text: 'rol: ObjectId' },
        { icon: 'regular', text: 'perfil: Object' },
        { icon: 'regular', text: 'direcciones: [Object]' },
        { icon: 'index', text: 'estado: Enum' },
        { icon: 'regular', text: 'seguridad: Object' }
      ]
    },
    {
      name: 'roles',
      emoji: '🔐',
      category: 'users',
      position: { top: 300, left: 320 },
      fields: [
        { icon: 'pk', text: '_id: ObjectId' },
        { icon: 'index', text: 'nombre: String' },
        { icon: 'regular', text: 'descripcion: String' },
        { icon: 'regular', text: 'permisos: Object' },
        { icon: 'regular', text: 'activo: Boolean' }
      ]
    },
    {
      name: 'sesiones',
      emoji: '🔑',
      category: 'users',
      position: { top: 480, left: 50 },
      fields: [
        { icon: 'pk', text: '_id: String' },
        { icon: 'fk', text: 'usuario: ObjectId' },
        { icon: 'regular', text: 'ipAddress: String' },
        { icon: 'regular', text: 'userAgent: String' },
        { icon: 'index', text: 'expiraEn: Date' },
        { icon: 'index', text: 'activa: Boolean' }
      ]
    },
    // E-COMMERCE
    {
      name: 'carrito',
      emoji: '🛒',
      category: 'ecommerce',
      position: { top: 300, left: 520 },
      fields: [
        { icon: 'pk', text: '_id: ObjectId' },
        { icon: 'fk', text: 'usuario: ObjectId' },
        { icon: 'regular', text: 'items: [Object]' },
        { icon: 'regular', text: 'fechaActualizacion: Date' }
      ]
    },
    {
      name: 'pedidos_online',
      emoji: '📦',
      category: 'ecommerce',
      position: { top: 300, left: 720 },
      fields: [
        { icon: 'pk', text: '_id: ObjectId' },
        { icon: 'index', text: 'numeroPedido: String' },
        { icon: 'fk', text: 'usuario: ObjectId' },
        { icon: 'regular', text: 'items: [Object]' },
        { icon: 'regular', text: 'direccionEnvio: Object' },
        { icon: 'regular', text: 'resumen: Object' },
        { icon: 'index', text: 'estadoPedido: Enum' },
        { icon: 'index', text: 'estadoPago: Enum' },
        { icon: 'regular', text: 'envio: Object' }
      ]
    },
    {
      name: 'cupones',
      emoji: '🎫',
      category: 'ecommerce',
      position: { top: 480, left: 520 },
      fields: [
        { icon: 'pk', text: '_id: ObjectId' },
        { icon: 'index', text: 'codigo: String' },
        { icon: 'regular', text: 'nombre: String' },
        { icon: 'regular', text: 'tipoDescuento: Enum' },
        { icon: 'regular', text: 'valorDescuento: Number' },
        { icon: 'index', text: 'fechaInicio: Date' },
        { icon: 'index', text: 'fechaFin: Date' },
        { icon: 'regular', text: 'usosActuales: Number' }
      ]
    },
    {
      name: 'reseñas',
      emoji: '⭐',
      category: 'ecommerce',
      position: { top: 480, left: 720 },
      fields: [
        { icon: 'pk', text: '_id: ObjectId' },
        { icon: 'fk', text: 'producto: ObjectId' },
        { icon: 'fk', text: 'usuario: ObjectId' },
        { icon: 'index', text: 'calificacion: Number' },
        { icon: 'regular', text: 'titulo: String' },
        { icon: 'regular', text: 'comentario: String' },
        { icon: 'regular', text: 'verificada: Boolean' },
        { icon: 'index', text: 'estado: Enum' }
      ]
    },
    // INVENTARIO
    {
      name: 'stock (embebido)',
      emoji: '📊',
      category: 'inventory',
      position: { top: 660, left: 50 },
      fields: [
        { icon: 'regular', text: 'cantidadDisponible: Number' },
        { icon: 'regular', text: 'cantidadReservada: Number' },
        { icon: 'regular', text: 'ubicacion: String' },
        { icon: 'regular', text: 'stockMinimo: Number' },
        { icon: 'regular', text: 'stockMaximo: Number' }
      ]
    },
    {
      name: 'movimientos_inventario',
      emoji: '📈',
      category: 'inventory',
      position: { top: 660, left: 320 },
      fields: [
        { icon: 'pk', text: '_id: ObjectId' },
        { icon: 'fk', text: 'producto: ObjectId' },
        { icon: 'index', text: 'tipo: Enum' },
        { icon: 'regular', text: 'cantidad: Number' },
        { icon: 'regular', text: 'motivo: String' },
        { icon: 'regular', text: 'numeroDocumento: String' },
        { icon: 'fk', text: 'empleado: ObjectId' },
        { icon: 'index', text: 'fechaMovimiento: Date' }
      ]
    },
    // FINANCIERO
    {
      name: 'facturas',
      emoji: '🧾',
      category: 'financial',
      position: { top: 660, left: 520 },
      fields: [
        { icon: 'pk', text: '_id: ObjectId' },
        { icon: 'index', text: 'numeroFactura: String' },
        { icon: 'fk', text: 'cliente: ObjectId' },
        { icon: 'fk', text: 'empleado: ObjectId' },
        { icon: 'regular', text: 'items: [Object]' },
        { icon: 'regular', text: 'subtotal: Number' },
        { icon: 'regular', text: 'iva: Number' },
        { icon: 'regular', text: 'total: Number' },
        { icon: 'index', text: 'estado: Enum' }
      ]
    },
    {
      name: 'evaluaciones_parte_pago',
      emoji: '💰',
      category: 'financial',
      position: { top: 840, left: 520 },
      fields: [
        { icon: 'pk', text: '_id: ObjectId' },
        { icon: 'fk', text: 'cliente: ObjectId' },
        { icon: 'fk', text: 'producto: ObjectId' },
        { icon: 'fk', text: 'empleado: ObjectId' },
        { icon: 'regular', text: 'evaluacion: Object' },
        { icon: 'index', text: 'estado: Enum' },
        { icon: 'regular', text: 'valorFinal: Number' }
      ]
    },
    {
      name: 'movimientos_financieros',
      emoji: '💳',
      category: 'financial',
      position: { top: 840, left: 320 },
      fields: [
        { icon: 'pk', text: '_id: ObjectId' },
        { icon: 'index', text: 'tipo: Enum' },
        { icon: 'regular', text: 'monto: Number' },
        { icon: 'regular', text: 'descripcion: String' }
      ]
    },
    // SERVICIO TÉCNICO
    {
      name: 'servicios',
      emoji: '🔧',
      category: 'service',
      position: { top: 660, left: 920 },
      fields: [
        { icon: 'pk', text: '_id: ObjectId' },
        { icon: 'fk', text: 'cliente: ObjectId' },
        { icon: 'fk', text: 'tecnico: ObjectId' },
        { icon: 'regular', text: 'descripcion: String' },
        { icon: 'index', text: 'estado: Enum' },
        { icon: 'regular', text: 'costo: Number' }
      ]
    },
    {
      name: 'tecnicos',
      emoji: '👨‍🔧',
      category: 'service',
      position: { top: 840, left: 920 },
      fields: [
        { icon: 'pk', text: '_id: ObjectId' },
        { icon: 'regular', text: 'nombre: String' },
        { icon: 'regular', text: 'especialidad: String' },
        { icon: 'regular', text: 'telefono: String' }
      ]
    },
    // SOPORTE
    {
      name: 'clientes',
      emoji: '👥',
      category: 'support',
      position: { top: 840, left: 50 },
      fields: [
        { icon: 'pk', text: '_id: ObjectId' },
        { icon: 'regular', text: 'nombre: String' },
        { icon: 'index', text: 'cedula: String' },
        { icon: 'regular', text: 'telefono: String' },
        { icon: 'regular', text: 'email: String' }
      ]
    },
    {
      name: 'empleados',
      emoji: '👨‍💼',
      category: 'support',
      position: { top: 1020, left: 50 },
      fields: [
        { icon: 'pk', text: '_id: ObjectId' },
        { icon: 'regular', text: 'nombre: String' },
        { icon: 'index', text: 'cedula: String' },
        { icon: 'regular', text: 'puesto: String' },
        { icon: 'regular', text: 'salario: Number' }
      ]
    },
    // SISTEMA
    {
      name: 'notificaciones',
      emoji: '🔔',
      category: 'system',
      position: { top: 1020, left: 320 },
      fields: [
        { icon: 'pk', text: '_id: ObjectId' },
        { icon: 'fk', text: 'usuario: ObjectId' },
        { icon: 'regular', text: 'mensaje: String' },
        { icon: 'regular', text: 'leida: Boolean' }
      ]
    },
    {
      name: 'observaciones',
      emoji: '📝',
      category: 'system',
      position: { top: 1020, left: 520 },
      fields: [
        { icon: 'pk', text: '_id: ObjectId' },
        { icon: 'regular', text: 'tipo: String' },
        { icon: 'regular', text: 'descripcion: String' },
        { icon: 'regular', text: 'fecha: Date' }
      ]
    }
  ];

  const categoryColors = {
    core: { bg: '#e74c3c', text: 'Productos Core' },
    users: { bg: '#3498db', text: 'Usuarios & Auth' },
    ecommerce: { bg: '#27ae60', text: 'E-Commerce' },
    inventory: { bg: '#f39c12', text: 'Inventario' },
    financial: { bg: '#9b59b6', text: 'Financiero' },
    service: { bg: '#1abc9c', text: 'Servicio Técnico' },
    support: { bg: '#34495e', text: 'Soporte' },
    system: { bg: '#8e44ad', text: 'Sistema' }
  };

  const iconColors = {
    pk: '#e74c3c',
    fk: '#3498db',
    regular: '#95a5a6',
    index: '#f39c12'
  };

  const renderTable = (table: Table) => (
    <div
      key={table.name}
      className="absolute bg-white border-2 rounded-xl min-w-56 shadow-lg transition-transform hover:-translate-y-1 hover:shadow-xl"
      style={{
        top: `${table.position.top}px`,
        left: `${table.position.left}px`,
        borderColor: categoryColors[table.category].bg
      }}
    >
      <div
        className="p-4 font-bold text-sm text-center text-white rounded-t-lg flex items-center justify-center gap-2"
        style={{ backgroundColor: categoryColors[table.category].bg }}
      >
        <span>{table.emoji}</span>
        <span>{table.name}</span>
      </div>
      <div className="p-4 max-h-80 overflow-y-auto">
        {table.fields.map((field, index) => (
          <div
            key={index}
            className="flex items-center py-1.5 text-xs border-b border-gray-100 last:border-b-0"
          >
            <div
              className="w-4 h-4 mr-2 rounded"
              style={{ backgroundColor: iconColors[field.icon] }}
            />
            <span>{field.text}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <Head>
        <title>Diagrama ER - Sistema de Venta de iPhones</title>
        <meta name="description" content="Diagrama de Base de Datos Mysql - Arquitectura Completa" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-5">
        <Link href="../" className="hover:text-blue-600">
            Inicio
        </Link>
        <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-800 to-blue-600 text-white p-8 text-center">
            <h1 className="text-4xl font-bold mb-3 text-shadow-lg">
              🍎 Sistema de Venta de iPhones
            </h1>
            <p className="text-xl opacity-90">
              Diagrama de Base de Datos MySQL - Arquitectura Completa
            </p>
          </div>

          {/* Legend */}
          <div className="p-10 bg-gray-50">
            <div className="flex justify-center gap-6 mb-8 flex-wrap">
              {Object.entries(categoryColors).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center gap-3 px-5 py-3 bg-white rounded-full shadow-md"
                >
                  <div
                    className="w-5 h-5 rounded-full"
                    style={{ backgroundColor: value.bg }}
                  />
                  <span className="font-medium">{value.text}</span>
                </div>
              ))}
            </div>

            {/* Diagram */}
            <div className="relative bg-white rounded-2xl p-8 shadow-inner min-h-[1400px] overflow-auto">
              {tables.map(renderTable)}
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-xl text-center shadow-lg">
                <h3 className="text-3xl font-bold mb-2">{tables.length}</h3>
                <p className="opacity-90">Colecciones Totales</p>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white p-6 rounded-xl text-center shadow-lg">
                <h3 className="text-3xl font-bold mb-2">
                  {Object.keys(categoryColors).length}
                </h3>
                <p className="opacity-90">Módulos del Sistema</p>
              </div>
              <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6 rounded-xl text-center shadow-lg">
                <h3 className="text-3xl font-bold mb-2">
                  {tables.reduce((acc, table) => acc + table.fields.length, 0)}
                </h3>
                <p className="opacity-90">Campos Totales</p>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6 rounded-xl text-center shadow-lg">
                <h3 className="text-3xl font-bold mb-2">MySQL</h3>
                <p className="opacity-90">Base de Datos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Responsive Mobile View */}
        <div className="block lg:hidden mt-8">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
              Vista Móvil - Colecciones
            </h2>
            <div className="space-y-4">
              {Object.entries(categoryColors).map(([category, config]) => (
                <div key={category} className="bg-gray-50 rounded-lg p-4">
                  <h3
                    className="font-bold text-lg mb-3 text-white p-2 rounded"
                    style={{ backgroundColor: config.bg }}
                  >
                    {config.text}
                  </h3>
                  <div className="grid gap-2">
                    {tables
                      .filter(table => table.category === category)
                      .map(table => (
                        <div
                          key={table.name}
                          className="bg-white rounded-lg p-3 border shadow-sm"
                        >
                          <div className="font-semibold text-sm text-gray-800 mb-2">
                            {table.emoji} {table.name}
                          </div>
                          <div className="text-xs text-gray-600">
                            {table.fields.length} campos
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SistemaVentaiPhones;