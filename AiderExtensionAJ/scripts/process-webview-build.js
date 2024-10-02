const fs = require("fs");
const path = require("path");

const buildPath = path.join(__dirname, "..", "webview-ui", "build");
const outputPath = path.join(__dirname, "..", "out", "webview");

// Ensure the output directory exists
if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

// Copy and rename the JavaScript file
const jsFiles = fs.readdirSync(path.join(buildPath, "static", "js"));
const jsFile = jsFiles.find((file) => file.endsWith(".js"));
if (jsFile) {
  fs.copyFileSync(
    path.join(buildPath, "static", "js", jsFile),
    path.join(outputPath, "webview.js"),
  );
}

// Copy and rename the CSS file
const cssFiles = fs.readdirSync(path.join(buildPath, "static", "css"));
const cssFile = cssFiles.find((file) => file.endsWith(".css"));
if (cssFile) {
  fs.copyFileSync(
    path.join(buildPath, "static", "css", cssFile),
    path.join(outputPath, "webview.css"),
  );
}

console.log("Webview build processed and copied to out/webview");
