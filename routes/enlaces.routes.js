import express from "express";
import { verificarToken } from "../utils/tokenAux.js";
import { actualizarEnlaceAviso, crearEnlace, editarEnlace, eliminarEnlaceUsuario, insertarClickEnlace, obtenerEnlaceById, obtenerEnlacesByRecordatorio, obtenerEnlacesByUser } from "../controllers/EnlacesController.js";
const router = express.Router();

// GET -> Listar todos los enlaces (Páginas)
router.get("/",verificarToken, obtenerEnlacesByUser );
router.get("/user/recordatorio",verificarToken, obtenerEnlacesByRecordatorio );
router.get("/user/:id",verificarToken, obtenerEnlaceById );

// POST -> Crear un nuevo enlace (Páginas)
router.post("/user/click", verificarToken, insertarClickEnlace);
router.post("/", verificarToken, crearEnlace);

// PUT -> Actualizar un enlace existente (Páginas)
router.put("/user/:id", verificarToken, editarEnlace);

// DELETE -> Eliminar un enlace (Páginas)
router.delete("/:id", verificarToken, eliminarEnlaceUsuario);

// PATH -> Actualizar parcialmente un enlace (Páginas)
router.patch("/user/ultimoAviso", verificarToken, actualizarEnlaceAviso);



export default router;
