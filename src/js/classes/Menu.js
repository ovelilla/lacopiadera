class Menu {
    constructor(data) {
        Object.assign(this, data);

        this.isOpen = false;
        this.isClose = false;

        this.init();
    }

    init() {
        window.addEventListener("resize", () => {
            if (this.isOpen) {
                this.position();
            }
        });
        window.addEventListener("scroll", () => {
            if (this.isOpen) {
                this.position();
            }
        });
        this.target.addEventListener("click", () => {
            if (this.isOpen) {
                this.close();
            } else {
                this.open();
            }
        });
    }

    open() {
        this.isOpen = true;
        this.create();
        document.body.appendChild(this.menu);
        this.position();
        this.menu.classList.add("in");
    }

    async close() {
        this.isOpen = false;
        this.menu.classList.add("out");
        await this.animationend(this.menu);
        this.menu.remove();
    }

    create() {
        this.menu = document.createElement("div");
        this.menu.classList.add("mio-menu");
        this.menu.addEventListener("mousedown", this.handleClose.bind(this));
        this.menu.addEventListener("touchstart", this.handleClose.bind(this), { passive: true });
        this.menu.addEventListener("click", () => {
            if (this.isClose) {
                this.close();
            }
        });

        const content = document.createElement("div");
        content.classList.add("content");
        content.addEventListener("click", (e) => e.stopPropagation());
        this.menu.appendChild(content);

        this.items.forEach((item) => {
            if (item.type === "button") {
                const button = document.createElement("button");
                button.type = "button";
                button.ariaLabel = item.ariaLabel;
                button.classList.add("item");
                button.addEventListener("click", (e) => {
                    item.onClick(e);
                    this.close();
                });
                content.appendChild(button);

                if (item.icon) {
                    button.appendChild(item.icon);
                }

                const span = document.createElement("span");
                span.textContent = item.text;
                button.appendChild(span);
            }

            if (item.type === "anchor") {
            }
        });
    }

    position() {
        const rect = this.target.getBoundingClientRect();

        if (
            rect.top + this.menu.firstChild.offsetHeight + this.target.offsetHeight >
            window.innerHeight
        ) {
            this.menu.firstChild.style.top = `${rect.top - this.menu.firstChild.offsetHeight}px`;
        } else {
            this.menu.firstChild.style.top = `${rect.top + this.target.offsetHeight}px`;
        }

        this.menu.firstChild.style.left = `${
            rect.left - this.menu.firstChild.offsetWidth + this.target.offsetWidth
        }px`;
    }

    handleClose(e) {
        if (e.target === this.menu) {
            this.isClose = true;
        }
    }

    async animationend(target) {
        return new Promise((resolve) => {
            target.addEventListener("animationend", resolve, { once: true });
        });
    }
}

export default Menu;
