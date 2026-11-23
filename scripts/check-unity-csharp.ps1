param([string]$EditorPath='C:/Program Files/Unity/Hub/Editor/6000.6.10f1/Editor')
$ErrorActionPreference='Stop'
$repoRoot=Split-Path $PSScriptRoot -Parent
$checkDir=Join-Path ([IO.Path]::GetTempPath()) 'shieldquest-unity-check'
New-Item -ItemType Directory -Force $checkDir | Out-Null
$managed=Join-Path $EditorPath 'Data/Managed'
if(!(Test-Path -LiteralPath $managed)){throw "Unity editor assemblies missing: $managed"}
$references=Get-ChildItem (Join-Path $managed 'UnityEngine') -Filter '*.dll' | ForEach-Object {
    '<Reference Include="'+$_.BaseName+'"><HintPath>'+[Security.SecurityElement]::Escape($_.FullName)+'</HintPath></Reference>'
}
$project='<Project Sdk="Microsoft.NET.Sdk"><PropertyGroup><OutputType>Exe</OutputType><TargetFramework>net10.0</TargetFramework><LangVersion>9.0</LangVersion><EnableDefaultCompileItems>false</EnableDefaultCompileItems><Nullable>disable</Nullable><GenerateAssemblyInfo>false</GenerateAssemblyInfo></PropertyGroup><ItemGroup>'
foreach($glob in @('games/unity/ShieldQuest/Assets/Scripts/*.cs','games/unity/ShieldQuest/Assets/Scripts/Editor/*.cs','scripts/unity-check/Program.cs')){
    $project+='<Compile Include="'+[Security.SecurityElement]::Escape((Join-Path $repoRoot $glob))+'" />'
}
$project+=($references -join '')+'</ItemGroup></Project>'
$projectFile=Join-Path $checkDir 'Check.csproj'
Set-Content -LiteralPath $projectFile -Value $project
dotnet build $projectFile --nologo
if($LASTEXITCODE -ne 0){throw 'Native C# compile failed'}
$resultPath=Join-Path $checkDir 'results.json'
dotnet (Join-Path $checkDir 'bin/Debug/net10.0/Check.dll') $repoRoot $resultPath
if($LASTEXITCODE -ne 0){throw 'Native C# checks failed'}
Push-Location $repoRoot
try { node scripts/check-unity-results.cjs $resultPath; if($LASTEXITCODE -ne 0){throw 'Phaser compatibility failed'} } finally { Pop-Location }
