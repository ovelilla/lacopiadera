import LoadingButton from "./LoadingButton.js";
import { icons } from "../modules/Icons";

class Modal {
    constructor({
        title,
        customTitle,
        content,
        action,
        maxWidth,
        fullscreenButton,
        actionCallback,
        closeCallback,
        fullscreenCallback,
        customHeaderButtons,
    }) {
        this.title = title;
        this.customTitle = customTitle;
        this.content = content;
        this.action = action;
        this.maxWidth = maxWidth || null;
        this.fullscreenButton = fullscreenButton || false;
        this.actionCallback = actionCallback;
        this.closeCallback = closeCallback;
        this.fullscreenCallback = fullscreenCallback;
        this.customHeaderButtons = customHeaderButtons || [];

        this.isClose = false;
        this.isFullscreen = false;

        this.init();
    }

    async init() {
        this.modal = this.create();
        if (document.body.scrollHeight > document.body.clientHeight) {
            document.body.classList.add("noscroll");
        }
        document.body.appendChild(this.modal);
        this.modal.classList.add("fade-in");
        this.modal.firstChild.classList.add("slide-in-top");

        await this.animationend();
    }

    handleClose(e) {
        if (e.target === this.modal) {
            this.isClose = true;
        }
    }

    async close() {
        this.actionButton.stop();
        this.modal.classList.add("fade-out");
        this.modal.firstChild.classList.add("slide-out-top");
        await this.animationend(this.modal);
        this.modal.remove();
        if (!document.querySelector(".modal")) {
            document.body.classList.remove("noscroll");
        }
        if (this.closeCallback) {
            this.closeCallback();
        }
        delete this;
    }

    async animationend() {
        return new Promise((resolve) => {
            this.modal.addEventListener("animationend", resolve, { once: true });
        });
    }

    create() {
        const modal = document.createElement("div");
        modal.classList.add("modal");
        if (this.isFullscreen) {
            modal.classList.add("fullscreen");
        }
        modal.addEventListener("mousedown", this.handleClose.bind(this));
        modal.addEventListener("touchstart", this.handleClose.bind(this), { passive: true });
        modal.addEventListener("click", () => {
            if (this.isClose) {
                this.close();
            }
        });

        const content = document.createElement("div");
        content.classList.add("content");
        if (!this.isFullscreen) {
            content.style.maxWidth = this.maxWidth ? this.maxWidth : "";
        }
        content.addEventListener("click", (e) => e.stopPropagation());
        modal.appendChild(content);

        const header = document.createElement("div");
        header.classList.add("header");
        content.appendChild(header);

        if (this.customTitle) {
            header.appendChild(this.customTitle());
        } else {
            const title = document.createElement("div");
            title.classList.add("title");
            title.textContent = this.title;
            header.appendChild(title);
        }

        const actions = document.createElement("div");
        actions.classList.add("actions");
        header.appendChild(actions);

        this.customHeaderButtons.forEach((button) => {
            const btn = document.createElement("button");
            btn.setAttribute("aria-label", button.ariaLabel);
            btn.addEventListener("click", () => {
                button.callback();
            });
            actions.appendChild(btn);

            btn.appendChild(button.icon);
        });

        if (this.fullscreenButton) {
            const fullscreenBtn = document.createElement("button");
            fullscreenBtn.classList.add("fullscreen");
            fullscreenBtn.setAttribute("aria-label", "Pantalla completa");
            fullscreenBtn.addEventListener("click", () => {
                this.isFullscreen = !this.isFullscreen;

                if (this.isFullscreen) {
                    modal.classList.add("fullscreen");
                    content.removeAttribute("style");
                } else {
                    modal.classList.remove("fullscreen");
                    content.style.maxWidth = this.maxWidth ? this.maxWidth : "";
                }

                this.fullscreenCallback && this.fullscreenCallback();
            });
            actions.appendChild(fullscreenBtn);

            const fullscreenIcon = icons.get("arrowsFullscreen");
            fullscreenBtn.appendChild(fullscreenIcon);
        }

        const closeBtn = document.createElement("button");
        closeBtn.classList.add("close");
        closeBtn.setAttribute("aria-label", "Cerrar modal");
        closeBtn.addEventListener("click", () => {
            this.isClose = true;
            this.close();
        });
        actions.appendChild(closeBtn);

        const closeIcon = icons.get("xLg");
        closeBtn.appendChild(closeIcon);

        const svgClose = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svgClose.setAttribute("width", "16");
        svgClose.setAttribute("height", "16");
        svgClose.setAttribute("fill", "currentColor");
        svgClose.setAttribute("viewBox", "0 0 16 16");
        closeIcon.appendChild(svgClose);

        const pathClose1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
        pathClose1.setAttribute("fill-rule", "evenodd");
        pathClose1.setAttribute(
            "d",
            "M13.854 2.146a.5.5 0 0 1 0 .708l-11 11a.5.5 0 0 1-.708-.708l11-11a.5.5 0 0 1 .708 0Z"
        );
        svgClose.appendChild(pathClose1);

        const pathClose2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
        pathClose2.setAttribute("fill-rule", "evenodd");
        pathClose2.setAttribute(
            "d",
            "M2.146 2.146a.5.5 0 0 0 0 .708l11 11a.5.5 0 0 0 .708-.708l-11-11a.5.5 0 0 0-.708 0Z"
        );
        svgClose.appendChild(pathClose2);

        this.body = document.createElement("div");
        this.body.classList.add("body");
        this.body.appendChild(this.content);
        content.appendChild(this.body);

        const footer = document.createElement("div");
        footer.classList.add("footer");
        content.appendChild(footer);

        const closeButton = document.createElement("button");
        closeButton.classList.add("btn", "tertiary-btn");
        closeButton.setAttribute("aria-label", "Cerrar modal");
        closeButton.textContent = "Cerrar";
        closeButton.addEventListener("click", () => {
            this.isClose = true;
            this.close();
        });
        footer.appendChild(closeButton);

        this.actionButton = new LoadingButton({
            type: "button",
            text: this.action,
            ariaLabel: "Acción modal",
            classes: ["btn", "primary-btn"],
            onClick: this.actionCallback,
        });
        footer.appendChild(this.actionButton.get());

        return modal;
    }

    repaint(content) {
        this.content = content;
        this.modal.remove();
        this.modal = this.create();
        document.body.appendChild(this.modal);
    }
}

export default Modal;
