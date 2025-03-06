import QRCode from 'qrcode'

export async function generateQRCode(data) {
    try {
      return await QRCode.toDataURL(data); // Generates a base64-encoded image
    } catch (err) {
      console.error("QR Code generation failed:", err);
      return null;
    }
  }
  