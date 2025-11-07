import express from "express"

import { iniciarSesionEmail, iniciarSesionGoogle, logout, registrarUsuarioWithEmail, validarSesionUser } from "../controllers/usuariosController.js";
import { verificarToken } from "../utils/tokenAux.js";

const router = express.Router();

router.post("/google", iniciarSesionGoogle)
router.post("/loginemail", iniciarSesionEmail)

router.post("/registeremail", registrarUsuarioWithEmail)
router.post("/logout", logout)
router.get("/validarSesion", verificarToken,validarSesionUser );

export default router