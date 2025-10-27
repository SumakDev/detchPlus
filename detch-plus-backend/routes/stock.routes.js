import { Router } from "express";
import {
  getAll,
  resumen,
  movimientos,
  entrada,
  salida,
  reservar,
  desreservar,
  salidaDesdeReserva,
  ajustarDisponible,
  actualizarMinMax,
  actualizarUbicacion,
} from "../controllers/stock.controller.js";

const router = Router();

router.get("/", getAll);
router.get("/resumen", resumen);
router.get("/movimientos/:idPro?", movimientos);

router.post("/entrada", entrada);
router.post("/salida", salida);
router.post("/reservar", reservar);
router.post("/desreservar", desreservar);
router.post("/salida-reserva", salidaDesdeReserva);
router.post("/ajustar", ajustarDisponible);

router.put("/minmax/:id", actualizarMinMax);
router.put("/ubicacion/:id", actualizarUbicacion);

export default router;