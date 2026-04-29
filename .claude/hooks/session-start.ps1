$ErrorActionPreference = 'SilentlyContinue'

$branch = (git rev-parse --abbrev-ref HEAD 2>$null)
if (-not $branch) { $branch = 'no-git' }

$commit = (git log -1 --pretty=format:'%h %s' 2>$null)
if (-not $commit) { $commit = 'no-commits' }

$status = (git status --porcelain 2>$null | Measure-Object -Line).Lines

Write-Output "Branch: $branch"
Write-Output "Last commit: $commit"
Write-Output "Uncommitted files: $status"
Write-Output "Reminder: follow the rules in .claude/rules/ and the conventions in CLAUDE.md."
