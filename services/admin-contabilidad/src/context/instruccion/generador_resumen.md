---
name: generador-resumen-sesion
description: skill para generar resúmenes estructurados al finalizar una sesión de desarrollo. convierte el trabajo técnico realizado en una memoria útil y reutilizable dentro de context/, para que futuras sesiones asistidas por ia puedan retomar el proyecto con contexto completo y sin repetir análisis ya realizados.
version: 1.0.0
scope: repository
applies_to: github copilot cli
triggers:
  - "genera el resumen de la sesión"
  - "cierra la sesión y documenta"
  - "documenta el avance"
  - "registra continuidad"
  - "quiero dejar constancia de esto"
---

# generador-resumen-sesion

Skill para convertir una sesión técnica en una memoria estructurada, útil y reutilizable dentro de `context/`.

---

## filosofía

La continuidad del proyecto no debe depender solo de la memoria humana. Este skill existe para que cada sesión de trabajo deje trazabilidad real: no una narración de lo hablado, sino un documento técnico que sirva tanto a humanos como a la IA en sesiones posteriores.

Un buen resumen es breve, técnico, honesto y accionable. Un mal resumen es relleno.

---

## cuándo activar este skill

Activar ante cualquiera de estas situaciones:

- El usuario solicita explícitamente: `"genera el resumen de la sesión"` o `"cierra la sesión y documenta"`.
- El usuario indica que hubo un avance importante y quiere dejar constancia.
- El usuario solicita registrar continuidad para futuras sesiones.
- La sesión incluyó decisiones técnicas relevantes, cambios en archivos críticos o resolución de un problema significativo.
- Se detecta cierre natural de sesión con trabajo acumulado no documentado.

**No activar** si la sesión fue trivial (una sola pregunta puntual sin consecuencias técnicas) y el usuario no lo solicita.

---

## preparación obligatoria antes de redactar

Nunca redactar el resumen sin haber hecho primero lo siguiente:

### 1. revisar el directorio `context/`

- Verificar si existe la carpeta `context/` en el repositorio.
- Listar los archivos presentes, en especial los más recientes.
- Leer el resumen del día actual si ya existe (`YYYY-MM-DD-avance.md`).
- Leer el resumen más reciente anterior si la sesión actual tiene continuidad con trabajo previo.
- Identificar qué ya está documentado para no duplicarlo innecesariamente.

### 2. revisar los archivos trabajados durante la sesión

- Identificar qué archivos fueron modificados, creados o analizados.
- Revisar los cambios concretos realizados en cada uno.
- Identificar módulos, capas o áreas del sistema afectadas.

### 3. identificar decisiones técnicas tomadas

- Decisiones de arquitectura, diseño o implementación adoptadas.
- Alternativas descartadas y razón del descarte si se mencionó.
- Supuestos que se tomaron como válidos sin confirmación total.

### 4. identificar continuidad con trabajo previo

- ¿Esta sesión retomó algo de una sesión anterior?
- ¿Se resolvió algún pendiente documentado previamente?
- ¿Surgieron nuevos pendientes que antes no existían?

### 5. sintetizar sin repetir

- Si la información ya está en un resumen anterior, no copiarla. Referenciarla o indicar que se mantiene vigente.
- Solo documentar lo que esta sesión aportó de nuevo.

---

## rutina: "genera el resumen de la sesión"

Cuando el usuario emite esta instrucción:

1. Confirmar que se va a generar el resumen antes de redactarlo.
2. Ejecutar la preparación obligatoria descrita arriba.
3. Determinar si ya existe un archivo `context/YYYY-MM-DD-avance.md` para la fecha actual.
4. Redactar el resumen usando la estructura obligatoria.
5. Presentar el contenido al usuario para revisión antes de proponer guardarlo.
6. Proponer la ruta exacta donde debe guardarse: `context/YYYY-MM-DD-avance.md`.

---

## rutina: "cierra la sesión y documenta"

Cuando el usuario emite esta instrucción:

1. Reconocer el cierre de sesión.
2. Ejecutar la preparación obligatoria descrita arriba.
3. Generar el resumen completo con todas las secciones obligatorias.
4. Si hubo muy poco trabajo técnico real, documentar honestamente que la sesión fue exploratoria o de análisis.
5. Presentar el resumen y proponer guardarlo en `context/YYYY-MM-DD-avance.md`.
6. Si aplica, señalar qué archivos de `context/` deberían actualizarse con decisiones técnicas tomadas en la sesión.

---

## criterio: ¿crear nuevo archivo o actualizar el del día?

| situación | acción |
|---|---|
| No existe archivo del día | Crear `context/YYYY-MM-DD-avance.md` |
| Existe archivo del día y la sesión es continuación directa | Actualizar el archivo existente, agregando sección o integrando coherentemente |
| Existe archivo del día pero la sesión abordó un tema completamente distinto | Agregar una sección nueva dentro del mismo archivo del día |
| El archivo del día ya es extenso y el nuevo contenido lo haría confuso | Crear archivo con sufijo: `YYYY-MM-DD-avance-2.md` |

**Nunca** crear un archivo duplicado con el mismo contenido que uno ya existente.

---

## estructura obligatoria del resumen

Usar exactamente esta estructura. No omitir secciones. Si una sección no aplica, indicarlo brevemente en lugar de eliminarla.

```markdown
# sesión — YYYY-MM-DD

## objetivo de la sesión
[qué se buscaba lograr en esta sesión, en una o dos oraciones]

## contexto revisado
[qué archivos, documentos o resúmenes previos se leyeron como base]

## hallazgos importantes
[descubrimientos sobre el proyecto: deuda técnica, inconsistencias, comportamientos inesperados, aclaraciones]

## cambios realizados
[lista de archivos o módulos modificados y descripción concreta del cambio]
- `ruta/archivo.ext` — descripción del cambio
- (ninguno si la sesión fue exploratoria)

## decisiones tomadas
[decisiones técnicas adoptadas, con justificación breve cuando aplique]
- decisión — razón

## riesgos o dudas pendientes
[riesgos detectados, supuestos sin confirmar, preguntas abiertas]
- (ninguno si no aplica)

## próximos pasos
[tareas concretas que deben realizarse en la siguiente sesión o en el corto plazo]
- [ ] tarea concreta
```

---

## nombre del archivo

El nombre debe seguir exactamente este patrón:

```
YYYY-MM-DD-avance.md
```

Ejemplo para el 3 de abril de 2026:

```
context/2026-04-03-avance.md
```

Usar la fecha local del sistema o la fecha que indique el usuario si la especifica.

---

## checklist de verificación antes de guardar

Verificar que el resumen cumpla todo lo siguiente antes de proponer guardarlo:

- [ ] Todas las secciones obligatorias presentes, aunque sea con "no aplica".
- [ ] El objetivo de la sesión está en una o dos oraciones concretas.
- [ ] Los cambios realizados mencionan archivos o módulos reales, no generalidades.
- [ ] Las decisiones están justificadas, no solo enunciadas.
- [ ] Los próximos pasos son tareas accionables, no intenciones vagas.
- [ ] No se repite información ya documentada en resúmenes anteriores sin necesidad.
- [ ] Si la sesión fue exploratoria, está indicado honestamente.
- [ ] El archivo va a guardarse en `context/` con el nombre correcto.

---

## ejemplos de buen resumen

### sesión exploratoria sin implementación

```markdown
# sesión — 2026-04-03

## objetivo de la sesión
Entender cómo está estructurado el módulo de autenticación antes de planificar cambios.

## contexto revisado
- `context/2026-04-01-avance.md`
- `src/auth/middleware.ts`, `src/auth/guards/jwt.guard.ts`

## hallazgos importantes
- El guard JWT no valida expiración de token en rutas de refresh. Posible bug latente.
- No existe test unitario para el middleware de autenticación.
- La estrategia Passport está acoplada directamente al UserService sin abstracción.

## cambios realizados
Ninguno. Sesión de análisis.

## decisiones tomadas
- Se decide no modificar el guard hasta tener tests que respalden el comportamiento actual.

## riesgos o dudas pendientes
- Confirmar si el bug de expiración en refresh ya fue reportado o es conocido.

## próximos pasos
- [ ] Escribir tests para `jwt.guard.ts` antes de cualquier modificación.
- [ ] Revisar si existe issue abierto sobre el refresh token.
```

### sesión con implementación

```markdown
# sesión — 2026-04-03

## objetivo de la sesión
Implementar validación de esquema en el endpoint POST /orders.

## contexto revisado
- `context/2026-04-02-avance.md`
- `src/orders/orders.controller.ts`, `src/orders/dto/create-order.dto.ts`

## hallazgos importantes
- El DTO existente no validaba el campo `items` como array no vacío.
- El controlador no usaba `ValidationPipe` globalmente; se aplicó solo a este endpoint.

## cambios realizados
- `src/orders/dto/create-order.dto.ts` — agregados decoradores `@IsArray()`, `@ArrayMinSize(1)` en campo `items`.
- `src/orders/orders.controller.ts` — aplicado `ValidationPipe` explícito en método `create()`.

## decisiones tomadas
- Se optó por `ValidationPipe` local en lugar de global para no afectar otros endpoints sin revisión previa.

## riesgos o dudas pendientes
- Verificar si otros endpoints de `orders` también requieren validación similar.

## próximos pasos
- [ ] Revisar `update-order.dto.ts` con el mismo criterio.
- [ ] Agregar test de integración para POST /orders con payload inválido.
```

---

## ejemplos de mal resumen

### demasiado vago

```markdown
## cambios realizados
Se trabajó en la autenticación y se mejoraron algunas cosas del código.
```
→ **Incorrecto.** No menciona archivos, no describe el cambio, no es útil para retomar.

### inventando avances

```markdown
## cambios realizados
- Se refactorizó el módulo de usuarios.
- Se mejoró el rendimiento de las consultas.
```
→ **Incorrecto** si eso no ocurrió. El resumen debe ser honesto aunque la sesión haya sido exploratoria.

### próximos pasos sin acción concreta

```markdown
## próximos pasos
- Seguir trabajando en el proyecto.
- Mejorar la calidad del código.
```
→ **Incorrecto.** Los próximos pasos deben ser tareas específicas y accionables.

### omitir secciones sin justificación

```markdown
# sesión — 2026-04-03

## objetivo
Revisar el código.

## cambios
Ninguno.
```
→ **Incorrecto.** Faltan secciones obligatorias. Aunque no haya contenido, deben estar presentes.

---

## notas finales

Este skill no reemplaza la documentación técnica formal del proyecto. Su función es generar **memoria de sesión**: un registro técnico, honesto y accionable que permita a cualquier sesión futura retomar el trabajo sin perder contexto.

Si existen otros archivos en `context/` con decisiones de arquitectura, reglas del proyecto o pendientes globales, este skill puede sugerir actualizarlos cuando la sesión haya producido información relevante para ellos.

El resumen de sesión es la continuidad del proyecto hecha texto. Tratar con la misma disciplina que el código.
