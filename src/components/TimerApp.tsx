"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import Controls from "./Controls";
import MetadataUpdater from "./MetadataUpdater";
import TimerDisplay from "./TimerDisplay";
import { useState, useEffect } from "react";
import { useReward } from "react-rewards";
import { playNotificationSound } from "@/utile/sound";
import { generateRefreshSuggestion } from "@/utile/gemini";

//タイマーのモードを表す型
type Mode = "work" | "break";

export default function TimerApp() {
  const {reward: confetti, isAnimating } = useReward("confettiReward","confetti",{
    elementCount: 100,
    spread: 70,
    decay: 0.93,
    lifetime: 150,
  });

  //タイマーの実行状態を管理するstate
  const [isRunning, setIsRunning] = useState(false);

  //作業時間・休憩時間を管理する状態変数
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);

  //タイマーの残り時間を保持する状態変数(関数)
  const [timeLeft, setTimeLeft] = useState({ minutes: workDuration, seconds: 0 });

  //モードの状態を管理する変数
  const [mode, setMode] = useState<Mode>("work");

  //自動開始の設定
  const [autoStart, setAutoStart] = useState(false);

  //モードを切り替える関数
  const toggleMode = () => {
    //現在のモードを反対のモードに切り替える
    const newMode = mode === "work" ? "break" : "work";
    setMode(newMode);

    //モードに応じてタイマーの時間をリセット
    //作業モードなら25分、休憩モードなら5分
    setTimeLeft({
      minutes: newMode === "work" ? workDuration : breakDuration,
      seconds: 0,
    });

    //自動開始がONの場合は次のセッションを自動的に開始
    setIsRunning(autoStart);
  };

  //開始/停止ボタンのハンドラ
  const handleStart = () => {
    setIsRunning(!isRunning);
  };

  //リセットボタンのハンドラ
  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft({
      minutes: mode === "work" ? workDuration : breakDuration,
      seconds: 0,
    });
  };

  useEffect(() => {
    //setIntervalの戻り値（タイマーID）を保持する変数
    let intervalId: NodeJS.Timeout;

    //タイマーが実行中の場合のみ処理を行う
    if (isRunning) {
      //1秒（1000ミリ秒）ごとに実行される処理を設定しつつ、
      //戻り値（タイマーID）をintervalId変数に再セット
      intervalId = setInterval(() => {
        setTimeLeft((prev) => {
          //秒数が0の場合の動作
          if (prev.seconds === 0) {
            //分数が0の場合（タイマー終了）
            if (prev.minutes === 0) {
              setIsRunning(false); //タイマーを停止
              if (mode === "work"){
                void confetti(); //紙吹雪を表示
              }
              void playNotificationSound();

              //少し遅延させてからモード切り替えと自動開始を実行
              setTimeout(() => {
                 toggleMode(); //モードを自動切り替え
              }, 100);
              return prev; //現在の状態（0分0秒）を返す
            }
            //分数がまだ残っている場合は、分を1減らして秒を59にセット
            return { minutes: prev.minutes - 1, seconds: 59 };
          }
          //秒数が1以上の場合は、秒を1減らす
          return { ...prev, seconds: prev.seconds - 1 };
        });
      }, 1); //動作確認用に一時的に1ミリ秒ごとに実行　1000
    }

    //クリーンアップ関数（コンポーネントのアンマウント時やisRunningが変わる前）
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isRunning]); //isRunningが変わった時だけこのエフェクトを再実行

  // // ================== 動作確認用ここから ==================
   //useEffect(() => {
     //const testGemini = async () => {
       //const suggestion = await generateRefreshSuggestion();
       //console.log(suggestion);
     //}
     //testGemini();
   //}, []);
  // // ================== 動作確認用ここまで ==================
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
      <span
       id="confettiReward"
       className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            {mode === "work" ? "作業時間" : "休憩時間"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <TimerDisplay
            minutes={timeLeft.minutes}
            seconds={timeLeft.seconds}
            mode={mode}
          />
          <Controls
            onStart={handleStart}
            onReset={handleReset}
            onModeToggle={toggleMode}
            isRunning={isRunning}
          />
        </CardContent>
        <CardFooter className="flex flex-col gap-4 w-full max-w-[200px] mx-auto">
          {/* 作業時間の設定 */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium min-w-[4.5rem]">作業時間</label>
            <select
              value={workDuration}
              onChange={(e) => {
                const newDuration = parseInt(e.target.value);
                setWorkDuration(newDuration);
                if (mode === "work" && !isRunning){
                  setTimeLeft({ minutes: newDuration, seconds:0 });
                }
              }}
              className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {[5, 10, 15, 25, 30, 45, 60].map((minutes) =>(
                <option
                  key={minutes}
                  value={minutes}
                  >
                    {minutes}分
                  </option>
              ))}
            </select>
          </div>

          {/* 休憩時間の設定 */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium min-w-[4.5rem]">休憩時間</label>
            <select
              value={breakDuration}
              onChange={(e) => {
                const newDuration = parseInt(e.target.value);
                setBreakDuration(newDuration);
                if (mode === `break` && !isRunning){
                  setTimeLeft({ minutes: newDuration, seconds:0 });
                }
              }}
              className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {[5, 10, 15, 60 ].map((minutes) =>(
                <option
                  key={minutes}
                  value={minutes}
                  >
                    {minutes}分
                  </option>
              ))}
            </select>
          </div>

          {/* 自動開始の設定 */}
          <div className="flex items-center gap-2 w-full justify-between" > {/* 講義ではw-fullを記述しているが、行頭が飛び出して合わないので記述していない  */}
            <label className="text-sm font-medium min-w-[4.5rem]">自動開始</label>
            <Switch
              checked={autoStart}
              onCheckedChange={() => setAutoStart(!autoStart)}
              className="cursor-pointer"
            />
          </div>
       </CardFooter>
      </Card>
      <MetadataUpdater
        minutes={timeLeft.minutes}
        seconds={timeLeft.seconds}
        mode={mode}
      />
    </div>
  );
}
