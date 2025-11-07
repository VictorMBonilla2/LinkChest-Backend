import mongoose from "mongoose";


const connectDB = async (URIBD) => {
  try {
    await mongoose.connect(URIBD);
    console.log("✅ Conectado a MongoDB");
  } catch (err) {
    console.error("❌ Error al conectar a MongoDB:", err.message);
    process.exit(1);
  }
};
export default connectDB;