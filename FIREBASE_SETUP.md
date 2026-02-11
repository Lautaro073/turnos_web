# ðŸ”¥ ConfiguraciÃ³n de Firebase

## Paso 1: Crear proyecto en Firebase

1. Ir a [Firebase Console](https://console.firebase.google.com/)
2. Clic en "Agregar proyecto"
3. Nombre del proyecto: **Turnos Web**
4. Desactivar Google Analytics (no es necesario por ahora)
5. Crear proyecto

## Paso 2: Configurar Firestore Database

1. En el menÃº lateral: **Firestore Database**
2. Clic en "Crear base de datos"
3. Modo: **ProducciÃ³n** (cambiaremos las reglas despuÃ©s)
4. UbicaciÃ³n: **southamerica-east1** (SÃ£o Paulo - mÃ¡s cercano a Argentina)
5. Habilitar

## Paso 3: Obtener credenciales

1. Ir a **ConfiguraciÃ³n del proyecto** (Ã­cono de engranaje)
2. En "Tus apps" â†’ seleccionar "Web" (Ã­cono `</>`)
3. Nombre de la app: **Turnos Web App**
4. No marcar Firebase Hosting
5. Registrar app

6. Copiar las credenciales que aparecen y pegarlas en `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=turnos-web.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=turnos-web
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=turnos-web.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

## Paso 4: Configurar reglas de Firestore

En Firestore â†’ **Reglas**, reemplazar con:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Citas: lectura/escritura pÃºblica (temporal)
    match /citas/{citaId} {
      allow read, write: if true;
    }
    
    // Servicios: lectura/escritura pÃºblica (temporal)
    match /servicios/{servicioId} {
      allow read, write: if true;
    }
    
    // Horarios: lectura/escritura pÃºblica (temporal)
    match /horarios/{horarioId} {
      allow read, write: if true;
    }
  }
}
```

âš ï¸ **Nota**: Estas reglas son temporales para desarrollo. MÃ¡s adelante se implementarÃ¡ autenticaciÃ³n para el admin.

## Paso 5: Reiniciar servidor

```bash
npm run dev
```

## ðŸŽ¯ PrÃ³ximos pasos

Una vez configurado Firebase:
- âœ… Las citas se guardarÃ¡n en Firestore
- ðŸ“§ Configurar Resend para emails de confirmaciÃ³n
- ðŸ” Implementar autenticaciÃ³n para el panel admin
- ðŸ“Š Crear dashboard para ver/gestionar citas

