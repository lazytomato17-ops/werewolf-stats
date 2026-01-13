import { createClient } from "@supabase/supabase-js";
import RankingBoard from "./RankingBoard"; // 作ったコンポーネントを読み込む

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export const revalidate = 0;

export default async function Home() {
  // 1. 全データを取得する
  const { data: results, error } = await supabase
    .from("game_results")
    .select("*");

  if (error) {
    return <div className="text-red-500 p-10">ERROR: {error.message}</div>;
  }

  // 2. データをRankingBoardに渡す（あとは任せた！）
  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 via-black to-black text-white py-10">
      {/* ここでTSのチェックが働く！
        もしresultsの形がRankingBoardで決めた型と違うと、ここで赤線が出る。
      */}
      <RankingBoard rawLogs={results || []} />
    </main>
  );
}