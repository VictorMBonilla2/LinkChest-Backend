import mongoose from "mongoose";

const NotificacionAnaliticaSchema = new mongoose.Schema({
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
  enlaceId: { type: mongoose.Schema.Types.ObjectId, ref: "Enlace", required: true },

  // Datos contextuales
  tipoRecordatorio: { type: String, enum: ["preciso", "inteligente"], required: true },
  intensidadRecordatorio: { type: String, enum: ["baja", "normal", "alta"], default: "normal" },

  // Fechas importantes
  fechaGeneracion: { type: Date, default: Date.now }, // Cuándo se disparó la notificación
  fechaClick: { type: Date, default: null },           // Cuándo se hizo clic
  tiempoRespuestaMs: { type: Number, default: null },  // Diferencia entre click y generacion

  // Estado
  fueClickeada: { type: Boolean, default: false }, // Si el usuario hizo clic o no
  fueMostrada: { type: Boolean, default: true },   // Si llegó a mostrarse (por si se cancela antes)
  cerradoAutomatico: { type: Boolean, default: false }, // Si se cerró sin interacción

  // Extras útiles
  origen: { type: String, enum: ["chrome", "firefox", "edge", "desconocido"], default: "chrome" },
  versionExtension: { type: String, default: "1.0.0" }, // para seguimiento de versiones
});
export const NotificacionAnalitica = mongoose.model("NotificacionAnalitica", NotificacionAnaliticaSchema);