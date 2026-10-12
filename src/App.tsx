import { useState, useEffect, useRef, useCallback } from "react";

// ── 翻页动效引擎 ───────────────────────────────────────────────────────────

type Dir = "forward" | "backward";

function usePageTransition(total: number) {
  const [current, setCurrent] = useState(0);
  const [next, setNext] = useState<number | null>(null);
  const [dir, setDir] = useState<Dir>("forward");
  const [phase, setPhase] = useState<"idle" | "exit" | "enter">("idle");
  const locked = useRef(false);

  const go = useCallback(
    (to: number) => {
      if (locked.current || to < 0 || to >= total || to === current) return;
      locked.current = true;
      const d: Dir = to > current ? "forward" : "backward";
      setDir(d);
      setNext(to);
      setPhase("exit");
      setTimeout(() => {
        setCurrent(to);
        setNext(null);
        setPhase("enter");
        setTimeout(() => {
          setPhase("idle");
          locked.current = false;
        }, 520);
      }, 480);
    },
    [current, total]
  );

  const goNext = useCallback(() => go(current + 1), [go, current]);
  const goPrev = useCallback(() => go(current - 1), [go, current]);

  return { current, next, dir, phase, go, goNext, goPrev };
}

function getSlideStyle(
  pageIndex: number,
  current: number,
  next: number | null,
  dir: Dir,
  phase: string
): React.CSSProperties {
  const isCurrent = pageIndex === current;
  const isNext = pageIndex === next;
  if (!isCurrent && !isNext) return { display: "none" };

  const base: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    transition: "transform 480ms cubic-bezier(0.77,0,0.175,1), opacity 480ms ease",
  };

  if (isCurrent) {
    if (phase === "exit") {
      return { ...base, transform: dir === "forward" ? "translateY(-100%)" : "translateY(100%)", opacity: 0 };
    }
    return { ...base, transform: "translateY(0)", opacity: 1 };
  }

  if (phase === "idle" || phase === "exit") {
    return { ...base, transform: dir === "forward" ? "translateY(100%)" : "translateY(-100%)", opacity: 0, transition: "none" };
  }
  return { ...base, transform: "translateY(0)", opacity: 1 };
}

// ── 입장 애니메이션 훅 ─────────────────────────────────────────────────────
// 入场动画 Hook：active 变 true 时按 stagger 间隔逐个显示元素

function useEntrance(active: boolean, count: number, stagger = 110) {
  const [shown, setShown] = useState<boolean[]>(Array(count).fill(false));
  useEffect(() => {
    if (!active) {
      setShown(Array(count).fill(false));
      return;
    }
    const timers = Array.from({ length: count }, (_, i) =>
      setTimeout(() => {
        setShown((prev) => { const n = [...prev]; n[i] = true; return n; });
      }, 80 + i * stagger)
    );
    return () => timers.forEach(clearTimeout);
  }, [active]);
  return shown;
}

// 元素动画样式
function fi(show: boolean): React.CSSProperties {
  return {
    opacity: show ? 1 : 0,
    transform: show ? "translateY(0px)" : "translateY(28px)",
    transition: "opacity 560ms ease, transform 560ms cubic-bezier(0.34,1.15,0.64,1)",
  };
}

// 图片专用：从轻微缩放淡入
function fiImg(show: boolean): React.CSSProperties {
  return {
    opacity: show ? 1 : 0,
    transform: show ? "scale(1)" : "scale(1.04)",
    transition: "opacity 700ms ease, transform 700ms ease",
  };
}

// ── 页面组件 ───────────────────────────────────────────────────────────────

function PageCover({ active }: { active: boolean }) {
  const s = useEntrance(active, 4, 150);
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", backgroundColor: "#2C1A10" }}>
      <div style={fiImg(s[0])}>
        <img
          src="https://imgur.la/images/2026/09/13/DSC07834.jpg"
          alt="孩子学习"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.45 }}
        />
      </div>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(44,26,16,0.2) 0%, rgba(44,26,16,0.85) 100%)" }} />
      <div style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "56px 32px 48px", textAlign: "center" }}>
        <p style={{ ...fi(s[1]), fontFamily: "var(--font-body)", fontSize: 11, letterSpacing: "0.25em", color: "#E8A830", marginBottom: 20, fontWeight: 600 }}>
          IB CAS 公益项目 · 2026–2028
        </p>
        <h1 style={{ ...fi(s[2]), fontFamily: "var(--font-display)", fontSize: 52, fontWeight: 300, lineHeight: 1.15, color: "#F7F1E8", marginBottom: 24 }}>
          以语言<br />点亮<br /><em style={{ color: "#E8A830" }}>黑暗</em>
        </h1>
        <p style={{ ...fi(s[3]), fontFamily: "var(--font-body)", fontSize: 15, lineHeight: 1.8, color: "rgba(237,228,212,0.85)", maxWidth: 280 }}>
          十七名IB学生，十八周支教，一所盲童学校，一门改变生命的语言。
        </p>
        <div style={{ marginTop: 40, width: 1, height: 40, backgroundColor: "#E8A830", opacity: 0.6 }} />
      </div>
    </div>
  );
}

function PageTeam({ active }: { active: boolean }) {
  const members = [
    { name: "Ryan", role: "领导团队" },
    { name: "Sarah", role: "领导团队" },
    { name: "Raelin", role: "领导团队" },
    { name: "Vivian", role: "领导团队" },
    { name: "Eunice", role: "领导团队" },
    { name: "Emily", role: "主讲" },
    { name: "Luna", role: "主讲" },
    { name: "Kyrie", role: "助教" },
    { name: "Atticus", role: "助教" },
    { name: "Grace", role: "助教" },
    { name: "Angela", role: "摄影师" },
    { name: "Betty", role: "摄影师" },
    { name: "Jonathon", role: "摄影师" },
    { name: "Max", role: "摄影师" },
    { name: "Jackal", role: "摄影师" },
    { name: "Amy", role: "摄影师" },
    { name: "Sohia", role: "摄影师" },
    { name: "Louis", role: "指导老师" },
    { name: "Wally Trevino", role: "指导老师" },
  ];
  const colors = ["#C4622D", "#E8A830", "#8B7460", "#5C3D2A", "#D97C4A"];
  // 3 header items + members staggered
  const s = useEntrance(active, 3 + members.length, 60);
  return (
    <div style={{ backgroundColor: "#F7F1E8", height: "100%", display: "flex", flexDirection: "column", padding: "80px 24px 52px" }}>
      <p style={{ ...fi(s[0]), fontFamily: "var(--font-body)", fontSize: 11, letterSpacing: "0.2em", color: "#C4622D", fontWeight: 600, marginBottom: 8 }}>我们的团队</p>
      <h2 style={{ ...fi(s[1]), fontFamily: "var(--font-display)", fontSize: 34, fontWeight: 300, color: "#2C1A10", marginBottom: 6, lineHeight: 1.2 }}>
        十七位志愿者，<br /><em>同一个使命</em>
      </h2>
      <p style={{ ...fi(s[2]), fontFamily: "var(--font-body)", fontSize: 13, color: "#8B7460", lineHeight: 1.6, marginBottom: 20 }}>
        我们在IB十一年级相遇，决定用CAS项目做一件真正有意义的事。
      </p>
      <div style={{ overflowY: "auto", flex: 1 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {members.map((m, i) => (
            <div key={i} style={{ ...fi(s[3 + i]), display: "flex", alignItems: "center", gap: 8, backgroundColor: "#EDE4D4", borderRadius: 40, padding: "8px 14px 8px 8px" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, backgroundColor: colors[i % colors.length], opacity: 0.6 + (i % 5) * 0.08, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700, color: "#F7F1E8" }}>{m.name[0]}</span>
              </div>
              <div>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, color: "#2C1A10", lineHeight: 1 }}>{m.name}</p>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "#8B7460", marginTop: 2 }}>{m.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PageSchool({ active }: { active: boolean }) {
  const s = useEntrance(active, 4, 130);
  return (
    <div style={{ position: "relative", height: "100%", backgroundColor: "#2C1A10" }}>
      <div style={{ position: "absolute", inset: 0, ...fiImg(s[0]) }}>
        <img
          src="https://imgur.la/images/2026/09/13/DSC07852.jpg"
          alt="学校"
          style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.35 }}
        />
      </div>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(44,26,16,0.95) 40%, rgba(44,26,16,0.3) 100%)" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 28px 60px", zIndex: 2 }}>
        <p style={{ ...fi(s[1]), fontFamily: "var(--font-body)", fontSize: 11, letterSpacing: "0.2em", color: "#E8A830", fontWeight: 600, marginBottom: 12 }}>支教学校</p>
        <h2 style={{ ...fi(s[2]), fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 300, color: "#F7F1E8", lineHeight: 1.2, marginBottom: 16 }}>
          每一个声音<br /><em style={{ color: "#D97C4A" }}>都很重要</em>
        </h2>
        <p style={{ ...fi(s[3]), fontFamily: "var(--font-body)", fontSize: 14, color: "rgba(237,228,212,0.8)", lineHeight: 1.7, marginBottom: 20 }}>
          这所学校有200余名6至18岁的视力障碍学生。在我们到来之前，大多数孩子从未接触过英语。
        </p>
        <div style={{ ...fi(s[3]), display: "flex", gap: 10, flexWrap: "wrap" }}>
          {["200+ 名学生", "创立于1919年", "1至12年级"].map((t, i) => (
            <div key={i} style={{ backgroundColor: "rgba(247,241,232,0.12)", borderRadius: 20, padding: "7px 14px" }}>
              <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "#F7F1E8" }}>{t}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PageWhy({ active }: { active: boolean }) {
  const s = useEntrance(active, 5, 120);
  return (
    <div style={{ backgroundColor: "#C4622D", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "56px 32px 48px" }}>
      <p style={{ ...fi(s[0]), fontFamily: "var(--font-body)", fontSize: 11, letterSpacing: "0.2em", color: "rgba(247,241,232,0.6)", fontWeight: 600, marginBottom: 20 }}>我们的初衷</p>
      <h2 style={{ ...fi(s[1]), fontFamily: "var(--font-display)", fontSize: 42, fontWeight: 300, color: "#F7F1E8", lineHeight: 1.15, marginBottom: 32 }}>
        为什么<br />是英语？
      </h2>
      <div style={{ ...fi(s[2]), width: 40, height: 1, backgroundColor: "rgba(247,241,232,0.4)", marginBottom: 32 }} />
      <p style={{ ...fi(s[3]), fontFamily: "var(--font-body)", fontSize: 16, color: "rgba(247,241,232,0.9)", lineHeight: 1.8, marginBottom: 24 }}>
        英语是通往国际有声书、播客和全球社群的钥匙——这些资源能够彻底改变一个视障孩子的世界。
      </p>
      <p style={{ ...fi(s[4]), fontFamily: "var(--font-body)", fontSize: 16, color: "rgba(247,241,232,0.7)", lineHeight: 1.8 }}>
        我们相信，语言不只是一门学科，它是一条生命线。
      </p>
    </div>
  );
}

// WeekPage 支持两阶段：stage=0 全屏照片，stage=1 展开文字
function WeekPage({ week, title, photo, description, activity, active, stage }: {
  week: string; title: string; photo: string; description: string; activity: string;
  active: boolean; stage: number;
}) {
  const s = useEntrance(active, 3, 140);
  const expanded = stage >= 1;

  return (
    <div style={{ height: "100%", position: "relative", backgroundColor: "#2C1A10", overflow: "hidden" }}>
      {/* 背景照片 — 全屏，收缩时上移 */}
      <div style={{
        position: "absolute", inset: 0,
        transform: expanded ? "translateY(-20%) scale(1.05)" : "translateY(0) scale(1)",
        transition: "transform 700ms cubic-bezier(0.77,0,0.175,1)",
        ...fiImg(s[0]),
      }}>
        <img src={photo} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>

      {/* 暗渐变 */}
      <div style={{
        position: "absolute", inset: 0,
        background: expanded
          ? "linear-gradient(to top, rgba(44,26,16,1) 45%, rgba(44,26,16,0.5) 75%, rgba(44,26,16,0.2) 100%)"
          : "linear-gradient(to top, rgba(44,26,16,0.85) 25%, rgba(44,26,16,0.1) 70%)",
        transition: "background 700ms ease",
      }} />

      {/* Week 徽章 */}
      <div style={{ position: "absolute", top: 56, left: 20, zIndex: 10, ...fi(s[0]) }}>
        <div style={{ backgroundColor: "#C4622D", borderRadius: 20, padding: "6px 14px", display: "inline-block" }}>
          <span style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "#F7F1E8", fontWeight: 600 }}>{week}</span>
        </div>
      </div>

      {/* 内容区：stage=0 在底部，stage=1 展开面板 */}
      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 0,
        transform: expanded ? "translateY(0)" : "translateY(0)",
        transition: "transform 700ms cubic-bezier(0.77,0,0.175,1)",
        padding: expanded ? "0 28px 52px" : "0 28px 72px",
        zIndex: 10,
      }}>
        <h2 style={{
          ...fi(s[1]),
          fontFamily: "var(--font-display)", fontWeight: 300, color: "#F7F1E8", lineHeight: 1.2, marginBottom: 16,
          fontSize: expanded ? 28 : 38,
          transition: "font-size 500ms ease",
        }}>{title}</h2>

        {/* 展开后的内容 */}
        <div style={{
          maxHeight: expanded ? "400px" : "0px",
          overflow: "hidden",
          transition: "max-height 700ms cubic-bezier(0.77,0,0.175,1)",
        }}>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "rgba(237,228,212,0.8)", lineHeight: 1.7, marginBottom: 18 }}>{description}</p>
          <div style={{ backgroundColor: "rgba(247,241,232,0.1)", borderRadius: 14, padding: "14px 16px", backdropFilter: "blur(8px)" }}>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.15em", color: "#E8A830", fontWeight: 600, marginBottom: 6 }}>课堂活动</p>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "rgba(237,228,212,0.85)", lineHeight: 1.6 }}>{activity}</p>
          </div>
        </div>

        {/* stage=0 时的提示 */}
        {!expanded && (
          <p style={{ ...fi(s[2]), fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(247,241,232,0.45)", marginTop: 8 }}>
            再滑一次查看课堂内容 ↓
          </p>
        )}
      </div>
    </div>
  );
}

function PageGallery({ active }: { active: boolean }) {
  const photos = [
    { url: "https://imgur.la/images/2026/09/13/DSC07839.jpg" },
    { url: "https://imgur.la/images/2026/09/13/DSC07826.jpg" },
    { url: "https://imgur.la/images/2026/09/13/DSC07830.jpg" },
    { url: "https://imgur.la/images/2026/09/13/DSC07842.jpg" },
  ];
  const s = useEntrance(active, 2 + photos.length, 120);
  return (
    <div style={{ backgroundColor: "#2C1A10", height: "100%", display: "flex", flexDirection: "column", padding: "64px 20px 52px" }}>
      <p style={{ ...fi(s[0]), fontFamily: "var(--font-body)", fontSize: 11, letterSpacing: "0.2em", color: "#E8A830", fontWeight: 600, marginBottom: 10 }}>珍贵瞬间</p>
      <h2 style={{ ...fi(s[1]), fontFamily: "var(--font-display)", fontSize: 34, fontWeight: 300, color: "#F7F1E8", marginBottom: 20 }}>
        我们的<em>相册</em>
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "auto auto", gap: 8, flex: 1 }}>
        <div style={{ ...fi(s[2]), gridRow: "1 / span 2", borderRadius: 14, overflow: "hidden", backgroundColor: "#3a2518" }}>
          <img src={photos[0].url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        {photos.slice(1).map((p, i) => (
          <div key={i} style={{ ...fi(s[3 + i]), borderRadius: 14, overflow: "hidden", backgroundColor: "#3a2518", aspectRatio: "4/3" }}>
            <img src={p.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function PageVoices({ active }: { active: boolean }) {
  const quotes = [
    { text: "我从来不知道英语可以这么美。现在我每天晚上都听英语有声书。", name: "一位学生" },
    { text: "他们教会我们，任何东西都可以学会。闭上眼睛，我们用英语看见了世界。", name: "一位学生" },
    { text: "我女儿唱了一首英文歌给我听。我哭了。我听不懂歌词，但我什么都明白了。", name: "一位家长" },
    { text: "他们不只是教我们英语，他们让我们知道，学校外面有人在乎我们。", name: "一位学生" },
  ];
  const [activeQ, setActiveQ] = useState(0);
  const s = useEntrance(active, 3, 140);
  return (
    <div style={{ backgroundColor: "#F7F1E8", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "56px 28px 48px" }}>
      <p style={{ ...fi(s[0]), fontFamily: "var(--font-body)", fontSize: 11, letterSpacing: "0.2em", color: "#C4622D", fontWeight: 600, marginBottom: 16 }}>他们说</p>
      <h2 style={{ ...fi(s[1]), fontFamily: "var(--font-display)", fontSize: 34, fontWeight: 300, color: "#2C1A10", marginBottom: 32 }}>
        来自孩子们<br /><em>的声音</em>
      </h2>
      <div style={{ ...fi(s[2]), backgroundColor: "#EDE4D4", borderRadius: 20, padding: 24, marginBottom: 20, minHeight: 160 }}>
        <p style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 300, fontStyle: "italic", color: "#2C1A10", lineHeight: 1.75, marginBottom: 18 }}>
          「{quotes[activeQ].text}」
        </p>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "#C4622D", fontWeight: 600, letterSpacing: "0.05em" }}>
          —— {quotes[activeQ].name}
        </p>
      </div>
      <div style={{ ...fi(s[2]), display: "flex", gap: 6, flexWrap: "wrap" }}>
        {quotes.map((_, i) => (
          <button key={i} onClick={() => setActiveQ(i)} style={{ width: i === activeQ ? 22 : 7, height: 7, borderRadius: 4, backgroundColor: i === activeQ ? "#C4622D" : "#EDE4D4", border: "none", cursor: "pointer", transition: "all 300ms ease" }} />
        ))}
      </div>
      <p style={{ ...fi(s[2]), fontFamily: "var(--font-body)", fontSize: 11, color: "#8B7460", marginTop: 10 }}>{activeQ + 1} / {quotes.length}</p>
    </div>
  );
}

function PageStats({ active }: { active: boolean }) {
  const stats = [
    { n: "10", label: "受益学生" },
    { n: "18", label: "支教周数" },
    { n: "19", label: "志愿者" },
    { n: "17", label: "教学模块" },
    { n: "30+", label: "投入小时" },
    { n: "∞", label: "留下的记忆" },
  ];
  const s = useEntrance(active, 2 + stats.length, 100);
  return (
    <div style={{ backgroundColor: "#C4622D", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "56px 28px 48px" }}>
      <p style={{ ...fi(s[0]), fontFamily: "var(--font-body)", fontSize: 11, letterSpacing: "0.2em", color: "rgba(247,241,232,0.6)", fontWeight: 600, marginBottom: 12 }}>用数字说话</p>
      <h2 style={{ ...fi(s[1]), fontFamily: "var(--font-display)", fontSize: 38, fontWeight: 300, color: "#F7F1E8", marginBottom: 36, lineHeight: 1.2 }}>
        我们做到了<br /><em>什么</em>
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {stats.map((s2, i) => (
          <div key={i} style={{ ...fi(s[2 + i]), backgroundColor: "rgba(247,241,232,0.1)", borderRadius: 16, padding: "20px 16px" }}>
            <p style={{ fontFamily: "var(--font-display)", fontSize: 40, fontWeight: 300, color: "#F7F1E8", lineHeight: 1, marginBottom: 6 }}>{s2.n}</p>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(247,241,232,0.7)", letterSpacing: "0.05em" }}>{s2.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PageBeliefs({ active }: { active: boolean }) {
  const beliefs = [
    { icon: "🌱", title: "语言是自由", body: "一门新的语言，就是看见世界的一双新眼睛。" },
    { icon: "🤝", title: "陪伴胜于一切", body: "每周如约而至，这件事本身就比任何教案都有力量。" },
    { icon: "✨", title: "能力没有边界", body: "孩子们用行动告诉我们：局限很少来自身体。" },
  ];
  const s = useEntrance(active, 2 + beliefs.length, 140);
  return (
    <div style={{ backgroundColor: "#2C1A10", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "56px 28px 48px" }}>
      <p style={{ ...fi(s[0]), fontFamily: "var(--font-body)", fontSize: 11, letterSpacing: "0.2em", color: "#E8A830", fontWeight: 600, marginBottom: 12 }}>我们相信</p>
      <h2 style={{ ...fi(s[1]), fontFamily: "var(--font-display)", fontSize: 38, fontWeight: 300, color: "#F7F1E8", marginBottom: 36, lineHeight: 1.2 }}>
        我们的<br /><em style={{ color: "#D97C4A" }}>核心信念</em>
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {beliefs.map((b, i) => (
          <div key={i} style={{ ...fi(s[2 + i]), display: "flex", gap: 16, alignItems: "flex-start" }}>
            <div style={{ fontSize: 26, flexShrink: 0, marginTop: 2 }}>{b.icon}</div>
            <div>
              <p style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 500, color: "#F7F1E8", marginBottom: 6 }}>{b.title}</p>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "rgba(237,228,212,0.65)", lineHeight: 1.6 }}>{b.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PageDonate({ active }: { active: boolean }) {
  const s = useEntrance(active, 4, 130);
  return (
    <div style={{ backgroundColor: "#F7F1E8", height: "100%", display: "flex", flexDirection: "column", padding: "72px 28px 52px", overflowY: "auto" }}>
      <p style={{ ...fi(s[0]), fontFamily: "var(--font-body)", fontSize: 11, letterSpacing: "0.2em", color: "#C4622D", fontWeight: 600, marginBottom: 10 }}>支持我们</p>
      <h2 style={{ ...fi(s[1]), fontFamily: "var(--font-display)", fontSize: 34, fontWeight: 300, color: "#2C1A10", marginBottom: 8, lineHeight: 1.2 }}>
        扫码<em>捐款</em>
      </h2>
      <p style={{ ...fi(s[1]), fontFamily: "var(--font-body)", fontSize: 14, color: "#8B7460", lineHeight: 1.7, marginBottom: 28 }}>
        所有捐款直接转入学校官方账户，用于购置盲文教材、录音设备及教学材料。每一分都用在孩子身上。
      </p>

      <div style={{ ...fi(s[2]), backgroundColor: "#EDE4D4", borderRadius: 24, padding: "28px 24px", display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 20 }}>
        <div style={{ width: 180, height: 180, backgroundColor: "#fff", borderRadius: 16, marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center", border: "2px dashed #C4622D", flexDirection: "column", gap: 8 }}>
          <span style={{ fontSize: 40 }}>📷</span>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "#C4622D", textAlign: "center", lineHeight: 1.4, padding: "0 12px" }}>
            请将学校收款二维码<br />替换到此处
          </p>
        </div>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#5C3D2A", fontWeight: 600, marginBottom: 4 }}>微信 / 支付宝 均可扫码</p>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "#8B7460", textAlign: "center", lineHeight: 1.5 }}>
          长按二维码图片可识别<br />或截图后在支付宝/微信扫一扫
        </p>
      </div>

      <div style={{ ...fi(s[3]), backgroundColor: "#EDE4D4", borderRadius: 16, padding: "16px 20px", marginBottom: 16 }}>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "#C4622D", fontWeight: 600, letterSpacing: "0.1em", marginBottom: 12 }}>捐款金额参考</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { amount: "¥30", desc: "一套盲文练习本" },
            { amount: "¥100", desc: "一节课的教学材料" },
            { amount: "¥200", desc: "一名学生一个月的英语读本" },
            { amount: "¥500", desc: "一台录音播放设备" },
            { amount: "¥1000", desc: "资助一名学生半学期的课程" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 400, color: "#C4622D" }}>{item.amount}</span>
              <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#5C3D2A" }}>{item.desc}</span>
            </div>
          ))}
        </div>
      </div>

      <p style={{ ...fi(s[3]), fontFamily: "var(--font-body)", fontSize: 11, color: "#8B7460", textAlign: "center", lineHeight: 1.6 }}>
        如需捐款凭证或了解更多，请联系我们
      </p>
    </div>
  );
}

function PageThanks({ active }: { active: boolean }) {
  const s = useEntrance(active, 4, 150);
  return (
    <div style={{ backgroundColor: "#2C1A10", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "56px 32px 48px", textAlign: "center" }}>
      <div style={{ ...fi(s[0]), fontSize: 64, marginBottom: 24 }}>🌟</div>
      <h2 style={{ ...fi(s[1]), fontFamily: "var(--font-display)", fontSize: 40, fontWeight: 300, color: "#F7F1E8", marginBottom: 16, lineHeight: 1.2 }}>
        感谢<br /><em style={{ color: "#E8A830" }}>你的善意</em>
      </h2>
      <p style={{ ...fi(s[2]), fontFamily: "var(--font-body)", fontSize: 15, color: "rgba(237,228,212,0.75)", lineHeight: 1.8 }}>
        你的支持将传递到每一个用耳朵感受世界的孩子身边。代表所有学过英语的孩子——谢谢你。
      </p>
      <div style={{ ...fi(s[3]), marginTop: 40, width: 40, height: 1, backgroundColor: "rgba(232,168,48,0.4)" }} />
      <p style={{ ...fi(s[3]), fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(237,228,212,0.4)", marginTop: 20 }}>
        IB CAS 项目 · 以语言点亮黑暗 · 2024–2025
      </p>
    </div>
  );
}

function PageWords({ active }: { active: boolean }) {
  const words = [
    { zh: "你好", en: "Hello", size: 18 },
    { zh: "谢谢", en: "Thank you", size: 15 },
    { zh: "开心", en: "Happy", size: 17 },
    { zh: "家人", en: "Family", size: 16 },
    { zh: "颜色", en: "Colors", size: 14 },
    { zh: "我能做到", en: "I can do it!", size: 19 },
    { zh: "朋友", en: "Friend", size: 15 },
    { zh: "歌曲", en: "Song", size: 16 },
    { zh: "眼睛", en: "Eyes", size: 14 },
    { zh: "手", en: "Hand", size: 17 },
    { zh: "故事", en: "Story", size: 15 },
    { zh: "音乐", en: "Music", size: 18 },
    { zh: "我爱你", en: "I love you", size: 20 },
    { zh: "勇敢", en: "Brave", size: 14 },
    { zh: "学习", en: "Learn", size: 15 },
    { zh: "梦想", en: "Dream", size: 17 },
    { zh: "太阳", en: "Sun", size: 13 },
    { zh: "快乐", en: "Joy", size: 16 },
    { zh: "一起", en: "Together", size: 18 },
    { zh: "希望", en: "Hope", size: 19 },
  ];

  const positions = [
    { left: "12%", bottom: "8%" }, { left: "55%", bottom: "6%" },
    { left: "30%", bottom: "14%" }, { left: "70%", bottom: "18%" },
    { left: "5%", bottom: "22%" }, { left: "42%", bottom: "26%" },
    { left: "20%", bottom: "32%" }, { left: "62%", bottom: "30%" },
    { left: "78%", bottom: "38%" }, { left: "8%", bottom: "40%" },
    { left: "35%", bottom: "44%" }, { left: "55%", bottom: "48%" },
    { left: "18%", bottom: "52%" }, { left: "68%", bottom: "54%" },
    { left: "40%", bottom: "58%" }, { left: "10%", bottom: "62%" },
    { left: "72%", bottom: "64%" }, { left: "28%", bottom: "68%" },
    { left: "50%", bottom: "72%" }, { left: "15%", bottom: "76%" },
  ];

  const colors = ["#C4622D", "#E8A830", "#8B7460", "#D97C4A", "#5C3D2A", "#b85c28", "#d4952a"];
  const [visible, setVisible] = useState<boolean[]>(Array(words.length).fill(false));

  useEffect(() => {
    if (!active) { setVisible(Array(words.length).fill(false)); return; }
    const timers: ReturnType<typeof setTimeout>[] = [];
    words.forEach((_, i) => {
      timers.push(setTimeout(() => {
        setVisible(prev => { const n = [...prev]; n[i] = true; return n; });
      }, 300 + i * 180));
    });
    return () => timers.forEach(clearTimeout);
  }, [active]);

  const headerS = useEntrance(active, 2, 150);

  return (
    <div style={{ backgroundColor: "#2C1A10", height: "100%", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "60px 28px 0", zIndex: 10 }}>
        <p style={{ ...fi(headerS[0]), fontFamily: "var(--font-body)", fontSize: 11, letterSpacing: "0.2em", color: "#E8A830", fontWeight: 600, marginBottom: 8 }}>孩子们学会了</p>
        <h2 style={{ ...fi(headerS[1]), fontFamily: "var(--font-display)", fontSize: 34, fontWeight: 300, color: "#F7F1E8", lineHeight: 1.2 }}>
          这些单词，<br /><em style={{ color: "#D97C4A" }}>和更多</em>
        </h2>
      </div>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 180, background: "linear-gradient(to bottom, #2C1A10 60%, transparent)", zIndex: 5, pointerEvents: "none" }} />
      {words.map((word, i) => (
        <div key={i} style={{ position: "absolute", left: positions[i].left, bottom: positions[i].bottom, opacity: visible[i] ? 1 : 0, transform: visible[i] ? "translateY(0) scale(1)" : "translateY(30px) scale(0.6)", transition: "opacity 600ms ease, transform 600ms cubic-bezier(0.34,1.56,0.64,1)", zIndex: 3 }}>
          <div style={{ backgroundColor: colors[i % colors.length], borderRadius: 40, padding: `${8 + (word.size - 13)}px ${14 + (word.size - 13)}px`, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
            <span style={{ fontFamily: "var(--font-body)", fontSize: word.size, fontWeight: 700, color: "#F7F1E8", lineHeight: 1, whiteSpace: "nowrap" }}>{word.en}</span>
            <span style={{ fontFamily: "var(--font-body)", fontSize: word.size - 4, color: "rgba(247,241,232,0.7)", lineHeight: 1, whiteSpace: "nowrap" }}>{word.zh}</span>
          </div>
        </div>
      ))}
      <div style={{ position: "absolute", bottom: 44, left: 0, right: 0, display: "flex", justifyContent: "center", zIndex: 10 }}>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(247,241,232,0.35)" }}>这只是开始……</p>
      </div>
    </div>
  );
}

// ── 新页面：时间线 ─────────────────────────────────────────────────────────

function PageTimeline({ active }: { active: boolean }) {
  const milestones = [
    { week: "第1周", text: "第一次走进教室，孩子们用耳朵打量我们" },
    { week: "第4周", text: "第一个孩子开口说出完整的英文句子" },
    { week: "第8周", text: "课堂气氛彻底改变，笑声开始多于沉默" },
    { week: "第11周", text: "孩子们开始在课外主动用英语交流" },
    { week: "第15周", text: "排练开始，每个人都在为汇演认真准备" },
    { week: "第18周", text: "期末汇演，掌声响了很久很久" },
  ];
  const s = useEntrance(active, 2 + milestones.length, 120);
  return (
    <div style={{ backgroundColor: "#F7F1E8", height: "100%", display: "flex", flexDirection: "column", padding: "72px 28px 52px" }}>
      <p style={{ ...fi(s[0]), fontFamily: "var(--font-body)", fontSize: 11, letterSpacing: "0.2em", color: "#C4622D", fontWeight: 600, marginBottom: 8 }}>十八周历程</p>
      <h2 style={{ ...fi(s[1]), fontFamily: "var(--font-display)", fontSize: 34, fontWeight: 300, color: "#2C1A10", marginBottom: 28, lineHeight: 1.2 }}>
        我们走过的<br /><em>每一步</em>
      </h2>
      <div style={{ flex: 1, overflowY: "auto", position: "relative" }}>
        {/* 竖线 */}
        <div style={{ position: "absolute", left: 19, top: 8, bottom: 8, width: 2, backgroundColor: "#EDE4D4", borderRadius: 1 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {milestones.map((m, i) => (
            <div key={i} style={{ ...fi(s[2 + i]), display: "flex", gap: 20, alignItems: "flex-start" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: i === milestones.length - 1 ? "#C4622D" : "#EDE4D4", border: `2px solid ${i === milestones.length - 1 ? "#C4622D" : "#D4C5B0"}`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1 }}>
                <span style={{ fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700, color: i === milestones.length - 1 ? "#F7F1E8" : "#8B7460" }}>{i + 1}</span>
              </div>
              <div style={{ paddingTop: 8 }}>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, color: "#C4622D", letterSpacing: "0.1em", marginBottom: 4 }}>{m.week}</p>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "#5C3D2A", lineHeight: 1.6 }}>{m.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── 新页面：写给孩子们的一封信 ────────────────────────────────────────────

function PageLetter({ active }: { active: boolean }) {
  const s = useEntrance(active, 5, 160);
  return (
    <div style={{ backgroundColor: "#2C1A10", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "56px 32px 52px" }}>
      <p style={{ ...fi(s[0]), fontFamily: "var(--font-body)", fontSize: 11, letterSpacing: "0.2em", color: "#E8A830", fontWeight: 600, marginBottom: 20 }}>写给孩子们</p>
      <p style={{ ...fi(s[1]), fontFamily: "var(--font-display)", fontSize: 17, fontStyle: "italic", fontWeight: 300, color: "#F7F1E8", lineHeight: 1.9, marginBottom: 20 }}>
        你们从未见过颜色，<br />
        却把世界描述得比我们更生动。
      </p>
      <p style={{ ...fi(s[2]), fontFamily: "var(--font-display)", fontSize: 17, fontStyle: "italic", fontWeight: 300, color: "#F7F1E8", lineHeight: 1.9, marginBottom: 20 }}>
        你们从未看见我们的脸，<br />
        却记住了我们每个人的声音。
      </p>
      <p style={{ ...fi(s[3]), fontFamily: "var(--font-display)", fontSize: 17, fontStyle: "italic", fontWeight: 300, color: "#D97C4A", lineHeight: 1.9, marginBottom: 32 }}>
        谢谢你们教会我们，<br />
        什么叫做真正的看见。
      </p>
      <div style={{ ...fi(s[4]), width: 40, height: 1, backgroundColor: "rgba(232,168,48,0.4)", marginBottom: 16 }} />
      <p style={{ ...fi(s[4]), fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(237,228,212,0.4)", letterSpacing: "0.1em" }}>
        —— 全体支教团队
      </p>
    </div>
  );
}

// ── 页面列表 ───────────────────────────────────────────────────────────────

const WEEK_PAGES = new Set(["week1", "week2", "week3", "week4", "week5"]);

const PAGES = [
  "cover", "team", "school", "why",
  "week1", "week2", "week3", "week4", "week5",
  "words", "timeline",
  "gallery", "voices", "stats", "beliefs", "letter", "donate", "thanks",
];
const TOTAL = PAGES.length;
const LIGHT_PAGES = new Set(["cover", "school", "why", "gallery", "stats", "beliefs", "thanks"]);

// ── 主应用 ─────────────────────────────────────────────────────────────────

export default function App() {
  const { current, next, dir, phase, go, goNext, goPrev } = usePageTransition(TOTAL);
  const touchStart = useRef<number | null>(null);
  const wheelCooldown = useRef(false);

  // Week 页内部阶段：0=全屏照片，1=展开文字
  const [weekStage, setWeekStage] = useState(0);

  const isLight = LIGHT_PAGES.has(PAGES[current]);
  const isWeekPage = WEEK_PAGES.has(PAGES[current]);

  // 统一的「向下」逻辑
  const handleDown = useCallback(() => {
    if (wheelCooldown.current) return;
    wheelCooldown.current = true;
    setTimeout(() => { wheelCooldown.current = false; }, 800);

    if (isWeekPage && weekStage === 0) {
      setWeekStage(1); // 第一滑：展开文字
    } else {
      setWeekStage(0);
      goNext();
    }
  }, [isWeekPage, weekStage, goNext]);

  const handleUp = useCallback(() => {
    if (wheelCooldown.current) return;
    wheelCooldown.current = true;
    setTimeout(() => { wheelCooldown.current = false; }, 800);

    if (isWeekPage && weekStage === 1) {
      setWeekStage(0); // 收回文字
    } else {
      setWeekStage(0);
      goPrev();
    }
  }, [isWeekPage, weekStage, goPrev]);

  // 切换页面时重置 weekStage
  useEffect(() => { setWeekStage(0); }, [current]);

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY > 30) handleDown();
      else if (e.deltaY < -30) handleUp();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") handleDown();
      if (e.key === "ArrowUp") handleUp();
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("wheel", onWheel); window.removeEventListener("keydown", onKey); };
  }, [handleDown, handleUp]);

  const onTouchStart = (e: React.TouchEvent) => { touchStart.current = e.touches[0].clientY; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const delta = touchStart.current - e.changedTouches[0].clientY;
    if (delta > 40) handleDown();
    else if (delta < -40) handleUp();
    touchStart.current = null;
  };

  function isActive(idx: number) {
    return idx === current && (phase === "idle" || phase === "enter");
  }

  const weekProps = { active: false, stage: weekStage };

  function renderPage(idx: number) {
    const id = PAGES[idx];
    const a = isActive(idx);
    const ws = { ...weekProps, active: a };
    if (id === "cover")    return <PageCover active={a} />;
    if (id === "team")     return <PageTeam active={a} />;
    if (id === "school")   return <PageSchool active={a} />;
    if (id === "why")      return <PageWhy active={a} />;
    if (id === "week1")    return <WeekPage {...ws} week="第1–4周" title="Hello & Me" photo="https://imgur.la/images/2026/09/13/DSC07856.md.jpg" description="第一堂课。教室很小，桌椅有些旧，我们既紧张又期待。孩子们起初很安静，然后开始好奇地发问。" activity={'音频打招呼：每位学生录下自己说 "Hi！" 然后回放，第一次听见自己的英语声音。'} />;
    if (id === "week2")    return <WeekPage {...ws} week="第5–8周" title="How are you？" photo="https://imgur.la/images/2026/09/13/DSC0785210e9ec5bdb7ca994.jpg" description="如何向看不见的描述感受？我们用语气、温度、动作和陪伴，让每种感受有了自己的样貌。" activity="层层引导：老师们引导同学们依靠声音的轻重、语速的快慢、肢体的触碰、身边的陪伴氛围去感知开心、平静、难过、疲惫等不同情绪。" />;
    if (id === "week3")    return <WeekPage {...ws} week="第9–11周" title="My Body" photo="https://imgur.la/images/2026/09/13/DSC07841.jpg" description="孩子们通过触觉认识头、肩膀、手、脚等身体部位，学习对应的英文表达。" activity="围圈分享：每位学生用英语介绍自己的身体部位，我们帮他们找到合适的词。" />;
    if (id === "week4")    return <WeekPage {...ws} week="第12–14周" title="I can…" photo="https://imgur.la/images/2026/09/13/Image_1789306997174_174.jpg" description="这一周，一切都变了。我们请孩子们用英语编一个小故事，涌现出的创造力让人惊叹。" activity="分享故事：同学们轮流分享自己会做的事，一边做出小小的动作，一边大声地说出I can!" />;
    if (id === "week5")    return <WeekPage {...ws} week="第15–18周" title="English songs！" photo="https://imgur.la/images/2026/09/13/Image_1789306999548_6.jpg" description="最后四周是表演与自豪的时刻。孩子们选了英文歌，背下来，在同学和老师面前演唱。" activity="期末汇演：每位学生都表演了一个节目——歌曲、诗歌或自我介绍。掌声持续了很久。" />;
    if (id === "words")    return <PageWords active={a} />;
    if (id === "timeline") return <PageTimeline active={a} />;
    if (id === "gallery")  return <PageGallery active={a} />;
    if (id === "voices")   return <PageVoices active={a} />;
    if (id === "stats")    return <PageStats active={a} />;
    if (id === "beliefs")  return <PageBeliefs active={a} />;
    if (id === "letter")   return <PageLetter active={a} />;
    if (id === "donate")   return <PageDonate active={a} />;
    if (id === "thanks")   return <PageThanks active={a} />;
    return null;
  }

  const visiblePages = next !== null ? [current, next] : [current];

  return (
    <>
      <style>{`
        @keyframes bob { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(6px)} }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { width:100%; height:100%; overflow:hidden; background:#1a1a1a; }
      `}</style>

      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#1a1a1a 0%,#2d2d2d 100%)" }}>
        <div style={{ position: "relative", width: "min(390px, 100vw)", height: "min(844px, 100svh)", borderRadius: "min(44px, 4vw)", overflow: "hidden", boxShadow: "0 40px 120px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08)", background: "#000", flexShrink: 0 }}>

          {/* 状态栏 */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 44, background: "rgba(0,0,0,0.35)", backdropFilter: "blur(8px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px" }}>
            <span style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, color: "#fff", opacity: 0.9 }}>9:41</span>
            <span style={{ fontSize: 10, color: "#fff", opacity: 0.85 }}>●●●  WiFi  🔋</span>
          </div>

          {/* Home 指示条 */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 34, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 134, height: 5, borderRadius: 3, backgroundColor: isLight ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.2)" }} />
          </div>

          {/* 页面内容 */}
          <div style={{ position: "absolute", inset: 0, overflow: "hidden" }} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            {visiblePages.map((idx) => (
              <div key={idx} style={getSlideStyle(idx, current, next, dir, phase)}>
                {renderPage(idx)}
              </div>
            ))}
          </div>

          {/* 右侧进度点 */}
          <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: 5, zIndex: 100 }}>
            {Array.from({ length: TOTAL }).map((_, i) => (
              <button key={i} onClick={() => go(i)} style={{ width: i === current ? 7 : 4, height: i === current ? 7 : 4, borderRadius: "50%", border: "none", padding: 0, cursor: "pointer", backgroundColor: isLight ? (i === current ? "#fff" : "rgba(255,255,255,0.3)") : (i === current ? "#C4622D" : "rgba(44,26,16,0.2)"), transition: "all 300ms ease" }} />
            ))}
          </div>

          {/* 向下滑动提示 */}
          {(current < TOTAL - 1 || (isWeekPage && weekStage === 0)) && (
            <div style={{ position: "absolute", bottom: 44, left: "50%", transform: "translateX(-50%)", zIndex: 100, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, animation: "bob 1.8s ease-in-out infinite", pointerEvents: "none" }}>
              <div style={{ width: 1, height: 18, backgroundColor: "rgba(255,255,255,0.45)" }} />
              <div style={{ width: 0, height: 0, borderLeft: "4px solid transparent", borderRight: "4px solid transparent", borderTop: "5px solid rgba(255,255,255,0.45)" }} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
