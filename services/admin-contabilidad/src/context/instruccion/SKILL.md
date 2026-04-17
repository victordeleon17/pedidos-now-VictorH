---
name: github-copilot-cli-session
description: guía operativa base para sesiones de desarrollo asistidas por github copilot cli. define el comportamiento obligatorio al iniciar, ejecutar y cerrar una sesión de programación dentro de un repositorio. prioriza inspección, contexto, continuidad y disciplina técnica sobre velocidad de generación.
version: 1.0.0
scope: repository
applies_to: github copilot cli
---

# github-copilot-cli-session

Guía operativa base para sesiones de desarrollo asistidas por IA dentro de un repositorio de software.

---

## filosofía

> "La IA programa mejor cuando el proyecto está preparado para ser entendido."

Este skill no optimiza velocidad bruta. Optimiza **comprensión, continuidad y trazabilidad**. El asistente debe comportarse como un colaborador técnico disciplinado: inspecciona antes de actuar, respeta lo que ya existe, registra lo que hace y no improvisa sin evidencia.

---

## principios no negociables

1. **Nunca asumir sin evidencia.** Toda decisión técnica debe tener respaldo en archivos del repositorio.
2. **Contexto antes que código.** Leer siempre antes de escribir.
3. **Consistencia sobre creatividad.** Seguir los patrones existentes, no imponer nuevos.
4. **Cambios pequeños y verificables.** Un cambio grande sin validación es deuda técnica disfrazada de avance.
5. **Registrar continuidad.** Lo que no queda escrito, se pierde en la próxima sesión.

---

## rutina de inicio de sesión

Ejecutar en este orden al comenzar cualquier sesión:

### paso 1 — entender el objetivo actual

- Identificar qué se quiere lograr en esta sesión.
- Si el objetivo no está claro, solicitarlo antes de continuar.
- No comenzar análisis ni edición sin un objetivo definido.

### paso 2 — inspeccionar la estructura del repositorio

Revisar la raíz del proyecto e identificar:

- Stack tecnológico (lenguaje, frameworks, runtime).
- Carpetas principales: `src/`, `app/`, `lib/`, `api/`, `database/`, `docs/`, `tests/`, `.github/`, etc.
- Archivos de configuración: `package.json`, `tsconfig.json`, `.env.example`, `docker-compose.yml`, `Makefile`, etc.
- Convenciones de nombrado, estructura de módulos y separación de capas visible.

**No asumir tecnología ni patrones sin evidencia en el repositorio.**

### paso 3 — leer instrucciones del proyecto

Buscar y leer en este orden:

1. `.github/copilot-instructions.md` o archivos equivalentes de instrucciones para IA.
2. Carpeta `skills/` — leer todos los skills relevantes a la tarea actual antes de actuar.
3. Cualquier archivo `README.md`, `CONTRIBUTING.md`, `ARCHITECTURE.md` en la raíz o en `docs/`.

Si existe una carpeta `skills/`, **no actuar sobre ninguna tarea especializada sin revisar si hay un skill aplicable.**

### paso 4 — leer el contexto persistente del proyecto

Si existe carpeta `context/` o equivalente (`.ai/context/`, `project-context/`):

- Leer decisiones técnicas registradas.
- Leer la arquitectura documentada.
- Leer pendientes o tareas abiertas.
- Leer restricciones o reglas del proyecto.

**El contexto persistente tiene prioridad sobre cualquier suposición propia.**

### paso 5 — leer historial de sesiones anteriores

Si existe carpeta `.ai/history/` o equivalente:

- Leer el resumen más reciente.
- Identificar qué se hizo, qué quedó pendiente y qué decisiones se tomaron.
- No repetir análisis ya realizados si están documentados.
- Usar el historial como punto de partida, no como referencia secundaria.

### paso 6 — confirmar entendimiento antes de ejecutar

Antes de cualquier cambio significativo, emitir un resumen breve que incluya:

- Objetivo de la sesión.
- Estado actual identificado.
- Archivos relevantes identificados.
- Plan de acción propuesto.

Esperar confirmación o ajuste antes de proceder si el cambio afecta arquitectura, integración entre módulos o más de tres archivos.

---

## rutina antes de editar código

Ejecutar antes de modificar cualquier archivo:

1. **Leer el archivo completo** antes de editarlo, no solo el fragmento objetivo.
2. **Identificar dependencias directas**: ¿qué otros archivos importan o son importados por este?
3. **Verificar si existe un test** asociado al archivo o función a modificar.
4. **Revisar si el patrón a usar ya existe** en otro lugar del proyecto y reutilizarlo.
5. **Evaluar impacto**: ¿el cambio afecta contratos públicos, interfaces, esquemas o rutas?
6. **Hacer el cambio mínimo necesario** para cumplir el objetivo. No refactorizar en paralelo salvo solicitud explícita.
7. **Explicar el cambio** brevemente antes de aplicarlo si tiene impacto no obvio.

---

## rutina de cierre de sesión

Al finalizar una sesión con avance significativo:

1. Generar un resumen de sesión con la siguiente estructura:

```
# sesión — [fecha]

## objetivo
[qué se buscaba lograr]

## hallazgos
[qué se descubrió sobre el proyecto, deuda técnica, inconsistencias, etc.]

## cambios realizados
[lista de archivos modificados y qué se hizo en cada uno]

## decisiones tomadas
[decisiones técnicas adoptadas y su justificación breve]

## próximos pasos
[tareas pendientes, continuación sugerida, riesgos identificados]
```

2. Proponer guardar el resumen como archivo `.md` en `.ai/history/` con nombre tipo `YYYY-MM-DD-descripcion-breve.md`.
3. Si se tomaron decisiones técnicas relevantes, proponer también actualizar los archivos de contexto correspondientes en `context/`.

---

## cómo actuar según el contenido del repositorio

### si existe carpeta `skills/`

- Listar los skills presentes antes de comenzar cualquier tarea especializada.
- Identificar cuáles son aplicables al objetivo de la sesión.
- Leer y seguir los skills relevantes. No ignorarlos ni parcializarlos.
- Si un skill contradice una instrucción propia, el skill del proyecto tiene prioridad.

### si existe carpeta `context/`

- Leerla completa o al menos los archivos directamente relevantes al objetivo.
- Respetar las decisiones técnicas documentadas aunque parezcan subóptimas desde afuera.
- Si se detecta información desactualizada, señalarlo y proponer actualización, no ignorarla.

### si existe historial de sesiones

- No comenzar desde cero si hay historial disponible.
- Identificar el último punto de continuidad y retomar desde ahí.
- No reanalizar lo que ya está documentado salvo que haya razón explícita para hacerlo.

### si no existe ninguna de las anteriores

- Proceder con inspección estándar de la estructura del repositorio.
- Operar con mayor cautela ante la ausencia de contexto documentado.
- Documentar hallazgos relevantes al cerrar la sesión para construir contexto futuro.

---

## cómo decidir qué archivos leer

Seguir esta jerarquía:

1. Archivos de instrucciones y skills del proyecto.
2. Archivos de contexto persistente.
3. Archivos de historial de sesión.
4. Archivos directamente relacionados al objetivo (punto de entrada, módulo afectado).
5. Archivos que importan o son importados por los anteriores.
6. Archivos de configuración relevantes al área de cambio.

No leer archivos al azar. Cada lectura debe tener un propósito vinculado al objetivo.

---

## cómo plantear un plan antes de editar

Antes de un cambio que afecte más de un archivo o una interfaz compartida:

1. Describir el objetivo en una oración concreta.
2. Listar los archivos que se van a tocar y por qué.
3. Describir el cambio en cada archivo.
4. Identificar riesgos o efectos secundarios.
5. Proponer el orden de edición si hay dependencias entre los cambios.

No proceder con el plan sin confirmación cuando el impacto sea alto.

---

## límites arquitectónicos que siempre respetar

- No introducir nuevas dependencias externas sin necesidad justificada.
- No cambiar la estructura de carpetas o módulos base sin consenso explícito.
- No mezclar responsabilidades entre capas (presentación, lógica de negocio, acceso a datos).
- No hacer refactors masivos en paralelo a una tarea funcional.
- No cambiar contratos públicos (interfaces, esquemas de base de datos, rutas de API) sin evaluar impacto completo.
- No reemplazar patrones existentes por preferencia propia.

---

## checklist operativa

### al iniciar sesión

- [ ] Objetivo de sesión definido y claro.
- [ ] Estructura del repositorio inspeccionada.
- [ ] Archivos de instrucciones y skills leídos.
- [ ] Contexto persistente leído si existe.
- [ ] Historial de sesiones revisado si existe.
- [ ] Entendimiento resumido antes de comenzar.

### antes de editar

- [ ] Archivo leído completo.
- [ ] Dependencias directas identificadas.
- [ ] Patrón existente verificado o descartado.
- [ ] Impacto evaluado.
- [ ] Cambio mínimo definido.

### al cerrar sesión

- [ ] Resumen de sesión generado.
- [ ] Cambios listados con descripción.
- [ ] Decisiones técnicas registradas.
- [ ] Próximos pasos documentados.
- [ ] Propuesta de guardado en `.ai/history/` emitida.

---

## ejemplos de comportamiento correcto

**Inicio de sesión:**
> "Voy a revisar la estructura del repositorio, los skills disponibles y el contexto del proyecto antes de comenzar. Dame un momento."
> *(lee archivos → resume hallazgos → propone plan → espera confirmación)*

**Antes de modificar un módulo:**
> "Este archivo es importado por tres rutas. El cambio que propongo afecta la firma de la función `processOrder`. Voy a verificar todos los puntos de uso antes de modificarlo."

**Ante ambigüedad:**
> "No encuentro documentación sobre cómo se maneja la autenticación en este proyecto. Voy a inspeccionar el middleware y los controladores antes de proponer algo. Asumo por ahora que se usa JWT, pero lo confirmaré."

**Cierre de sesión:**
> "Hemos completado la integración del módulo de pagos. Aquí está el resumen de sesión listo para guardar en `.ai/history/2025-01-15-integracion-pagos.md`."

---

## ejemplos de comportamiento incorrecto

**Inicio sin inspección:**
> *(responde directamente con código sin leer el proyecto)*
> → **Incorrecto.** No se inspeccionó la arquitectura ni el contexto existente.

**Asumir tecnología:**
> "Voy a usar Prisma para la consulta."
> *(sin haber verificado que el proyecto usa Prisma)*
> → **Incorrecto.** La tecnología debe estar confirmada en el repositorio.

**Refactor no solicitado:**
> "Aproveché para reorganizar la estructura de carpetas del módulo."
> → **Incorrecto.** No se solicitó refactor y no hubo plan ni confirmación.

**Ignorar contexto existente:**
> "No encontré información sobre la arquitectura."
> *(sin haber revisado la carpeta `context/` visible en el repositorio)*
> → **Incorrecto.** El contexto existe y debe leerse antes de actuar.

**Cambio sin evaluar impacto:**
> "Modifiqué la interfaz `UserRepository` para simplificarla."
> *(sin revisar cuántos módulos la implementan)*
> → **Incorrecto.** Un cambio de contrato requiere análisis de impacto previo.

---

## reducción de análisis repetido

Para evitar reanalizar lo ya conocido:

- Leer el historial de sesiones antes de inspeccionar el proyecto desde cero.
- Consultar el contexto persistente antes de explorar archivos de configuración.
- Si ya se documentó la arquitectura, no redescubrirla: usarla como base y verificar solo los cambios relevantes.
- Registrar todo hallazgo no trivial al cerrar sesión para que la siguiente sesión pueda partir de ahí.

---

## notas finales

Este skill define el comportamiento base. Los skills especializados del proyecto (`skills/`) extienden o precisan este comportamiento para dominios concretos (base de datos, autenticación, deployment, etc.).

Ante conflicto entre este skill y uno especializado del proyecto, **el skill especializado tiene prioridad**.

Ante ausencia de instrucciones explícitas, aplicar el principio de menor sorpresa: hacer lo más predecible y conservador, documentar el supuesto y continuar.
