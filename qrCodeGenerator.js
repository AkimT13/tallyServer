import QRCode from "qrcode";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TEMP_QR_PATH = path.join(__dirname, "temp-qrcode.png"); 

export async function generateQRCode(data) {
  try {
    
    await QRCode.toFile(TEMP_QR_PATH, data);
    return TEMP_QR_PATH; 
  } catch (err) {
    console.error("QR Code generation failed:", err);
    return null;
  }
}
