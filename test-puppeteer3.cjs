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
      <div class="flex-1 overflow-y-auto" id="scroller">
        <div class="flex items-stretch min-h-full">
          <div class="w-1/2 bg-red-100 flex flex-col">
            <div class="sticky top-0 h-10 bg-red-500" id="sticky-header">Sticky</div>
            <div class="h-[2000px] bg-red-200">Tall text</div>
          </div>
          <div class="w-1/2 bg-blue-100 flex flex-col">
            <div class="sticky top-0 h-10 bg-blue-500" id="sticky-toolbar">Canvas Toolbar</div>
            <div class="flex-1 bg-blue-200 relative" id="canvas-container">
              Canvas
            </div>
            <div class="sticky bottom-6 w-full flex justify-end px-6 pb-6 pointer-events-none z-20 h-0" id="bottom-sticky">
               <div class="bg-black text-white p-2 pointer-events-auto -translate-y-full">Bottom Float</div>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `);
  
  await page.evaluate(() => {
    document.getElementById('scroller').scrollTop = 500;
  });
  
  // give it a frame to apply scroll
  await new Promise(r => setTimeout(r, 100));
  
  const headerTop = await page.evaluate(() => {
    return document.getElementById('sticky-header').getBoundingClientRect().top;
  });
  const bottomFloat = await page.evaluate(() => {
    return document.getElementById('bottom-sticky').getBoundingClientRect().top;
  });
  
  console.log("Header top:", headerTop); // should be 0 or near 0
  console.log("Bottom float top:", bottomFloat);
  await browser.close();
})();
