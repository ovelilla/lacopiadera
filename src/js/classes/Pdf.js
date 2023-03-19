class Pdf {
    constructor() {
        this.load();
    }

    load() {
        const script = document.querySelector('script[src="/build/js/vendor/pdf.min.js"]');

        if (script) {
            return;
        }

        return new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "/build/js/vendor/pdf.min.js";
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
        });
    }

    async getTypedArray(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const typedArray = new Uint8Array(reader.result);
                resolve(typedArray);
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }

    async getData(file) {
        const typedArray = await this.getTypedArray(file);

        const pdfjsLib = window["pdfjs-dist/build/pdf"];
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/build/js/vendor/pdf.worker.min.js";

        const pdf = await pdfjsLib.getDocument(typedArray).promise;
        const canvas = await this.createCanvas(pdf);
        const image = canvas.toDataURL("image/png");
        const pages = pdf.numPages;

        return {
            image,
            pages,
        };
    }

    async createCanvas(pdf) {
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 0.25 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
            canvasContext: context,
            viewport: viewport,
        };
        await page.render(renderContext).promise;

        return canvas;
    }
}

export default Pdf;
