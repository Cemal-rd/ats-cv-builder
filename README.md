# ATS CV Builder

ATS uyumlu CV oluşturma, analiz ve iş ilanına göre optimizasyon uygulaması.
Next.js 15 (App Router) · TypeScript · Tailwind CSS · shadcn/ui · Zustand · React Hook Form + Zod

## Kurulum

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck  # tip kontrolü
```

## Klasör yapısı

```
src/
├─ app/                        # Next.js App Router
│  ├─ layout.tsx               # Tema sağlayıcı, font, toast
│  ├─ page.tsx                 # Builder'ı (yalnızca istemcide) yükler
│  └─ globals.css              # Tema token'ları + @media print (PDF) kuralları
├─ components/
│  ├─ ui/                      # shadcn/ui bileşenleri (button, input, accordion…)
│  ├─ theme/                   # next-themes sağlayıcı + açık/koyu geçişi
│  ├─ builder/                 # Ana düzen ve düzenleme formu
│  │  ├─ resume-builder.tsx    # FormProvider, 2 sütun / mobil sekmeler
│  │  ├─ app-header.tsx        # ATS skoru, içe/dışa aktarma, PDF
│  │  ├─ editor-panel.tsx      # Akordeon bölümler
│  │  ├─ form/                 # TextField, ListItemCard, ListSection
│  │  └─ sections/             # Kişisel, Özet, Deneyim, Eğitim, Yetenek, Proje, Sertifika
│  ├─ preview/                 # Canlı A4 önizleme
│  │  ├─ resume-preview.tsx    # Ölçekleme + sayfa sonu işaretleri
│  │  ├─ printable-resume.tsx  # Yalnızca baskıda görünen CV
│  │  └─ templates/            # classic, modern + şablon kaydı
│  └─ ats/                     # Skor göstergesi, kontrol listesi, ilan eşleştirme
├─ hooks/                      # useResumeList, useAtsReport, useFormStoreSync…
├─ lib/
│  ├─ schema/                  # Zod şemaları + Resume tipleri + fabrikalar
│  ├─ ats/                     # Kural tabanlı ATS analizi, aksiyon fiilleri, anahtar kelimeler
│  ├─ resume/                  # Biçimlendirme yardımcıları, CV başlık etiketleri (TR/EN)
│  └─ export/                  # JSON yedek, yazdırma/PDF
└─ store/resume-store.ts       # Zustand + localStorage kalıcılığı
```

## Veri akışı

```
Form (react-hook-form + zod)  ──watch──▶  Zustand store (localStorage)
                                              │
                    ┌─────────────────────────┼──────────────────────┐
                    ▼                         ▼                      ▼
             Canlı önizleme            ATS analizi             JSON / PDF dışa aktarma
```

## Özellikler

- **Sürükle-bırak:** Kayıtlar ve bölümlerin CV'deki sırası tutamaçtan sürüklenerek değiştirilir (fare, dokunmatik, klavye: Boşluk → oklar → Boşluk). Yukarı/aşağı butonları da kalır.
- **Yabancı Diller:** CEFR seviyeli (A1–C2, Ana dil) yapılandırılmış bölüm.
- **Özel bölümler:** Gönüllülük, Yayınlar, Ödüller vb. Emojiler PDF/önizlemeden otomatik temizlenir, ATS paneli uyarır.
- **Profil fotoğrafı (opsiyonel):** Kare kırpılıp küçültülür (~2–40 KB). İngilizce sürümde ATS paneli uyarır.
- **Türkiye'ye özel alanlar:** Askerlik, ehliyet, doğum tarihi — yalnızca doluysa CV'de görünür.
- **TR / EN sürümler:** Her dil için ayrı içerik; diğer dile ilk geçişte içerik kopyalanır. JSON yedeği her iki sürümü de içerir.

## Genişletme

- **Yeni ATS kuralı:** `lib/ats/rules.ts` içinde bir `AtsRule` yazıp `ATS_RULES` dizisine ekleyin.
- **Yeni şablon:** `components/preview/templates/` altına bileşen ekleyin, `TEMPLATE_IDS` ve `TEMPLATES` kaydını güncelleyin.

## PDF hakkında

PDF, tarayıcının yazdırma motoruyla üretilir (`@media print`). Çıktı gerçek, seçilebilir metin
içerir; tek sütun, standart yazı tipleri ve semantik başlıklar (h1/h2/h3, ul/li) sayesinde ATS
sistemleri tarafından sorunsuz ayrıştırılır. Yazdırma penceresinde "PDF olarak kaydet"i seçin ve
"Üstbilgi ve altbilgi" seçeneğini kapatın.
