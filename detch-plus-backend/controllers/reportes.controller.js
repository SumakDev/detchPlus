import { FACTURAS, PRODUCTOS, CLIENTES, SER_TEC, STOCK } from "../models/index.js";

// GET /api/reportes/resumen
export async function getResumen(req, res) {
  try {
    const [facturasCount, productosCount, clientesCount, serviciosCount, stockAgotado] = await Promise.all([
      FACTURAS.count(),
      PRODUCTOS.count(),
      CLIENTES.count(),
      SER_TEC.count(),
      STOCK.count({ where: { CAN_DIS_STO: 0 } }),
    ]);

    const generadosMes = (facturasCount > 0 ? 1 : 0) + (serviciosCount > 0 ? 1 : 0) + 2;
    const pendientes = stockAgotado > 0 ? 1 : 0;

    const recientes = [
      {
        id: "rep-ventas-mes",
        nombre: "Informe de Ventas y Facturación Mensual",
        fecha: new Date().toISOString(),
        estado: "LISTO",
      },
      {
        id: "rep-inventario-stock",
        nombre: "Auditoría de Existencias y Stock Crítico",
        fecha: new Date(Date.now() - 3600000 * 24).toISOString(),
        estado: stockAgotado > 0 ? "PENDIENTE" : "LISTO",
      },
      {
        id: "rep-servicio-tecnico",
        nombre: "Rendimiento y Órdenes de Servicio Técnico",
        fecha: new Date(Date.now() - 3600000 * 48).toISOString(),
        estado: "LISTO",
      },
      {
        id: "rep-clientes-actividad",
        nombre: "Reporte de Clientes y Recurrencia",
        fecha: new Date(Date.now() - 3600000 * 72).toISOString(),
        estado: "LISTO",
      },
    ];

    return res.json({
      generadosMes,
      pendientes,
      recientes,
      stats: {
        facturas: facturasCount,
        productos: productosCount,
        clientes: clientesCount,
        servicios: serviciosCount,
      },
    });
  } catch (error) {
    console.error("reportes.getResumen error:", error);
    return res.status(500).json({ error: "Error calculando resumen de reportes" });
  }
}

// GET /api/reportes/datos
export async function getDatos(req, res) {
  try {
    const { tipo } = req.query; // "ventas", "stock", "servicios", "clientes"
    if (tipo === "ventas") {
      const facturas = await FACTURAS.findAll({ order: [["FEC_FAC", "DESC"]], limit: 50 });
      return res.json(facturas);
    }
    if (tipo === "stock") {
      const stocks = await STOCK.findAll({ include: [{ model: PRODUCTOS, as: "producto" }], limit: 50 });
      return res.json(stocks);
    }
    if (tipo === "servicios") {
      const servicios = await SER_TEC.findAll({ order: [["FEC_SER", "DESC"]], limit: 50 });
      return res.json(servicios);
    }
    if (tipo === "clientes") {
      const clientes = await CLIENTES.findAll({ order: [["FEC_REG_CLI", "DESC"]], limit: 50 });
      return res.json(clientes);
    }

    return res.json({ message: "Especifique tipo: ventas, stock, servicios, clientes" });
  } catch (error) {
    console.error("reportes.getDatos error:", error);
    return res.status(500).json({ error: error.message });
  }
}
