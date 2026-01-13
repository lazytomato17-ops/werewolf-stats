import { createClient } from '@supabase/supabase-js';

// Supabase接続設定
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// 常に最新データを取得
export const revalidate = 0;

// 集計用の型定義
type PlayerStat = {
  userId: string;
  name: string;
  wins: number;
  gamesPlayed: number;
  winRate: number;
};

export default async function Home() {
  // 1. game_results（試合結果ログ）を全部取ってくる
  const { data: results, error } = await supabase
    .from('game_results')
    .select('*');

  if (error) {
    return <div className="text-white">エラー: {error.message}</div>;
  }

  // 2. ログを集計してランキングを作る（ここが頭脳プレー！）
  const statsMap = new Map<string, PlayerStat>();

  results?.forEach((game) => {
    // まだ登録されてないプレイヤーなら初期化
    if (!statsMap.has(game.user_id)) {
      statsMap.set(game.user_id, {
        userId: game.user_id,
        name: game.user_name || '名無し',
        wins: 0,
        gamesPlayed: 0,
        winRate: 0,
      });
    }

    // データを加算
    const player = statsMap.get(game.user_id)!;
    player.gamesPlayed += 1;
    if (game.is_win) {
      player.wins += 1;
    }
    // 最新の名前に更新（名前変えたとき用）
    if (game.user_name) {
      player.name = game.user_name;
    }
  });

  // 3. Mapを配列に変換して、勝率計算 ＆ 並び替え
  const ranking = Array.from(statsMap.values())
    .map(p => ({
      ...p,
      winRate: p.gamesPlayed > 0 ? (p.wins / p.gamesPlayed) * 100 : 0
    }))
    .sort((a, b) => b.wins - a.wins); // 勝利数が多い順（勝率順なら b.winRate - a.winRate）

  return (
    <main className="min-h-screen bg-black text-white p-8 font-sans">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center text-blue-500 tracking-wider">
          🐺 JINRO RANKING
        </h1>

        <div className="bg-gray-900 rounded-xl overflow-hidden shadow-2xl border border-gray-800">
          <div className="grid grid-cols-4 bg-gray-800 p-4 font-bold text-gray-300">
            <div className="text-center">順位</div>
            <div>プレイヤー名</div>
            <div className="text-center">勝利数</div>
            <div className="text-center">勝率</div>
          </div>

          {ranking.map((player, index) => {
            const rankColor = index === 0 ? "text-yellow-400" : index === 1 ? "text-gray-300" : index === 2 ? "text-orange-400" : "text-white";
            
            return (
              <div key={player.userId} className="grid grid-cols-4 p-4 border-b border-gray-800 hover:bg-gray-800 transition-colors items-center">
                <div className={`text-center font-bold text-xl ${rankColor}`}>#{index + 1}</div>
                <div className="font-medium truncate">{player.name}</div>
                <div className="text-center text-blue-300">
                  {player.wins} / <span className="text-gray-500 text-sm">{player.gamesPlayed}</span>
                </div>
                <div className="text-center text-gray-400">{player.winRate.toFixed(1)}%</div>
              </div>
            );
          })}
          
          {ranking.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              まだ対戦データがありません
            </div>
          )}
        </div>
      </div>
    </main>
  );
}