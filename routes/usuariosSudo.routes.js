import express from "express";
import { verificarSudo } from "../utils/tokenAux.js";
import { activarUsuarioElevated, desactivarUsuarioElevated, eliminarUsuarioElevated, sudoObtenerUsuarios } from "../controllers/usuariosController.js";


const router = express.Router();

//GET
router.get("/all", verificarSudo, sudoObtenerUsuarios)


//PATH
router.patch("/activate", verificarSudo, activarUsuarioElevated)
router.patch("/desactivate", verificarSudo, desactivarUsuarioElevated)


//DELETE
router.delete("/", verificarSudo, eliminarUsuarioElevated )


export default router