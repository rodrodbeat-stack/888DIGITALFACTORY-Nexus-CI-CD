# 888DIGITALFACTORY NEXUS — Unified Operations Center

Dashboard estático multipanel para GitHub Pages. El CI/CD es un módulo dentro del centro de operaciones, no la única vista.

## Módulos
- Overview / navegación de módulos
- Source Control: branches, commits y grafo aproximado desde la API pública de GitHub
- CI/CD: pipeline visual de demostración
- GitHub Actions: ejecuciones y jobs reales visibles públicamente
- Environments: DEV, CERT, QA, PROD
- Security posture
- Governance center
- Infrastructure topology
- Observability & incidents
- FinOps & cost governance
- Applications & users
- Audit stream / commits

## Publicar
Sube `index.html`, `styles.css`, `app.js` y `README.md` a la raíz del repositorio y realiza un único commit. Activa GitHub Pages desde Settings → Pages si aún no está habilitado.

## Transparencia de datos
Los datos de branches, commits y Actions proceden de la API pública de GitHub cuando el repositorio y sus ejecuciones son accesibles. El pipeline visual es demostrativo. Los paneles de Security, Governance, Infrastructure, Observability, FinOps y Applications incluyen vistas de referencia y **no muestran métricas reales** hasta integrar las APIs o proveedores correspondientes. No se requieren tokens para las consultas públicas actuales; no pongas secretos en archivos frontend.


## Diagramas por módulo
Cada sección del dashboard incorpora su propio diagrama de flujo interactivo. Pulsa una etapa para ver su función. Los diagramas describen el flujo operativo de referencia; solo GitHub branches, commits y Actions se consultan en vivo si la API pública los devuelve.
