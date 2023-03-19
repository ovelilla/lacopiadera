import Popup from "./Popup";

class InputFiles {
    constructor(data) {
        Object.assign(this, data);

        this.init();
    }

    init() {
        const input = document.querySelector("#files");

        input.addEventListener("input", this.handleInput.bind(this));
    }

    handleInput(e) {
        const files = e.target.files;

        if (files.length === 0) {
            return;
        }

        if (!this.isValidFileType(files)) {
            const popup = new Popup({
                title: "¡Error de subida!",
                message:
                    "Lo sentimos, el tipo de archivo no está soportado. Solo se permiten archivos PDF.",
                type: "error",
                timer: 3000,
            });
            popup.open();
            return;
        }

        this.onInput(files);
    }

    isValidFileType(files) {
        return Array.from(files).every((file) => file.type === "application/pdf");
    }

    clear() {
        const input = document.querySelector("#files");
        input.value = "";
    }
}

export default InputFiles;
