'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Controls from "./Controls";
import TimerDisplay from './TimerDisplay';
import { useState, useEffect } from 'react';

//タイマーのモードを表す型
type Mode = 'work' | 'break';

export default function TimerApp() {
    //タイマーの実行状態を管理するstate
    const [isRunning, setIsRunning] = useState(false);

    //タイマーの残り時間を保持する状態変数(関数)
    const [timeLeft, setTimeLeft] = useState({minutes: 25, seconds: 0 });

    //モードの状態を管理する変数
    const [mode, setMode] = useState<Mode>('work');

    //モードを切り替える関数
    const toggleMode = () => {
        //現在のモードを反対のモードに切り替える
        const newMode = mode === 'work' ? 'break' : 'work';
        setMode(newMode);

        //モードに応じてタイマーの時間をリセット
        //作業モードなら25分、休憩モードなら5分
        setTimeLeft({
            minutes: newMode === "work" ? 25 : 5,
            seconds: 0,
        });

        //タイマーを停止状態にする
        setIsRunning(false);
    };

    //開始/停止ボタンのハンドラ
    const handleStart = () => {
        setIsRunning(!isRunning);
    }
    
    //リセットボタンのハンドラ
    const handleReset = () => {
        setIsRunning(false);
        setTimeLeft({minutes: 25, seconds: 0 });
    };
    
    useEffect(() => {
        //setIntervalの戻り値（タイマーID）を保持する変数
        let intervalId: NodeJS.Timeout;

        if (isRunning) {
            intervalId = setInterval(() => {
                setTimeLeft((prev) => {
                    //秒数が0の場合の動作
                    if (prev.seconds === 0) {
                        //分数が0の場合（タイマー終了）
                        if (prev.minutes === 0) {
                            setIsRunning(false); //タイマーを停止
                            return prev; //現在の状態（0分0秒）を返す
                        }
                        //分数がまだ残っている場合は、分を1減らして秒を59にセット
                        return { minutes: prev.minutes - 1, seconds: 59 };
                    }
                    //秒数が1以上の場合は、秒を1減らす
                    return { ...prev, seconds: prev.seconds - 1 };
                });
            }, 1000);
        }

        //クリーンアップ関数
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [isRunning]);

    return (
        <div className='min-h-screen flex items-center justify-center bg-background p-4'>
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className='text-2xl font-bold text-center'>
                        {mode === 'work' ? '作業時間' : '休憩時間'}
                    </CardTitle>
                </CardHeader>
                <CardContent className='flex flex-col items-center gap-6'>
                    <TimerDisplay
                        minutes={timeLeft.minutes}
                        seconds={timeLeft.seconds}
                    />
                    <Controls
                        onStart={handleStart}
                        onReset={handleReset}
                        onModeToggle={toggleMode}
                        isRunning={isRunning}
                    />
                </CardContent>
            </Card>
        </div>
    )
}