NO escribas código en ningún momento. Vamos a redactar la especificación de la
primera funcionalidad de Portal Horarios Backend. Lee docs/constitution.md.

Idea inicial: Un Dashboard Web para un portal de Horarios y manejar con un espacio centralizado, y de fácil consulta, al que puedan acceder los miembros de la Junta Directiva para conocer rápidamente quién está trabajando, en qué modalidad y cuál es su horario programado. vamos a crear el incio de sesion con todas su partes y funciones. 


Tu trabajo:
1. Hazme preguntas de UNA en UNA para eliminar ambigüedades (casos límite,
   comportamiento con errores, qué queda fuera del MVP). Máximo 6 preguntas.
2. Con mis respuestas, genera specs/001-habits-mvp/spec.md con esta estructura:
   contexto y objetivo, usuarios, historias de usuario, requisitos funcionales
   numerados (RF-x) con criterios de aceptación en notación EARS en español,
   requisitos no funcionales, casos límite, fuera de alcance, criterios de
   finalización y dudas abiertas marcadas como [NECESITA ACLARACIÓN].
3. El QUÉ y el POR QUÉ. Nada de stack, arquitectura ni nombres de archivos:
   eso irá en el plan.


Implementa la fase 1 modelo de roles de specs/006-horarios-y-correcciones-de-acceso/tasks.md, siguiendo
plan.md y la constitución. escribe el codigo, despues ejecuta npm run lint y npm run build, Me muestras el resultado: marcas en cada casilla Las tareas de hechas en tasks.md,
indica qué RF cubre y PÁRATE.

Clarificacion

Revisa specs/006-horarios-y-correciones-de-acceso/spec.md como si fueras un QA muy profesional.
Lista: (1) ambigüedades restantes, (2) contradicciones entre requisitos,
(3) casos límite no cubiertos, (4) conflictos con docs/constitution.md.
No propongas soluciones todavía: solo detecta. Formato: lista numerada.

plan.md

Lee docs/constitution.md y specs/006-correcciones-panel-de-horarios-y-auditoria/spec.md. NO escribas código.
Genera specs/006-correcciones-panel-de-horarios-y-auditoria/plan.md con: estructura de módulos, modelo de
datos JSON con un ejemplo, algoritmos en pseudocódigo,
contrato de la CLI(comandos, salidas, códigos de salida), decisiones técnicas
justificadas (y su alternativa descartada), y estrategia de tests. Todo debe
respetar la constitución y cubrir todos los RF. Marca qué RF cubre cada parte. 

task.md

A partir de spec.md y plan.md, genera specs/006-horarios-y-correcciones-de-acceso/tasks.md:
tareas pequeñas (máx. 20-30 min cada una), en orden de dependencia, cada una
con los RF que cubre y una línea "Hecho cuando:" verificable. Usa checkboxes.


validacion

Recorre specs/004-integracion-tecnica-backend/spec.md requisito por requisito (RF-1 a RF-7).
Para cada uno indica: qué test lo cubre, y el resultado de ejecutarlo.
Si algún RF no está cubierto o falla, dilo claramente. Después comprueba los
criterios de finalización y dame un veredicto: ¿la spec está cumplida?