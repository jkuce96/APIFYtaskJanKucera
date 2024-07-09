const express = require("express");
const app = express();
const port = 3001;
const axios = require("axios");
const URL = "https://api.ecommerce.com/products";


//funkce pro fetch produktů s parametry min a maxprice
async function fetchProducts(minPrice, maxPrice) {
    try {
        const response = await axios.get(URL, {
            params: { minPrice, maxPrice }
        });
        return response.data;
    } catch (error) {
        console.error("Error při fetchování produktů:", error);
        throw error;
    }
}

//funkce pro fetch všech produktů s loopem

async function fetchAllProducts() {
    //empty array pro produkty
    let products = [];
    let minPrice = 0;
    //badges po 100 dolarech
    let maxPrice = 100;
    //const pro max limit cenový 100k USD
    const maxLimit = 100000;

    try {
        //loop dokud cena nepřevýší maxlimit
        while (minPrice < maxLimit) {
            const data = await fetchProducts(minPrice, maxPrice);
            //destructuring pro data.products, data.total a data.count
            const { products: fetchedProducts, total, count } = data;

            if (fetchedProducts && fetchedProducts.length > 0) {
                //spread pro sloučení dvou arrayí ao arraye "products" dle zadání
                products = [...products, ...fetchedProducts];
            
                //pokud se fetchnulo pod 100 produktů a zároveň se maxPrice rovná nebo je vyšší než maxLimit, skončit loop
                if (count < 1000 && maxPrice >= maxLimit) {
                    break;
                }

                //pokud se fetchnulo pod 1000 produktů ale zároveň není maxPrice nad maxLimiem 100k USD
                if (count < 1000) {
                    //přičíst minimální hodnotu (pokud se liší ceny o nižší částku než 0,001, tak to může být limitující)
                    minPrice = maxPrice + 0.001;
                    //navýšit cenu o 100 pro další fetch
                    maxPrice += 100;
                    if (maxPrice > maxLimit) {
                        maxPrice = maxLimit;
                    }
                } else {
                    const highestPrice = Math.max(...fetchedProducts.map((product) => product.price));
                    minPrice = highestPrice + 0.001;
                    maxPrice = minPrice + 100;
                    if (maxPrice > maxLimit) {
                        maxPrice = maxLimit;
                    }
                }
            } else {
                //ELSE případ pokud na api nejsou žádná data / je tam prázdný array
                console.log("No products were fetched: either no data or served an empty array of products")
                break;
            }
        }

        //počet celkového množství fetchovaných produktů
        const totalProducts = products.length;
        return { products, total: totalProducts }; 
    } catch (err) {
        console.error("Error při pokusu o fetch produktů:", err);
        throw err;
    }

}



app.get("/", (req, res) => {
    res.send("Hello World!");
    });


app.get("/apify", async (req, res) => {
    try {
        const { products, total } = await fetchAllProducts();
        res.json({ products, total });
    } catch (error) {
        res.status(500).json({ error: "Unsuccessful in scraping products - try contacting jkuceradc@seznam.cz" })
    }});



app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
    });
    
module.exports = { fetchAllProducts, fetchProducts };
