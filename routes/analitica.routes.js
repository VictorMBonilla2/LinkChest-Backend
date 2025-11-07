import express from "express"

import { verificarToken } from "../utils/tokenAux.js";
import { ActualizarClickEnlace, RegistrarAnaliticaEnlace } from "../controllers/AnaliticaController.js";


const router= express.Router();


router.post("/enlaces/registrarAnaliticaEnlace", verificarToken,RegistrarAnaliticaEnlace)

router.patch("/enlaces/actualizarClick", verificarToken,ActualizarClickEnlace)

export default router