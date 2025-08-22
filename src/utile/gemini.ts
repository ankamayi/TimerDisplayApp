//APIルートを呼び出してリフレッシュ提案を作成
export async function generateRefreshSuggestion(): Promise<string> {
    try {
        //APIを呼び出す（geminiのAPIではない。geminiAPIを使用する為のアプリ内の窓口）
        const response = await fetch('/api/refresh-suggestion')
        const data = await response.json();

        // data = { suggestion: "深呼吸をしましょう"}
        return data.suggestion;
    } catch(error) {
        console.error(error);
        return "エラーが発生しました";
    }
}