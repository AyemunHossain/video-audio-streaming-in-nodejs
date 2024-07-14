const request = require('supertest');
const baseUrl = 'http://localhost:3000';

describe('checking the video streaming', () => {
    it('should return 416 for video streaming as no range given', async () => {
        const response = await request(baseUrl).get('/video');
        expect(response.status).toBe(416);
        expect(response.headers['content-type']).toBe('text/plain');
    });

    it('should stream video with status 206', async () => {
        const response = await request(baseUrl).get('/video').set('Range', 'bytes=0-1023');
        expect(response.status).toBe(206);

        expect(response.headers['content-type']).toBe('video/mp4');
    });

    it('should stream video with status 416 for invalid start range', async () => {
        const response = await request(baseUrl).get('/video').set('Range', 'bytes=-0-1023');
        expect(response.status).toBe(416);

        expect(response.headers['content-type']).toBe('text/plain');
    });

    it('should stream video with status 416 for invalid end range', async () => {
        const response = await request(baseUrl).get('/video').set('Range', 'bytes=0-10230000000000000');
        expect(response.status).toBe(416);

        expect(response.headers['content-type']).toBe('text/plain');
    });

});