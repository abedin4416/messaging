const ch = document.querySelector("#ch");

async function receive(api, method = "GET", data = null) {
    try {
        const fetchOptions = {
            method: method.toUpperCase(),
            headers: {}
        };
        if (data && fetchOptions.method !== "GET") {
            fetchOptions.headers["Content-Type"] = "application/json";
            fetchOptions.body = JSON.stringify(data);
        }
        const res = await fetch(api, fetchOptions);

        if (!res.ok) {
            throw new Error(`HTTP Error! Status: ${res.status}`);
        }
        return await res.json();
    } catch (error) {
        console.error("Fetch request failed:", error);
        throw error;
    }
}