import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  PageBreak, TabStopPosition, TabStopType
} from 'docx';
import * as fs from 'fs';

const BLUE = "003366";
const DARK = "1a1a2e";
const ACCENT = "d4a017";
const WHITE = "ffffff";
const LIGHT_GRAY = "f5f5f5";
const BORDER_GRAY = "cccccc";

function headerRow(cells, bg = BLUE, color = WHITE) {
  return new TableRow({
    tableHeader: true,
    children: cells.map(t => new TableCell({
      shading: { type: ShadingType.SOLID, color: bg },
      children: [new Paragraph({ children: [new TextRun({ text: t, bold: true, color, size: 20, font: "Calibri" })], alignment: AlignmentType.CENTER })],
    })),
  });
}

function dataRow(cells) {
  return new TableRow({
    children: cells.map((t, i) => new TableCell({
      shading: { type: ShadingType.SOLID, color: i % 2 === 0 ? undefined : LIGHT_GRAY },
      children: [new Paragraph({ children: [new TextRun({ text: t, size: 20, font: "Calibri" })], alignment: AlignmentType.LEFT })],
    })),
  });
}

function heading1(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 360, after: 200 }, children: [new TextRun({ text, color: BLUE, bold: true, size: 32, font: "Calibri" })] });
}
function heading2(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 280, after: 160 }, children: [new TextRun({ text, color: DARK, bold: true, size: 26, font: "Calibri" })] });
}
function heading3(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 120 }, children: [new TextRun({ text, color: DARK, bold: true, size: 22, font: "Calibri" })] });
}
function para(text, opts = {}) {
  return new Paragraph({ spacing: { after: 120 }, alignment: AlignmentType.JUSTIFIED, children: [new TextRun({ text, size: 22, font: "Calibri", ...opts })] });
}
function bullet(text, level = 0) {
  return new Paragraph({ bullet: { level }, spacing: { after: 60 }, children: [new TextRun({ text, size: 22, font: "Calibri" })] });
}
function boldBullet(boldText, rest) {
  return new Paragraph({ bullet: { level: 0 }, spacing: { after: 60 }, children: [
    new TextRun({ text: boldText, size: 22, font: "Calibri", bold: true }),
    new TextRun({ text: rest, size: 22, font: "Calibri" }),
  ]});
}
function makeTable(headers, rows, colWidths) {
  const totalWidth = 9072;
  return new Table({
    width: { size: totalWidth, type: WidthType.DXA },
    rows: [headerRow(headers), ...rows.map(r => dataRow(r))],
  });
}
function emptyLine() { return new Paragraph({ spacing: { after: 60 } }); }

// ======================== 1. GESTIÓN DE SOLICITUDES ========================
function buildSolicitudes() {
  return [
    heading1("Manual de Herramientas — Gestión de Solicitudes de Servicios, Información y Accesos"),
    para("El presente manual documenta las herramientas utilizadas en el proyecto Le Bon Gout para la gestión de solicitudes de servicios, información y accesos, abarcando el microservicio de solicitudes, el sistema ITSM Jira Cloud y los mecanismos de autenticación y autorización basados en JWT.", { italics: true }),

    heading2("1. Introducción"),
    para("La gestión de solicitudes de servicios, información y accesos en el restaurante Le Bon Gout se implementa mediante el microservicio microservicio-solicitudes, el cual expone endpoints REST para el ciclo de vida completo de una solicitud: creación, consulta, actualización de estado, asignación de responsable y resolución. Las solicitudes se clasifican en tres tipos: SERVICIO, INFORMACIÓN y ACCESO, cada una con flujos específicos."),

    heading2("2. Herramientas Utilizadas"),
    makeTable(["Herramienta", "Versión", "Propósito", "Configuración"],
      [
        ["microservicio-solicitudes", "Spring Boot 4.0.6", "API REST para CRUD de solicitudes", "Puerto 8081, DB: solicitudes_db (PostgreSQL 5433)"],
        ["Jira Cloud (SOLICITUD)", "SaaS", "Gestión ITSM de tickets", "Proyecto SOLICITUD en https://utp-restaurante.atlassian.net"],
        ["JWT (JSON Web Token)", "0.12.x (io.jsonwebtoken)", "Autenticación y autorización por roles", "Secret key 256-bit, expiración 24 h"],
        ["Spring Data JPA / Hibernate", "6.x / 6.x", "Persistencia de solicitudes en BD", "ddl-auto=update, PostgreSQLDialect"],
        ["MapStruct", "1.6.x", "Mapeo automático entidad ↔ DTO", "SolicitudMapper.java, generación en compile"],
        ["Lombok", "1.18.x", "Reducción de boilerplate (getters, builders)", "@Data, @Builder, @AllArgsConstructor"],
        ["PostgreSQL 16", "16.x", "Almacenamiento persistente", "solicitudes_db en localhost:5433"],
        ["Eureka (Service Discovery)", "Netflix Eureka", "Registro y descubrimiento del servicio", "Registrado en http://localhost:8761/eureka/"],
        ["Gateway Server", "Spring Cloud Gateway", "Enrutamiento /api/solicitudes/** → microservicio", "StripPrefix=1, CORS configurado"],
      ], [2000, 1400, 2800, 2868]),
    emptyLine(),

    heading2("3. Instalación y Configuración"),
    heading3("3.1. Microservicio Solicitudes"),
    para("El microservicio se despliega como una aplicación Spring Boot independiente. Pasos:"),
    bullet("Clonar el repositorio del proyecto back-gestion."),
    bullet("Navegar al directorio microservicio-solicitudes."),
    bullet("Ejecutar mvnw clean package -DskipTests para compilar."),
    bullet("Iniciar con java -jar target/microservicio-solicitudes-0.0.1-SNAPSHOT.jar."),
    bullet("Verificar registro en Eureka: http://localhost:8761 (estado UP)."),
    heading3("3.2. Configuración de Jira"),
    para("El microservicio se integra con Jira Cloud para crear tickets automáticamente. Configurar en application.properties:"),
    bullet("jira.url=https://utp-restaurante.atlassian.net"),
    bullet("jira.username=U21318614@utp.edu.pe"),
    bullet("jira.project.key=SOLICITUD"),
    bullet("jira.token=<API_TOKEN> (generar en https://id.atlassian.com/manage/api-tokens)"),
    heading3("3.3. Endpoints Principales"),
    makeTable(["Método", "Endpoint", "Descripción"],
      [
        ["POST", "/solicitudes/create", "Crear nueva solicitud"],
        ["GET", "/solicitudes/all", "Listar todas las solicitudes"],
        ["GET", "/solicitudes/{id}", "Obtener solicitud por ID"],
        ["PUT", "/solicitudes/{id}/estado?estado=", "Actualizar estado"],
        ["PUT", "/solicitudes/{id}/responsable", "Asignar responsable"],
        ["PUT", "/solicitudes/{id}/resolucion", "Registrar resolución"],
        ["GET", "/solicitudes/estado/{estado}", "Filtrar por estado"],
        ["GET", "/solicitudes/tipo/{tipo}", "Filtrar por tipo"],
        ["GET", "/solicitudes/estadisticas", "Obtener estadísticas"],
      ], [1200, 4000, 3872]),
    emptyLine(),

    heading2("4. Utilización"),
    para("El flujo típico de una solicitud es:"),
    boldBullet("1. Creación: ", "El usuario (cliente, mesero o administrador) envía POST /solicitudes/create con los campos: titulo, descripcion, tipoSolicitud (SERVICIO, INFORMACION, ACCESO), prioridad (ALTA, MEDIA, BAJA), usuarioSolicitante, areaSolicitante."),
    boldBullet("2. Asignación: ", "El administrador asigna un responsable vía PUT /solicitudes/{id}/responsable con body {\"responsable\": \"nombre\"}."),
    boldBullet("3. Actualización de estado: ", "El responsable cambia el estado vía PUT /solicitudes/{id}/estado?estado=EN_PROCESO|COMPLETADA|RECHAZADA."),
    boldBullet("4. Resolución: ", "Se registra la solución vía PUT /solicitudes/{id}/resolucion con body {\"resolucion\": \"descripción\"}."),
    boldBullet("5. Ticket Jira: ", "Al crear la solicitud, el sistema genera automáticamente un ticket en Jira con la key TKT-XXXX para trazabilidad."),
    boldBullet("6. Estadísticas: ", "GET /solicitudes/estadisticas devuelve total, pendientes, en_proceso, completadas, rechazadas, y desglose por tipo."),

    heading2("5. Roles y Permisos"),
    makeTable(["Rol (TipoUser)", "Acciones Permitidas"],
      [
        ["CLIENTE", "Crear solicitud de tipo SERVICIO, consultar estado de sus propias solicitudes"],
        ["MESERO", "Crear solicitudes de tipo SERVICIO, INFORMACION, ACCESO; consultar estado"],
        ["COCINERO", "Crear solicitudes de tipo SERVICIO, INFORMACION"],
        ["ADMINISTRADOR", "CRUD completo, asignar responsable, cambiar estados, ver estadísticas"],
      ], [3000, 6072]),
    emptyLine(),

    heading2("6. Conclusión"),
    para("La gestión de solicitudes en Le Bon Gout está soportada por una arquitectura de microservicios con integración ITSM (Jira), autenticación JWT y persistencia en PostgreSQL. Las herramientas descritas permiten un flujo completo desde la creación hasta la resolución, con trazabilidad externa y métricas de desempeño."),
  ];
}

// ======================== 2. GESTIÓN DE CAMBIOS ========================
function buildCambios() {
  return [
    heading1("Manual de Herramientas — Gestión de Cambios de Arquitectura, Aplicaciones, Base de Datos, Configuración, Documentación"),
    para("El presente manual documenta las herramientas utilizadas para la gestión de cambios en el proyecto Le Bon Gout, abarcando cambios de arquitectura, aplicaciones, base de datos, configuración y documentación.", { italics: true }),

    heading2("1. Introducción"),
    para("La gestión de cambios en Le Bon Gout se implementa mediante el microservicio microservicio-cambios, que expone endpoints para el ciclo de vida de una solicitud de cambio. Los cambios se clasifican por tipo (NORMAL, EMERGENCIA, REPETITIVO), categoría (INFRAESTRUCTURA, DATABASE, DOCUMENTACION, CRONOGRAMA) y riesgo (BAJO, MEDIO, ALTO). El sistema integra Jira Cloud para trazabilidad y cuenta con soporte multi-base de datos (lectura/escritura separados)."),

    heading2("2. Herramientas Utilizadas"),
    makeTable(["Herramienta", "Versión", "Propósito", "Configuración"],
      [
        ["microservicio-cambios", "Spring Boot 4.0.6", "API REST para gestión de cambios", "Puerto 8109, perfil local/docker"],
        ["Jira Cloud (KAN)", "SaaS", "Gestión ITSM de cambios", "Proyecto KAN en https://utp-team-gestion-cambios.atlassian.net"],
        ["JWT", "0.12.x", "Autenticación y autorización", "Roles: ADMINISTRADOR, MESERO, COCINERO, CLIENTE"],
        ["DataSource Router", "Custom", "Enrutamiento lectura/escritura BD", "DataSourceRouter.java + ReadOnlyConnectionInterceptor"],
        ["Spring Data JPA", "6.x", "Persistencia de cambios en BD", "ddl-auto=update, PostgreSQLDialect"],
        ["MapStruct", "1.6.x", "Mapeo entidad ↔ DTO", "CambioMapper.java"],
        ["Docker", "Multi-stage", "Despliegue containerizado", "Dockerfile con eclipse-temurin:21-jre"],
        ["Eureka", "Netflix", "Service Discovery", "http://localhost:8761/eureka/"],
        ["PostgreSQL 16", "16.x", "Almacenamiento persistente", "cambios_db en localhost:5433"],
      ], [2000, 1400, 2800, 2868]),
    emptyLine(),

    heading2("3. Instalación y Configuración"),
    heading3("3.1. Microservicio Cambios"),
    para("Pasos para desplegar:"),
    bullet("Compilar: mvnw clean package -DskipTests."),
    bullet("Ejecutar: java -jar target/microservicio-cambios-0.0.1-SNAPSHOT.jar."),
    bullet("Perfiles: local (default) usa PostgreSQL en localhost:5433. Docker usa variables de entorno WRITE_SERVER y READ_SERVER."),
    heading3("3.2. Configuración Multi-Base de Datos"),
    bullet("DataSourceRouter.java extiende AbstractRoutingDataSource."),
    bullet("ReadOnlyConnectionInterceptor.java intercepta consultas etiquetadas como @Transactional(readOnly=true) y las redirige al servidor de lectura."),
    bullet("DataSourceConfiguration.java configura los dos datasources (lectura/escritura) con HikariCP."),
    heading3("3.3. Clasificación de Cambios"),
    makeTable(["Tipo de Cambio", "Descripción"],
      [["NORMAL", "Cambios planificados con ventana de implementación definida"],
       ["EMERGENCIA", "Cambios urgentes que requieren implementación inmediata (ej. parche de seguridad)"],
       ["REPETITIVO", "Cambios estandarizados y pre-aprobados (ej. actualización rutinaria de configuración)"]], [3000, 6072]),
    emptyLine(),

    heading2("4. Estados del Cambio"),
    makeTable(["Estado", "Descripción"],
      [["PENDIENTE", "Cambio registrado, esperando revisión"],
       ["EN_REVISION", "En evaluación por el comité de cambios"],
       ["APROBADO", "Cambio aprobado para implementación"],
       ["RECHAZADO", "Cambio denegado"],
       ["EN_IMPLEMENTACION", "Cambio en ejecución"],
       ["IMPLEMENTADO", "Cambio completado exitosamente"],
       ["ROLLBACK", "Cambio revertido por fallos"],
       ["CERRADO", "Cambio finalizado y documentado"]], [3000, 6072]),
    emptyLine(),

    heading2("5. Conclusión"),
    para("La gestión de cambios soporta cambios normales, de emergencia y repetitivos con flujo de aprobación de 8 estados, integración Jira, y arquitectura multi-base de datos para alta disponibilidad."),
  ];
}

// ======================== 3. PLANIFICACIÓN DE RENDIMIENTO Y CAPACIDAD ========================
function buildRendimiento() {
  return [
    heading1("Manual de Herramientas — Planificación del Rendimiento y Capacidad de los Servicios"),
    para("El presente manual documenta las herramientas y metodologías para la planificación del rendimiento y capacidad de los 17 microservicios del ecosistema Le Bon Gout.", { italics: true }),

    heading2("1. Introducción"),
    para("La gestión de capacidad y rendimiento tiene como objetivo garantizar que los servicios del restaurante (pedidos, pagos, cocina, reservas, etc.) operen dentro de los niveles de servicio acordados (SLA), incluso bajo condiciones de carga máxima. Se monitorean métricas como tiempo de respuesta, throughput, utilización de CPU/RAM, pool de conexiones HikariCP y latencia de redes."),

    heading2("2. Herramientas Utilizadas"),
    makeTable(["Herramienta", "Versión", "Propósito", "Configuración"],
      [
        ["HikariCP", "5.x", "Pool de conexiones JDBC", "maximum-pool-size=10 (default en 13/16 servicios); proveedores=20"],
        ["Spring Boot Actuator *", "4.x", "Métricas de salud y rendimiento", "Endpoints /actuator/health y /actuator/metrics (pendiente habilitar)"],
        ["Prometheus *", "2.x", "Recolección de métricas", "Scrape de /actuator/prometheus cada 15s (pendiente instalar)"],
        ["Grafana *", "10.x", "Dashboards de visualización", "Dashboard Spring Boot APM + PostgreSQL (pendiente configurar)"],
        ["PostgreSQL 16", "16.x", "Motor de base de datos", "13 bases independientes en servidor único localhost:5433"],
        ["Eureka Dashboard", "Netflix", "Monitoreo de instancias", "http://localhost:8761 (estado UP/DOWN de cada servicio)"],
        ["JConsole / VisualVM", "JDK Tools", "Monitoreo de heap JVM in-situ", "Conexión JMX a proceso Java de cada microservicio"],
        ["Spring Scheduling", "6.x", "Tareas programadas de mantenimiento", "Cron diario 2:00 AM en MantenimientoScheduler"],
        ["JMeter *", "5.x", "Pruebas de carga y estrés", "Simulación de 100 usuarios concurrentes (pendiente ejecutar)"],
      ], [2000, 1200, 2600, 3272]),
    para("* Herramientas recomendadas, pendientes de implementación en el entorno actual.", { italics: true, size: 20 }),

    emptyLine(),
    heading2("3. Métricas de Capacidad Actual"),
    makeTable(["Microservicio", "Puerto", "Pool Hikari", "RAM (est.)", "DB"],
      [
        ["microservicio-producto", "8080", "10 (default)", "512 MB", "productos_db"],
        ["microservicio-solicitudes", "8081", "10 (default)", "512 MB", "solicitudes_db"],
        ["microservicio-incidentes", "8004", "10 (default)", "512 MB", "incidentes_db"],
        ["microservicio-baseConocimiento", "8005", "10 (default)", "512 MB", "base_conocimiento"],
        ["microservicio-insumos", "8100", "10 (default)", "512 MB", "insumos_db"],
        ["microservicio-cambios", "8109", "10 (default)", "512 MB", "cambios_db"],
        ["microservicio-eventos", "8215", "10 (default)", "512 MB", "eventos_db"],
        ["microservicio-mesas", "8216", "10 (default)", "512 MB", "mesas_db"],
        ["microservicio-pedidos", "8217", "10 (default)", "1 GB", "pedidos_db"],
        ["microservicio-cocina", "8218", "10 (default)", "512 MB", "cocina_db"],
        ["microservicio-pagos", "8219", "10 (default)", "1 GB", "pagos_db"],
        ["microservicio-proveedor", "8200", "20", "512 MB", "proveedores_db"],
        ["microservicio-reservas", "8221", "10 (default)", "512 MB", "reservas_db"],
        ["microservicio-mermas", "8300", "10 (default)", "512 MB", "mermas_db"],
        ["microservicio-users", "8220", "10 (default)", "512 MB", "users_db"],
        ["Gateway Server", "8090", "N/A (reactivo)", "1 GB", "N/A"],
        ["Eureka Server", "8761", "N/A", "512 MB", "N/A"],
      ], [2800, 900, 1200, 1200, 2972]),
    emptyLine(),

    heading2("4. Proyección de Crecimiento"),
    makeTable(["Año", "Usuarios Concurrentes", "Pedidos/día", "Incidentes/mes"],
      [["2025 (actual)", "30", "500", "50"],
       ["2026", "80", "1,500", "150"],
       ["2027", "200", "5,000", "500"]], [2000, 2400, 2400, 2272]),
    emptyLine(),

    heading2("5. Conclusión"),
    para("La planificación de capacidad identifica que los pools HikariCP sin configurar (default 10) son el principal cuello de botella ante crecimiento. Se recomienda escalar a 30 conexiones en servicios críticos, implementar Prometheus+Grafana para monitoreo continuo y migrar a contenedores con auto-scaling para 2027."),
  ];
}

// ======================== 4. GESTIÓN DE INCIDENCIAS ========================
function buildIncidencias() {
  return [
    heading1("Manual de Herramientas — Gestión de Incidencias de los Servicios"),
    para("El presente manual documenta las herramientas utilizadas para la gestión de incidentes en el proyecto Le Bon Gout, abarcando la clasificación, priorización, atención y resolución de incidentes.", { italics: true }),

    heading2("1. Introducción"),
    para("La gestión de incidentes sigue el estándar ITIL y se implementa mediante el microservicio microservicio-incidentes, que expone endpoints para el ciclo de vida completo del incidente: reporte, clasificación, investigación, resolución y cierre. Los incidentes se clasifican por TipoAreaAfectada (6 áreas), Urgencia (4 niveles), Impacto (4 niveles) y Prioridad (4 niveles), con integración directa a Jira Cloud."),

    heading2("2. Herramientas Utilizadas"),
    makeTable(["Herramienta", "Versión", "Propósito", "Configuración"],
      [
        ["microservicio-incidentes", "Spring Boot 4.0.6", "API REST para CRUD de incidentes", "Puerto 8004, DB: incidentes_db (PostgreSQL 5433)"],
        ["Jira Cloud (INCIDENTE)", "SaaS", "Trazabilidad ITSM externa", "Proyecto INCIDENTE en https://utp-restaurante.atlassian.net"],
        ["JWT", "0.12.x", "Autenticación y roles", "Roles: CLIENTE, MESERO, COCINERO, ADMINISTRADOR"],
        ["Spring Data JPA", "6.x", "Persistencia de incidentes", "ddl-auto=update, PostgreSQLDialect"],
        ["MapStruct", "1.6.x", "Mapeo entidad ↔ DTO (IncidenteMapper)", "IncidenteMapper.java con @Mapping para defaultEstado()"],
        ["WebClient (Spring WebFlux)", "6.x", "Comunicación reactiva con Jira API", "JiraService.java usa .block() para respuesta síncrona"],
        ["Base de Conocimiento", "microservicio-baseConocimiento", "Sugerencias al cerrar incidente", "POST /base-conocimiento/alimentacion/incidente"],
        ["PostgreSQL 16", "16.x", "Base de datos del módulo", "incidentes_db en localhost:5433"],
        ["Eureka", "Netflix", "Descubrimiento del servicio", "http://localhost:8761/eureka/"],
      ], [2000, 1400, 2800, 2868]),
    emptyLine(),

    heading2("3. Instalación y Configuración"),
    heading3("3.1. Microservicio Incidentes"),
    bullet("Compilar: mvnw clean package -DskipTests en microservicio-incidentes."),
    bullet("Iniciar: java -jar target/microservicio-incidentes-0.0.1-SNAPSHOT.jar."),
    heading3("3.2. Configuración Jira"),
    bullet("jira.url=https://utp-restaurante.atlassian.net"),
    bullet("jira.project.key=INCIDENTE"),
    bullet("jira.request.type.id=8 (Request Type ID para incidentes)"),
    heading3("3.3. Flujo de Estados"),
    makeTable(["Estado Actual", "Transiciones Permitidas"],
      [["PENDIENTE", "INVESTIGAR, CANCELAR"],
       ["INVESTIGAR", "RESOLVER, CANCELAR"],
       ["RESOLVER", "N/A (estado final)"],
       ["CANCELAR", "N/A (estado final)"]], [3000, 6072]),
    emptyLine(),

    heading2("4. Clasificación de Incidentes"),
    makeTable(["Área (TipoAreaAfectada)", "Ejemplos"],
      [["INFRAESTRUCTURA", "Servidor caído, disco lleno, puerto ocupado"],
       ["APLICACIONES", "Error en pedidos, pagos no procesan, interfaz no carga"],
       ["BASE_DATOS", "Tabla corrupta, pool agotado, consulta lenta"],
       ["REDES_COMUNICACIONES", "Gateway no responde, Feign timeout, CORS bloqueado"],
       ["SEGURIDAD", "Ataque fuerza bruta, acceso no autorizado, token expirado"],
       ["DOCUMENTACION", "Manual desactualizado, README incompleto"]], [3500, 5572]),
    emptyLine(),

    heading2("5. Integración con Base de Conocimiento"),
    para("Al resolver un incidente (estado RESOLVER), el sistema alimenta automáticamente la Base de Conocimiento con un nuevo artículo OPERATIVO que documenta la solución aplicada. El endpoint utilizado es POST /base-conocimiento/alimentacion/incidente con el body del IncidenteCierreDTO, que incluye título, descripción, solución aplicada, categoría, tags y afectaciones (cocina, salón, reservas)."),
    para("Además, durante la fase de investigación, el service desk puede consultar sugerencias de la KBS vía GET /base-conocimiento/busqueda/sugerir/al-cierre-incidente?incidenteId=&categoria= para obtener hasta 3 artículos recomendados."),

    heading2("6. Conclusión"),
    para("La gestión de incidentes sigue el flujo ITIL con trazabilidad Jira, clasificación por 6 áreas y 4 niveles de prioridad. La integración con la Base de Conocimiento permite la mejora continua: cada incidente resuelto genera un artículo que previene futuras recurrencias."),
  ];
}

// ======================== 5. GESTIÓN DE EVENTOS ========================
function buildEventos() {
  return [
    heading1("Manual de Herramientas — Gestión de Eventos de los Servicios"),
    para("El presente manual documenta las herramientas utilizadas para la gestión de eventos (especiales y del salón) en el proyecto Le Bon Gout.", { italics: true }),

    heading2("1. Introducción"),
    para("El microservicio microservicio-eventos gestiona las solicitudes de eventos especiales en el restaurante (cumpleaños, reuniones empresariales, catas, etc.). Los eventos se reciben desde múltiples fuentes (WEB_FORM, PHONE, WALK_IN) y pasan por un flujo de estados (PENDIENTE, RECIBIDO, CANCELADO). El sistema verifica disponibilidad de fechas antes de aceptar nuevos eventos."),

    heading2("2. Herramientas Utilizadas"),
    makeTable(["Herramienta", "Versión", "Propósito", "Configuración"],
      [
        ["microservicio-eventos", "Spring Boot 4.0.6", "API REST para gestión de eventos", "Puerto 8215, DB: eventos_db"],
        ["Spring Data JPA", "6.x", "Persistencia", "ddl-auto=update, PostgreSQLDialect"],
        ["MapStruct", "1.6.x", "Mapeo EventoRequest → EventoResponseDTO", "EventoMapper.java"],
        ["PostgreSQL 16", "16.x", "Base de datos", "eventos_db en localhost:5433"],
        ["Eureka", "Netflix", "Service Discovery", "http://localhost:8761/eureka/"],
        ["Spring Validation", "6.x", "Validación de datos de entrada", "@NotBlank, @NotNull, @Email en EventoRequestDTO"],
      ], [2500, 1400, 2800, 2372]),
    emptyLine(),

    heading2("3. Instalación y Configuración"),
    bullet("Compilar: mvnw clean package -DskipTests en microservicio-eventos."),
    bullet("Iniciar: java -jar target/microservicio-eventos-0.0.1-SNAPSHOT.jar."),
    heading3("3.1. Endpoints Principales"),
    makeTable(["Método", "Endpoint", "Descripción"],
      [
        ["POST", "/eventos", "Crear nuevo evento"],
        ["GET", "/eventos", "Listar eventos (paginado)"],
        ["GET", "/eventos/{id}", "Obtener evento por ID"],
        ["PATCH", "/eventos/{id}/status", "Actualizar estado del evento"],
        ["DELETE", "/eventos/{id}", "Eliminar evento"],
        ["GET", "/eventos/status/{status}", "Listar por estado (paginado)"],
        ["GET", "/eventos/stats", "Estadísticas de eventos"],
        ["GET", "/eventos/search?email=", "Buscar por email del solicitante"],
        ["GET", "/eventos/check-availability?date=", "Verificar disponibilidad de fecha"],
      ], [1300, 4800, 2972]),
    emptyLine(),

    heading2("4. Entidades"),
    para("La entidad EventoRequest incluye: nombre, apellido, email, teléfono, empresa, fecha del evento, número de asistentes, comentarios, estado (PENDIENTE, RECIBIDO, CANCELADO), fuente (WEB_FORM, PHONE, WALK_IN), y banderas de consentimiento (ageConfirmed, privacyAccepted, marketingAccepted)."),
    para("El endpoint check-availability(date) permite al frontend validar que la fecha solicitada no esté ocupada antes de crear la reserva."),

    heading2("5. Conclusión"),
    para("El módulo de eventos permite al restaurante gestionar solicitudes de eventos especiales desde múltiples canales, con control de disponibilidad y flujo de estados completo."),
  ];
}

// ======================== 6. CONTINUIDAD Y DRP ========================
function buildContinuidad() {
  return [
    heading1("Manual de Herramientas — Gestión de Continuidad de Servicios y Plan de Recuperación de Desastres (DRP)"),
    para("El presente manual documenta las herramientas y procedimientos para la continuidad del servicio y la recuperación ante desastres en el ecosistema Le Bon Gout, alineado con la norma ISO/IEC 24762.", { italics: true }),

    heading2("1. Introducción"),
    para("La gestión de continuidad garantiza que los servicios críticos del restaurante (pedidos, cocina, pagos, reservas) puedan recuperarse dentro de los tiempos acordados (RTO) ante cualquier desastre. El Plan de Recuperación ante Desastres (DRP) clasifica los incidentes en 4 niveles, define RTO y RPO para cada uno, y establece procedimientos de recuperación, comunicación y mejora continua."),

    heading2("2. Herramientas Utilizadas"),
    makeTable(["Herramienta", "Versión", "Propósito", "Configuración"],
      [
        ["Base de Conocimiento (KBS)", "microservicio-baseConocimiento", "Artículos DRP con procedimientos de recuperación", "Módulo CONTINUIDAD, tipo CRISIS, 10 artículos"],
        ["MantenimientoScheduler", "Spring @Scheduled", "Tareas de mantenimiento diario (2:00 AM)", "Caducar artículos operativos, archivar obsoletos, revisar rating bajo"],
        ["JavaMailSender", "Spring Mail", "Notificaciones de revisiones pendientes", "SMTP Gmail:587, notificaciones@le-bon-gout.com"],
        ["pg_dump / pg_restore", "PostgreSQL 16", "Backup y restauración de bases de datos", "Backup diario 3:00 AM de las 13 bases, backup semanal full"],
        ["Eureka Server", "8761", "Monitoreo de disponibilidad de servicios", "Dashboard: http://localhost:8761 (estado UP/DOWN)"],
        ["Gateway Server", "8090", "Punto único de entrada (recuperación prioritaria)", "Primer servicio en restaurar tras caída"],
        ["Jira Cloud", "SaaS", "Registro de desastres y notificaciones", "Proyecto INCIDENTE con etiqueta DESASTRE"],
        ["ISO/IEC 24762", "2008", "Marco de referencia para DRP", "Guías para servicios de recuperación ICT"],
      ], [2000, 1600, 2800, 2672]),
    emptyLine(),

    heading2("3. Clasificación de Desastres (Niveles DRP)"),
    makeTable(["Nivel", "Descripción", "Ejemplo", "RTO", "RPO"],
      [
        ["Nivel 1 — Menor", "Caída de 1 microservicio no crítico", "Reportes, documentación", "≤ 4 h", "≤ 1 h"],
        ["Nivel 2 — Parcial", "Caída de 2+ servicios o 1 BD", "Pool conexiones agotado, Feign timeout", "≤ 2 h", "≤ 15 min"],
        ["Nivel 3 — Mayor", "Caída de PostgreSQL o Gateway", "Servidor BD caído, Gateway no responde", "≤ 30 min", "≤ 5 min"],
        ["Nivel 4 — Total", "Pérdida del datacenter", "Incendio, inundación, fallo eléctrico", "≤ 4 h", "≤ 24 h"],
      ], [1500, 2500, 2400, 1200, 1472]),
    emptyLine(),

    heading2("4. Procedimientos de Recuperación"),
    para("Cada nivel de desastre activa un procedimiento específico documentado en la Base de Conocimiento:"),
    makeTable(["Código", "Artículo", "Descripción"],
      [
        ["DRP-01", "Plan de Recuperación ante Desastres — ISO/IEC 24762 v2.0", "Documento maestro del DRP"],
        ["DRP-02", "Clasificación de Desastres — Matriz de Criticidad", "Define RTO/RPO por nivel"],
        ["DRP-03", "Procedimiento de Activación — Declaración de Desastre", "Pasos para declarar desastre y notificar"],
        ["DRP-04", "Recuperación de Servidor PostgreSQL — Caída Total", "Restauración desde backup"],
        ["DRP-05", "Recuperación de Gateway Server", "Reinicio del punto único de entrada"],
        ["DRP-06", "Recuperación de Eureka Server", "Restauración del service discovery"],
        ["DRP-07", "Recuperación Pedidos ↔ Cocina (Feign caído)", "Solución de timeout entre servicios"],
        ["DRP-08", "Backup y Restauración de Bases de Datos", "Procedimiento pg_dump/pg_restore"],
        ["DRP-09", "Plan de Comunicación en Crisis", "Matriz de notificación a stakeholders"],
        ["DRP-10", "Post-Mortem y Mejora Continua", "Análisis post-desastre y actualización del DRP"],
      ], [1200, 3000, 4872]),
    emptyLine(),

    heading2("5. Backup y Restauración"),
    heading3("5.1. Backup Automático"),
    bullet("Backup diario (3:00 AM): pg_dump -h localhost -p 5433 -U postgres -Fc -f /backups/db/<db>_<fecha>.dump <db>"),
    bullet("Backup semanal full (domingo 3:00 AM): pg_dumpall -h localhost -p 5433 -U postgres -f /backups/db/full_<fecha>.sql"),
    bullet("13 bases respaldadas: productos_db, pedidos_db, cocina_db, pagos_db, insumos_db, proveedores_db, mesas_db, reservas_db, mermas_db, eventos_db, users_db, solicitudes_db, incidentes_db, base_conocimiento"),
    heading3("5.2. Restauración"),
    bullet("pg_restore -h localhost -p 5433 -U postgres -d <db> --clean /backups/db/<db>_<fecha>.dump"),
    bullet("Verificación: SELECT count(*) FROM <tabla_principal> contra valor esperado."),

    heading2("6. Herramientas de Monitoreo de Continuidad"),
    para("El MantenimientoScheduler ejecuta tareas automáticas diarias a las 2:00 AM para mantener la salud de la Base de Conocimiento:"),
    bullet("Caducar artículos operativos sin actualizar > 90 días (→ OBSOLETO)."),
    bullet("Archivar artículos obsoletos > 1 año (→ tabla histórica articulo_kbs_historico)."),
    bullet("Revisar artículos con rating bajo (< 2.0 con ≥ 10 votos → REVISION_PARES)."),
    bullet("Notificar vía email a ti@le-bon-gout.com los artículos estratégicos pendientes de revisión (> 6 meses sin actualizar)."),

    heading2("7. Conclusión"),
    para("El plan de continuidad y DRP de Le Bon Gout cubre 4 niveles de desastre con RTO desde 30 minutos hasta 4 horas, respaldado por 10 artículos procedimentales en la Base de Conocimiento. Las herramientas de backup automático, monitoreo Eureka y notificaciones por email garantizan que el equipo TI pueda detectar, declarar y recuperarse de desastres de manera estructurada y documentada."),
  ];
}

// ======================== GENERATE ALL ========================
const docs = [
  { filename: "01_Gestion_Solicitudes.docx", title: "Manual - Gestión de Solicitudes", build: buildSolicitudes },
  { filename: "02_Gestion_Cambios.docx", title: "Manual - Gestión de Cambios", build: buildCambios },
  { filename: "03_Rendimiento_Capacidad.docx", title: "Manual - Rendimiento y Capacidad", build: buildRendimiento },
  { filename: "04_Gestion_Incidencias.docx", title: "Manual - Gestión de Incidencias", build: buildIncidencias },
  { filename: "05_Gestion_Eventos.docx", title: "Manual - Gestión de Eventos", build: buildEventos },
  { filename: "06_Continuidad_DRP.docx", title: "Manual - Continuidad y DRP", build: buildContinuidad },
];

async function main() {
  for (const doc of docs) {
    const pack = new Document({
      title: doc.title,
      description: doc.title,
      creator: "Le Bon Gout - Equipo de Gestión",
      styles: { default: { document: { run: { font: "Calibri", size: 22 } } } },
      sections: [{ children: doc.build() }],
    });
    const buffer = await Packer.toBuffer(pack);
    const outPath = `E:\\Ciclo 9\\INTEGRADOR 2\\Gestion\\${doc.filename}`;
    fs.writeFileSync(outPath, buffer);
    console.log(`✓ Generado: ${outPath}`);
  }
  console.log("\n✅ Los 6 manuales DOCX han sido generados exitosamente.");
}

main().catch(console.error);
