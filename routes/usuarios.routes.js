import express from "express";
import { obtenerUsuarios, actualizarUsuario, eliminarUsuario } from "../controllers/usuariosController.js";
import { verificarSudo } from "../utils/tokenAux.js";

const router = express.Router();

router.get("/", verificarSudo, obtenerUsuarios);   


router.put("/:id", actualizarUsuario);
router.delete("/:id", eliminarUsuario);

export default router;
