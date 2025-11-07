import express from "express";
import { verificarToken } from "../utils/tokenAux.js";
import { obtenerTagsByUser } from "../controllers/TagsController.js";

const router = express.Router();


router.get("/user", verificarToken, obtenerTagsByUser)



export default router