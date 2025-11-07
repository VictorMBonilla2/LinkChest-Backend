import { isValidObjectId } from "mongoose";
import Enlace from "../models/Enlace.js";
import { validarYPrepararEnlace } from "../services/EnlacesServices.js";
import { editarEnlaceService, obtenerEnlaceByIdService,  } from "../services/EnlacesServices.js";





export const crearEnlace = async (req, res) => {
  try {
    const user = req.user;
    const data = req.body;

    const nuevoEnlaceData = await validarYPrepararEnlace(data, true, user.id);
    const nuevoEnlace = new Enlace(nuevoEnlaceData);
    await nuevoEnlace.save();

    res.status(201).json({
      message: "Enlace creado correctamente",
      enlace: nuevoEnlace
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message || "Error interno al crear enlace" });
  }
};

export const editarEnlace = async (req, res) => {
  try {
    
    const user = req.user;
    const { id } = req.body;

    const enlaceEditar = await obtenerEnlaceByIdService(id);
    if (!enlaceEditar || enlaceEditar.usuarioId.toString() !== user.id) {
      return res.status(400).json({ error: "Id Enlace no encontrado o no te pertenece" });
    }

    const datosAEditar = await validarYPrepararEnlace(req.body, false, user.id);
    const editado = await editarEnlaceService(id, datosAEditar);

    res.status(200).json({
      message: "Enlace actualizado correctamente",
      enlace: editado
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message || "Error interno al editar enlace" });
  }
};

export const obtenerEnlacesByUser = async (req, res) => {
  try {
    const user = req.user;
    console.log(req.query);

    const { tags, search, page = "1" } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const pageSize = 10;

    const filtro = { usuarioId: user.id };
    console.log(tags);
    if (tags) {
      console.log(tags);

      const tagList = tags.split(",").map(t => t.trim().toLowerCase());
      filtro.tags = { $in: tagList };
    }
    if (search) {
      filtro.titulo = { $regex: search, $options: "i" }; 
    }

    const listaEnlace = await Enlace.find(filtro)
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize)
      .populate("tags", "name")
      .sort({ fechaRegistro: -1 }); 


    const total = await Enlace.countDocuments(filtro);
    res.json({
      page: pageNum,
      totalPages: Math.ceil(total / pageSize),
      totalItems: total,
      items: listaEnlace,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener los enlaces" });
  }
}

export const eliminarEnlaceUsuario = async (req, res) => {
  const user = req.user;
  const { id } = req.query;

  try {


    if (!isValidObjectId(id)) {
      return res.status(400).json({
        error: "ID de enlace no valido"
      });
    }
    const enlace = await Enlace.findById(id)

    if (!enlace) {
      return res.status(404).json({
        error: "ID de enlace no encontrado"
      });
    }

    if (!enlace.usuarioId.equals(user._id)) {
      return res.status(403).json({ error: "Acceso denegado" });
    }

    await enlace.deleteOne();

    return res.json({ message: "Enlace eliminado correctamente ", idEnlace:id });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error al eliminar enlace" });
  }
}

export const obtenerEnlacesByRecordatorio = async (req, res) => {
  try {
    const user = req.user;
    const filtro = { usuarioId: user._id, tipoRecordatorio: { $ne: "ninguno" } };

    let listaEnlace = await Enlace.find(filtro)
      .sort({ fechaRegistro: -1 })
      .select("_id titulo url tipoRecordatorio fechaUltimaActualizacion usuarioId diasSeleccionados horaRecordatorio frecuencia ultimoAviso avisosHoy fechaUltimoAvisoReseteo");

    const hoyStr = new Date().toDateString();
    const updates = [];


    listaEnlace = listaEnlace.map((enlace) => {
      const ultimaFecha = enlace.fechaUltimoAvisoReseteo
        ? new Date(enlace.fechaUltimoAvisoReseteo).toDateString()
        : null;

      if (ultimaFecha !== hoyStr) {
        enlace.avisosHoy = 0;
        enlace.fechaUltimoAvisoReseteo = new Date();
        updates.push({
          updateOne: {
            filter: { _id: enlace._id },
            update: { avisosHoy: 0, fechaUltimoAvisoReseteo: new Date() },
          },
        });
      }

      return enlace;
    });

 
    if (updates.length > 0) {
      await Enlace.bulkWrite(updates);
    }

    return res.status(200).json({
      message: "Enlaces obtenidos correctamente",
      enlaces: listaEnlace,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Error interno en el servidor.",
    });
  }
};


export const actualizarEnlaceAviso = async (req, res) => {
  try {
    const user = req.user;
    const { idEnlace, ultimoAviso, avisosHoy } = req.body;

    if (!isValidObjectId(idEnlace)) {
      return res.status(400).json({ error: "ID de enlace no válido" });
    }

    const enlace = await Enlace.findById(idEnlace);
    if (!enlace) {
      return res.status(404).json({ error: "Enlace no encontrado" });
    }

    if (!enlace.usuarioId.equals(user._id)) {
      return res.status(403).json({ error: "Acceso denegado" });
    }


    if (ultimoAviso !== undefined) {
      enlace.ultimoAviso = new Date(ultimoAviso);
    }

  
    if (avisosHoy !== undefined) {
      const avisosHoyNum = Number(avisosHoy);
      if (!isNaN(avisosHoyNum)) {
        enlace.avisosHoy = avisosHoyNum;
      } else {
        console.warn(` Valor inválido para avisosHoy: ${avisosHoy}`);
      }
    }

    enlace.fechaUltimaActualizacion = new Date();

    await enlace.save();

    return res.status(200).json({
      message: "Enlace actualizado correctamente",
      enlace,
    });

  } catch (error) {
    console.error("Error en actualizarEnlaceAviso:", error);
    return res.status(500).json({
      error: "Error interno en el servidor.",
    });
  }
};

export const insertarClickEnlace = async (req, res) => {
  try {
    const user = req.user;
    const { idEnlace } = req.body;
    console.log("id enlace para insertar click: ", idEnlace);
    
    
    if (!isValidObjectId(idEnlace)) {
      return res.status(400).json({ 
        error: "ID de enlace no valido" 
      });
    }
    const enlace = await Enlace.findById(idEnlace);
    if (!enlace) {
      return res.status(404).json({ 
        error: "ID de enlace no encontrado" 
      });
    }
    if (!enlace.usuarioId.equals(user._id)) {
      return res.status(403).json({ error: "Acceso denegado" });
    } 
    enlace.clicks += 1;
    await enlace.save();
    return res.status(200).json({
      message: "Click registrado correctamente",
      clicks: enlace.clicks
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ 
      error: "Error interno en el servido." 
    });
  }}

export const obtenerEnlaceById = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    console.log("id de obtenerEnlaceById: ", id);
    
    const enlace = await obtenerEnlaceByIdService(id)

    if (!enlace) {
      return res.status(404).json({
        error: "Enlace no encontrado."
      });
    }
  
  
    if (!enlace.usuarioId.equals(user._id)) {
      return res.status(401).json({
        error: "El enlace no pertenece al usuario."
      });
    }

    return res.status(200).json({
      message: "El enlace fue obtenido correctamente.",
      enlace
    });

  } catch (error) {
    console.log(error);
    
    return res.status(500).json({
        error: "Error interno en el servido."
    });
  }
}



//----------------
// ADMIN-SIDE
//----------------
export const obtenerAllEnlaces = async (req, res) => {
  try {
    const user = req.user;
    console.log(req.query);

    const { tags, search, page = "1" } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const pageSize = 10;

    let filtro;
    
    if(search){
      filtro = {  titulo : { $regex: search, $options: "i" }}// "i" = case-insensitive
    }

 
    const listaEnlace = await Enlace.find(filtro)
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize)
      .populate("tags", "name")
      .sort({ fechaRegistro: -1 }); 

    const total = await Enlace.countDocuments(filtro);
    res.json({
      page: pageNum,
      totalPages: Math.ceil(total / pageSize),
      totalItems: total,
      items: listaEnlace,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener los enlaces" });
  }
}

export const desactivarEnlaceElevated = async (req, res) => {
  try {
    const { idEnlace } = req.query;

    if (!isValidObjectId(idEnlace)) {
      return res.status(400).json({ error: "ID de enlace no válido" });
    }
    const enlaceActualizado = await Enlace.findByIdAndUpdate(
      idEnlace,
      { estado: "inactivo" },
      { new: true } 
    );

    if (!enlaceActualizado) {
      return res.status(404).json({ error: "Enlace no encontrado" });
    }

    return res.status(200).json({
      message: "Enlace desactivado correctamente",
      enlace: enlaceActualizado,
    });

  } catch (err) {
    console.error("Error en desactivarEnlaceElevated:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};
export const activarEnlaceElevated = async (req, res) => {
  try {
    const { idEnlace } = req.query;

    if (!isValidObjectId(idEnlace)) {
      return res.status(400).json({ error: "ID de enlace no válido" });
    }
    const enlaceActualizado = await Enlace.findByIdAndUpdate(
      idEnlace,
      { estado: "activo" },
      { new: true } 
    );

    if (!enlaceActualizado) {
      return res.status(404).json({ error: "Enlace no encontrado" });
    }

    return res.status(200).json({
      message: " Enlace activado correctamente",
      enlace: enlaceActualizado,
    });

  } catch (err) {
    console.error("Error en activarEnlaceElevated:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};
export const eliminarEnlaceElevated = async (req, res) => {
  try {
    const { idEnlace } = req.query;

    if (!isValidObjectId(idEnlace)) {
      return res.status(400).json({ error: "ID de enlace no válido" });
    }
    const enlaceEliminado = await Enlace.deleteOne({_id:idEnlace})

    if (!enlaceEliminado) {
      return res.status(404).json({ error: "Enlace no encontrado" });
    }

    return res.status(200).json({
      message: " Enlace desactivado correctamente",
      enlace: enlaceActualizado,
    });

  } catch (err) {
    console.error("Error en desactivarEnlaceElevated:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};