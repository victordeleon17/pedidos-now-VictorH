---
name: base-de-datos-mysql2
description: skill operativo para trabajar la base de datos de un proyecto node.js sin orm, usando mysql2/promise, queries sql manuales y migraciones versionadas propias. define estructura, responsabilidades, flujos de cambio y buenas prácticas. la ia debe adaptarse a este enfoque sin introducir sequelize, prisma, typeorm ni ningún otro orm salvo solicitud explícita.
version: 1.0.0
scope: repository
applies_to: github copilot cli
stack:
  - node.js
  - mysql2/promise
  - sql manual
  - migraciones propias
---

# base-de-datos-mysql2

Skill operativo para el manejo disciplinado de base de datos en proyectos Node.js sin ORM.

---

## filosofía

> Este proyecto no necesita magia de ORM para ser profesional. La disciplina está en la estructura, no en la herramienta.

SQL manual puede ser correcto si está bien organizado. Las migraciones son la fuente de verdad de la evolución del esquema. La IA debe adaptarse al proyecto existente, no imponer otro stack.

---

## enfoque oficial del proyecto

| decisión | valor |
|---|---|
| tecnología de acceso a datos | `mysql2/promise` |
| queries | SQL manual, escritas explícitamente |
| ORM | **no se usa. no introducir.** |
| evolución del esquema | migraciones versionadas |
| sincronización automática | **no existe. no proponer.** |
| lógica de acceso a datos | vive en `repositories/` |
| lógica de negocio | vive en `services/` |
| SQL en controllers | **prohibido** |
| SQL en services | **prohibido** |

---

## estructura recomendada

```
src/
  config/
    db.js                         ← conexión única al pool mysql2
  repositories/
    usuario.repository.js         ← queries SQL del dominio usuario
    pedido.repository.js
    ...

database/
  migrations/
    001_crear_tabla_usuarios.sql  ← migraciones ordenadas numéricamente
    002_agregar_columna_email.sql
    003_crear_tabla_pedidos.sql
    ...
  seeds/                          ← opcional, solo si hay datos base fijos
    01_roles.sql
  migrate.js                      ← runner que aplica migraciones pendientes
  rollback.js                     ← opcional, revierte la última migración
```

---

## responsabilidades por carpeta

### `src/config/db.js`

- Crea y exporta el pool de conexiones con `mysql2/promise`.
- Es la única fuente de conexión al motor de base de datos.
- No contiene lógica de negocio ni queries.
- Todos los repositories lo importan desde aquí.

```js
// estructura mínima esperada
import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});
```

### `src/repositories/`

- Contiene un archivo por dominio o entidad principal.
- Cada archivo exporta funciones con queries SQL explícitas.
- Solo accede a la base de datos. No contiene lógica de negocio.
- Recibe y devuelve datos crudos o estructurados simples.
- Usa el pool importado desde `config/db.js`.

```js
// estructura mínima esperada en un repository
import { pool } from '../config/db.js';

export async function findById(id) {
  const [rows] = await pool.execute('SELECT * FROM usuarios WHERE id = ?', [id]);
  return rows[0] ?? null;
}

export async function create(data) {
  const [result] = await pool.execute(
    'INSERT INTO usuarios (nombre, email) VALUES (?, ?)',
    [data.nombre, data.email]
  );
  return result.insertId;
}
```

### `database/migrations/`

- Contiene un archivo `.sql` por cada cambio estructural de la base de datos.
- Los archivos se nombran con prefijo numérico secuencial.
- Cada archivo es inmutable una vez aplicado en producción.
- El sistema ejecuta solo los archivos no registrados aún en la tabla `migrations`.

### `database/migrate.js`

- Script runner que aplica migraciones pendientes en orden.
- Lee los archivos de `migrations/` en orden numérico.
- Consulta la tabla `migrations` para saber cuáles ya se ejecutaron.
- Ejecuta solo los archivos nuevos.
- Registra cada migración ejecutada en la tabla `migrations`.

### `database/rollback.js` (opcional)

- Revierte la última migración aplicada si existe definición `down`.
- Solo recomendado en entorno de desarrollo.

### `database/seeds/` (opcional)

- Contiene datos base fijos necesarios para el sistema.
- Solo crear si hay datos que el sistema requiere para funcionar (roles, catálogos, configuración inicial).
- No crear seeds para datos de prueba ni datos de usuarios.

---

## cómo funcionan las migraciones

### tabla de control

Al correr por primera vez `migrate.js`, se debe crear automáticamente la tabla `migrations` si no existe:

```sql
CREATE TABLE IF NOT EXISTS migrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL UNIQUE,
  ejecutada_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### lógica de ejecución

1. Leer todos los archivos de `database/migrations/` ordenados alfabéticamente (el prefijo numérico garantiza el orden).
2. Consultar `SELECT nombre FROM migrations` para obtener las ya ejecutadas.
3. Filtrar los archivos no presentes en el registro.
4. Ejecutar cada archivo pendiente en orden.
5. Registrar cada uno en `migrations` al completarse exitosamente.

### reglas de las migraciones

- **No editar** un archivo de migración ya aplicado.
- **No eliminar** migraciones ya ejecutadas.
- **Nuevos cambios** = nuevo archivo con número siguiente.
- Cada archivo debe ser autocontenido y ejecutable de forma independiente.
- Incluir `IF NOT EXISTS` o `IF EXISTS` donde corresponda para mayor seguridad.
- Nombrar con claridad: `004_agregar_columna_telefono_usuarios.sql`, no `004_cambio.sql`.

### estructura recomendada de un archivo de migración

```sql
-- 004_agregar_columna_telefono_usuarios.sql
-- descripción: agrega columna opcional de teléfono a la tabla usuarios

ALTER TABLE usuarios
ADD COLUMN telefono VARCHAR(20) NULL AFTER email;
```

---

## flujo para agregar una tabla nueva

1. Revisar `database/migrations/` para identificar el número siguiente.
2. Revisar si hay una tabla relacionada que deba actualizarse (claves foráneas).
3. Crear archivo `NNN_crear_tabla_[nombre].sql` con el `CREATE TABLE` completo.
4. Incluir tipos de datos explícitos, restricciones, índices y relaciones si aplica.
5. Crear o actualizar el repository correspondiente en `src/repositories/`.
6. Verificar si algún service necesita métodos nuevos.
7. No modificar migraciones anteriores.

---

## flujo para agregar una columna nueva

1. Identificar la tabla afectada.
2. Revisar el repository de esa tabla para ver qué queries ya existen.
3. Identificar si la nueva columna afecta queries de `SELECT`, `INSERT` o `UPDATE` existentes.
4. Crear archivo `NNN_agregar_columna_[columna]_[tabla].sql` con el `ALTER TABLE`.
5. Actualizar las queries del repository si la columna debe incluirse en los resultados o escrituras.
6. Si la columna es `NOT NULL` sin default, evaluar si es compatible con datos existentes.
7. Advertir al usuario si el cambio puede romper compatibilidad con registros actuales.

---

## flujo para modificar lógica de acceso a datos

1. Leer el archivo del repository completo antes de editar.
2. Identificar todas las funciones que ejecutan queries sobre la tabla afectada.
3. Verificar qué servicios llaman a esas funciones.
4. Evaluar si el cambio en la query es compatible con los datos que devuelve actualmente.
5. Hacer el cambio mínimo necesario.
6. Si el cambio modifica la firma de una función (parámetros o retorno), actualizar todos sus puntos de uso.

---

## rutina: "agrega una tabla nueva"

1. Revisar `database/migrations/` — identificar número siguiente disponible.
2. Revisar la arquitectura de tablas relacionadas (claves foráneas potenciales).
3. Proponer el archivo de migración con el `CREATE TABLE` completo y explícito.
4. Proponer el repository correspondiente con las funciones básicas: `findById`, `findAll`, `create`, `update`, `deleteById`.
5. Explicar si algún repository o service existente debe actualizarse.

---

## rutina: "agrega una columna"

1. Identificar la tabla exacta.
2. Revisar el repository de esa tabla — listar las queries que hacen `SELECT *` o `INSERT` sobre ella.
3. Determinar si la columna es `NOT NULL`, nullable o tiene default.
4. Advertir si `NOT NULL` sin default puede fallar con registros existentes.
5. Crear el archivo de migración con `ALTER TABLE ... ADD COLUMN`.
6. Proponer actualizaciones a las queries del repository si corresponde.

---

## rutina: "quiero algo como sync de Sequelize"

1. Explicar claramente que ese mecanismo no existe en este enfoque y no se va a introducir.
2. Explicar que en este proyecto el esquema evoluciona mediante migraciones versionadas.
3. Proponer revisar si existe `database/migrate.js` en el proyecto.
4. Si no existe, proponer crearlo como runner de migraciones compatible con `mysql2`.
5. No proponer ni instalar ningún ORM para resolver esta necesidad.

---

## rutina: "ordena la parte de base de datos"

1. Analizar la estructura actual del proyecto: dónde vive la conexión, dónde están las queries, si hay migraciones.
2. Identificar si `db.js` o equivalente ya existe. Si no, proponer crearlo.
3. Identificar queries dispersas en controllers o services y proponer moverlas a repositories.
4. Verificar si existe carpeta `database/migrations/`. Si no, proponer crearla con las migraciones que reflejen el estado actual del esquema.
5. Proponer `migrate.js` si no existe.
6. No introducir ORM bajo ninguna circunstancia en esta rutina.

---

## checklist antes de cambiar esquema

- [ ] Revisé las migraciones existentes para entender el estado actual del esquema.
- [ ] Identifiqué el número de migración siguiente.
- [ ] El cambio es incremental (no destruye datos sin advertencia).
- [ ] Si hay columnas `NOT NULL` nuevas, consideré el impacto en datos existentes.
- [ ] El archivo de migración tiene nombre descriptivo y autocontenido.
- [ ] No edité una migración ya aplicada.

---

## checklist antes de tocar repositories

- [ ] Leí el archivo del repository completo.
- [ ] Identifiqué qué services usan las funciones que voy a modificar.
- [ ] El SQL que propongo es explícito (sin `SELECT *` salvo justificación).
- [ ] Las queries no contienen lógica de negocio.
- [ ] Si modifico la firma de una función, actualicé sus puntos de uso.
- [ ] Las queries usan parámetros preparados (`?`), nunca interpolación de strings.

---

## buenas prácticas obligatorias

- Mantener todo el SQL dentro de `repositories/`. Nunca en controllers ni services.
- Usar siempre parámetros preparados: `pool.execute('... WHERE id = ?', [id])`.
- Nunca interpolar variables directamente en strings SQL.
- Especificar columnas explícitas en `SELECT` cuando el resultado se expone al exterior.
- Usar transacciones cuando haya dos o más operaciones dependientes entre sí.
- Nombrar las funciones del repository de forma descriptiva: `findByEmail`, `updateEstado`, `deleteByPedidoId`.
- Nombrar migraciones con prefijo numérico y descripción clara.
- Documentar brevemente el propósito de cada migración con un comentario en la primera línea.

---

## errores que la IA debe evitar

| error | consecuencia |
|---|---|
| Proponer Sequelize, Prisma o TypeORM sin solicitud | rompe el enfoque del proyecto |
| Escribir SQL en controllers o services | mezcla de responsabilidades |
| Editar una migración ya aplicada | inconsistencia entre entornos |
| Usar `SELECT *` sin justificación | fragilidad ante cambios de esquema |
| Interpolación directa de variables en SQL | vulnerabilidad de inyección SQL |
| Crear migraciones destructivas sin advertencia | pérdida de datos |
| Suponer columnas o tablas no visibles en el proyecto | errores en runtime |
| Inventar seeds innecesarios | ruido en la base de datos |
| Proponer `sync({ force: true })` o equivalente | inaceptable en este enfoque |

---

## ejemplos de buen comportamiento

**cuando se pide agregar una tabla:**
> "Voy a revisar las migraciones existentes para determinar el número siguiente, y luego proponer `005_crear_tabla_direcciones.sql` con el esquema completo. También crearé `direccion.repository.js` con las funciones básicas de acceso."

**cuando se pide agregar una columna:**
> "La columna `activo TINYINT(1) NOT NULL DEFAULT 1` es segura de agregar porque tiene valor default y no afectará registros existentes. La migración sería `006_agregar_columna_activo_usuarios.sql`. Voy a revisar también si alguna query del repository de usuarios debería incluir esta columna en sus filtros."

**cuando hay operaciones dependientes:**
> "Esta operación escribe en dos tablas. Voy a usar una transacción para garantizar consistencia. Si falla la segunda inserción, se revierte la primera."

---

## ejemplos de mal comportamiento

**introducir ORM sin solicitud:**
> "Te recomiendo instalar Prisma, que simplifica mucho esto."
→ **Incorrecto.** Este proyecto no usa ORM. No proponer salvo solicitud explícita.

**SQL en un service:**
> "En el service agrego directamente `await pool.execute('SELECT...')`."
→ **Incorrecto.** El SQL vive en repositories, no en services.

**editar migración existente:**
> "Modifiqué `001_crear_tabla_usuarios.sql` para agregar la columna nueva."
→ **Incorrecto.** Las migraciones aplicadas son inmutables. El cambio va en una nueva.

**interpolación en query:**
> `` `SELECT * FROM usuarios WHERE email = '${email}'` ``
→ **Incorrecto.** Siempre usar parámetros preparados: `'... WHERE email = ?', [email]`.

**sync automático:**
> "Podemos usar `createPool` y configurar sync para que cree las tablas automáticamente."
→ **Incorrecto.** No existe ni se desea ese mecanismo en este proyecto.

---

## notas finales

Este skill define la estrategia oficial de base de datos del proyecto. Cualquier sugerencia que contradiga este enfoque requiere solicitud explícita del usuario y justificación técnica clara.

Si existe un skill de sesión base activo, este skill tiene prioridad sobre él en todo lo relacionado a base de datos, estructura de repositories y migraciones.

Ante cualquier cambio de esquema, pensar primero en el historial: las migraciones son la memoria estructural del proyecto.
