interface parsedMessage {
  messageId: string
  timestamp: string
  from: string
  to: string
  content: string
}

export function parseMessage(raw: string): parsedMessage | null {
  const stampMatch = raw.match(/stamp=['"]([^'"]+)['"]/)
  const idMatch = raw.match(/id=['"]([^'"]+)['"]/)
  const fromMatch = raw.match(/from=['"]([^'"]+)['"]/)
  const toMatch = raw.match(/to=['"]([^'"]+)['"]/)
  const bodyMatch = raw.match(/<body>(.*?)<\/body>/s)

  if (!stampMatch || !idMatch || !bodyMatch) return null

  const msgTime = new Date(stampMatch[1])
  msgTime.setHours(msgTime.getHours() + 9)

  return {
    messageId: idMatch[1],
    timestamp: msgTime.toISOString(),
    from: fromMatch?.[1] ?? '',
    to: toMatch?.[1] ?? '',
    content: bodyMatch[1],
  }
}
