import Enlace from "../models/Enlace.js"
import { existeCarpetaById } from "./CarpetasService.js"
import { validarTags } from "./TagsServices.js"
import {validarDescripcion} from "./CarpetasService.js"




export const existeEnlaceByUserAndUrlName = async (userId, url, name) => {
    return await Enlace.exists({ usuarioId: userId, url: url, titulo: name })
}

export const existeEnlaceByUserAndUrl = async (userId, url) => {
    return await Enlace.exists({ usuarioId: userId, url: url })
}

export const existeEnlaceByUserAndName = async (userId, name) => {
    return await Enlace.exists({ usuarioId: userId, titulo: name })
}

export const validarNombreEnlace = (nombre) => {
    if (typeof nombre !== "string") {
        return { status: false, message: "El nombre no es válido" };
    }

    nombre = nombre.trim();

    if (nombre.length === 0) {
        return { status: false, message: "El nombre está vacío" };
    }

    if (nombre.length > 60) {
        return { status: false, message: "El nombre supera los 20 caracteres", };
    }

    return { status: true, value: nombre };
};

export const validarUrlEnlace = (url) => {
    if (typeof url !== "string") {
        return { status: false, message: "La url no es válida" };
    }

    url = url.trim();
    if (url.length === 0) {
        return { status: false, message: "La url está vacía" };
    }

    if (url.length > 2000) {
        return { status: false, message: "La url es demasiada larga" };
    }

    try {
        new URL(url); 
    } catch (e) {
        return { status: false, message: "La URL no tiene un formato válido" };
    }

    return { status: true, value: url };
}

export const obtenerEnlaceByIdService = async (idEnlace)=>{
    const result = await Enlace.findOne({_id: idEnlace}).populate("tags")   
    return result
}


export const editarEnlaceService = async (idEnlace, datos) => {
  const actualizado = await Enlace.findByIdAndUpdate(
    idEnlace,
    {
      ...datos,
      url: undefined // evita que cambie
    },
    { new: true }
  );

  return actualizado;
};



export const validarModoRecordatorio = (tipoRecordatorio, diasSeleccionado, frecuencia, horaRecordatorio) => {
  const diasValidos = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  const validacionTipo = validarTipoRecordatorio(tipoRecordatorio);
  if (!validacionTipo.status) return validacionTipo;

  if (tipoRecordatorio === "ninguno") {
    return { status: true, tipo: tipoRecordatorio, message: "Validación correcta." };

  }
  if (tipoRecordatorio === "preciso") {
    console.log(horaRecordatorio);
    
    if (!horaRecordatorio || typeof horaRecordatorio !== "string" || !/^\d{2}:\d{2}$/.test(horaRecordatorio)) {
      return { status: false, message: "Hora exacta inválida. Formato esperado HH:MM." };
    }
    
    if (diasSeleccionado && !Array.isArray(diasSeleccionado)) {
      return { status: false, message: "Días seleccionados inválidos. Debe ser un arreglo." };
    }
    if (!diasSeleccionado || diasSeleccionado.length === 0) {
      return { status: false, message: "Debes seleccionar al menos un día." };
    }
    if (diasSeleccionado.some(dia => !diasValidos.includes(dia.toLowerCase()))) {
      return { status: false, message: "Uno o más días seleccionados son inválidos." };
    }
    return { status: true, tipo: tipoRecordatorio, message: "Validación correcta." };

  }

  if (tipoRecordatorio === "inteligente") {
    const frecuenciasValidas = ["baja", "normal", "alta"];
     if (typeof frecuencia !== "string") {
        return { status: false, message: "Frecuencia introducida invalida." };
    }
    if (!frecuencia || !frecuenciasValidas.includes(frecuencia.toLowerCase())) {
      return { status: false, message: "Frecuencia inválida. Valores permitidos: baja, media, alta." };
    }
    return { status: true, tipo: tipoRecordatorio, message: "Validación correcta." };

  }

}

export const validarNavegador = (navegador) => {
    if (typeof navegador !== "string") {
        return { status: false, message: "Navegador inválido." };
    }
    const navegadoresValidos = ["chrome", "firefox", "edge", "desconocido"];

    if (!navegador || !navegadoresValidos.includes(navegador.toLowerCase())) {
        return { status: false, message: "Navegador inválido." };}

    return { status: true, message: "Navegador válido." };
}


export const validarTipoRecordatorio = (tipoRecordatorio) => {

  if (typeof tipoRecordatorio !== "string") {
    return { status: false, message: "Intervalo de tiempo Invalido." };
  }

  const tiposValidos = ["ninguno", "preciso", "inteligente"];
  if (!tiposValidos.includes(tipoRecordatorio)) {
    return { status: false, message: "Tipo de recordatorio inválido." };
  }


  return { status: true, message: "Tipo de recordatorio válido." };
}

/**
 * Valida los campos de enlace (tanto para crear como editar)
 * @param {Object} data - Datos del enlace
 * @param {boolean} isNew - Indica si es creación (true) o edición (false)
 * @param {string} userId - ID del usuario autenticado
 */
export const validarYPrepararEnlace = async (data, isNew, userId) => {
  const {
    nombre,
    url,
    carpetaID,
    tipoRecordatorio,
    diasSeleccionados,
    frecuencia,
    horaRecordatorio,
    descripcion,
    tags,navegador
  } = data;

  // Validar nombre
  const nombreValido = validarNombreEnlace(nombre);
  if (!nombreValido.status) throw new Error(nombreValido.message);

  // Validar URL solo si es nuevo
  let urlValido;
  if (isNew) {
    urlValido = validarUrlEnlace(url);
    if (!urlValido.status) throw new Error(urlValido.message);
  }

  // Validar recordatorio
  const recordatorioValido = validarModoRecordatorio(
    tipoRecordatorio,
    diasSeleccionados,
    frecuencia,
    horaRecordatorio
  );
  if (!recordatorioValido.status) throw new Error(recordatorioValido.message);

  // Validar descripción
  const descripcionValido = validarDescripcion(descripcion);
  if (!descripcionValido.status) throw new Error(descripcionValido.message);

  // Validar carpeta
  const carpetaValido = await existeCarpetaById(carpetaID, userId);
  if (!carpetaValido.status && carpetaValido.code !== "NOT_FOUND") {
    throw new Error(carpetaValido.message);
  }

  // Validar tags
  const tagsValidados = await validarTags(tags);
  if (!tagsValidados.status) throw new Error(tagsValidados.message);
  
  // Validar navegador
  const navegadorValidado = validarNavegador(navegador);
  if (!navegadorValidado.status) throw new Error(navegadorValidado.message);

  // Armar objeto base
  const baseData = {
    titulo: nombreValido.value,
    descripcion,
    tipoRecordatorio,
    carpetaId: carpetaValido.status ? carpetaID : undefined,
    tags: tagsValidados.message,
    origen: navegador.toLowerCase() || "desconocido"
  };

  // Campos específicos según tipo de recordatorio
  if (tipoRecordatorio === "preciso") {
    baseData.diasSeleccionados = diasSeleccionados.map(dia => dia.toLowerCase());
    baseData.horaRecordatorio = horaRecordatorio;
  } else if (tipoRecordatorio === "inteligente") {
    baseData.frecuencia = frecuencia;
  }


  if (isNew) {
    baseData.url = urlValido.value;
    baseData.usuarioId = userId;
    baseData.fechaRegistro = new Date();

    const existe = await existeEnlaceByUserAndUrlName(userId, url, nombre);
    if (existe) {
      throw new Error("Ya cuentas con esa URL o nombre dentro del baúl.");
    }
  }

  return baseData;
};
