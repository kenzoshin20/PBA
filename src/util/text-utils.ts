


export function getTextLines(fullText: string, maxLineLength: number): string[] {
  const lines: string[] = []
  let currentLine = ''
  if (fullText && fullText.length) {
    const words = fullText.split(' ').map(w => w.trim())
    words.forEach(word => {
      if (currentLine.length + word.length <= maxLineLength) {
        currentLine += word + ' '
      } else {
        lines.push(currentLine.trim())
        currentLine = word + ' '
      }
    })
    if (currentLine) {
      lines.push(currentLine.trim())
    }
  }
  return lines
}