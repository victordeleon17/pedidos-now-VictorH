---
name: orm-postgresql
description: skill operativo para trabajar base de datos con PostgreSQL + Prisma ORM en JavaScript puro. define estructura, responsabilidades, flujos de cambio, buenas prácticas y migraciones automáticas. reemplaza base_de_datos_mysql2.md como enfoque oficial para módulos que usen Prisma.
version: 1.0.0
scope: repository
applies_to: github copilot cli
stack:
  - node.js
  - postgresql
  - prisma orm
  - javascript
---

# orm-postgresql

Skill operativo para el manejo disciplinado de base de datos con PostgreSQL y Prisma ORM en JavaScript puro.

---

## filosofía

> Prisma no es magia. Es una herramienta que genera código tipado a partir del schema.prisma. La disciplina está en la estructura y separación de capas, no en la complejidad de las queries.

Este proyecto usa PostgreSQL con Prisma ORM. Las migraciones son automáticas y trazables. El schema.prisma es la fuente de verdad única. No hay SQL crudo innecesario.

---

## enfoque oficial del proyecto

| decisión | valor |
|---|---|
| base de datos | PostgreSQL (Neon.tech) |
| orm | Prisma @5.x |
| lenguaje | JavaScript puro |
| migraciones | automáticas con `prisma migrate dev` |
| esquema | declarativo en `prisma/schema.prisma` |
| queries | tipadas con Prisma, sin SQL crudo salvo justificación explícita |
| lógica de acceso a datos | vive en `src/repositories/` |
| lógica de negocio | vive en `src/services/` |
| sql en controllers | **prohibido** |
| sql en services | **prohibido** |
| editar migraciones manualmente | **prohibido** |

---

## stack oficial

```json
{
  "dependencies": {
    "@prisma/client": "^5.x.x"
  },
  "devDependencies": {
    "prisma": "^5.x.x"
  }
}