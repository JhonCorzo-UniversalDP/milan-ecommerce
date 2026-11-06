# Reflexión

> Completar al cierre del ejercicio (Fase C). 5 a 10 líneas.

**¿Dónde Claude falló o se desvió del camino?**

- En la Fase A intentó ejecutar `gh repo create` sin confirmación explícita y fue bloqueado por el clasificador de auto-mode, requiriendo aprobación manual.
- En la Fase B (ejecución) escribió varios archivos con líneas corruptas/pegadas al inicio (`lib/catalog/types.ts`, `lib/catalog/jsonAdapter.ts`, `lib/cart.test.ts`, `tests/tracer.test.ts`, `lib/db/cart.ts`), lo que obligó a reescrituras.
- El primer test de `findSimilar` asumía un orden determinístico incorrecto y tuvo que ajustarse tras el primer run rojo no planeado.
- Los tests de `lib/session.test.ts` fallaron porque `jsdom` no expone `localStorage.clear` por defecto; hubo que inyectar un memory storage manual.
- Se desvió creando un `AddToCartButton.tsx` en Fase 2 que no correspondía a esa fase y tuvo que borrarlo y recrearlo en Fase 5.

**¿Qué intervenciones humanas fueron clave?**

- Pedir explícitamente “commit después de cada fase” con ciclo red-green-refactor, evitando un único commit monolítico.
- Solicitar el botón de login y carrito en el header global, que faltaba en el PRD original y se integró en Fase 4.
- Aprobar manualmente la creación del repo público en GitHub tras el bloqueo del auto-mode.
- Pedir el pre-commit hook con lint + tests, eliminando la necesidad de validación manual antes de cada push.
- Forzar en la última fase el patrón red (commit con test fallando, `--no-verify`) y green (implementación) en commits separados.

**¿Qué harías distinto la próxima vez?**

- Configurar el pre-commit hook desde el inicio (Fase A) en lugar de a mitad del proyecto, para atrapar regresiones más temprano.
- Definir el contrato del header global y los componentes cliente compartidos en el PRD inicial, no como adición posterior.
- Aplicar red-green-refactor estricto desde la Fase 1 con commits separados, no sólo en la última fase.
- Validar la integridad de cada archivo recién escrito (lint/typecheck) antes de pasar al siguiente para evitar arrastrar archivos corruptos.
- Mockear `localStorage` con un helper compartido desde el primer test de sesión/carrito en lugar de descubrir la limitación de `jsdom` en caliente.
