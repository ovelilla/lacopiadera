<main id="print" class="print">
    <div id="droparea" class="droparea">
        <div id="dropmask" class="dropmask">
            <div class="message">¡Suéltalo!</div>
        </div>

        <form class="files-form">
            <label for="files">
                <figure>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="17" fill="currentColor" viewBox="0 0 20 17">
                        <path d="M10 0l-5.2 4.9h3.3v5.1h3.8v-5.1h3.3l-5.2-4.9zm9.3 11.5l-3.2-2.1h-2l3.4 2.6h-3.5c-.1 0-.2.1-.2.1l-.8 2.3h-6l-.8-2.2c-.1-.1-.1-.2-.2-.2h-3.6l3.4-2.6h-2l-3.2 2.1c-.4.3-.7 1-.6 1.5l.6 3.1c.1.5.7.9 1.2.9h16.3c.6 0 1.1-.4 1.3-.9l.6-3.1c.1-.5-.2-1.2-.7-1.5z"></path>
                    </svg>
                </figure>
                <span>Selecciona o arrastra PDF...</span>
            </label>

            <input type="file" name="files" id="files" accept="application/pdf" multiple>
        </form>

        <div id="files-area" class="files-area"></div>

        <div class="actions">
            <button id="cancel-edition-btn" class="btn tertiary-btn hidden" aria-label="Cancelar edición">
                <span>Cancelar</span>

                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                </svg>
            </button>

            <button id="open-options-btn" class="btn primary-btn pulse" aria-label="Abrir opciones">
                <span>Siguiente</span>

                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8z" />
                </svg>
            </button>
        </div>
    </div>

    <div id="options-sidebar" class="options-sidebar">
        <div class="container">
            <button id="close-options-btn" class="close-options-btn" aria-label="Volver atras">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z" />
                </svg>
            </button>

            <div class="title">Opciones</div>

            <div class="info">A continuación puedes modificar las diferentes opciones de impresión.</div>

            <div id="options" class="options mio-form"></div>
        </div>
    </div>

</main>