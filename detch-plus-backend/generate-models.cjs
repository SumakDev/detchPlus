const fs = require("fs");
const path = require("path");

// Utilidad: normalizar a rutas POSIX para imports ESM
const toPosix = (p) => p.split(path.sep).join("/");

// Directorios base
const BACKEND_DIR = __dirname; // .../detch-plus backend
const ROOT_DIR = path.resolve(BACKEND_DIR, ".."); // raíz del proyecto (donde está pages/)
const modelsPath = path.join(BACKEND_DIR, "models");
const apiPath = path.join(ROOT_DIR, "pages", "api");

// Validaciones y creación de carpetas
if (!fs.existsSync(modelsPath)) {
  console.error("❌ No se encontró la carpeta de modelos:", modelsPath);
  console.error("Sugerencia: asegúrate de que exista 'models' dentro de 'detch-plus backend'.");
  process.exit(1);
}
if (!fs.existsSync(apiPath)) {
  console.warn("⚠️ No existe pages/api, creando:", apiPath);
  fs.mkdirSync(apiPath, { recursive: true });
}

// Generadores de archivos API
function generateIndexApi(modelName, importBase) {
  return `import sequelize from "${importBase}/config/database.js";
import { ${modelName} } from "${importBase}/models/index.js";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const data = await ${modelName}.findAll();
      return res.status(200).json(data);
    }

    if (req.method === "POST") {
      const created = await ${modelName}.create(req.body);
      return res.status(201).json(created);
    }

    return res.status(405).json({ message: "Método no permitido" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
`;
}

function generateIdApi(modelName, pkName, importBase) {
  return `import sequelize from "${importBase}/config/database.js";
import { ${modelName} } from "${importBase}/models/index.js";

export default async function handler(req, res) {
  try {
    const { id } = req.query;

    if (req.method === "GET") {
      const record = await ${modelName}.findByPk(id);
      return record
        ? res.status(200).json(record)
        : res.status(404).json({ message: "No encontrado" });
    }

    if (req.method === "PUT") {
      const [updated] = await ${modelName}.update(req.body, { where: { ${pkName}: id } });
      if (!updated) return res.status(404).json({ message: "No encontrado" });

      const refreshed = await ${modelName}.findByPk(id);
      return res.status(200).json(refreshed);
    }

    if (req.method === "DELETE") {
      const deleted = await ${modelName}.destroy({ where: { ${pkName}: id } });
      return deleted
        ? res.status(200).json({ message: "Eliminado correctamente" })
        : res.status(404).json({ message: "No encontrado" });
    }

    return res.status(405).json({ message: "Método no permitido" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
`;
}

function generateApiCrud(modelName, pkName = "id") {
  const dirPath = path.join(apiPath, modelName.toLowerCase());
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });

  // Calculamos rutas de import relativas al archivo generado
  // Desde pages/api/<modelo>/ a la carpeta backend
  const relFromApiDirToBackend = toPosix(path.relative(dirPath, BACKEND_DIR)); // ej: ../../detch-plus backend

  fs.writeFileSync(path.join(dirPath, "index.js"), generateIndexApi(modelName, relFromApiDirToBackend), "utf8");
  fs.writeFileSync(path.join(dirPath, "[id].js"), generateIdApi(modelName, pkName, relFromApiDirToBackend), "utf8");

  console.log(`✅ API creada: /api/${modelName.toLowerCase()} (PK: ${pkName})`);
}

// Detecta modelos .js y evita index.js
const modelFiles = fs
  .readdirSync(modelsPath)
  .filter((f) => f.endsWith(".js") && f !== "index.js");

// Mapeo de PKs según tu DDL
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
  NOTIF: "ID_NOTIF",
};

// Genera APIs para cada modelo
modelFiles.forEach((file) => {
  const modelName = path.basename(file, ".js"); // p.ej. CLIENTES
  const pkName = pkMap[modelName.toUpperCase()] || "id";
  generateApiCrud(modelName, pkName);
});

console.log("\n📁 modelsPath:", modelsPath);
console.log("📁 apiPath:", apiPath);