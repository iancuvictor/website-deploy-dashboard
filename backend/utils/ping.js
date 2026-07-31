import axios from 'axios';

export async function pingWebsite(url) {
    const start = Date.now();
    try {
        let response = await axios.get(url, { timeout: 5000 });
        return {
            status: true,
            responseTime: Date.now() - start,
            statusCode: response.status,
        };
    } catch (err) {
        return {
            status: false,
            responseTime: Date.now() - start,
            error: err.message,
        };
    }
}