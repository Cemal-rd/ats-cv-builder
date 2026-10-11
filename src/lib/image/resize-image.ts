/**
 * Yüklenen fotoğrafı kare olarak ortadan kırpar ve küçültür.
 * Sonuç ~20–40 KB'lık bir JPEG data URL'idir; localStorage ve JSON yedeği şişirmez.
 */
export async function resizeImageToDataUrl(file: File, size = 360, quality = 0.85): Promise<string> {
  const bitmap = await createImageBitmap(file);
  try {
    const side = Math.min(bitmap.width, bitmap.height);
    const sx = (bitmap.width - side) / 2;
    const sy = (bitmap.height - side) / 2;

    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas desteklenmiyor");

    context.fillStyle = "#fff";
    context.fillRect(0, 0, size, size);
    context.drawImage(bitmap, sx, sy, side, side, 0, 0, size, size);
    return canvas.toDataURL("image/jpeg", quality);
  } finally {
    bitmap.close();
  }
}
