
# Guía de Arquitectura y Despliegue - "The Smart Corner"

## 1. Arquitectura General
La aplicación sigue un patrón de **Desacoplamiento Front/Back**:
- **Frontend**: SPA construida en React, servida de forma estática (Nginx). Diseño basado en Glassmorphism Premium.
- **Backend**: API REST en Node.js (Express) para procesar formularios e interactuar con la DB.
- **IA**: Google Gemini (gemini-3-flash-preview) procesa el briefing y genera un análisis estructurado.

## 2. Flujo de Datos
- El cliente completa el wizard de 4 pasos.
- El frontend llama a la API de Gemini para el resumen.
- El objeto completo se envía al backend.
- El backend envía un email detallado a **arturonaranxo@gmail.com**.

## 3. Recomendaciones de Seguridad
1.  **Rate Limiting**: Implementar `express-rate-limit` en el endpoint de envío para evitar spam masivo.
2.  **Validación**: Usar `Zod` para validar el esquema del briefing recibido.
3.  **Honeypot**: Se recomienda añadir un input oculto para filtrar bots automatizados.

## 4. Configuración de Email
El sistema utiliza Nodemailer para la comunicación. Es vital configurar una cuenta SMTP con reputación para evitar que los briefings lleguen a SPAM. Se recomienda Amazon SES o SendGrid para volúmenes comerciales.

## 5. Hosting (VPS)
- **OS**: Ubuntu 22.04 LTS.
- **Servidor Web**: Nginx configurado con SSL (Let's Encrypt).
- **Procesos**: PM2 para mantener el backend activo.
- **Base de Datos**: PostgreSQL 14+.
