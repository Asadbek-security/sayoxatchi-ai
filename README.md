# SAYOXATCHI AI

Dam olish maskanlaridagi **reklama va real xizmat sifati** o'rtasidagi tafovutni AI yordamida ko'rsatuvchi web-platforma (Milliy AI Xakaton 2026, 22-muammo).

> Bu repozitoriyada **faqat frontend (dizayn)** bor. Backend (FastAPI) alohida yoziladi.

## Ishga tushirish

```bash
npm install
npm run dev      # http://localhost:3000
```

## Sahifalar

| Yo'l | Ekran |
|---|---|
| `/` | Bosh sahifa: qidiruv, mashhur maskanlar, Trust Score izohi |
| `/search` | Qidiruv: viloyat, min. score, saralash |
| `/resort/[id]` | Maskan profili: Trust Score, AI xulosa, 7 ko'rsatkich, muammolar, sharhlar |
| `/resort/[id]/review` | Sharh qoldirish formasi |
| `/compare` | Reklama vs Real rasm tahlili |
| `/saved` | Saqlangan maskanlar |
| `/profile` | Kirish / ro'yxatdan o'tish (maket) |
| `/admin` | Admin: dashboard, maskanlar, sharhlar, rasmlar, AI jobs, foydalanuvchilar |

Til: o'zbekcha / ruscha (yuqori o'ng burchakdagi tugma). Tarjimalar — `lib/i18n.tsx`.

## Backend dasturchisi uchun

- **Hamma API chaqiruvlari bitta faylda: [`lib/api.ts`](lib/api.ts).** Endpointlar TZ 9-bo'limiga mos (`/api/v1/...`).
- `.env.local` faylida `NEXT_PUBLIC_API_URL=https://api.example.uz` qo'yilsa, sayt demo ma'lumotlar o'rniga real API'ga murojaat qiladi.
- Javob turlari — [`lib/types.ts`](lib/types.ts) (DB sxemasiga mos: `resorts`, `reviews`, `ai_analyses`, `analysis_jobs`, `users`).
- Ko'rsatkich `null` bo'lsa, UI "Ma'lumot yetarli emas" deb ko'rsatadi.
- Trust Score formulasi (TZ 14.4) — [`lib/score.ts`](lib/score.ts). Backend o'zi hisoblasa, `overall` maydonini yuborish kifoya.
- Admin bo'limidagi `adminStats/adminJobs/adminUsers/adminReviews` hozircha faqat mock — admin endpointlari qo'shilganda shu funksiyalarni almashtiring.
- Kirish (JWT) hozircha faqat dizayn: `app/profile/page.tsx`.
- Demo ma'lumotlar — [`lib/mock-data.ts`](lib/mock-data.ts). Maskan nomlari o'ylab topilgan.

## Texnologiyalar

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · lucide-react
