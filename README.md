# 888DIGITALFACTORY — Git Flow CI/CD

Dashboard cyberpunk inspirado en el panel Nexus compartido: grafo de ramas, historial de commits, etapas de CI/CD, controles de seguridad y actividad.

## Archivos
- `index.html`, `styles.css`, `app.js`: dashboard interactivo de frontend.
- `.github/workflows/secure-cicd.yml`: workflow de GitHub Actions con cinco jobs.

## Flujo de ramas sugerido
- `feature/*` o `fix/*`: trabajo aislado por cambio.
- Pull request hacia `develop`: validación y revisión.
- `release/*`: estabilización previa.
- Pull request hacia `main`: versión productiva.
- Push directo a `main`: valida y despliega GitHub Pages.

El workflow corre validaciones y seguridad en push/PR. El job de despliegue se ejecuta solo en `main` y no tiene aprobaciones manuales configuradas.

## Publicar en GitHub
1. Copia estos archivos a la raíz del repositorio.
2. En GitHub abre **Settings → Pages** y configura **Build and deployment → Source: GitHub Actions**.
3. Haz commit y push a `main`.
4. Revisa **Actions → 888DIGITALFACTORY | Secure CI/CD**.

## Importante: demo visual vs. datos reales
El grafo, los commits y la actividad que se muestran en el navegador son datos de ejemplo; el botón “Simular nuevo commit” y “Run demo flow” solo simulan el comportamiento del frontend. Los jobs del workflow sí se ejecutan en GitHub Actions cuando se hace push/PR. Para alimentar el dashboard con el historial real del repositorio y el estado real de los jobs hay que añadir integración con la GitHub REST API y autenticación segura (no exponer tokens en el frontend).
