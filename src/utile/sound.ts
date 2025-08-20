import { resolve } from "path";

export async function playNotificationSound() {
  try {
    //Audioオブジェクトを作成
    const audio = new Audio("/Videobyminami372hamabe.mp4"); //美波に変更
    //const audio = new Audio("/notification.mp3");

    //0.3を記述した場合は音源の30％の音量となる
    audio.volume = 1;

    //音声を再生
    await audio.play();

    //音声の再生が完了するまで待機
    return new Promise<void>((resolve) => {
      audio.onended = () => {
        resolve();
      };
    });
  } catch (error) {
    console.error("通知音の再生に失敗しました:", error);
  }
}
