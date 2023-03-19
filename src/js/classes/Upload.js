import Confirm from "./Confirm";
import { tools } from "../modules/Tools";
import { navigator } from "../app";

class Upload {
    constructor({ cart, details, addresses, onUpload, onClick }) {
        this.cart = cart;
        this.details = details;
        this.addresses = addresses;

        this.onUpload = onUpload;
        this.onClick = onClick;

        this.xhr = null;

        this.isUpload = false;
        this.order = null;
    }

    create() {
        const uploadEl = document.createElement("div");
        uploadEl.classList.add("upload");

        const titleEl = document.createElement("div");
        titleEl.classList.add("title");
        titleEl.textContent = "Sube tus impresiones a nuestros servidores para continuar.";
        uploadEl.appendChild(titleEl);

        const progressEl = document.createElement("div");
        progressEl.classList.add("progress");
        uploadEl.appendChild(progressEl);

        const progressValueEl = document.createElement("div");
        progressValueEl.id = "progress";
        progressValueEl.classList.add("value");
        progressEl.appendChild(progressValueEl);

        const infoEl = document.createElement("div");
        infoEl.classList.add("info");
        uploadEl.appendChild(infoEl);

        const percentageEl = document.createElement("div");
        percentageEl.id = "percentage";
        percentageEl.classList.add("percentage");
        infoEl.appendChild(percentageEl);

        const bytesEl = document.createElement("div");
        bytesEl.id = "bytes";
        bytesEl.classList.add("bytes");
        infoEl.appendChild(bytesEl);

        const messageEl = document.createElement("div");
        messageEl.id = "message";
        messageEl.classList.add("message");
        uploadEl.appendChild(messageEl);

        const actionsEl = document.createElement("div");
        actionsEl.classList.add("actions");
        uploadEl.appendChild(actionsEl);

        const uploadBtnEl = document.createElement("button");
        uploadBtnEl.id = "upload-btn";
        uploadBtnEl.classList.add("btn", "primary-btn", "pulse");
        uploadBtnEl.ariaLabel = "Subir archivos";
        uploadBtnEl.textContent = "Subir impresiones";
        uploadBtnEl.addEventListener("click", this.handleUpload.bind(this));
        actionsEl.appendChild(uploadBtnEl);

        const cancelBtnEl = document.createElement("button");
        cancelBtnEl.id = "cancel-btn";
        cancelBtnEl.classList.add("btn", "secondary-btn", "hidden");
        cancelBtnEl.ariaLabel = "Cancelar subida";
        cancelBtnEl.textContent = "Cancelar";
        cancelBtnEl.addEventListener("click", this.handleCancel.bind(this));
        actionsEl.appendChild(cancelBtnEl);

        const paymentBtnEl = document.createElement("button");
        paymentBtnEl.id = "payment-btn";
        paymentBtnEl.classList.add("btn", "primary-btn", "pulse", "hidden");
        paymentBtnEl.ariaLabel = "Pagar";
        paymentBtnEl.textContent = "Pagar ahora";
        paymentBtnEl.addEventListener("click", () => {
            this.onClick(this.order);
        });
        actionsEl.appendChild(paymentBtnEl);

        return uploadEl;
    }

    async handleUpload() {
        this.xhr = new XMLHttpRequest();

        const data = new FormData();

        data.append("details", JSON.stringify(this.details.get()));
        data.append("shippingAddress", JSON.stringify(this.addresses.getSelectedShippingAddress()));
        data.append("billingAddress", JSON.stringify(this.addresses.getSelectedBillingAddress()));
        data.append("cart", JSON.stringify(this.cart.get()));

        this.cart.get().forEach((item, i) => {
            item.files.forEach((file, j) => {
                data.append(`${i}[]`, file.file);
            });
        });

        const result = await this.uploadFiles(data);

        if (result.status !== 200) {
            this.clear();
            return;
        }
    }

    handleCancel() {
        this.xhr.abort();
        this.clear();
    }

    async uploadFiles(data) {
        try {
            const url = "/api/order/create";
            const result = await this.request({ method: "POST", url, data, type: "json" });

            if (result.status === 200) {
                this.order = result.response.order;

                this.onUpload(result.response.order);
            }

            return result;
        } catch (error) {
            return error;
        }
    }

    request({ method, url, data, type }) {
        const self = this;

        return new Promise((resolve, reject) => {
            this.xhr.responseType = type;
            this.xhr.open(method, url);
            this.xhr.addEventListener("loadstart", loadstart);
            this.xhr.addEventListener("load", load);
            this.xhr.addEventListener("loadend", loadend);
            this.xhr.upload.addEventListener("progress", progress);
            this.xhr.addEventListener("error", error);
            this.xhr.addEventListener("abort", abort);
            this.xhr.send(data);

            function loadstart() {
                const message = document.querySelector("#message");
                const uploadBtn = document.querySelector("#upload-btn");
                const cancelBtn = document.querySelector("#cancel-btn");

                message.classList.add("active");
                message.textContent = "Por favor, espera mientras se suben tus archivos...";

                uploadBtn.classList.add("hidden");

                self.isUpload = true;

                navigator.setOnBeforeunload(async () => {
                    if (self.isUpload) {
                        const confirm = new Confirm({
                            title: "¿Cancelar subida?",
                            description: "Hay archivos subiéndose, ¿estás seguro de que deseas salir?",
                            accept: "Salir",
                            cancel: "Cancelar",
                        });
                        const confirmResponse = await confirm.question();

                        if (!confirmResponse) {
                            return false;
                        }

                        self.xhr.abort();
                        return true;
                    }
                });
            }

            function load() {
                if (this.status === 200) {
                    resolve({
                        status: this.status,
                        response: this.response,
                    });
                } else {
                    reject({ status: this.status });
                }
            }

            function loadend() {
                const percentage = document.querySelector("#percentage");
                const message = document.querySelector("#message");
                const uploadBtn = document.querySelector("#upload-btn");
                const cancelBtn = document.querySelector("#cancel-btn");
                const paymentBtn = document.querySelector("#payment-btn");

                percentage.textContent = "100%";
                if (this.status === 200) {
                    message.textContent = "¡Archivos subidos correctamente!";
                    paymentBtn.classList.remove("hidden");
                    return;
                }
                message.textContent = "Subida de archivos cancelada";
                uploadBtn.classList.remove("hidden");
            }

            function progress(e) {
                if (e.lengthComputable) {
                    const progress = document.querySelector("#progress");
                    const percentage = document.querySelector("#percentage");
                    const bytes = document.querySelector("#bytes");

                    const percentComplete = ((e.loaded / e.total) * 100).toFixed(2);

                    progress.style.width = `${percentComplete}%`;
                    percentage.textContent = `${percentComplete}% subido... por favor espera`;
                    bytes.textContent = `Subido ${tools.formatBytes(
                        e.loaded
                    )} de ${tools.formatBytes(e.total)}`;
                }
            }

            function error() {
                reject({ status: this.status });
            }

            function abort(e) {
                reject({ status: this.status });
            }
        });
    }

    clear() {
        const progress = document.querySelector("#progress");
        const percentage = document.querySelector("#percentage");
        const bytes = document.querySelector("#bytes");

        requestAnimationFrame(() => {
            progress.style.transition = "none";
            progress.style.width = 0;
            percentage.textContent = "";
            bytes.textContent = "";
            requestAnimationFrame(() => {
                progress.removeAttribute("style");
            });
        });
    }

    complete() {
        const progress = document.querySelector("#progress");
        const percentage = document.querySelector("#percentage");
        const bytes = document.querySelector("#bytes");
        const message = document.querySelector("#message");
        const uploadBtn = document.querySelector("#upload-btn");
        const cancelBtn = document.querySelector("#cancel-btn");
        const paymentBtn = document.querySelector("#payment-btn");

        progress.style.width = "100%";
        percentage.textContent = "100%";
        const size = this.cart.get().reduce((acc, item) => {
            return acc + item.resume.size;
        }, 0);
        bytes.textContent = `Subido ${tools.formatBytes(size)} de ${tools.formatBytes(size)}`;
        message.textContent = "¡Archivos subidos correctamente!";

        uploadBtn.classList.add("hidden");
        paymentBtn.classList.remove("hidden");
    }

    show() {
        const uploadContainer = document.querySelector("#upload");

        this.uploadEl = this.create();

        uploadContainer.appendChild(this.uploadEl);

        if (this.isUpload) {
            this.complete();
        }
    }

    repaint() {
        if (this.uploadEl) {
            this.uploadEl.remove();
        }

        this.show();
    }
}

export default Upload;
