<?php

function debug($variable): string {
    echo "<pre>";
    var_dump($variable);
    echo "</pre>";
    exit;
}

function getCurrentPage(): string {
    return basename($_SERVER['PHP_SELF']);
}

function randomId($length): string {
    return bin2hex(random_bytes($length));
}

function isAuth(): void {
    if (!isset($_SESSION['login'])) {
        header('Location: /');
    }
}

function slugify($text, string $divider = '-'): string {
    $text = preg_replace('~[^\pL\d]+~u', $divider, $text);
    $text = iconv('utf-8', 'us-ascii//TRANSLIT', $text);
    $text = preg_replace('~[^-\w]+~', '', $text);
    $text = trim($text, $divider);
    $text = preg_replace('~-+~', $divider, $text);
    $text = strtolower($text);

    if (empty($text)) {
        return 'n-a';
    }

    return $text;
}

function base64toImage($base64_string, $output_file): string {
    $file = fopen($output_file, "wb");
    $data = explode(',', $base64_string);
    fwrite($file, base64_decode($data[1]));
    fclose($file);
    return $output_file;
}

function imageToBase64($image): string {
    $type = pathinfo($image, PATHINFO_EXTENSION);
    $data = file_get_contents($image);
    return 'data:image/' . $type . ';base64,' . base64_encode($data);
}

function renameFile($path) {
    $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
    $name = randomId(64) . '.' . $ext;
    return $name;
}

function uploadFile($image, $name) {
    $destination = '../uploads/files/';
    return move_uploaded_file($image, $destination . $name);
}
