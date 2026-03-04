-- MySQL dump 10.13  Distrib 8.0.42-33, for Linux (x86_64)
--
-- Host: localhost    Database: gestortorneos
-- ------------------------------------------------------
-- Server version	8.0.42-33

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
/*!50717 SELECT COUNT(*) INTO @rocksdb_has_p_s_session_variables FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'performance_schema' AND TABLE_NAME = 'session_variables' */;
/*!50717 SET @rocksdb_get_is_supported = IF (@rocksdb_has_p_s_session_variables, 'SELECT COUNT(*) INTO @rocksdb_is_supported FROM performance_schema.session_variables WHERE VARIABLE_NAME=\'rocksdb_bulk_load\'', 'SELECT 0') */;
/*!50717 PREPARE s FROM @rocksdb_get_is_supported */;
/*!50717 EXECUTE s */;
/*!50717 DEALLOCATE PREPARE s */;
/*!50717 SET @rocksdb_enable_bulk_load = IF (@rocksdb_is_supported, 'SET SESSION rocksdb_bulk_load = 1', 'SET @rocksdb_dummy_bulk_load = 0') */;
/*!50717 PREPARE s FROM @rocksdb_enable_bulk_load */;
/*!50717 EXECUTE s */;
/*!50717 DEALLOCATE PREPARE s */;

--
-- Table structure for table `deporte`
--

DROP TABLE IF EXISTS `deporte`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `deporte` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `cant_min_jugadores` int NOT NULL,
  `cant_max_jugadores` int NOT NULL,
  `duracion` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `deporte`
--

LOCK TABLES `deporte` WRITE;
/*!40000 ALTER TABLE `deporte` DISABLE KEYS */;
INSERT INTO `deporte` VALUES (13,'futbol 11',11,22,90),(17,'voley',11,15,60),(18,'Basquet',6,12,40),(20,'tenis',1,1,123),(21,'patinaje',1,1,0),(22,'boxeo',1,1,20),(23,'hockey',11,12,90),(24,'Padel',1,2,0);
/*!40000 ALTER TABLE `deporte` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `equipo`
--

DROP TABLE IF EXISTS `equipo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `equipo` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `nombre_capitan` varchar(255) NOT NULL,
  `puntos` int NOT NULL,
  `es_publico` tinyint(1) NOT NULL,
  `contrasenia` varchar(255) DEFAULT NULL,
  `evento_id` int unsigned NOT NULL,
  `capitan_id` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `equipo_evento_id_index` (`evento_id`),
  KEY `equipo_capitan_id_index` (`capitan_id`),
  CONSTRAINT `equipo_capitan_id_foreign` FOREIGN KEY (`capitan_id`) REFERENCES `usuario` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `equipo_evento_id_foreign` FOREIGN KEY (`evento_id`) REFERENCES `evento` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `equipo`
--

LOCK TABLES `equipo` WRITE;
/*!40000 ALTER TABLE `equipo` DISABLE KEYS */;
INSERT INTO `equipo` VALUES (1,'prueba 1','Francisco',0,1,NULL,24,6),(3,'fran','Francisco',0,1,NULL,21,6),(5,'equipo de admin2','Francisco',0,1,NULL,24,41),(9,'Belgrano Rojo','Francisco',0,1,NULL,16,6),(10,'Belgrano Rojo edit','Francisco',0,0,'555',15,6),(13,'Belgrano Rojo 2','Francisco',0,1,NULL,15,9),(15,'muestra','Francisco',0,1,NULL,26,6),(16,'prueba 2','Francisco',0,1,NULL,28,6),(17,'copito','florencia',0,1,NULL,15,42),(18,'Tamponcitos','Francisco',0,0,'1234',29,9),(19,'equipazo2','Fran',0,1,NULL,30,6),(22,'equipo provider','Fran admin',0,1,NULL,34,6),(24,'Central','Fran usuario',0,1,NULL,31,9),(25,'Newells','Fran usuario',0,0,'123456',33,9),(26,'Expulsame','Fran admin',0,1,NULL,31,6);
/*!40000 ALTER TABLE `equipo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `equipo_miembros`
--

DROP TABLE IF EXISTS `equipo_miembros`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `equipo_miembros` (
  `equipo_id` int unsigned NOT NULL,
  `usuario_id` int unsigned NOT NULL,
  PRIMARY KEY (`equipo_id`,`usuario_id`),
  KEY `equipo_miembros_equipo_id_index` (`equipo_id`),
  KEY `equipo_miembros_usuario_id_index` (`usuario_id`),
  CONSTRAINT `equipo_miembros_equipo_id_foreign` FOREIGN KEY (`equipo_id`) REFERENCES `equipo` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `equipo_miembros_usuario_id_foreign` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `equipo_miembros`
--

LOCK TABLES `equipo_miembros` WRITE;
/*!40000 ALTER TABLE `equipo_miembros` DISABLE KEYS */;
INSERT INTO `equipo_miembros` VALUES (1,6),(3,6),(5,41),(9,6),(10,6),(10,41),(13,9),(15,6),(16,6),(17,42),(18,9),(19,6),(19,9),(22,6),(24,9),(25,6),(25,9),(26,6);
/*!40000 ALTER TABLE `equipo_miembros` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `establecimiento`
--

DROP TABLE IF EXISTS `establecimiento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `establecimiento` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `direccion` varchar(255) NOT NULL,
  `evento_id` int unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `establecimiento_evento_id_index` (`evento_id`),
  CONSTRAINT `establecimiento_evento_id_foreign` FOREIGN KEY (`evento_id`) REFERENCES `evento` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `establecimiento`
--

LOCK TABLES `establecimiento` WRITE;
/*!40000 ALTER TABLE `establecimiento` DISABLE KEYS */;
INSERT INTO `establecimiento` VALUES (1,'Club Somisa','los ceibos 1950',NULL),(2,'Estadio Unico San Nicolas','1453 Presidente Roca',24),(3,'Estadio Unico de la Plata','en la plata 123',25),(4,'mi casa','1453 Presidente Roca',25),(5,'mi casa','roca 1453',25),(6,'mi casa','roca 1453',25),(8,'mi casa','Pres. Roca 1454, S2000CYD Rosario, Santa Fe, Argentina',16),(9,'utn frro','Zeballos 1341, S2000 Rosario, Santa Fe, Argentina',16),(10,'mi casa','Pres. Roca 1453, S2000CYC Rosario, Santa Fe, Argentina',26),(13,'Depto Rosario','Pres. Roca 1453, S2000CYC Rosario, Santa Fe, Argentina',15),(14,'Mi casa en el pueblo','Carlos Gardel 75, B2905 Gral. Rojo, Provincia de Buenos Aires, Argentina',15),(16,'Universidad Tecnologica Nacional','Zeballos 1341, S2000 Rosario, Santa Fe, Argentina',34);
/*!40000 ALTER TABLE `establecimiento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `evento`
--

DROP TABLE IF EXISTS `evento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `evento` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `es_publico` tinyint(1) NOT NULL,
  `contrasenia` varchar(255) DEFAULT NULL,
  `cant_equipos_max` int NOT NULL,
  `fecha_inicio_inscripcion` datetime NOT NULL,
  `fecha_fin_inscripcion` datetime NOT NULL,
  `fecha_inicio_evento` datetime DEFAULT NULL,
  `fecha_fin_evento` datetime DEFAULT NULL,
  `deporte_id` int unsigned DEFAULT NULL,
  `localidad_id` int unsigned NOT NULL,
  `descripcion` varchar(255) NOT NULL,
  `codigo` varchar(255) NOT NULL,
  `creador_id` int unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `evento_codigo_unique` (`codigo`),
  KEY `evento_deporte_id_index` (`deporte_id`),
  KEY `evento_localidad_id_index` (`localidad_id`),
  KEY `evento_creador_id_index` (`creador_id`),
  CONSTRAINT `evento_creador_id_foreign` FOREIGN KEY (`creador_id`) REFERENCES `usuario` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `evento_deporte_id_foreign` FOREIGN KEY (`deporte_id`) REFERENCES `deporte` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `evento_localidad_id_foreign` FOREIGN KEY (`localidad_id`) REFERENCES `localidad` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `evento`
--

LOCK TABLES `evento` WRITE;
/*!40000 ALTER TABLE `evento` DISABLE KEYS */;
INSERT INTO `evento` VALUES (15,'prueba',1,NULL,8,'2005-06-28 21:00:00','2025-10-25 21:00:00','2025-10-26 21:00:00','2025-10-30 21:00:00',17,15,'Descripcion por defecto para llenar con algo','aaaa',6),(16,'Liga de verano',1,NULL,10,'2009-09-07 21:00:00','2009-09-09 21:00:00','2025-10-10 21:00:00','2025-10-29 21:00:00',18,13,'Descripcion por defecto para llenar con algo','aaab',6),(21,'test 2',0,'123456',8,'2025-10-01 21:00:00','2025-10-11 21:00:00','2025-10-11 21:00:00','2025-10-31 21:00:00',13,14,'Descripcion por defecto para llenar con algo','aaac',6),(24,'test',1,NULL,8,'2025-10-16 21:00:00','2025-10-17 21:00:00','2025-10-17 21:00:00','2025-10-18 21:00:00',18,13,'Descripcion por defecto para llenar con algo','aaaf',6),(25,'Liga San Nicolas',1,NULL,8,'2025-09-30 21:00:00','2025-10-30 21:00:00','2025-10-31 21:00:00','2025-11-29 21:00:00',18,15,'Liga de Basquet de la Asociacion de Basquet Nicoleña','ZD63WUF6',6),(26,'Roland Garros',1,NULL,10,'2025-09-30 21:00:00','2025-10-30 21:00:00','2025-10-31 21:00:00','2025-11-08 21:00:00',20,17,'El de tenis europeo','W7N7PBXQ',6),(27,'ejemplo privado',0,'123456',8,'2025-09-30 21:00:00','2025-10-30 21:00:00','2025-10-31 21:00:00','2025-11-29 21:00:00',17,13,'kjsadvahbviasvbs','RFM9VBEZ',6),(28,'test  999',1,NULL,10,'2025-10-16 21:00:00','2025-10-25 21:00:00','2025-10-26 21:00:00','2025-10-30 21:00:00',13,14,'hahahdbuahsf ashf zsh','Z9WFFW8C',6),(29,'Copita menstrual',1,NULL,12,'2025-11-11 21:00:00','2025-12-27 21:00:00','2026-01-07 21:00:00','2026-01-09 21:00:00',22,13,'Hola, te invito a participar de mi tornep, consta de tres rounds de un minuto. No te canses. Premios copitas para todos. Y lo mejor, ya hervidas y nuevas. ','455U2398',42),(30,'equipos multi',1,NULL,8,'2026-02-25 21:00:00','2026-03-25 21:00:00','2026-03-26 21:00:00','2026-04-29 21:00:00',13,15,'akakakaasdfs','9LSDL53G',6),(31,'Copa magica',1,NULL,8,'2026-02-26 21:00:00','2026-03-05 21:00:00','2026-03-06 21:00:00','2026-03-26 21:00:00',18,13,'Un evento de otra dimension','NQ8MRSUE',6),(32,'Primeros pasos',1,NULL,10,'2026-02-26 21:00:00','2026-03-06 21:00:00','2026-03-07 21:00:00','2026-03-27 21:00:00',21,16,'Patinaje artisticos para niños y niñas','BXSKZ6GR',6),(33,'Liga de campeones',1,NULL,8,'2026-02-27 21:00:00','2026-03-06 21:00:00','2026-03-06 21:00:00','2026-03-27 21:00:00',18,14,'Tremendo combate de los mejores','A3QJU2J5',6),(34,'Providers torneo',0,'123456',8,'2026-02-27 21:00:00','2026-03-07 21:00:00','2026-03-08 21:00:00','2026-03-27 21:00:00',20,15,'Este torneo fue creado desde la rama providers para checkear el funcionamiento de todas las funciones de la pagina','D6PDFFNK',6);
/*!40000 ALTER TABLE `evento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invitacion`
--

DROP TABLE IF EXISTS `invitacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invitacion` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `email_invitado` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `estado` varchar(255) NOT NULL,
  `fecha_expiracion` datetime NOT NULL,
  `fecha_aceptacion` datetime DEFAULT NULL,
  `equipo_id` int unsigned NOT NULL,
  `capitan_id` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `invitacion_equipo_id_index` (`equipo_id`),
  KEY `invitacion_capitan_id_index` (`capitan_id`),
  CONSTRAINT `invitacion_capitan_id_foreign` FOREIGN KEY (`capitan_id`) REFERENCES `usuario` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `invitacion_equipo_id_foreign` FOREIGN KEY (`equipo_id`) REFERENCES `equipo` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invitacion`
--

LOCK TABLES `invitacion` WRITE;
/*!40000 ALTER TABLE `invitacion` DISABLE KEYS */;
INSERT INTO `invitacion` VALUES (1,'florencialovatti15@gmail.com','e93aaa01e447f3441b2045a29bdad643a59f52ae77438b61464f322557508930','pendiente','2026-03-07 17:12:38',NULL,10,6),(2,'franciscolovatti08@gmail.com','6dbb5431a94133d58490ea0423d71679a6591629bd64dc84841e376cc0f93a04','pendiente','2026-03-09 00:25:10',NULL,13,9),(3,'franciscolovatti@gmail.com','fb7e8e897d3ec47dd08023e6b03727a06243d47df657b71ddf04edd99c51e1ed','pendiente','2026-03-10 00:05:53',NULL,22,6),(4,'franciscolovatti08@gmail.com','ce8615c32cfd298ee471e0c6322845dca522e1835e96edd08eba2dc2b1af7843','aceptada','2026-03-10 17:34:52','2026-03-03 17:36:02',24,9),(5,'franciscolovatti08@gmail.com','18eb519a4999cd30f5e4eccd3efef933515e337663d7d754e85529e569f31a81','aceptada','2026-03-10 17:43:42','2026-03-03 17:47:25',25,9),(6,'franciscolovatti08@gmail.com','9cefdd2d370eea2f3c98fc587c651ed7a85edc249c9650a1afa8a3daee713a08','aceptada','2026-03-10 17:59:20','2026-03-03 17:59:52',25,9);
/*!40000 ALTER TABLE `invitacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `localidad`
--

DROP TABLE IF EXISTS `localidad`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `localidad` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `descripcion` varchar(255) NOT NULL,
  `lat` varchar(255) NOT NULL,
  `lng` varchar(255) NOT NULL,
  `codigo` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `localidad_descripcion_unique` (`descripcion`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `localidad`
--

LOCK TABLES `localidad` WRITE;
/*!40000 ALTER TABLE `localidad` DISABLE KEYS */;
INSERT INTO `localidad` VALUES (13,'Puerto Madryn, Chubut, Argentina','-42.76362169999999','-65.03483109999999','ChIJ0eqih141Ar4RgkO0ECgNiR4'),(14,'Rosario, Santa Fe, Argentina','-32.9587022','-60.69304159999999','ChIJW9fXNZNTtpURV6VYAumGQOw'),(15,'San Nicolás de Los Arroyos, Provincia de Buenos Aires, Argentina','-33.3334669','-60.2110494','ChIJ9wC0-ZNnt5URsYle9NpII2I'),(16,'Villa Gdor. Galvez, Santa Fe, Argentina','-33.0330409','-60.63472540000001','ChIJwzf0x1yot5URnJYStNkGEUM'),(17,'Pergamino, Provincia de Buenos Aires, Argentina','-33.8912831','-60.5745999','ChIJMQr2Pq1KuJURxelieSfDGkg'),(19,'Villa Carlos Paz, Córdoba, Argentina','-31.4207828','-64.4992141','ChIJcXx31kBmLZQR7RsSy7ZKwnU'),(20,'Santa Rosa, La Pampa, Argentina','-36.620922','-64.2912369','ChIJM4pV9wfNwpURgf1weyqM2ns');
/*!40000 ALTER TABLE `localidad` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `noticia`
--

DROP TABLE IF EXISTS `noticia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `noticia` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `titulo` varchar(255) NOT NULL,
  `descripcion` varchar(255) NOT NULL,
  `fecha` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `noticia`
--

LOCK TABLES `noticia` WRITE;
/*!40000 ALTER TABLE `noticia` DISABLE KEYS */;
INSERT INTO `noticia` VALUES (10,'Torneo de basket nacional','Wow que copado este nuevo torneo\nanda a visitarlo','2025-10-16 21:00:00'),(11,'Elecciones Legislativas 2025','Este domingo 26 de octubre los argentinos elegimos representantes para el Congreso Nacional, es tu responsabilidad ir a votar','2025-10-23 21:00:00'),(12,'Nuevas funcionalidades se acercan','Las opciones de Generar Copa y Generar Liga estan mas cerca que nunca. Insistile a los desarrolladores para que las agreguen','2025-10-24 21:00:00'),(13,'Wow miren este torneo','Que genial, unite a este torneo\nhttp://localhost:5173/home/torneos/16','2026-02-10 21:00:00');
/*!40000 ALTER TABLE `noticia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `participacion`
--

DROP TABLE IF EXISTS `participacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `participacion` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `puntos` int DEFAULT '0',
  `minutosjugados` int DEFAULT '0',
  `faltas` int DEFAULT '0',
  `partido_id` int unsigned DEFAULT NULL,
  `usuario_id` int unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `participacion_partido_id_index` (`partido_id`),
  KEY `participacion_usuario_id_index` (`usuario_id`),
  CONSTRAINT `participacion_partido_id_foreign` FOREIGN KEY (`partido_id`) REFERENCES `partido` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `participacion_usuario_id_foreign` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `participacion`
--

LOCK TABLES `participacion` WRITE;
/*!40000 ALTER TABLE `participacion` DISABLE KEYS */;
INSERT INTO `participacion` VALUES (2,1000000000,90,5,8,9),(3,20,90,1,8,6),(5,15,50,2,8,41),(6,10,5,0,NULL,6),(7,10,5,0,NULL,9),(8,25,15,1,NULL,9),(9,42,30,0,NULL,6);
/*!40000 ALTER TABLE `participacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `partido`
--

DROP TABLE IF EXISTS `partido`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `partido` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `fecha` datetime NOT NULL,
  `hora` varchar(255) DEFAULT NULL,
  `juez` varchar(255) DEFAULT NULL,
  `evento_id` int unsigned NOT NULL,
  `establecimiento_id` int unsigned DEFAULT NULL,
  `equipo_local_id` int unsigned NOT NULL,
  `equipo_visitante_id` int unsigned NOT NULL,
  `mvp_id` int unsigned DEFAULT NULL,
  `max_anotador_id` int unsigned DEFAULT NULL,
  `resultado_local` int DEFAULT NULL,
  `resultado_visitante` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `partido_evento_id_index` (`evento_id`),
  KEY `partido_establecimiento_id_index` (`establecimiento_id`),
  KEY `partido_equipo_local_id_index` (`equipo_local_id`),
  KEY `partido_equipo_visitante_id_index` (`equipo_visitante_id`),
  KEY `partido_mvp_id_index` (`mvp_id`),
  KEY `partido_max_anotador_id_index` (`max_anotador_id`),
  CONSTRAINT `partido_equipo_local_id_foreign` FOREIGN KEY (`equipo_local_id`) REFERENCES `equipo` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `partido_equipo_visitante_id_foreign` FOREIGN KEY (`equipo_visitante_id`) REFERENCES `equipo` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `partido_establecimiento_id_foreign` FOREIGN KEY (`establecimiento_id`) REFERENCES `establecimiento` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `partido_evento_id_foreign` FOREIGN KEY (`evento_id`) REFERENCES `evento` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `partido_max_anotador_id_foreign` FOREIGN KEY (`max_anotador_id`) REFERENCES `usuario` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `partido_mvp_id_foreign` FOREIGN KEY (`mvp_id`) REFERENCES `usuario` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `partido`
--

LOCK TABLES `partido` WRITE;
/*!40000 ALTER TABLE `partido` DISABLE KEYS */;
INSERT INTO `partido` VALUES (4,'2025-10-17 21:00:00','19:30','Doctora Polo',24,2,5,1,NULL,NULL,NULL,NULL),(5,'2025-10-18 21:00:00','19:00','Bob Esponja',24,2,1,5,NULL,NULL,NULL,NULL),(6,'2025-10-17 21:00:00','18:00','Patricio Estrella',24,2,1,5,NULL,NULL,NULL,NULL),(7,'2025-10-17 21:00:00','08:00','Arenita',24,2,1,5,NULL,NULL,NULL,NULL),(8,'2025-10-29 21:00:00','19:09','Doctora Polo',15,NULL,10,13,NULL,NULL,2,3),(9,'2025-10-28 21:00:00','20:00','pepe ramirez',15,13,10,17,NULL,NULL,3,2);
/*!40000 ALTER TABLE `partido` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `apellido` varchar(255) NOT NULL,
  `usuario` varchar(255) NOT NULL,
  `contrasenia` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `fecha_nacimiento` datetime DEFAULT NULL,
  `role` varchar(255) NOT NULL,
  `estado` tinyint(1) NOT NULL,
  `ultimo_login` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `usuario_usuario_unique` (`usuario`),
  UNIQUE KEY `usuario_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES (6,'Fran admin','Lovatti','fran','$2b$08$l/UsHfD4m8ZWtA8JjbXNx.Z7vH0ebtQDpoB9IyFz2v53JSeq9EdJC','franciscolovatti08@gmail.com','2005-06-28 21:00:00','Administrador',1,'2026-03-03 18:51:25'),(9,'Fran usuario','Lovatti','fran2','$2b$08$cjEyqNZ/nFow5EgDEqn1rOt2BZTRlvsImx9yZG.mY7gODpaar4rmi','franciscolovatti@gmail.com','2005-06-28 21:00:00','Usuario',1,'2026-03-03 18:44:15'),(10,'Francisco','Lovatti','fran3','$2b$08$clcsPOOZo1fj3mFVXva4xehyB.RAQPS/ozq/BMtYBr/hZo4oPcNg.','franciscolovatti1@gmail.com','2005-06-28 21:00:00','Administrador',1,NULL),(27,'Francisco','Lovatti','fran35','123456','fran35@gmail.com','2005-06-28 21:00:00','Usuario',1,NULL),(38,'Francisco','Lovatti','fran888','$2b$08$WNq1Y/kPlxi6Ljyro7ab6e9sb24sckmpWH.ehb4vM1pYqQtT7vTyK','franciscolova@gmail.com','2005-06-28 21:00:00','Usuario',1,NULL),(39,'Francisco','Lovatti','fran5','$2b$08$9BxtNvG17VjGXfkLKjhis.sLlJzFjbO584PoktTTovpYFklcAl7o.','franciscolovatti08@l.com','2005-06-28 21:00:00','Usuario',1,NULL),(41,'Francisco','Lovatti','admin2','$2b$08$EgcpeWBLOH3ar18SsXgbvOyBWM99uoVCIn7Qxwevi5i3s5.G7aEQy','admin@admin.com','2005-06-28 21:00:00','Administrador',1,'2025-10-24 00:45:14'),(42,'florencia','lovatti','flor','$2b$08$miZDGDy.XJOPOvgoH5zfAOtutADxjhzy9mAnlNv.3BigdwmYSWj.e','florencialovatti15@gmail.com','2000-01-07 21:00:00','Usuario',1,'2025-10-25 19:32:00'),(44,'test','test','test','$2b$08$eEh/hqigUTJJELCnx/59lOjsyYuyCw.v09pUQ..ItD4DzVMbxQFBW','test@test.com','2011-11-10 21:00:00','Usuario',1,'2026-03-03 19:43:25'),(45,'E2E','Tester','e2e_user_1772416222400','$2b$08$L7ijdwR9Gt2eKvuzIZFiz..kKGruQamK0w9xQNpiKs2iIebRIFUvG','e2e_1772416222400@test.com',NULL,'Usuario',1,'2026-03-01 22:50:26'),(46,'E2E','Tester','e2e_user_1772422384724','$2b$08$YgwwlGcx6/GFW4dwyba42eUaRTJOrSecgT7nNOO5X2mz4QV1G3XFu','e2e_1772422384724@test.com',NULL,'Usuario',1,'2026-03-02 00:33:06'),(47,'E2E','Tester','e2e_user_1772577808636','$2b$08$yvjsUY.sGd9wqXhQr99ZoehzV9eIdyqAITlm5yc6xx3j/cG9rCO2C','e2e_1772577808636@test.com',NULL,'Usuario',1,'2026-03-03 19:43:32');
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'gestortorneos'
--

--
-- Dumping routines for database 'gestortorneos'
--
/*!50112 SET @disable_bulk_load = IF (@is_rocksdb_supported, 'SET SESSION rocksdb_bulk_load = @old_rocksdb_bulk_load', 'SET @dummy_rocksdb_bulk_load = 0') */;
/*!50112 PREPARE s FROM @disable_bulk_load */;
/*!50112 EXECUTE s */;
/*!50112 DEALLOCATE PREPARE s */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-04  1:31:53
