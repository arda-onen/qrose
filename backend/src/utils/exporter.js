import path from "path";
import fs from "fs-extra";
import archiver from "archiver";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXPORT_TEMPLATE = {
  html: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>QR Menu</title>
    <link rel="stylesheet" href="./style.css" />
  </head>
  <body>
    <div class="container">
      <header>
        <h1 id="menu-name"></h1>
        <p id="restaurant-name"></p>
        <select id="lang-select"></select>
      </header>
      <main id="menu-content"></main>
    </div>
    <script src="./script.js"></script>
  </body>
</html>
`,
  css: `body {
  margin: 0;
  background: #111827;
  color: #f9fafb;
  font-family: Arial, sans-serif;
}
.container {
  max-width: 720px;
  margin: 0 auto;
  padding: 16px;
}
header {
  position: sticky;
  top: 0;
  background: #111827;
  padding-bottom: 12px;
}
select {
  width: 100%;
  padding: 10px;
  margin-top: 8px;
}
.category {
  margin-top: 16px;
}
.item {
  border: 1px solid #374151;
  border-radius: 12px;
  padding: 10px;
  margin-top: 8px;
}
.item img {
  width: 100%;
  border-radius: 8px;
}
`,
  js: `async function loadMenu() {
  const response = await fetch("./menu.json");
  const menu = await response.json();
  const langSelect = document.getElementById("lang-select");
  document.getElementById("menu-name").textContent = menu.name;
  document.getElementById("restaurant-name").textContent = menu.restaurant_name;

  menu.supported_languages.forEach((code) => {
    const option = document.createElement("option");
    option.value = code;
    option.textContent = code.toUpperCase();
    langSelect.appendChild(option);
  });

  function render(languageCode) {
    const content = document.getElementById("menu-content");
    content.innerHTML = "";
    menu.categories.forEach((category) => {
      const categoryBlock = document.createElement("section");
      categoryBlock.className = "category";
      const title = document.createElement("h2");
      title.textContent = category.name;
      categoryBlock.appendChild(title);

      category.items.forEach((item) => {
        const translation =
          item.translations.find((x) => x.language_code === languageCode) ||
          item.translations[0];
        const card = document.createElement("article");
        card.className = "item";
        if (item.image) {
          const image = document.createElement("img");
          image.src = item.image;
          image.alt = translation?.item_name || "";
          card.appendChild(image);
        }
        const name = document.createElement("h3");
        name.textContent = translation?.item_name || "Unnamed item";
        const desc = document.createElement("p");
        desc.textContent = translation?.description || "";
        const price = document.createElement("strong");
        price.textContent = "$" + Number(item.price).toFixed(2);
        card.append(name, desc, price);
        categoryBlock.appendChild(card);
      });
      content.appendChild(categoryBlock);
    });
  }

  langSelect.addEventListener("change", () => render(langSelect.value));
  render(menu.supported_languages[0] || "en");
}

loadMenu();
`
};

export async function generateStaticExport(menuData) {
  const exportBaseDir = path.resolve(__dirname, "../../generated/exports");
  const menuDir = path.join(exportBaseDir, menuData.slug);
  const imagesDir = path.join(menuDir, "images");
  const zipPath = path.join(exportBaseDir, `${menuData.slug}.zip`);

  await fs.remove(menuDir);
  await fs.ensureDir(imagesDir);
  await fs.ensureDir(exportBaseDir);

  await fs.writeFile(path.join(menuDir, "index.html"), EXPORT_TEMPLATE.html, "utf8");
  await fs.writeFile(path.join(menuDir, "style.css"), EXPORT_TEMPLATE.css, "utf8");
  await fs.writeFile(path.join(menuDir, "script.js"), EXPORT_TEMPLATE.js, "utf8");

  const copiedMenu = { ...menuData };
  if (copiedMenu.hero_image && copiedMenu.hero_image.startsWith("/uploads/")) {
    const heroFileName = path.basename(copiedMenu.hero_image);
    const heroSource = path.resolve(__dirname, "../../", copiedMenu.hero_image.replace(/^\//, ""));
    const heroTarget = path.join(imagesDir, heroFileName);
    if (await fs.pathExists(heroSource)) {
      await fs.copy(heroSource, heroTarget);
      copiedMenu.hero_image = `./images/${heroFileName}`;
    }
  }

  for (const category of copiedMenu.categories) {
    for (const item of category.items) {
      if (!item.image || !item.image.startsWith("/uploads/")) {
        continue;
      }
      const imageFileName = path.basename(item.image);
      const source = path.resolve(__dirname, "../../", item.image.replace(/^\//, ""));
      const target = path.join(imagesDir, imageFileName);
      if (await fs.pathExists(source)) {
        await fs.copy(source, target);
        item.image = `./images/${imageFileName}`;
      }
    }
  }

  await fs.writeJson(path.join(menuDir, "menu.json"), copiedMenu, { spaces: 2 });
  await createZip(menuDir, zipPath);

  return {
    folderPath: menuDir,
    zipPath
  };
}

function createZip(sourceDir, zipPath) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", resolve);
    archive.on("error", reject);
    archive.pipe(output);
    archive.directory(sourceDir, false);
    archive.finalize();
  });
}
