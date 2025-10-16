import sequelize from "../../../detch-plus-backend/config/database.js";
import { PROVEEDORES } from "../../../detch-plus-backend/models/index.js";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const data = await PROVEEDORES.findAll();
      return res.status(200).json(data);
    }

    if (req.method === "POST") {
      const created = await PROVEEDORES.create(req.body);
      return res.status(201).json(created);
    }

    return res.status(405).json({ message: "Método no permitido" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
