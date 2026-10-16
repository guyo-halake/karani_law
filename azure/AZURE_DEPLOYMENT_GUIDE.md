# ?? Microsoft Azure Deployment Guide — Nyagah B. Fee Notes

This guide outlines how to deploy the **Nyagah B. Fee Notes / Nyagah B. Kithinji & Co. Advocates** platform to Microsoft Azure.

---

## ??? Architecture on Microsoft Azure

```
                +-------------------------------------------------+
                |                  Microsoft Azure                 |
                |                                                 |
                |   +-----------------------------------------+   |
HTTPS (Port 443)|   |       Azure Web App for Containers      |   |
  ------------->|   |     (nyagahkithinji-advocates.azurewebsites.net) |
                |   |                                         |   |
                |   |   +----------------+  Reverse Proxy     |   |
                |   |   | Frontend Nginx | --------------+    |   |
                |   |   | (React SPA)    |               |    |   |
                |   |   +----------------+               v    |   |
                |   |                        +-------------+  |   |
                |   |                        | FastAPI     |  |   |
                |   |                        | Engine      |  |   |
                |   |                        +-------------+  |   |
                |   +-----------------------------------------+   |
                |                        |                        |
                +------------------------|------------------------+
                                         v
                         +------------------------------+
                         |     Supabase PostgreSQL       |
                         |  (Realtime + RLS + S3 Vault) |
                         +------------------------------+
```

---

## ?? One-Click PowerShell Deployment

Run the automated script in PowerShell:

```powershell
.\scripts\deploy-azure.ps1
```

---

## ??? Step-by-Step Azure CLI Deployment

### Step 1: Login to Azure
```bash
az login --use-device-code
```

### Step 2: Create Resource Group
```bash
az group create --name rg-nyagahfee --location eastus
```

### Step 3: Create Azure Container Registry (ACR)
```bash
az acr create --resource-group rg-nyagahfee --name acrnyagahfee --sku Basic --admin-enabled true
```

### Step 4: Build & Push Images via ACR Cloud Build (No local Docker needed)
```bash
# Backend image
az acr build --registry acrnyagahfee --image "karani-backend:latest" ./backend

# Frontend image
az acr build --registry acrnyagahfee --image "karani-frontend:latest" .
```

### Step 5: Provision Linux App Service Plan & Deploy Web App
```bash
az appservice plan create --name plan-nyagahfee --resource-group rg-nyagahfee --sku B1 --is-linux

az webapp create \
  --resource-group rg-nyagahfee \
  --plan plan-nyagahfee \
  --name nyagahkithinji-advocates \
  --multicontainer-config-type COMPOSE \
  --multicontainer-config-file azure/docker-compose.azure.yml
```

### Step 6: Configure Environment Secrets
Configure App Service application settings for Supabase, JWT secret, and SMTP gateway.
