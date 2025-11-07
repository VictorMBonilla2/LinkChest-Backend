import mongoose from "mongoose";


const UsuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  username: { type: String},
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, 
  estado:{type: String, enum: ["activo", "inactivo"], default:"activo"},
  isGoogleAccount: { type: Boolean, default: false },
  plan: { type: String, enum: ["free", "premium"], default: "free" },
  fechaRegistro: { type: Date, default: Date.now },
  rol:{type: String, enum: ["user", "addm"], default: "user"},
  configuracion: {
    tema: { type: String, default: "claro" },
    lenguaje: { type: String, default: "es" },
    sincronizacion: { type: Boolean, default: true }
  }

  
},  { collection: "Users" } );
export default mongoose.model("Usuario", UsuarioSchema);
