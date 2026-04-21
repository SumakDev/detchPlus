import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import * as productosService from "../services/productos.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, "..", "uploads");

function deleteIfExists(filename) {
  if (!filename) return;
  const p = path.join(uploadsDir, filename);
  fs.promises.stat(p).then(() => fs.promises.unlink(p)).catch(() => { });
}

function computeNombre(row) {
  const marca = row?.marca?.NOM_MAR;
  const modelo = row?.modelo?.NOM_MOD;
  if (marca || modelo) return [marca, modelo].filter(Boolean).join(" ");
  if (row?.DES_PRO) return String(row.DES_PRO).split("\n")[0].slice(0, 60);
  return row?.COD_BAR_PRO || `Producto ${row?.ID_PRO}`;
}

function toUi(row) {
  const plain = row.get ? row.get({ plain: true }) : row;
  return { ...plain, NOMBRE: computeNombre(plain) };
}

export async function getAll(req, res) {
  try {
    const { q, activo } = req.query;
    const rows = await productosService.getProductos({ q, activo });
    return res.json(rows.map(toUi));
  } catch (error) {
    console.error("productos.getAll", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function create(req, res) {
  try {
    const body = req.body || {};
    const file = req.file;
    const result = await productosService.createProducto(body, file);
    return res.status(201).json(toUi(result));
  } catch (error) {
    console.error("productos.create", error);
    return res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
}

export async function update(req, res) {
  try {
    const { id } = req.params;
    const body = req.body || {};
    const file = req.file;
    const { result, prevImg } = await productosService.updateProducto(id, body, file);
    if (prevImg) deleteIfExists(prevImg);
    return res.json(toUi(result));
  } catch (error) {
    console.error("productos.update", error);
    return res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
}

export async function remove(req, res) {
  try {
    const { id } = req.params;
    const img = await productosService.deleteProducto(id);
    if (img) deleteIfExists(img);
    return res.json({ message: "Eliminado correctamente" });
  } catch (error) {
    console.error("productos.remove", error);
    return res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
}