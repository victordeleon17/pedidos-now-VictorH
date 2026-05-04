const requestJson = async (url, options = {}) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeout || 8000);

    try {
        const response = await fetch(url, {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {})
            },
            body: options.body ? JSON.stringify(options.body) : undefined,
            signal: controller.signal
        });
        const text = await response.text();
        const data = text ? JSON.parse(text) : null;

        if (!response.ok) {
            const error = new Error(`HTTP ${response.status} en ${url}`);
            error.status = response.status;
            error.data = data;
            throw error;
        }

        return data;
    } finally {
        clearTimeout(timeout);
    }
};

module.exports = {
    requestJson
};
