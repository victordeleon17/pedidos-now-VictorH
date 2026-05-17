# Despliegue del servicio Cobros

## Opcion recomendada para MVP

Para este servicio, la opcion mas simple y segura para un despliegue inicial es ejecutar migraciones y seeders como paso previo al arranque:

```bash
npm run deploy:migrate
npm start
```

En contenedor, el comando por defecto ejecuta:

```bash
npm run deploy:start
```

Esto corre migraciones, seeders idempotentes y luego inicia la API.

## Variables requeridas

Usar `.env.example` como base. La base objetivo del ORM es `cobrosdb` en PostgreSQL/Neon.

## Opciones gratuitas de despliegue

- Render free tier para API Node.js y base externa.
- Railway free/trial si hay creditos disponibles.
- Fly.io con allowance gratuito si la cuenta lo permite.
- Koyeb free tier para servicios web.
- Servidor local con Docker para demo academica.

Para evitar costos, la opcion mas controlable para demo es Docker local o Render/Koyeb usando una base MySQL gratuita/compartida. Si no hay MySQL administrado gratuito disponible, conviene desplegar API y MySQL juntos solo para demo, no para produccion.
