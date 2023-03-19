class Loader {
    constructor(data) {
        Object.assign(this, data);
    }

    async open() {
        this.loader = this.create();
        this.parent.appendChild(this.loader);
        await this.animationend(this.loader);
    }

    async close() {
        this.loader.classList.add("out");
        await this.animationend(this.loader);
        this.loader.remove();
        delete this;
    }

    create() {
        const loader = document.createElement("div");
        loader.classList.add("loader");

        const spinner = document.createElement("div");
        spinner.classList.add("spinner");
        loader.appendChild(spinner);

        for (let i = 1; i < 6; i++) {
            const rect = document.createElement("div");
            rect.classList.add(`rect${i}`);
            spinner.appendChild(rect);
        }

        return loader;
    }

    animationend(target) {
        return new Promise((resolve) => {
            target.addEventListener("animationend", resolve, { once: true });
        });
    }

    timeout(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export default Loader;
