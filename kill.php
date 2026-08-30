<?php
// Self-service process killer for cPanel LVE limit cleanup
header('Content-Type: text/html');
echo "<h2>Self-Service LVE Process Cleanup</h2>";

$out1 = [];
$out2 = [];
exec("killall -9 node 2>&1", $out1);
exec("pkill -9 -u vfpmlbpv 2>&1", $out2);

echo "<b>Kill Node Output:</b><pre>" . htmlspecialchars(implode("\n", $out1)) . "</pre>";
echo "<b>Kill User Output:</b><pre>" . htmlspecialchars(implode("\n", $out2)) . "</pre>";
echo "<h3 style='color:green;'>Process cleanup executed. Refresh cPanel dashboard.</h3>";
