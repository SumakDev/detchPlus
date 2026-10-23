import {
  FACTURAS,
  DET_FAC,
  EMPLEADOS,
  PRODUCTOS,
  CLIENTES,
  SER_TEC,
  STOCK,
  TECNICOS,
  DET_SER,
  MARCAS,
  MODELOS,
  CATEGORIAS,
} from "../models/index.js";

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
    const pendientes = 0; // Todos los reportes analíticos están generados y disponibles

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
        fecha: new Date().toISOString(),
        estado: "LISTO",
        alertas: stockAgotado > 0 ? `${stockAgotado} productos agotados` : "Stock estable",
      },
      {
        id: "rep-servicio-tecnico",
        nombre: "Rendimiento y Órdenes de Servicio Técnico",
        fecha: new Date().toISOString(),
        estado: "LISTO",
      },
      {
        id: "rep-clientes-actividad",
        nombre: "Reporte de Clientes y Recurrencia",
        fecha: new Date().toISOString(),
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
        stockAgotado,
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
      const facturas = await FACTURAS.findAll({
        include: [
          { model: CLIENTES, as: "cliente", attributes: ["CED_CLI", "NOM_CLI", "APE_CLI", "NUM_CLI", "COR_CLI", "DIR_CLI"] },
          { model: EMPLEADOS, as: "empleado", attributes: ["CED_EMP", "NOM_EMP", "APE_EMP"] },
          {
            model: DET_FAC,
            as: "detalles",
            include: [{ model: PRODUCTOS, as: "producto", attributes: ["ID_PRO", "DES_PRO", "COD_BAR_PRO"] }],
          },
        ],
        order: [["FEC_FAC", "DESC"]],
        limit: 100,
      });
      return res.json(facturas);
    }
    if (tipo === "stock") {
      const stocks = await STOCK.findAll({
        include: [
          {
            model: PRODUCTOS,
            as: "producto",
            attributes: ["ID_PRO", "DES_PRO", "COD_BAR_PRO", "EST_PRO", "ORG_PRO"],
            include: [
              { model: MARCAS, as: "marca", attributes: ["NOM_MAR"], required: false },
              { model: MODELOS, as: "modelo", attributes: ["NOM_MOD"], required: false },
              { model: CATEGORIAS, as: "categoria", attributes: ["NOM_CAT"], required: false },
            ],
          },
        ],
        order: [["CAN_DIS_STO", "ASC"]],
        limit: 100,
      });
      return res.json(stocks);
    }
    if (tipo === "servicios") {
      const servicios = await SER_TEC.findAll({
        include: [
          { model: CLIENTES, as: "cliente", attributes: ["CED_CLI", "NOM_CLI", "APE_CLI", "NUM_CLI"] },
          { model: TECNICOS, as: "tecnico", attributes: ["ID_TEC", "NOM_TEC"] },
          { model: DET_SER, as: "detalle" },
        ],
        order: [["FEC_SER", "DESC"]],
        limit: 100,
      });
      return res.json(servicios);
    }
    if (tipo === "clientes") {
      const clientes = await CLIENTES.findAll({
        order: [["FEC_REG_CLI", "DESC"]],
        limit: 100,
      });
      return res.json(clientes);
    }

    return res.json({ message: "Especifique tipo: ventas, stock, servicios, clientes" });
  } catch (error) {
    console.error("reportes.getDatos error:", error);
    return res.status(500).json({ error: error.message });
  }
}
