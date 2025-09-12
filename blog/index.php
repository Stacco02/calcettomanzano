<?php
// Forza il reindirizzamento immediato alla pagina news
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');
header('Location: ../news-2025.html', true, 301);
exit();
?>
