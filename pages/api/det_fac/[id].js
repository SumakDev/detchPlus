import sequelize from "../../../detch-plus-backend/config/database.js";
import { DET_FAC } from "../../../detch-plus-backend/models/index.js";

export default async function handler(req, res) {
  try {
    const { id } = req.query;

    if (req.method === "GET") {
      const record = await DET_FAC.findByPk(id);
      return record
        ? res.status(200).json(record)
        : res.status(404).json({ message: "No encontrado" });
    }

    if (req.method === "PUT") {
      const [updated] = await DET_FAC.update(req.body, { where: { ID_DET_FAC: id } });
      if (!updated) return res.status(404).json({ message: "No encontrado" });

      const refreshed = await DET_FAC.findByPk(id);
      return res.status(200).json(refreshed);
    }

    if (req.method === "DELETE") {
      const deleted = await DET_FAC.destroy({ where: { ID_DET_FAC: id } });
      return deleted
        ? res.status(200).json({ message: "Eliminado correctamente" })
        : res.status(404).json({ message: "No encontrado" });
    }

    return res.status(405).json({ message: "Método no permitido" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
