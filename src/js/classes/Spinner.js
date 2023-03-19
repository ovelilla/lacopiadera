class Spinner {
    constructor(data) {
        Object.assign(this, data);
    }

    async open() {
        this.spinner = this.create();
        this.parent.appendChild(this.spinner);
        await this.animationend(this.spinner);
    }

    async close() {
        this.spinner.classList.add('out');
        await this.animationend(this.spinner);
        this.spinner.remove();
        delete this;
    }

   create() {
        const spinner = document.createElement('div');
        spinner.classList.add('sk-spinner');

        const skChase = document.createElement('div');
        skChase.classList.add('sk-chase');
        spinner.appendChild(skChase);

        for (let i = 0; i < 6; i++) {
            const dot = document.createElement('div');
            dot.classList.add('sk-chase-dot');
            skChase.appendChild(dot);
        }

        return spinner;
    }
    
    animationend(target) {
        return new Promise((resolve) => {
            target.addEventListener("animationend", resolve, { once: true });
        });
    }
}

export default Spinner;