import sequelize from "../../../detch-plus-backend/config/database.js";
import { CAR_COM } from "../../../detch-plus-backend/models/index.js";

export default async function handler(req, res) {
  try {
    const { id } = req.query;

    if (req.method === "GET") {
      const record = await CAR_COM.findByPk(id);
      return record
        ? res.status(200).json(record)
        : res.status(404).json({ message: "No encontrado" });
    }

    if (req.method === "PUT") {
      const [updated] = await CAR_COM.update(req.body, { where: { ID_CAR_COM: id } });
      if (!updated) return res.status(404).json({ message: "No encontrado" });

      const refreshed = await CAR_COM.findByPk(id);
      return res.status(200).json(refreshed);
    }

    if (req.method === "DELETE") {
      const deleted = await CAR_COM.destroy({ where: { ID_CAR_COM: id } });
      return deleted
        ? res.status(200).json({ message: "Eliminado correctamente" })
        : res.status(404).json({ message: "No encontrado" });
    }

    return res.status(405).json({ message: "Método no permitido" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
