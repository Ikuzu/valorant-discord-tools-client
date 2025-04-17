import { exec } from 'child_process'
import { RiotMitmService } from './riot-mitm-service'
import { dialog } from 'electron'

const riotMitmService = new RiotMitmService()

export async function startValorant(guildId: string, discordUserId: string) {
  // Riot/Valorant が起動中か確認
  const running = await isRiotOrValorantRunning()
  if (running) {
    // 起動中であればダイアログで確認
    const result = dialog.showMessageBoxSync({
      type: 'question',
      title: 'Riot/Valorantが起動中です',
      message: 'Riot Client または Valorant がすでに起動しています。終了しますか？',
      buttons: ['OK', 'キャンセル'],
      cancelId: 1,
      defaultId: 0,
    })
    if (result === 0) {
      await killRiotAndValorant()
    } else {
      return false
    }
  }

  try {
    // Valorant を MITM 付きで起動
    await riotMitmService.start(guildId, discordUserId)
    return true
  } catch (err) {
    console.error('start-valorant error:', err)
    return false
  }
}

/** Riot/Valorant が起動しているかを tasklist で判定 */
async function isRiotOrValorantRunning(): Promise<boolean> {
  return new Promise((resolve) => {
    exec('tasklist', (err, stdout) => {
      if (err) {
        console.error('Failed to run tasklist:', err)
        return resolve(false)
      }
      const isRiotRunning = stdout.includes('RiotClientServices.exe')
      const isValorantRunning = stdout.includes('VALORANT-Win64-Shipping.exe')
      resolve(isRiotRunning || isValorantRunning)
    })
  })
}

/** Riot/Valorant を強制終了 */
async function killRiotAndValorant() {
  return new Promise<void>((resolve) => {
    let doneCount = 0
    const onFinish = (err: Error | null) => {
      if (err) {
        console.warn('[kill] エラー:', err.message)
      }
      doneCount++
      if (doneCount >= 2) {
        resolve()
      }
    }

    // Riot Client
    exec('taskkill /F /IM RiotClientServices.exe', onFinish)
    // Valorant
    exec('taskkill /F /IM VALORANT-Win64-Shipping.exe', onFinish)
  })
}
