const axios = require("axios");
const { fetchAllProducts } = require("./app");

jest.mock("axios");

describe("fetchAllProducts", () => {
    afterEach(() => {
        jest.clearAllMocks(); 
    });
    test("should fetch all products within these ranges:", async () => {
        const mockData1 = {
            products: [{ id: 1, price: 50 }, { id: 2, price: 90 }],
            total: 2,
            count: 2
        };

        const mockData2 = {
            products: [{ id: 3, price: 150 }, { id: 4, price: 190 }],
            total: 2,
            count: 2
        };

        const mockData3 = {
            products: [],
            total: 0,
            count: 0
        };

        axios.get.mockResolvedValueOnce({ data: mockData1 })
                  .mockResolvedValueOnce({ data: mockData2 })
                  .mockResolvedValueOnce({ data: mockData3 });

        const result = await fetchAllProducts();

        const expectedProducts = [
            { id: 1, price: 50 },
            { id: 2, price: 90 },
            { id: 3, price: 150 },
            { id: 4, price: 190 }
        ];

        expect(result.products).toEqual(expectedProducts);
        expect(result.total).toBe(expectedProducts.length);
    });

    test("should handle errors during product fetching", async () => {
        axios.get.mockRejectedValue(new Error("Request failed with status code: 404"));

        await expect(fetchAllProducts()).rejects.toThrow("Request failed with status code: 404");
    });
});
