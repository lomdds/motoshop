export const api = {
    async get(url) {
        const response = await fetch(`http://localhost:3002${url}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return handleResponse(response);
    },
    
    async post(url, data) {
        const response = await fetch(`http://localhost:3002${url}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(data)
        });
        return handleResponse(response);
    }
};

async function handleResponse(response) {
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    
    if (!response.ok) {
        const error = (data && data.error) || response.statusText;
        throw new Error(error);
    }
    
    return data;
}