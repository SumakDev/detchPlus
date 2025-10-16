import sequelize from "../../../detch-plus-backend/config/database.js";
import { CUP_USO } from "../../../detch-plus-backend/models/index.js";

export default async function handler(req, res) {
  try {
    const { id } = req.query;

    if (req.method === "GET") {
      const record = await CUP_USO.findByPk(id);
      return record
        ? res.status(200).json(record)
        : res.status(404).json({ message: "No encontrado" });
    }

    if (req.method === "PUT") {
      const [updated] = await CUP_USO.update(req.body, { where: { ID_CUP_USO: id } });
      if (!updated) return res.status(404).json({ message: "No encontrado" });

      const refreshed = await CUP_USO.findByPk(id);
      return res.status(200).json(refreshed);
    }

    if (req.method === "DELETE") {
      const deleted = await CUP_USO.destroy({ where: { ID_CUP_USO: id } });
      return deleted
        ? res.status(200).json({ message: "Eliminado correctamente" })
        : res.status(404).json({ message: "No encontrado" });
    }

    return res.status(405).json({ message: "Método no permitido" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
