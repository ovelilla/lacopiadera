import { tools } from "../modules/Tools";
import { icons } from "../modules/Icons";

class Thumbs {
    constructor(data) {
        Object.assign(this, data);
    }

    add(file, options) {
        const filesArea = document.querySelector("#files-area");
        const thumb = this.create(file, options);
        filesArea.appendChild(thumb);
    }

    show(files, options) {
        const filesArea = document.querySelector("#files-area");

        tools.cleanHTML(filesArea);

        const fragment = document.createDocumentFragment();
        files.forEach((file) => {
            const thumb = this.create(file, options);
            fragment.appendChild(thumb);
        });
        filesArea.appendChild(fragment);
    }

    clear() {
        const filesArea = document.querySelector("#files-area");
        tools.cleanHTML(filesArea);
    }

    create(file, options) {
        const { name, size, image, pages, unitPrice, totalPrice } = file;

        const thumbEl = document.createElement("div");
        thumbEl.classList.add("thumb");
        thumbEl.addEventListener("click", () => {
            if (innerWidth < 1024) {
                const filesArea = document.querySelector("#files-area");
                const thumbs = filesArea.querySelectorAll(".thumb");

                thumbs.forEach((thumb) => {
                    if (thumb !== thumbEl) {
                        thumb.classList.remove("active");
                    }
                });

                thumbEl.classList.toggle("active");
            }
        });

        const tooltip = document.createElement("div");
        tooltip.classList.add("thumb-tooltip");
        thumbEl.appendChild(tooltip);

        const spanPages = document.createElement("span");
        spanPages.textContent = `${tools.formatBytes(size)} - ${pages} ${
            pages === 1 ? "página" : "páginas"
        }`;
        tooltip.appendChild(spanPages);

        const deleteContainer = document.createElement("div");
        deleteContainer.classList.add("delete");
        thumbEl.appendChild(deleteContainer);

        const deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            this.onDelete(file);
        });
        deleteContainer.appendChild(deleteBtn);

        const deleteIcon = icons.get("trash");
        deleteBtn.appendChild(deleteIcon);

        const imageDiv = document.createElement("div");
        imageDiv.classList.add("image");
        thumbEl.appendChild(imageDiv);

        const img = document.createElement("img");
        img.src = image;
        img.alt = `Thumbnail ${name}`;
        if (options.color === "color") {
            img.classList.add("color");
        }
        imageDiv.appendChild(img);

        const nameDiv = document.createElement("div");
        nameDiv.classList.add("name");
        nameDiv.textContent = name;
        thumbEl.appendChild(nameDiv);

        const price = document.createElement("div");
        price.classList.add("price");
        thumbEl.appendChild(price);

        const spanUnitPrice = document.createElement("span");
        spanUnitPrice.classList.add("unit");
        spanUnitPrice.textContent = tools.formatCurrency(unitPrice);
        price.appendChild(spanUnitPrice);

        const spanTotalPrice = document.createElement("span");
        spanTotalPrice.classList.add("total");
        spanTotalPrice.textContent = tools.formatCurrency(totalPrice);
        price.appendChild(spanTotalPrice);

        return thumbEl;
    }
}

export default Thumbs;
