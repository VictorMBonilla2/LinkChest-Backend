# LinkChest Backend

![Node.js](https://raw.githubusercontent.com/github/explore/main/topics/nodejs/nodejs.png)
![Express](https://raw.githubusercontent.com/github/explore/main/topics/express/express.png)
![MongoDB](https://raw.githubusercontent.com/github/explore/main/topics/mongodb/mongodb.png)
![Mongoose](https://raw.githubusercontent.com/github/explore/main/topics/mongoose/mongoose.png)

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
git clone 
cd LinkChest-Backend
npm install
```

---

## ▶️ Ejecución del Proyecto

### Modo producción

```bash
npm start
```

### Modo desarrollo

```bash
npm run dev
```

---

## 🔌 Variables de Entorno

Crea un archivo `.env` con las variables proporcionas en `.env.example` con, por ejemplo:

```json
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

## 📬 Contribuir

1. Haz un fork del proyecto
2. Crea una rama para tu mejora: `git checkout -b feature-nueva`
3. Haz commit: `git commit -m "Agrega nueva feature"`
4. Envía un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la licencia **MIT**.
