<!DOCTYPE html>
<html lang="es-ES">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Lacopiadera">

    <meta property="og:title" content="">
    <meta property="og:description" content="">
    <meta property="og:type" content="">
    <meta property="og:url" content="">
    <meta property="og:image" content="">

    <meta property="twitter:card" content="">
    <meta property="twitter:url" content="">
    <meta property="twitter:title" content="">
    <meta property="twitter:description" content="">
    <meta property="twitter:image" content="">

    <title>Lacopiadera | <?php echo $title ?></title>

    <link rel="shortcut icon" href="/build/favicon.ico">

    <link rel="preload" href="/build/css/app.css" as="style">
    <link rel="stylesheet" href="/build/css/app.css">

    <meta name="theme-color" content="#ffffff">
</head>

<body <?php echo $page === 'home' || $page === 'contact' || $page === 'error' ? 'class="home"' : '' ?>>

    <?php
    include __DIR__ . '/layout/header.php';
    include __DIR__ . '/layout/sidebar.php';

    echo $content;

    if ($page === 'home' || $page === 'contact' || $page === 'error') {
        include __DIR__ . '/layout/footer.php';
    }

    include __DIR__  . '/layout/cart-panel.php';
    include __DIR__  . '/layout/user-panel.php';
    ?>

    <script src="/build/js/app.js" type="module"></script>
</body>

</html>