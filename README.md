# Pipeline DevOps con Herramientas Gratuitas

Aplicación CRUD full-stack con pipeline de CI/CD completo usando herramientas gratuitas.

## Estructura del Proyecto

```
├── frontend/          # Aplicación React
├── backend/           # API Node.js/Express
├── infrastructure/    # Archivos Terraform e IaC
└── .github/
    └── workflows/     # Pipelines CI/CD con GitHub Actions
```

## Tecnologías

- **Frontend:** React
- **Backend:** Node.js, Express
- **Base de Datos:** PostgreSQL
- **Containerización:** Docker
- **Orquestación:** Kubernetes (K3d)
- **IaC:** Terraform
- **CI/CD:** GitHub Actions
- **Monitoreo:** Grafana, Prometheus

## Requisitos

- Node.js 18+
- Docker
- Git

## Instalación

```bash
# Clonar repositorio
git clone <repository-url>

# Instalar dependencias backend
cd backend
npm install

# Instalar dependencias frontend
cd ../frontend
npm install
```

## Convenciones de Commits

Este proyecto usa [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nueva funcionalidad
- `fix:` Corrección de bugs
- `docs:` Cambios en documentación
- `style:` Formato, punto y coma faltantes, etc
- `refactor:` Refactorización de código
- `test:` Añadir tests
- `chore:` Actualizar tareas de build, configuraciones, etc

