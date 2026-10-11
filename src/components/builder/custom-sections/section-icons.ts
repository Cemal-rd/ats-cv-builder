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
  list: { icon: LayoutList, label: "Liste" },
  volunteer: { icon: HeartHandshake, label: "Gönüllülük" },
  publication: { icon: BookOpen, label: "Yayın" },
  news: { icon: Newspaper, label: "Basın" },
  award: { icon: Trophy, label: "Ödül" },
  medal: { icon: Medal, label: "Madalya" },
  badge: { icon: BadgeCheck, label: "Onay" },
  reference: { icon: Users, label: "Kişiler" },
  talk: { icon: Mic, label: "Konuşma" },
  idea: { icon: Lightbulb, label: "Fikir" },
  code: { icon: Code, label: "Kod" },
  globe: { icon: Globe, label: "Dünya" },
  travel: { icon: Plane, label: "Seyahat" },
  art: { icon: Palette, label: "Sanat" },
  music: { icon: Music, label: "Müzik" },
  photo: { icon: Camera, label: "Fotoğraf" },
  sport: { icon: Dumbbell, label: "Spor" },
  star: { icon: Star, label: "Yıldız" },
} satisfies Record<string, { icon: LucideIcon; label: string }>;

export type SectionIconKey = keyof typeof SECTION_ICONS;

export function getSectionIcon(key: string): LucideIcon {
  return (SECTION_ICONS[key as SectionIconKey] ?? SECTION_ICONS.list).icon;
}
