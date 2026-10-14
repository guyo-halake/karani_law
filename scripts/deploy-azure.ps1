# =============================================================================
# Automated Azure Deployment Script -- Nyagah B. Fee Notes / Kithinji & Co.
# =============================================================================

param (
    [string]$ResourceGroup = "rg-nyagahfee",
    [string]$Location = "eastus",
    [string]$RegistryName = "acrnyagahfee",
    [string]$AppPlanName = "plan-nyagahfee",
    [string]$AppName = "nyagahkithinji-advocates"
)

$ErrorActionPreference = "Stop"
$AZ = "C:\Users\guyoh\AppData\Local\AzureCLI\Microsoft SDKs\Azure\CLI2\wbin\az.cmd"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " ??  Nyagah B. Fee Notes -- Microsoft Azure Deployment"    -ForegroundColor Cyan
Write-Host " Nyagah B. Kithinji & Co. Advocates"                      -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Check Azure CLI
Write-Host "`n[1/7] Checking Azure CLI..." -ForegroundColor Yellow
if (-not (Test-Path $AZ)) {
    Write-Error "Azure CLI not found at $AZ"
    exit 1
}
Write-Host "? Azure CLI found." -ForegroundColor Green

# 2. Verify / Login
$account = & $AZ account show 2>$null
if (-not $account) {
    Write-Host "Please authenticate in the Azure login window..." -ForegroundColor Cyan
    & $AZ login | Out-Null
}
$subName = (& $AZ account show --query name -o tsv)
Write-Host "? Connected to Azure Subscription: $subName" -ForegroundColor Green

# 3. Create Resource Group
Write-Host "`n[2/7] Creating Resource Group: $ResourceGroup in $Location..." -ForegroundColor Yellow
& $AZ group create --name $ResourceGroup --location $Location | Out-Null
Write-Host "? Resource Group ready." -ForegroundColor Green

# 4. Create Azure Container Registry
Write-Host "`n[3/7] Creating Azure Container Registry: $RegistryName..." -ForegroundColor Yellow
& $AZ acr create --resource-group $ResourceGroup --name $RegistryName --sku Basic --admin-enabled true | Out-Null
$acrLoginServer = "$RegistryName.azurecr.io"
$acrPassword = (& $AZ acr credential show --name $RegistryName --query "passwords[0].value" -o tsv)
Write-Host "? Container Registry ready: $acrLoginServer" -ForegroundColor Green

# 5. Build & Push Images via ACR Cloud Build (no local Docker needed)
Write-Host "`n[4/7] Building Backend Docker Image in Azure Cloud..." -ForegroundColor Yellow
& $AZ acr build --registry $RegistryName --image "karani-backend:latest" ./backend

Write-Host "`nBuilding Frontend Docker Image in Azure Cloud..." -ForegroundColor Yellow
& $AZ acr build --registry $RegistryName --image "karani-frontend:latest" .
Write-Host "? Both images built and pushed to ACR." -ForegroundColor Green

# 6. Create Linux App Service Plan
Write-Host "`n[5/7] Provisioning Linux App Service Plan: $AppPlanName..." -ForegroundColor Yellow
& $AZ appservice plan create --name $AppPlanName --resource-group $ResourceGroup --sku B1 --is-linux | Out-Null
Write-Host "? App Service Plan ready (B1 Linux)." -ForegroundColor Green

# 7. Deploy Multi-Container Web App
Write-Host "`n[6/7] Deploying Multi-Container Web App: $AppName..." -ForegroundColor Yellow
$composeContent = "version: '3.8'`nservices:`n  frontend:`n    image: $acrLoginServer/karani-frontend:latest`n    ports:`n      - '80:80'`n    restart: always`n    depends_on:`n      - backend`n  backend:`n    image: $acrLoginServer/karani-backend:latest`n    ports:`n      - '8000:8000'`n    restart: always"
$tempComposePath = "$env:TEMP\nyagahfee-compose.yml"
Set-Content -Path $tempComposePath -Value $composeContent

& $AZ webapp create `
    --resource-group $ResourceGroup `
    --plan $AppPlanName `
    --name $AppName `
    --multicontainer-config-type COMPOSE `
    --multicontainer-config-file $tempComposePath | Out-Null
Remove-Item -Path $tempComposePath -Force
Write-Host "? Multi-Container Web App deployed." -ForegroundColor Green

# 8. Configure App Settings
Write-Host "`n[7/7] Configuring Application Settings & Secrets..." -ForegroundColor Yellow
& $AZ webapp config appsettings set `
    --resource-group $ResourceGroup `
    --name $AppName `
    --settings `
        DOCKER_REGISTRY_SERVER_URL="https://$acrLoginServer" `
        DOCKER_REGISTRY_SERVER_USERNAME="$RegistryName" `
        DOCKER_REGISTRY_SERVER_PASSWORD="$acrPassword" `
        PORT="8000" `
        APP_ENV="production" `
        CORS_ORIGINS="https://$AppName.azurewebsites.net,http://localhost:3000" `
        JWT_SECRET_KEY="karani-law-advocates-production-jwt-security-key-2026-auth-token-secret-string-9920" `
        SUPABASE_URL="https://hhkbypvdwikxdlwivmrn.supabase.co" `
        SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhoa2J5cHZkd2lreGRsd2l2bXJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0NTg2NTUsImV4cCI6MjEwNTAzNDY1NX0.WBtSdlFX-DFG_Rfaf_19GU7meTBSvDUTzkosft-hjlc" `
        SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhoa2J5cHZkd2lreGRsd2l2bXJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0NTg2NTUsImV4cCI6MjEwNTAzNDY1NX0.QRBNLCZoeG-aR32cl-wzsjp7xES2ttCc7oUAdsnnmhU" `
        SMTP_HOST="smtp.gmail.com" `
        SMTP_PORT="587" `
        SMTP_USERNAME="p3lcodes@gmail.com" `
        SMTP_PASSWORD="qubl ppmq mhmb qaqx" `
        SMTP_FROM="p3lcodes@gmail.com" `
        SMTP_USE_TLS="true" `
        WEBSITES_ENABLE_APP_SERVICE_STORAGE="false" | Out-Null

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host " Deployment SUCCESSFUL!" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "Live App URL: https://$AppName.azurewebsites.net" -ForegroundColor Cyan
Write-Host "ACR:         $acrLoginServer" -ForegroundColor Cyan
Write-Host "Group:       $ResourceGroup" -ForegroundColor Cyan
Write-Host "`nStream live logs:" -ForegroundColor Yellow
Write-Host "& '$AZ' webapp log tail --name $AppName --resource-group $ResourceGroup" -ForegroundColor White
