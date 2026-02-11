# VPN “Тёма” — лендинг (Next.js + R3F + Tailwind v4)

## Запуск
```bash
npm i
npm run dev
```
Откройте http://localhost:3000

## Где менять тексты/страны/цвета
- Тексты секций: `src/app/page.tsx`
- Страны/таймзоны/координаты: `src/lib/countries.ts`
- Цвета/настроение/стекло/фокус: `src/app/globals.css`
- 3D сцена (Земля/туннель/замок): `src/components/EarthCanvas.tsx`

## Производительность
- 3D грузится лениво (dynamic import в `page.tsx`)
- Авто-упрощение по `deviceMemory/hardwareConcurrency` + `prefers-reduced-motion`: `src/hooks/usePerfTier.ts`
