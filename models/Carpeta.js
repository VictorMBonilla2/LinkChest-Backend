import mongoose from "mongoose";

const CarpetaSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  fechaRegistro: { type: Date, default: Date.now },
});

export default mongoose.model("Carpeta", CarpetaSchema);