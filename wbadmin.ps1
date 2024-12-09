<#
Usage:
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force
Install-WindowsFeature Windows-Server-Backup
Set-Location \\PARAMED-DC02.paramedinc.com\D$
.\wbadmin.ps1
#>

$logo = @"
              ■■■■■■■■■■■■■■■■■■■■■■
            ■■■■■■■■■■■■■■■■■■■■■■■■■■
           ■■■■■■■■■■■■■■■■■■■■■■■■■■■■
          ■■■■■■          ■■■■■■■■■■■■■■
         ■■■■   ■   ■■■        ■■■■■■■ ■■
          ■  ■                  ■■■■■
           ■■      ■■■■■■■■■■   ■■■■
                ■■  ■■■■■■■■■■■■■■
              ■■   ■ ■■■■■■■■■■■
                  ■  ■■■■■■■■
                  ■   ■ ■■■
                       ■■   ■■■
                         ■■■■

■■   ■■ ■■   ■■■■   ■ ■■■■■■■ ■■■■■   ■■■■  ■   ■■
■■   ■■ ■■  ■■      ■    ■■   ■■     ■■     ■  ■■
 ■■  ■  ■■  ■       ■    ■■   ■■■■■ ■■      ■■■■
 ■■ ■■  ■■  ■   ■■  ■    ■■   ■■     ■      ■  ■■
  ■■■   ■■  ■■■■■■  ■    ■■   ■■■■■  ■■■■■  ■   ■■
"@

[string] $username = "backup@paramedinc.com"
[string] $password = ""
[hashtable[]] $computers = @(
    @{ "computerName" = "PARAMED-DC01.paramedinc.com"; "include" = "C:" },
    @{ "computerName" = "SQL01.paramedinc.com"; "include" = "C:,E:" }
)
[string] $path = "\\PARAMED-DC02\D$"
[string] $backupPattern = "BACKUP_"
[string] $backupTarget = "$path\$backupPattern$(Get-Date -Format 'yyyy-MM-dd')"
[int] $backupCount = 2

function Main() {
    Clear-Host
    Write-Host $logo -ForegroundColor Cyan
    $backups = Get-ChildItem -Path $path -Directory -Filter "$backupPattern*"
    $latest_backups = $backups | Sort-Object Name -Descending | Select-Object -First $backupCount
    $expired_backups = $backups | Where-Object { $_ -notin $latest_backups }
    
    $expired_backups | ForEach-Object {
        Write-Host "Deleting $($_.FullName)..."
        Remove-Item -Path $_.FullName -Recurse -Force
    }

	$securePassword = ConvertTo-SecureString $password -AsPlainText -Force
	$credential = New-Object System.Management.Automation.PSCredential ($username, $securePassword)
	
	if (-Not (Test-Path -Path $backupTarget)) {
		Write-Host "Creating the backup target directory $backupTarget..." -ForegroundColor Yellow
		New-Item -Path $backupTarget -ItemType Directory | Out-Null
	}
	
    foreach ($computer in $computers) {
		Write-Host "Running the Backup command-line tool on $($computer["computerName"]), on drive(s) $($computer["include"])..." -ForegroundColor Yellow
		[string] $include = $computer["include"]
		
        Invoke-Command -ComputerName $computer["computerName"] -ScriptBlock {
            param (
                [string] $backupTarget,
                [string] $include
            )
			
            wbadmin start backup -backupTarget:$backupTarget -include:$include -allCritical -quiet
        } -ArgumentList $backupTarget, $include -Credential $credential
    }
	
	Write-Host "** DONE **" -ForegroundColor Green
}

Main
