<main class="checkout">
    <div id="checkout" class="content">
        <div id="steps"></div>

        <div class="payment">
            <?php if ($payment) : ?>
                <div class="icon">
                    <div class="circle success">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z" />
                        </svg>
                    </div>
                </div>

                <h2 class="title success">¡Pago exitoso!</h2>

                <p class="subtitle">Número de pedido: <?php echo $order['number'] ?></p>

                <hr>

                <div class="message">
                    <p>Te hemos enviado un email con los detalles y la factura de tu pedido.</p>
                </div>

                <?php
                $formatCurrency = new NumberFormatter('es_ES',  NumberFormatter::CURRENCY);
                $formatDate = new DateTime($order['updatedAt']);
                ?>

                <div class="transaction">
                    <div class="line">
                        <p class="label">Número de pedido</p>
                        <p class="value"><?php echo $order['number'] ?></p>
                    </div>

                    <div class="line">
                        <p class="label">Fecha transacción</p>
                        <p class="value"><?php echo $formatDate->format('d/m/Y H:i'), PHP_EOL ?></p>
                    </div>

                    <div class="line">
                        <p class="label">Total pagado</p>
                        <p class="value"><?php echo $formatCurrency->formatCurrency($order['total'], 'EUR'), PHP_EOL ?></p>
                    </div>
                </div>

                <div class="action">
                    <a href="/pedidos" class="btn primary-btn">Continuar</a>
                </div>
            <?php else : ?>
                <div class="icon">
                    <div class="circle error">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M7.005 3.1a1 1 0 1 1 1.99 0l-.388 6.35a.61.61 0 0 1-1.214 0L7.005 3.1ZM7 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z" />
                        </svg>
                    </div>
                </div>

                <h2 class="title error">¡Pago rechazado!</h2>

                <p class="subtitle"><?php echo $error ?></p>

                <hr>

                <div class="message">
                    <p>Por favor, intente el pago de nuevo desde la sección pedidos de su área personal.</p>
                </div>

                <div class="action">
                    <a href="/pedidos" class="btn primary-btn">Ir a pedidos</a>
                </div>
            <?php endif ?>
        </div>
    </div>
</main>