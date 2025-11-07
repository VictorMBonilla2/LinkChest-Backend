import Usuario from "../models/Usuario.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export const obtenerUserByEmail = async (email) => {
    console.log("Buscando email dentro del db");
    try {
        const user = await Usuario.findOne({ email: email })
        if(user !=null){
            console.log("user conseguido: " +user);
            
        }
        return user

    } catch (error) {
        throw new Error("Error al obtener usuario por email: " + error.message);
    }
}


export const crearUsuario = async (userData) => {
  try {
    if (!userData.email || !userData.hashedPassword) {
      throw new Error("Faltan datos obligatorios");
    }

    // Si no tiene nombre, generar uno automático
    const nombreAuto = userData.nombre 
      ? userData.nombre
      : `usuario-${crypto.randomBytes(3).toString("hex")}`; // ej: usuario-a9c3f1

    const nuevoUsuario = new Usuario({
      email: userData.email,
      password: userData.hashedPassword,
      nombre: nombreAuto,
      isGoogleAccount: userData.isGoogleAccount? userData.isGoogleAccount : false
    });

    const usuarioGuardado = await nuevoUsuario.save();
    return usuarioGuardado;

  } catch (error) {
    console.error("Error al crear usuario:", error.message);
    throw new Error("No se pudo crear el usuario");
  }
};


export const hashearPassword = async (password) =>{
  return await bcrypt.hash(password, 10);
}

export const validarPassword = (password) =>{

  if(typeof password !== "string"){
    return { ok: false , message: "Valor de password invalido"}
  }

  if(password.length <6){
    return { ok: false , message: "La contraseña es muy pequeña"}
  }

    if(password.length >256){
    return { ok: false , message: "La contraseña es muy grande"}
  }
 
  return { ok: true ,   message: "La contraseña es valida"}
}