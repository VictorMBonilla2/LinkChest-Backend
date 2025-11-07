import mongoose from "mongoose";

const IntegracionSchema = new mongoose.Schema({
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
  servicio: { type: String, enum: ["notion", "google-drive", "dropbox"], required: true },
  token: { type: String, required: true }, // Encriptado
  ultimoSync: { type: Date, default: Date.now },
  config: {
    workspaceId: { type: String },
    carpetaDestino: { type: String }
  }
});

module.exports = mongoose.model("Integracion", IntegracionSchema);
