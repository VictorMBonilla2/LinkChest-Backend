import { isValidObjectId } from "mongoose";
import Carpeta from "../models/Carpeta.js"
import { crearCarpetaService, editarCarpetaService, eliminarCarpetaService, existeCarpetaById, existeCarpetabyIdWithNombre } from "../services/CarpetasService.js";


export const obtenerCarpetasWithContentByUser = async (req, res) => {
  const user = req.user

  try {
    const carpetas = await Carpeta.aggregate([
      { $match: { userId: user._id } },
      {
        $lookup: {
          from: "enlaces",
          localField: "_id",
          foreignField: "carpetaId",
          as: "children"
        }
      },
      {
        $project: {
          id: "$_id",
          label: "$nombre",
          children: {
            $map: {
              input: "$children",
              as: "hijo",
              in: {
                id: "$$hijo._id",
                label: "$$hijo.titulo",   
                fileType: { $literal: "page" }   
              }
            }
          },
          fileType: { $literal: "folder" }
        }
      }
    ]);

    res.status(200).json({
      message: "Carpetas obtenidas correctamente",
      carpetas
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error interno al obtener carpetas"
    });
  }
};

export const obtenerCarpetasByUser = async (req, res) => {
  const user = req.user
  try {
    const listaCarpetas = await Carpeta.find({ userId: user._id }).lean();

    const list = listaCarpetas.map(item => {
      return { value: item._id, label: item.nombre }
    })

    res.status(200).json({
      message: "Carpetas obtenidas correctamente",
      list
    });

  } catch (error) {
    console.error("Error interno al obtener carpetas del usuario.", error);
  }

}


export const crearCarpeta = async (req, res) => {
  const user = req.user
  const { nombre } = req.body

  try {
    // Validar existencia
    const existeNombre = await existeCarpetabyIdWithNombre({
      userId: user._id,
      nombreCarpeta: nombre
    })

    if (!existeNombre.ok) {
      return res.status(400).json({ error: existeNombre.message })
    }

    if (existeNombre.existe) {
      return res.status(400).json({ error: existeNombre.message })
    }

    const newCarpeta = await crearCarpetaService(user._id, nombre)

    res.status(200).json({
      message: "Carpeta creada correctamente",
      newCarpeta
    })
  } catch (error) {
    console.error("Error interno en crearCarpeta: ", error)
    res.status(500).json({
      error: "Error interno del servidor."
    })
  }
}

export const editarCarpeta = async (req, res) => {
  const user = req.user;
  const { idCarpeta, nombre } = req.body;
  console.log(req.body);


  try {
    const { error, data } = await editarCarpetaService({
      userId: user._id,
      carpetaId: idCarpeta,
      nuevoNombre: nombre
    });

    if (error) {
      return res.status(400).json({ error });
    }

    res.status(200).json({
      message: "Carpeta actualizada correctamente",
      carpeta: data
    });
  } catch (error) {
    res.status(500).json({
      error: "Error interno del servidor. " + error.message
    });
  }
};


export const eliminarCarpeta = async (req, res) => {
  const user = req.user;
  const { idCarpeta } = req.params;
  
  try {
    const { error, ok, message } = await eliminarCarpetaService({
      idCarpeta,
      userId: user._id
    });

    if (error) {
      return res.status(400).json({ error });
    }

    res.status(200).json({ ok, message });
  } catch (err) {
    console.error("Error eliminando carpeta (controller):", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};