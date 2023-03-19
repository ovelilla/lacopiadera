export const api = (() => {
    const config = {
        headers: {
            Accept: "*/*",
        },
    };

    const request = async (url, type = "json") => {
        try {
            const response = await fetch(url, config);
            if (type === "json") {
                return await response.json();
            }
            if (type === "text") {
                return await response.text();
            }
        } catch (error) {
            console.log(error);
        }
    };

    const get = (url, type) => {
        config.method = "GET";
        config.body = null;
        return request(url, type);
    };

    const post = (url, data) => {
        config.method = "POST";
        config.body = isFormData(data) ? data : JSON.stringify(data);
        return request(url);
    };

    const put = (url, data) => {
        config.method = "PUT";
        config.body = isFormData(data) ? data : JSON.stringify(data);
        return request(url);
    };

    const del = (url, data) => {
        config.method = "DELETE";
        config.body = isFormData(data) ? data : JSON.stringify(data);
        return request(url);
    };

    const isFormData = (data) => {
        return data instanceof FormData;
    };

    return {
        get,
        post,
        put,
        delete: del,
    };
})();
