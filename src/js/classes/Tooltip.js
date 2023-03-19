class Tooltip {
    constructor(data) {
        Object.assign(this, data);

        this.isActive = false;

        this.init();
    }

    init() {
        window.addEventListener("scroll", this.handleScroll.bind(this));
        this.target.addEventListener("mouseenter", this.handleMouseEnter.bind(this));
        this.target.addEventListener("mouseleave", this.handleMouseLeave.bind(this));
    }

    handleScroll() {
        if (this.isActive) {

            this.setPosition();
        }
    }

    handleMouseEnter() {
        this.isActive = true;

        this.tooltipEl = this.create();
        document.body.appendChild(this.tooltipEl);

        this.setPosition();
    }

    handleMouseLeave() {
        this.isActive = false;

        this.remove();
    }

    create() {
        const tooltip = document.createElement("div");
        tooltip.addEventListener("mouseenter", () => {
            this.isActive = true;
        });
        tooltip.addEventListener("mouseleave", () => {
            this.isActive = false;
        });
        tooltip.classList.add("tooltip", this.position);

        const span = document.createElement("span");
        span.textContent = this.message;
        tooltip.appendChild(span);

        return tooltip;
    }

    remove() {
        this.tooltipEl.remove();
    }

    setPosition() {
        const rect = this.target.getBoundingClientRect();

        this.tooltipEl.style.left =
            rect.left + this.target.offsetWidth / 2 - this.tooltipEl.offsetWidth / 2 + "px";

        if (this.position === "bottom") {
            if (
                rect.top + this.tooltipEl.offsetHeight + this.target.offsetHeight + 10 >
                window.innerHeight
            ) {
                this.tooltipEl.style.top = rect.top - this.tooltipEl.offsetHeight - 10 + "px";
                this.tooltipEl.classList.remove("bottom");
                this.tooltipEl.classList.add("top");
            } else {
                this.tooltipEl.style.top = rect.top + this.target.offsetHeight + 10 + "px";
            }
        } else {
            if (rect.top - this.tooltipEl.offsetHeight - 10 < 0) {
                this.tooltipEl.style.top = rect.top + this.target.offsetHeight + 10 + "px";
                this.tooltipEl.classList.remove("top");
                this.tooltipEl.classList.add("bottom");
            } else {
                this.tooltipEl.style.top = rect.top - this.tooltipEl.offsetHeight - 10 + "px";
            }
        }
    }
}

export default Tooltip;
