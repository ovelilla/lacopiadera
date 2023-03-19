const Router = () => {
    const routes = [];

    const req = {
        params: {},
        path: "",
        search: "",
        urlSearchParams: null,
    };

    const add = (uri, callback) => {
        const route = {
            uri,
            callback,
        };

        routes.push(route);
    };

    const check = () => {
        const path = window.location.pathname;
        const pathClean = path
            .split("/")
            .filter((x) => x)
            .join("/");

        const search = window.location.search;
        const urlSearch = new URLSearchParams(search);

        req.path = pathClean;
        req.search = search;
        req.urlSearchParams = urlSearch;

        routes.forEach((route) => {
            const routeClean = route.uri
                .split("/")
                .filter((x) => x)
                .join("/");

            if (!route.uri.includes(":")) {
                if (routeClean === pathClean) {
                    if (route.callback) {
                        route.callback(req);
                    }
                }
                return;
            }

            const routeArray = routeClean.split("/");
            const pathArray = pathClean.split("/");

            const indexes = routeArray.reduce((previousValue, currentValue, currentIndex) => {
                if (currentValue.startsWith(":")) {
                    previousValue.push(currentIndex);
                }
                return previousValue;
            }, []);

            const patternArray = [...pathArray];

            indexes.forEach((index) => {
                if (!patternArray[index]) {
                    return;
                }
                patternArray[index] = routeArray[index];
            });

            const pattern = patternArray.join("/");

            if (routeClean !== pattern) {
                return;
            }

            indexes.forEach((index) => {
                req.params[routeArray[index].replace(":", "")] = pathArray[index];
            });

            route.callback(req);
        });
    };

    return {
        add,
        check,
    };
};

export default Router;
