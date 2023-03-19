export const layout = (() => {
    let pageYOffset = 0;
    let isSidebarOpened = false;
    let isSidebarAnimated = false;
    let isUserPanelOpened = false;

    const init = () => {
        const hamburguerBtn = document.querySelector("#hamburguer-btn");
        const sidebar = document.querySelector("#main-sidebar");
        const userPanelBtn = document.querySelector("#user-panel-btn");
        const userPanel = document.querySelector("#user-panel");

        window.addEventListener("resize", handleResize);
        hamburguerBtn.addEventListener("click", handleHamburguerBtn);
        sidebar.addEventListener("click", handleSidebar);
        userPanelBtn.addEventListener("click", handleUserPanelBtn);
        userPanel.addEventListener("click", handleUserPanel);

        pageYOffset = 0;
        isSidebarOpened = false;
        isSidebarAnimated = false;
        isUserPanelOpened = false;
    };

    const handleResize = async () => {
        const hamburguerBtn = document.querySelector("#hamburguer-btn");
        const sidebar = document.querySelector("#main-sidebar");
        const userPanelBtn = document.querySelector("#user-panel-btn");
        const userPanel = document.querySelector("#user-panel");

        if (window.innerWidth >= 1024 && isSidebarOpened) {
            isSidebarOpened = false;
            isSidebarAnimated = true;

            noScroll(false);

            hamburguerBtn.classList.remove("active");
            sidebar.classList.add("out");
            await animationend(sidebar);
            sidebar.classList.remove("active", "in", "out");

            isSidebarAnimated = false;
            return;
        }

        positionUserPanel(userPanelBtn, userPanel);
    };

    const handleHamburguerBtn = async () => {
        const hamburguerBtn = document.querySelector("#hamburguer-btn");
        const sidebar = document.querySelector("#main-sidebar");

        if (isSidebarOpened && !isSidebarAnimated) {
            isSidebarOpened = false;
            isSidebarAnimated = true;

            noScroll(false);

            hamburguerBtn.classList.remove("active");
            sidebar.classList.add("out");
            await animationend(sidebar);
            sidebar.classList.remove("active", "in", "out");

            isSidebarAnimated = false;
            return;
        }

        if (!isSidebarOpened && !isSidebarAnimated) {
            isSidebarOpened = true;
            isSidebarAnimated = true;

            noScroll(true);

            hamburguerBtn.classList.add("active");
            sidebar.classList.add("active", "in");
            await animationend(sidebar);

            isSidebarAnimated = false;
            return;
        }
    };

    const handleSidebar = async (e) => {
        const hamburguerBtn = document.querySelector("#hamburguer-btn");
        const sidebar = document.querySelector("#main-sidebar");

        if (e.target.id === "main-sidebar" && isSidebarOpened && !isSidebarAnimated) {
            isSidebarOpened = false;
            isSidebarAnimated = true;

            noScroll(false);

            hamburguerBtn.classList.remove("active");
            sidebar.classList.add("out");
            await animationend(sidebar);
            sidebar.classList.remove("active", "in", "out");

            isSidebarAnimated = false;
        }
    };

    const handleUserPanelBtn = async () => {
        const userPanel = document.querySelector("#user-panel");

        isUserPanelOpened = true;

        userPanel.classList.add("active", "in");
        positionUserPanel();
        await animationend(userPanel);
    };

    const handleUserPanel = async (e) => {
        const userPanel = document.querySelector("#user-panel");

        if (e.target.id === "user-panel") {
            isUserPanelOpened = false;

            userPanel.classList.add("out");
            await animationend(userPanel);
            userPanel.classList.remove("active", "in", "out");
        }
    };

    const positionUserPanel = () => {
        if (!isUserPanelOpened) {
            return;
        }

        const header = document.querySelector("header .container");
        const userPanelBtn = document.querySelector("#user-panel-btn");
        const userPanel = document.querySelector("#user-panel");
        const arrow = document.querySelector("#user-panel .arrow");

        const rect = userPanelBtn.getBoundingClientRect();

        const style = getComputedStyle(header);
        const marginRight = parseInt(style.marginRight);

        const top = rect.top + userPanelBtn.offsetHeight + 14;
        userPanel.firstElementChild.style.top = `${top}px`;

        if (innerWidth < 480) {
            const width = document.body.offsetWidth - 20;
            const right = (document.body.offsetWidth - width) / 2;
            const rightArrow = width - rect.right + 10 + rect.width / 2 - arrow.offsetWidth / 2;

            userPanel.firstElementChild.style.maxWidth = width + "px";
            userPanel.firstElementChild.style.right = right + "px";
            arrow.style.right = rightArrow + "px";
        } else if (innerWidth < 768) {
            const width = document.body.offsetWidth;
            const right = marginRight + 20;
            const rightArrow =
                width - rect.right - 20 + rect.width / 2 - arrow.offsetWidth / 2 - marginRight;

            userPanel.firstElementChild.style.maxWidth = "320px";
            userPanel.firstElementChild.style.right = right + "px";
            arrow.style.right = rightArrow + "px";
        } else if (innerWidth < 1024) {
            const width = document.body.offsetWidth;
            const right = marginRight + 30;
            const rightArrow =
                width - rect.right - 30 + rect.width / 2 - arrow.offsetWidth / 2 - marginRight;

            userPanel.firstElementChild.style.maxWidth = "320px";
            userPanel.firstElementChild.style.right = right + "px";
            arrow.style.right = rightArrow + "px";
        } else {
            const width = document.body.offsetWidth;
            const right = marginRight + 40;
            const rightArrow =
                width - rect.right - 40 + rect.width / 2 - arrow.offsetWidth / 2 - marginRight;

            userPanel.firstElementChild.style.maxWidth = "320px";
            userPanel.firstElementChild.style.right = right + "px";
            arrow.style.right = rightArrow + "px";
        }
    };

    const noScroll = (active) => {
        const hasScrollbar = window.innerWidth > document.documentElement.clientWidth;

        if (!hasScrollbar) {
            return;
        }

        if (active) {
            pageYOffset = window.pageYOffset;

            document.body.style.top = `-${pageYOffset}px`;
            document.body.classList.add("noscroll");
            return;
        }

        document.body.removeAttribute("style");
        document.body.classList.remove("noscroll");
        window.scroll(0, pageYOffset);

        pageYOffset = 0;
    };

    const animationend = (target) => {
        return new Promise((resolve) => {
            target.addEventListener("animationend", resolve, { once: true });
        });
    };

    return {
        init,
    };
})();
