"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { COUNTRIES, type ExitCountry } from "@/lib/countries";
import { usePerfTier } from "@/hooks/usePerfTier";
import { KeyToCipher, MiniConnectionChart, PaperPlanes, PrivacyBig, TimeBlock } from "@/components/VisualBits";

const EarthCanvas = dynamic(() => import("@/components/EarthCanvas"), {
  ssr: false,
  loading: () => <EarthPlaceholder />
});

function EarthPlaceholder() {
  return (
    <div className="h-[420px] w-full md:h-[520px] rounded-3xl glass vpn-mood relative overflow-hidden">
      <div className="absolute inset-0 opacity-70">
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute right-10 top-24 h-56 w-56 rounded-full bg-white/5 blur-2xl" />
      </div>
      <div className="absolute inset-0 grid place-items-center text-sm text-[rgb(var(--muted))]">
        Загружаем 3D сцену…
      </div>
    </div>
  );
}

function classNames(...xs: Array<string | false | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function formatHMS(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const hh = String(Math.floor(s / 3600)).padStart(2, "0");
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

export default function Page() {
  const reduce = useReducedMotion();
  const { tier, reducedMotion } = usePerfTier();

  const [vpnOn, setVpnOn] = useState(false);
  const [country, setCountry] = useState<ExitCountry>(COUNTRIES[0]);
  const [connectedAt, setConnectedAt] = useState<number | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    document.documentElement.dataset.vpn = vpnOn ? "on" : "off";
  }, [vpnOn]);

  // таймер “статуса”
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  const session = useMemo(() => {
    if (!connectedAt) return "00:00:00";
    return formatHMS(Date.now() - connectedAt);
  }, [connectedAt, tick]);

  function toggleVPN() {
    setVpnOn((v) => {
      const next = !v;
      if (next) setConnectedAt(Date.now());
      else setConnectedAt(null);
      return next;
    });
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 md:py-14">
      {/* HERO */}
      <section className="grid gap-8 md:grid-cols-2 md:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[rgb(var(--muted))]">
            <span className="h-2 w-2 rounded-full bg-white/30" aria-hidden="true" />
            VPN “Тёма” · приватность без лишних слов
          </div>

          <h1 className="mt-4 text-4xl md:text-6xl font-[750] tracking-tight leading-[1.02] vpn-glow">
            Свобода в сети без границ
          </h1>

          <p className="mt-4 text-base md:text-lg text-[rgb(var(--muted))] max-w-xl">
            “Тёма” помогает безопасно выходить в интернет из любой точки мира — без слежки и лишних данных.
            Мы объясняем принципы честно: защищаем канал и снижаем риски, но не обещаем невозможного.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="#cta"
              className="rounded-2xl bg-white/90 px-5 py-3 text-sm font-[650] text-black hover:bg-white focus-visible:outline-none"
              aria-label="Подключить Тёму"
            >
              Подключить Тёму
            </a>

            <a
              href="#how"
              className="rounded-2xl border border-white/12 bg-white/5 px-5 py-3 text-sm font-[650] text-white hover:bg-white/10"
              aria-label="Как это работает"
            >
              Как это работает
            </a>
          </div>

          <div className="mt-8 grid gap-3 text-sm text-[rgb(var(--muted))]">
            <div className="rounded-2xl glass p-4">
              <div className="text-white/80 font-[650]">No-logs — принцип, а не лозунг</div>
              <div className="mt-1">
                Мы не храним историю действий и не ведём журналы активности. Это снижает объём данных, которые вообще могут существовать.
              </div>
            </div>
          </div>
        </div>

        {/* 3D + панель управления */}
        <div className="relative">
          <div className="rounded-3xl glass p-3 vpn-mood">
            <EarthCanvas vpnOn={vpnOn} country={country} tier={tier} reducedMotion={reducedMotion} />
          </div>

          {/* мини-панель */}
          <div className="mt-4 rounded-3xl glass p-5 vpn-mood" aria-label="Панель управления VPN">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-sm text-[rgb(var(--muted))]">VPN</div>
                <button
                  onClick={toggleVPN}
                  className={classNames(
                    "mt-2 inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-[650] transition",
                    vpnOn
                      ? "border-white/15 bg-white/10"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  )}
                  aria-pressed={vpnOn}
                  aria-label={vpnOn ? "Выключить VPN" : "Включить VPN"}
                >
                  <span
                    className={classNames(
                      "h-2.5 w-2.5 rounded-full",
                      vpnOn ? "bg-[rgba(167,243,220,0.85)]" : "bg-white/30"
                    )}
                    aria-hidden="true"
                  />
                  {vpnOn ? "ON" : "OFF"}
                  <span className="text-xs font-normal text-[rgb(var(--muted))]">
                    {vpnOn ? `сессия ${session}` : "ожидание"}
                  </span>
                </button>
              </div>

              <div className="min-w-[220px]">
                <div className="text-sm text-[rgb(var(--muted))]">Страна выхода</div>
                <select
                  value={country.code}
                  onChange={(e) => {
                    const next = COUNTRIES.find((c) => c.code === e.target.value) ?? COUNTRIES[0];
                    setCountry(next);
                  }}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none hover:bg-white/10"
                  aria-label="Выбор страны выхода"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full md:w-[240px]">
                <MiniConnectionChart on={vpnOn} />
              </div>
            </div>

            <div className="mt-4 text-sm text-[rgb(var(--muted))]">
              {vpnOn ? (
                <span className="text-white/80">
                  Маршрут активен: трафик идёт через защищённый канал. “Маска подсети” делает путь менее предсказуемым.
                </span>
              ) : (
                <span>
                  Включите VPN, чтобы “замок” раскололся, а маршрут появился как дуга через выбранную страну.
                </span>
              )}
            </div>

            <div className="mt-3 text-xs text-[rgb(var(--muted))]">
              Дисклеймер: мы не даём юридических гарантий и не обещаем “абсолютной невидимости”.
              Мы показываем принципы: защита канала, меньше лишних данных, понятная логика.
            </div>
          </div>
        </div>
      </section>

      {/* HOW */}
      <section id="how" className="mt-14 md:mt-20">
        <h2 className="text-2xl md:text-3xl font-[750] tracking-tight">
          Как это работает — простыми словами
        </h2>

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl glass p-6">
            <div className="text-white/90 font-[650]">1) Защищённый туннель</div>
            <p className="mt-2 text-sm text-[rgb(var(--muted))]">
              Соединение шифруется: в публичной сети вы передаёте не “сайты”, а защищённый поток.
            </p>
          </div>

          <div className="rounded-3xl glass p-6 vpn-mood">
            <div className="text-white/90 font-[650]">2) Вы как будто в другой стране</div>
            <p className="mt-2 text-sm text-[rgb(var(--muted))]">
              Сайты видят подключение из выбранной страны выхода. Это часто помогает с доступом и приватностью, но не “решает всё”.
            </p>
          </div>

          <div className="rounded-3xl glass p-6">
            <div className="text-white/90 font-[650]">3) Мы не храним данные</div>
            <p className="mt-2 text-sm text-[rgb(var(--muted))]">
              No-logs означает: мы сознательно уменьшаем объём данных, которые вообще могут существовать о ваших действиях.
            </p>
          </div>
        </div>
      </section>

      {/* LIVE TIME */}
      <section className="mt-14 md:mt-20">
        <h2 className="text-2xl md:text-3xl font-[750] tracking-tight">
          Живое время — здесь и там
        </h2>
        <p className="mt-3 text-[rgb(var(--muted))] max-w-2xl">
          Визуально понятная штука для любого возраста: ваши часы и “часы выхода”.
          При смене страны время мягко “перетекает”, без резких прыжков.
        </p>

        <div className="mt-6">
          <TimeBlock country={country} on={vpnOn} />
        </div>
      </section>

      {/* WHAT IS LIMITED */}
      <section className="mt-14 md:mt-20">
        <h2 className="text-2xl md:text-3xl font-[750] tracking-tight">
          Что иногда ограничивается в разные годы (нейтрально)
        </h2>
        <p className="mt-3 text-[rgb(var(--muted))] max-w-3xl">
          В разных странах и в разные периоды доступ к сервисам и сайтам может быть ограничен.
          Мы не драматизируем — просто показываем типичные категории, которые люди замечают в быту.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl glass p-6">
            <div className="text-white/90 font-[650]">Мессенджеры</div>
            <div className="mt-2 text-sm text-[rgb(var(--muted))]">
              Например, Telegram и другие. Иногда возникают перебои, замедления или ограничения.
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-white/90 font-[650]">Telegram · 2018</div>
              <div className="mt-2 text-sm text-[rgb(var(--muted))]">
                Мы помним 2018 год: блокировки, сбои, и как люди запускали бумажные самолётики в знак протеста.
                Без лозунгов — просто культурная память эпохи.
              </div>
              <div className="mt-4">
                <PaperPlanes />
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-3xl glass p-6">
              <div className="text-white/90 font-[650]">Новости и медиа</div>
              <div className="mt-2 text-sm text-[rgb(var(--muted))]">
                В отдельные периоды доступ к некоторым сайтам может быть ограничен или нестабилен.
              </div>
            </div>

            <div className="rounded-3xl glass p-6">
              <div className="text-white/90 font-[650]">Соцсети и сервисы</div>
              <div className="mt-2 text-sm text-[rgb(var(--muted))]">
                Иногда ограничения затрагивают соцсети, видеохостинги или отдельные веб‑сервисы.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY TEMA */}
      <section className="mt-14 md:mt-20">
        <h2 className="text-2xl md:text-3xl font-[750] tracking-tight">
          Почему “Тёма” необычен
        </h2>

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl glass p-6">
            <div className="text-white/90 font-[650]">Маска подсети</div>
            <p className="mt-2 text-sm text-[rgb(var(--muted))]">
              Она “смешивает” ваше присутствие и делает маршрут менее предсказуемым — проще говоря,
              сложнее угадать “типичный путь” подключения.
            </p>
          </div>

          <div className="rounded-3xl glass p-6 md:col-span-2">
            <KeyToCipher />
          </div>

          <div className="rounded-3xl glass p-6">
            <div className="text-white/90 font-[650]">No-logs</div>
            <p className="mt-2 text-sm text-[rgb(var(--muted))]">
              Мы не храним историю действий и не ведём журналы активности. Это снижает объём возможных данных о пользователях.
            </p>
          </div>

          <div className="rounded-3xl glass p-6 md:col-span-2">
            <div className="text-white/90 font-[650]">Опыт многих VPN‑решений — в одном коде</div>
            <p className="mt-2 text-sm text-[rgb(var(--muted))]">
              Мы работаем с разными VPN‑провайдерами и на базе их решений написали новый код —
              исправленный и более безопасный. Объединили опыт, убрали слабые места, усилили защиту.
            </p>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
              <div className="text-white/90 font-[650]">Мини‑сценарий</div>
              <div className="mt-2 text-[rgb(var(--muted))]">
                Вы в кафе. Wi‑Fi “видит” только зашифрованный поток. Сайты видят подключение из выбранной страны.
                Мы не сохраняем ваши действия.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRIVACY */}
      <section className="mt-14 md:mt-20">
        <PrivacyBig />
      </section>

      {/* FINAL CTA */}
      <section id="cta" className="mt-14 md:mt-20">
        <div className="rounded-3xl glass p-8 md:p-10 vpn-mood">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 className="text-2xl md:text-4xl font-[800] tracking-tight vpn-glow">
                Подключите “Тёму” — спокойно и понятно
              </h2>
              <p className="mt-3 text-[rgb(var(--muted))] max-w-2xl">
                Визуально красиво, по смыслу честно: защищаем канал, уменьшаем лишние данные, бережём приватность.
              </p>
            </div>

            <a
              href="#"
              className="inline-flex items-center justify-center rounded-2xl bg-white/90 px-6 py-4 text-sm font-[700] text-black hover:bg-white"
              aria-label="Подключить Тёму"
            >
              Подключить Тёму
            </a>
          </div>

          <div className="mt-6 text-xs text-[rgb(var(--muted))]">
            Контакты и ссылки ниже. Этот лендинг — демонстрация принципов UX/визуала, без инструкций обхода ограничений.
          </div>
        </div>

        <footer className="mt-10 pb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-sm text-[rgb(var(--muted))]">
          <div>© {new Date().getFullYear()} VPN “Тёма”</div>
          <div className="flex flex-wrap gap-4">
            <a className="hover:text-white" href="#" aria-label="Политика конфиденциальности">
              Политика
            </a>
            <a className="hover:text-white" href="#" aria-label="Поддержка">
              Поддержка
            </a>
            <a className="hover:text-white" href="#" aria-label="Контакты">
              Контакты
            </a>
          </div>
        </footer>
      </section>
    </main>
  );
}
