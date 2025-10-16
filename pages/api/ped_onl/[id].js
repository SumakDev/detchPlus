import sequelize from "../../../detch-plus-backend/config/database.js";
import { PED_ONL } from "../../../detch-plus-backend/models/index.js";

export default async function handler(req, res) {
  try {
    const { id } = req.query;

    if (req.method === "GET") {
      const record = await PED_ONL.findByPk(id);
      return record
        ? res.status(200).json(record)
        : res.status(404).json({ message: "No encontrado" });
    }

    if (req.method === "PUT") {
      const [updated] = await PED_ONL.update(req.body, { where: { ID_PED_ONL: id } });
      if (!updated) return res.status(404).json({ message: "No encontrado" });

      const refreshed = await PED_ONL.findByPk(id);
      return res.status(200).json(refreshed);
    }

    if (req.method === "DELETE") {
      const deleted = await PED_ONL.destroy({ where: { ID_PED_ONL: id } });
      return deleted
        ? res.status(200).json({ message: "Eliminado correctamente" })
        : res.status(404).json({ message: "No encontrado" });
    }

    return res.status(405).json({ message: "Método no permitido" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
