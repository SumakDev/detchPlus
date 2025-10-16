import sequelize from "../../../detch-plus-backend/config/database.js";
import { DET_TELE } from "../../../detch-plus-backend/models/index.js";

export default async function handler(req, res) {
  try {
    const { id } = req.query;

    if (req.method === "GET") {
      const record = await DET_TELE.findByPk(id);
      return record
        ? res.status(200).json(record)
        : res.status(404).json({ message: "No encontrado" });
    }

    if (req.method === "PUT") {
      const [updated] = await DET_TELE.update(req.body, { where: { ID_PRO: id } });
      if (!updated) return res.status(404).json({ message: "No encontrado" });

      const refreshed = await DET_TELE.findByPk(id);
      return res.status(200).json(refreshed);
    }

    if (req.method === "DELETE") {
      const deleted = await DET_TELE.destroy({ where: { ID_PRO: id } });
      return deleted
        ? res.status(200).json({ message: "Eliminado correctamente" })
        : res.status(404).json({ message: "No encontrado" });
    }

    return res.status(405).json({ message: "Método no permitido" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
