import { indexedDB } from "../modules/IndexedDB";
import File from "./File";

class Files {
    constructor({ files } = {}) {
        this.files = files ?? [];
    }

    set(files) {
        this.files = files.map((file) => new File(file));
    }

    get() {
        return this.files;
    }

    getFirst() {
        return this.files[0];
    }

    async add(file) {
        const insertedId = await indexedDB.addRecord(file, "files");
        file.setId(insertedId);

        this.files = [...this.files, file];
    }

    update(updatedFile) {
        this.files = this.files.map((file) => (file.file === updatedFile ? updatedFile : file));
    }

    async delete(deletedFile) {
        await indexedDB.deleteRecord(deletedFile.id, "files");
        this.files = this.files.filter((file) => file.file !== deletedFile.file);
    }

    async reset() {
        this.files = [];
        await indexedDB.clearRecords("files");
    }

    length() {
        return this.files.length;
    }

    async save() {
        await indexedDB.addRecords(this.files, "files");
    }

    async recalculate(options) {
        this.files.forEach((file) => file.recalculate(options));

        await Promise.all(
            this.files.map(async (file) => {
                await indexedDB.updateRecord(file, "files");
            })
        );
    }
}

export default Files;
