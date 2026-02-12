<#
.SYNOPSIS
    package-urls.txt に記載された npm パッケージを一括ダウンロードするスクリプト。

.DESCRIPTION
    インターネット接続可能なPCで実行し、npm-packages/ フォルダに
    .tgz ファイルをダウンロードする。
    既にダウンロード済みのファイルはスキップされる（差分ダウンロード対応）。

.PARAMETER urlsFile
    ダウンロードURL一覧ファイルのパス（デフォルト: package-urls.txt）

.PARAMETER downloadDir
    ダウンロード先ディレクトリ（デフォルト: npm-packages）

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File download-packages.ps1
    powershell -ExecutionPolicy Bypass -File download-packages.ps1 -urlsFile "package-urls.txt" -downloadDir "npm-packages"
#>

param(
    [string]$urlsFile = "package-urls.txt",
    [string]$downloadDir = "npm-packages"
)

# -------------------------------------------------------
# 1. 入力ファイルの存在確認
# -------------------------------------------------------
if (-not (Test-Path $urlsFile)) {
    Write-Host "Error: $urlsFile が見つかりません。" -ForegroundColor Red
    Write-Host "先に 'node generate-package-urls.js' を実行してください。" -ForegroundColor Red
    exit 1
}

# -------------------------------------------------------
# 2. ダウンロードディレクトリの作成
# -------------------------------------------------------
if (-not (Test-Path $downloadDir)) {
    New-Item -ItemType Directory -Path $downloadDir | Out-Null
    Write-Host "ディレクトリを作成しました: $downloadDir" -ForegroundColor Green
}

# -------------------------------------------------------
# 3. URL一覧の読み込み
# -------------------------------------------------------
$urls = Get-Content $urlsFile | Where-Object { $_.Trim() -ne "" }
$totalCount = $urls.Count
$downloadedCount = 0
$skippedCount = 0
$failedCount = 0
$failedUrls = @()

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  npm パッケージ ダウンロード開始" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  対象パッケージ数: $totalCount"
Write-Host "  保存先: $downloadDir"
Write-Host ""

# -------------------------------------------------------
# 4. ダウンロード実行
# -------------------------------------------------------
$counter = 0
foreach ($url in $urls) {
    $counter++
    $fileName = [System.IO.Path]::GetFileName($url)

    # URLパラメータが付いている場合はファイル名から除去
    if ($fileName -match "\?") {
        $fileName = $fileName.Split("?")[0]
    }

    $filePath = Join-Path $downloadDir $fileName
    $progress = [math]::Round(($counter / $totalCount) * 100, 1)

    # 既存ファイルのスキップ
    if (Test-Path $filePath) {
        $skippedCount++
        Write-Host "  [$counter/$totalCount] ($progress%) スキップ: $fileName" -ForegroundColor DarkGray
        continue
    }

    # ダウンロード
    try {
        Write-Host "  [$counter/$totalCount] ($progress%) ダウンロード: $fileName" -ForegroundColor White
        Invoke-WebRequest -Uri $url -OutFile $filePath -UseBasicParsing -ErrorAction Stop
        $downloadedCount++

        # レート制限対策のウェイト (100ms)
        Start-Sleep -Milliseconds 100
    }
    catch {
        $failedCount++
        $failedUrls += $url
        Write-Host "    -> 失敗: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# -------------------------------------------------------
# 5. 失敗ログの出力
# -------------------------------------------------------
if ($failedUrls.Count -gt 0) {
    $failedLogPath = "failed-downloads.log"
    $failedUrls | Out-File -FilePath $failedLogPath -Encoding utf8
    Write-Host ""
    Write-Host "失敗したURLを $failedLogPath に記録しました。" -ForegroundColor Yellow
}

# -------------------------------------------------------
# 6. サマリー表示
# -------------------------------------------------------
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ダウンロード完了" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  新規ダウンロード: $downloadedCount" -ForegroundColor Green
Write-Host "  スキップ (既存):  $skippedCount" -ForegroundColor DarkGray
Write-Host "  失敗:             $failedCount" -ForegroundColor $(if ($failedCount -gt 0) { "Red" } else { "Green" })
Write-Host "  合計:             $totalCount"
Write-Host ""

if ($failedCount -eq 0) {
    Write-Host "次のステップ:" -ForegroundColor Green
    Write-Host "  1. 以下のファイルを開発環境PCにコピー:"
    Write-Host "     - package.json"
    Write-Host "     - package-lock.json"
    Write-Host "     - $downloadDir/ フォルダ"
    Write-Host "     - install-offline.ps1"
    Write-Host "  2. 開発環境PCで install-offline.ps1 を実行"
    Write-Host ""
}
else {
    Write-Host "一部のダウンロードに失敗しました。" -ForegroundColor Yellow
    Write-Host "再度このスクリプトを実行してください（成功済みファイルはスキップされます）。" -ForegroundColor Yellow
    Write-Host ""
}
