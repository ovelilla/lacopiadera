class Item {
    constructor({ files, options, resume }) {
        this.files = files;
        this.options = options;
        this.resume = resume;
    }

    setId(id) {
        this.id = id;
    }
}

export default Item;
