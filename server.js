import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import usuariosRoutes from "./routes/usuarios.routes.js";
import sudoUsuariosRoutes from "./routes/usuariosSudo.routes.js"
import enlacesRoutes from "./routes/enlaces.routes.js";
import sudoEnlaceRoutes from "./routes/enlacesSudo.routes.js"
import tagsRoutes from "./routes/tags.routes.js";
import autRoutes from "./routes/auth.routes.js";
import carpetasRoutes from "./routes/carpetas.routes.js"
import cookieParser from "cookie-parser";
import analiticaRoutes from "./routes/analitica.routes.js";



//Leer archivo .env
dotenv.config();


const app = express();


const allowedOrigins = [
  `${process.env.CLIENT_URL}`,
  `${process.env.CHROME_EXTENSION_URL}` 
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("No permitido por CORS"));
    }
  },
  credentials: true,
}));
app.use(express.json()); // parsear JSON del body
app.use(cookieParser())


// Rutas
app.get("/", (req, res) => {
  res.send("Servidor funcionando 🚀 y conectado a MongoDB");
});

app.use("/api/usuarios", usuariosRoutes);
app.use("/api/sudo/usuarios",sudoUsuariosRoutes)

app.use("/api/enlaces", enlacesRoutes);
app.use("/api/sudo/enlaces", sudoEnlaceRoutes)

app.use("/api/tags", tagsRoutes)
app.use("/api/carpetas", carpetasRoutes)
app.use("/api/analiticas", analiticaRoutes);
app.use("/auth", autRoutes);


const URIBD= process.env.MONGO_URI;

const PORT = process.env.PORT;

const startServer = async () => {
  try {
    await connectDB(URIBD);
    app.listen(PORT, () => {
      console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Error iniciando el servidor:", err.message);
    process.exit(1);
  }
};

startServer();