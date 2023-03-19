class File {
    constructor(file) {
        if (file.id) {
            this.id = file.id;
        }

        this.file = file.file;

        this.name = file.name;
        this.size = file.size;
        this.type = file.type;

        this.image = file.image;
        this.pages = file.pages;

        this.unitSheets = file.unitSheets || this.calculateSheets(file.options).unitSheets;
        this.totalSheets = file.totalSheets || this.calculateSheets(file.options).totalSheets;

        this.unitPrice = file.unitPrice || this.calculatePrice(file.options).unitPrice;
        this.totalPrice = file.totalPrice || this.calculatePrice(file.options).totalPrice;

        this.unitWeight = file.unitWeight || this.calculateWeight(file.options).unitWeight;
        this.totalWeight = file.totalWeight || this.calculateWeight(file.options).totalWeight;
    }

    setId(id) {
        this.id = id;
    }

    setUnitSheets(unitSheets) {
        this.unitSheets = unitSheets;
    }

    setTotalSheets(totalSheets) {
        this.totalSheets = totalSheets;
    }

    setUnitPrice(unitPrice) {
        this.unitPrice = unitPrice;
    }

    setTotalPrice(totalPrice) {
        this.totalPrice = totalPrice;
    }

    setUnitWeight(unitWeight) {
        this.unitWeight = unitWeight;
    }

    setTotalWeight(totalWeight) {
        this.totalWeight = totalWeight;
    }

    recalculate(options) {
        const { unitSheets, totalSheets } = this.calculateSheets(options);
        this.setUnitSheets(unitSheets);
        this.setTotalSheets(totalSheets);

        const { unitPrice, totalPrice } = this.calculatePrice(options);
        this.setUnitPrice(unitPrice);
        this.setTotalPrice(totalPrice);

        const { unitWeight, totalWeight } = this.calculateWeight(options);
        this.setUnitWeight(unitWeight);
        this.setTotalWeight(totalWeight);
    }

    calculateSheets(options) {
        const { copies, doubleSided, customPages, from, to, pagesPerSheet } = options;

        let unitSheets = 0;
        let totalSheets = 0;

        if (customPages === "all") {
            unitSheets = this.pages;
        }

        if (customPages === "range") {
            unitSheets = to - from + 1;
        }

        if (doubleSided) {
            unitSheets = Math.ceil(unitSheets / 2);
        }

        if (pagesPerSheet === 2) {
            unitSheets = Math.ceil(unitSheets / 2);
        }

        if (pagesPerSheet === 4) {
            unitSheets = Math.ceil(unitSheets / 4);
        }

        totalSheets = unitSheets * copies;

        return {
            unitSheets,
            totalSheets,
        };
    }

    calculatePrice(options) {
        const { color, copies, doubleSided, customPages, from, to, size, pagesPerSheet, binding } =
            options;

        const blackPriceSingle = 0.04;
        const blackPriceDouble = 0.03;

        const colorPriceSingle = 0.1;
        const colorPriceDouble = 0.1;

        const bind250 = 2.0;
        const bind500 = 3.0;

        const punchDouble = 1.5;
        const punchQuadruple = 1.5;

        const laminateA4 = 0.5;
        const laminateA3 = 1.0;

        let pages = 0;

        let unitPrice = 0;
        let totalPrice = 0;

        if (customPages === "all") {
            pages = this.pages;
        }

        if (customPages === "range") {
            pages = to - from + 1;
        }

        if (color === "black" && !doubleSided && pagesPerSheet === 1) {
            unitPrice = pages * blackPriceSingle;
        }

        if (color === "black" && !doubleSided && pagesPerSheet === 2) {
            unitPrice = Math.ceil(pages / 2) * blackPriceSingle;
        }

        if (color === "black" && !doubleSided && pagesPerSheet === 4) {
            unitPrice = Math.ceil(pages / 4) * blackPriceSingle;
        }

        if (color === "black" && doubleSided && pages === 1 && pagesPerSheet === 1) {
            unitPrice = pages * blackPriceSingle;
        }

        if (color === "black" && doubleSided && pages > 1 && pagesPerSheet === 1) {
            unitPrice = pages * blackPriceDouble;
        }

        if (color === "black" && doubleSided && pages === 1 && pagesPerSheet === 2) {
            unitPrice = Math.ceil(pages / 2) * blackPriceSingle;
        }

        if (color === "black" && doubleSided && pages > 1 && pagesPerSheet === 2) {
            unitPrice = Math.ceil(pages / 2) * blackPriceDouble;
        }

        if (color === "black" && doubleSided && pages === 1 && pagesPerSheet === 4) {
            unitPrice = Math.ceil(pages / 4) * blackPriceSingle;
        }

        if (color === "black" && doubleSided && pages > 1 && pagesPerSheet === 4) {
            unitPrice = Math.ceil(pages / 4) * blackPriceDouble;
        }

        if (color === "color" && !doubleSided && pagesPerSheet === 1) {
            unitPrice = pages * colorPriceSingle;
        }

        if (color === "color" && !doubleSided && pagesPerSheet === 2) {
            unitPrice = Math.ceil(pages / 2) * colorPriceSingle;
        }

        if (color === "color" && !doubleSided && pagesPerSheet === 4) {
            unitPrice = Math.ceil(pages / 4) * colorPriceSingle;
        }

        if (color === "color" && doubleSided && pages === 1 && pagesPerSheet === 1) {
            unitPrice = pages * colorPriceSingle;
        }

        if (color === "color" && doubleSided && pages > 1 && pagesPerSheet === 1) {
            unitPrice = pages * colorPriceDouble;
        }

        if (color === "color" && doubleSided && pages === 1 && pagesPerSheet === 2) {
            unitPrice = Math.ceil(pages / 2) * colorPriceSingle;
        }

        if (color === "color" && doubleSided && pages > 1 && pagesPerSheet === 2) {
            unitPrice = Math.ceil(pages / 2) * colorPriceDouble;
        }

        if (color === "color" && doubleSided && pages === 1 && pagesPerSheet === 4) {
            unitPrice = Math.ceil(pages / 4) * colorPriceSingle;
        }

        if (color === "color" && doubleSided && pages > 1 && pagesPerSheet === 4) {
            unitPrice = Math.ceil(pages / 4) * colorPriceDouble;
        }

        if (size === "a3") {
            unitPrice = unitPrice * 2;
        }

        if (binding === "bound") {
            const numberOfBinds = Math.ceil(this.unitSheets / 500);

            if (numberOfBinds === 1) {
                if (this.unitSheets <= 250) {
                    unitPrice = unitPrice + bind250;
                }

                if (this.unitSheets > 250 && this.unitSheets <= 500) {
                    unitPrice = unitPrice + bind500;
                }
            }

            if (numberOfBinds > 1) {
                const numberOfBinds500 = Math.floor(this.unitSheets / 500);
                const rest = this.unitSheets - numberOfBinds500 * 500;

                unitPrice = unitPrice + numberOfBinds500 * bind500;

                if (rest <= 250) {
                    unitPrice = unitPrice + bind250;
                }

                if (rest > 250 && rest <= 500) {
                    unitPrice = unitPrice + bind500;
                }
            }
        }

        if (binding === "punch-double") {
            unitPrice = unitPrice + punchDouble;
        }

        if (binding === "punch-quadruple") {
            unitPrice = unitPrice + punchQuadruple;
        }

        if (binding === "laminated" && size === "a4") {
            unitPrice = unitPrice + laminateA4;
        }

        if (binding === "laminated" && size === "a3") {
            unitPrice = unitPrice + laminateA3;
        }

        totalPrice = unitPrice * copies;

        return {
            unitPrice,
            totalPrice,
        };
    }

    calculateWeight(options) {
        const gramsA4paper80 = 5;

        const { copies } = options;

        let unitWeight = 0;
        let totalWeight = 0;

        unitWeight = gramsA4paper80 * this.unitSheets;
        totalWeight = unitWeight * copies;

        return {
            unitWeight,
            totalWeight,
        };
    }
}

export default File;
