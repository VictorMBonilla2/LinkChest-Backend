import Usuario from "../models/Usuario.js";
import { OAuth2Client } from "google-auth-library";
import bcrypt from "bcryptjs";
import { crearUsuario, hashearPassword, obtenerUserByEmail, validarPassword } from "../services/usuariosServices.js";
import { generarToken } from "../utils/tokenAux.js";
import { isValidObjectId } from "mongoose";


export const obtenerUsuarios = async (req, res) => {
  const usuarios = await Usuario.find();
  res.json(usuarios);
};

export const validarSesionUser = async (req, res) => {
  try {

    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: "Sesión no válida o expirada" });
    }


    return res.status(200).json({
      _id: user._id,
      rol: user.rol,
      message: "Sesión válida",
    });

  } catch (error) {
    console.error("Error al validar sesión:", error);
    return res.status(500).json({ error: "Error interno al validar la sesión" });
  }
};




export const logout = async (req, res) =>{
    res.cookie("jwtAuth", "", { httpOnly: true, maxAge: 0, path: "/" });
    console.log("cerrando sesión...");
    
    return res.json({ ok: true });
}

export const registrarUsuarioWithEmail = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(req.body);

    if (!email || !password) {
      return res.status(400).json({ ok: false, error: "Email y contraseña son obligatorios." });
    }

    // Verificar si ya existe
    const userRegistrado = await obtenerUserByEmail(email);
    if (userRegistrado) {
      return res.status(400).json({ ok: false, error: "El correo ya está registrado." });
    }

    const isValidPassword = validarPassword(password);
    if (!isValidPassword.ok) {
      return res.status(400).json({ ok: false, error: isValidPassword.message });
    }

    const hashedPassword = await hashearPassword(password);



    const userCreated = await crearUsuario({
      email,
      hashedPassword,
    });

    const userSafe = await Usuario.findById(userCreated._id).select("_id rol");


    const tokenjwt = generarToken(userCreated);

    // Configurar cookie con el token
    res.cookie("jwtAuth", tokenjwt, {
      httpOnly: true,
      secure: false, // true en producción (HTTPS)
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 // 24 horas
    });


    return res.json({ ok: true, user: userSafe });

  } catch (err) {
    console.error("Error registrando usuario:", err);
    return res.status(500).json({ ok: false, error: "Error interno del servidor" });
  }
};


export const actualizarUsuario = async (req, res) => {
  const usuario = await Usuario.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(usuario);
};

export const eliminarUsuario = async (req, res) => {
  await Usuario.findByIdAndDelete(req.params.id);
  res.json({ mensaje: "Usuario eliminado" });
};

export const iniciarSesionEmail = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(req.body);

    const userRegistrado = await obtenerUserByEmail(email);

    if (!userRegistrado) {
      console.log("Usuario no encontrado...");
      return res.status(401).json({ ok: false, error: "El email no corresponde a ningún usuario registrado." });
    }

    const isValidPassword = validarPassword(password)

    if(!isValidPassword.ok){
      return res.status(400).json({ ok: false, error: isValidPassword.message });
    }
    

    const passwordValida = await bcrypt.compare(password, userRegistrado.password);
    if (!passwordValida) {
      return res.status(401).json({ ok: false, error: "El email o la contraseña no coinciden." });
    }

    if(userRegistrado.estado !== "activo"){
      return res.status(401).json({ ok: false, error: "La cuenta esta desactivada" });
    }


    const tokenjwt = generarToken(userRegistrado);
    
    const userSafe = await Usuario.findById(userRegistrado._id).select("_id rol");


    res.cookie("jwtAuth", tokenjwt, {
      httpOnly: true,
      secure: false,  
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 // 24 horas
    });

    return res.json({ ok: true,  token: tokenjwt , user:userSafe });

  } catch (err) {
    console.error("Error iniciando sesión:", err);
    return res.status(500).json({ ok: false, error: "Error interno del servidor." });
  }
};


export const iniciarSesionGoogle = async (req, res) => {
  const client = new OAuth2Client()
  try {
    console.log("Se ha entrado al metodo de Validacion de google");

    const { token } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: `${process.env.AUDIENCIE_GOOGLE}`,
    })

    const payload = ticket.getPayload();

    const userData = {
    //  googleId: payload.sub,
    //  picture: payload.picture,
      email: payload.email,
      nombre: payload.name,
    };

    let userRegistrado = await obtenerUserByEmail(userData.email)

    if (!userRegistrado) {
      console.log("Usuario nuevo... Creando usuario");

      // Generar una contraseña aleatoria
      const randomPassword = crypto.randomBytes(12).toString("hex");

      // Hashear la contraseña antes de guardar
      const hashedPassword = await hashearPassword(randomPassword)

      // Combinar los datos originales con la contraseña cifrada
      userData = { ...userData, password: hashedPassword, isGoogleAccount: true };

      // Crear nuevo usuario
      userRegistrado = await crearUsuario(userData);
      console.log("Usuario creado:", userRegistrado);
    }
    
    if(!userRegistrado.estado === "activo"){
      return res.status(401).json({ ok: false, error: "La cuenta esta desactivada" });
    }

    const tokenjwt= generarToken(userRegistrado)
    const userSafe = await Usuario.findById(userRegistrado._id).select("_id rol");
    res.cookie("jwtAuth", tokenjwt, {
      httpOnly: true,
      secure: false,         
      sameSite: "lax",       
      maxAge: 1000 * 60 * 60 * 24 // 1 hora
    });

    res.json({ ok: true, user: userSafe });
  } catch (err) {
    console.error("Error verificando token:", err);
    res.status(401).json({ ok: false, error: "Token inválido" });
  }

}



//----------------------------------------------
// ADMIN-SIDE
//----------------------------------------------


export const sudoObtenerUsuarios = async (req, res) => {
  try {
    const { search, page = "1" } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const pageSize = 10;

    const filtro = search
      ? { nombre: { $regex: search, $options: "i" } } // o 'correo', según quieras buscar
      : {};


    const listaUsuario = await Usuario.aggregate([
      { $match: filtro },
      { $sort: { fechaRegistro: -1 } },
      { $skip: (pageNum - 1) * pageSize },
      { $limit: pageSize },

      // Vincula con los enlaces creados por el usuario
      {
        $lookup: {
          from: "enlaces",           // nombre de la colección relacionada
          localField: "_id",         // campo en Usuario
          foreignField: "usuario",   // campo que referencia al usuario en Enlace
          as: "enlaces",
        },
      },
      // Añade campo con cantidad de enlaces
      {
        $addFields: {
          enlacesCreados: { $size: "$enlaces" },
        },
      },
      {
        $project: {
          _id: 1,
          nombre: 1,
          email: 1,
          fechaRegistro: 1,
          enlacesCreados: 1,
          estado: 1,
        },
      },
    ]);

    //  Total de usuarios (para paginación)
    const total = await Usuario.countDocuments(filtro);

    // 📦 Respuesta final
    res.json({
      page: pageNum,
      totalPages: Math.ceil(total / pageSize),
      totalItems: total,
      items: listaUsuario,
    });
  } catch (err) {
    console.error("Error en sudoObtenerUsuarios:", err);
    res.status(500).json({ error: "Error al obtener a los usuarios" });
  }
};


export const desactivarUsuarioElevated = async (req, res) => {
  try {
    const { idUsuario: idUsuario } = req.query;

    if (!isValidObjectId(idUsuario)) {
      return res.status(400).json({ error: "ID de usuario no válido" });
    }
    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      idUsuario,
      { estado: "inactivo" },
      { new: true } // 
    );

    if (!usuarioActualizado) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    return res.status(200).json({
      message: "Usuario desactivado correctamente",
      usuario: usuarioActualizado,
    });

  } catch (err) {
    console.error("Error en desactivar usuario Elevated:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const activarUsuarioElevated = async (req, res) => {
  try {
    const { idUsuario } = req.query;

    if (!isValidObjectId(idUsuario)) {
      return res.status(400).json({ error: "ID de usuario no válido" });
    }
    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      idUsuario,
      { estado: "activo" },
      { new: true } // <- devuelve el documento actualizado
    );

    if (!usuarioActualizado) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    return res.status(200).json({
      message: "Usuario activado correctamente",
      usuario: usuarioActualizado,
    });

  } catch (err) {
    console.error("Error en activar usuario Elevated:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const eliminarUsuarioElevated = async (req, res) => {
  try {
    const { idUsuario } = req.query;

    if (!isValidObjectId(idUsuario)) {
      return res.status(400).json({ error: "ID de usuario no válido" });
    }
    const usuarioEliminado = await Usuario.deleteOne({_id:idUsuario})

    if (!usuarioEliminado) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    return res.status(200).json({
      message: "Usuario desactivado correctamente",
      usuario: usuarioActualizado,
    });

  } catch (err) {
    console.error("Error en desactivarusuarioElevated:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};