<?php

namespace Controllers;

use Models\DB;
use Models\Router;
use Models\RedsysAPI;
use Models\Order;
use Models\Invoice;
use Models\Email;
use Models\Contact;

use Dompdf\Dompdf;


use Exception;
use Error;

class PagesController {
    public static function index(Router $router) {
        $auth = $router->session()->get('auth');
        $name = $router->session()->get('name');
        $email = $router->session()->get('email');

        $router->render('pages/index', [
            'title' => 'Principal',
            'page' => 'home',
            'user' => [
                'auth' => $auth,
                'name' => $name,
                'email' => $email
            ]
        ]);
    }

    public static function print(Router $router) {
        $auth = $router->session()->get('auth');
        $name = $router->session()->get('name');
        $email = $router->session()->get('email');

        $router->render('pages/print', [
            'title' => 'Imprimir',
            'page' => 'print',
            'user' => [
                'auth' => $auth,
                'name' => $name,
                'email' => $email
            ]
        ]);
    }

    public static function contact(Router $router) {
        $auth = $router->session()->get('auth');
        $name = $router->session()->get('name');
        $email = $router->session()->get('email');

        $router->render('pages/contact', [
            'title' => 'Contacto',
            'page' => 'contact',
            'user' => [
                'auth' => $auth,
                'name' => $name,
                'email' => $email
            ]
        ]);
    }

    public static function checkout(Router $router) {
        $auth = $router->session()->get('auth');
        $name = $router->session()->get('name');
        $email = $router->session()->get('email');

        $router->render('pages/checkout', [
            'title' => 'Checkout',
            'page' => 'checkout',
            'user' => [
                'auth' => $auth,
                'name' => $name,
                'email' => $email
            ]
        ]);
    }

    public static function payment(Router $router) {
        if (empty($_GET)) {
            $router->redirect('/');
            return;
        }

        if (!isset($_GET["Ds_SignatureVersion"]) || !isset($_GET["Ds_MerchantParameters"]) || !isset($_GET["Ds_Signature"])) {
            $router->redirect('/');
            return;
        }

        $auth = $router->session()->get('auth');
        $name = $router->session()->get('name');
        $email = $router->session()->get('email');

        $redsys = new RedsysAPI();

        $signatureVersion = $_GET["Ds_SignatureVersion"];
        $merchantParameters = $_GET["Ds_MerchantParameters"];
        $signatureReceived = $_GET["Ds_Signature"];

        $decodec = $redsys->decodeMerchantParameters($merchantParameters);

        $payment = false;
        $orderData = [];
        $error = $redsys->checkDsResponse($decodec);

        $renderOptions = [
            'title' => 'Subir archivos',
            'page' => 'payment',
            'user' => [
                'auth' => $auth,
                'name' => $name,
                'email' => $email
            ],
            'payment' => $payment,
            'order' => $orderData,
            'error' => $error
        ];

        if (!empty($error)) {
            $router->render('pages/payment', $renderOptions);
            return;
        }

        $signature = $redsys->createMerchantSignatureNotif($_ENV['TPV_KC'], $merchantParameters);

        if ($signature !== $signatureReceived) {
            $renderOptions['error'] = 'La firma no es correcta';

            $router->render('pages/payment', $renderOptions);
            return;
        }

        $data = json_decode($decodec);

        $orderExists = DB::table('order')
            ->select()
            ->where('number', '=', $data->Ds_Order)
            ->limit(1)
            ->getOne();

        if (!$orderExists) {
            $renderOptions['error'] = 'No existe un pedido con ese número.';

            $router->render('pages/payment', $renderOptions);
            return;
        }

        $order = new Order($orderExists);

        $order->setPaid(true);
        $order->setUpdatedAt(date('Y-m-d H:i:s'));

        DB::table('order')
            ->update($order->getData())
            ->where('id', '=', $order->getId())
            ->execute();

        $invoice = new Invoice();

        $lastInvoice = DB::table('invoice')
            ->select()
            ->orderBy('id', 'DESC')
            ->limit(1)
            ->getOne();

        if ($lastInvoice) {
            $parts = explode('-', $lastInvoice['number']);

            $number = $parts[0] === date('Y') ? intval($parts[1]) + 1 : 1;
            $number = str_pad($number, 6, '0', STR_PAD_LEFT);

            $year = $parts[0] === date('Y') ? $parts[0] : date('Y');

            $number = $year . '-' . $number;
        } else {
            $number = date('Y') . '-00001';
        }

        $invoice->setOrderId($order->getId());
        $invoice->setNumber($number);
        $invoice->setCreatedAt(date('Y-m-d H:i:s'));
        $invoice->setUpdatedAt(date('Y-m-d H:i:s'));

        $insertData = DB::table('invoice')
            ->insert($invoice->getData())
            ->execute();

        $invoice->setId($insertData['insert_id']);

        $order = DB::table('order')
            ->select('order.*', "CONCAT(profile.name, ' ', profile.lastname) AS username")
            ->join('profile', 'profile.userId', 'order.userId')
            ->where('order.id', '=', $order->getId())
            ->limit(1)
            ->getOne();

        $order['shippingAddress'] = DB::table('address')
            ->select()
            ->where('id', '=', $order['shippingAddressId'])
            ->limit(1)
            ->getOne();

        $order['billingAddress'] = DB::table('address')
            ->select()
            ->where('id', '=', $order['billingAddressId'])
            ->limit(1)
            ->getOne();

        $items = DB::table('item')
            ->select()
            ->where('orderId', '=', $order['id'])
            ->get();

        foreach ($items as $key => $item) {
            $options = DB::table('options')
                ->select()
                ->where('itemId', '=', $item['id'])
                ->limit(1)
                ->getOne();

            $items[$key]['options'] = $options;

            $files = DB::table('file')
                ->select()
                ->where('itemId', '=', $item['id'])
                ->get();

            $items[$key]['files'] = $files;
        }

        $order['items'] = $items;

        $dompdf = new Dompdf();

        ob_start();
        include __DIR__ . "/../views/templates/invoice.php";
        $html = ob_get_contents();
        ob_end_clean();

        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();
        $output = $dompdf->output();

        $emailData = [
            'name' => $name,
            'email' => $email,
            'order' => $order,
            'invoice' => [
                'pdf' => $output,
                'number' => $invoice->getNumber()
            ]
        ];

        $email = new Email($emailData);
        $email->sendOrderConfirmation();
        $email->sendNoticeToAdmin();

        $renderOptions['order'] = $order;
        $renderOptions['payment'] = true;

        $router->render('pages/payment', $renderOptions);
    }

    public static function login(Router $router) {
        $auth = $router->session()->get('auth');
        $name = $router->session()->get('name');
        $email = $router->session()->get('email');

        if ($auth) {
            $router->redirect('/');
        }

        $router->render('pages/login', [
            'title' => 'Registrarse',
            'page' => 'login',
            'user' => [
                'auth' => $auth,
                'name' => $name,
                'email' => $email
            ]
        ]);
    }

    public static function logout(Router $router) {
        $router->session()->destroy();

        header('Location: /');
    }

    public static function register(Router $router) {
        $auth = $router->session()->get('auth');
        $name = $router->session()->get('name');
        $email = $router->session()->get('email');

        $router->render('pages/register', [
            'title' => 'Crear cuenta',
            'page' => 'register',
            'user' => [
                'auth' => $auth,
                'name' => $name,
                'email' => $email
            ]
        ]);
    }

    public static function confirm(Router $router) {
        $token = $router->getParam('token');
        $auth = $router->session()->get('auth');
        $name = $router->session()->get('name');
        $email = $router->session()->get('email');

        if (!$token) {
            header('Location: /');
            return;
        }

        $router->render('pages/confirm', [
            'title' => 'Confirmar tu cuenta',
            'page' => 'confirm',
            'user' => [
                'auth' => $auth,
                'name' => $name,
                'email' => $email
            ]
        ]);
    }

    public static function recover(Router $router) {
        $auth = $router->session()->get('auth');
        $name = $router->session()->get('name');
        $email = $router->session()->get('email');

        $router->render('pages/recover', [
            'title' => 'Recuperar cuenta',
            'page' => 'recover',
            'user' => [
                'auth' => $auth,
                'name' => $name,
                'email' => $email
            ]
        ]);
    }

    public static function restore(Router $router) {
        $auth = $router->session()->get('auth');
        $name = $router->session()->get('name');
        $email = $router->session()->get('email');
        $token = $router->getParam('token');

        if (!$token) {
            header('Location: /');
            return;
        }

        $router->render('pages/restore', [
            'title' => 'Restablecer contraseña',
            'page' => 'restore',
            'user' => [
                'auth' => $auth,
                'name' => $name,
                'email' => $email
            ]
        ]);
    }

    public static function profile(Router $router) {
        $auth = $router->session()->get('auth');
        $name = $router->session()->get('name');
        $email = $router->session()->get('email');
        $admin = $router->session()->get('admin');

        $router->render('pages/profile', [
            'title' => 'Perfil',
            'page' => 'profile',
            'user' => [
                'auth' => $auth,
                'name' => $name,
                'email' => $email,
                'admin' => $admin
            ]
        ]);
    }

    public static function addresses(Router $router) {
        $auth = $router->session()->get('auth');
        $name = $router->session()->get('name');
        $email = $router->session()->get('email');
        $admin = $router->session()->get('admin');

        $router->render('pages/addresses', [
            'title' => 'Direcciones',
            'page' => 'addresses',
            'user' => [
                'auth' => $auth,
                'name' => $name,
                'email' => $email,
                'admin' => $admin
            ]
        ]);
    }

    public static function orders(Router $router) {
        $auth = $router->session()->get('auth');
        $name = $router->session()->get('name');
        $email = $router->session()->get('email');
        $admin = $router->session()->get('admin');

        $router->render('pages/orders', [
            'title' => 'Pedidos',
            'page' => 'orders',
            'user' => [
                'auth' => $auth,
                'name' => $name,
                'email' => $email,
                'admin' => $admin
            ]
        ]);
    }

    public static function codes(Router $router) {
        $admin = $router->session()->get('admin');

        if (!$admin) {
            header('Location: /');
            return;
        }

        $auth = $router->session()->get('auth');
        $name = $router->session()->get('name');
        $email = $router->session()->get('email');
        $admin = $router->session()->get('admin');

        $router->render('pages/codes', [
            'title' => 'Códigos',
            'page' => 'codes',
            'user' => [
                'auth' => $auth,
                'name' => $name,
                'email' => $email,
                'admin' => $admin
            ]
        ]);
    }

    public static function ordersAdmin(Router $router) {
        $admin = $router->session()->get('admin');

        if (!$admin) {
            header('Location: /');
            return;
        }

        $auth = $router->session()->get('auth');
        $name = $router->session()->get('name');
        $email = $router->session()->get('email');
        $admin = $router->session()->get('admin');

        $router->render('pages/orders-admin', [
            'title' => 'Pedidos admin',
            'page' => 'orders-admin',
            'user' => [
                'auth' => $auth,
                'name' => $name,
                'email' => $email,
                'admin' => $admin
            ]
        ]);
    }

    public static function sendMessage(Router $router) {
        $data = $router->getData();

        $contact = new Contact($data);

        $errors = $contact->validate();

        if (!empty($errors)) {
            $response = [
                'status' => 'error',
                'errors' => $errors
            ];

            echo json_encode($response);
            return;
        }

        $email = new Email($contact->getData());
        $email->sendContactMessage();

        $response = [
            'status' => 'success',
            'msg' => 'Mensaje enviado correctamente'
        ];
        echo json_encode($response);
    }

    public static function error(Router $router) {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $response = [
                'post' => 'error',
            ];

            echo json_encode($response);
            return;
        }

        $router->render('pages/error', [
            'title' => 'Página no encontrada',
            'page' => 'error'
        ]);
    }
}
