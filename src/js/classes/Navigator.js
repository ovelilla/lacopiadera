import { api } from "../modules/Api";

class Navigator {
    constructor(data) {
        Object.assign(this, data);

        this.html;
        this.dom;

        this.init();
    }

    init() {
        window.addEventListener("DOMContentLoaded", this.handleLoad.bind(this));
        if (this.active) {
            window.addEventListener("click", this.handleAnchorClick.bind(this));
            window.addEventListener("popstate", this.handlePopstate.bind(this));
        }
    }

    handleLoad() {
        this.onLoad();
    }

    handleAnchorClick(e) {
        if (
            e.target.closest('a:not([data-action="default"])') &&
            e.target.closest('a:not([data-action="default"])').matches("a")
        ) {
            e.preventDefault();

            const url = e.target.closest("a").href;
            this.goTo(url);
        }
    }

    handlePopstate() {
        const url = document.location.href;
        this.goTo(url);
    }

    reload() {
        if (!this.active) {
            location.reload();
            return;
        }

        const url = document.location.href;
        this.goTo(url);
    }

    setOnBeforeunload(onBeforeunload) {
        this.onBeforeunload = onBeforeunload;
    }

    async goTo(url) {
        if (!this.active) {
            window.location.href = url;
            this.onLoad();
            return;
        }

        if (this.onBeforeunload) {
            const load = await this.onBeforeunload();
            if (!load) {
                return;
            }
            this.onBeforeunload = null;
        }

        this.html = await api.get(url, "text");

        this.dom = this.parseHtml();

        const content = this.dom.querySelector("body");
 
        document.title = this.dom.title;

        const target = document.querySelector("body");

        target.replaceWith(content);

        await this.updateState(url);
        this.onLoad();
    }

    parseHtml() {
        const doc = document.implementation.createHTMLDocument();
        doc.documentElement.innerHTML = this.html;
        return doc;
    }

    appendHtml(target, nodes) {
        const fragment = document.createDocumentFragment();

        for (let i = 0; i < nodes.length; i++) {
            fragment.appendChild(nodes[i]);
        }

        target.appendChild(fragment);
    }

    updateState(url) {
        const state = null;
        const title = this.dom.title;

        return new Promise((resolve) => {
            if (url !== document.location.href) {
                history.pushState(state, title, url);
            } else {
                history.replaceState(state, title);
            }

            resolve();
        });
    }
}

export default Navigator;
