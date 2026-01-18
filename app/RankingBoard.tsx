"use client";

import { useState } from "react";

// 1. 型定義に「created_at」を追加（連勝計算に必須！）
type GameLog = {
  user_id: string;
  user_name: string;
  role: string;
  is_win: boolean;
  created_at: string; // ← これがないと「どっちが新しい試合か」分からない
};

type PlayerStat = {
  name: string;
  wins: number;
  games: number;
  winRate: number;
  currentStreak: number; // ← 新しく追加！「現在の連勝数」
};

type Props = {
  rawLogs: GameLog[];
};

export default function RankingBoard({ rawLogs }: Props) {
  const [filterRole, setFilterRole] = useState<string>("ALL");
  const roles = ["ALL", ...Array.from(new Set(rawLogs.map((log) => log.role)))];

  const calculateRanking = () => {
    // 2. まず、データを集計用に整理する
    const tempMap = new Map<string, GameLog[]>();

    // プレイヤーごとに試合データを分ける
    rawLogs.forEach((log) => {
      // フィルター適用
      if (filterRole !== "ALL" && log.role !== filterRole) return;

      if (!tempMap.has(log.user_id)) {
        tempMap.set(log.user_id, []);
      }
      tempMap.get(log.user_id)!.push(log);
    });

    // 3. 各プレイヤーの成績＆連勝を計算
    const rankingData: PlayerStat[] = [];

    tempMap.forEach((logs, userId) => {
      // 日付が「新しい順」に並び替える (New -> Old)
      // これをしないと「昔の連勝」をカウントしてしまう
      logs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      // 合計などの基本データ
      const wins = logs.filter((l) => l.is_win).length;
      const games = logs.length;
      const name = logs[0].user_name || "Unknown"; // 最新の名前を使う

      // ★ここが連勝計算のロジック！★
      let streak = 0;
      for (const game of logs) {
        if (game.is_win) {
          streak++; // 勝ってたらカウントアップ
        } else {
          break;    // 一回でも負けたらそこでストップ（break）
        }
      }

      rankingData.push({
        name,
        wins,
        games,
        winRate: games > 0 ? (wins / games) * 100 : 0,
        currentStreak: streak, // 計算した連勝数を入れる
      });
    });

    // 勝利数順に並び替え
    return rankingData.sort((a, b) => b.wins - a.wins);
  };

  const ranking = calculateRanking();

  return (
    <div className="max-w-5xl mx-auto p-4 font-sans">
      <h1 className="text-5xl font-bold text-center mb-10 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)] font-[Orbitron]">
        BATTLE DATA
      </h1>

      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {roles.map((role) => (
          <button
            key={role}
            onClick={() => setFilterRole(role)}
            className={`px-6 py-2 rounded-full border transition-all duration-300 font-[Orbitron] tracking-wider ${
              filterRole === role
                ? "bg-cyan-500 border-cyan-500 text-black font-bold shadow-[0_0_20px_rgba(6,182,212,0.6)] scale-110"
                : "bg-gray-900 border-gray-700 text-gray-400 hover:border-cyan-500 hover:text-cyan-400"
            }`}
          >
            {role === "ALL" ? "ALL LOGS" : role.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="bg-black/60 backdrop-blur-md border border-gray-800 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        {/* ヘッダーにSTREAK（連勝）を追加 */}
        <div className="grid grid-cols-5 bg-gray-900/80 p-4 text-cyan-400 font-bold tracking-widest border-b border-gray-800 font-[Orbitron]">
          <div className="text-center">RANK</div>
          <div className="col-span-1">PLAYER</div>
          <div className="text-center">WINS</div>
          <div className="text-center">RATE</div>
          <div className="text-center text-orange-400">STREAK</div>
        </div>

        {ranking.map((player, index) => (
          <div
            key={player.name}
            className="grid grid-cols-5 p-5 border-b border-gray-800/50 hover:bg-cyan-900/20 transition-colors items-center group"
          >
            <div className="text-center font-bold text-2xl italic text-gray-500 group-hover:text-cyan-300 transition-colors font-[Orbitron]">
              #{index + 1}
            </div>
            <div className="font-bold text-lg tracking-wide truncate">{player.name}</div>
            
            <div className="text-center text-xl font-[Orbitron]">
              <span className="text-purple-400">{player.wins}</span>
              <span className="text-gray-600 text-sm mx-1">/</span>
              <span className="text-gray-500 text-sm">{player.games}</span>
            </div>
            
            <div className="text-center font-mono text-cyan-500 text-lg">
              {player.winRate.toFixed(1)}%
            </div>

            {/* 連勝数の表示エリア */}
            <div className="text-center font-bold text-xl">
              {player.currentStreak >= 2 ? (
                // 2連勝以上なら炎アイコンを出して光らせる
                <span className="text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.8)] animate-pulse">
                  🔥 {player.currentStreak}
                </span>
              ) : (
                <span className="text-gray-600">-</span>
              )}
            </div>
          </div>
        ))}

        {ranking.length === 0 && (
          <div className="p-10 text-center text-gray-500 font-[Orbitron]">
            NO DATA FOUND
          </div>
        )}
      </div>
    </div>
  );
}
