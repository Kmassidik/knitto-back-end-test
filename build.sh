#!/bin/bash

# Create project root
mkdir -p knitto-backend-test
cd knitto-backend-test

# Create src folders
mkdir -p src/config
mkdir -p src/controllers
mkdir -p src/middlewares
mkdir -p src/routes
mkdir -p src/services

# Create files structure
touch src/index.ts
touch src/config/database.ts
touch src/controllers/authController.ts
touch src/controllers/transactionController.ts
touch src/controllers/apiIntegrationController.ts
touch src/controllers/reportController.ts
touch src/middlewares/errorHandler.ts
touch src/middlewares/authMiddleware.ts
touch src/middlewares/requestLogger.ts
touch src/routes/authRoutes.ts
touch src/routes/transactionRoutes.ts
touch src/routes/apiIntegrationRoutes.ts
touch src/routes/reportRoutes.ts
touch src/services/schedulerService.ts

# Create root files
touch docker-compose.yml
touch Dockerfile
touch init.sql
touch package.json
touch tsconfig.json
touch .env.example
touch .gitignore
touch .dockerignore
touch README.md
touch SYSTEM_DESIGN.md
touch API_TEST_COLLECTION.md

echo "Folder structure created!"
echo ""
echo "Project structure:"
tree -L 3 -I 'node_modules'