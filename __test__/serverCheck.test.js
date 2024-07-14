const request = require("supertest");
const baseUrl = "http://localhost:3000";

describe("Server Check", () => {
    it("should return 200 for server running", async () => {
        const response = await request(baseUrl).get("/");
        expect(response.status).toBe(200);
        expect(response.text).toBe("Server is running");
    });
});