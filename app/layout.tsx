import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Умное детство — развитие детей в Краснодаре",
  description: "Подберём направление для ребёнка по возрасту и задаче: подготовка к школе, Монтессори, скорочтение, творчество и продлёнка в Краснодаре.",
  keywords: ["подготовка к школе Краснодар", "Монтессори Краснодар", "продлёнка Краснодар", "центр развития детей Краснодар", "скорочтение Краснодар"],
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: {
    title: "Умное детство — направление под возраст и задачу ребёнка",
    description: "Подготовка к школе, Монтессори, скорочтение, творчество и продлёнка в Краснодаре.",
    type: "website",
    locale: "ru_RU",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru"><body>{children}</body></html>;
}
