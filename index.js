const fs = require("fs");
const puppeteer = require("puppeteer");

(async () => {
  const linkUrl = "https://mercado.carrefour.com.br/bebidas";
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(linkUrl, { waitUntil: "networkidle2" });

  const products = await page.evaluate(() => {
    return Array.from(
      document.querySelectorAll('article[class*="relative flex flex-col"]')
    ).map((product) => {
      const title = product.querySelector("span[title]").getAttribute("title");

      const priceSpans = product.querySelectorAll('span[data-test-id="price"]');

      const price = priceSpans[0].getAttribute("data-value");

      const discountBadge = product.querySelector(
        '[data-test="discount-badge"] span'
      );
      const discount = discountBadge ? discountBadge.innerText : 0;

      const totalPrice =
        priceSpans[priceSpans.length - 1].getAttribute("data-value");

      const imageUrl = product.querySelector("img").src;

      return { title, price, discount, totalPrice, imageUrl };
    });
  });

  fs.writeFileSync("output.json", JSON.stringify(products, null, 2));
  console.log(
    `Arquivo gerado com sucesso - Total: ${products.length} produtos`
  );

  await browser.close();
})();
