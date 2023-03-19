import Popup from "./Popup";

class Drop {
    constructor(data) {
        Object.assign(this, data);

        this.init();
    }

    init() {
        const droparea = document.querySelector("#droparea");
        const dropmask = document.querySelector("#dropmask");

        droparea.addEventListener("dragenter", this.dropareaDragenter.bind(this));
        dropmask.addEventListener("dragenter", this.dropmaskDragenter.bind(this));
        dropmask.addEventListener("dragleave", this.dropmaskDragleave.bind(this));
        dropmask.addEventListener('dragover', this.dropmaskDragover.bind(this));
        dropmask.addEventListener("drop", this.dropmaskDrop.bind(this));

        this.animationend = this.animationend.bind(this);
    }

    dropareaDragenter(e) {
        e.preventDefault();
        e.stopPropagation();

        this.open();
    }

    dropmaskDragenter(e) {
        e.preventDefault();
        e.stopPropagation();

        const dropmask = document.querySelector("#dropmask");
        dropmask.classList.remove("out");
        dropmask.removeEventListener("animationend", this.animationend, { once: true });
    }

    dropmaskDragleave(e) {
        e.preventDefault();
        e.stopPropagation();

        this.close();
    }

    dropmaskDragover(e) {
        e.preventDefault();
        e.stopPropagation();

        this.open();
    }

    async dropmaskDrop(e) {
        e.preventDefault();
        e.stopPropagation();

        this.close();

        const files = e.dataTransfer.files;

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

        this.onDrop(files);
    }

    async open() {
        const dropmask = document.querySelector("#dropmask");
        dropmask.classList.add("active", "in");
    }

    async close() {
        const dropmask = document.querySelector("#dropmask");
        dropmask.classList.add("out");
        dropmask.addEventListener("animationend", this.animationend, { once: true });
    }

    animationend() {
        const dropmask = document.querySelector("#dropmask");
        dropmask.classList.remove("active", "in", "out");
    }

    isValidFileType(files) {
        return Array.from(files).every((file) => file.type === "application/pdf");
    }
}

export default Drop;
