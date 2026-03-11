import path from "path";
import fs from "fs-extra";
import QRCode from "qrcode";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const qrDir = path.resolve(__dirname, "../../generated/qrcodes");

export async function generateMenuQr(menuId, slug) {
  await fs.ensureDir(qrDir);
  const relativePath = path.join("generated", "qrcodes", `menu-${menuId}.png`);
  const outputPath = path.resolve(__dirname, "../../", relativePath);
  const menuUrl = `${process.env.PUBLIC_BASE_URL}/menu/${slug}`;

  await QRCode.toFile(outputPath, menuUrl, {
    type: "png",
    margin: 2,
    width: 512
  });

  return `/${relativePath.replaceAll("\\", "/")}`;
}
