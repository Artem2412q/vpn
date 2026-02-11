"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Lock, ShieldCheck, Sparkles } from "lucide-react";
import type { ExitCountry } from "@/lib/countries";

export function MiniConnectionChart({ on }: { on: boolean }) {
  const reduce = useReducedMotion();

  // “Состояние соединения” — чисто визуально, НЕ скорость.
  const path = useMemo(() => {
    const pts = on
      ? ["M0,18", "L10,14", "L20,16", "L30,10", "L40,12", "L50,9", "L60,11", "L70,8", "L80,10", "L90,7", "L100,9"]
      : ["M0,14", "L12,20", "L24,12", "L36,22", "L48,13", "L60,23", "L72,14", "L84,24", "L96,15", "L100,18"];
    return pts.join(" ");
  }, [on]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs text-[rgb(var(--muted))]">
        <span>Состояние канала</span>
        <span className={on ? "text-[rgba(var(--accent)/0.9)]" : ""}>{on ? "стабильно" : "ожидание"}</span>
      </div>
      <svg viewBox="0 0 100 28" className="mt-2 h-7 w-full">
        <path
          d={path}
          fill="none"
          stroke="rgba(255 255 255 / 0.26)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {!reduce && (
          <motion.path
            d={path}
            fill="none"
            stroke={on ? "rgba(165 210 255 / 0.75)" : "rgba(255 255 255 / 0.18)"}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="8 10"
            animate={{ strokeDashoffset: on ? -60 : 0, opacity: on ? 1 : 0.6 }}
            transition={{ duration: on ? 2.2 : 0.6, repeat: on ? Infinity : 0, ease: "linear" }}
          />
        )}
      </svg>
    </div>
  );
}

export function PaperPlanes() {
  const reduce = useReducedMotion();
  if (reduce) return null;

  const planes = [0, 1, 2];

  return (
    <div className="relative h-28 w-full overflow-hidden rounded-2xl glass">
      <div className="absolute inset-0 opacity-70" aria-hidden="true">
        <svg className="h-full w-full" viewBox="0 0 600 180" preserveAspectRatio="none">
          <path
            d="M-10,120 C120,40 180,160 300,90 C420,20 480,150 610,60"
            fill="none"
            stroke="rgba(255 255 255 / 0.14)"
            strokeWidth="2"
          />
        </svg>
      </div>

      {planes.map((i) => (
        <motion.div
          key={i}
          className="absolute left-0 top-0"
          initial={{ x: -40, y: 110 + i * 10, opacity: 0 }}
          animate={{
            x: [-40, 640],
            y: [120 + i * 10, 40 + i * 12, 70 + i * 8],
            opacity: [0, 1, 1, 0]
          }}
          transition={{ duration: 4.8 + i * 0.6, repeat: Infinity, delay: i * 0.8, ease: "easeInOut" }}
          aria-hidden="true"
        >
          <svg width="34" height="34" viewBox="0 0 24 24">
            <path
              d="M22 2L11 13"
              stroke="rgba(165 210 255 / 0.65)"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <path
              d="M22 2L15 22l-4-9-9-4 20-7z"
              fill="rgba(255 255 255 / 0.10)"
              stroke="rgba(255 255 255 / 0.30)"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      ))}

      <div className="absolute bottom-3 left-4 text-sm text-[rgb(var(--muted))]">
        Бумажные самолётики — культурная память 2018 года: символ мирного “проверочного” интернета.
      </div>
    </div>
  );
}

export function KeyToCipher() {
  const reduce = useReducedMotion();
  return (
    <div className="rounded-2xl glass p-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 opacity-70" />
        <div className="text-sm">Шифрование: “ключ → поток”</div>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
          <Lock className="h-4 w-4 opacity-70" />
          <span className="text-xs text-[rgb(var(--muted))]">ключ</span>
        </div>

        <div className="h-[2px] flex-1 bg-white/10" />

        <div className="flex-1 overflow-hidden rounded-xl border border-white/10 bg-white/5 px-3 py-2">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key="cipher"
              className="whitespace-nowrap font-mono text-xs text-[rgba(var(--accent2)/0.9)]"
              initial={{ x: reduce ? 0 : 40, opacity: 0.6 }}
              animate={{ x: reduce ? 0 : -220, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={reduce ? { duration: 0 } : { duration: 2.2, repeat: Infinity, ease: "linear" }}
              aria-hidden="true"
            >
              8f a1 2c 9b 0e d4 77 19 3a c0 5d 11 6e 8f a1 2c 9b 0e d4 77 19 3a c0 5d 11 6e
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-3 text-xs text-[rgb(var(--muted))]">
        В публичной сети (кафе, аэропорт) окружающие видят не сайты, а зашифрованный поток.
      </div>
    </div>
  );
}

export function TimeBlock({ country, on }: { country: ExitCountry; on: boolean }) {
  const reduce = useReducedMotion();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const local = new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).format(new Date(now));

  const exit = new Intl.DateTimeFormat("ru-RU", {
    timeZone: country.tz,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).format(new Date(now));

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-2xl glass p-5">
        <div className="text-sm text-[rgb(var(--muted))]">Ваше локальное время</div>
        <div className="mt-2 font-[650] tracking-tight text-4xl md:text-5xl vpn-glow">
          {local}
        </div>
        <div className="mt-3 text-xs text-[rgb(var(--muted))]">
          Обновляется каждую секунду — “живое” время, как пульс интерфейса.
        </div>
      </div>

      <div className="rounded-2xl glass p-5 vpn-mood">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-[rgb(var(--muted))]">Время “выхода”</div>
          <span className="text-xs text-[rgb(var(--muted))]">
            {country.name} · {country.hint}
          </span>
        </div>

        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={country.code + String(on)}
            className="mt-2 font-[650] tracking-tight text-4xl md:text-5xl"
            initial={{ y: reduce ? 0 : 8, opacity: 0, filter: "blur(4px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            exit={{ y: reduce ? 0 : -8, opacity: 0, filter: "blur(4px)" }}
            transition={{ duration: reduce ? 0 : 0.35, ease: "easeOut" }}
          >
            {exit}
          </motion.div>
        </AnimatePresence>

        <div className="mt-3 text-xs text-[rgb(var(--muted))]">
          Плавное “переключение реальности”: при смене страны время красиво “перетекает”.
        </div>
      </div>
    </div>
  );
}

export function PrivacyBig() {
  return (
    <div className="rounded-3xl glass p-6 md:p-8">
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="text-sm text-[rgb(var(--muted))]">Privacy-first</div>
          <h3 className="mt-2 text-3xl md:text-4xl font-[700] tracking-tight vpn-glow">
            Мы не храним данные
          </h3>
          <p className="mt-3 text-[rgb(var(--muted))]">
            Мы не ведём журналы активности и не сохраняем историю ваших действий. Это принцип дизайна, а не магическое обещание.
          </p>
        </div>
        <ShieldCheck className="h-10 w-10 opacity-70" aria-hidden="true" />
      </div>

      <ul className="mt-6 grid gap-3 md:grid-cols-2 text-sm">
        <li className="rounded-2xl border border-white/10 bg-white/5 p-4">No-logs</li>
        <li className="rounded-2xl border border-white/10 bg-white/5 p-4">Защита в публичных сетях</li>
        <li className="rounded-2xl border border-white/10 bg-white/5 p-4">Свобода чтения и общения</li>
        <li className="rounded-2xl border border-white/10 bg-white/5 p-4">Прозрачные принципы</li>
      </ul>

      <div className="mt-5 text-xs text-[rgb(var(--muted))]">
        Дисклеймер: VPN не делает вас “невидимыми для всего на свете” — но защищает канал передачи данных и снижает риски в типичных ситуациях.
      </div>
    </div>
  );
}
