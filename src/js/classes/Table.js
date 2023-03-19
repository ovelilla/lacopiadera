import { icons } from "../modules/Icons.js";
import Menu from "./Menu.js";
import IconButton from "./mio/IconButton.js";
import Checkbox from "./mio/Checkbox.js";

class Table {
    constructor(options) {
        this.title = options.title;
        this.columns = options.columns;
        this.customColumns = options.customColumns || [];
        this.rows = options.rows;
        this.copyRows = options.rows;
        this.findFields = options.findFields;

        this.container = options.container;
        this.visibleRows = options.visibleRows;
        this.rowsPerPage = options.rowsPerPage;
        this.rowsPerPageOptions = options.rowsPerPageOptions;

        this.showActionsMenu = options.showActionsMenu;
        this.headerActions = options.headerActions;
        this.rowsActions = options.rowsActions || [];
        this.selectActions = options.selectActions || [];

        this.selectedRows = [];

        this.sort = false;
        this.sortColumn = null;

        this.page = 1;
        this.pages = 0;

        this.search = "";
        this.isSearch = false;

        this.init();
    }

    init() {
        this.setPages(this.calculatePages());
        this.createTable();
    }

    setRows(rows) {
        this.rows = rows;
        this.destroy();
        this.setPages(this.calculatePages());
        this.createTable();
    }

    addRow(row) {
        this.rows = [...this.rows, row];
        this.copyRows = [...this.copyRows, row];
        this.destroy();
        this.setPages(this.calculatePages());
        this.createTable();
    }

    updateRow(updateRow) {
        this.rows = this.rows.map((row) => (row.id === updateRow.id ? updateRow : row));
        this.copyRows = this.copyRows.map((row) => (row.id === updateRow.id ? updateRow : row));
        this.destroy();
        this.setPages(this.calculatePages());
        this.createTable();
    }

    deleteRow(deleteRow) {
        this.rows = this.rows.filter((row) => row.id !== deleteRow.id);
        this.copyRows = this.copyRows.filter((row) => row.id !== deleteRow.id);
        this.clearSelectedRows();
        this.setPages(this.calculatePages());
        this.checkPage();
        this.destroy();
        this.createTable();
    }

    deleteRows(deleteRows) {
        this.rows = this.rows.filter(
            (row) => !deleteRows.some((deleteRow) => deleteRow.id === row.id)
        );
        this.copyRows = this.copyRows.filter(
            (row) => !deleteRows.some((deleteRow) => deleteRow.id === row.id)
        );
        this.clearSelectedRows();
        this.setPages(this.calculatePages());
        this.checkPage();
        this.destroy();
        this.createTable();
    }

    searchRow() {
        if (this.findFields) {
            this.rows = this.copyRows.filter((row) => {
                const value = this.findFields.reduce(
                    (previousValue, currentValue, currentIndex) => {
                        return !currentIndex
                            ? row[currentValue]
                            : previousValue + " " + row[currentValue];
                    },
                    ""
                );

                return value.toLowerCase().includes(this.search.toLowerCase());
            });
        } else {
            this.rows = this.copyRows.filter((row) => {
                return Object.values(row).some((value) => {
                    return (
                        value && value.toString().toLowerCase().includes(this.search.toLowerCase())
                    );
                });
            });
        }

        this.clearSelectedRows();
        this.setPages(this.calculatePages());
        this.checkPage();
        this.destroy();
        this.createTable();
    }

    checkPage() {
        if (this.page > this.pages) {
            this.page = this.pages;
        }
    }

    setPages(pages) {
        this.pages = pages;
    }

    calculatePages() {
        return Math.ceil(this.rows.length / this.rowsPerPage) || 1;
    }

    clearSelectedRows() {
        this.selectedRows = [];
    }

    createTable() {
        this.table = document.createElement("div");
        this.table.classList.add("table");
        this.table.style.height = this.tableSizing().tableHeight + "px";
        this.container.appendChild(this.table);

        const header = this.createHeader();
        this.table.appendChild(header);

        const tableWrapper = document.createElement("div");
        tableWrapper.style.height = this.tableSizing().wrapperHeight + "px";
        tableWrapper.classList.add("wrapper");
        this.table.appendChild(tableWrapper);

        const table = document.createElement("table");
        tableWrapper.appendChild(table);

        const thead = this.createThead();
        table.appendChild(thead);

        const tbody = this.createTbody();
        table.appendChild(tbody);

        const footer = this.createFooter();
        this.table.appendChild(footer);

        if (!this.selectedRows.length && this.isSearch) {
            const input = document.querySelector(".search input");
            input.focus();
        }
    }

    tableSizing() {
        const headerHeight = 70;
        const theadHeight = 60;
        const rowHeight = 55;
        const footerHeight = 70;

        let tableHeight = 0;
        let wrapperHeight = 0;

        if (this.visibleRows > this.rowsPerPage) {
            wrapperHeight = rowHeight * this.rowsPerPage + theadHeight;
            tableHeight = headerHeight + wrapperHeight + footerHeight;
        }
        if (this.visibleRows <= this.rowsPerPage) {
            wrapperHeight = rowHeight * this.visibleRows + rowHeight / 2 + theadHeight;
            tableHeight = headerHeight + wrapperHeight + footerHeight;
        }

        return {
            wrapperHeight,
            tableHeight,
        };
    }

    createHeader() {
        const header = document.createElement("div");
        header.classList.add("header");

        if (this.selectedRows.length) {
            header.classList.add("selected");

            const selectedRows = document.createElement("div");
            selectedRows.classList.add("selected-rows");
            if (this.selectedRows.length === 1) {
                selectedRows.textContent = "1 fila seleccionada";
            }
            if (this.selectedRows.length > 1) {
                selectedRows.textContent = this.selectedRows.length + " filas seleccionadas";
            }
            header.appendChild(selectedRows);

            const actions = document.createElement("div");
            actions.classList.add("actions");
            header.appendChild(actions);

            this.selectActions.forEach((action) => {
                const button = new IconButton({
                    ariaLabel: action.name,
                    buttonSize: "large",
                    svgSize: "large",
                    icon: action.icon.cloneNode(true),
                    onClick: () => action.callback(this.selectedRows),
                });
                actions.appendChild(button.get());
            });

            return header;
        }

        if (!this.selectedRows.length && this.isSearch) {
            header.classList.add("search");

            const form = document.createElement("form");
            form.noValidate;
            header.appendChild(form);

            const input = document.createElement("input");
            input.type = "text";
            input.placeholder = "Buscar";
            input.value = this.search;
            input.addEventListener("keyup", this.handleSubmitSearch.bind(this));
            form.appendChild(input);

            const label = document.createElement("label");
            label.htmlFor = "search";
            label.textContent = "Buscar";
            form.appendChild(label);

            const button = new IconButton({
                ariaLabel: "Cerrar busqueda",
                buttonSize: "large",
                svgSize: "large",
                icon: icons.get("xLg"),
                onClick: this.handleCloseSearch.bind(this),
            });
            header.appendChild(button.get());

            return header;
        }

        if (!this.selectedRows.length) {
            const title = document.createElement("div");
            title.classList.add("title");
            title.textContent = this.title;
            header.appendChild(title);

            const actions = document.createElement("div");
            actions.classList.add("actions");
            header.appendChild(actions);

            const button = new IconButton({
                ariaLabel: "Buscar",
                buttonSize: "large",
                svgSize: "large",
                icon: icons.get("search"),
                onClick: this.handleClickSearch.bind(this),
            });
            actions.appendChild(button.get());

            this.headerActions.forEach((action) => {
                const button = new IconButton({
                    ariaLabel: action.name,
                    buttonSize: "large",
                    svgSize: "large",
                    icon: action.icon.cloneNode(true),
                    onClick: action.callback,
                });
                actions.appendChild(button.get());
            });

            return header;
        }
    }

    createThead() {
        const thead = document.createElement("thead");

        const tr = document.createElement("tr");
        thead.appendChild(tr);

        const thCheckAll = document.createElement("th");
        tr.appendChild(thCheckAll);

        const form = document.createElement("form");
        form.classList.add("mio-form");
        thCheckAll.appendChild(form);

        const checkAll = new Checkbox({
            label: {
                text: "",
                for: "checkAll",
            },
            input: {
                name: "checkAll",
                id: "checkAll",
                value: this.selectedRows.length && this.selectedRows.length === this.rows.length,
            },
            onClick: this.handleCheckAll.bind(this),
        });
        form.appendChild(checkAll.getField());

        this.columns.forEach((column) => {
            const th = document.createElement("th");
            tr.appendChild(th);

            const button = document.createElement("button");
            button.type = "button";
            button.ariaLabel = "Ordenar";
            button.addEventListener("click", this.handleSort.bind(this, column));
            th.appendChild(button);

            const name = document.createElement("div");
            name.classList.add("name");
            name.textContent = column.headerName;
            button.appendChild(name);

            const sort = document.createElement("div");
            sort.classList.add("sort", "asc");
            if (this.sortColumn === column && this.sort) {
                sort.classList.remove("asc");
                sort.classList.add("asc");
            }
            if (this.sortColumn === column && !this.sort) {
                sort.classList.remove("asc");
                sort.classList.add("desc");
            }
            button.appendChild(sort);

            const sortIcon = icons.get("arrowUpShort");
            sort.appendChild(sortIcon);
        });

        this.customColumns.forEach((column) => {
            const th = document.createElement("th");
            tr.appendChild(th);

            const button = document.createElement("button");
            button.type = "button";
            button.ariaLabel = "Ordenar";
            button.addEventListener("click", this.handleSort.bind(this, column));
            th.appendChild(button);

            const name = document.createElement("div");
            name.classList.add("name");
            name.textContent = column.headerName;
            button.appendChild(name);

            const sort = document.createElement("div");
            sort.classList.add("sort", "asc");
            if (this.sortColumn === column && this.sort) {
                sort.classList.remove("asc");
                sort.classList.add("asc");
            }
            if (this.sortColumn === column && !this.sort) {
                sort.classList.remove("asc");
                sort.classList.add("desc");
            }
            button.appendChild(sort);

            const sortIcon = icons.get("arrowUpShort");
            sort.appendChild(sortIcon);
        });

        const thActions = document.createElement("th");
        thActions.textContent = "Acciones";
        tr.appendChild(thActions);

        return thead;
    }

    createTbody() {
        const tbody = document.createElement("tbody");

        this.rows.forEach((row, index) => {
            if (
                index < this.rowsPerPage * (this.page - 1) ||
                index >= this.rowsPerPage * this.page
            ) {
                return;
            }

            const tr = document.createElement("tr");
            const exists = this.selectedRows.some((selectedRow) => selectedRow === row);
            if (exists) {
                tr.classList.add("selected");
            }
            tr.addEventListener("click", this.handleRowClick.bind(this, row));
            tbody.appendChild(tr);

            const tdCheck = document.createElement("td");
            tr.appendChild(tdCheck);

            const form = document.createElement("form");
            form.classList.add("mio-form");
            tdCheck.appendChild(form);

            const check = new Checkbox({
                label: {
                    text: "",
                    for: `check${row.id}`,
                },
                input: {
                    name: `check${row.id}`,
                    id: `check${row.id}`,
                    value: exists,
                },
                onClick: this.handleCheck.bind(this, row),
            });
            form.appendChild(check.getField());

            this.columns.forEach((column) => {
                const td = document.createElement("td");
                if (column.formatter) {
                    td.textContent = column.formatter(row[column.field]);
                } else {
                    td.textContent = row[column.field];
                }
                tr.appendChild(td);
            });

            this.customColumns.forEach((column) => {
                const td = document.createElement("td");
                tr.appendChild(td);

                const content = column.content(row);
                td.appendChild(content);
            });

            const tdActions = document.createElement("td");
            tdActions.classList.add("actions");
            tr.appendChild(tdActions);

            const actionsContainer = document.createElement("div");
            tdActions.appendChild(actionsContainer);

            if (this.showActionsMenu) {
                const menuButton = new IconButton({
                    ariaLabel: "Menu Acciones",
                    buttonSize: "large",
                    svgSize: "medium",
                    icon: icons.get("threeDotsVertical"),
                    onClick: () => {},
                });
                actionsContainer.appendChild(menuButton.get());

                let items = [];
                this.rowsActions.forEach((action) => {
                    items.push({
                        type: "button",
                        text: action.name,
                        ariaLabel: action.name,
                        icon: action.icon,
                        onClick: () => action.callback(row),
                    });
                });

                const menu = new Menu({
                    target: menuButton.get(),
                    items: items,
                });
            } else {
                this.rowsActions.forEach((action) => {
                    const button = new IconButton({
                        ariaLabel: action.name,
                        buttonSize: "large",
                        svgSize: "medium",
                        icon: action.icon.cloneNode(true),
                        callback: (e) => {
                            e.stopPropagation();
                            action.callback(row);
                        },
                    });
                    actionsContainer.appendChild(button.get());
                });
            }
        });

        return tbody;
    }

    createFooter() {
        const footer = document.createElement("div");
        footer.classList.add("footer");

        const colLeft = document.createElement("div");
        colLeft.classList.add("col-left");
        footer.appendChild(colLeft);

        const rowsPerPage = document.createElement("div");
        rowsPerPage.classList.add("rows-per-page");
        colLeft.appendChild(rowsPerPage);

        const span = document.createElement("span");
        span.textContent = "Filas por página:";
        rowsPerPage.appendChild(span);

        const select = document.createElement("select");
        select.addEventListener("change", this.handleRowsPerPage.bind(this));
        rowsPerPage.appendChild(select);

        this.rowsPerPageOptions.forEach((option) => {
            const optionElement = document.createElement("option");
            optionElement.value = option;
            optionElement.textContent = option;
            if (option === this.rowsPerPage) {
                optionElement.selected = true;
            }
            select.appendChild(optionElement);
        });

        const colRight = document.createElement("div");
        colRight.classList.add("col-right");
        footer.appendChild(colRight);

        const rows = document.createElement("div");
        rows.classList.add("rows");
        let text = "";
        if (this.rows.length) {
            text += (this.page - 1) * this.rowsPerPage + 1 + "-";
        } else {
            text += "0-";
        }
        if (this.page * this.rowsPerPage > this.rows.length) {
            text += this.rows.length + " de " + this.rows.length;
        } else {
            text += this.page * this.rowsPerPage + " de " + this.rows.length;
        }
        rows.textContent = text;
        colRight.appendChild(rows);

        const pagination = document.createElement("div");
        pagination.classList.add("pagination");
        colRight.appendChild(pagination);

        const prev = document.createElement("button");
        prev.type = "button";
        prev.ariaLabel = "Anterior";
        if (this.page === 1) {
            prev.disabled = true;
        }
        prev.addEventListener("click", this.handlePrev.bind(this));
        pagination.appendChild(prev);

        const prevIcon = icons.get("chevronLeft");
        prev.appendChild(prevIcon);

        const next = document.createElement("button");
        next.type = "button";
        next.ariaLabel = "Siguiente";
        if (this.page === this.pages) {
            next.disabled = true;
        }
        next.addEventListener("click", this.handleNext.bind(this));
        pagination.appendChild(next);

        const nextIcon = icons.get("chevronRight");
        next.appendChild(nextIcon);

        return footer;
    }

    handleCheckAll(value) {
        this.selectedRows = value ? this.rows : [];
        this.destroy();
        this.createTable();
    }

    handleSort(column) {
        if (this.sortColumn === column) {
            this.sort = !this.sort;
        } else {
            this.sort = true;
            this.sortColumn = column;
        }

        this.rows.sort((a, b) => {
            const aValue = a[column.field];
            const bValue = b[column.field];

            if (this.sort) {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        this.destroy();
        this.createTable();
    }

    handleCheck(row, value) {
        if (value) {
            this.selectedRows = [...this.selectedRows, row];
        } else {
            this.selectedRows = this.selectedRows.filter((selectedRow) => selectedRow !== row);
        }
        this.destroy();
        this.createTable();
    }

    handleRowClick(row, e) {
        const tableRow = e.currentTarget;
        tableRow.classList.toggle("selected");

        const checkbox = tableRow.querySelector("input[type=checkbox]");
        checkbox.checked = !checkbox.checked;

        if (checkbox.checked) {
            this.selectedRows = [...this.selectedRows, row];
        } else {
            this.selectedRows = this.selectedRows.filter((selectedRow) => selectedRow !== row);
        }
        this.destroy();
        this.createTable();
    }

    handleClickSearch() {
        this.isSearch = true;
        this.destroy();
        this.createTable();
    }

    handleSubmitSearch(e) {
        this.search = e.target.value;
        this.searchRow();
    }

    handleCloseSearch() {
        this.search = "";
        this.isSearch = false;
        this.searchRow();
    }

    handleRowsPerPage(e) {
        const select = e.currentTarget;

        // this.rowsPerPage =
        //     this.rows.length < parseInt(select.value) ? this.rows.length : parseInt(select.value);
        this.rowsPerPage = parseInt(select.value);
        this.pages = Math.ceil(this.rows.length / this.rowsPerPage);

        this.checkPage();
        this.destroy();
        this.createTable();
    }

    handlePrev() {
        this.page--;
        this.destroy();
        this.createTable();
    }

    handleNext() {
        this.page++;
        this.destroy();
        this.createTable();
    }

    repaint(patients) {
        this.rows = patients;
        this.destroy();
        this.createTable();
    }

    destroy() {
        this.table.remove();
    }
}

export default Table;
