import sharp from 'sharp'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB

export interface CompressOptions {
  width:   number
  height:  number
  quality: number
  fit?:    'cover' | 'contain' | 'fill' | 'inside' | 'outside'
}

export const AVATAR_OPTIONS: CompressOptions  = { width: 400,  height: 400,  quality: 80, fit: 'cover'  }
export const RECIPE_OPTIONS: CompressOptions  = { width: 1200, height: 800,  quality: 82, fit: 'inside' }

/** Valide et compresse une image, retourne une data URL WebP base64. */
export async function processImage(
  file: File,
  options: CompressOptions
): Promise<{ dataUrl: string; sizeKb: number }> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Fichier trop volumineux (max 5 Mo)')
  }
  if (!file.type.startsWith('image/')) {
    throw new Error('Le fichier doit être une image')
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  const compressed = await sharp(buffer)
    .resize(options.width, options.height, { fit: options.fit ?? 'cover' })
    .webp({ quality: options.quality })
    .toBuffer()

  const dataUrl = `data:image/webp;base64,${compressed.toString('base64')}`
  const sizeKb  = Math.round(compressed.length / 1024)

  return { dataUrl, sizeKb }
}
