param([string]$Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path)

Add-Type -AssemblyName System.Drawing
Remove-Item Alias:R -ErrorAction SilentlyContinue

function C([string]$Hex) { [System.Drawing.ColorTranslator]::FromHtml($Hex) }
function New-Canvas([int]$Width, [int]$Height, [string]$Background) {
  $bitmap = [System.Drawing.Bitmap]::new($Width, $Height)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
  $graphics.Clear((C $Background))
  @{ Bitmap = $bitmap; Graphics = $graphics }
}
function T($G, [string]$Text, [single]$X, [single]$Y, [single]$Size, [string]$Color, [string]$Family = 'Segoe UI', [string]$Style = 'Regular') {
  $font = [System.Drawing.Font]::new($Family, $Size, [System.Drawing.FontStyle]::$Style, [System.Drawing.GraphicsUnit]::Pixel)
  $brush = [System.Drawing.SolidBrush]::new((C $Color))
  $G.DrawString($Text, $font, $brush, $X, $Y)
  $brush.Dispose(); $font.Dispose()
}
function TR($G, [string]$Text, [single]$Right, [single]$Y, [single]$Size, [string]$Color, [string]$Family = 'Segoe UI', [string]$Style = 'Regular') {
  $font = [System.Drawing.Font]::new($Family, $Size, [System.Drawing.FontStyle]::$Style, [System.Drawing.GraphicsUnit]::Pixel)
  $brush = [System.Drawing.SolidBrush]::new((C $Color))
  $width = $G.MeasureString($Text, $font).Width
  $G.DrawString($Text, $font, $brush, $Right - $width, $Y)
  $brush.Dispose(); $font.Dispose()
}
function R($G, [single]$X, [single]$Y, [single]$W, [single]$H, [string]$Fill, [string]$Stroke = $null, [single]$StrokeWidth = 1) {
  if ($Fill) { $brush = [System.Drawing.SolidBrush]::new((C $Fill)); $G.FillRectangle($brush, $X, $Y, $W, $H); $brush.Dispose() }
  if ($Stroke) { $pen = [System.Drawing.Pen]::new((C $Stroke), $StrokeWidth); $G.DrawRectangle($pen, $X, $Y, $W, $H); $pen.Dispose() }
}
function L($G, [single]$X1, [single]$Y1, [single]$X2, [single]$Y2, [string]$Color, [single]$Width = 1) {
  $pen = [System.Drawing.Pen]::new((C $Color), $Width); $G.DrawLine($pen, $X1, $Y1, $X2, $Y2); $pen.Dispose()
}
function Palette([string]$Theme, [string]$Accent, [string]$LightAccent, [string]$Signal, [string]$LightSignal) {
  if ($Theme -eq 'dark') { return @{ Bg='#0b0d10'; Paper='#11151a'; Wash='#111722'; Ink='#f3f6fa'; Muted='#96a0ad'; Line='#29313b'; Strong='#3a4653'; Accent=$Accent; Signal=$Signal } }
  @{ Bg='#f3f1ec'; Paper='#ffffff'; Wash='#edf2f8'; Ink='#15191e'; Muted='#5b6672'; Line='#d7dce1'; Strong='#aeb7c1'; Accent=$LightAccent; Signal=$LightSignal }
}
function Save-Canvas($Canvas, [string]$Path) {
  [System.IO.Directory]::CreateDirectory([System.IO.Path]::GetDirectoryName($Path)) | Out-Null
  $Canvas.Bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
  $Canvas.Graphics.Dispose(); $Canvas.Bitmap.Dispose()
}

function Draw-SystemBrief([string]$Theme, [string]$Path, [switch]$Mobile) {
  $p = Palette $Theme '#8eb4ff' '#245fae' '#d7b85c' '#8a6411'
  if ($Mobile) {
    $c = New-Canvas 390 845 $p.Bg; $g=$c.Graphics
    T $g 'Hakan Duyar' 18 16 13 $p.Ink 'Segoe UI' 'Bold'; TR $g 'SYSTEM BRIEF / V5' 372 18 8 $p.Muted 'Consolas' 'Bold'; L $g 18 43 372 43 $p.Line
    T $g 'FRONT-END & SYSTEMS ENGINEERING' 18 65 8 $p.Accent 'Consolas' 'Bold'
    T $g 'Interfaces are' 18 92 35 $p.Ink 'Segoe UI' 'Bold'; T $g 'the surface.' 18 130 35 $p.Ink 'Segoe UI' 'Bold'; T $g 'Systems are the work.' 18 168 35 $p.Ink 'Segoe UI' 'Bold'
    T $g 'React + TypeScript products with clear boundaries' 18 214 10 $p.Muted; T $g 'from interface to evidence.' 18 230 10 $p.Muted
    R $g 18 260 354 90 $p.Paper $p.Strong; T $g 'PRIMARY' 32 276 8 $p.Accent 'Consolas' 'Bold'; T $g 'React · TypeScript · architecture' 112 276 9 $p.Muted
    T $g 'AI PRACTICE' 32 302 8 $p.Accent 'Consolas' 'Bold'; T $g 'plan · implement · verify · review' 112 302 9 $p.Muted
    T $g 'PRINCIPLE' 32 328 8 $p.Signal 'Consolas' 'Bold'; T $g 'evidence before confidence' 112 328 9 $p.Muted
    T $g '01 / ENGINEERING SYSTEM' 18 382 8 $p.Muted 'Consolas' 'Bold'; T $g 'Five responsibilities.' 18 405 23 $p.Ink 'Segoe UI' 'Bold'
    $layers=@(@('INTERFACE','React · TypeScript · Next.js','core product surface'),@('APPLICATION','State · Query · PWA / Dexie','state ownership'),@('SERVICES','Node · Express / Nest · REST','domain boundaries'),@('DATA','PostgreSQL · Prisma · Supabase','relational / local truth'),@('PLATFORM','Docker · CI · Nginx / Linux','Kubernetes remains expansion'))
    $y=444; foreach($row in $layers){ R $g 18 $y 354 58 $p.Paper $p.Line; T $g $row[0] 32 ($y+10) 8 $p.Accent 'Consolas' 'Bold'; T $g $row[1] 126 ($y+9) 10 $p.Ink; T $g $row[2] 126 ($y+30) 8 $p.Muted; $y+=64 }
    R $g 18 778 354 48 $p.Wash; R $g 18 778 3 48 $p.Signal; T $g 'SOFTWARE FACTORY' 30 787 8 $p.Signal 'Consolas' 'Bold'; T $g 'durable state · review · human release gate' 30 806 8 $p.Muted
    Save-Canvas $c $Path; return
  }
  $c=New-Canvas 1440 1000 $p.Bg; $g=$c.Graphics
  T $g 'Hakan Duyar' 100 34 16 $p.Ink 'Segoe UI' 'Bold'; TR $g 'ENGINEERING PROFILE / ARCHITECTURE BRIEF / V5' 1340 37 10 $p.Muted 'Consolas' 'Bold'; L $g 100 74 1340 74 $p.Strong 2
  T $g 'FRONT-END & SYSTEMS ENGINEERING' 100 104 10 $p.Accent 'Consolas' 'Bold'; T $g 'Interfaces are the surface.' 100 140 58 $p.Ink 'Segoe UI' 'Bold'; T $g 'Systems are the work.' 100 204 58 $p.Ink 'Segoe UI' 'Bold'
  T $g 'React and TypeScript products with clear state, service, data, delivery,' 100 284 14 $p.Muted; T $g 'and evidence boundaries.' 100 306 14 $p.Muted
  $brief=@(@('PRIMARY','React · TypeScript · application architecture'),@('EXTENDS TO','Node · APIs · relational / local data · delivery'),@('AI PRACTICE','plan · implement · verify · review · repair'),@('PRINCIPLE','Model confidence never substitutes for evidence.'))
  $y=128; foreach($row in $brief){ L $g 820 $y 1340 $y $p.Line; T $g $row[0] 820 ($y+13) 9 $(if($row[0]-eq'PRINCIPLE'){$p.Signal}else{$p.Accent}) 'Consolas' 'Bold'; T $g $row[1] 950 ($y+12) 12 $p.Muted; $y+=48 }
  L $g 100 370 1340 370 $p.Line; T $g '01 / ENGINEERING SYSTEM' 100 396 9 $p.Muted 'Consolas' 'Bold'; T $g 'One map. Five responsibilities. Two controls.' 100 428 32 $p.Ink 'Segoe UI' 'Bold'
  R $g 100 486 1240 338 $p.Paper $p.Strong; R $g 100 486 1240 48 $p.Wash; T $g 'CROSS-CUTTING' 120 502 9 $p.Signal 'Consolas' 'Bold'; $heads=@('AUTH / ACCESS','TYPE / CONTRACT','TEST / EVIDENCE','AI DELIVERY'); $x=400; foreach($h in $heads){T $g $h $x 502 9 $p.Ink 'Consolas' 'Bold';$x+=230}
  L $g 280 534 280 824 $p.Strong; $rowY=@(534,592,650,708,766,824); foreach($ry in $rowY){L $g 100 $ry 1340 $ry $p.Line}; $colX=@(540,800,1060); foreach($cx in $colX){L $g $cx 534 $cx 824 $p.Line}
  $rows=@(@('INTERFACE','React / TypeScript','Next.js boundary','Accessible UI','Forms / motion'),@('APPLICATION','State ownership','TanStack Query','PWA / Dexie','Routing / forms'),@('SERVICES','Node.js','Express / Nest','REST contracts','JWT / RBAC'),@('DATA','PostgreSQL','Prisma','Supabase','Redis / search'),@('PLATFORM','Docker','CI / CD','Nginx / Linux','Kubernetes · expansion'))
  $y=552; foreach($row in $rows){T $g $row[0] 120 $y 9 $p.Ink 'Consolas' 'Bold';T $g $row[1] 305 $y 12 $p.Accent 'Segoe UI' 'Bold';T $g $row[2] 565 $y 12 $p.Ink;T $g $row[3] 825 $y 12 $p.Ink;T $g $row[4] 1085 $y 12 $p.Muted;$y+=58}
  R $g 100 846 1240 54 $p.Wash; R $g 100 846 4 54 $p.Signal; T $g 'Architecture decides where responsibility lives and how evidence travels.' 120 865 12 $p.Ink; TR $g 'REQUEST > STATE > RULE > PERSIST > DELIVER' 1320 866 9 $p.Signal 'Consolas' 'Bold'
  T $g 'SOFTWARE FACTORY / DURABLE STATE · INDEPENDENT REVIEW · HUMAN RELEASE GATE' 100 938 9 $p.Muted 'Consolas' 'Bold'; TR $g 'RECOMMENDED DIRECTION' 1340 938 9 $p.Accent 'Consolas' 'Bold'; Save-Canvas $c $Path
}

function Draw-Dossiers([string]$Theme,[string]$Path,[switch]$Mobile){$p=Palette $Theme '#db8b66' '#a84c2b' '#db8b66' '#a84c2b';$p.Wash=$(if($Theme-eq'dark'){'#171311'}else{'#f7efe9'});if($Mobile){$c=New-Canvas 390 845 $p.Bg;$g=$c.Graphics;T $g 'Hakan Duyar' 18 18 31 $p.Ink 'Georgia';T $g 'ARCHITECTURE CASEBOOK / 2026' 18 55 7 $p.Muted 'Consolas' 'Bold';L $g 18 76 372 76 $p.Strong 3;T $g 'ENGINEERING IDENTITY' 18 98 7 $p.Accent 'Consolas' 'Bold';T $g 'Architecture makes' 18 126 31 $p.Ink 'Georgia';T $g 'intent accountable.' 18 160 31 $p.Ink 'Georgia';T $g 'React + TypeScript at the core; projects prove decisions.' 18 204 9 $p.Muted;T $g 'Three systems. Three failure models.' 18 246 23 $p.Ink 'Georgia';$cases=@(@('01 / CONSISTENCY','DropSpot','Duplicate request ≠ duplicate allocation.','REACT','EXPRESS','POSTGRES'),@('02 / LOCAL FIRST','spark','Useful without account, server, or network.','REACT','DEXIE','INDEXEDDB'),@('03 / CONTROL','Software Factory','Disposable workers, durable workflow truth.','PLAN','VERIFY','HUMAN GATE'));$y=286;foreach($row in $cases){R $g 18 $y 354 152 $p.Paper $p.Line;T $g $row[0] 34 ($y+16) 7 $p.Accent 'Consolas' 'Bold';T $g $row[1] 34 ($y+42) 22 $p.Ink 'Georgia';T $g $row[2] 34 ($y+72) 9 $p.Muted;$x=34;for($i=3;$i-lt6;$i++){R $g $x ($y+100) 100 30 $p.Wash $p.Line;T $g $row[$i] ($x+8) ($y+109) 7 $p.Ink 'Consolas' 'Bold';$x+=110};$y+=162};T $g 'PROJECTS PROVE DECISIONS · NOT BADGES' 18 806 7 $p.Accent 'Consolas' 'Bold';Save-Canvas $c $Path;return};$c=New-Canvas 1440 1000 $p.Bg;$g=$c.Graphics;T $g 'Hakan Duyar' 100 26 50 $p.Ink 'Georgia';TR $g 'FRONT-END & SYSTEMS ENGINEERING / ARCHITECTURE CASEBOOK' 1340 36 9 $p.Muted 'Consolas' 'Bold';L $g 100 88 1340 88 $p.Strong 3;T $g 'ENGINEERING IDENTITY' 100 118 9 $p.Accent 'Consolas' 'Bold';T $g 'Architecture makes product intent' 100 156 53 $p.Ink 'Georgia';T $g 'accountable behavior.' 100 213 53 $p.Ink 'Georgia';T $g 'React and TypeScript at the core. Services, data, delivery, and AI workflows' 100 286 14 $p.Muted;T $g 'evaluated through boundaries, invariants, and evidence.' 100 308 14 $p.Muted;L $g 100 366 1340 366 $p.Line;T $g 'SELECTED ARCHITECTURE DOSSIERS' 100 393 9 $p.Muted 'Consolas' 'Bold';T $g 'Three systems. Three failure models.' 100 426 36 $p.Ink 'Georgia';$cases=@(@('01 / CONSISTENCY','DropSpot','Duplicate requests cannot become duplicate allocation.','REACT','EXPRESS','POSTGRES','ROW LOCKS + IDEMPOTENT TRANSACTION'),@('02 / LOCAL FIRST','spark','The product remains useful without account, server, or network.','REACT','DEXIE','INDEXEDDB','VERSIONED LOCAL PRODUCT STATE'),@('03 / CONTROL','Software Factory','Disposable workers operate inside durable workflow truth.','PLAN','VERIFY','REVIEW','EVIDENCE + HUMAN RELEASE GATE'));$x=100;foreach($row in $cases){R $g $x 488 390 364 $p.Paper $p.Line;T $g $row[0] ($x+24) 510 9 $p.Accent 'Consolas' 'Bold';T $g $row[1] ($x+24) 550 31 $p.Ink 'Georgia';T $g $row[2] ($x+24) 606 11 $p.Muted;$bx=$x+24;for($i=3;$i-lt6;$i++){R $g $bx 672 100 46 $p.Wash $p.Line;T $g $row[$i] ($bx+10) 687 8 $p.Ink 'Consolas' 'Bold';$bx+=110};L $g ($x+24) 760 ($x+366) 760 $p.Strong;T $g $row[6] ($x+24) 780 9 $p.Accent 'Consolas' 'Bold';$x+=425};T $g 'Depth is editorially dominant; breadth appears as supporting evidence.' 100 918 28 $p.Ink 'Georgia';TR $g 'CASE-STUDY LED' 1340 930 9 $p.Accent 'Consolas' 'Bold';Save-Canvas $c $Path}

function Draw-Assurance([string]$Theme,[string]$Path,[switch]$Mobile){$p=Palette $Theme '#72b7a4' '#1f7863' '#e0b66f' '#96631f';$blue=$(if($Theme-eq'dark'){'#75a6df'}else{'#2c659f'});$p.Wash=$(if($Theme-eq'dark'){'#121a1a'}else{'#edf5f2'});if($Mobile){$c=New-Canvas 390 845 $p.Bg;$g=$c.Graphics;T $g 'HAKAN DUYAR / FRONT-END & SYSTEMS ENGINEERING' 18 18 6 $p.Muted 'Consolas' 'Bold';L $g 18 43 372 43 $p.Line;T $g 'Engineering with AI.' 18 70 33 $p.Ink 'Segoe UI' 'Bold';T $g 'Under control.' 18 108 33 $p.Ink 'Segoe UI' 'Bold';T $g 'Inspectable · verifiable · human-governed.' 18 151 9 $p.Muted;R $g 18 180 354 105 $p.Paper $p.Line;T $g 'SOFTWARE FACTORY / PUBLIC PROOF' 32 196 7 $p.Accent 'Consolas' 'Bold';T $g 'DURABLE' 32 226 7 $p.Ink 'Consolas' 'Bold';T $g 'INDEPENDENT' 133 226 7 $p.Ink 'Consolas' 'Bold';T $g 'FAIL CLOSED' 255 226 7 $p.Ink 'Consolas' 'Bold';R $g 32 258 326 16 $p.Wash;TR $g 'HUMAN DECISION' 352 261 6 $p.Signal 'Consolas' 'Bold';T $g '01 / SYSTEM MODEL' 18 320 7 $p.Muted 'Consolas' 'Bold';T $g 'Three accountable planes.' 18 346 22 $p.Ink 'Segoe UI' 'Bold';$planes=@(@('DECISION',$p.Signal,@('OBJECTIVE','APPROVAL','RELEASE')),@('EXECUTION',$blue,@('PLAN','IMPLEMENT','REVIEW')),@('EVIDENCE',$p.Accent,@('SQLITE','TESTS','SNAPSHOT')));$y=384;foreach($pl in $planes){R $g 18 $y 354 116 $p.Paper $p.Line;T $g $pl[0] 34 ($y+15) 7 $pl[1] 'Consolas' 'Bold';$x=34;foreach($cell in $pl[2]){T $g $cell $x ($y+48) 7 $p.Ink 'Consolas' 'Bold';$x+=105};$y+=126};R $g 18 772 354 53 $p.Wash;R $g 18 772 3 53 $p.Signal;T $g 'The model participates; it is never' 32 784 8 $p.Muted;T $g 'the system of record.' 32 800 8 $p.Muted;TR $g 'NO SELF-APPROVAL' 356 792 6 $p.Signal 'Consolas' 'Bold';Save-Canvas $c $Path;return};$c=New-Canvas 1440 1000 $p.Bg;$g=$c.Graphics;T $g 'HAKAN DUYAR / FRONT-END & SYSTEMS ENGINEERING' 100 35 9 $p.Muted 'Consolas' 'Bold';L $g 100 76 1340 76 $p.Line;T $g 'Engineering with AI.' 100 116 56 $p.Ink 'Segoe UI' 'Bold';T $g 'Under control.' 100 178 56 $p.Ink 'Segoe UI' 'Bold';T $g 'Product architecture extended by agentic workflows that remain' 100 254 14 $p.Muted;T $g 'inspectable, verifiable, and human-governed.' 100 276 14 $p.Muted;R $g 780 118 560 176 $p.Paper $p.Strong;T $g 'PUBLIC PROOF / SOFTWARE FACTORY' 806 135 8 $p.Muted 'Consolas' 'Bold';$labels=@('DURABLE','INDEPENDENT','FAIL CLOSED');$x=806;foreach($lab in $labels){R $g $x 164 158 76 $p.Paper $p.Line;T $g $lab ($x+14) 180 8 $p.Accent 'Consolas' 'Bold';$x+=170};R $g 806 252 510 28 $p.Wash;TR $g 'HUMAN DECISION' 1300 258 8 $p.Signal 'Consolas' 'Bold';L $g 100 340 1340 340 $p.Line;T $g '01 / SYSTEM MODEL' 100 368 9 $p.Muted 'Consolas' 'Bold';T $g 'Three planes keep autonomy accountable.' 100 402 31 $p.Ink 'Segoe UI' 'Bold';$planes=@(@('DECISION PLANE',$p.Signal,@('OBJECTIVE','PLAN APPROVAL','POLICY','RESOURCE','RELEASE GATE')),@('EXECUTION PLANE',$blue,@('PLANNER','IMPLEMENTER','VERIFIER','REVIEWER','REPAIR')),@('EVIDENCE PLANE',$p.Accent,@('SQLITE STATE','RUNS','TEST EVIDENCE','VERDICTS','SNAPSHOT')));$y=460;foreach($pl in $planes){R $g 100 $y 1240 102 $p.Paper $p.Strong;T $g $pl[0] 122 ($y+17) 9 $pl[1] 'Consolas' 'Bold';$x=315;foreach($cell in $pl[2]){T $g $cell $x ($y+30) 9 $p.Ink 'Consolas' 'Bold';$x+=202};$y+=112};R $g 100 812 1240 58 $p.Wash;T $g 'Any newer implementation invalidates prior verification, review, and approval.' 122 831 12 $p.Ink;TR $g 'NO SELF-APPROVAL' 1318 832 9 $p.Signal 'Consolas' 'Bold';T $g 'REACT / TYPESCRIPT CORE · AI CONTROL PLANE AS APPLIED SYSTEMS PROOF' 100 928 9 $p.Accent 'Consolas' 'Bold';TR $g 'AI MATURITY FIRST' 1340 928 9 $blue 'Consolas' 'Bold';Save-Canvas $c $Path}

function Draw-DossiersMobile([string]$Theme, [string]$Path) {
  $p = Palette $Theme '#db8b66' '#a84c2b' '#db8b66' '#a84c2b'
  $p.Wash = $(if ($Theme -eq 'dark') { '#171311' } else { '#f7efe9' })
  $c = New-Canvas 390 845 $p.Bg; $g = $c.Graphics
  T $g 'Hakan Duyar' 18 18 31 $p.Ink 'Georgia'
  T $g 'ARCHITECTURE CASEBOOK / 2026' 18 55 7 $p.Muted 'Consolas' 'Bold'
  L $g 18 76 372 76 $p.Strong 3
  T $g 'ENGINEERING IDENTITY' 18 98 7 $p.Accent 'Consolas' 'Bold'
  T $g 'Architecture makes' 18 126 31 $p.Ink 'Georgia'
  T $g 'intent accountable.' 18 160 31 $p.Ink 'Georgia'
  T $g 'React + TypeScript at the core; projects prove decisions.' 18 204 9 $p.Muted
  T $g 'Three systems.' 18 236 21 $p.Ink 'Georgia'
  T $g 'Three failure models.' 18 260 21 $p.Ink 'Georgia'
  $cases = @(
    @('01 / CONSISTENCY','DropSpot','Duplicate request ≠ duplicate allocation.','REACT','EXPRESS','POSTGRES'),
    @('02 / LOCAL FIRST','spark','Useful without account, server, or network.','REACT','DEXIE','INDEXEDDB'),
    @('03 / CONTROL','Software Factory','Disposable workers, durable workflow truth.','PLAN','VERIFY','HUMAN GATE')
  )
  $y = 296
  foreach ($row in $cases) {
    R $g 18 $y 354 148 $p.Paper $p.Line
    T $g $row[0] 34 ($y+14) 7 $p.Accent 'Consolas' 'Bold'
    T $g $row[1] 34 ($y+38) 22 $p.Ink 'Georgia'
    T $g $row[2] 34 ($y+67) 9 $p.Muted
    $x = 34
    for ($i=3; $i -lt 6; $i++) {
      R $g $x ($y+96) 100 30 $p.Wash $p.Line
      T $g $row[$i] ($x+8) ($y+105) 7 $p.Ink 'Consolas' 'Bold'
      $x += 110
    }
    $y += 156
  }
  T $g 'PROJECTS PROVE DECISIONS · NOT BADGES' 18 806 7 $p.Accent 'Consolas' 'Bold'
  Save-Canvas $c $Path
}

$targets=@(
  @{N='finalist-1';F='SystemBrief'},
  @{N='finalist-2';F='Dossiers'},
  @{N='finalist-3';F='Assurance'}
)
foreach($target in $targets){foreach($theme in @('dark','light')){$dir=Join-Path $Root "evidence/$($target.N)";if($target.F-eq'SystemBrief'){Draw-SystemBrief $theme (Join-Path $dir "desktop-$theme.png");Draw-SystemBrief $theme (Join-Path $dir "mobile-$theme.png") -Mobile}elseif($target.F-eq'Dossiers'){Draw-Dossiers $theme (Join-Path $dir "desktop-$theme.png");Draw-DossiersMobile $theme (Join-Path $dir "mobile-$theme.png")}else{Draw-Assurance $theme (Join-Path $dir "desktop-$theme.png");Draw-Assurance $theme (Join-Path $dir "mobile-$theme.png") -Mobile}}}

Copy-Item (Join-Path $Root 'evidence/finalist-2/desktop-dark.png') (Join-Path $Root 'evidence/concept-d/desktop-dark.png') -Force
Copy-Item (Join-Path $Root 'evidence/finalist-3/desktop-dark.png') (Join-Path $Root 'evidence/concept-e/desktop-dark.png') -Force
Copy-Item (Join-Path $Root 'evidence/finalist-1/desktop-dark.png') (Join-Path $Root 'evidence/concept-f/desktop-dark.png') -Force
