import axios from 'axios';

export async function pingWebsite(url) {
    const start = Date.now();
    try {
        let response = await axios.get(url, { timeout: 5000 });
        return {
            status: 'up',
            responseTime: Date.now() - start,
            statusCode: response.status,
        };
    } catch (err) {
        return {
            status: 'down',
            responseTime: Date.now() - start,
            error: err.message,
        };
    }
}