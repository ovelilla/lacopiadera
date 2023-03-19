class Resume {
    constructor({ files }) {
        this.price = 0;
        this.pages = 0;
        this.sheets = 0;
        this.weight = 0;
        this.size = 0;
        this.units = 0;

        this.set(files);
    }

    get() {
        return {
            price: this.price,
            pages: this.pages,
            sheets: this.sheets,
            weight: this.weight,
            size: this.size,
            units: this.units,
        };
    }

    set(files) {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            this.price += file.totalPrice;
            this.pages += file.pages;
            this.sheets += file.totalSheets;
            this.weight += file.totalWeight;
            this.size += file.size;
            this.units = files.length;
        }
    }
}

export default Resume;
