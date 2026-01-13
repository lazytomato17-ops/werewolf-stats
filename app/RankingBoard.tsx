"use client"; // ← これがあるとボタン操作などができるようになる

import { useState } from "react";

// 【TypeScript学習ポイント】
// ここで「データがどんな形をしているか」を定義します。
// これを書くと、code内で user.nme とかミスタイプした瞬間に赤線が出ます。
type GameLog = {
  user_id: string;
  user_name: string;
  role: string;   // 役職
  is_win: boolean;
};

type PlayerStat = {
  name: string;
  wins: number;
  games: number;
  winRate: number;
};

// 親（page.tsx）から受け取るデータの型
type Props = {
  rawLogs: GameLog[]; // 生の対戦履歴データを受け取る
};

export default function RankingBoard({ rawLogs }: Props) {
  // 選択中の役職を管理する（初期値は 'ALL'）
  const [filterRole, setFilterRole] = useState<string>("ALL");

  // 存在する役職の一覧を自動で作る（Setを使って重複を消す）
  const roles = ["ALL", ...Array.from(new Set(rawLogs.map((log) => log.role)))];

  // 【ロジック】データを集計する関数
  const calculateRanking = () => {
    const map = new Map<string, PlayerStat>();

    rawLogs.forEach((log) => {
      // 役職フィルタリング（ALLじゃない場合、その役職以外は無視）
      if (filterRole !== "ALL" && log.role !== filterRole) return;

      if (!map.has(log.user_id)) {
        map.set(log.user_id, {
          name: log.user_name || "Unknown",
          wins: 0,
          games: 0,
          winRate: 0,
        });
      }

      const player = map.get(log.user_id)!;
      player.games += 1;
      if (log.is_win) player.wins += 1;
    });

    // 配列にして計算してソート
    return Array.from(map.values())
      .map((p) => ({
        ...p,
        winRate: p.games > 0 ? (p.wins / p.games) * 100 : 0,
      }))
      .sort((a, b) => b.wins - a.wins); // 勝利数順
  };

  const ranking = calculateRanking();

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* タイトル（ネオン発光） */}
      <h1 className="text-5xl font-bold text-center mb-10 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]">
        BATTLE DATA
      </h1>

      {/* 役職切り替えタブ */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {roles.map((role) => (
          <button
            key={role}
            onClick={() => setFilterRole(role)}
            className={`px-6 py-2 rounded-full border transition-all duration-300 ${
              filterRole === role
                ? "bg-cyan-500 border-cyan-500 text-black font-bold shadow-[0_0_20px_rgba(6,182,212,0.6)] scale-110"
                : "bg-gray-900 border-gray-700 text-gray-400 hover:border-cyan-500 hover:text-cyan-400"
            }`}
          >
            {role === "ALL" ? "全戦績" : role}
          </button>
        ))}
      </div>

      {/* ランキング表 */}
      <div className="bg-black/50 backdrop-blur-md border border-gray-800 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(100,100,100,0.1)]">
        <div className="grid grid-cols-4 bg-gray-900/80 p-4 text-cyan-400 font-bold tracking-widest border-b border-gray-800">
          <div className="text-center">RANK</div>
          <div>PLAYER</div>
          <div className="text-center">WINS</div>
          <div className="text-center">RATE</div>
        </div>

        {ranking.map((player, index) => (
          <div
            key={player.name}
            className="grid grid-cols-4 p-5 border-b border-gray-800/50 hover:bg-cyan-900/20 transition-colors items-center group"
          >
            <div className="text-center font-bold text-2xl italic group-hover:text-cyan-300 transition-colors">
              #{index + 1}
            </div>
            <div className="font-bold text-lg tracking-wide">{player.name}</div>
            <div className="text-center text-xl">
              <span className="text-purple-400">{player.wins}</span>
              <span className="text-gray-600 text-sm mx-1">/</span>
              <span className="text-gray-500 text-sm">{player.games}</span>
            </div>
            <div className="text-center font-mono text-cyan-500 text-lg">
              {player.winRate.toFixed(1)}%
            </div>
          </div>
        ))}

        {ranking.length === 0 && (
          <div className="p-10 text-center text-gray-500">
            NO DATA FOUND
          </div>
        )}
      </div>
    </div>
  );
}