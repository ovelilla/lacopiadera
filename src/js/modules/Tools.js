export const tools = (() => {
    const formatCurrency = (amount) => {
        const options = {
            style: "currency",
            currency: "EUR",
        };

        return new Intl.NumberFormat("es-ES", options).format(amount);
    };

    const formatBytes = (bytes, decimals = 2) => {
        if (bytes === 0) return "0 Bytes";

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
    };

    const formatNumber = (amount) => {
        const options = {
            style: "decimal",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        };

        return new Intl.NumberFormat("es-ES", options).format(amount);
    };

    const dateFormatLong = (date) => {
        const newDate = new Date(date);
        const options = {
            dateStyle: "long",
        };
        return new Intl.DateTimeFormat("es-ES", options).format(newDate);
    };

    const dateFormatShort = (date) => {
        const newDate = new Date(date);
        const options = {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        };
        return new Intl.DateTimeFormat("es-ES", options).format(newDate);
    };

    const dateTimeFormat = (date) => {
        const newDate = new Date(date);
        const options = {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        };
        return new Intl.DateTimeFormat("es-ES", options).format(newDate);
    };

    const toSeoUrl = (str) => {
        const a =
            "àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìıİłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;";
        const b =
            "aaaaaaaaaacccddeeeeeeeegghiiiiiiiilmnnnnoooooooooprrsssssttuuuuuuuuuwxyyzzz------";
        const p = new RegExp(a.split("").join("|"), "g");

        return str
            .toString()
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(p, (c) => b.charAt(a.indexOf(c)))
            .replace(/&/g, "-and-")
            .replace(/[^\w\-]+/g, "")
            .replace(/\-\-+/g, "-")
            .replace(/^-+/, "")
            .replace(/-+$/, "");
    };

    const cleanHTML = (el) => {
        while (el.firstChild) {
            el.removeChild(el.firstChild);
        }
    };

    const getCurrentPage = () => {
        return window.location.pathname.slice(1) || "index";
    };

    const isEmpty = (obj) => {
        for (const i in obj) {
            return false;
        }
        return true;
    };

    const isObject = (obj) => {
        return typeof obj === "object" && !Array.isArray(obj) && obj !== null;
    };

    const isNumeric = (n) => {
        if (typeof str != "string") return false;
        return !isNaN(str) && !isNaN(parseFloat(str));
    };

    const randomUUID = () => {
        return crypto.randomUUID();
    };

    return {
        formatCurrency,
        formatBytes,
        formatNumber,
        dateFormatLong,
        dateFormatShort,
        dateTimeFormat,
        toSeoUrl,
        cleanHTML,
        getCurrentPage,
        isEmpty,
        isObject,
        isNumeric,
        randomUUID,
    };
})();
