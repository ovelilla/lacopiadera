<?php

namespace Controllers;

use Models\Router;
use Models\DB;

use Models\Order;
use Models\Item;
use Models\Invoice;
use Models\Options;
use Models\File;
use Models\RedsysAPI;

use Dompdf\Dompdf;

use ZipArchive;

use Exception;
use Error;

class OrderController {
    public static function readOrders(Router $router) {
        $data = $router->getData();

        $page = $data['page'] ?? null;
        $limit = $data['limit'] ?? null;

        $userId = $router->session()->get('id');
        $userAdmin = $router->session()->get('admin');

        try {
            if ($page && $limit && $userAdmin === 0) {
                $orders = DB::table('order')
                    ->select()
                    ->where('userId', '=', $userId)
                    ->orderBy('createdAt', 'DESC')
                    ->paginate($page, $limit)
                    ->get();
            }

            if ($page && $limit && $userAdmin === 1) {
                $orders = DB::table('order')
                    ->select()
                    ->orderBy('createdAt', 'DESC')
                    ->paginate($page, $limit)
                    ->get();
            }

            if (!$page && !$limit && $userAdmin === 1) {
                $orders = DB::table('order')
                    ->select('order.*', "CONCAT(profile.name, ' ', profile.lastname) AS username")
                    ->join('profile', 'profile.userId', 'order.userId')
                    ->orderBy('createdAt', 'DESC')
                    ->get();
            }

            foreach ($orders as $i => $order) {
                $shippingAddress = DB::table('address')
                    ->select()
                    ->where('id', '=', $order['shippingAddressId'])
                    ->limit(1)
                    ->getOne();

                $orders[$i]['shippingAddress'] = $shippingAddress;

                $billingAddress = DB::table('address')
                    ->select()
                    ->where('id', '=', $order['billingAddressId'])
                    ->limit(1)
                    ->getOne();

                $orders[$i]['billingAddress'] = $billingAddress;

                $items = DB::table('item')
                    ->select()
                    ->where('orderId', '=', $order['id'])
                    ->get();

                $orders[$i]['items'] = $items;

                foreach ($items as $j => $item) {
                    $options = DB::table('options')
                        ->select()
                        ->where('itemId', '=', $item['id'])
                        ->limit(1)
                        ->getOne();

                    $orders[$i]['items'][$j]['options'] = $options;

                    $files = DB::table('file')
                        ->select()
                        ->where('itemId', '=', $item['id'])
                        ->get();

                    $orders[$i]['items'][$j]['files'] = $files;

                    foreach ($files as $k => $file) {
                        $orders[$i]['items'][$j]['files'][$k]['imageBase64'] =  imageToBase64('../uploads/images/' . $file['image']);
                    }
                }
            }

            $total = DB::table('order')
                ->count()
                ->where('userId', '=', $userId)
                ->limit(1)
                ->getOne();

            $response = [
                'status' => 'success',
                'message' => 'Pedidos obtneidos correctamente',
                'orders' => $orders,
                'total' => $total['COUNT(*)']
            ];
        } catch (Exception | Error $e) {
            $response = [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
        }

        $router->response($response);
    }

    public static function readOrder($id) {
        try {
            $order = DB::table('order')
                ->select('order.*', "CONCAT(profile.name, ' ', profile.lastname) AS username")
                ->join('profile', 'profile.userId', 'order.userId')
                ->where('order.id', '=', $id)
                ->limit(1)
                ->getOne();

            $shippingAddress = DB::table('address')
                ->select()
                ->where('id', '=', $order['shippingAddressId'])
                ->limit(1)
                ->getOne();

            $billingAddress = DB::table('address')
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
            $order['shippingAddress'] = $shippingAddress;
            $order['billingAddress'] = $billingAddress;

            $response = [
                'status' => 'success',
                'message' => 'Pedido encontrado',
                'order' => $order
            ];
        } catch (Exception | Error $e) {
            $response = [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
        }

        return $response;
    }

    public static function createOrder(Router $router) {
        $data = $router->getData();
        $files = $router->getFiles();

        $cart = json_decode($data['cart'], true);
        $details = json_decode($data['details'], true);
        $shippingAddress = json_decode($data['shippingAddress'], true);
        $billingAddress = json_decode($data['billingAddress'], true);

        $userId = $router->session()->get('id');

        $order = new Order($details);
        $order->setUserId($userId);
        $order->setShippingAddressId($shippingAddress['id']);
        $order->setBillingAddressId($billingAddress['id']);
        $order->setCreatedAt(date('Y-m-d H:i:s'));
        $order->setUpdatedAt(date('Y-m-d H:i:s'));

        try {
            DB::beginTransaction();

            $insertOrderData = DB::table('order')
                ->insert($order->getData())
                ->execute();

            $order->setId($insertOrderData['insert_id']);

            $lastOrder = DB::table('order')
                ->select()
                ->orderBy('number', 'DESC')
                ->limit(1)
                ->getOne();

            if ($lastOrder) {
                $year = substr($lastOrder['number'], 0, 4);
                if ($year === date('Y')) {
                    $order->setNumber($lastOrder['number'] + 1);
                } else {
                    $order->setNumber(date('Y') . date('m') . str_pad($order->getId(), 6, '0', STR_PAD_LEFT));
                }
                $order->setNumber($lastOrder['number'] + 1);
            } else {
                $order->setNumber(date('Y') . date('m') . str_pad($order->getId(), 6, '0', STR_PAD_LEFT));
            }

            DB::table('order')
                ->update($order->getData())
                ->where('id', '=', $order->getId())
                ->execute();

            foreach ($cart as $i => $cartItem) {
                $item = new Item($cartItem['resume']);
                $item->setOrderId($order->getId());
                $item->setCreatedAt(date('Y-m-d H:i:s'));
                $item->setUpdatedAt(date('Y-m-d H:i:s'));

                $insertItemData = DB::table('item')
                    ->insert($item->getData())
                    ->execute();

                $item->setId($insertItemData['insert_id']);

                $options = new Options($cartItem['options']);
                $options->setItemId($item->getId());
                $options->setCreatedAt(date('Y-m-d H:i:s'));
                $options->setUpdatedAt(date('Y-m-d H:i:s'));

                DB::table('options')
                    ->insert($options->getData())
                    ->execute();

                foreach ($cartItem['files'] as $j => $itemFile) {
                    $fileName = renameFile($files[$i]['name'][$j]);
                    $upload = uploadFile($files[$i]['tmp_name'][$j], $fileName);

                    $image = file_get_contents($itemFile['image']);
                    $imageName = randomId(64) . '.jpg';
                    $success = file_put_contents('../uploads/images/' . $imageName, $image);

                    $file = new File($itemFile);
                    $file->setItemId($item->getId());
                    $file->setFile($fileName);
                    $file->setImage($imageName);
                    $file->setCreatedAt(date('Y-m-d H:i:s'));
                    $file->setUpdatedAt(date('Y-m-d H:i:s'));

                    DB::table('file')
                        ->insert($file->getData())
                        ->execute();
                }
            }

            DB::commit();

            $order = self::readOrder($order->getId())['order'];

            $response = [
                'status' => 'success',
                'message' => 'Pedido creado correctamente',
                'order' => $order
            ];
        } catch (Exception | Error $e) {
            DB::rollback();

            $response = [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
        }

        $router->response($response);
    }

    public static function updateOrder(Router $router) {
        $data = $router->getData();
        $order = new Order($data);

        $order->setUpdatedAt(date('Y-m-d H:i:s'));

        try {
            DB::table('order')
                ->update($order->getData())
                ->where('id', '=', $order->getId())
                ->execute();

            $response = [
                'status' => 'success',
                'message' => 'Tratamiento actualizado correctamente',
                'order' => $data
            ];
        } catch (Exception | Error $e) {
            $response = [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
        }

        $router->response($response);
    }

    public static function deleteOrder(Router $router) {
        $data = $router->getData();

        if ($data['paid']) {
            $response = [
                'status' => 'error',
                'message' => 'No se puede eliminar un pedido pagado'
            ];
            $router->response($response);
            return;
        }

        try {
            DB::beginTransaction();

            DB::table('order')
                ->delete()
                ->where('id', '=', $data['id'])
                ->execute();

            DB::table('item')
                ->delete()
                ->where('orderId', '=', $data['id'])
                ->execute();

            foreach ($data['items'] as $item) {
                DB::table('options')
                    ->delete()
                    ->where('itemId', '=', $item['id'])
                    ->execute();

                DB::table('file')
                    ->delete()
                    ->where('itemId', '=', $item['id'])
                    ->execute();
            }

            DB::commit();

            foreach ($data['items'] as $item) {
                foreach ($item['files'] as $file) {
                    unlink('../uploads/files/' . $file['file']);
                    unlink('../uploads/images/' . $file['image']);
                }
            }

            $response = [
                'status' => 'success',
                'message' => 'Pedido eliminado correctamente',
            ];
        } catch (Exception | Error $e) {
            DB::rollback();

            $response = [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
        }

        $router->response($response);
    }

    public static function deleteOrders(Router $router) {
        $data = $router->getData();

        foreach ($data as $order) {
            if ($order['paid']) {
                $response = [
                    'status' => 'error',
                    'message' => 'No se puede eliminar un pedido pagado'
                ];
                $router->response($response);
                return;
            }
        }

        try {
            DB::beginTransaction();

            foreach ($data as $order) {
                DB::table('order')
                    ->delete()
                    ->where('id', '=', $order['id'])
                    ->execute();

                DB::table('item')
                    ->delete()
                    ->where('orderId', '=', $order['id'])
                    ->execute();

                foreach ($order['items'] as $item) {
                    DB::table('options')
                        ->delete()
                        ->where('itemId', '=', $item['id'])
                        ->execute();

                    DB::table('file')
                        ->delete()
                        ->where('itemId', '=', $item['id'])
                        ->execute();
                }
            }

            DB::commit();

            foreach ($data as $order) {
                foreach ($order['items'] as $item) {
                    foreach ($item['files'] as $file) {
                        unlink('../uploads/files/' . $file['file']);
                        unlink('../uploads/images/' . $file['image']);
                    }
                }
            }

            $response = [
                'status' => 'success',
                'message' => 'Pedido eliminado correctamente',
            ];
        } catch (Exception | Error $e) {
            DB::rollback();

            $response = [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
        }

        $router->response($response);
    }

    public static function generatePDF(Router $router) {
        $order = $router->getData();

        $invoice = new Invoice();

        $invoiceExists = DB::table('invoice')
            ->select()
            ->where('orderId', '=', $order['id'])
            ->limit(1)
            ->getOne();

        $invoice->setData($invoiceExists);

        $dompdf = new Dompdf();

        ob_start();
        include __DIR__ . "/../views/templates/invoice.php";
        $html = ob_get_contents();
        ob_end_clean();

        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();
        $output = $dompdf->output();

        $name = 'factura-lacopiadera-' . $invoice->getNumber() . '.pdf';

        $base64 = base64_encode($output);

        $response = [
            'status' => 'success',
            'message' => 'PDF generado correctamente',
            'base64' => $base64,
            'fileName' => $name
        ];

        $router->response($response);
    }

    public static function downloadFiles(Router $router) {
        $data = $router->getData();

        $order = DB::table('order')
            ->select()
            ->where('order.id', '=', $data['orderId'])
            ->limit(1)
            ->getOne();

        $files = DB::table('file')
            ->select()
            ->where('itemId', '=', $data['id'])
            ->get();

        $zip = new ZipArchive();

        $zipName = 'files-order-' . $order['number'] . '-item-' . $data['id'] . '.zip';

        $zip->open($zipName, ZipArchive::CREATE);
        foreach ($files as $file) {
            $zip->addFile('../uploads/files/' . $file['file'], $file['file']);
        }
        $zip->close();

        header('Content-Type: application/zip');
        header('Content-disposition: attachment; filename=' . $zipName);
        header('Content-Length: ' . filesize($zipName));
        readfile($zipName);

        unlink($zipName);
    }

    public static function downloadAllFiles(Router $router) {
        $data = $router->getData();

        $order = self::readOrder($data['id'])['order'];

        $zip = new ZipArchive();

        $zipName = 'files-order-' . $order['number'] . '.zip';

        $zip->open($zipName, ZipArchive::CREATE);
        foreach ($order['items'] as $item) {
            foreach ($item['files'] as $file) {
                $zip->addFile('../uploads/files/' . $file['file'], $file['file']);
            }
        }
        $zip->close();

        header('Content-Type: application/zip');
        header('Content-disposition: attachment; filename=' . $zipName);
        header('Content-Length: ' . filesize($zipName));
        readfile($zipName);

        unlink($zipName);
    }

    public static function updateNumber(Router $router) {
        $data = $router->getData();

        try {
            $orderExists = DB::table('order')
                ->select()
                ->where('id', '=', $data['id'])
                ->limit(1)
                ->getOne();

            $order = new Order($orderExists);

            $lastOrder = DB::table('order')
                ->select()
                ->orderBy('number', 'DESC')
                ->limit(1)
                ->getOne();

            $order->setNumber($lastOrder['number'] + 1);

            DB::table('order')
                ->update($order->getData())
                ->where('id', '=', $data['id'])
                ->execute();

            $order = self::readOrder($order->getId())['order'];

            $response = [
                'status' => 'success',
                'message' => 'Número de pedido actualizado correctamente',
                'order' => $order
            ];
        } catch (Exception | Error $e) {
            $response = [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
        }

        $router->response($response);
    }

    public static function getRedsysData(Router $router) {
        $data = $router->getData();

        $redsys = new RedsysAPI();

        $redsys->setParameter('DS_MERCHANT_AMOUNT', str_replace('.', '', $data['total']));
        $redsys->setParameter('DS_MERCHANT_ORDER', $data['number']);
        $redsys->setParameter('DS_MERCHANT_MERCHANTCODE', $_ENV['TPV_FUC']);
        $redsys->setParameter('DS_MERCHANT_CURRENCY', '978');
        $redsys->setParameter('DS_MERCHANT_TRANSACTIONTYPE', '0');
        $redsys->setParameter('DS_MERCHANT_TERMINAL', $_ENV['TPV_TERMINAL']);
        $redsys->setParameter('DS_MERCHANT_URLOK', $_ENV['DOMAIN'] . '/pago/');
        $redsys->setParameter('DS_MERCHANT_URLKO', $_ENV['DOMAIN'] . '/pago/');

        $version = "HMAC_SHA256_V1";
        $kc = $_ENV['TPV_KC'];

        $params = $redsys->createMerchantParameters();
        $signature = $redsys->createMerchantSignature($kc);

        $response = [
            'status' => 'success',
            'message' => 'Datos de redsys obtenidos correctamente',
            'data' => [
                "Ds_SignatureVersion" => $version,
                "Ds_MerchantParameters" => $params,
                "Ds_Signature" => $signature
            ],
            'prueba' => $redsys->decodeMerchantParameters($params)
        ];

        $router->response($response);
    }
}
