import {
  Channel,
  TextChannel,
  DMChannel,
  NewsChannel,
  MessagePayload,
  MessageCreateOptions
} from 'discord.js'

/**
 * メッセージをチャンネルに送信するユーティリティ関数
 * @param channel 送信先のチャンネル
 * @param content 送信するメッセージ内容
 */
export function sendMessage(
  channel: Channel,
  content: string | MessagePayload | MessageCreateOptions
) {
  // チャンネルがテキスト系のチャンネルであれば送信
  if (channel.isTextBased() && 'send' in channel) {
    ;(channel as TextChannel | DMChannel | NewsChannel).send(content).catch((err) => {
      console.error('メッセージ送信中にエラーが発生しました:', err)
    })
  } else {
    console.error('メッセージ送信がサポートされていないチャンネルです。')
  }
}
