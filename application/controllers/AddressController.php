<?php

namespace Controllers;

use Models\Router;
use Models\DB;
use Models\User;
use Models\Profile;
use Models\Address;

use Exception;
use Error;

class AddressController {
    public static function readAddresses(Router $router) {
        $id = $router->session()->get('id');

        try {
            $addresses = DB::table('address')
                ->select()
                ->where('userId', '=', $id)
                ->get();


            $response = [
                'status' => 'success',
                'message' => 'Direcciones leídas correctamente',
                'addresses' => $addresses
            ];
        } catch (Exception | Error $e) {
            $response = [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
        }

        $router->response($response);
    }

    public static function createFirstAddress(Router $router) {
        $data = $router->getData();

        $address = new Address($data);

        $errors = $address->validate();

        if (!empty($errors)) {
            $response = [
                'status' => 'error',
                'errors' => $errors
            ];

            $router->response($response);
            return;
        }

        $id = $router->session()->get('id');
        $address->setUserId($id);
        $address->setType('shipping');
        $address->setPredetermined(1);
        $address->setCreatedAt(date('Y-m-d H:i:s'));
        $address->setUpdatedAt(date('Y-m-d H:i:s'));

        try {
            DB::table('address')
                ->insert($address->getData())
                ->execute();

            $address->setType('billing');

            DB::table('address')
                ->insert($address->getData())
                ->execute();

            $addresses = DB::table('address')
                ->select()
                ->where('userId', '=', $address->getUserId())
                ->get();

            $response = [
                'status' => 'success',
                'message' => 'Direcciones creadas correctamente',
                'addresses' => $addresses
            ];
        } catch (Exception | Error $e) {
            $response = [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
        }

        $router->response($response);
    }

    public static function createAddress(Router $router) {
        $data = $router->getData();

        $address = new Address($data);

        $errors = $address->validate();

        if (!empty($errors)) {
            $response = [
                'status' => 'error',
                'errors' => $errors
            ];

            $router->response($response);
            return;
        }

        $id = $router->session()->get('id');

        $address->setUserId($id);
        $address->setCreatedAt(date('Y-m-d H:i:s'));
        $address->setUpdatedAt(date('Y-m-d H:i:s'));

        try {
            DB::beginTransaction();

            if ($address->getPredetermined()) {
                DB::table('address')
                    ->update(['predetermined' => 0])
                    ->where('userId', '=', $address->getUserId())
                    ->andWhere('type', '=', $address->getType())
                    ->execute();
            }

            DB::table('address')
                ->insert($address->getData())
                ->execute();

            DB::commit();

            $addresses = DB::table('address')
                ->select()
                ->where('userId', '=', $address->getUserId())
                ->get();

            $response = [
                'status' => 'success',
                'message' => 'Dirección creada correctamente',
                'addresses' => $addresses
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

    public static function updateAddress(Router $router) {
        $data = $router->getData();

        $address = new Address($data);

        $errors = $address->validate();

        if (!empty($errors)) {
            $response = [
                'status' => 'error',
                'errors' => $errors
            ];

            $router->response($response);
            return;
        }

        $addressExists = DB::table('address')
            ->select()
            ->where('id', '=', $address->getId())
            ->limit(1)
            ->getOne();

        if ($addressExists['predetermined'] && $address->getPredetermined() == 0) {
            $response = [
                'status' => 'error',
                'message' => 'No se puede despredeterminar una dirección predeterminada. Primero cree o predetermina otra dirección.'
            ];

            $router->response($response);
            return;
        }

        $address->setUpdatedAt(date('Y-m-d H:i:s'));

        try {
            DB::beginTransaction();

            if ($address->getPredetermined()) {
                DB::table('address')
                    ->update(['predetermined' => 0])
                    ->where('userId', '=', $address->getUserId())
                    ->andWhere('type', '=', $address->getType())
                    ->execute();
            }

            DB::table('address')
                ->update($address->getData())
                ->where('id', '=', $address->getId())
                ->execute();

            DB::commit();

            $addresses = DB::table('address')
                ->select()
                ->where('userId', '=', $address->getUserId())
                ->get();

            $response = [
                'status' => 'success',
                'message' => 'Dirección creada correctamente',
                'addresses' => $addresses
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

    public static function deleteAddress(Router $router) {
        $data = $router->getData();

        $address = new Address($data);

        if ($address->getPredetermined()) {
            $response = [
                'status' => 'error',
                'message' => 'No se puede eliminar una dirección predeterminada. Cree otra dirección o cambie la predeterminada'
            ];

            $router->response($response);
            return;
        }

        try {
            DB::table('address')
                ->delete()
                ->where('id', '=', $address->getId())
                ->execute();

            $addresses = DB::table('address')
                ->select()
                ->where('userId', '=', $address->getUserId())
                ->get();

            $response = [
                'status' => 'success',
                'message' => 'Dirección creada correctamente',
                'addresses' => $addresses
            ];
        } catch (Exception | Error $e) {
            $response = [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
        }

        $router->response($response);
    }
}
