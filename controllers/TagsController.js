import Enlace from "../models/Enlace.js";
import Tag from "../models/Tag.js";
import mongoose from "mongoose";
import { validarIDEntrante } from "../utils/ValidarId.js";



export const obtenerTagsByUser = async (req, res) => {
  try {
    const user = req.user;
    const id = validarIDEntrante(user.id)
    console.log("es valido? " + id);

    const tags = await Enlace.aggregate([
    { $match: { usuarioId: new mongoose.mongo.ObjectId(user.id)} },

    { $unwind: "$tags" },
    // convierte el array de tags en documentos individuales
    // si un Enlace tiene [t1, t2], ahora tendrás 2 documentos separados
    {
        $lookup: {
        from: "tags",              // colección de destino
        localField: "tags",        // el campo de Enlace
        foreignField: "_id",       // contra qué campo de Tag se compara
        as: "tagInfo"              // el nombre del nuevo campo donde se guardará el match
        }
    },
    // hace el equivalente a un JOIN entre Enlace.tags y Tag._id
    { $unwind: "$tagInfo" },

    {
        $group: {
        _id: "$tagInfo._id",      
        name: { $first: "$tagInfo.name" }
        }
    }
    ]);
    res.json(tags);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener tags" });
  }
};