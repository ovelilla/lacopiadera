export const indexedDB = (() => {
    let db;

    const createIndexedDB = () => {
        return new Promise((resolve, reject) => {
            const request = window.indexedDB.open("lacopiadera", 1);

            request.onsuccess = async () => {
                db = request.result;
                resolve();
            };

            request.onupgradeneeded = () => {
                const db = request.result;
                db.createObjectStore("cart", { keyPath: "id", autoIncrement: true });
                db.createObjectStore("files", { keyPath: "id", autoIncrement: true });
                db.createObjectStore("options", { keyPath: "id", autoIncrement: true });
                db.createObjectStore("details", { keyPath: "id", autoIncrement: true });
                db.createObjectStore("addresses", { keyPath: "id", autoIncrement: true });
            };

            request.onerror = () => reject(request.error);
        });
    };

    const getRecords = (table) => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(table);
            const objectStore = transaction.objectStore(table);
            const request = objectStore.openCursor();

            let data = [];

            request.onsuccess = () => {
                const cursor = request.result;
                if (cursor) {
                    data = [...data, cursor.value];
                    cursor.continue();
                }
            };

            transaction.oncomplete = () => resolve(data);
            request.onerror = () => reject(request.error);
        });
    };

    const getRecord = (id, table) => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(table);
            const objectStore = transaction.objectStore(table);
            const request = objectStore.get(id);

            transaction.oncomplete = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    };

    const addRecords = (data, table) => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([table], "readwrite");
            const objectStore = transaction.objectStore(table);

            let request;
            for (let i = 0; i < data.length; i++) {
                request = objectStore.add(data[i]);
            }

            transaction.oncomplete = () => resolve(request);
            transaction.onerror = () => reject(request.error);
        });
    };

    const addRecord = (data, table) => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([table], "readwrite");
            const objectStore = transaction.objectStore(table);
            const request = objectStore.add(data);

            transaction.oncomplete = () => resolve(request.result);
            transaction.onerror = () => reject(request.error);
        });
    };

    const updateRecord = (data, table) => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([table], "readwrite");
            const objectStore = transaction.objectStore(table);
            const request = objectStore.put(data);

            transaction.oncomplete = () => resolve(request.result);
            transaction.onerror = () => reject(request.error);
        });
    };

    const deleteRecord = (id, table) => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([table], "readwrite");
            const objectStore = transaction.objectStore(table);
            const request = objectStore.delete(id);

            transaction.oncomplete = () => resolve(request);
            request.onerror = () => reject(request.error);
        });
    };

    const clearRecords = (table) => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([table], "readwrite");
            const objectStore = transaction.objectStore(table);
            const request = objectStore.clear();

            transaction.oncomplete = () => resolve(request);
            request.onerror = () => reject(request.error);
        });
    };

    return {
        createIndexedDB,
        getRecords,
        getRecord,
        addRecords,
        addRecord,
        updateRecord,
        deleteRecord,
        clearRecords,
    };
})();
