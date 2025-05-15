# 🎥 KidsTube - Plataforma de Video Segura para Niños

## 📌 Descripción del Proyecto

**KidsTube** es una plataforma web orientada a padres de familia que permite controlar qué contenidos de video pueden ver sus hij@s. Los padres pueden agregar videos desde YouTube o subir videos propios a la plataforma, garantizando así una experiencia segura y controlada.

El sistema sigue una **Arquitectura Orientada a Servicios**, integrando servicios RESTful y GraphQL para el manejo de datos, junto con servicios de terceros como YouTube, Twilio y MailerSend para funcionalidades clave.

---

## 🎯 Objetivos

- Permitir el registro seguro de usuarios con verificación por correo y autenticación de dos pasos.
- Integrar búsqueda de videos mediante el API de YouTube.
- Controlar el acceso a contenidos a través de perfiles configurables.
- Ofrecer un sistema moderno de autenticación (JWT, Google OAuth2).
- Implementar servicios GraphQL para consultas y búsquedas avanzadas.

---

## 🚀 Tecnologías Utilizadas

- **Frontend:** Angular CLI v19.1.8
- **Backend:** Node.js v22.13.1 (REST y GraphQL API)
- **Autenticación:** JWT, Autenticación de 2 pasos (Twilio), Google OAuth2
- **Base de Datos:** (Dependiendo de tu stack: MongoDB, PostgreSQL, etc.)
- **Servicios externos:** YouTube API, Twilio, MailerSend

---

## 🔐 Funcionalidades Principales

### 🔸 Registro y Autenticación
- Registro de usuario con número telefónico obligatorio.
- Verificación por correo electrónico (MailerSend).
- Autenticación de dos pasos vía SMS (Twilio).
- Registro/Login con Google y completación del perfil.

### 🔸 Frontend
- Interfaz construida con Angular.
- Gestión de perfiles infantiles.
- Autenticación en cada solicitud (JWT).
- Búsqueda e inclusión de videos desde YouTube.

### 🔸 Backend
- Servicios RESTful para gestión de usuarios, videos y listas.
- Servicios GraphQL para consultas:
  - Listado de Perfiles
  - Listado de Videos
  - Listado de Playlists
  - Búsqueda de Videos

---

## 🛠️ Instalación y Ejecución

### Requisitos Previos
- Node.js v22.13.1+
- Angular CLI v19.1.8
- MongoDB/PostgreSQL (según tu stack)
- API Keys: Twilio, YouTube Data API v3, MailerSend

### Pasos Generales

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/kidstube-frontend.git
   cd kidstube-frontend

📂 Repositories
Frontend = https://github.com/Gredy-Co/KidsTube-Frontend 

GraphQL = https://github.com/Gredy-Co/KidsTube-GraphQL
