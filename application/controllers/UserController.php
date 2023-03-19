<?php

namespace Controllers;

use Models\Router;
use Models\DB;
use Models\User;
use Models\Profile;
use Models\Email;

use Exception;
use Error;

class UserController {
    public static function login(Router $router) {
        $auth = $router->session()->get('auth');
        $data = $router->getData();

        if ($auth) {
            $response = [
                'status' => 'error',
                'message' => 'Already logged in'
            ];
            $router->response($response);
            return;
        }

        $user = new User($data);

        $errors = $user->validateLogin();

        if (!empty($errors)) {
            $response = [
                'status' => 'error',
                'errors' => $errors
            ];

            $router->response($response);
            return;
        }

        try {
            $userExists = DB::table('user')
                ->select()
                ->where('email', '=', $user->getEmail())
                ->limit(1)
                ->getOne();

            if (!$userExists) {
                $user->setError('email', 'El usuario no existe');
                $errors = $user->getErrors();

                $response = [
                    'status' => 'error',
                    'errors' => $errors
                ];

                $router->response($response);
                return;
            }

            $user->setData($userExists);

            if (!$user->checkPassword()) {
                $user->setError('currentPassword', 'Password incorrecto');
                $errors = $user->getErrors();

                $response = [
                    'status' => 'error',
                    'errors' => $errors
                ];

                $router->response($response);
                return;
            }

            if (!$user->getConfirmed()) {
                $user->setError('email', 'El usuario no esta confirmado');
                $errors = $user->getErrors();

                $response = [
                    'status' => 'error',
                    'errors' => $errors
                ];

                $router->response($response);
                return;
            }

            $profileData = DB::table('profile')
                ->select()
                ->where('userId', '=', $user->getId())
                ->limit(1)
                ->getOne();

            $profile = new Profile($profileData);

            $router->session()->set('id', $user->getId());
            $router->session()->set('email', $user->getEmail());
            $router->session()->set('admin', $user->getAdmin());
            $router->session()->set('name', $profile->getName());
            $router->session()->set('auth', true);

            $response = [
                'status' => 'success',
                'message' => 'Sesión iniciada correctamente',
                'user' => [
                    'id' => $user->getId(),
                    'email' => $user->getEmail(),
                    'name' => $profile->getName()
                ]
            ];
        } catch (Exception | Error $e) {
            $response = [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
        }

        $router->response($response);
    }

    public static function register(Router $router) {
        $data = $router->getData();

        $user = new User($data);
        $profile = new Profile($data);

        $errorsUser = $user->validateRegister();
        $errorsProfile = $profile->validate();

        $errors = array_merge($errorsUser, $errorsProfile);

        if (!empty($errors)) {
            $response = [
                'status' => 'error',
                'errors' => $errors
            ];

            $router->response($response);
            return;
        }

        try {
            $userExists = DB::table('user')
                ->select()
                ->where('email', '=', $user->getEmail())
                ->limit(1)
                ->getOne();

            if ($userExists) {
                $user->setError('email', 'El usuario ya está registrado');
                $errors = $user->getErrors();

                $response = [
                    'status' => 'error',
                    'errors' => $errors
                ];

                $router->response($response);
                return;
            }

            $user->hashPassword();
            $user->createToken();
            $user->setConfirmed(0);
            $user->setCreatedAt(date('Y-m-d H:i:s'));
            $user->setUpdatedAt(date('Y-m-d H:i:s'));

            $insertUserData = DB::table('user')
                ->insert($user->getData())
                ->execute();

            $profile->setUserId($insertUserData['insert_id']);
            $profile->setCreatedAt(date('Y-m-d H:i:s'));
            $profile->setUpdatedAt(date('Y-m-d H:i:s'));

            $insertProfileData = DB::table('profile')
                ->insert($profile->getData())
                ->execute();

            $profile->setId($insertProfileData['insert_id']);

            $emailData = [
                'email' => $user->getEmail(),
                'token' => $user->getToken(),
                'name' => $profile->getName()
            ];

            $email = new Email($emailData);
            $email->sendAcountConfirmation();

            $response = [
                'status' => 'success',
                'message' => 'Usuario registrado correctamente'
            ];
        } catch (Exception | Error $e) {
            $response = [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
        }

        $router->response($response);
    }

    public static function confirm(Router $router) {
        $data = $router->getData();

        try {
            $user = new User($data);

            $userExists = DB::table('user')
                ->select()
                ->where('token', '=', $user->getToken())
                ->limit(1)
                ->getOne();

            if (!$userExists) {
                $user->setError('token', 'Token no válido');
                $errors = $user->getErrors();

                $response = [
                    'status' => 'error',
                    'errors' => $errors
                ];

                $router->response($response);
                return;
            }

            $user->setData($userExists);
            $user->setConfirmed(1);
            $user->setToken('');
            $user->setUpdatedAt(date('Y-m-d H:i:s'));

            DB::table('user')
                ->update($user->getData())
                ->where('id', '=', $user->getId())
                ->execute();

            $response = [
                'status' => 'success',
                'message' => 'Usuario confirmado correctamente'
            ];
        } catch (Exception | Error $e) {
            $response = [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
        }

        $router->response($response);
    }

    public static function recover(Router $router) {
        $data = $router->getData();

        $user = new User($data);

        $errors = $user->validateRecover();

        if (!empty($errors)) {
            $response = [
                'status' => 'error',
                'errors' => $errors
            ];

            $router->response($response);
            return;
        }

        try {
            $userExists = DB::table('user')
                ->select()
                ->where('email', '=', $user->getEmail())
                ->limit(1)
                ->getOne();

            if (!$userExists) {
                $user->setError('email', 'El usuario no existe');
                $errors = $user->getErrors();

                $response = [
                    'status' => 'error',
                    'user' => $user,
                    'errors' => $errors
                ];

                $router->response($response);
                return;
            }

            $user->setData($userExists);

            if (!$user->getConfirmed()) {
                $user->setError('email', 'El usuario no esta confirmado');
                $errors = $user->getErrors();

                $response = [
                    'status' => 'error',
                    'errors' => $errors
                ];

                $router->response($response);
                return;
            }

            $user->createToken();
            $user->setUpdatedAt(date('Y-m-d H:i:s'));

            DB::table('user')
                ->update($user->getData())
                ->where('id', '=', $user->getId())
                ->execute();

            $profileExists = DB::table('profile')
                ->select()
                ->where('userId', '=', $user->getId())
                ->limit(1)
                ->getOne();

            $profile = new Profile($profileExists);

            $emailData = [
                'email' => $user->getEmail(),
                'token' => $user->getToken(),
                'name' => $profile->getName()
            ];

            $email = new Email($emailData);
            $email->sendRestorePassword();

            $response = [
                'status' => 'success',
                'message' => 'Email enviado correctamente'
            ];
        } catch (Exception | Error $e) {
            $response = [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
        }

        $router->response($response);
    }

    public static function restore(Router $router) {
        $data = $router->getData();

        $user = new User($data);

        $errors = $user->validateRestore();

        if (!empty($errors)) {
            $response = [
                'status' => 'error',
                'user' => $user,
                'errors' => $errors
            ];

            $router->response($response);
            return;
        }

        try {
            $userExists = DB::table('user')
                ->select()
                ->where('token', '=', $user->getToken())
                ->limit(1)
                ->getOne();

            if (!$userExists) {
                $user->setError('newPassword', 'Token no válido');
                $errors = $user->getErrors();

                $response = [
                    'status' => 'error',
                    'errors' => $errors
                ];

                $router->response($response);
                return;
            }

            $user->setData($userExists);
            $user->hashPassword();
            $user->setToken('');
            $user->setUpdatedAt(date('Y-m-d H:i:s'));

            DB::table('user')
                ->update($user->getData())
                ->where('id', '=', $user->getId())
                ->execute();

            $response = [
                'status' => 'success',
                'message' => '¡Contraseña restablecida correctamente!',
            ];
        } catch (Exception | Error $e) {
            $response = [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
        }

        $router->response($response);
    }

    public static function readProfile(Router $router) {
        $id = $router->session()->get('id');

        try {
            $user = DB::table('user')
                ->select('email')
                ->where('id', '=', $id)
                ->limit(1)
                ->getOne();

            $profile = DB::table('profile')
                ->select()
                ->where('userId', '=', $id)
                ->limit(1)
                ->getOne();

            $response = [
                'status' => 'success',
                'message' => 'Perfil leído correctamente',
                'user' => $user,
                'profile' => $profile
            ];
        } catch (Exception | Error $e) {
            $response = [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
        }

        $router->response($response);
    }

    public static function updateProfile(Router $router) {
        $data = $router->getData();

        $id = $router->session()->get('id');

        $user = new User($data);
        $profile = new Profile($data);

        $userErrors = $user->validateProfile();
        $profileErrors = $profile->validate();

        $errors = array_merge($userErrors, $profileErrors);

        if (!empty($errors)) {
            $response = [
                'status' => 'error',
                'errors' => $errors
            ];

            $router->response($response);
            return;
        }

        try {
            $userExists = DB::table('user')
                ->select()
                ->where('id', '=', $id)
                ->limit(1)
                ->getOne();

            $user->setData($userExists);
            $user->setEmail($data['email']);
            $user->setUpdatedAt(date('Y-m-d H:i:s'));

            DB::table('user')
                ->update($user->getData())
                ->where('id', '=', $id)
                ->execute();

            $profileExists = DB::table('profile')
                ->select()
                ->where('userId', '=', $id)
                ->limit(1)
                ->getOne();

            $profile->setUserId($profileExists['id']);
            $profile->setCreatedAt($profileExists['createdAt']);
            $profile->setUpdatedAt(date('Y-m-d H:i:s'));

            DB::table('profile')
                ->update($profile->getData())
                ->where('userId', '=', $id)
                ->execute();

            $router->session()->set('email', $user->getEmail());
            $router->session()->set('name', $profile->getName());

            $response = [
                'status' => 'success',
                'message' => 'Perfil actualizado correctamente'
            ];
        } catch (Exception | Error $e) {
            $response = [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
        }

        $router->response($response);
    }

    public static function getAuth(Router $router) {
        $auth = $router->session()->get('auth');

        $response = [
            'status' => 'success',
            'auth' => $auth
        ];

        $router->response($response);
    }
}
