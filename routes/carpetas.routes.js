import express from "express";
import { verificarToken } from "../utils/tokenAux.js";
import { crearCarpeta, editarCarpeta, eliminarCarpeta, obtenerCarpetasByUser, obtenerCarpetasWithContentByUser } from "../controllers/CarpetasController.js";

const router = express.Router();


router.get("/userLinks" ,verificarToken, obtenerCarpetasWithContentByUser)

router.get("/user"      ,verificarToken, obtenerCarpetasByUser)

router.post("/add"      ,verificarToken, crearCarpeta)
router.put("/edit"      ,verificarToken, editarCarpeta)
router.delete("/delete/:idCarpeta" ,verificarToken, eliminarCarpeta)

export default router