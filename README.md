# E-commerce Backend API

Backend desarrollado con Node.js, Express y MongoDB, aplicando arquitectura por capas y patrones de diseño como DAO, Repository y DTO, junto con autenticación mediante JWT y Passport.

Este proyecto corresponde a la entrega final del curso, enfocado en mejorar la arquitectura del servidor, la seguridad y la lógica de negocio de un ecommerce.

## Tecnologías utilizadas

- Node.js
- Express
- MongoDB
- Mongoose
- Passport
- JWT (JSON Web Tokens)
- bcrypt
- Nodemailer
- dotenv

## Arquitectura del proyecto

El proyecto sigue una arquitectura en capas:

routes  
↓  
services  
↓  
repositories  
↓  
dao  
↓  
models  

### Descripción de cada capa

Routes  
Definen los endpoints de la API y reciben las peticiones HTTP.

Services  
Contienen la lógica de negocio del sistema.

Repositories  
Implementan el patrón Repository que desacopla la lógica de negocio del acceso a datos.

DAO  
Se encargan de interactuar directamente con MongoDB mediante Mongoose.

Models  
Definen los esquemas de datos.

## Autenticación y autorización

La autenticación se implementa utilizando:

- Passport
- JWT
- Cookies HTTP Only

### Flujo de autenticación

1. El usuario inicia sesión.
2. El servidor genera un JWT.
3. El token se guarda en una cookie segura.
4. Las rutas protegidas usan la estrategia Passport "current" para validar el usuario.

## Roles de usuario

### user

Puede:
- agregar productos al carrito
- comprar productos
- ver su propio carrito

### admin

Puede:
- crear productos
- actualizar productos
- eliminar productos
- consultar usuarios

## Patrón Repository

Se utiliza el patrón Repository para separar la lógica de negocio del acceso a datos.

Flujo:

ProductsService → ProductsRepository → ProductsDAO → ProductModel

Esto permite:

- separar responsabilidades
- facilitar mantenimiento
- cambiar el origen de datos sin modificar la lógica de negocio

## DTO (Data Transfer Object)

Se utiliza un DTO en la ruta:

GET /api/sessions/current

Esto evita enviar información sensible como password o datos internos del usuario.

## Recuperación de contraseña

El sistema incluye recuperación de contraseña mediante email.

### Flujo

1. El usuario solicita recuperación de contraseña.
2. Se genera un token temporal.
3. Se envía un correo con enlace de recuperación.
4. El token expira después de 1 hora.
5. El usuario establece una nueva contraseña.

Restricción:
No se puede reutilizar la contraseña anterior.

## Sistema de compra

El proceso de compra funciona de la siguiente manera:

1. El usuario intenta comprar su carrito.
2. El sistema verifica el stock de cada producto.
3. Los productos con stock suficiente se procesan.
4. Los productos sin stock quedan pendientes.

El resultado puede ser:
- compra completa
- compra parcial

## Ticket de compra

Cada compra genera un ticket con:

- código único
- fecha de compra
- monto total
- comprador

## Variables de entorno

Crear un archivo .env con las siguientes variables:

PORT=8080
MONGO_URI=mongodb://localhost:27017/ecommerce

JWT_SECRET=your_jwt_secret
JWT_COOKIE_NAME=jwtCookieToken
JWT_COOKIE_MAX_AGE=3600000

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
EMAIL_FROM=your_email@gmail.com

BASE_URL=http://localhost:8080

## Instalación

1. Clonar el repositorio

git clone <repo-url>

2. Instalar dependencias

npm install

3. Crear archivo .env

4. Ejecutar el servidor

npm start

## Endpoints principales

Auth

POST /api/sessions/register  
POST /api/sessions/login  
GET /api/sessions/current  
POST /api/sessions/logout  

Recuperación de contraseña

POST /api/sessions/forgot-password  
POST /api/sessions/reset-password  

Usuarios

GET /api/users  
GET /api/users/:uid  
POST /api/users  
PUT /api/users/:uid  
DELETE /api/users/:uid  

Productos

GET /api/products  
GET /api/products/:pid  
POST /api/products  
PUT /api/products/:pid  
DELETE /api/products/:pid  

Carritos

GET /api/carts/:cid  
POST /api/carts/:cid/products/:pid  
POST /api/carts/:cid/purchase