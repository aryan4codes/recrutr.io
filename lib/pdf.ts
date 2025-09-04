import pdf from 'pdf-parse'

export async function fetchArrayBuffer(url: string, headers?: Record<string, string>): Promise<ArrayBuffer> {
  const res = await fetch(url, { headers, cache: 'no-store' })
  if (!res.ok) throw new Error(`Failed to download file: ${res.status} ${res.statusText}`)
  return await res.arrayBuffer()
}

export function cleanExtractedText(txt: string): string {
  let t = txt || ''
  t = t.replace(/\r/g, '\n')
  t = t.replace(/[ \t]+/g, ' ')
  t = t.replace(/\n{3,}/g, '\n\n')
  t = t.replace(/https?:\/\/\S+/g, '')
  return t.trim().slice(0, 20000)
}

export async function extractTextFromPdfUrl(url: string, headers?: Record<string, string>): Promise<string> {
  const buf = Buffer.from(await fetchArrayBuffer(url, headers))
  const data = await pdf(buf)
  return cleanExtractedText(data.text || '')
}


