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
| `/` | Bosh sahifa: kutib olish ekrani (qidiruv, Trust Orb), so‘ng lokatsiyalar bo‘ylab skroll (fon almashadi), pastda “Qayerda dam olmoqchisiz?” va yaqinda ko‘rilganlar |
| `/trust-score` | Trust Score qanday ishlaydi, ko‘rsatkichlar og‘irligi, baholash shkalasi, mashhur maskanlar |
| `/search` | Qidiruv: viloyat, tuman, Trust Score slayderi, reyting, saralash (mobilda — bottom sheet) |
| `/resort/[id]` | Maskan profili: Trust Orb, AI xulosa, 7 suyuq naycha, muammolar, mavzular balansi, ulashish, sharh qoldirish formasi, joylashuv (OpenStreetMap xaritasi, Google/Yandex havolalari) |
| `/resort/[id]/analysis` | AI tahlil paneli: bosqichlar, natija, oldingi tahlildan farq |
| `/resort/[id]/reviews` | Barcha sharhlar: kayfiyat / mavzu / ishonchlilik filtrlari |
| `/resort/[id]/review` | Sharh qoldirish formasi |
| `/compare` | Reklama vs Real: raqamlangan farq nuqtalari, mobilda slayder |
| `/compare-resorts` | 2–3 maskanni yonma-yon solishtirish |
| `/saved` | Saqlangan maskanlar |
| `/profile` | Kirish / ro‘yxatdan o‘tish (maket), saqlanganlar, sozlamalar |
| `/admin` | Admin: dashboard, maskanlar, moderatsiya, rasmlar, AI jobs, foydalanuvchilar |
| `/icons` | Ikonkalar tizimi (barcha o‘lcham va holatlar) |

Til: o‘zbekcha / ruscha / inglizcha. Mavzu: qorong‘i (asosiy) / yorug‘. Tarjimalar — `lib/i18n.tsx` (uz, ru) va `lib/i18n-en.ts` (en).

## Dizayn

"Emerald liquid glass": dizayn tokenlari va shisha materiali — `app/globals.css`, o‘z ikonkalar to‘plami — `components/icons.tsx`,
Trust Orb, suyuq naychalar, kartochkalar — `components/signature.tsx`, shahar foni — `components/CityBackdrop.tsx`.

Fon rasmlari (Wikimedia Commons): Chimyon — LBM1948 (CC BY-SA 4.0); Chorvoq suv ombori — Muxriddin Azimov (CC0);
Yuqori Urungach — AnastasiyaPunko (CC BY-SA 4.0); Aydarko‘l — Galiev Yaroslav (CC BY-SA 4.0).
Lokatsiya rasmlari: Toypan dovoni — Ivan Kondyukov (CC BY-SA 4.0); Amirsoy — WWELNUR (CC BY 4.0);
Beldersoy vodiysi — German Stimban (CC BY-SA 4.0); Ispay sharsharasi — Dilmurad91 (CC BY-SA 4.0).

Lokatsiya turi (`locations` maydoni: `mountain | snow | green | water`) — `lib/types.ts`, qidiruvda `?loc=` parametri.

## Backend dasturchisi uchun

- **Hamma API chaqiruvlari bitta faylda: [`lib/api.ts`](lib/api.ts).** Endpointlar TZ 9-bo'limiga mos (`/api/v1/...`).
- `.env.local` faylida `NEXT_PUBLIC_API_URL=https://api.example.uz` qo'yilsa, sayt demo ma'lumotlar o'rniga real API'ga murojaat qiladi.
- Javob turlari — [`lib/types.ts`](lib/types.ts) (DB sxemasiga mos: `resorts`, `reviews`, `ai_analyses`, `analysis_jobs`, `users`).
- Ko'rsatkich `null` bo'lsa, UI "Ma'lumot yetarli emas" deb ko'rsatadi.
- Trust Score formulasi (TZ 14.4) — [`lib/score.ts`](lib/score.ts). Backend o'zi hisoblasa, `overall` maydonini yuborish kifoya.
- Admin bo'limidagi `adminStats/adminJobs/adminUsers/adminReviews` hozircha faqat mock — admin endpointlari qo'shilganda shu funksiyalarni almashtiring.
- Kirish (JWT) hozircha faqat dizayn: `app/profile/page.tsx`.
- Sharh qoldirish: `addReview()` yaratilgan sharhni qaytarishi kerak (`Review`, `status: "pending"`). Demo rejimida sharhlar brauzerda (`localStorage`) saqlanadi.
- Demo ma'lumotlar — [`lib/mock-data.ts`](lib/mock-data.ts). Maskan nomlari o'ylab topilgan.

## Texnologiyalar

Next.js 15.5 (App Router) · React 19.1 · TypeScript · Tailwind CSS 4 · Motion
