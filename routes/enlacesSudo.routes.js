import express from "express";
import { verificarSudo } from "../utils/tokenAux.js";
import { activarEnlaceElevated, desactivarEnlaceElevated, eliminarEnlaceElevated, obtenerAllEnlaces } from "../controllers/EnlacesController.js";
const router = express.Router();

//GET
router.get("/all", verificarSudo, obtenerAllEnlaces)


//PATH
router.patch("/activate", verificarSudo, activarEnlaceElevated)
router.patch("/desactivate", verificarSudo, desactivarEnlaceElevated)


//DELETE
router.delete("/", verificarSudo, eliminarEnlaceElevated )

export default router