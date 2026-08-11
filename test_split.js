const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const dom = new JSDOM(`<!DOCTYPE html><div id="test">Hello world</div>`);
console.log(dom.window.document.caretRangeFromPoint);
