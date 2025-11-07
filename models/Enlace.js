import mongoose from "mongoose";

const EnlaceSchema = new mongoose.Schema({
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
  url: { type: String, required: true },
  titulo: { type: String },
  descripcion: { type: String },
  tags: [{ type: mongoose.Schema.Types.ObjectId, ref:"Tag"}],
  favorito: { type: Boolean, default: false },
  tipoRecordatorio: {type: String, enum: ["ninguno", "preciso", "inteligente"], default:"ninguno"},
  estado:{type: String, enum: ["activo", "inactivo"], default:"activo"},
  
  // Recordatorio preciso
  diasSeleccionados: [{ type: String, enum: ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"] }],
  horaRecordatorio: { type: String }, // Formato   "HH:MM". Recordatorio tipo preciso

  // Recordatorio inteligente
  frecuencia: { type: String, enum: ["baja", "normal", "alta"], default: "normal" },//Recordatorio tipo inteligente
  ultimoAviso:{ type: Date, default: null },
  avisosHoy: { type: Number, default: 0 },//Número de avisos enviados hoy (Inteligente)
  fechaUltimoAvisoReseteo: { type: Date, default: null }, //Aux para reset de "avisosHoy" (Inteligente)

  clicks: { type: Number, default: 0 },
  origen: { type: String, enum: ["chrome", "firefox", "edge", "desconocido"], default: "chrome" },
  fechaGuardado: { type: Date, default: Date.now },
  fechaUltimaActualizacion: { type: Date, default: Date.now },
  carpetaId: { type: mongoose.Schema.Types.ObjectId, ref: "Carpeta" }
});

export default mongoose.model("Enlace", EnlaceSchema);
