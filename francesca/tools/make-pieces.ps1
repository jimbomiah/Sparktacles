# make-pieces.ps1
# Generates the illustrated piece SVGs and bokeh backdrops for the Sparktacles site.
# Deterministic art direction: one 400x400 canvas, one spotlight, one gem system.
# Rerun this script after tweaking palette or geometry. Output: ../assets/*.svg

Set-StrictMode -Version 2
$ErrorActionPreference = 'Stop'
$out = Join-Path (Join-Path $PSScriptRoot '..') 'assets'

# ---------- helpers ----------

function Pt([double]$cx, [double]$cy, [double]$rx, [double]$ry, [double]$deg) {
    $r = $deg * [Math]::PI / 180.0
    [pscustomobject]@{
        x = [Math]::Round($cx + $rx * [Math]::Cos($r), 1)
        y = [Math]::Round($cy - $ry * [Math]::Sin($r), 1)
    }
}

function Arc([double]$cx, [double]$cy, [double]$rx, [double]$ry, [double]$a0, [double]$a1, [int]$n) {
    $pts = @()
    for ($i = 0; $i -le $n; $i++) { $pts += Pt $cx $cy $rx $ry ($a0 + ($a1 - $a0) * $i / $n) }
    return ,$pts
}

function Gem([double]$x, [double]$y, [double]$r, [string]$fill) {
    $hx = [Math]::Round($x - $r * 0.32, 1)
    $hy = [Math]::Round($y - $r * 0.32, 1)
    $hr = [Math]::Round($r * 0.30, 1)
    "<circle cx='$x' cy='$y' r='$r' fill='$fill' stroke='rgba(11,7,22,0.45)' stroke-width='1.5'/>" +
    "<circle cx='$hx' cy='$hy' r='$hr' fill='#FFFFFF' opacity='0.85'/>"
}

function Star([double]$x, [double]$y, [double]$s, [string]$fill, [double]$op = 1) {
    $k = [Math]::Round(0.24 * $s, 1)
    $p = @(
        "$x,$([Math]::Round($y - $s,1))",
        "$([Math]::Round($x + $k,1)),$([Math]::Round($y - $k,1))",
        "$([Math]::Round($x + $s,1)),$y",
        "$([Math]::Round($x + $k,1)),$([Math]::Round($y + $k,1))",
        "$x,$([Math]::Round($y + $s,1))",
        "$([Math]::Round($x - $k,1)),$([Math]::Round($y + $k,1))",
        "$([Math]::Round($x - $s,1)),$y",
        "$([Math]::Round($x - $k,1)),$([Math]::Round($y - $k,1))"
    )
    "<polygon points='$($p -join ' ')' fill='$fill' opacity='$op'/>"
}

function HeartPath([double]$cx, [double]$cy, [double]$s) {
    $pts = @()
    for ($i = 0; $i -le 45; $i++) {
        $t = $i * 8.0 * [Math]::PI / 180.0
        $x = 16 * [Math]::Pow([Math]::Sin($t), 3)
        $y = (13 * [Math]::Cos($t) - 5 * [Math]::Cos(2 * $t) - 2 * [Math]::Cos(3 * $t) - [Math]::Cos(4 * $t))
        $pts += ('{0},{1}' -f [Math]::Round($cx + $x * $s, 1), [Math]::Round($cy - $y * $s, 1))
    }
    return 'M' + ($pts -join ' L ') + ' Z'
}

function HeartPts([double]$cx, [double]$cy, [double]$s, [double[]]$degs) {
    $pts = @()
    foreach ($d in $degs) {
        $t = $d * [Math]::PI / 180.0
        $x = 16 * [Math]::Pow([Math]::Sin($t), 3)
        $y = (13 * [Math]::Cos($t) - 5 * [Math]::Cos(2 * $t) - 2 * [Math]::Cos(3 * $t) - [Math]::Cos(4 * $t))
        $pts += [pscustomobject]@{ x = [Math]::Round($cx + $x * $s, 1); y = [Math]::Round($cy - $y * $s, 1) }
    }
    return ,$pts
}

function CycleGem($pts, [string[]]$colors, [double]$r) {
    $sb = ''
    for ($i = 0; $i -lt $pts.Count; $i++) {
        $sb += Gem $pts[$i].x $pts[$i].y $r $colors[$i % $colors.Count]
    }
    return $sb
}

$LensFill = "fill='#241B44' opacity='0.55'"
$Shadow   = "<ellipse cx='200' cy='326' rx='116' ry='13' fill='#0B0716' opacity='0.45'/>"
$BrandStar = (Star 328 88 11 '#FFC93C' 0.95) + (Star 350 116 6 '#FFC93C' 0.8)

function SaveSvg([string]$name, [string]$label, [string]$inner) {
    $svg = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400' role='img' aria-label='$label'>`n" +
           "  $Shadow`n  $inner`n</svg>"
    $path = Join-Path $out $name
    [System.IO.File]::WriteAllText($path, $svg, (New-Object System.Text.UTF8Encoding($false)))
    Write-Host "wrote $name"
}

# ---------- pieces ----------

# 1. Leopard cat-eye
$s = ''
$s += "<ellipse cx='118' cy='206' rx='62' ry='44' $LensFill stroke='#E8A23C' stroke-width='10'/>"
$s += "<ellipse cx='282' cy='206' rx='62' ry='44' $LensFill stroke='#E8A23C' stroke-width='10'/>"
$s += "<path d='M46,142 Q62,156 88,160' stroke='#E8A23C' stroke-width='10' fill='none' stroke-linecap='round'/>"
$s += "<path d='M354,142 Q338,156 312,160' stroke='#E8A23C' stroke-width='10' fill='none' stroke-linecap='round'/>"
$s += "<path d='M178,196 Q200,186 222,196' stroke='#E8A23C' stroke-width='10' fill='none' stroke-linecap='round'/>"
$s += "<path d='M58,224 L34,248' stroke='#E8A23C' stroke-width='8' fill='none' stroke-linecap='round'/>"
$s += "<path d='M342,224 L366,248' stroke='#E8A23C' stroke-width='8' fill='none' stroke-linecap='round'/>"
$s += CycleGem (Arc 118 206 62 44 20 160 7) @('#E8A23C','#8A4B1F','#4A2A12') 7.5
$s += CycleGem (Arc 282 206 62 44 20 160 7) @('#E8A23C','#8A4B1F','#4A2A12') 7.5
$s += CycleGem (Arc 118 206 62 44 -160 -20 4) @('#8A4B1F','#E8A23C','#4A2A12') 6.5
$s += CycleGem (Arc 282 206 62 44 -160 -20 4) @('#8A4B1F','#E8A23C','#4A2A12') 6.5
$s += Gem 200 190 7.5 '#E8A23C'
$s += $BrandStar
SaveSvg 'piece-leopard.svg' 'Illustration: cat-eye sunglasses with a leopard pattern of amber and brown rhinestones' $s

# 2. Rainbow round
$s = ''
$s += "<circle cx='128' cy='205' r='52' $LensFill stroke='#FFFFFF' stroke-width='9'/>"
$s += "<circle cx='272' cy='205' r='52' $LensFill stroke='#FFFFFF' stroke-width='9'/>"
$s += "<path d='M180,200 Q200,190 220,200' stroke='#FFFFFF' stroke-width='9' fill='none' stroke-linecap='round'/>"
$s += "<path d='M78,192 L46,232' stroke='#FFFFFF' stroke-width='7' fill='none' stroke-linecap='round'/>"
$s += "<path d='M322,192 L354,232' stroke='#FFFFFF' stroke-width='7' fill='none' stroke-linecap='round'/>"
$rainbow = @('#E5484D','#F76808','#FFC93C','#30A46C','#0090FF','#8A50F4')
$s += CycleGem (Arc 128 205 52 52 0 330 11) $rainbow 8
$s += CycleGem (Arc 272 205 52 52 0 330 11) $rainbow 8
$s += $BrandStar
SaveSvg 'piece-rainbow.svg' 'Illustration: oversized round sunglasses rimmed with rainbow rhinestones' $s

# 3. Third eye
$s = ''
$s += "<circle cx='128' cy='210' r='46' $LensFill stroke='#9D6BFB' stroke-width='9'/>"
$s += "<circle cx='272' cy='210' r='46' $LensFill stroke='#9D6BFB' stroke-width='9'/>"
$s += "<circle cx='200' cy='118' r='25' $LensFill stroke='#9D6BFB' stroke-width='9'/>"
$s += "<path d='M184,206 L192,141' stroke='#9D6BFB' stroke-width='7' fill='none' stroke-linecap='round'/>"
$s += "<path d='M216,206 L208,141' stroke='#9D6BFB' stroke-width='7' fill='none' stroke-linecap='round'/>"
$s += "<path d='M174,202 Q200,194 226,202' stroke='#9D6BFB' stroke-width='9' fill='none' stroke-linecap='round'/>"
$s += "<path d='M82,196 L52,236' stroke='#9D6BFB' stroke-width='7' fill='none' stroke-linecap='round'/>"
$s += "<path d='M318,196 L348,236' stroke='#9D6BFB' stroke-width='7' fill='none' stroke-linecap='round'/>"
$s += CycleGem (Arc 128 210 46 46 20 160 7) @('#9D6BFB','#FF7AC3') 7
$s += CycleGem (Arc 272 210 46 46 20 160 7) @('#FF7AC3','#9D6BFB') 7
$s += CycleGem (Arc 128 210 46 46 -160 -20 4) @('#9D6BFB','#FF7AC3') 6
$s += CycleGem (Arc 272 210 46 46 -160 -20 4) @('#FF7AC3','#9D6BFB') 6
$s += (Star 200 118 13 '#FFC93C')
$s += $BrandStar
SaveSvg 'piece-thirdeye.svg' 'Illustration: novelty sunglasses with a third lens on the brow set with a gold star gem' $s

# 4. Festival goggles
$s = ''
$s += "<rect x='34' y='196' width='44' height='52' rx='10' $LensFill stroke='#5BC7F0' stroke-width='6'/>"
$s += "<rect x='322' y='196' width='44' height='52' rx='10' $LensFill stroke='#5BC7F0' stroke-width='6'/>"
$s += "<rect x='76' y='156' width='248' height='132' rx='62' $LensFill stroke='#5BC7F0' stroke-width='12'/>"
$s += "<path d='M186,288 Q200,272 214,288' stroke='#5BC7F0' stroke-width='8' fill='none' stroke-linecap='round'/>"
$gTop = @(110,133,156,179,202,225,248,271,294)
$gi = 0
foreach ($x in $gTop) {
    $c = if ($gi % 2 -eq 0) { '#BFE3FF' } else { '#5BC7F0' }
    $gi++
    $s += Gem $x 162 8 $c
}
$gBot = @(125,155,185,215,245,275)
foreach ($x in $gBot) { $s += Gem $x 284 6 '#BFE3FF' }
$s += Gem 56 210 6 '#BFE3FF'; $s += Gem 56 232 6 '#5BC7F0'
$s += Gem 344 210 6 '#5BC7F0'; $s += Gem 344 232 6 '#BFE3FF'
$s += (Star 165 222 12 '#FFC93C' 0.95) + (Star 237 222 12 '#FFC93C' 0.95)
$s += $BrandStar
SaveSvg 'piece-goggles.svg' 'Illustration: ski goggles with a blue and silver rhinestone strap and star gems on the lens' $s

# 5. Everyday sparkle frames
$s = ''
$s += "<rect x='66' y='168' width='128' height='86' rx='28' $LensFill stroke='#CBB6F2' stroke-width='9'/>"
$s += "<rect x='206' y='168' width='128' height='86' rx='28' $LensFill stroke='#CBB6F2' stroke-width='9'/>"
$s += "<path d='M194,196 Q200,192 206,196' stroke='#CBB6F2' stroke-width='9' fill='none' stroke-linecap='round'/>"
$s += "<path d='M66,190 L40,214' stroke='#CBB6F2' stroke-width='7' fill='none' stroke-linecap='round'/>"
$s += "<path d='M334,190 L360,214' stroke='#CBB6F2' stroke-width='7' fill='none' stroke-linecap='round'/>"
$ei = 0
foreach ($x in @(86,106,126,146,166)) {
    $c = if ($ei % 2 -eq 0) { '#E6D9FF' } else { '#9D6BFB' }
    $ei++
    $s += Gem $x 172 6 $c
}
foreach ($x in @(226,246,266,286,306)) {
    $c = if ($ei % 2 -eq 0) { '#9D6BFB' } else { '#E6D9FF' }
    $ei++
    $s += Gem $x 172 6 $c
}
$s += $BrandStar
SaveSvg 'piece-everyday.svg' 'Illustration: rectangular eyeglasses with delicate lavender and crystal rhinestones along the rims' $s

# 6. Gold aviator
$s = ''
$s += "<path d='M60,180 C60,150 88,140 118,140 C152,140 168,158 166,196 C164,238 142,260 110,260 C82,260 62,236 60,202 Z' $LensFill stroke='#FFC93C' stroke-width='9'/>"
$s += "<path d='M340,180 C340,150 312,140 282,140 C248,140 232,158 234,196 C236,238 258,260 290,260 C318,260 338,236 340,202 Z' $LensFill stroke='#FFC93C' stroke-width='9'/>"
$s += "<path d='M164,172 Q200,164 236,172' stroke='#FFC93C' stroke-width='9' fill='none' stroke-linecap='round'/>"
$s += "<path d='M178,198 Q200,190 222,198' stroke='#FFC93C' stroke-width='7' fill='none' stroke-linecap='round'/>"
$av = @(@(80,160),@(106,142),@(138,148),@(158,172))
foreach ($p in $av) { $s += Gem $p[0] $p[1] 6.5 '#F6DFAE' }
foreach ($p in @(@(320,160),@(294,142),@(262,148),@(242,172))) { $s += Gem $p[0] $p[1] 6.5 '#E8C87A' }
$s += Gem 200 166 6.5 '#F6DFAE'
$s += $BrandStar
SaveSvg 'piece-aviator.svg' 'Illustration: aviator sunglasses covered in gold and champagne rhinestones' $s

# 7. Pink heart
$s = ''
$s += "<path d='$(HeartPath 134 182 2.6)' $LensFill stroke='#FF7AC3' stroke-width='9' stroke-linejoin='round'/>"
$s += "<path d='$(HeartPath 266 182 2.6)' $LensFill stroke='#FF7AC3' stroke-width='9' stroke-linejoin='round'/>"
$s += "<path d='M176,172 Q200,160 224,172' stroke='#FF7AC3' stroke-width='9' fill='none' stroke-linecap='round'/>"
$s += "<path d='M94,206 L64,240' stroke='#FF7AC3' stroke-width='7' fill='none' stroke-linecap='round'/>"
$s += "<path d='M306,206 L336,240' stroke='#FF7AC3' stroke-width='7' fill='none' stroke-linecap='round'/>"
$degs = @(15,45,75,105,135,165,195,225,255,285,315,345)
$s += CycleGem (HeartPts 134 182 2.6 $degs) @('#FF7AC3','#E0479E') 6.5
$s += CycleGem (HeartPts 266 182 2.6 $degs) @('#E0479E','#FF7AC3') 6.5
$s += $BrandStar
SaveSvg 'piece-heart.svg' 'Illustration: heart-shaped sunglasses covered in pink and fuchsia rhinestones' $s

# 8. Pastel wire readers
$s = ''
$s += "<circle cx='128' cy='205' r='48' $LensFill stroke='#D8CBF5' stroke-width='5.5'/>"
$s += "<circle cx='272' cy='205' r='48' $LensFill stroke='#D8CBF5' stroke-width='5.5'/>"
$s += "<path d='M176,196 Q200,188 224,196' stroke='#D8CBF5' stroke-width='5.5' fill='none' stroke-linecap='round'/>"
$s += "<path d='M80,192 L50,230' stroke='#D8CBF5' stroke-width='5' fill='none' stroke-linecap='round'/>"
$s += "<path d='M320,192 L350,230' stroke='#D8CBF5' stroke-width='5' fill='none' stroke-linecap='round'/>"
$pastel = @('#7FE3C4','#FFB48A','#C9A8FF','#F6DFAE')
$s += CycleGem (Arc 128 205 48 48 0 315 7) $pastel 5
$s += CycleGem (Arc 272 205 48 48 0 315 7) @('#C9A8FF','#F6DFAE','#7FE3C4','#FFB48A') 5
$s += $BrandStar
SaveSvg 'piece-readers.svg' 'Illustration: round wire reading glasses set with tiny pastel rhinestones' $s

# ---------- bokeh backdrops ----------

function Bokeh([string]$name, [int]$w, [int]$h, [object[]]$orbs, [object[]]$stars) {
    $sb = New-Object System.Text.StringBuilder
    [void]$sb.AppendLine("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 $w $h' preserveAspectRatio='xMidYMid slice' role='img' aria-label=''>")
    [void]$sb.AppendLine("  <defs>")
    [void]$sb.AppendLine("    <filter id='soft' x='-80%' y='-80%' width='260%' height='260%'><feGaussianBlur stdDeviation='16'/></filter>")
    [void]$sb.AppendLine("    <filter id='mini' x='-80%' y='-80%' width='260%' height='260%'><feGaussianBlur stdDeviation='5'/></filter>")
    [void]$sb.AppendLine("    <radialGradient id='vig' cx='50%' cy='34%' r='78%'>")
    [void]$sb.AppendLine("      <stop offset='55%' stop-color='#140F23' stop-opacity='0'/>")
    [void]$sb.AppendLine("      <stop offset='100%' stop-color='#140F23' stop-opacity='0.92'/>")
    [void]$sb.AppendLine("    </radialGradient>")
    [void]$sb.AppendLine("    <linearGradient id='fade' x1='0' y1='0' x2='0' y2='1'>")
    [void]$sb.AppendLine("      <stop offset='55%' stop-color='#140F23' stop-opacity='0'/>")
    [void]$sb.AppendLine("      <stop offset='100%' stop-color='#140F23' stop-opacity='1'/>")
    [void]$sb.AppendLine("    </linearGradient>")
    [void]$sb.AppendLine("  </defs>")
    [void]$sb.AppendLine("  <rect width='$w' height='$h' fill='#150F28'/>")
    foreach ($o in $orbs) {
        $f = 'soft'; if ($o.blur -eq 'mini') { $f = 'mini' }
        [void]$sb.AppendLine("  <circle cx='$($o.x)' cy='$($o.y)' r='$($o.r)' fill='$($o.fill)' opacity='$($o.op)' filter='url(#$f)'/>")
    }
    foreach ($t in $stars) {
        [void]$sb.AppendLine('  ' + (Star $t.x $t.y $t.s $t.fill $t.op))
    }
    [void]$sb.AppendLine("  <rect width='$w' height='$h' fill='url(#vig)'/>")
    [void]$sb.AppendLine("  <rect width='$w' height='$h' fill='url(#fade)'/>")
    [void]$sb.AppendLine('</svg>')
    [System.IO.File]::WriteAllText((Join-Path $out $name), $sb.ToString(), (New-Object System.Text.UTF8Encoding($false)))
    Write-Host "wrote $name"
}

$heroOrbs = @(
    @{x=180;  y=180; r=120; fill='#9D6BFB'; op=0.34; blur='soft'},
    @{x=520;  y=120; r=90;  fill='#FF7AC3'; op=0.30; blur='soft'},
    @{x=900;  y=220; r=130; fill='#5BC7F0'; op=0.26; blur='soft'},
    @{x=1290; y=160; r=110; fill='#FFC93C'; op=0.26; blur='soft'},
    @{x=1480; y=320; r=140; fill='#E0479E'; op=0.30; blur='soft'},
    @{x=360;  y=420; r=150; fill='#6D4AE0'; op=0.34; blur='soft'},
    @{x=1100; y=460; r=160; fill='#6D4AE0'; op=0.30; blur='soft'},
    @{x=700;  y=540; r=120; fill='#FF7AC3'; op=0.22; blur='soft'},
    @{x=60;   y=620; r=130; fill='#5BC7F0'; op=0.24; blur='soft'},
    @{x=1520; y=640; r=120; fill='#9D6BFB'; op=0.30; blur='soft'},
    @{x=980;  y=760; r=140; fill='#FFC93C'; op=0.18; blur='soft'},
    @{x=300;  y=240; r=26;  fill='#FFC93C'; op=0.80; blur='mini'},
    @{x=760;  y=160; r=20;  fill='#FF7AC3'; op=0.85; blur='mini'},
    @{x=1240; y=300; r=24;  fill='#9D6BFB'; op=0.80; blur='mini'},
    @{x=1420; y=520; r=20;  fill='#5BC7F0'; op=0.80; blur='mini'},
    @{x=540;  y=560; r=22;  fill='#FFC93C'; op=0.70; blur='mini'},
    @{x=960;  y=420; r=18;  fill='#FFFFFF'; op=0.50; blur='mini'},
    @{x=180;  y=480; r=20;  fill='#FF7AC3'; op=0.70; blur='mini'},
    @{x=1340; y=700; r=22;  fill='#FFC93C'; op=0.60; blur='mini'}
)
$heroStars = @(
    @{x=240;  y=140; s=14; fill='#FFC93C'; op=0.9},
    @{x=1180; y=240; s=10; fill='#FFFFFF'; op=0.7},
    @{x=620;  y=640; s=12; fill='#FFC93C'; op=0.55},
    @{x=1420; y=140; s=10; fill='#FF7AC3'; op=0.7}
)
Bokeh 'bokeh-hero.svg' 1600 900 $heroOrbs $heroStars

$bandOrbs = @(
    @{x=140;  y=110; r=70; fill='#9D6BFB'; op=0.30; blur='soft'},
    @{x=460;  y=60;  r=55; fill='#FF7AC3'; op=0.26; blur='soft'},
    @{x=820;  y=130; r=75; fill='#5BC7F0'; op=0.22; blur='soft'},
    @{x=1180; y=80;  r=60; fill='#FFC93C'; op=0.24; blur='soft'},
    @{x=1480; y=180; r=80; fill='#E0479E'; op=0.28; blur='soft'},
    @{x=320;  y=190; r=16; fill='#FFC93C'; op=0.7;  blur='mini'},
    @{x=640;  y=140; r=13; fill='#FFFFFF'; op=0.5;  blur='mini'},
    @{x=1020; y=200; r=15; fill='#9D6BFB'; op=0.7;  blur='mini'},
    @{x=1330; y=150; r=14; fill='#FF7AC3'; op=0.7;  blur='mini'}
)
$bandStars = @(
    @{x=210; y=70;  s=11; fill='#FFC93C'; op=0.85},
    @{x=920; y=90;  s=9;  fill='#FFFFFF'; op=0.6},
    @{x=1400; y=110; s=10; fill='#FFC93C'; op=0.7}
)
Bokeh 'bokeh-band.svg' 1600 420 $bandOrbs $bandStars

Write-Host 'done.'
