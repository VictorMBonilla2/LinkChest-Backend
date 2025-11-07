import mongoose from "mongoose";
import Carpeta from "../models/Carpeta.js"
import { validarIDEntrante } from "../utils/ValidarId.js";
import Enlace from "../models/Enlace.js";

export const existeCarpetaById = async (carpetaId, userId) => {
    try {
        if (carpetaId === "") {
            return { status: false, code: "NOT_FOUND", message: "Id vacio" };
        }
        // Validar carpetaId
        if (!validarIDEntrante(carpetaId)) {
            return { status: false, code: "INVALID_ID", message: "Id de carpeta inválido" };
        }

        // Buscar la carpeta
        const carpeta = await Carpeta.exists({ userId, _id: carpetaId });

        if (carpeta) {
            return { status: true, code: "OK", message: "Carpeta existe" };
        } else {
            return { status: false, code: "NOT_FOUND", message: "Carpeta no existe" };
        }
    } catch (err) {
        return { status: false, code: "ERROR", message: "Error al validar carpeta", error: err };
    }
};



export const validarDescripcion = (descripcion)=>{
  let limitChars = 60;

  if (typeof descripcion !== "string") {
      return { status: false, message: "Descripción invalida." };
  }

  if(descripcion.trim().length === 0 ){
      return { status: true, message: "mensaje vacío." };
  }
  if(descripcion.trim().length> limitChars){
      return { status: false, message: `Descripción supera el limite de caracteres: ${limitChars}.` };
  }

  return { status: true, message: "Descripción correcta." };

}



export const existeCarpetabyIdWithNombre = async ({ userId, nombreCarpeta }) => {
  if (!userId || !nombreCarpeta?.trim()) {
    return { ok: false, existe: false, message: "Parámetros inválidos" }
  }

  const existeNombre = await Carpeta.exists({ userId, nombre: nombreCarpeta })

  if (existeNombre) {
    return { ok: true, existe: true, message: "El nombre ya existe" }
  }

  return { ok: true, existe: false, message: "El nombre no existe" }
}

export const crearCarpetaService = async (userId, nombre) => {
  const newCarpeta = new Carpeta({ userId, nombre })
  return await newCarpeta.save()
}
export const editarCarpetaService = async ({ userId, carpetaId, nuevoNombre }) => {
    // Verificar si ya existe otra carpeta con el mismo nombre para el usuario
    const existeNombre = await Carpeta.exists({
        userId,
        nombre: nuevoNombre,
        _id: { $ne: carpetaId } // Excluir la carpeta que se está editando
    });

    if (existeNombre) {
        return { error: "El nombre ya existe" };
    }

    // Buscar y actualizar la carpeta
    const carpetaActualizada = await Carpeta.findOneAndUpdate(
        { _id: carpetaId, userId },
        { nombre: nuevoNombre },
        { new: true } // Retornar el documento actualizado
    );

    if (!carpetaActualizada) {
        return { error: "Carpeta no encontrada o no pertenece al usuario" };
    }

    return { data: carpetaActualizada };
};

export const eliminarCarpetaService = async ({ idCarpeta, userId }) => {
  try {
    
    const carpeta = await Carpeta.findOne({ _id: idCarpeta, userId });
    if (!carpeta) {
      return { error: "Carpeta no encontrada o no pertenece al usuario" };
    }

    // Actualizar enlaces -> carpeta null
    await Enlace.updateMany(
      { carpetaId: idCarpeta, userId },
      { $set: { carpetaId: null } }
    );

    // Eliminar carpeta
    await Carpeta.deleteOne({ _id: idCarpeta, userId });

    return { ok: true, message: "Carpeta eliminada y enlaces liberados" };

  } catch (err) {
    console.error("Error eliminando carpeta (service):", err);
    return { error: "Error eliminando carpeta" };
  }
};



export const eliminarCarpetaServiceSesion= async ({ idCarpeta, userId }) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const carpeta = await Carpeta.findOne({ _id: idCarpeta, userId }).session(session);
    if (!carpeta) {
      await session.abortTransaction();
      session.endSession();
      return { error: "Carpeta no encontrada o no pertenece al usuario" };
    }

    await Enlace.updateMany(
      { carpetaId: idCarpeta, userId },
      { $set: { carpetaId: null } },
      { session }
    );

    await Carpeta.deleteOne({ _id: idCarpeta, userId }, { session });
    
    await session.commitTransaction();
    session.endSession();

    return { ok: true, message: "Carpeta eliminada y enlaces liberados" };

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error eliminando carpeta (service):", err);
    return { error: "Error eliminando carpeta" };
  }
};