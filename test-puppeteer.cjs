const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setContent(`
    <!DOCTYPE html>
    <html style="height: 100%;">
    <head>
    <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="h-full flex flex-col m-0 p-0 overflow-hidden">
      <div class="flex-1 overflow-y-auto flex items-stretch">
        <div class="w-1/2 bg-red-100 flex flex-col shrink-0 min-h-full">
          <div class="h-[2000px] bg-red-200">Tall text</div>
        </div>
        <div class="w-1/2 bg-blue-100 flex flex-col shrink-0 min-h-full">
          <div class="flex-1 bg-blue-200 relative" id="canvas-container">
            <div class="absolute inset-0 bg-blue-300 opacity-50"></div>
            Canvas
          </div>
        </div>
      </div>
    </body>
    </html>
  `);
  
  const height = await page.evaluate(() => {
    return document.getElementById('canvas-container').getBoundingClientRect().height;
  });
  console.log("Canvas container height:", height);
  await browser.close();
})();
