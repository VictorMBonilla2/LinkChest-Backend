import jwt from "jsonwebtoken";
import Usuario from "../models/Usuario.js";

const SECRET = process.env.JWT_SECRET; 

export const generarToken = (usuario) => {
  return jwt.sign(
    { id: usuario._id, email: usuario.email }, // payload
    SECRET,                                    
    { expiresIn: "1h" }                        
  );
};

export const verificarToken = async (req, res, next) => {
  console.log("🧩 Validando token...");

  try {
    // Prioridad: cookie
    let token = req.cookies?.jwtAuth;
    // Si no hay cookie, intenta extraer de header Authorization
    if (!token) {
      const authHeader = req.headers.authorization;
      console.log("authHeader: ", req.headers);
      
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    if (!token) {
      return res.status(401).json({ error: "Token requerido" });
    }

    const decoded = jwt.verify(token, SECRET);
    const usuario = await Usuario.findById(decoded.id);

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    if(usuario.estado !== "activo"){
      return res.status(401).json({ error: "Usuario desactivado" });
    }

    req.user = usuario;
    next();

  } catch (error) {
    console.error("Error al validar token:", error.message);
    return res.status(403).json({ error: "Token inválido o expirado" });
  }
};

export const verificarSudo = async (req, res, next) => {
  console.log("🧩 Validando token...");

  try {
    let token = req.cookies?.jwtAuth;
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    if (!token) {
      return res.status(401).json({ error: "Token requerido" });
    }

    const decoded = jwt.verify(token, SECRET);
    const usuario = await Usuario.findById(decoded.id);

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    if (usuario.rol !== "addm") {
      return res.status(403).json({ error: "No autorizado" });
    }
    
    req.user = usuario;
    next();

  } catch (error) {
    console.error("❌ Error al validar token:", error.message);
    return res.status(403).json({ error: "Token inválido o expirado" });
  }
};
