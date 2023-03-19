<main class="user-area">
    <?php include_once __DIR__  . '/../components/user-sidebar.php' ?>

    <div class="content">
        <div class="header">
            <button id="open-user-sidebar-btn" class="open" aria-label="Abrir sidebar usuario">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z" />
                </svg>
            </button>

            <div class="title">Códigos promocionales</div>
        </div>

        <div id="codes" class="wrapper"></div>
    </div>
</main>