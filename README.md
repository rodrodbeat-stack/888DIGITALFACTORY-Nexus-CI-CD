# 888DIGITALFACTORY — Nexus CI/CD

Dashboard estático con estética cyber/Nexus, inventario de ramas reales y commits recientes consultados desde la API pública de GitHub.

## Archivos
- `index.html`: estructura del dashboard.
- `styles.css`: diseño responsive oscuro, paneles, grafo y animaciones.
- `app.js`: consulta de branches/commits, filtros y animación del pipeline.

## Publicar en GitHub Pages
1. Descomprime el ZIP.
2. Sube los cuatro archivos a la raíz del repositorio `rodrodbeat-stack/888DIGITALFACTORY-Nexus-CI-CD`.
3. En GitHub abre **Settings → Pages**.
4. En Build and deployment selecciona **Deploy from a branch**, branch `main`, folder `/ (root)` y guarda.
5. Espera a que termine el workflow de Pages y abre la URL que GitHub muestre.

## Notas
- El dashboard usa el endpoint público `https://api.github.com/repos/rodrodbeat-stack/888DIGITALFACTORY-Nexus-CI-CD` y no necesita token mientras el repositorio sea público.
- Para limitar el número de peticiones, consulta hasta 20 ramas y hasta 8 commits por rama en cada sincronización.
- El grafo es una representación visual aproximada de ramas y commits recientes; no reconstruye todas las relaciones de merge del DAG de Git.
- **RUN DEMO PIPELINE** es una simulación visual local. No ejecuta GitHub Actions ni despliega aplicaciones.
