class Collapse {
    constructor(data) {
        Object.assign(this, data);

        this.type = data.collapsed;

        this.start = false;

        if (this.target) {
            this.target.addEventListener("click", this.toggle.bind(this));
        }

        this.container.classList.add("collapse");

        if (this.collapsed) {
            this.collapse();
        } else {
            this.expand();
        }
    }

    async toggle() {
        this.target.classList.toggle("active");

        if (this.collapsed) {
            this.collapsed = false;
            await this.expandEl();
            this.container.classList.add("auto", "overflow");
            this.container.removeAttribute("style");
        } else {
            this.collapsed = true;
            this.container.classList.remove("overflow");
            await this.collapseEl();
            this.container.classList.remove("auto");
            this.container.removeAttribute("style");
        }
    }

    async expand() {
        this.target.classList.add("active");
        this.container.style.transition = "none";
        this.container.style.height = this.container.scrollHeight + "px";
        this.container.classList.add("auto", "overflow");
        this.container.removeAttribute("style");
    }

    async collapse() {
        // this.target.classList.remove("active");
        // this.container.classList.remove("overflow");
        this.container.style.height = 0 + "px";
        // await this.collapseEl();
        // this.container.classList.remove("auto");
    }

    async expandEl() {
        return new Promise((resolve) => {
            this.container.style.height = this.container.scrollHeight + "px";
            this.container.addEventListener("transitionend", resolve, { once: true });
        });
    }

    async collapseEl() {
        return new Promise((resolve) => {
            requestAnimationFrame(() => {
                this.container.style.height = this.container.scrollHeight + "px";
                requestAnimationFrame(() => {
                    this.container.style.height = 0 + "px";
                });
            });
            this.container.addEventListener("transitionend", resolve, { once: true });
        });
    }
}

export default Collapse;
