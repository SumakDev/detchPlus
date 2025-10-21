#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const BACKEND_DIR = __dirname;
const modelsPath = path.resolve(BACKEND_DIR, "models");
const controllersPath = path.resolve(BACKEND_DIR, "controllers");
const routesPath = path.resolve(BACKEND_DIR, "routes");

const args = process.argv.slice(2);
const RUN = args.includes("--run");
const FORCE = args.includes("--force");

const pkMap = {
  CATEGORIAS: "ID_CAT",
  MARCAS: "ID_MAR",
  MODELOS: "ID_MOD",
  PROVEEDORES: "ID_PRV",
  EMPLEADOS: "CED_EMP",
  CLIENTES: "CED_CLI",
  TECNICOS: "ID_TEC",
  PRODUCTOS: "ID_PRO",
  DET_TELE: "ID_PRO",
  DET_REL: "ID_PRO",
  DET_CON: "ID_PRO",
  STOCK: "ID_PRO",
  PRECIOS: "ID_PRE",
  MOV_INV: "ID_MOV",
  FACTURAS: "NUM_FAC",
  DET_FAC: "ID_DET_FAC",
  EVA_PAR_PAG: "ID_EVA_PAR",
  PAR_PAG_APL: "ID_PAR_PAG",
  SER_TEC: "NUM_SER",
  DET_SER: "ID_DET_SER",
  OBS: "ID_OBS",
  MOV_FIN: "ID_MOV_FIN",
  ROLES: "ID_ROL",
  USUARIOS: "ID_USU",
  DIR_USU: "ID_DIR_USU",
  SES_USU: "ID_SES_USU",
  CAR_COM: "ID_CAR_COM",
  LIS_DES: "ID_LIS_DES",
  PED_ONL: "ID_PED_ONL",
  DET_PED_ONL: "ID_DET_PED_ONL",
  CUPONES: "ID_CUP",
  CUP_USO: "ID_CUP_USO",
  RES_PRO: "ID_RES_PRO",
  LOG_ACT_USU: "ID_LOG_ACT_USU",
  NOTIF: "ID_NOTIF"
};

function ensureDir(p) { if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); }
function sanitize(name) {
  return name.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "_").replace(/_+/g, "_").replace(/^_+|_+$/g, "");
}
function write(file, content) {
  if (!RUN) return console.log(`[DRY-RUN] escribiría: ${file}`);
  if (fs.existsSync(file) && !FORCE) return console.log(`⚠️ Omitido (ya existe): ${file}`);
  fs.writeFileSync(file, content, "utf8");
  console.log(`✅ Escrito: ${file}`);
}

function controllerTemplate(modelName, pkName) {
  return `import { ${modelName} } from "../models/index.js";

export async function getAll(req, res) {
  try {
    const data = await ${modelName}.findAll();
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getOne(req, res) {
  try {
    const data = await ${modelName}.findByPk(req.params.id);
    return data ? res.json(data) : res.status(404).json({ error: "No encontrado" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function create(req, res) {
  try {
    const created = await ${modelName}.create(req.body);
    return res.status(201).json(created);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function update(req, res) {
  try {
    const [updated] = await ${modelName}.update(req.body, { where: { ${pkName}: req.params.id } });
    if (!updated) return res.status(404).json({ error: "No encontrado" });
    const refreshed = await ${modelName}.findByPk(req.params.id);
    return res.json(refreshed);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function remove(req, res) {
  try {
    const deleted = await ${modelName}.destroy({ where: { ${pkName}: req.params.id } });
    return deleted ? res.json({ message: "Eliminado correctamente" }) : res.status(404).json({ error: "No encontrado" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
`;
}

function routeTemplate(modelName) {
  const lower = modelName.toLowerCase();
  return `import { Router } from "express";
import * as ${lower}Controller from "../controllers/${lower}.controller.js";

const router = Router();

router.get("/", ${lower}Controller.getAll);
router.get("/:id", ${lower}Controller.getOne);
router.post("/", ${lower}Controller.create);
router.put("/:id", ${lower}Controller.update);
router.delete("/:id", ${lower}Controller.remove);

export default router;
`;
}

(function main() {
  console.log("🛠 Generador Express ESM");
  console.log("RUN:", RUN, "FORCE:", FORCE);
  if (!fs.existsSync(modelsPath)) {
    console.error("❌ No existe carpeta models:", modelsPath);
    process.exit(1);
  }
  ensureDir(controllersPath);
  ensureDir(routesPath);

  const modelFiles = fs.readdirSync(modelsPath).filter(f => f.endsWith(".js") && f !== "index.js");
  if (modelFiles.length === 0) {
    console.warn("⚠️ No se encontraron modelos .js en models/");
    process.exit(0);
  }

  const routeImports = [];
  const routeUses = [];

  for (const file of modelFiles) {
    const raw = path.basename(file, ".js"); // p.ej. CLIENTES
    const sanitized = sanitize(raw);
    if (!sanitized) {
      console.warn(`⚠️ Nombre inválido, omitido: ${raw}`);
      continue;
    }
    const pkName = pkMap[raw.toUpperCase()] || "id";
    const controllerFile = path.join(controllersPath, `${sanitized.toLowerCase()}.controller.js`);
    const routeFile = path.join(routesPath, `${sanitized.toLowerCase()}.routes.js`);

    write(controllerFile, controllerTemplate(raw, pkName));
    write(routeFile, routeTemplate(raw));

    const varName = `${sanitized.toLowerCase()}Router`;
    routeImports.push(`import ${varName} from "./${sanitized.toLowerCase()}.routes.js";`);
    routeUses.push(`  app.use("/api/${sanitized.toLowerCase()}", ${varName});`);
  }

  const routesIndex = `// routes/index.js (ESM)
${routeImports.join("\n")}

export default function registerRoutes(app) {
${routeUses.join("\n")}
}
`;
  write(path.join(routesPath, "index.js"), routesIndex);

  console.log("✔️ Listo.");
})();