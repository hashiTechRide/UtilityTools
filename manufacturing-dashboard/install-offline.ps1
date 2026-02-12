<#
.SYNOPSIS
    オフライン環境で npm パッケージをインストールするスクリプト。

.DESCRIPTION
    download-packages.ps1 でダウンロードした .tgz ファイルを使用して、
    インターネット接続なしで node_modules/ を構築する。

.PARAMETER packagesDir
    .tgz ファイルが格納されたディレクトリ（デフォルト: npm-packages）

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File install-offline.ps1
    powershell -ExecutionPolicy Bypass -File install-offline.ps1 -packagesDir "npm-packages"
#>

param(
    [string]$packagesDir = "npm-packages"
)

# -------------------------------------------------------
# 1. 前提条件の確認
# -------------------------------------------------------
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  オフライン npm インストール" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# package.json の存在確認
if (-not (Test-Path "package.json")) {
    Write-Host "Error: package.json が見つかりません。" -ForegroundColor Red
    Write-Host "プロジェクトのルートディレクトリで実行してください。" -ForegroundColor Red
    exit 1
}

# package-lock.json の存在確認
if (-not (Test-Path "package-lock.json")) {
    Write-Host "Error: package-lock.json が見つかりません。" -ForegroundColor Red
    Write-Host "インターネット接続可能な環境で npm install を実行し、" -ForegroundColor Red
    Write-Host "package-lock.json をこのディレクトリにコピーしてください。" -ForegroundColor Red
    exit 1
}

# パッケージディレクトリの存在確認
if (-not (Test-Path $packagesDir)) {
    Write-Host "Error: $packagesDir ディレクトリが見つかりません。" -ForegroundColor Red
    Write-Host "download-packages.ps1 でダウンロードしたフォルダをコピーしてください。" -ForegroundColor Red
    exit 1
}

# .tgz ファイルの確認
$tgzFiles = Get-ChildItem -Path $packagesDir -Filter "*.tgz"
if ($tgzFiles.Count -eq 0) {
    Write-Host "Error: $packagesDir に .tgz ファイルが見つかりません。" -ForegroundColor Red
    Write-Host "download-packages.ps1 を再実行してください。" -ForegroundColor Red
    exit 1
}

Write-Host "  パッケージディレクトリ: $packagesDir"
Write-Host "  .tgz ファイル数:       $($tgzFiles.Count)"
Write-Host ""

# -------------------------------------------------------
# 2. 既存の node_modules を削除
# -------------------------------------------------------
if (Test-Path "node_modules") {
    Write-Host "既存の node_modules/ を削除しています..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "node_modules"
    Write-Host "  -> 削除完了" -ForegroundColor Green
    Write-Host ""
}

# -------------------------------------------------------
# 3. npm キャッシュにパッケージを登録
# -------------------------------------------------------
Write-Host "npm キャッシュにパッケージを登録しています..." -ForegroundColor White

$cacheDir = Join-Path $env:TEMP "npm-offline-cache-$(Get-Date -Format 'yyyyMMddHHmmss')"
New-Item -ItemType Directory -Path $cacheDir -Force | Out-Null

$counter = 0
$totalFiles = $tgzFiles.Count
foreach ($tgz in $tgzFiles) {
    $counter++
    $progress = [math]::Round(($counter / $totalFiles) * 100, 1)
    Write-Host "  [$counter/$totalFiles] ($progress%) キャッシュ登録: $($tgz.Name)" -ForegroundColor DarkGray

    try {
        & npm cache add $tgz.FullName --cache $cacheDir 2>$null
    }
    catch {
        Write-Host "    -> 警告: キャッシュ登録に失敗: $($tgz.Name)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "キャッシュ登録が完了しました。" -ForegroundColor Green
Write-Host ""

# -------------------------------------------------------
# 4. オフラインインストール実行
# -------------------------------------------------------
Write-Host "npm install を実行しています (オフラインモード)..." -ForegroundColor White
Write-Host ""

try {
    & npm install --cache $cacheDir --prefer-offline --no-audit --no-fund 2>&1 | ForEach-Object {
        Write-Host "  $_"
    }
    $installExitCode = $LASTEXITCODE
}
catch {
    Write-Host "Error: npm install に失敗しました。" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

# -------------------------------------------------------
# 5. クリーンアップ
# -------------------------------------------------------
Write-Host ""
Write-Host "一時キャッシュを削除しています..." -ForegroundColor DarkGray
if (Test-Path $cacheDir) {
    Remove-Item -Recurse -Force $cacheDir -ErrorAction SilentlyContinue
}

# -------------------------------------------------------
# 6. 結果確認
# -------------------------------------------------------
Write-Host ""
if ((Test-Path "node_modules") -and $installExitCode -eq 0) {
    $nodeModulesSize = (Get-ChildItem -Recurse -Path "node_modules" | Measure-Object -Property Length -Sum).Sum
    $sizeInMB = [math]::Round($nodeModulesSize / 1MB, 1)

    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  インストール完了" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "  node_modules サイズ: ${sizeInMB} MB"
    Write-Host ""
    Write-Host "次のステップ:" -ForegroundColor Green
    Write-Host "  npm run dev    - 開発サーバーを起動"
    Write-Host "  npm run build  - プロダクションビルド"
    Write-Host ""
}
else {
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  インストールに問題が発生しました" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "対処方法:" -ForegroundColor Yellow
    Write-Host "  1. node_modules/ を削除してこのスクリプトを再実行"
    Write-Host "  2. package-urls.txt を再生成してパッケージを再ダウンロード"
    Write-Host "  3. package-lock.json が最新であることを確認"
    Write-Host ""
}
