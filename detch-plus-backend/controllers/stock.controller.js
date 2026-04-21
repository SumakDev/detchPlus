import * as stockService from "../services/stock.service.js";

// GET /stock
export async function getAll(req, res) {
  try {
    const data = await stockService.getStock(req.query);
    return res.json(data);
  } catch (error) {
    console.error("stock.getAll", error);
    return res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
}

// GET /stock/resumen
export async function resumen(req, res) {
  try {
    const data = await stockService.getResumen();
    return res.json(data);
  } catch (error) {
    console.error("stock.resumen", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// GET /stock/movimientos/:idPro?
export async function movimientos(req, res) {
  try {
    const { idPro } = req.params;
    const rows = await stockService.getMovimientos(idPro);
    return res.json(rows);
  } catch (error) {
    console.error("stock.movimientos", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// POST /stock/entrada
export async function entrada(req, res) {
  try {
    const row = await stockService.registrarEntrada(req.body || {});
    return res.json(row);
  } catch (error) {
    console.error("stock.entrada", error);
    return res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
}

// POST /stock/salida
export async function salida(req, res) {
  try {
    const row = await stockService.registrarSalida(req.body || {});
    return res.json(row);
  } catch (error) {
    console.error("stock.salida", error);
    return res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
}

// POST /stock/reservar
export async function reservar(req, res) {
  try {
    const row = await stockService.reservar(req.body || {});
    return res.json(row);
  } catch (error) {
    console.error("stock.reservar", error);
    return res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
}

// POST /stock/desreservar
export async function desreservar(req, res) {
  try {
    const row = await stockService.desreservar(req.body || {});
    return res.json(row);
  } catch (error) {
    console.error("stock.desreservar", error);
    return res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
}

// POST /stock/salida-reserva
export async function salidaDesdeReserva(req, res) {
  try {
    const row = await stockService.salidaDesdeReserva(req.body || {});
    return res.json(row);
  } catch (error) {
    console.error("stock.salidaDesdeReserva", error);
    return res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
}

// POST /stock/ajustar
export async function ajustarDisponible(req, res) {
  try {
    const row = await stockService.ajustarDisponible(req.body || {});
    return res.json(row);
  } catch (error) {
    console.error("stock.ajustarDisponible", error);
    return res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
}

// PUT /stock/minmax/:id
export async function actualizarMinMax(req, res) {
  try {
    const { id } = req.params;
    const { min, max } = req.body || {};
    const s = await stockService.actualizarMinMax(id, min, max);
    return res.json(s);
  } catch (error) {
    console.error("stock.actualizarMinMax", error);
    return res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
}

// PUT /stock/ubicacion/:id
export async function actualizarUbicacion(req, res) {
  try {
    const { id } = req.params;
    const { ubicacion } = req.body || {};
    const s = await stockService.actualizarUbicacion(id, ubicacion);
    return res.json(s);
  } catch (error) {
    console.error("stock.actualizarUbicacion", error);
    return res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
}