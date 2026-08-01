-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 10-07-2026 a las 23:22:37
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.1.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `cdl_db`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `carrito`
--

CREATE TABLE `carrito` (
  `Id_Carrito` int(11) NOT NULL,
  `Id_Usuario` int(11) DEFAULT NULL,
  `Id_Producto` int(11) DEFAULT NULL,
  `Id_Direccion` int(11) DEFAULT NULL,
  `Cantidad_Productos` int(11) DEFAULT NULL,
  `Precio_Total` decimal(10,2) DEFAULT NULL,
  `Estado_Carrito` varchar(50) DEFAULT NULL,
  `Fecha_Creacion` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias`
--

CREATE TABLE `categorias` (
  `Id_Categoria` int(11) NOT NULL,
  `Nombre_Categoria` varchar(100) DEFAULT NULL,
  `Descripcion_Categoria` text DEFAULT NULL,
  `Activo` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categorias`
--

INSERT INTO `categorias` (`Id_Categoria`, `Nombre_Categoria`, `Descripcion_Categoria`, `Activo`) VALUES
(1, 'Bodas', NULL, 1),
(2, 'Graduaciones', NULL, 0),
(3, 'Eventos', NULL, 0),
(4, 'Productos Artesanales', 'Para toda ocasion especial', 1),
(6, 'San Valentin', 'Para el mes del amor', 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_pedidos`
--

CREATE TABLE `detalle_pedidos` (
  `id` int(11) NOT NULL,
  `pedidoId` int(11) NOT NULL,
  `productoId` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `precioUnitario` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `detalle_pedidos`
--

INSERT INTO `detalle_pedidos` (`id`, `pedidoId`, `productoId`, `cantidad`, `precioUnitario`, `subtotal`, `createdAt`, `updatedAt`) VALUES
(2, 2, 1, 2, 25000.00, 50000.00, '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(8, 7, 7, 1, 85000.00, 85000.00, '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(9, 8, 1, 1, 25000.00, 25000.00, '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(10, 8, 4, 2, 95000.00, 190000.00, '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(11, 8, 3, 1, 65000.00, 65000.00, '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(12, 8, 6, 1, 85000.00, 85000.00, '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(13, 8, 5, 1, 90000.00, 90000.00, '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(14, 9, 1, 1, 25000.00, 25000.00, '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(15, 10, 3, 1, 65000.00, 65000.00, '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(16, 11, 1, 1, 25000.00, 25000.00, '0000-00-00 00:00:00', '0000-00-00 00:00:00');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `direccion`
--

CREATE TABLE `direccion` (
  `Id_Direccion` int(11) NOT NULL,
  `Id_Usuario` int(11) DEFAULT NULL,
  `Nombre_Completo` varchar(100) DEFAULT NULL,
  `Direccion` varchar(255) DEFAULT NULL,
  `Departamento` varchar(100) DEFAULT NULL,
  `Municipio_Localidad` varchar(100) DEFAULT NULL,
  `Barrio` varchar(100) DEFAULT NULL,
  `Apart_Casa` varchar(50) DEFAULT NULL,
  `Telefono` varchar(20) DEFAULT NULL,
  `Indicaciones` text DEFAULT NULL,
  `Residencia_Laboral` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `direccion`
--

INSERT INTO `direccion` (`Id_Direccion`, `Id_Usuario`, `Nombre_Completo`, `Direccion`, `Departamento`, `Municipio_Localidad`, `Barrio`, `Apart_Casa`, `Telefono`, `Indicaciones`, `Residencia_Laboral`) VALUES
(1, 1, 'Admin Dir', 'Cra 5', 'Cun', 'Bog', 'Centro', NULL, '000', NULL, 'residencial'),
(7, 5, 'Brandon Cangrejo', 'Calle 86sur #15 v 65', 'Cundinamarca', 'Usme', 'El Bosque', '65', '3201234567', 'Csa azul de 4 pisos', 'residencial'),
(11, 16, 'Samuel Parrado', 'Calle 72b sur #14v45', 'Bogotá D.C.', NULL, 'La Aurora', NULL, '3194284396', 'Casa de 3 pisos', 'residencial');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `paquetes`
--

CREATE TABLE `paquetes` (
  `Id_Paquete` int(11) NOT NULL,
  `Activo` tinyint(1) DEFAULT NULL,
  `Nombre_Paquete` varchar(100) DEFAULT NULL,
  `Descripcion_Paquete` text DEFAULT NULL,
  `Precio_Paquete` decimal(10,2) DEFAULT NULL,
  `Imagen_Paquete` varchar(255) DEFAULT NULL,
  `Id_Imagen` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `paquetes`
--

INSERT INTO `paquetes` (`Id_Paquete`, `Activo`, `Nombre_Paquete`, `Descripcion_Paquete`, `Precio_Paquete`, `Imagen_Paquete`, `Id_Imagen`) VALUES
(1, 1, 'Paquete Alpha', 'Ideal para eventos íntimos y sesiones personales.', 1500000.00, NULL, NULL),
(2, 1, 'Paquete Bravo', 'La opción preferida para bodas y quinceaños medianos.', 2800000.00, NULL, NULL),
(3, 1, 'Paquete Charlie', 'Cobertura completa premium para grandes celebraciones.', 4200000.00, NULL, NULL),
(4, 1, 'Paquete Delta', 'Especializado en graduaciones y eventos escolares.', 1800000.00, NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedidos`
--

CREATE TABLE `pedidos` (
  `id` int(11) NOT NULL,
  `usuarioId` int(11) NOT NULL,
  `total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `estado` enum('pendiente','pagado','enviado','entregado','cancelado') DEFAULT 'pendiente',
  `direccionEnvio` text NOT NULL,
  `telefono` varchar(20) NOT NULL,
  `notas` text DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pedidos`
--

INSERT INTO `pedidos` (`id`, `usuarioId`, `total`, `estado`, `direccionEnvio`, `telefono`, `notas`, `createdAt`, `updatedAt`) VALUES
(2, 1, 50000.00, 'pendiente', 'Calle 100', '3000000', 'Cuidado', '2026-04-20 17:50:40', '2026-06-30 10:31:19'),
(7, 16, 85000.00, 'pendiente', 'undefined, La Aurora, null', '3194284396', 'Casa de 3 pisos', '2026-06-30 14:45:49', '2026-06-30 14:45:49'),
(8, 16, 455000.00, 'cancelado', 'undefined, La Aurora, null', '3194284396', 'Casa de 3 pisos', '2026-06-30 15:17:52', '2026-06-30 15:18:42'),
(9, 16, 25000.00, 'cancelado', 'undefined, La Aurora, null', '3194284396', 'Casa de 3 pisos', '2026-06-30 15:20:02', '2026-06-30 15:23:35'),
(10, 16, 65000.00, 'entregado', 'undefined, La Aurora, null', '3194284396', 'Casa de 3 pisos', '2026-06-30 15:20:15', '2026-06-30 15:23:18'),
(11, 16, 25000.00, 'pagado', 'undefined, La Aurora, null', '3194284396', 'Casa de 3 pisos', '2026-06-30 15:20:33', '2026-06-30 15:22:51');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `personalizado`
--

CREATE TABLE `personalizado` (
  `Id_Personalizado` int(11) NOT NULL,
  `Id_Usuario` int(11) DEFAULT NULL,
  `Nombre_Completo` varchar(100) DEFAULT NULL,
  `Correo` varchar(100) DEFAULT NULL,
  `Numero_Telefono` varchar(20) DEFAULT NULL,
  `Destinatario` varchar(100) DEFAULT NULL,
  `Descripcion_Idea` text DEFAULT NULL,
  `Elementos_Esenciales` text DEFAULT NULL,
  `Prioridad_Cliente` varchar(50) DEFAULT NULL,
  `Comentarios_Adicionales` text DEFAULT NULL,
  `Estado_Personalizado` varchar(50) DEFAULT NULL,
  `Fecha_Solicitud` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `personalizado`
--

INSERT INTO `personalizado` (`Id_Personalizado`, `Id_Usuario`, `Nombre_Completo`, `Correo`, `Numero_Telefono`, `Destinatario`, `Descripcion_Idea`, `Elementos_Esenciales`, `Prioridad_Cliente`, `Comentarios_Adicionales`, `Estado_Personalizado`, `Fecha_Solicitud`) VALUES
(1, 1, 'Admin', 'admin@cdl.com', '3000000', 'Cliente 1', 'Caja sorpresa', 'Chocolate', 'alta', 'Urgente', 'pendiente', '2026-04-20'),
(4, 1, 'Adsoso', 'adsoso@cdl.com', '3000100', 'Cliente 2', 'Caja sorpresa', 'Chocolate', 'alta', 'Urgente', 'pendiente', '2026-04-23');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `portafolio_galeria`
--

CREATE TABLE `portafolio_galeria` (
  `Id_Imagen` int(11) NOT NULL,
  `Id_Categoria` int(11) DEFAULT NULL,
  `Nombre_Imagen` varchar(100) DEFAULT NULL,
  `Descripcion_Imagen` text DEFAULT NULL,
  `Archivo` varchar(255) DEFAULT NULL,
  `Activo` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `Id_Producto` int(11) NOT NULL,
  `Activo` tinyint(1) DEFAULT NULL,
  `Nombre_Producto` varchar(100) DEFAULT NULL,
  `Descripcion_Producto` text DEFAULT NULL,
  `Precio_Producto` decimal(10,2) DEFAULT NULL,
  `Imagen_Producto` varchar(255) DEFAULT NULL,
  `Id_Imagen` int(11) DEFAULT NULL,
  `Id_Categoria` int(11) DEFAULT NULL,
  `Stock` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`Id_Producto`, `Activo`, `Nombre_Producto`, `Descripcion_Producto`, `Precio_Producto`, `Imagen_Producto`, `Id_Imagen`, `Id_Categoria`, `Stock`) VALUES
(1, 1, 'Cajita Corazón', 'Cajita decorativa con diseño de corazón.', 25000.00, NULL, NULL, 1, 99),
(2, 1, 'Bolsa Sorpresa', 'Bolsa llena de sorpresas personalizadas.', 65000.00, NULL, NULL, 4, 100),
(3, 1, 'Caja Multifotográfica', 'Caja con múltiples fotos desplegables.', 65000.00, NULL, NULL, 4, 99),
(4, 1, 'Libro Emoción', 'Libro álbum para capturar emociones.', 95000.00, NULL, NULL, 4, 100),
(5, 0, 'Arreglo Floral', 'Mix de rosas', 90000.00, NULL, NULL, 1, 100),
(6, 0, 'Arreglo Mega Floral', 'Mix de rosas', 85000.00, NULL, NULL, 1, 100),
(7, 1, 'Peluche', '1', 85000.00, NULL, NULL, 1, 99),
(9, 1, 'Caja Sena', 'Prueba', 50000.00, NULL, NULL, 1, 20);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reserva_paquetes`
--

CREATE TABLE `reserva_paquetes` (
  `Id_Reserva_Paquete` int(11) NOT NULL,
  `Id_Paquete` int(11) DEFAULT NULL,
  `Id_Usuario` int(11) DEFAULT NULL,
  `Nombre_Completo` varchar(100) DEFAULT NULL,
  `Correo` varchar(100) DEFAULT NULL,
  `Numero_Telefono` varchar(20) DEFAULT NULL,
  `Tipo_Evento` varchar(100) DEFAULT NULL,
  `Fecha_Evento` date DEFAULT NULL,
  `Fecha_Reserva` date DEFAULT NULL,
  `Numero_Invitados` int(11) DEFAULT NULL,
  `Informacion_Adicional` text DEFAULT NULL,
  `Estado_Reserva_Paquete` varchar(50) DEFAULT NULL,
  `Precio_Total` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `reserva_paquetes`
--

INSERT INTO `reserva_paquetes` (`Id_Reserva_Paquete`, `Id_Paquete`, `Id_Usuario`, `Nombre_Completo`, `Correo`, `Numero_Telefono`, `Tipo_Evento`, `Fecha_Evento`, `Fecha_Reserva`, `Numero_Invitados`, `Informacion_Adicional`, `Estado_Reserva_Paquete`, `Precio_Total`) VALUES
(7, 1, 16, 'Cliente  Adso', 'cliente1@gmail.com', '3142108863', 'Boda', '2026-07-12', '2026-06-30', 50, 'Prueba con el instructor ', 'agendada', NULL),
(8, 1, 16, 'Cliente  Adso', 'cliente1@gmail.com', '3142108863', 'Boda', '2027-07-12', '2026-06-30', 50, '', 'mision_cumplida', NULL),
(9, 2, 16, 'Cliente  Adso', 'cliente1@gmail.com', '3142108863', 'Boda', '2027-07-12', '2026-06-30', 65, '', 'agendada', NULL),
(10, 3, 16, 'Cliente  Adso', 'cliente1@gmail.com', '3142108863', 'Bautizo', '2027-07-12', '2026-06-30', 61, 'Solicitud 3', 'en_contacto', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reseñas`
--

CREATE TABLE `reseñas` (
  `Id_Reseña` int(11) NOT NULL,
  `Nombre_Usuario` varchar(100) DEFAULT NULL,
  `Calificacion` int(11) DEFAULT NULL,
  `Comentario` text DEFAULT NULL,
  `Id_Usuario` int(11) DEFAULT NULL,
  `Activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `reseñas`
--

INSERT INTO `reseñas` (`Id_Reseña`, `Nombre_Usuario`, `Calificacion`, `Comentario`, `Id_Usuario`, `Activo`) VALUES
(2, 'Juan', 4, 'Muy buen servicio', NULL, 1),
(7, 'Samuel Parrado', 5, 'Estan melos', NULL, 1),
(8, 'Samuel Parrado', 5, 'Muy buena experiencia', 7, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rol`
--

CREATE TABLE `rol` (
  `Id_Rol` int(11) NOT NULL,
  `Nombre_Rol` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `rol`
--

INSERT INTO `rol` (`Id_Rol`, `Nombre_Rol`) VALUES
(1, 'admin'),
(2, 'cliente'),
(3, 'auxiliar');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `Id_Usuario` int(11) NOT NULL,
  `Nombre` varchar(100) DEFAULT NULL,
  `Apellidos` varchar(100) DEFAULT NULL,
  `Celular` varchar(20) DEFAULT NULL,
  `Correo` varchar(100) DEFAULT NULL,
  `Contraseña` varchar(255) DEFAULT NULL,
  `Id_Rol` int(11) DEFAULT NULL,
  `Activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`Id_Usuario`, `Nombre`, `Apellidos`, `Celular`, `Correo`, `Contraseña`, `Id_Rol`, `Activo`) VALUES
(1, 'Admin', 'Nuevo', '3000000000', 'admin@cdl.com', '$2a$10$a93lXmKVDGf1kGanpvD1QOhh4UW3kEhyfMygoPwsbxsjtYzfTOPeq', 1, 1),
(12, 'Samuel', 'Parrado', '3194284396', 'samuel@gmail.com', '$2a$10$m7PAOFqsn3aGWH6sshkL3eQVYiQDMWH6fnpu7oeQQJqZv0G1Hwpfe', 3, 1),
(13, 'Johan', 'Tellez', '3192739978', 'johan@gmail.com', '$2a$10$c07Tcwxls0McwjPEL1bI3u02VU7Ls2aSZ2S8x3Z4h3gGSsUJa/flO', 3, 1),
(14, 'Roberto', 'Ramirez', '3122457008', 'roberto@gmail.com', '$2a$10$xA2kS4mv6szFnP4ZG7vMWezCmZnlVASxpNt4Bdm7t4tS0JwVefZOC', 1, 1),
(15, 'Felipe', 'Carvajal', '3203479355', 'felipe@gmail.com', '$2a$10$vz.tpWT1ptDXBAOSnbKFLebArMXLpf/HwWPqRvZ/HUlzhYU63AVO6', 3, 1),
(16, 'Cliente ', 'Adso', '3142108863', 'cliente1@gmail.com', '$2a$10$6laq8Lq5hTu79pCLn7uNL.1mWRrhqq3cbhZBZPWVo5yj6sQa7Z9y2', 2, 1);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `carrito`
--
ALTER TABLE `carrito`
  ADD PRIMARY KEY (`Id_Carrito`),
  ADD KEY `Id_Usuario` (`Id_Usuario`),
  ADD KEY `Id_Producto` (`Id_Producto`),
  ADD KEY `Id_Direccion` (`Id_Direccion`);

--
-- Indices de la tabla `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`Id_Categoria`);

--
-- Indices de la tabla `detalle_pedidos`
--
ALTER TABLE `detalle_pedidos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pedidoId` (`pedidoId`),
  ADD KEY `productoId` (`productoId`);

--
-- Indices de la tabla `direccion`
--
ALTER TABLE `direccion`
  ADD PRIMARY KEY (`Id_Direccion`),
  ADD KEY `Id_Usuario` (`Id_Usuario`);

--
-- Indices de la tabla `paquetes`
--
ALTER TABLE `paquetes`
  ADD PRIMARY KEY (`Id_Paquete`),
  ADD KEY `Id_Imagen` (`Id_Imagen`);

--
-- Indices de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuarioId` (`usuarioId`);

--
-- Indices de la tabla `personalizado`
--
ALTER TABLE `personalizado`
  ADD PRIMARY KEY (`Id_Personalizado`),
  ADD KEY `Id_Usuario` (`Id_Usuario`);

--
-- Indices de la tabla `portafolio_galeria`
--
ALTER TABLE `portafolio_galeria`
  ADD PRIMARY KEY (`Id_Imagen`),
  ADD KEY `Id_Categoria` (`Id_Categoria`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`Id_Producto`),
  ADD KEY `Id_Imagen` (`Id_Imagen`),
  ADD KEY `Id_Categoria` (`Id_Categoria`);

--
-- Indices de la tabla `reserva_paquetes`
--
ALTER TABLE `reserva_paquetes`
  ADD PRIMARY KEY (`Id_Reserva_Paquete`),
  ADD KEY `Id_Paquete` (`Id_Paquete`),
  ADD KEY `Id_Usuario` (`Id_Usuario`);

--
-- Indices de la tabla `reseñas`
--
ALTER TABLE `reseñas`
  ADD PRIMARY KEY (`Id_Reseña`);

--
-- Indices de la tabla `rol`
--
ALTER TABLE `rol`
  ADD PRIMARY KEY (`Id_Rol`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`Id_Usuario`),
  ADD KEY `Id_Rol` (`Id_Rol`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `carrito`
--
ALTER TABLE `carrito`
  MODIFY `Id_Carrito` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT de la tabla `categorias`
--
ALTER TABLE `categorias`
  MODIFY `Id_Categoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `detalle_pedidos`
--
ALTER TABLE `detalle_pedidos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT de la tabla `direccion`
--
ALTER TABLE `direccion`
  MODIFY `Id_Direccion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `paquetes`
--
ALTER TABLE `paquetes`
  MODIFY `Id_Paquete` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `personalizado`
--
ALTER TABLE `personalizado`
  MODIFY `Id_Personalizado` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `portafolio_galeria`
--
ALTER TABLE `portafolio_galeria`
  MODIFY `Id_Imagen` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `Id_Producto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `reserva_paquetes`
--
ALTER TABLE `reserva_paquetes`
  MODIFY `Id_Reserva_Paquete` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `reseñas`
--
ALTER TABLE `reseñas`
  MODIFY `Id_Reseña` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `rol`
--
ALTER TABLE `rol`
  MODIFY `Id_Rol` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `Id_Usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `carrito`
--
ALTER TABLE `carrito`
  ADD CONSTRAINT `carrito_ibfk_1` FOREIGN KEY (`Id_Usuario`) REFERENCES `usuarios` (`Id_Usuario`),
  ADD CONSTRAINT `carrito_ibfk_2` FOREIGN KEY (`Id_Producto`) REFERENCES `productos` (`Id_Producto`),
  ADD CONSTRAINT `carrito_ibfk_3` FOREIGN KEY (`Id_Direccion`) REFERENCES `direccion` (`Id_Direccion`),
  ADD CONSTRAINT `direccion_ibfk_1` FOREIGN KEY (`Id_Usuario`) REFERENCES `usuarios` (`Id_Usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `detalle_pedidos`
--
ALTER TABLE `detalle_pedidos`
  ADD CONSTRAINT `detalle_pedidos_ibfk_1` FOREIGN KEY (`pedidoId`) REFERENCES `pedidos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `detalle_pedidos_ibfk_2` FOREIGN KEY (`productoId`) REFERENCES `productos` (`Id_Producto`);

--
-- Filtros para la tabla `paquetes`
--
ALTER TABLE `paquetes`
  ADD CONSTRAINT `paquetes_ibfk_1` FOREIGN KEY (`Id_Imagen`) REFERENCES `portafolio_galeria` (`Id_Imagen`);

--
-- Filtros para la tabla `pedidos`
--
ALTER TABLE `pedidos`
  ADD CONSTRAINT `pedidos_ibfk_1` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios` (`Id_Usuario`) ON DELETE CASCADE;

--
-- Filtros para la tabla `personalizado`
--
ALTER TABLE `personalizado`
  ADD CONSTRAINT `personalizado_ibfk_1` FOREIGN KEY (`Id_Usuario`) REFERENCES `usuarios` (`Id_Usuario`);

--
-- Filtros para la tabla `portafolio_galeria`
--
ALTER TABLE `portafolio_galeria`
  ADD CONSTRAINT `portafolio_galeria_ibfk_1` FOREIGN KEY (`Id_Categoria`) REFERENCES `categorias` (`Id_Categoria`);

--
-- Filtros para la tabla `productos`
--
ALTER TABLE `productos`
  ADD CONSTRAINT `productos_ibfk_1` FOREIGN KEY (`Id_Imagen`) REFERENCES `portafolio_galeria` (`Id_Imagen`),
  ADD CONSTRAINT `productos_ibfk_2` FOREIGN KEY (`Id_Categoria`) REFERENCES `categorias` (`Id_Categoria`);

--
-- Filtros para la tabla `reserva_paquetes`
--
ALTER TABLE `reserva_paquetes`
  ADD CONSTRAINT `reserva_paquetes_ibfk_1` FOREIGN KEY (`Id_Paquete`) REFERENCES `paquetes` (`Id_Paquete`),
  ADD CONSTRAINT `reserva_paquetes_ibfk_2` FOREIGN KEY (`Id_Usuario`) REFERENCES `usuarios` (`Id_Usuario`);

--
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`Id_Rol`) REFERENCES `rol` (`Id_Rol`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
