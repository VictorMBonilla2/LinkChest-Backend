import { isValidObjectId } from "mongoose";
import Enlace from "../models/Enlace.js";
import { validarIDEntrante } from "../utils/ValidarId.js";
import { NotificacionAnalitica } from "../models/AnaliticaEnlace.js";




export const RegistrarAnaliticaEnlace = async (req, res) => {
  const user = req.user;
  const { enlaceId, tipoRecordatorio, intensidadRecordatorio, origen } = req.body;

  console.log(enlaceId, tipoRecordatorio, intensidadRecordatorio, origen);
  
  try {
    if (!isValidObjectId(enlaceId)) {
      return res.status(400).json({ error: "ID de enlace no válido" });
    }

    const enlace = await Enlace.findById(enlaceId);
    if (!enlace) {
      return res.status(404).json({ error: "Enlace no encontrado" });
    }
    if (!enlace.usuarioId.equals(user._id)) {
      return res.status(403).json({ error: "Acceso denegado" });
    }

    const analitica = new NotificacionAnalitica({
      usuarioId: user._id,
      enlaceId,
      tipoRecordatorio: tipoRecordatorio || "preciso",
      intensidadRecordatorio: intensidadRecordatorio || "normal",
      origen: origen || "chrome"
    });

    await analitica.save();

    return res.status(201).json({
      message: "Analítica registrada correctamente",
      analiticaId: analitica._id
    });

  } catch (error) {
    console.error("Error en RegistrarAnaliticaEnlace:", error);
    return res.status(500).json({
      error: "Error interno en el servidor."
    });
  }
};


export const ActualizarClickEnlace = async (req, res) => {
  try {
    const { idEnlace } = req.body;
    if (!idEnlace) return res.status(400).json({ error: "ID de enlace requerido" });

    const analitica = await NotificacionAnalitica
      .findOne({ enlaceId: idEnlace })
      .sort({ fechaGeneracion: -1 });

    if (!analitica) {
      return res.status(404).json({ error: "Analítica no encontrada para este enlace" });
    }

    if (!analitica.fueClickeada) {
      analitica.fueClickeada = true;
      analitica.fechaClick = new Date();
      analitica.tiempoRespuestaMs = analitica.fechaClick - analitica.fechaGeneracion;
      await analitica.save();
    }

    return res.status(200).json({ message: "Analítica actualizada" });

  } catch (error) {
    console.error("Error actualizando analítica:", error);
    return res.status(500).json({ error: "Error interno" });
  }
};
