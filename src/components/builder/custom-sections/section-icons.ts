import {
  BadgeCheck,
  BookOpen,
  Camera,
  Code,
  Dumbbell,
  Globe,
  HeartHandshake,
  LayoutList,
  Lightbulb,
  Medal,
  Mic,
  Music,
  Newspaper,
  Palette,
  Plane,
  Star,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";

/** Özel bölümler için seçilebilir editör simgeleri (anahtar → bileşen). */
export const SECTION_ICONS = {
  list: { icon: LayoutList },
  volunteer: { icon: HeartHandshake },
  publication: { icon: BookOpen },
  news: { icon: Newspaper },
  award: { icon: Trophy },
  medal: { icon: Medal },
  badge: { icon: BadgeCheck },
  reference: { icon: Users },
  talk: { icon: Mic },
  idea: { icon: Lightbulb },
  code: { icon: Code },
  globe: { icon: Globe },
  travel: { icon: Plane },
  art: { icon: Palette },
  music: { icon: Music },
  photo: { icon: Camera },
  sport: { icon: Dumbbell },
  star: { icon: Star },
} satisfies Record<string, { icon: LucideIcon }>;

/** Simge adları (ekran okuyucu/ipucu) arayüz dilinde: i18n → icons.labels. */
export type SectionIconKey = keyof typeof SECTION_ICONS;

export function getSectionIcon(key: string): LucideIcon {
  return (SECTION_ICONS[key as SectionIconKey] ?? SECTION_ICONS.list).icon;
}
