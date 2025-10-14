const fs = require("fs");
const path = require("path");

// Ajusta las rutas según tu estructura real
const modelsPath = path.resolve(__dirname, "../../detch-plus backend/models");
const apiPath = path.resolve(__dirname, "../../pages/api");

function generateIndexApi(modelName) {
  return `import sequelize from "../../../detch-plus backend/config/database";
import { ${modelName} } from "../../../detch-plus backend/models";

export default async function handler(req, res) {
  try {
    await sequelize.authenticate();

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

function generateIdApi(modelName, pkName) {
  return `import sequelize from "../../../detch-plus backend/config/database";
import { ${modelName} } from "../../../detch-plus backend/models";

export default async function handler(req, res) {
  try {
    await sequelize.authenticate();
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

  fs.writeFileSync(path.join(dirPath, "index.js"), generateIndexApi(modelName), "utf8");
  fs.writeFileSync(path.join(dirPath, "[id].js"), generateIdApi(modelName, pkName), "utf8");

  console.log(`✅ API creada: /api/${modelName.toLowerCase()}`);
}

// Detecta modelos
const modelFiles = fs.readdirSync(modelsPath).filter(f => f.endsWith(".js"));
modelFiles.forEach(file => {
  const modelName = path.basename(file, ".js");
  // PK personalizada si aplica
  const pkMap = {
    CATEGORIAS: "ID_CAT",
    MARCAS: "ID_MAR",
    PROVEEDORES: "ID_PRV",
    EMPLEADOS: "CED_EMP",
    CLIENTES: "CED_CLI",
    TECNICOS: "ID_TEC",
    PRODUCTOS: "ID_PRO",
    STOCK: "ID_PRO",
    PRECIOS: "ID_PRECIO",
    MOVIMIENTOS_INVENTARIO: "ID_MOV",
    FACTURAS: "NUM_FAC",
    DETALLE_FACTURA: "ID_DETALLE",
    // ... agrega los demás según tu BD
  };
  const pkName = pkMap[modelName.toUpperCase()] || "id";
  generateApiCrud(modelName, pkName);
});