import QRCode from "qrcode";
//import Jimp from "jimp"; // No need for '* as Jimp' unless using CommonJS
import { uploadToS3 } from "./s3Service.js"; // Ensure this function is correctly exported in s3Service.js

const generateQRCode = async (data, color = "#000000", logoUrl = "") => {
  try {
    const qrBuffer = await QRCode.toBuffer(data, { color: { dark: color, light: "#FFFFFF" } });

    if (logoUrl) {
      const Jimp = (await import("jimp")).default; // ✅ Fix: Use dynamic import for Jimp
      const qrImage = await Jimp.read(qrBuffer);
      const logo = await Jimp.read(logoUrl);

      logo.resize(qrImage.bitmap.width / 5, Jimp.AUTO);
      const x = (qrImage.bitmap.width - logo.bitmap.width) / 2;
      const y = (qrImage.bitmap.height - logo.bitmap.height) / 2;

      qrImage.composite(logo, x, y, { mode: Jimp.BLEND_SOURCE_OVER });

      const finalBuffer = await qrImage.getBufferAsync(Jimp.MIME_PNG);
      return await uploadToS3(finalBuffer, "qr-code.png"); // Ensure function is awaited
    }

    return await uploadToS3(qrBuffer, "qr-code.png"); // Ensure function is awaited
  } catch (err) {
    console.error("QR Code Generation Error:", err);
    throw new Error("QR Code generation failed");
  }
};

// ✅ Fix export format (default export)
export default generateQRCode;
