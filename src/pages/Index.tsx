import { useState, useEffect, useCallback, useRef } from "react";
import Icon from "@/components/ui/icon";

type Tab = "profile" | "shop" | "leaderboard" | "games" | "donate" | "admin";
type GameId = "reaction" | "guess" | "memory" | null;

const PLAYER_BASE = {
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

// ── MEMORY CARDS ──────────────────────────────────
const MEMORY_EMOJIS = ["🔥", "⚡", "💀", "🐉", "👑", "⚔️", "🛡️", "🎯"];
function shuffleCards() {
  return [...MEMORY_EMOJIS, ...MEMORY_EMOJIS]
    .map((v, i) => ({ id: i, value: v, flipped: false, matched: false }))
    .sort(() => Math.random() - 0.5);
}

export default function Index() {
  const [tab, setTab] = useState<Tab>("profile");
  const [shopFilter, setShopFilter] = useState<string>("all");
  const [ownedItems, setOwnedItems] = useState<number[]>([3]);
  const [coins, setCoins] = useState(PLAYER_BASE.coins);
  const [gems, setGems] = useState(PLAYER_BASE.gems);
  const [playerXp, setPlayerXp] = useState(PLAYER_BASE.xp);
  const [buyMsg, setBuyMsg] = useState<string | null>(null);
  const [activeGame, setActiveGame] = useState<GameId>(null);

  // XP gained notification
  const [xpFlash, setXpFlash] = useState<string | null>(null);
  const addXp = (amount: number, label: string) => {
    setPlayerXp(x => Math.min(x + amount, PLAYER_BASE.xpMax));
    setXpFlash(`+${amount} XP — ${label}`);
    setCoins(c => c + Math.floor(amount / 2));
    setTimeout(() => setXpFlash(null), 2500);
  };

  const xpPercent = Math.round((playerXp / PLAYER_BASE.xpMax) * 100);

  // ── REACTION GAME ──────────────────────────────
  type ReactionState = "idle" | "waiting" | "ready" | "result" | "toosoon";
  const [rxState, setRxState] = useState<ReactionState>("idle");
  const [rxStart, setRxStart] = useState(0);
  const [rxTime, setRxTime] = useState(0);
  const [rxBest, setRxBest] = useState<number | null>(null);
  const rxTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startReaction = () => {
    setRxState("waiting");
    const delay = 2000 + Math.random() * 4000;
    rxTimerRef.current = setTimeout(() => {
      setRxStart(performance.now());
      setRxState("ready");
    }, delay);
  };

  const clickReaction = () => {
    if (rxState === "idle" || rxState === "result" || rxState === "toosoon") { startReaction(); return; }
    if (rxState === "waiting") {
      if (rxTimerRef.current) clearTimeout(rxTimerRef.current);
      setRxState("toosoon"); return;
    }
    if (rxState === "ready") {
      const t = Math.round(performance.now() - rxStart);
      setRxTime(t);
      setRxState("result");
      const best = rxBest === null || t < rxBest;
      if (best) setRxBest(t);
      const xp = t < 200 ? 120 : t < 300 ? 80 : t < 500 ? 50 : 20;
      addXp(xp, t < 200 ? "Молниеносная реакция!" : t < 300 ? "Отличная реакция!" : "Реакция");
    }
  };

  // ── GUESS NUMBER GAME ──────────────────────────
  const [guessSecret, setGuessSecret] = useState(() => Math.floor(Math.random() * 100) + 1);
  const [guessInput, setGuessInput] = useState("");
  const [guessHint, setGuessHint] = useState<string | null>(null);
  const [guessAttempts, setGuessAttempts] = useState(0);
  const [guessWon, setGuessWon] = useState(false);
  const [guessHistory, setGuessHistory] = useState<{ n: number; hint: string }[]>([]);

  const submitGuess = () => {
    const n = parseInt(guessInput);
    if (isNaN(n) || n < 1 || n > 100) { setGuessHint("Введи число от 1 до 100"); return; }
    const att = guessAttempts + 1;
    setGuessAttempts(att);
    setGuessHistory(h => [...h, { n, hint: n < guessSecret ? "выше ▲" : n > guessSecret ? "ниже ▼" : "🎯" }]);
    if (n === guessSecret) {
      setGuessWon(true);
      setGuessHint(`🎯 Угадал за ${att} попыток!`);
      const xp = att <= 3 ? 150 : att <= 5 ? 100 : att <= 7 ? 60 : 30;
      addXp(xp, att <= 3 ? "Экстрасенс!" : att <= 5 ? "Хорошее угадывание!" : "Угадал число");
    } else {
      setGuessHint(n < guessSecret ? "📈 Больше!" : "📉 Меньше!");
    }
    setGuessInput("");
  };

  const resetGuess = () => {
    setGuessSecret(Math.floor(Math.random() * 100) + 1);
    setGuessInput("");
    setGuessHint(null);
    setGuessAttempts(0);
    setGuessWon(false);
    setGuessHistory([]);
  };

  // ── MEMORY GAME ────────────────────────────────
  const [memCards, setMemCards] = useState(shuffleCards);
  const [memFlipped, setMemFlipped] = useState<number[]>([]);
  const [memMatched, setMemMatched] = useState<number[]>([]);
  const [memMoves, setMemMoves] = useState(0);
  const [memLocked, setMemLocked] = useState(false);
  const [memWon, setMemWon] = useState(false);

  const flipCard = useCallback((id: number) => {
    if (memLocked) return;
    if (memFlipped.includes(id) || memMatched.includes(id)) return;
    if (memFlipped.length === 2) return;

    const next = [...memFlipped, id];
    setMemFlipped(next);

    if (next.length === 2) {
      setMemMoves(m => m + 1);
      const [a, b] = next;
      const cardA = memCards.find(c => c.id === a);
      const cardB = memCards.find(c => c.id === b);
      if (cardA && cardB && cardA.value === cardB.value) {
        const newMatched = [...memMatched, a, b];
        setMemMatched(newMatched);
        setMemFlipped([]);
        if (newMatched.length === memCards.length) {
          setMemWon(true);
          const xp = memMoves <= 10 ? 200 : memMoves <= 14 ? 130 : 70;
          addXp(xp, memMoves <= 10 ? "Память чемпиона!" : "Отличная память!");
        }
      } else {
        setMemLocked(true);
        setTimeout(() => { setMemFlipped([]); setMemLocked(false); }, 900);
      }
    }
  }, [memFlipped, memMatched, memCards, memMoves, memLocked]);

  const resetMemory = () => {
    setMemCards(shuffleCards());
    setMemFlipped([]);
    setMemMatched([]);
    setMemMoves(0);
    setMemLocked(false);
    setMemWon(false);
  };

  // ── DONATE ────────────────────────────────────
  const DONATE_URL = "https://functions.poehali.dev/0bb236e8-bec0-42fb-bb6a-f72439a1f93a";
  const ADMIN_URL  = "https://functions.poehali.dev/cbfb0f0c-9f7c-40b8-9919-1d014af3088a";

  const [donateStep, setDonateStep] = useState<"amount" | "details" | "done">("amount");
  const [donateAmount, setDonateAmount] = useState("");
  const [donateName, setDonateName] = useState(PLAYER_BASE.name);
  const [donateSending, setDonateSending] = useState(false);
  const [donateError, setDonateError] = useState<string | null>(null);

  const submitDonate = async () => {
    setDonateSending(true);
    setDonateError(null);
    try {
      const res = await fetch(DONATE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: donateName, amount: parseInt(donateAmount) }),
      });
      if (res.ok) { setDonateStep("done"); }
      else { setDonateError("Ошибка отправки. Попробуй снова."); }
    } catch {
      setDonateError("Нет соединения. Попробуй снова.");
    } finally {
      setDonateSending(false);
    }
  };

  // ── ADMIN ────────────────────────────────────
  type Donation = { id: number; username: string; amount: number; status: string; created_at: string };
  const [adminKey, setAdminKey] = useState("");
  const [adminAuthed, setAdminAuthed] = useState(false);
  const [adminDonations, setAdminDonations] = useState<Donation[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminErr, setAdminErr] = useState<string | null>(null);
  const [creditForm, setCreditForm] = useState<{ id: number; coins: string; gems: string } | null>(null);
  const [creditMsg, setCreditMsg] = useState<string | null>(null);

  const loadDonations = async (key: string) => {
    setAdminLoading(true);
    setAdminErr(null);
    try {
      const res = await fetch(ADMIN_URL, { headers: { "X-Admin-Key": key } });
      if (res.status === 403) { setAdminErr("Неверный ключ доступа"); setAdminAuthed(false); return; }
      const data = await res.json();
      setAdminDonations(data.donations || []);
      setAdminAuthed(true);
    } catch {
      setAdminErr("Ошибка соединения");
    } finally {
      setAdminLoading(false);
    }
  };

  const creditBalance = async () => {
    if (!creditForm) return;
    try {
      const res = await fetch(ADMIN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Admin-Key": adminKey },
        body: JSON.stringify({ donation_id: creditForm.id, coins: parseInt(creditForm.coins) || 0, gems: parseInt(creditForm.gems) || 0 }),
      });
      const data = await res.json();
      if (data.ok) {
        setCreditMsg(`✅ Баланс пополнен: ${data.username}`);
        setCreditForm(null);
        loadDonations(adminKey);
      } else {
        setCreditMsg("❌ Ошибка");
      }
    } catch {
      setCreditMsg("❌ Ошибка соединения");
    }
    setTimeout(() => setCreditMsg(null), 3000);
  };

  const filteredItems = SHOP_ITEMS.filter(i => shopFilter === "all" ? true : i.type === shopFilter);

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

  const rxBg =
    rxState === "waiting" ? "bg-[rgba(255,100,0,0.08)] border-orange-500/40" :
    rxState === "ready" ? "bg-[rgba(0,255,100,0.12)] border-green-400/60 cursor-pointer" :
    rxState === "toosoon" ? "bg-[rgba(255,0,60,0.1)] border-red-500/50" :
    "hud-panel cursor-pointer";

  return (
    <div className="min-h-screen text-foreground pb-14">
      <div className="scanline-overlay" />

      {/* XP Flash */}
      {xpFlash && (
        <div
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-2 font-rajdhani font-bold text-sm tracking-widest rounded-sm border border-[rgba(0,255,229,0.5)] bg-[rgba(0,10,20,0.9)]"
          style={{ boxShadow: "var(--glow-cyan)", color: "var(--neon-cyan)" }}
        >
          {xpFlash}
        </div>
      )}

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
              <span className="text-lg">{PLAYER_BASE.avatar}</span>
              <div>
                <div className="font-rajdhani font-bold text-xs neon-text-cyan tracking-wider">{PLAYER_BASE.name}</div>
                <div className="text-[10px] text-[var(--muted-foreground)] font-rajdhani">LVL {PLAYER_BASE.level}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* NAV */}
      <nav className="border-b border-[rgba(0,255,229,0.12)] bg-[rgba(0,0,0,0.3)]">
        <div className="max-w-5xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {([
            { id: "profile", label: "Профиль", icon: "User" },
            { id: "games", label: "Игры", icon: "Gamepad2" },
            { id: "shop", label: "Магазин", icon: "ShoppingBag" },
            { id: "leaderboard", label: "Лидеры", icon: "Trophy" },
            { id: "donate", label: "Донат", icon: "Heart" },
          ] as { id: Tab; label: string; icon: string }[]).map(t => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setActiveGame(null); if (t.id === "donate") setDonateStep("amount"); }}
              className={`nav-btn flex items-center gap-2 whitespace-nowrap ${tab === t.id ? "active" : ""} ${t.id === "donate" ? "!text-pink-400 border-b-pink-400" : ""}`}
            >
              <Icon name={t.icon} size={14} />
              {t.label}
              {t.id === "games" && <span className="ml-1 text-[9px] font-rajdhani font-bold px-1.5 py-0.5 rounded-sm bg-[rgba(0,255,229,0.15)] neon-text-cyan border border-[rgba(0,255,229,0.3)]">NEW</span>}
            </button>
          ))}
          <button
            onClick={() => { setTab("admin"); setAdminAuthed(false); }}
            className={`nav-btn flex items-center gap-2 whitespace-nowrap ml-auto opacity-30 hover:opacity-60 ${tab === "admin" ? "active opacity-100" : ""}`}
          >
            <Icon name="Settings" size={13} />
            Адм
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-6">

        {/* ── PROFILE ── */}
        {tab === "profile" && (
          <div className="animate-float-up space-y-5">
            <div className="hud-panel rounded-sm p-6 corner-cut">
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                <div className="relative">
                  <div className="w-24 h-24 rounded border-2 border-[rgba(0,255,229,0.5)] flex items-center justify-center text-5xl bg-[rgba(0,255,229,0.06)]" style={{ boxShadow: "var(--glow-cyan)" }}>
                    {PLAYER_BASE.avatar}
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                    <span className="rank-badge rank-a">РАНГ {PLAYER_BASE.rank}</span>
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <h1 className="font-oswald text-3xl font-bold neon-text-cyan tracking-widest">{PLAYER_BASE.name}</h1>
                    <p className="text-[var(--muted-foreground)] text-sm font-rajdhani mt-0.5">Серийный убийца боссов • Онлайн</p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center font-rajdhani text-xs">
                      <span className="neon-text-cyan font-bold tracking-wider">УРОВЕНЬ {PLAYER_BASE.level}</span>
                      <span className="text-[var(--muted-foreground)]">{playerXp.toLocaleString()} / {PLAYER_BASE.xpMax.toLocaleString()} XP</span>
                    </div>
                    <div className="xp-bar h-3">
                      <div className="xp-fill h-full" style={{ width: `${xpPercent}%` }} />
                    </div>
                    <div className="font-rajdhani text-[11px] text-[var(--muted-foreground)]">
                      До {PLAYER_BASE.level + 1} уровня: {(PLAYER_BASE.xpMax - playerXp).toLocaleString()} XP
                    </div>
                  </div>
                </div>
                <div className="text-center hud-panel p-4 rounded-sm min-w-[90px]">
                  <div className="text-3xl font-oswald font-bold neon-text-yellow animate-pulse-glow">{PLAYER_BASE.winStreak}</div>
                  <div className="font-rajdhani text-xs text-[var(--muted-foreground)] tracking-wider uppercase mt-1">🔥 Серия</div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Победы", value: PLAYER_BASE.wins, icon: "Trophy", color: "neon-text-yellow" },
                { label: "Поражения", value: PLAYER_BASE.losses, icon: "X", color: "text-red-400" },
                { label: "Убийства", value: PLAYER_BASE.kills.toLocaleString(), icon: "Swords", color: "neon-text-cyan" },
                { label: "Часов в игре", value: PLAYER_BASE.hours, icon: "Clock", color: "neon-text-purple" },
              ].map(s => (
                <div key={s.label} className="stat-block rounded-sm">
                  <div className={`text-2xl font-oswald font-bold ${s.color}`}>{s.value}</div>
                  <div className="font-rajdhani text-[11px] text-[var(--muted-foreground)] uppercase tracking-wider mt-1 flex items-center justify-center gap-1">
                    <Icon name={s.icon} size={11} />{s.label}
                  </div>
                </div>
              ))}
            </div>
            <div className="hud-panel rounded-sm p-4 space-y-2">
              <div className="flex justify-between font-rajdhani text-xs font-semibold uppercase tracking-wider">
                <span className="text-green-400">Победы {Math.round(PLAYER_BASE.wins / (PLAYER_BASE.wins + PLAYER_BASE.losses) * 100)}%</span>
                <span className="text-[var(--muted-foreground)]">Матчей: {PLAYER_BASE.wins + PLAYER_BASE.losses}</span>
                <span className="text-red-400">Пораж. {Math.round(PLAYER_BASE.losses / (PLAYER_BASE.wins + PLAYER_BASE.losses) * 100)}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden bg-[rgba(255,255,255,0.05)] flex">
                <div className="h-full bg-gradient-to-r from-green-500 to-green-400" style={{ width: `${Math.round(PLAYER_BASE.wins / (PLAYER_BASE.wins + PLAYER_BASE.losses) * 100)}%` }} />
                <div className="h-full bg-gradient-to-r from-red-600 to-red-500 flex-1" />
              </div>
            </div>
            <div className="hud-panel rounded-sm p-4">
              <div className="font-rajdhani font-bold text-xs uppercase tracking-widest neon-text-cyan mb-3 flex items-center gap-2">
                <Icon name="Award" size={13} />Достижения
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { emoji: "🏆", label: "Чемпион" }, { emoji: "⚡", label: "Молния" },
                  { emoji: "💀", label: "Беспощадный" }, { emoji: "🎯", label: "Снайпер" },
                  { emoji: "🔥", label: "Легенда" }, { emoji: "🐉", label: "Убийца Драконов" },
                ].map(a => (
                  <div key={a.label} className="flex items-center gap-1.5 px-3 py-1.5 border border-[rgba(0,255,229,0.2)] rounded-sm bg-[rgba(0,255,229,0.04)] font-rajdhani text-xs text-[rgba(0,255,229,0.7)] font-semibold uppercase tracking-wide hover:border-[var(--neon-cyan)] transition-colors cursor-default">
                    <span>{a.emoji}</span>{a.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── GAMES TAB ── */}
        {tab === "games" && (
          <div className="animate-float-up space-y-5">
            {/* Game selection */}
            {!activeGame && (
              <>
                <div className="font-rajdhani text-xs uppercase tracking-widest text-[var(--muted-foreground)] mb-1 flex items-center gap-2">
                  <Icon name="Gamepad2" size={13} />
                  Выбери игру — зарабатывай XP и монеты
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    {
                      id: "reaction" as GameId,
                      emoji: "⚡",
                      title: "Тест реакции",
                      desc: "Жми как можно быстрее когда экран загорится зелёным. Проверь свои рефлексы!",
                      reward: "до +120 XP",
                      color: "neon-text-yellow",
                      borderColor: "rgba(255,230,0,0.3)",
                      tag: "РЕФЛЕКСЫ",
                    },
                    {
                      id: "guess" as GameId,
                      emoji: "🎯",
                      title: "Угадай число",
                      desc: "Загадано число от 1 до 100. Угадай за меньшее число попыток — получи больше XP!",
                      reward: "до +150 XP",
                      color: "neon-text-purple",
                      borderColor: "rgba(191,0,255,0.3)",
                      tag: "ЛОГИКА",
                    },
                    {
                      id: "memory" as GameId,
                      emoji: "🧠",
                      title: "Игра на память",
                      desc: "Открывай карточки парами. Найди все совпадения за меньшее число ходов!",
                      reward: "до +200 XP",
                      color: "neon-text-cyan",
                      borderColor: "rgba(0,255,229,0.3)",
                      tag: "ПАМЯТЬ",
                    },
                  ].map(g => (
                    <button
                      key={g.id}
                      onClick={() => setActiveGame(g.id)}
                      className="item-card rounded-sm p-5 text-left flex flex-col gap-3 group"
                      style={{ borderColor: g.borderColor }}
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-4xl">{g.emoji}</span>
                        <span className={`rank-badge text-[9px] font-rajdhani font-bold px-2 py-0.5 border ${g.color}`} style={{ borderColor: g.borderColor, background: "transparent" }}>{g.tag}</span>
                      </div>
                      <div>
                        <div className={`font-oswald font-bold text-lg ${g.color} tracking-wide`}>{g.title}</div>
                        <div className="font-rubik text-xs text-[var(--muted-foreground)] mt-1 leading-relaxed">{g.desc}</div>
                      </div>
                      <div className="mt-auto pt-2 border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between">
                        <span className="font-rajdhani text-xs text-green-400 font-bold">{g.reward}</span>
                        <span className="font-rajdhani text-xs text-[var(--muted-foreground)] group-hover:text-[var(--neon-cyan)] transition-colors flex items-center gap-1">
                          Играть <Icon name="ChevronRight" size={12} />
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* XP bar mini */}
                <div className="hud-panel rounded-sm p-4 flex items-center gap-4">
                  <div className="text-2xl">🎮</div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between font-rajdhani text-xs">
                      <span className="neon-text-cyan font-bold">Твой прогресс</span>
                      <span className="text-[var(--muted-foreground)]">{playerXp.toLocaleString()} / {PLAYER_BASE.xpMax.toLocaleString()} XP</span>
                    </div>
                    <div className="xp-bar h-2">
                      <div className="xp-fill h-full" style={{ width: `${xpPercent}%` }} />
                    </div>
                  </div>
                  <div className="text-yellow-300 font-rajdhani text-sm font-bold">🪙 {coins.toLocaleString()}</div>
                </div>
              </>
            )}

            {/* ── REACTION GAME ── */}
            {activeGame === "reaction" && (
              <div className="animate-float-up space-y-4">
                <button onClick={() => setActiveGame(null)} className="flex items-center gap-1 font-rajdhani text-xs text-[var(--muted-foreground)] hover:neon-text-cyan transition-colors uppercase tracking-wider">
                  <Icon name="ChevronLeft" size={14} /> Назад к играм
                </button>
                <div className="text-center space-y-2 mb-2">
                  <div className="font-oswald text-2xl font-bold neon-text-yellow tracking-widest">⚡ ТЕСТ РЕАКЦИИ</div>
                  <div className="font-rajdhani text-xs text-[var(--muted-foreground)]">Жди зелёного сигнала — тогда жми!</div>
                </div>

                <button
                  onClick={clickReaction}
                  className={`w-full rounded-sm border transition-all duration-200 flex flex-col items-center justify-center gap-3 select-none ${rxBg}`}
                  style={{ minHeight: 260 }}
                >
                  {rxState === "idle" && (
                    <>
                      <span className="text-6xl">⚡</span>
                      <span className="font-oswald text-xl tracking-widest neon-text-yellow">НАЖМИ ДЛЯ СТАРТА</span>
                      <span className="font-rajdhani text-xs text-[var(--muted-foreground)]">Нажми чтобы начать</span>
                    </>
                  )}
                  {rxState === "waiting" && (
                    <>
                      <span className="text-6xl animate-pulse-glow">🔴</span>
                      <span className="font-oswald text-xl tracking-widest text-orange-400">ЖДИ...</span>
                      <span className="font-rajdhani text-xs text-[var(--muted-foreground)]">Не жми раньше времени!</span>
                    </>
                  )}
                  {rxState === "ready" && (
                    <>
                      <span className="text-6xl">🟢</span>
                      <span className="font-oswald text-2xl tracking-widest text-green-400" style={{ textShadow: "0 0 20px rgba(0,255,100,0.8)" }}>ЖМИ!!!</span>
                    </>
                  )}
                  {rxState === "toosoon" && (
                    <>
                      <span className="text-6xl">💀</span>
                      <span className="font-oswald text-xl tracking-widest text-red-400">СЛИШКОМ РАНО!</span>
                      <span className="font-rajdhani text-xs text-[var(--muted-foreground)]">Нажми чтобы попробовать снова</span>
                    </>
                  )}
                  {rxState === "result" && (
                    <>
                      <span className="text-5xl">{rxTime < 200 ? "🏆" : rxTime < 300 ? "⚡" : rxTime < 500 ? "🎯" : "🐢"}</span>
                      <span className="font-oswald text-4xl font-bold neon-text-cyan">{rxTime} мс</span>
                      <span className="font-rajdhani text-sm text-[var(--muted-foreground)]">
                        {rxTime < 200 ? "МОЛНИЕНОСНО!" : rxTime < 300 ? "ОТЛИЧНО!" : rxTime < 500 ? "Неплохо" : "Тренируйся!"}
                      </span>
                      {rxBest !== null && <span className="font-rajdhani text-xs text-yellow-400">Лучший результат: {rxBest} мс</span>}
                      <span className="font-rajdhani text-xs text-[var(--muted-foreground)] mt-1">Нажми чтобы сыграть снова</span>
                    </>
                  )}
                </button>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Молниеносно", time: "< 200 мс", xp: "+120 XP", color: "text-yellow-400" },
                    { label: "Отлично", time: "< 300 мс", xp: "+80 XP", color: "neon-text-cyan" },
                    { label: "Хорошо", time: "< 500 мс", xp: "+50 XP", color: "text-purple-400" },
                  ].map(r => (
                    <div key={r.label} className="stat-block rounded-sm text-center">
                      <div className={`font-rajdhani font-bold text-sm ${r.color}`}>{r.label}</div>
                      <div className="font-rajdhani text-xs text-[var(--muted-foreground)]">{r.time}</div>
                      <div className="font-rajdhani text-xs text-green-400 font-bold mt-1">{r.xp}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── GUESS GAME ── */}
            {activeGame === "guess" && (
              <div className="animate-float-up space-y-4">
                <button onClick={() => setActiveGame(null)} className="flex items-center gap-1 font-rajdhani text-xs text-[var(--muted-foreground)] hover:neon-text-cyan transition-colors uppercase tracking-wider">
                  <Icon name="ChevronLeft" size={14} /> Назад к играм
                </button>
                <div className="text-center space-y-1">
                  <div className="font-oswald text-2xl font-bold neon-text-purple tracking-widest">🎯 УГАДАЙ ЧИСЛО</div>
                  <div className="font-rajdhani text-xs text-[var(--muted-foreground)]">Загадано число от 1 до 100</div>
                </div>

                <div className="hud-panel rounded-sm p-6 space-y-4">
                  {!guessWon ? (
                    <>
                      <div className="flex gap-3">
                        <input
                          type="number"
                          min={1} max={100}
                          value={guessInput}
                          onChange={e => setGuessInput(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && submitGuess()}
                          placeholder="Введи число (1–100)"
                          className="flex-1 bg-[rgba(0,255,229,0.04)] border border-[rgba(0,255,229,0.2)] rounded-sm px-4 py-2.5 font-rajdhani text-sm neon-text-cyan placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--neon-cyan)]"
                        />
                        <button onClick={submitGuess} className="btn-neon px-6 py-2.5 rounded-sm text-sm">
                          Проверить
                        </button>
                      </div>
                      {guessHint && (
                        <div className="text-center font-oswald text-xl font-bold tracking-wider" style={{ color: guessHint.includes("Больше") ? "#ff9900" : guessHint.includes("Меньше") ? "#00a8ff" : "var(--neon-cyan)" }}>
                          {guessHint}
                        </div>
                      )}
                      <div className="flex items-center justify-between font-rajdhani text-xs text-[var(--muted-foreground)]">
                        <span>Попыток: <span className="text-yellow-300 font-bold">{guessAttempts}</span></span>
                        <span>Лучше угадать до 7 попыток</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center space-y-3">
                      <div className="text-5xl">🎉</div>
                      <div className="font-oswald text-3xl font-bold neon-text-cyan">{guessSecret}</div>
                      <div className="font-rajdhani font-bold text-lg text-green-400">{guessHint}</div>
                      <div className="font-rajdhani text-sm text-[var(--muted-foreground)]">
                        {guessAttempts <= 3 ? "Невероятно! Ты экстрасенс 🔮" : guessAttempts <= 5 ? "Отличная стратегия! 🧠" : "Победа! Пробуй ещё! 💪"}
                      </div>
                      <button onClick={resetGuess} className="btn-neon px-8 py-2.5 rounded-sm text-sm mt-2">
                        Играть снова
                      </button>
                    </div>
                  )}
                </div>

                {guessHistory.length > 0 && (
                  <div className="hud-panel rounded-sm p-4">
                    <div className="font-rajdhani text-xs uppercase tracking-widest text-[var(--muted-foreground)] mb-3">История попыток</div>
                    <div className="flex flex-wrap gap-2">
                      {guessHistory.map((h, i) => (
                        <div key={i} className={`flex items-center gap-1.5 px-3 py-1 rounded-sm border font-rajdhani text-sm font-bold ${h.hint === "🎯" ? "border-green-500/50 text-green-400" : h.hint.includes("▲") ? "border-orange-500/40 text-orange-400" : "border-blue-500/40 text-blue-400"}`}>
                          <span>{h.n}</span>
                          <span className="text-xs opacity-70">{h.hint}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── MEMORY GAME ── */}
            {activeGame === "memory" && (
              <div className="animate-float-up space-y-4">
                <button onClick={() => setActiveGame(null)} className="flex items-center gap-1 font-rajdhani text-xs text-[var(--muted-foreground)] hover:neon-text-cyan transition-colors uppercase tracking-wider">
                  <Icon name="ChevronLeft" size={14} /> Назад к играм
                </button>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-oswald text-2xl font-bold neon-text-cyan tracking-widest">🧠 ИГРА НА ПАМЯТЬ</div>
                    <div className="font-rajdhani text-xs text-[var(--muted-foreground)]">Найди все пары</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="font-oswald text-xl font-bold text-yellow-300">{memMoves}</div>
                      <div className="font-rajdhani text-[10px] text-[var(--muted-foreground)] uppercase">Ходов</div>
                    </div>
                    <div className="text-center">
                      <div className="font-oswald text-xl font-bold neon-text-cyan">{memMatched.length / 2}</div>
                      <div className="font-rajdhani text-[10px] text-[var(--muted-foreground)] uppercase">Пар</div>
                    </div>
                    <button onClick={resetMemory} className="btn-neon text-xs px-3 py-1.5 rounded-sm">
                      <Icon name="RotateCcw" size={13} />
                    </button>
                  </div>
                </div>

                {memWon ? (
                  <div className="hud-panel rounded-sm p-8 text-center space-y-4">
                    <div className="text-6xl">🏆</div>
                    <div className="font-oswald text-3xl font-bold neon-text-yellow tracking-widest">ПОБЕДА!</div>
                    <div className="font-rajdhani text-lg text-[var(--muted-foreground)]">Завершено за <span className="text-white font-bold">{memMoves}</span> ходов</div>
                    <div className="font-rajdhani text-sm text-green-400 font-bold">
                      {memMoves <= 10 ? "🎯 Идеально! Память чемпиона!" : memMoves <= 14 ? "⚡ Отлично! Быстрый ум!" : "✅ Неплохо! Тренируйся!"}
                    </div>
                    <button onClick={resetMemory} className="btn-neon px-8 py-2.5 rounded-sm text-sm">
                      Сыграть снова
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2 sm:gap-3">
                    {memCards.map(card => {
                      const isFlipped = memFlipped.includes(card.id) || memMatched.includes(card.id);
                      const isMatched = memMatched.includes(card.id);
                      return (
                        <button
                          key={card.id}
                          onClick={() => flipCard(card.id)}
                          className={`aspect-square rounded-sm border font-rajdhani font-bold text-3xl flex items-center justify-center transition-all duration-200 select-none
                            ${isMatched
                              ? "border-green-500/40 bg-[rgba(0,255,100,0.08)] cursor-default"
                              : isFlipped
                              ? "border-[rgba(0,255,229,0.5)] bg-[rgba(0,255,229,0.1)]"
                              : "border-[rgba(0,255,229,0.15)] bg-[rgba(0,255,229,0.03)] hover:border-[rgba(0,255,229,0.35)] hover:bg-[rgba(0,255,229,0.07)] cursor-pointer"
                            }`}
                          style={isMatched ? { boxShadow: "0 0 10px rgba(0,255,100,0.2)" } : {}}
                        >
                          {isFlipped ? card.value : "?"}
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Идеально", cond: "≤ 10 ходов", xp: "+200 XP", color: "text-yellow-400" },
                    { label: "Хорошо", cond: "≤ 14 ходов", xp: "+130 XP", color: "neon-text-cyan" },
                    { label: "Зачёт", cond: "> 14 ходов", xp: "+70 XP", color: "text-purple-400" },
                  ].map(r => (
                    <div key={r.label} className="stat-block rounded-sm text-center">
                      <div className={`font-rajdhani font-bold text-sm ${r.color}`}>{r.label}</div>
                      <div className="font-rajdhani text-xs text-[var(--muted-foreground)]">{r.cond}</div>
                      <div className="font-rajdhani text-xs text-green-400 font-bold mt-1">{r.xp}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── SHOP ── */}
        {tab === "shop" && (
          <div className="animate-float-up space-y-5">
            {buyMsg && (
              <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 hud-panel px-6 py-3 font-rajdhani font-bold tracking-wider text-sm neon-text-cyan rounded-sm border border-[rgba(0,255,229,0.5)]" style={{ boxShadow: "var(--glow-cyan)" }}>
                {buyMsg}
              </div>
            )}
            <div className="flex items-center justify-between hud-panel rounded-sm p-4">
              <div className="font-rajdhani font-bold tracking-widest text-sm uppercase neon-text-cyan flex items-center gap-2">
                <Icon name="ShoppingBag" size={15} />Магазин предметов
              </div>
              <div className="flex gap-4 font-rajdhani font-bold text-sm">
                <span className="text-yellow-300">🪙 {coins.toLocaleString()}</span>
                <span className="neon-text-purple">💎 {gems}</span>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {["all", "legendary", "epic", "rare", "common"].map(f => (
                <button key={f} onClick={() => setShopFilter(f)} className={`btn-neon px-4 py-1.5 text-xs rounded-sm transition-all ${shopFilter === f ? "bg-[rgba(0,255,229,0.15)]" : "opacity-50"}`}>
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
                        <button onClick={() => handleBuy(item)} className={`w-full py-1.5 text-xs rounded-sm font-rajdhani font-bold tracking-wider transition-all border ${item.price > 0 ? "border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/10" : "border-purple-500/50 text-purple-300 hover:bg-purple-500/10"}`}>
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

        {/* ── LEADERBOARD ── */}
        {tab === "leaderboard" && (
          <div className="animate-float-up space-y-5">
            <div className="grid grid-cols-3 gap-3">
              {LEADERS.slice(0, 3).map((p, i) => (
                <div key={p.rank} className={`hud-panel rounded-sm p-4 text-center flex flex-col items-center gap-2 ${i === 0 ? "border-yellow-500/40" : i === 1 ? "border-gray-400/30" : "border-orange-700/30"}`} style={{ boxShadow: i === 0 ? "0 0 20px rgba(255,230,0,0.2)" : undefined }}>
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
                <span>#</span><span>Игрок</span><span className="text-right">Очки</span><span className="text-right">Победы</span><span className="text-right">Уровень</span>
              </div>
              {LEADERS.map(p => (
                <div key={p.rank} className={`leader-row grid grid-cols-[40px_1fr_80px_80px_70px] gap-2 px-4 py-3 items-center ${p.rank === 1 ? "top-1" : p.rank === 2 ? "top-2" : p.rank === 3 ? "top-3" : ""} ${p.isMe ? "bg-[rgba(0,255,229,0.07)] border-l-2 border-l-[var(--neon-cyan)]" : ""}`}>
                  <span className="font-oswald font-bold text-base" style={{ color: p.rank === 1 ? "#ffe600" : p.rank === 2 ? "#c0c0c0" : p.rank === 3 ? "#cd7f32" : "rgba(0,255,229,0.4)" }}>{p.rank}</span>
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
                <button onClick={() => setTab("games")} className="btn-neon text-xs px-4 py-2 rounded-sm">
                  Играть +XP
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── DONATE ── */}
        {tab === "donate" && (
          <div className="animate-float-up max-w-lg mx-auto space-y-5">

            {/* Step 1: Amount */}
            {donateStep === "amount" && (
              <>
                <div className="text-center space-y-2">
                  <div className="text-5xl">💖</div>
                  <div className="font-oswald text-2xl font-bold tracking-widest" style={{ color: "#ff6eb4", textShadow: "0 0 15px rgba(255,110,180,0.6)" }}>ПОДДЕРЖАТЬ ПРОЕКТ</div>
                  <div className="font-rajdhani text-sm text-[var(--muted-foreground)]">Твой донат конвертируется в монеты и кристаллы на аккаунте</div>
                </div>

                <div className="hud-panel rounded-sm p-6 space-y-4" style={{ borderColor: "rgba(255,110,180,0.25)" }}>
                  <div className="font-rajdhani text-xs uppercase tracking-widest text-[var(--muted-foreground)] mb-1">Укажи сумму доната (₽)</div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {[100, 300, 500, 1000, 2000, 5000].map(v => (
                      <button key={v} onClick={() => setDonateAmount(String(v))}
                        className={`px-4 py-1.5 rounded-sm border font-rajdhani font-bold text-sm transition-all ${donateAmount === String(v) ? "border-pink-400 text-pink-300 bg-[rgba(255,110,180,0.1)]" : "border-[rgba(255,110,180,0.25)] text-[rgba(255,110,180,0.6)] hover:border-pink-400"}`}>
                        {v} ₽
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    min={1}
                    value={donateAmount}
                    onChange={e => setDonateAmount(e.target.value)}
                    placeholder="Или введи свою сумму"
                    className="w-full bg-[rgba(255,110,180,0.04)] border border-[rgba(255,110,180,0.25)] rounded-sm px-4 py-2.5 font-rajdhani text-sm text-pink-300 placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-pink-400"
                  />
                  <div className="font-rajdhani text-xs uppercase tracking-widest text-[var(--muted-foreground)]">Твой никнейм</div>
                  <input
                    type="text"
                    value={donateName}
                    onChange={e => setDonateName(e.target.value)}
                    placeholder="Имя в игре"
                    className="w-full bg-[rgba(255,110,180,0.04)] border border-[rgba(255,110,180,0.25)] rounded-sm px-4 py-2.5 font-rajdhani text-sm text-pink-300 placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-pink-400"
                  />
                  {parseInt(donateAmount) > 0 && (
                    <div className="hud-panel rounded-sm p-3 text-center border-[rgba(255,110,180,0.2)]">
                      <div className="font-rajdhani text-xs text-[var(--muted-foreground)] mb-1">За {donateAmount} ₽ ты получишь:</div>
                      <div className="flex justify-center gap-4 font-oswald font-bold">
                        <span className="text-yellow-300">🪙 {parseInt(donateAmount) * 2} монет</span>
                        <span className="text-purple-300">💎 {Math.floor(parseInt(donateAmount) / 10)} кристаллов</span>
                      </div>
                    </div>
                  )}
                  <button
                    disabled={!parseInt(donateAmount) || parseInt(donateAmount) < 1}
                    onClick={() => setDonateStep("details")}
                    className="w-full py-3 rounded-sm font-rajdhani font-bold tracking-widest text-sm transition-all border border-pink-400 text-pink-300 hover:bg-[rgba(255,110,180,0.12)] disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{ boxShadow: parseInt(donateAmount) > 0 ? "0 0 15px rgba(255,110,180,0.3)" : "none" }}
                  >
                    Продолжить →
                  </button>
                </div>
              </>
            )}

            {/* Step 2: Реквизиты */}
            {donateStep === "details" && (
              <>
                <div className="text-center space-y-1">
                  <div className="font-oswald text-2xl font-bold tracking-widest" style={{ color: "#ff6eb4" }}>РЕКВИЗИТЫ</div>
                  <div className="font-rajdhani text-sm text-[var(--muted-foreground)]">Переведи <span className="text-pink-300 font-bold">{donateAmount} ₽</span> по реквизитам ниже</div>
                </div>

                <div className="hud-panel rounded-sm p-6 space-y-4" style={{ borderColor: "rgba(255,110,180,0.25)", boxShadow: "0 0 20px rgba(255,110,180,0.1)" }}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 rounded-sm bg-[rgba(255,110,180,0.06)] border border-[rgba(255,110,180,0.2)]">
                      <div>
                        <div className="font-rajdhani text-[11px] uppercase tracking-widest text-[var(--muted-foreground)]">Банк</div>
                        <div className="font-oswald text-lg font-bold text-green-400">Сбербанк</div>
                      </div>
                      <span className="text-3xl">🏦</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-sm bg-[rgba(255,110,180,0.06)] border border-[rgba(255,110,180,0.2)]">
                      <div>
                        <div className="font-rajdhani text-[11px] uppercase tracking-widest text-[var(--muted-foreground)]">Номер телефона</div>
                        <div className="font-oswald text-2xl font-bold text-pink-300 tracking-widest">+7 962 903-15-56</div>
                      </div>
                      <button onClick={() => navigator.clipboard.writeText("79629031556")} className="px-3 py-1.5 rounded-sm border border-[rgba(255,110,180,0.3)] text-pink-400 font-rajdhani text-xs hover:bg-[rgba(255,110,180,0.1)] transition-all">
                        Копировать
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-sm bg-[rgba(255,110,180,0.06)] border border-[rgba(255,110,180,0.2)]">
                      <div>
                        <div className="font-rajdhani text-[11px] uppercase tracking-widest text-[var(--muted-foreground)]">Сумма перевода</div>
                        <div className="font-oswald text-2xl font-bold text-yellow-300">{donateAmount} ₽</div>
                      </div>
                      <span className="text-3xl">💰</span>
                    </div>
                  </div>

                  <div className="rounded-sm p-3 bg-[rgba(255,230,0,0.05)] border border-[rgba(255,230,0,0.15)]">
                    <div className="font-rajdhani text-xs text-yellow-300/80 text-center">
                      ⚠️ В комментарии к переводу укажи свой никнейм: <span className="font-bold text-yellow-300">{donateName}</span>
                    </div>
                  </div>

                  {donateError && <div className="text-center text-red-400 font-rajdhani text-sm">{donateError}</div>}

                  <button
                    onClick={submitDonate}
                    disabled={donateSending}
                    className="w-full py-3 rounded-sm font-rajdhani font-bold tracking-widest text-sm border border-pink-400 text-pink-300 hover:bg-[rgba(255,110,180,0.12)] transition-all disabled:opacity-50"
                    style={{ boxShadow: "0 0 15px rgba(255,110,180,0.3)" }}
                  >
                    {donateSending ? "Отправляем..." : "✅ Я перевёл деньги"}
                  </button>
                  <button onClick={() => setDonateStep("amount")} className="w-full text-center font-rajdhani text-xs text-[var(--muted-foreground)] hover:text-pink-300 transition-colors">
                    ← Назад
                  </button>
                </div>
              </>
            )}

            {/* Step 3: Done */}
            {donateStep === "done" && (
              <div className="hud-panel rounded-sm p-10 text-center space-y-4" style={{ borderColor: "rgba(255,110,180,0.3)", boxShadow: "0 0 30px rgba(255,110,180,0.15)" }}>
                <div className="text-6xl">🎉</div>
                <div className="font-oswald text-3xl font-bold tracking-widest" style={{ color: "#ff6eb4" }}>СПАСИБО!</div>
                <div className="font-rajdhani text-sm text-[var(--muted-foreground)]">Администратор получил уведомление. После проверки платежа монеты будут добавлены на твой аккаунт <span className="text-pink-300 font-bold">{donateName}</span>.</div>
                <div className="font-rajdhani text-xs text-[var(--muted-foreground)]">Обычно это занимает до 30 минут</div>
                <button onClick={() => { setDonateStep("amount"); setDonateAmount(""); }} className="px-8 py-2.5 rounded-sm border border-pink-400 text-pink-300 font-rajdhani font-bold text-sm hover:bg-[rgba(255,110,180,0.1)] transition-all">
                  Задонатить ещё
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── ADMIN ── */}
        {tab === "admin" && (
          <div className="animate-float-up space-y-5">
            <div className="text-center space-y-1">
              <div className="font-oswald text-xl font-bold neon-text-cyan tracking-widest">⚙️ ПАНЕЛЬ АДМИНИСТРАТОРА</div>
              <div className="font-rajdhani text-xs text-[var(--muted-foreground)]">Управление донатами и балансами игроков</div>
            </div>

            {!adminAuthed ? (
              <div className="hud-panel rounded-sm p-6 max-w-sm mx-auto space-y-4">
                <div className="font-rajdhani text-xs uppercase tracking-widest text-[var(--muted-foreground)]">Введи ключ доступа (Telegram Chat ID)</div>
                <input
                  type="password"
                  value={adminKey}
                  onChange={e => setAdminKey(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && loadDonations(adminKey)}
                  placeholder="Ключ администратора"
                  className="w-full bg-[rgba(0,255,229,0.04)] border border-[rgba(0,255,229,0.2)] rounded-sm px-4 py-2.5 font-rajdhani text-sm neon-text-cyan placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--neon-cyan)]"
                />
                {adminErr && <div className="text-red-400 font-rajdhani text-xs">{adminErr}</div>}
                <button onClick={() => loadDonations(adminKey)} disabled={adminLoading} className="w-full btn-neon py-2.5 rounded-sm text-sm">
                  {adminLoading ? "Загрузка..." : "Войти"}
                </button>
              </div>
            ) : (
              <>
                {creditMsg && (
                  <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 hud-panel px-6 py-3 font-rajdhani font-bold tracking-wider text-sm neon-text-cyan rounded-sm border border-[rgba(0,255,229,0.5)]" style={{ boxShadow: "var(--glow-cyan)" }}>
                    {creditMsg}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="font-rajdhani text-xs uppercase tracking-widest neon-text-cyan">Заявки на пополнение</div>
                  <button onClick={() => loadDonations(adminKey)} className="btn-neon text-xs px-3 py-1.5 rounded-sm flex items-center gap-1">
                    <Icon name="RotateCcw" size={12} /> Обновить
                  </button>
                </div>

                <div className="hud-panel rounded-sm overflow-hidden">
                  <div className="grid grid-cols-[60px_1fr_80px_90px_90px] gap-2 px-4 py-2 border-b border-[rgba(0,255,229,0.15)] font-rajdhani text-[11px] uppercase tracking-widest text-[var(--muted-foreground)]">
                    <span>ID</span><span>Игрок</span><span>Сумма</span><span>Статус</span><span></span>
                  </div>
                  {adminDonations.length === 0 && (
                    <div className="px-4 py-8 text-center font-rajdhani text-sm text-[var(--muted-foreground)]">Донатов пока нет</div>
                  )}
                  {adminDonations.map(d => (
                    <div key={d.id} className={`leader-row grid grid-cols-[60px_1fr_80px_90px_90px] gap-2 px-4 py-3 items-center ${d.status === "credited" ? "opacity-40" : ""}`}>
                      <span className="font-rajdhani text-xs text-[var(--muted-foreground)]">#{d.id}</span>
                      <div>
                        <div className="font-rajdhani font-bold text-sm neon-text-cyan">{d.username}</div>
                        <div className="font-rajdhani text-[10px] text-[var(--muted-foreground)]">{new Date(d.created_at).toLocaleString("ru-RU")}</div>
                      </div>
                      <span className="font-oswald font-bold text-sm text-yellow-300">{d.amount} ₽</span>
                      <span className={`font-rajdhani text-xs font-bold ${d.status === "credited" ? "text-green-400" : "text-orange-400"}`}>
                        {d.status === "credited" ? "✅ Начислен" : "⏳ Ожидает"}
                      </span>
                      <div>
                        {d.status !== "credited" && (
                          <button onClick={() => setCreditForm({ id: d.id, coins: String(d.amount * 2), gems: String(Math.floor(d.amount / 10)) })}
                            className="btn-neon text-[11px] px-2 py-1 rounded-sm">
                            Начислить
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Credit modal */}
                {creditForm && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className="hud-panel rounded-sm p-6 w-full max-w-sm space-y-4 mx-4" style={{ boxShadow: "var(--glow-cyan)" }}>
                      <div className="font-oswald text-lg font-bold neon-text-cyan tracking-wider">Начислить баланс</div>
                      <div className="font-rajdhani text-sm text-[var(--muted-foreground)]">Донат #{creditForm.id}</div>
                      <div>
                        <div className="font-rajdhani text-xs uppercase tracking-widest text-[var(--muted-foreground)] mb-1">Монеты 🪙</div>
                        <input type="number" value={creditForm.coins} onChange={e => setCreditForm(f => f && ({ ...f, coins: e.target.value }))}
                          className="w-full bg-[rgba(0,255,229,0.04)] border border-[rgba(0,255,229,0.2)] rounded-sm px-4 py-2 font-rajdhani text-sm neon-text-cyan focus:outline-none focus:border-[var(--neon-cyan)]" />
                      </div>
                      <div>
                        <div className="font-rajdhani text-xs uppercase tracking-widest text-[var(--muted-foreground)] mb-1">Кристаллы 💎</div>
                        <input type="number" value={creditForm.gems} onChange={e => setCreditForm(f => f && ({ ...f, gems: e.target.value }))}
                          className="w-full bg-[rgba(0,255,229,0.04)] border border-[rgba(0,255,229,0.2)] rounded-sm px-4 py-2 font-rajdhani text-sm neon-text-cyan focus:outline-none focus:border-[var(--neon-cyan)]" />
                      </div>
                      <div className="flex gap-3">
                        <button onClick={creditBalance} className="flex-1 btn-neon py-2.5 rounded-sm text-sm">✅ Начислить</button>
                        <button onClick={() => setCreditForm(null)} className="px-4 py-2.5 rounded-sm border border-[rgba(255,255,255,0.1)] text-[var(--muted-foreground)] font-rajdhani text-sm hover:border-[rgba(255,255,255,0.3)] transition-all">Отмена</button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

      </main>

      {/* Ticker */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-[rgba(0,255,229,0.12)] bg-[rgba(0,0,0,0.6)] py-1.5 overflow-hidden z-40">
        <div className="font-rajdhani text-[11px] text-[rgba(0,255,229,0.4)] flex whitespace-nowrap" style={{ animation: "data-scroll 30s linear infinite" }}>
          <span className="px-8">⚔️ SHADOW_KING убил финального босса</span>
          <span className="px-8">🎯 VIPER_X получил ранг S</span>
          <span className="px-8">💎 Новый предмет: Клинок Судьбы добавлен в магазин</span>
          <span className="px-8">🔥 GHOST_X — серия 7 побед!</span>
          <span className="px-8">🏆 Турнир начнётся через 2 часа</span>
          <span className="px-8">⚡ XP бонус ×1.5 активен до конца недели</span>
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