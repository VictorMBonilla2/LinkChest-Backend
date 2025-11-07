# LinkChest Backend

<p align="center">
  <img src="https://raw.githubusercontent.com/github/explore/main/topics/nodejs/nodejs.png" width="70" />
  <img src="https://raw.githubusercontent.com/github/explore/main/topics/express/express.png" width="70" />
  <img src="https://raw.githubusercontent.com/github/explore/main/topics/mongodb/mongodb.png" width="70" />
  <img src="https://raw.githubusercontent.com/github/explore/main/topics/mongoose/mongoose.png" width="70" />
</p>


## 📌 Descripción

LinkChest Backend es la **API principal** del proyecto **LinkChest**, encargada de manejar todas las solicitudes, lógica de negocio y comunicación con la base de datos.

Este backend proporciona endpoints para gestionar enlaces, usuarios, sesiones y utilidades necesarias para la aplicación.

---

## 🚀 Tecnologías Utilizadas

- **Node.js** – Entorno de ejecución
- **Express** – Framework para construir la API
- **MongoDB** – Base de datos NoSQL
- **Mongoose** – ODM para manejar modelos y esquemas

---

## 📁 Estructura del Proyecto

La estructura base del backend:

```bash
LinkChest-Backend/
│
├── config/        # Configuración general del proyecto (DB, env, etc.)
├── controllers/   # Controladores que manejan la lógica de cada endpoint
├── models/        # Modelos de Mongoose
├── routes/        # Rutas de la API
├── service/       # Servicios reutilizables
├── utils/         # Utilidades y helpers
│
├── app.js         # Configuración principal de Express
└── server.js      # Punto de entrada del servidor
```

---

## ⚙️ Instalación

```bash
git clone <url_repository>
cd LinkChest-Backend
npm install
```

---

## ▶️ Ejecución del Proyecto

### Modo desarrollo

```bash
npm run dev
```

---

## 🔌 Variables de Entorno

Crea un archivo `.env` con las variables proporcionas en `.env.example` con, por ejemplo:

```bash
PORT=4000
MONGO_URI=mongodb://localhost:27017/linkchest
JWT_SECRET=tu_clave_secreta
```

---

## ✅ Características

- API modular con Express
- Controladores separados
- Integración con MongoDB mediante Mongoose
- Estructura escalable
- Manejo de errores y middlewares

---

## 📄 Licencia

Este proyecto está bajo la licencia **MIT**.
