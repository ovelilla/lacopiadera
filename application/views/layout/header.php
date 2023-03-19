<header class="main-header <?php echo $page === 'home' || $page === 'contact' || $page === 'error' ? 'home' : '' ?>">
    <div class="container">
        <div class="logo">
            <a href="/">LaCopiadera</a>
        </div>

        <nav class="menu">
            <a href="/">Inicio</a>
            <a href="/imprimir">Imprimir</a>
            <a href="/contacto">Contacto</a>
        </nav>

        <div class="actions">
            <button id="cart-panel-btn" class="cart-panel-btn" aria-label="Menú carrito">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M0 2.5A.5.5 0 0 1 .5 2H2a.5.5 0 0 1 .485.379L2.89 4H14.5a.5.5 0 0 1 .485.621l-1.5 6A.5.5 0 0 1 13 11H4a.5.5 0 0 1-.485-.379L1.61 3H.5a.5.5 0 0 1-.5-.5zM3.14 5l1.25 5h8.22l1.25-5H3.14zM5 13a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0zm9-1a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0z" />
                </svg>

                <div class="units">0</div>
            </button>

            <button id="user-panel-btn" class="user-panel-btn" aria-label="Menú usuario">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                    <path fill-rule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z" />
                </svg>
            </button>

            <button id="hamburguer-btn" class="hamburguer-btn" aria-label="Menú hamburguesa">
                <span></span>
                <span></span>
                <span></span>
            </button>
        </div>
    </div>
</header>