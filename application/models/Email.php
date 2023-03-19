<?php

namespace Models;

use PHPMailer\PHPMailer\PHPMailer;

class Email {
    private string $domain;

    private string $mail_host;
    private string $mail_user;
    private string $mail_pass;
    private string $mail_port;

    private array $data;

    public function __construct($data) {
        $this->domain = $_ENV['DOMAIN'];

        $this->mail_host = $_ENV['MAIL_HOST'];
        $this->mail_user = $_ENV['MAIL_USER'];
        $this->mail_pass = $_ENV['MAIL_PASS'];
        $this->mail_port = $_ENV['MAIL_PORT'];

        $this->data = $data;
    }

    public function sendAcountConfirmation(): void {
        $mail = new PHPMailer();
        $mail->isSMTP();
        $mail->Host = $this->mail_host;
        $mail->Username = $this->mail_user;
        $mail->Password = $this->mail_pass;
        $mail->Port = $this->mail_port;
        $mail->SMTPAuth = true;
        // $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;

        $mail->setFrom('admin@lacopiadera.com', 'lacopiadera.com');
        $mail->addAddress($this->data['email'], $this->data['name']);
        $mail->addReplyTo('admin@lacopiadera.com', 'Admin');
        $mail->Subject = 'Confirma tu cuenta para compltar el registro';

        $mail->isHTML(true);
        $mail->CharSet = 'UTF-8';

        $title = 'Confirmar cuenta';

        ob_start();
        include __DIR__ . "/../views/templates/account-confirmation.php";
        $content = ob_get_contents();
        ob_end_clean();

        $mail->Body = $content;

        $mail->send();
    }

    public function sendRestorePassword(): void {
        $mail = new PHPMailer();
        $mail->isSMTP();
        $mail->Host = $this->mail_host;
        $mail->Username = $this->mail_user;
        $mail->Password = $this->mail_pass;
        $mail->Port = $this->mail_port;
        $mail->SMTPAuth = true;
        // $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;

        $mail->setFrom('admin@lacopiadera.com', 'lacopiadera.com');
        $mail->addAddress($this->data['email'], $this->data['name']);
        $mail->addReplyTo('admin@lacopiadera.com', 'Admin');
        $mail->Subject = 'Instrucciones para restablecer tu contraseña';

        $mail->isHTML(true);
        $mail->CharSet = 'UTF-8';

        $title = 'Restablecer contraseña';

        ob_start();
        include __DIR__ . "/../views/templates/restore-password.php";
        $content = ob_get_contents();
        ob_end_clean();

        $mail->Body = $content;

        $mail->send();
    }

    public function sendContactMessage(): void {
        $mail = new PHPMailer();
        $mail->isSMTP();
        $mail->Host = $this->mail_host;
        $mail->Username = $this->mail_user;
        $mail->Password = $this->mail_pass;
        $mail->Port = $this->mail_port;
        $mail->SMTPAuth = true;
        // $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;

        $mail->setFrom('admin@lacopiadera.com', 'lacopiadera.com');
        $mail->addAddress('admin@lacopiadera.com', 'lacopiadera.com');
        $mail->addReplyTo($this->data['email'], $this->data['name']);
        $mail->Subject = 'Mensaje de contacto desde la web';

        $mail->isHTML(true);
        $mail->CharSet = 'UTF-8';

        $title = 'Mensaje de contacto desde la web';

        ob_start();
        include __DIR__ . "/../views/templates/contact.php";
        $content = ob_get_contents();
        ob_end_clean();
        
        $mail->Body = $content;

        $mail->send();
    }

    public function sendOrderConfirmation(): void {
        $mail = new PHPMailer();
        $mail->isSMTP();
        $mail->Host = $this->mail_host;
        $mail->Username = $this->mail_user;
        $mail->Password = $this->mail_pass;
        $mail->Port = $this->mail_port;
        $mail->SMTPAuth = true;
        // $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;

        $mail->setFrom('admin@lacopiadera.com', 'lacopiadera.com');
        $mail->addAddress($this->data['email'], $this->data['name']);
        $mail->addReplyTo('admin@lacopiadera.com', 'Admin');
        $mail->Subject = 'Confiramción de pedido';
        $mail->addStringAttachment($this->data['invoice']['pdf'], 'factura-lacopiadera-' . $this->data['invoice']['number'] . '.pdf');

        $mail->isHTML(true);
        $mail->CharSet = 'UTF-8';

        $title = 'Confiramción de pedido';

        ob_start();
        include __DIR__ . "/../views/templates/order-confirmation.php";
        $content = ob_get_contents();
        ob_end_clean();
        
        $mail->Body = $content;

        $mail->send();
    }

    public function sendNoticeToAdmin(): void {
        $mail = new PHPMailer();
        $mail->isSMTP();
        $mail->Host = $this->mail_host;
        $mail->Username = $this->mail_user;
        $mail->Password = $this->mail_pass;
        $mail->Port = $this->mail_port;
        $mail->SMTPAuth = true;
        // $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;

        $mail->setFrom('admin@lacopiadera.com', 'lacopiadera.com');
        $mail->addAddress('admin@lacopiadera.com', 'lacopiadera.com');
        $mail->addReplyTo('admin@lacopiadera.com', 'Admin');
        $mail->Subject = 'Nuevo pedido recibido';
        $mail->addStringAttachment($this->data['invoice']['pdf'], 'factura-lacopiadera-' . $this->data['invoice']['number'] . '.pdf');

        $mail->isHTML(true);
        $mail->CharSet = 'UTF-8';

        $title = 'Nuevo pedido recibido';

        ob_start();
        include __DIR__ . "/../views/templates/order-notice.php";
        $content = ob_get_contents();
        ob_end_clean();
        
        $mail->Body = $content;

        $mail->send();
    }
}
