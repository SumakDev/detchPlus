import { Router } from "express";
import { requireAuth, denyWebUser } from "../middleware/auth.js";
import {
  getAll,
  getOptions,
  create,
  update,
  updateStatus,
  getOne,
  getDetalle,
  upsertDetalle,
} from "../controllers/servicioTecnico.controller.js";

const router = Router();

// Todas las rutas del panel administrativo requieren sesión y bloquean rol 4 (usuario web)
router.use(requireAuth(), denyWebUser());

// Listado y opciones
router.get("/", getAll);
router.get("/options", getOptions);

// Crear y actualizar servicio técnico
router.post("/", create);            // crea servicio y opcionalmente el detalle (body.detalle)
router.put("/:num", update);         // actualiza datos del servicio
router.patch("/:num/estado", updateStatus); // actualiza solo el estado

// Obtener un servicio puntual (con técnico, cliente y detalle)
router.get("/:num", getOne);

// Endpoints anidados para el DET_SER (1:1 por NUM_SER)
router.get("/:num/detalle", getDetalle);     // obtener detalle por NUM_SER
router.put("/:num/detalle", upsertDetalle);  // crear/actualizar detalle por NUM_SER

export default router;