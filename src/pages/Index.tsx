import { useState } from "react";
import Icon from "@/components/ui/icon";

type Tab = "profile" | "shop" | "leaderboard";

const PLAYER = {
  name: "GHOST_X",
  level: 27,
  xp: 7340,
  xpMax: 10000,
  rank: "A",
  coins: 4850,
  gems: 124,
  avatar: "🎮",
  wins: 183,
  losses: 47,
  kills: 2941,
  hours: 312,
  winStreak: 7,
};

const SHOP_ITEMS = [
  { id: 1, name: "Клинок Бури", type: "legendary", emoji: "⚔️", price: 1200, gems: 0, desc: "Легендарное оружие +35 ATK" },
  { id: 2, name: "Щит Пустоты", type: "epic", emoji: "🛡️", price: 800, gems: 0, desc: "Эпическая броня +50 DEF" },
  { id: 3, name: "Сапоги Тени", type: "rare", emoji: "👟", price: 450, gems: 0, desc: "Редкие +25% скорость" },
  { id: 4, name: "Ауры Хаоса", type: "epic", emoji: "💜", price: 0, gems: 30, desc: "Эффект ауры для персонажа" },
  { id: 5, name: "Маска Демона", type: "legendary", emoji: "👺", price: 0, gems: 80, desc: "Легендарный облик" },
  { id: 6, name: "XP Буст ×2", type: "common", emoji: "⚡", price: 200, gems: 0, desc: "Двойной опыт 24 часа" },
  { id: 7, name: "Корона Победы", type: "epic", emoji: "👑", price: 0, gems: 55, desc: "Редкий косметический облик" },
  { id: 8, name: "Дракон-Питомец", type: "legendary", emoji: "🐉", price: 2500, gems: 0, desc: "Легендарный компаньон" },
];

const LEADERS = [
  { rank: 1, name: "SHADOW_KING", level: 99, score: 98420, wins: 847, avatar: "🔥" },
  { rank: 2, name: "VIPER_X", level: 87, score: 91230, wins: 702, avatar: "🐍" },
  { rank: 3, name: "NEON_GHOST", level: 82, score: 85900, wins: 633, avatar: "👻" },
  { rank: 4, name: "IRON_WOLF", level: 76, score: 79440, wins: 578, avatar: "🐺" },
  { rank: 5, name: "GHOST_X", level: 27, score: 43210, wins: 183, avatar: "🎮", isMe: true },
  { rank: 6, name: "CYBER_ACE", level: 61, score: 67350, wins: 512, avatar: "🤖" },
  { rank: 7, name: "RAVEN_7", level: 58, score: 62810, wins: 487, avatar: "🦅" },
  { rank: 8, name: "STORM_X", level: 54, score: 58920, wins: 441, avatar: "⚡" },
];

const MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };
const RANK_COLORS: Record<string, string> = {
  legendary: "text-yellow-400",
  epic: "text-purple-400",
  rare: "text-blue-400",
  common: "text-gray-400",
};

export default function Index() {
  const [tab, setTab] = useState<Tab>("profile");
  const [shopFilter, setShopFilter] = useState<string>("all");
  const [ownedItems, setOwnedItems] = useState<number[]>([3]);
  const [coins, setCoins] = useState(PLAYER.coins);
  const [gems, setGems] = useState(PLAYER.gems);
  const [buyMsg, setBuyMsg] = useState<string | null>(null);

  const xpPercent = Math.round((PLAYER.xp / PLAYER.xpMax) * 100);

  const filteredItems = SHOP_ITEMS.filter(i =>
    shopFilter === "all" ? true : i.type === shopFilter
  );

  const handleBuy = (item: typeof SHOP_ITEMS[0]) => {
    if (ownedItems.includes(item.id)) return;
    if (item.price > 0 && coins >= item.price) {
      setCoins(c => c - item.price);
      setOwnedItems(o => [...o, item.id]);
      setBuyMsg(`✅ Куплено: ${item.name}`);
    } else if (item.gems > 0 && gems >= item.gems) {
      setGems(g => g - item.gems);
      setOwnedItems(o => [...o, item.id]);
      setBuyMsg(`✅ Куплено: ${item.name}`);
    } else {
      setBuyMsg(`❌ Недостаточно ресурсов`);
    }
    setTimeout(() => setBuyMsg(null), 2500);
  };

  return (
    <div className="min-h-screen text-foreground pb-12">
      <div className="scanline-overlay" />

      {/* HEADER */}
      <header className="hud-panel border-x-0 border-t-0 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded flex items-center justify-center bg-[rgba(0,255,229,0.12)] border border-[rgba(0,255,229,0.3)]">
              <span className="text-sm">⚔️</span>
            </div>
            <span className="font-oswald font-bold text-xl tracking-widest neon-text-cyan">NEXUS ARENA</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-sm font-rajdhani font-semibold">
              <span className="text-yellow-400">🪙</span>
              <span className="text-yellow-300">{coins.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1 text-sm font-rajdhani font-semibold">
              <span>💎</span>
              <span className="neon-text-purple">{gems}</span>
            </div>
            <div className="flex items-center gap-2 border border-[rgba(0,255,229,0.25)] px-3 py-1 rounded">
              <span className="text-lg">{PLAYER.avatar}</span>
              <div>
                <div className="font-rajdhani font-bold text-xs neon-text-cyan tracking-wider">{PLAYER.name}</div>
                <div className="text-[10px] text-[var(--muted-foreground)] font-rajdhani">LVL {PLAYER.level}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* NAV */}
      <nav className="border-b border-[rgba(0,255,229,0.12)] bg-[rgba(0,0,0,0.3)]">
        <div className="max-w-5xl mx-auto px-4 flex gap-1">
          {([
            { id: "profile", label: "Профиль", icon: "User" },
            { id: "shop", label: "Магазин", icon: "ShoppingBag" },
            { id: "leaderboard", label: "Лидеры", icon: "Trophy" },
          ] as { id: Tab; label: string; icon: string }[]).map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`nav-btn flex items-center gap-2 ${tab === t.id ? "active" : ""}`}
            >
              <Icon name={t.icon} size={14} />
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-6">

        {/* PROFILE */}
        {tab === "profile" && (
          <div className="animate-float-up space-y-5">
            <div className="hud-panel rounded-sm p-6 corner-cut">
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                <div className="relative">
                  <div
                    className="w-24 h-24 rounded border-2 border-[rgba(0,255,229,0.5)] flex items-center justify-center text-5xl bg-[rgba(0,255,229,0.06)]"
                    style={{ boxShadow: "var(--glow-cyan)" }}
                  >
                    {PLAYER.avatar}
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                    <span className="rank-badge rank-a">РАНГ {PLAYER.rank}</span>
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <h1 className="font-oswald text-3xl font-bold neon-text-cyan tracking-widest">{PLAYER.name}</h1>
                    <p className="text-[var(--muted-foreground)] text-sm font-rajdhani mt-0.5">Серийный убийца боссов • Онлайн</p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center font-rajdhani text-xs">
                      <span className="neon-text-cyan font-bold tracking-wider">УРОВЕНЬ {PLAYER.level}</span>
                      <span className="text-[var(--muted-foreground)]">{PLAYER.xp.toLocaleString()} / {PLAYER.xpMax.toLocaleString()} XP</span>
                    </div>
                    <div className="xp-bar h-3">
                      <div className="xp-fill h-full" style={{ width: `${xpPercent}%` }} />
                    </div>
                    <div className="font-rajdhani text-[11px] text-[var(--muted-foreground)]">
                      До {PLAYER.level + 1} уровня: {(PLAYER.xpMax - PLAYER.xp).toLocaleString()} XP
                    </div>
                  </div>
                </div>
                <div className="text-center hud-panel p-4 rounded-sm min-w-[90px]">
                  <div className="text-3xl font-oswald font-bold neon-text-yellow animate-pulse-glow">{PLAYER.winStreak}</div>
                  <div className="font-rajdhani text-xs text-[var(--muted-foreground)] tracking-wider uppercase mt-1">🔥 Серия</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Победы", value: PLAYER.wins, icon: "Trophy", color: "neon-text-yellow" },
                { label: "Поражения", value: PLAYER.losses, icon: "X", color: "text-red-400" },
                { label: "Убийства", value: PLAYER.kills.toLocaleString(), icon: "Swords", color: "neon-text-cyan" },
                { label: "Часов в игре", value: PLAYER.hours, icon: "Clock", color: "neon-text-purple" },
              ].map(s => (
                <div key={s.label} className="stat-block rounded-sm">
                  <div className={`text-2xl font-oswald font-bold ${s.color}`}>{s.value}</div>
                  <div className="font-rajdhani text-[11px] text-[var(--muted-foreground)] uppercase tracking-wider mt-1 flex items-center justify-center gap-1">
                    <Icon name={s.icon} size={11} />
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="hud-panel rounded-sm p-4 space-y-2">
              <div className="flex justify-between font-rajdhani text-xs font-semibold uppercase tracking-wider">
                <span className="text-green-400">Победы {Math.round(PLAYER.wins / (PLAYER.wins + PLAYER.losses) * 100)}%</span>
                <span className="text-[var(--muted-foreground)]">Матчей: {PLAYER.wins + PLAYER.losses}</span>
                <span className="text-red-400">Пораж. {Math.round(PLAYER.losses / (PLAYER.wins + PLAYER.losses) * 100)}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden bg-[rgba(255,255,255,0.05)] flex">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-green-400"
                  style={{ width: `${Math.round(PLAYER.wins / (PLAYER.wins + PLAYER.losses) * 100)}%` }}
                />
                <div className="h-full bg-gradient-to-r from-red-600 to-red-500 flex-1" />
              </div>
            </div>

            <div className="hud-panel rounded-sm p-4">
              <div className="font-rajdhani font-bold text-xs uppercase tracking-widest neon-text-cyan mb-3 flex items-center gap-2">
                <Icon name="Award" size={13} />
                Достижения
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { emoji: "🏆", label: "Чемпион" },
                  { emoji: "⚡", label: "Молния" },
                  { emoji: "💀", label: "Беспощадный" },
                  { emoji: "🎯", label: "Снайпер" },
                  { emoji: "🔥", label: "Легенда" },
                  { emoji: "🐉", label: "Убийца Драконов" },
                ].map(a => (
                  <div
                    key={a.label}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-[rgba(0,255,229,0.2)] rounded-sm bg-[rgba(0,255,229,0.04)] font-rajdhani text-xs text-[rgba(0,255,229,0.7)] font-semibold uppercase tracking-wide hover:border-[var(--neon-cyan)] transition-colors cursor-default"
                  >
                    <span>{a.emoji}</span>
                    {a.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SHOP */}
        {tab === "shop" && (
          <div className="animate-float-up space-y-5">
            {buyMsg && (
              <div
                className="fixed top-20 left-1/2 -translate-x-1/2 z-50 hud-panel px-6 py-3 font-rajdhani font-bold tracking-wider text-sm neon-text-cyan rounded-sm border border-[rgba(0,255,229,0.5)]"
                style={{ boxShadow: "var(--glow-cyan)" }}
              >
                {buyMsg}
              </div>
            )}

            <div className="flex items-center justify-between hud-panel rounded-sm p-4">
              <div className="font-rajdhani font-bold tracking-widest text-sm uppercase neon-text-cyan flex items-center gap-2">
                <Icon name="ShoppingBag" size={15} />
                Магазин предметов
              </div>
              <div className="flex gap-4 font-rajdhani font-bold text-sm">
                <span className="text-yellow-300">🪙 {coins.toLocaleString()}</span>
                <span className="neon-text-purple">💎 {gems}</span>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              {["all", "legendary", "epic", "rare", "common"].map(f => (
                <button
                  key={f}
                  onClick={() => setShopFilter(f)}
                  className={`btn-neon px-4 py-1.5 text-xs rounded-sm transition-all ${shopFilter === f ? "bg-[rgba(0,255,229,0.15)]" : "opacity-50"}`}
                >
                  {f === "all" ? "Все" : f === "legendary" ? "⭐ Легендарные" : f === "epic" ? "💜 Эпические" : f === "rare" ? "🔵 Редкие" : "⚪ Обычные"}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {filteredItems.map(item => {
                const owned = ownedItems.includes(item.id);
                return (
                  <div key={item.id} className={`item-card ${item.type} rounded-sm p-4 flex flex-col items-center gap-2`}>
                    <div className="text-4xl mb-1">{item.emoji}</div>
                    <div className={`font-rajdhani font-bold text-sm text-center ${RANK_COLORS[item.type]}`}>{item.name}</div>
                    <div className="text-[11px] text-[var(--muted-foreground)] text-center font-rubik">{item.desc}</div>
                    <div className="mt-auto pt-2 w-full">
                      {owned ? (
                        <div className="text-center text-xs font-rajdhani font-bold text-green-400 border border-green-500/30 py-1.5 rounded-sm">✓ В инвентаре</div>
                      ) : (
                        <button
                          onClick={() => handleBuy(item)}
                          className={`w-full py-1.5 text-xs rounded-sm font-rajdhani font-bold tracking-wider transition-all border ${
                            item.price > 0
                              ? "border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/10"
                              : "border-purple-500/50 text-purple-300 hover:bg-purple-500/10"
                          }`}
                        >
                          {item.price > 0 ? `🪙 ${item.price}` : `💎 ${item.gems}`}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* LEADERBOARD */}
        {tab === "leaderboard" && (
          <div className="animate-float-up space-y-5">
            <div className="grid grid-cols-3 gap-3">
              {LEADERS.slice(0, 3).map((p, i) => (
                <div
                  key={p.rank}
                  className={`hud-panel rounded-sm p-4 text-center flex flex-col items-center gap-2 ${
                    i === 0 ? "border-yellow-500/40" : i === 1 ? "border-gray-400/30" : "border-orange-700/30"
                  }`}
                  style={{ boxShadow: i === 0 ? "0 0 20px rgba(255,230,0,0.2)" : undefined }}
                >
                  <div className="text-2xl">{MEDALS[p.rank]}</div>
                  <div className="text-3xl">{p.avatar}</div>
                  <div className="font-rajdhani font-bold text-sm neon-text-cyan tracking-wider">{p.name}</div>
                  <div className="font-oswald text-lg font-bold text-yellow-300">{p.score.toLocaleString()}</div>
                  <div className="font-rajdhani text-[11px] text-[var(--muted-foreground)]">LVL {p.level} • {p.wins}W</div>
                </div>
              ))}
            </div>

            <div className="hud-panel rounded-sm overflow-hidden">
              <div className="grid grid-cols-[40px_1fr_80px_80px_70px] gap-2 px-4 py-2 border-b border-[rgba(0,255,229,0.15)] font-rajdhani text-[11px] uppercase tracking-widest text-[var(--muted-foreground)]">
                <span>#</span>
                <span>Игрок</span>
                <span className="text-right">Очки</span>
                <span className="text-right">Победы</span>
                <span className="text-right">Уровень</span>
              </div>
              {LEADERS.map(p => (
                <div
                  key={p.rank}
                  className={`leader-row grid grid-cols-[40px_1fr_80px_80px_70px] gap-2 px-4 py-3 items-center ${
                    p.rank === 1 ? "top-1" : p.rank === 2 ? "top-2" : p.rank === 3 ? "top-3" : ""
                  } ${p.isMe ? "bg-[rgba(0,255,229,0.07)] border-l-2 border-l-[var(--neon-cyan)]" : ""}`}
                >
                  <span
                    className="font-oswald font-bold text-base"
                    style={{ color: p.rank === 1 ? "#ffe600" : p.rank === 2 ? "#c0c0c0" : p.rank === 3 ? "#cd7f32" : "rgba(0,255,229,0.4)" }}
                  >
                    {p.rank}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{p.avatar}</span>
                    <div>
                      <div className={`font-rajdhani font-bold text-sm ${p.isMe ? "neon-text-cyan" : "text-[rgba(0,255,229,0.85)]"}`}>{p.name}</div>
                      {p.isMe && <div className="text-[10px] text-[var(--muted-foreground)] font-rajdhani">— это ты</div>}
                    </div>
                  </div>
                  <div className="font-oswald font-semibold text-sm text-right text-yellow-300">{p.score.toLocaleString()}</div>
                  <div className="font-rajdhani text-sm text-right text-green-400 font-semibold">{p.wins}</div>
                  <div className="font-rajdhani text-sm text-right text-[var(--muted-foreground)]">{p.level}</div>
                </div>
              ))}
            </div>

            <div className="hud-panel rounded-sm p-4 border-[rgba(0,255,229,0.3)]" style={{ boxShadow: "var(--glow-cyan)" }}>
              <div className="flex items-center justify-between">
                <div className="font-rajdhani text-xs uppercase tracking-widest text-[var(--muted-foreground)]">Твоя позиция</div>
                <div className="flex items-center gap-3">
                  <span className="font-oswald text-2xl font-bold neon-text-cyan">#5</span>
                  <div>
                    <div className="font-rajdhani font-bold text-sm neon-text-cyan">GHOST_X</div>
                    <div className="font-rajdhani text-[11px] text-[var(--muted-foreground)]">43 210 очков</div>
                  </div>
                </div>
                <button className="btn-neon text-xs px-4 py-2 rounded-sm">
                  Играть +XP
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom ticker */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-[rgba(0,255,229,0.12)] bg-[rgba(0,0,0,0.6)] py-1.5 overflow-hidden z-40">
        <div
          className="font-rajdhani text-[11px] text-[rgba(0,255,229,0.4)] flex whitespace-nowrap"
          style={{ animation: "data-scroll 30s linear infinite" }}
        >
          <span className="px-8">⚔️ SHADOW_KING убил финального босса</span>
          <span className="px-8">🎯 VIPER_X получил ранг S</span>
          <span className="px-8">💎 Новый предмет: Клинок Судьбы добавлен в магазин</span>
          <span className="px-8">🔥 GHOST_X — серия 7 побед!</span>
          <span className="px-8">🏆 Турнир начнётся через 2 часа</span>
          <span className="px-8">⚡ XP бонус ×1.5 активен до конца недели</span>
        </div>
      </div>
    </div>
  );
}
