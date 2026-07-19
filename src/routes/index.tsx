import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles, ArrowRight, Play, Star, Pencil, Layers, ClipboardList, Brain,
  FileText, BookOpen, GraduationCap, PenLine, Calendar, Zap, BookMarked, StarIcon,
  Palette, Moon, Check, Crown, ShieldCheck,
} from "lucide-react";
import mascot from "@/assets/mascot.png";
import dashboard from "@/assets/dashboard.jpg";

export const Route = createFileRoute("/")({

  head: () => ({
    meta: [
      { property: "og:image", content: "https://lumiora.app/og-cover.jpg" },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <BackgroundGlow />
      <Nav />
      <main className="relative z-10">
        <Hero />
        <Features />
        <MeetCast />
        <Themes />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}

function BackgroundGlow() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full opacity-30 blur-3xl"
           style={{ background: "radial-gradient(closest-side, oklch(0.62 0.22 295 / 0.55), transparent)" }} />
      <div className="absolute top-[40%] -left-40 h-[500px] w-[500px] rounded-full opacity-20 blur-3xl"
           style={{ background: "radial-gradient(closest-side, oklch(0.78 0.16 340 / 0.45), transparent)" }} />
    </div>
  );
}

function Nav() {
  return (
    <header className="sticky top-3 z-40 mx-auto max-w-6xl px-4">
      <nav className="flex items-center justify-between rounded-full border border-border/60 bg-card/70 px-3 py-2 backdrop-blur-xl md:px-5 md:py-3">
        <a href="#" className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-grad-primary shadow-glow">
            <Sparkles className="h-4 w-4 text-white" />
          </span>
          <span className="font-extrabold tracking-widest text-sm md:text-base">LUMIORA</span>
        </a>
        <div className="flex items-center gap-1 md:gap-3">
          <a href="#pricing" className="hidden md:inline text-sm text-muted-foreground hover:text-foreground">Pricing</a>
          <a href="#features" className="hidden md:inline text-sm text-muted-foreground hover:text-foreground">Features</a>
          <Link to="/auth" className="text-sm px-3 py-2 text-muted-foreground hover:text-foreground">Login</a>
          <Link to="/auth" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-background hover:bg-white/90">Get Started</a>
        </div>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-16 pb-10 text-center md:pt-24">
      <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-4 py-1.5 text-xs md:text-sm backdrop-blur">
        <Sparkles className="h-3.5 w-3.5 text-accent" />
        <span className="text-muted-foreground">New — Gossip Anime AI Tutor is live</span>
      </div>
      <h1 className="mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight md:text-7xl">
        Study Smarter with your{" "}
        <span className="text-gradient-primary">AI Learning Companion</span>
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground md:text-lg">
        Generate notes, flashcards, quizzes, mind maps, summaries and personalised study plans — in seconds.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link to="/auth" className="inline-flex items-center gap-2 rounded-full bg-grad-primary px-6 py-3 font-semibold text-white shadow-glow hover:opacity-95">
          Start Free <ArrowRight className="h-4 w-4" />
        </a>
        <a href="#demo" className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-6 py-3 font-semibold text-foreground backdrop-blur hover:bg-card">
          <Play className="h-4 w-4 fill-current" /> Watch Demo
        </a>
      </div>

      {/* Dashboard preview with floating badges */}
      <div className="relative mx-auto mt-14 max-w-5xl">
        <div className="absolute -left-2 -top-6 z-10 hidden md:flex items-center gap-3 rounded-2xl border border-border/60 bg-card/80 px-4 py-3 backdrop-blur-xl md:left-6">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/40 bg-primary/15">
            <Star className="h-4 w-4 text-primary" />
          </span>
          <div className="text-left">
            <div className="text-sm font-semibold">14-day streak</div>
            <div className="text-xs text-muted-foreground">Keep going!</div>
          </div>
        </div>
        <div className="md:hidden flex items-center gap-3 mb-3 rounded-2xl border border-border/60 bg-card/80 px-4 py-3 w-fit mx-auto">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/40 bg-primary/15">
            <Star className="h-4 w-4 text-primary" />
          </span>
          <div className="text-left">
            <div className="text-sm font-semibold">14-day streak</div>
            <div className="text-xs text-muted-foreground">Keep going!</div>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-border/60 bg-card/60 p-2 shadow-glow backdrop-blur">
          <img src={dashboard} alt="Lumiora dashboard preview" width={1600} height={1008} className="w-full rounded-2xl" />
        </div>

        <div className="absolute -bottom-4 right-2 md:right-6 z-10 hidden md:flex items-center gap-2 rounded-full bg-grad-primary px-4 py-2 text-sm font-semibold text-white shadow-glow">
          <Sparkles className="h-4 w-4" /> +120 XP
        </div>
        <div className="md:hidden flex items-center gap-2 mt-3 rounded-full bg-grad-primary px-4 py-2 text-sm font-semibold text-white w-fit ml-auto">
          <Sparkles className="h-4 w-4" /> +120 XP
        </div>
      </div>
    </section>
  );
}

const FEATURES = [
  { icon: Pencil, tint: "primary", title: "AI Notes", desc: "Structured summaries from any lecture" },
  { icon: Layers, tint: "teal", title: "Flashcards", desc: "Spaced repetition, built in" },
  { icon: ClipboardList, tint: "green", title: "Quiz Generator", desc: "MCQ, T/F, fill-in, and more" },
  { icon: Brain, tint: "rose", title: "Mind Maps", desc: "Visualise connections instantly" },
  { icon: FileText, tint: "primary", title: "PDF Chat", desc: "Ask questions to your textbooks" },
  { icon: BookOpen, tint: "teal", title: "Lecture Summariser", desc: "Hours of audio in seconds" },
  { icon: GraduationCap, tint: "green", title: "Homework Helper", desc: "Step-by-step solutions" },
  { icon: PenLine, tint: "rose", title: "Essay Writer", desc: "Drafts, critiques, rewrites" },
  { icon: Calendar, tint: "primary", title: "Exam Planner", desc: "Personalised study calendars" },
  { icon: Zap, tint: "teal", title: "Revision Scheduler", desc: "Never forget what you learnt" },
];

function tintStyles(tint: string) {
  switch (tint) {
    case "teal":  return "bg-[oklch(0.35_0.08_200)]/40 text-[oklch(0.82_0.11_200)] border-[oklch(0.5_0.1_200)]/30";
    case "green": return "bg-[oklch(0.32_0.09_150)]/40 text-[oklch(0.82_0.13_150)] border-[oklch(0.5_0.12_150)]/30";
    case "rose":  return "bg-[oklch(0.35_0.11_20)]/40 text-[oklch(0.82_0.13_20)] border-[oklch(0.5_0.14_20)]/30";
    default:      return "bg-primary/15 text-primary border-primary/30";
  }
}

function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-4 py-20">
      <div className="text-center">
        <h2 className="text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">Everything you need to ace it</h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">One calm, beautiful workspace for every part of study.</p>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
        {FEATURES.map(({ icon: Icon, title, desc, tint }) => (
          <div key={title} className="group rounded-2xl border border-border/60 bg-card/50 p-6 backdrop-blur transition hover:border-primary/40 hover:bg-card">
            <span className={`inline-flex h-11 w-11 items-center justify-center rounded-full border ${tintStyles(tint)}`}>
              <Icon className="h-5 w-5" />
            </span>
            <h3 className="mt-8 text-xl font-bold">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function MeetCast() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <p className="mx-auto max-w-3xl text-center text-lg text-muted-foreground">
        Learn alongside a whole studio of cute, calm AI tutors — with dramatic notes retellings, and study streaks that feel like a game.
      </p>
      <div className="relative mt-10 overflow-hidden rounded-3xl border border-border/60 bg-card/40 p-6 md:p-12">
        <div className="absolute inset-0 -z-10"
             style={{ background: "radial-gradient(60% 60% at 50% 60%, oklch(0.35 0.15 300 / 0.5), transparent)" }} />
        <a href="#cast" className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-background hover:bg-white/90">
          Meet the cast <ArrowRight className="h-4 w-4" />
        </a>
        <div className="relative mt-6 flex justify-center">
          <FloatingIcon className="left-2 top-6 md:left-16 md:top-16" icon={<BookMarked className="h-4 w-4" />} />
          <FloatingIcon className="right-2 top-16 md:right-24 md:top-20" icon={<StarIcon className="h-4 w-4" />} />
          <FloatingIcon className="left-6 bottom-16 md:left-24" icon={<Sparkles className="h-4 w-4" />} />
          <FloatingIcon className="right-6 bottom-8 md:right-32" icon={<Brain className="h-4 w-4" />} />
          <img src={mascot} alt="Lumiora AI tutor mascot" width={520} height={720} loading="lazy"
               className="relative z-10 max-h-[520px] w-auto drop-shadow-[0_30px_60px_oklch(0.5_0.2_300_/_0.4)]" />
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <InfoRow icon={<Palette className="h-5 w-5" />} title="Themes that match your aura"
                 desc="10 pastel palettes — lavender, sky, mint, pink, peach, rose, golden, emerald, indigo, slate. Switch anytime." />
        <InfoRow icon={<Moon className="h-5 w-5" />} title="Light + dark, done right"
                 desc="Every colour, chart and card was tuned for both modes. Late-night study is easy on the eyes." />
      </div>
    </section>
  );
}

function FloatingIcon({ icon, className = "" }: { icon: React.ReactNode; className?: string }) {
  return (
    <span className={`absolute z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-card/80 text-muted-foreground backdrop-blur ${className}`}>
      {icon}
    </span>
  );
}

function InfoRow({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex gap-4 rounded-2xl border border-border/60 bg-card/50 p-5 backdrop-blur">
      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/15 text-primary">
        {icon}
      </span>
      <div>
        <h4 className="font-bold">{title}</h4>
        <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-6xl px-4 py-24">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-4 py-1.5 text-xs backdrop-blur">
          <Star className="h-3.5 w-3.5 text-primary" />
          <span className="text-muted-foreground">Founder's launch pricing</span>
        </div>
        <h2 className="mt-5 text-4xl font-extrabold tracking-tight md:text-5xl">Simple, honest pricing</h2>
        <p className="mt-3 text-muted-foreground">Start free. Upgrade when you need more AI headroom.</p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        <PlanCard
          title="Free" tagline="Get started, no card required."
          price="$0" priceSuffix="forever"
          features={["2 PDF uploads / week", "40 AI flashcards / month", "3 AI chats / day", "Community access", "Study planner & Pomodoro"]}
          cta="Get Started" ctaStyle="ghost"
        />
        <PlanCard
          title="Premium" tagline="Founder's launch pricing."
          price="$4.99" strike="$5.99" priceSuffix="/month"
          features={["Higher AI limits across all tools", "Ad-free experience", "Priority AI processing", "Export notes & decks", "Full analytics dashboard"]}
          cta="Go Premium" ctaStyle="primary" badge="⭐ Most Popular" highlight
        />
        <PlanCard
          title="Pro" tagline="For serious students." icon={<Crown className="h-5 w-5 text-primary" />}
          price="$8.99" strike="$10.99" priceSuffix="/month"
          features={["Highest AI usage limits", "Largest PDF allowance", "Fastest processing priority", "Performance prediction", "Early feature access & priority support"]}
          cta="Get Pro" ctaStyle="ghost" badge="👑 Best Value"
        />
      </div>

      <p className="mt-10 flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <ShieldCheck className="h-4 w-4 text-primary" />
        All AI features operate under a generous Fair Usage Policy.
      </p>
    </section>
  );
}

function PlanCard({
  title, tagline, price, strike, priceSuffix, features, cta, ctaStyle, badge, highlight, icon,
}: {
  title: string; tagline: string; price: string; strike?: string; priceSuffix: string;
  features: string[]; cta: string; ctaStyle: "primary" | "ghost"; badge?: string; highlight?: boolean; icon?: React.ReactNode;
}) {
  return (
    <div className={`relative rounded-3xl border p-7 backdrop-blur ${highlight ? "border-primary/50 bg-card/70 shadow-glow" : "border-border/60 bg-card/50"}`}>
      {badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-grad-primary px-3 py-1 text-xs font-semibold text-white">
          {badge}
        </span>
      )}
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="text-2xl font-extrabold">{title}</h3>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{tagline}</p>
      <div className="mt-6 flex items-end gap-2">
        <span className="text-5xl font-extrabold">{price}</span>
        {strike && <span className="pb-2 text-muted-foreground line-through">{strike}</span>}
        <span className="pb-2 text-muted-foreground">{priceSuffix}</span>
      </div>
      <ul className="mt-6 space-y-3">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-3 text-sm">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <button className={`mt-8 w-full rounded-full py-3 font-semibold transition ${
        ctaStyle === "primary"
          ? "bg-grad-primary text-white shadow-glow hover:opacity-95"
          : "border border-border bg-card/60 text-foreground hover:bg-card"
      }`}>{cta}</button>
    </div>
  );
}

function Themes() { return null; }

function Footer() {
  return (
    <footer className="relative z-10 mx-auto max-w-6xl px-4 pb-10">
      <div className="flex flex-col items-start justify-between gap-4 border-t border-border/60 pt-8 md:flex-row md:items-center">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-grad-primary">
            <Sparkles className="h-4 w-4 text-white" />
          </span>
          <span className="text-sm text-muted-foreground">
            <span className="font-bold tracking-widest text-foreground">LUMIORA</span> · a product by Nexus Studios
          </span>
        </div>
        <p className="text-sm text-muted-foreground">© 2026 Nexus Studios. All rights reserved.</p>
      </div>
    </footer>
  );
}
