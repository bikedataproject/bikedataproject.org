const settings = {
    public_url: "http://localhost:5000",
    api_url: "https://www.bikedataproject.org",
    auth: {
        authority: "https://www.bikedataproject.org/api/users/realms/bdp",
        client_id: "frontend",
        scope: "openid profile email",
    }
};

export { settings };