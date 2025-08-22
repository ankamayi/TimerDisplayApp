//geminiを扱うためのライブラリをimport
import { GoogleGenAI } from '@google/genai';

//NextResponseというnext.js用の、APIのresponseを受取る為のクラスをimport
//構文については next.js responseでググると構文がでてくる。今回はjsonで取得
//https://nextjs.org/docs/app/api-reference/functions/next-response
import { NextResponse } from 'next/server';


//GEMINI_API_KEYという定数の中に環境変数を読み込んで格納
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apikey: GEMINI_API_KEY });

export async function GET() {
    const prompt = `
     # 命令
     作業の合間にできる簡単なリフレッシュ方法を１つ提案してください。
     
     # 制約事項
     - 1~2分程度でできること
     - 室内でできること
     - 体を動かすこと
     - 絵文字を１つ含めること
     - 簡潔に1文の中に収めること
     - 「～しよう」のように提案する形で終わること

     # 出力例
     - 大きく背伸びしよう🙆‍♂️
     - 室内で少し歩こう🚶‍➡️
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: prompt,
    });
    return NextResponse.json({ suggestion: response.text }, { status: 200})
}