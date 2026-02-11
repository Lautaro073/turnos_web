# Sistema de Notificaciones por Email con Nodemailer + Gmail

## ðŸŽ¯ ConfiguraciÃ³n (100% GRATIS)

### 1. Habilitar App Password en Gmail

1. Ve a tu cuenta de Google: https://myaccount.google.com/
2. En el menÃº izquierdo, selecciona **Seguridad**
3. Activa la **VerificaciÃ³n en 2 pasos** (si no la tenÃ©s activada)
4. Una vez activada, busca **ContraseÃ±as de aplicaciones**
5. Genera una nueva contraseÃ±a de aplicaciÃ³n:
   - Nombre: "Turnos Web"
   - Google te darÃ¡ un cÃ³digo de 16 dÃ­gitos (algo como: `abcd efgh ijkl mnop`)

### 2. Configurar Variables de Entorno

AbrÃ­ el archivo `.env.local` y actualizÃ¡ estas variables:

```env
# Gmail Configuration (Nodemailer - 100% GRATIS)
GMAIL_USER=staingosanchez@gmail.com
GMAIL_APP_PASSWORD=abcd efgh ijkl mnop
NOTIFICATION_EMAIL=staingosanchez@gmail.com
```

**Importante:** 
- `GMAIL_USER`: Tu email de Gmail
- `GMAIL_APP_PASSWORD`: La contraseÃ±a de 16 dÃ­gitos que generaste (sin espacios)
- `NOTIFICATION_EMAIL`: El email donde querÃ©s recibir las notificaciones (puede ser el mismo o diferente)

### 3. Variables del Cron Job

```env
CRON_SECRET=vivaperon
```

## ðŸ“§ Tipos de Emails

### 1. Nuevo Turno Reservado
Se envÃ­a **automÃ¡ticamente** cuando un cliente reserva un turno.

**Contenido:**
- Nombre del cliente
- TelÃ©fono (con link a WhatsApp)
- Servicio reservado
- Fecha y hora
- DiseÃ±o profesional con gradientes

### 2. Resumen Diario
Se envÃ­a **todos los dÃ­as a las 7:00 AM** con la agenda del dÃ­a.

**Contenido:**
- Lista de todos los turnos del dÃ­a
- Estado de cada turno (Pendiente/Confirmado/Completado)
- Resumen de estadÃ­sticas
- Servicios de cada turno

## ðŸ§ª Probar el Sistema

### Probar Email de Nuevo Turno

1. AndÃ¡ a http://localhost:3000/reservar
2. SeleccionÃ¡ un servicio
3. CompletÃ¡ el formulario
4. ReservÃ¡ el turno
5. RevisÃ¡ tu bandeja de entrada

### Probar Email de Resumen Diario

PodÃ©s probar el endpoint manualmente:

```bash
curl -X GET "http://localhost:3000/api/notificaciones/resumen-diario" \
  -H "Authorization: Bearer vivaperon"
```

O con PowerShell:
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/notificaciones/resumen-diario" `
  -Method GET `
  -Headers @{ "Authorization" = "Bearer vivaperon" }
```

## â° ConfiguraciÃ³n del Cron Job (Vercel)

El archivo `vercel.json` ya estÃ¡ configurado:

```json
{
  "crons": [
    {
      "path": "/api/notificaciones/resumen-diario",
      "schedule": "0 7 * * *"
    }
  ]
}
```

**Importante:** Los cron jobs solo funcionan en **producciÃ³n** (cuando deployÃ¡s a Vercel), no en desarrollo local.

### Deployar a Vercel

1. SubÃ­ el cÃ³digo a GitHub
2. ConectÃ¡ el repo en Vercel
3. AgregÃ¡ las variables de entorno en el dashboard de Vercel:
   - `GMAIL_USER`
   - `GMAIL_APP_PASSWORD`
   - `NOTIFICATION_EMAIL`
   - `CRON_SECRET`
   - (MÃ¡s todas las de Firebase)

4. Vercel automÃ¡ticamente detectarÃ¡ el `vercel.json` y configurarÃ¡ el cron

## ðŸ”§ Troubleshooting

### Error: "Invalid login"
- Asegurate de haber activado la verificaciÃ³n en 2 pasos
- VerificÃ¡ que la App Password estÃ© copiada sin espacios
- La App Password debe ser de 16 caracteres

### No llegan los emails
- RevisÃ¡ la carpeta de Spam
- VerificÃ¡ que `GMAIL_USER` y `GMAIL_APP_PASSWORD` estÃ©n configurados
- MirÃ¡ los logs en la terminal para ver errores

### Error: "Missing credentials"
- Falta `GMAIL_USER` o `GMAIL_APP_PASSWORD` en `.env.local`
- ReiniciÃ¡ el servidor de desarrollo despuÃ©s de cambiar `.env.local`

### El cron job no funciona
- RecordÃ¡ que los cron jobs **solo funcionan en producciÃ³n** en Vercel
- En desarrollo, podÃ©s testearlo manualmente con curl/PowerShell

## ðŸŽ¨ Personalizar Templates

Los templates de email estÃ¡n en: `src/lib/email-templates.tsx`

PodÃ©s modificar:
- Colores (variables CSS en `<style>`)
- Estructura del HTML
- Textos y mensajes
- ImÃ¡genes o logos

## âœ… Ventajas de Nodemailer + Gmail

- âœ… **Completamente gratis** (no hay lÃ­mites en Gmail)
- âœ… EnvÃ­a a cualquier email
- âœ… No requiere dominio verificado
- âœ… ConfiguraciÃ³n simple
- âœ… MÃ¡s confiable que servicios gratuitos de terceros
- âœ… Sin restricciones de "testing only"

## ðŸ“ Notas

- Gmail tiene un lÃ­mite de ~500 emails/dÃ­a para cuentas normales
- Si necesitÃ¡s mÃ¡s, podÃ©s usar Google Workspace (de pago)
- Las App Passwords son mÃ¡s seguras que usar tu contraseÃ±a real
- PodÃ©s revocar la App Password en cualquier momento

