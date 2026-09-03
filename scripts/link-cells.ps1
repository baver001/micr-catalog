# Flat public URLs -> cells/* (same mapping as infra/deploy.sh)
$ErrorActionPreference = "Stop"
$root = Resolve-Path (Join-Path $PSScriptRoot "..")

$categoryBySlug = [ordered]@{
  breathing = "tools"
  focus     = "tools"
  palette   = "tools"
  dice      = "games"
  reaction  = "games"
  elon      = "knowledge"
  habits    = "knowledge"
  laziness  = "knowledge"
}

foreach ($entry in $categoryBySlug.GetEnumerator()) {
  $slug = $entry.Key
  $category = $entry.Value
  $relativeTarget = "cells/$category/$slug"
  $target = Join-Path $root $relativeTarget
  $link = Join-Path $root $slug

  if (-not (Test-Path $target)) {
    Write-Warning "Skip ${slug}: target missing at $relativeTarget"
    continue
  }

  if (Test-Path $link) {
    Remove-Item -LiteralPath $link -Force -Recurse
  }

  New-Item -ItemType Junction -Path $link -Target $target | Out-Null
  Write-Host ('Linked /{0}/ -> {1}' -f $slug, $relativeTarget)
}
