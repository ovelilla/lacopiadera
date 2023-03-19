<?php

require __DIR__ . '/../vendor/autoload.php';
require __DIR__ . '/scripts/helpers.php';

use Models\Session;
use Models\Router;

use Controllers\PagesController;
use Controllers\UserController;
use Controllers\AddressController;
use Controllers\CodeController;
use Controllers\OrderController;

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->safeLoad();

$session = new Session();
$router = new Router($session);

$router->get('/', [PagesController::class, 'index'], false);
$router->get('/imprimir', [PagesController::class, 'print'], false);
$router->get('/contacto', [PagesController::class, 'contact'], false);

$router->get('/checkout', [PagesController::class, 'checkout'], false);
$router->get('/pago/{params}', [PagesController::class, 'payment'], true);

$router->get('/login', [PagesController::class, 'login'], false);
$router->get('/logout', [PagesController::class, 'logout'], false);
$router->get('/registro', [PagesController::class, 'register'], false);
$router->get('/confirmar/{token}', [PagesController::class, 'confirm'], false);
$router->get('/recuperar', [PagesController::class, 'recover'], false);
$router->get('/restablecer', [PagesController::class, 'restore'], false);
$router->get('/restablecer/{token}', [PagesController::class, 'restore'], false);

$router->get('/perfil', [PagesController::class, 'profile'], true);
$router->get('/direcciones', [PagesController::class, 'addresses'], true);
$router->get('/pedidos', [PagesController::class, 'orders'], true);
$router->get('/codigos', [PagesController::class, 'codes'], true);
$router->get('/pedidos-admin', [PagesController::class, 'ordersAdmin'], true);

$router->post('/api/user/login', [UserController::class, 'login'], false);
$router->post('/api/user/register', [UserController::class, 'register'], false);
$router->post('/api/user/confirm', [UserController::class, 'confirm'], false);
$router->post('/api/user/recover', [UserController::class, 'recover'], false);
$router->post('/api/user/restore', [UserController::class, 'restore'], false);
$router->get('/api/user/auth', [UserController::class, 'getAuth'], false);

$router->get('/api/user/profile', [UserController::class, 'readProfile'], true);
$router->put('/api/user/profile', [UserController::class, 'updateProfile'], true);

$router->get('/api/user/address', [AddressController::class, 'readAddresses'], true);
$router->post('/api/user/address/first', [AddressController::class, 'createFirstAddress'], true);
$router->post('/api/user/address', [AddressController::class, 'createAddress'], true);
$router->put('/api/user/address', [AddressController::class, 'updateAddress'], true);
$router->delete('/api/user/address', [AddressController::class, 'deleteAddress'], true);

$router->get('/api/code', [CodeController::class, 'readCodes'], true);
$router->post('/api/code', [CodeController::class, 'createCode'], true);
$router->put('/api/code', [CodeController::class, 'updateCode'], true);
$router->delete('/api/code', [CodeController::class, 'deleteCode'], true);
$router->delete('/api/code/multiple', [CodeController::class, 'deleteCodes'], true);
$router->post('/api/code/validate', [CodeController::class, 'validate'], false);
$router->put('/api/code/active', [CodeController::class, 'updateCodeActive'], false);

$router->post('/api/order/read', [OrderController::class, 'readOrders'], true);
$router->post('/api/order/create', [OrderController::class, 'createOrder'], false);
$router->put('/api/order', [OrderController::class, 'updateOrder'], false);
$router->delete('/api/order', [OrderController::class, 'deleteOrder'], false);
$router->delete('/api/order/multiple', [OrderController::class, 'deleteOrders'], false);
$router->post('/api/order/download', [OrderController::class, 'downloadFiles'], true);
$router->post('/api/order/download/all', [OrderController::class, 'downloadAllFiles'], true);
$router->post('/api/order/invoice', [OrderController::class, 'generatePDF'], true);
$router->post('/api/order/update-number', [OrderController::class, 'updateNumber'], true);
$router->post('/api/order/redsys-data', [OrderController::class, 'getRedsysData'], true);

$router->post('/api/contact', [PagesController::class, 'sendMessage']);

$router->check();
