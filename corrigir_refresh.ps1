# corrigir_refresh.ps1 - Atualiza DashboardContext e UploadPlanilha com refresh global

$contextFile = "app\dashboard\DashboardContext.tsx"
$uploadFile = "app\dashboard\components\UploadPlanilha.tsx"

# 1. Corrigir DashboardContext.tsx
if (Test-Path $contextFile) {
    # Backup
    Copy-Item $contextFile "$contextFile.bak_refresh"

    $contextContent = Get-Content $contextFile -Raw

    # Verifica se já tem dashboardRefreshKey
    if ($contextContent -match "dashboardRefreshKey") {
        Write-Host "dashboardRefreshKey já existe no contexto."
    } else {
        # Adiciona o estado e função antes do return do Provider
        $newState = "`n`n  const [dashboardRefreshKey, setDashboardRefreshKey] = useState(0);`n  const triggerDashboardRefresh = () => setDashboardRefreshKey(prev => prev + 1);`n"
        
        # Insere após a última declaração de useState (antes do value=)
        $contextContent = $contextContent -replace "(const \[.*\] = useState.*\n)(\s*value=)", "`$1$newState`$2"
        
        # Adiciona as props no value
        $contextContent = $contextContent -replace "(value=\{\{)", "`$1`n        dashboardRefreshKey,`n        triggerDashboardRefresh,"
        
        Set-Content $contextFile $contextContent
        Write-Host "✅ dashboardRefreshKey e triggerDashboardRefresh adicionados ao contexto."
    }
} else {
    Write-Host "❌ Arquivo DashboardContext.tsx não encontrado."
}

# 2. Corrigir UploadPlanilha.tsx
if (Test-Path $uploadFile) {
    # Backup
    Copy-Item $uploadFile "$uploadFile.bak_refresh"

    $uploadContent = Get-Content $uploadFile -Raw

    # Troca refreshPastagens por triggerDashboardRefresh
    $uploadContent = $uploadContent -replace "refreshPastagens", "triggerDashboardRefresh"

    Set-Content $uploadFile $uploadContent
    Write-Host "✅ UploadPlanilha.tsx atualizado para triggerDashboardRefresh."
} else {
    Write-Host "❌ Arquivo UploadPlanilha.tsx não encontrado."
}

Write-Host "`nCorreções aplicadas. Faça commit e push."