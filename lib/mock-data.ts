// DEMO ma’lumotlar. Maskan nomlari o‘ylab topilgan.
// Backend ulanganda bu fayl o‘rniga lib/api.ts dagi so‘rovlar ishlaydi.
import type { AiAnalysis, AnalysisJob, Resort, Review, User } from "./types";

export const resorts: Resort[] = [
  { id: "yashil-vodiy", name: "Yashil Vodiy Resort", region: "Toshkent viloyati", district: "Bo‘stonliq", address: "Chimyon yo‘li, 12", lat: 41.55, lng: 70.02, rating: 4.6, trust_score: 72, review_count: 24, price_from: 850000, main_problem: "price", tags: ["pool", "food"], cover: "forest", locations: ["green", "mountain"] },
  { id: "chorvoq-boyi", name: "Chorvoq Bo‘yi", region: "Toshkent viloyati", district: "Bo‘stonliq", address: "Suv ombori sohili", lat: 41.62, lng: 70.03, rating: 4.8, trust_score: 54, review_count: 41, price_from: 1200000, main_problem: "cleanliness", tags: ["location", "pool"], cover: "lake", locations: ["water", "mountain"] },
  { id: "zomin-archazor", name: "Zomin Archazor", region: "Jizzax viloyati", district: "Zomin", address: "Milliy bog‘ hududi", lat: 39.7, lng: 68.4, rating: 4.4, trust_score: 86, review_count: 33, price_from: 600000, main_problem: "room", tags: ["location", "staff"], cover: "mountains", locations: ["green", "mountain", "snow"] },
  { id: "tog-nafasi", name: "Tog‘ Nafasi", region: "Toshkent viloyati", district: "Bo‘stonliq", address: "Beldersoy, 3", lat: 41.5, lng: 70.1, rating: 4.1, trust_score: 63, review_count: 18, price_from: 700000, main_problem: "food", tags: ["location"], cover: "mountains", locations: ["mountain", "snow"] },
  { id: "oqtosh-bulogi", name: "Oqtosh Bulog‘i", region: "Toshkent viloyati", district: "Parkent", address: "Oqtosh qishlog‘i", lat: 41.3, lng: 69.8, rating: 3.9, trust_score: 41, review_count: 27, price_from: 500000, main_problem: "service", tags: ["pool"], cover: "garden", locations: ["water", "green"] },
  { id: "samarqand-bogi", name: "Samarqand Bog‘i", region: "Samarqand viloyati", district: "Samarqand sh.", address: "Universitet xiyoboni, 5", lat: 39.65, lng: 66.96, rating: 4.7, trust_score: 81, review_count: 52, price_from: 950000, main_problem: "price", tags: ["food", "staff"], cover: "garden", locations: ["green"] },
  { id: "zarafshon-sohil", name: "Zarafshon Sohil", region: "Navoiy viloyati", district: "Karmana", address: "Daryo bo‘yi", lat: 40.1, lng: 65.3, rating: 4.2, trust_score: null, review_count: 4, price_from: 450000, main_problem: null, tags: ["location"], cover: "lake", locations: ["water"] },
  { id: "fargona-gullari", name: "Farg‘ona Gullari", region: "Farg‘ona viloyati", district: "Farg‘ona sh.", address: "Al-Farg‘oniy ko‘chasi, 20", lat: 40.38, lng: 71.78, rating: 4.5, trust_score: 77, review_count: 29, price_from: 650000, main_problem: "staff", tags: ["food", "room"], cover: "forest", locations: ["green"] },
];

const R = (
  id: number, resort_id: string, author: string, rating: number, text: string, date: string,
  sentiment: Review["sentiment"], sentiment_score: number, fake_probability: number, topics: Review["topics"], language: Review["language"] = "uz", flags: Review["flags"] = [],
): Review => ({ id: `r${id}`, resort_id, author, rating, text, source: "site", date, language, sentiment, sentiment_score, fake_probability, topics, flags });

export const reviews: Review[] = [
  R(1, "yashil-vodiy", "Dilnoza K.", 5, "Basseyn juda toza, ovqat mazali. Bolalar uchun maydoncha bor, oilamiz bilan juda yoqdi.", "2026-09-28", "positive", 0.94, 8, ["pool", "food", "cleanliness"]),
  R(2, "yashil-vodiy", "Jasur T.", 3, "Joy chiroyli, lekin narxlar reklamadagidan ancha qimmat chiqdi. Nonushta narxga kirmagan.", "2026-09-25", "neutral", 0.55, 12, ["price"]),
  R(3, "yashil-vodiy", "Ольга М.", 4, "Хороший персонал, быстро заселили. Номер меньше, чем на фото, но чистый.", "2026-09-22", "positive", 0.71, 10, ["staff", "room", "cleanliness"], "ru"),
  R(4, "yashil-vodiy", "Aziz R.", 2, "Xonada konditsioner ishlamadi, ikki marta aytdik — hech kim kelmadi. Narx/sifat mos emas.", "2026-09-20", "negative", 0.88, 6, ["service", "room", "price"]),
  R(5, "yashil-vodiy", "Mehmon", 5, "Eng zo‘r joy! Eng zo‘r joy! Hammaga tavsiya qilaman!!!", "2026-09-19", "positive", 0.97, 78, ["other"], "uz", ["duplicate", "burst", "no_details"]),
  R(6, "yashil-vodiy", "Mehmon", 5, "Eng zo‘r joy, hammaga tavsiya qilaman!", "2026-09-19", "positive", 0.96, 81, ["other"], "uz", ["duplicate", "burst", "extreme"]),
  R(7, "yashil-vodiy", "Nodira S.", 4, "Tabiat ajoyib, havo toza. Restoranda kutish uzoq bo‘ldi, taxminan 40 daqiqa.", "2026-09-15", "positive", 0.62, 9, ["location", "service", "food"]),
  R(8, "yashil-vodiy", "Bekzod A.", 3, "Basseyn reklamada katta ko‘rinardi, aslida ancha kichik. Lekin suv toza.", "2026-09-12", "neutral", 0.5, 11, ["pool", "cleanliness"]),
  R(9, "yashil-vodiy", "Ирина П.", 5, "Отличная кухня и вежливые официанты. Обязательно вернёмся.", "2026-09-10", "positive", 0.93, 14, ["food", "staff"], "ru"),
  R(10, "yashil-vodiy", "Sardor M.", 2, "Dam olish kunlari juda gavjum, shovqin ko‘p. Narx esa yuqori.", "2026-09-08", "negative", 0.79, 7, ["price", "service"]),
  R(11, "yashil-vodiy", "Malika Y.", 4, "Xodimlar juda samimiy, administrator hamma savollarga javob berdi.", "2026-09-05", "positive", 0.86, 5, ["staff"]),
  R(12, "yashil-vodiy", "Otabek N.", 3, "Hammom tozaligi o‘rtacha edi, sochiqlar eski. Qolgani yaxshi.", "2026-09-02", "neutral", 0.48, 9, ["cleanliness", "room"]),
  R(13, "yashil-vodiy", "Gulnora B.", 5, "Bolalar bilan dam olish uchun ideal. Animatorlar bor.", "2026-08-29", "positive", 0.9, 13, ["service"]),
  R(14, "yashil-vodiy", "Rustam X.", 1, "Bron qilgan xonamizni boshqaga berib yuborishibdi. Uzr ham so‘rashmadi.", "2026-08-26", "negative", 0.95, 4, ["service", "staff"]),
  R(15, "yashil-vodiy", "Kamola D.", 4, "Ovqat mazali, porsiyalar katta. Narxi biroz qimmatroq.", "2026-08-22", "positive", 0.66, 8, ["food", "price"]),
  R(16, "yashil-vodiy", "Алексей В.", 3, "Территория красивая, но уборка в номере была только раз в три дня.", "2026-08-19", "neutral", 0.52, 10, ["cleanliness", "location"], "ru"),
  R(17, "yashil-vodiy", "Shahzod I.", 4, "Joylashuvi qulay, Toshkentdan 1,5 soat. Yo‘l yaxshi.", "2026-08-15", "positive", 0.8, 6, ["location"]),
  R(18, "yashil-vodiy", "Feruza O.", 2, "Rasmda xona yangi ta’mirdan chiqqandek, aslida mebel eskirgan.", "2026-08-11", "negative", 0.83, 7, ["room"]),
  R(19, "yashil-vodiy", "Ulug‘bek Z.", 5, "Xavfsizlik yaxshi, kechasi qo‘riqchi bor. Basseyn yonida qutqaruvchi turadi.", "2026-08-08", "positive", 0.88, 9, ["safety", "pool"]),
  R(20, "yashil-vodiy", "Madina H.", 4, "Umuman olganda yaxshi, faqat Wi-Fi sekin ishlaydi.", "2026-08-03", "positive", 0.6, 7, ["service"]),
  R(21, "chorvoq-boyi", "Javohir E.", 3, "Manzara zo‘r, lekin sohil iflos, plastik idishlar ko‘p.", "2026-09-27", "neutral", 0.45, 9, ["cleanliness", "location"]),
  R(22, "chorvoq-boyi", "Mehmon", 5, "Super! Super! Super!", "2026-09-26", "positive", 0.98, 86, ["other"], "uz", ["no_details", "extreme", "new_account"]),
  R(23, "zomin-archazor", "Sevara L.", 5, "Archazor havosi davolaydi. Xodimlar g‘amxo‘r, hammasi halol.", "2026-09-21", "positive", 0.92, 6, ["location", "staff"]),
  R(24, "oqtosh-bulogi", "Anvar K.", 2, "Ro‘yxatdan o‘tish 1 soat davom etdi, xizmat juda sekin.", "2026-09-18", "negative", 0.87, 8, ["service"]),
];

type A = Omit<AiAnalysis, "resort_id" | "updated_at">;
const analysisBase: Record<string, A> = {
  "yashil-vodiy": {
    reliability: 78, service: 64, cleanliness: 70, food: 84, staff: 80, price: 52, ad_match: 66, overall: 72, confidence: "high",
    summary: {
      uz: "Mehmonlar ovqat sifati, xodimlarning samimiyligi va tabiatni yuqori baholaydi. Eng ko‘p shikoyat narx/sifat nisbati va xona holati bo‘yicha. Basseyn va xonalar reklama rasmlarida haqiqatdagidan kattaroq ko‘rinadi. 2 ta sharh takroriy bo‘lgani uchun shubhali deb belgilandi. Oilaviy dam olish uchun mos, lekin byudjetni oldindan aniqlashtirish tavsiya etiladi.",
      ru: "Гости высоко оценивают кухню, доброжелательность персонала и природу. Больше всего жалоб на соотношение цены и качества и состояние номеров. Бассейн и номера на рекламных фото выглядят больше, чем в реальности. 2 отзыва помечены как подозрительные из-за повторов. Подходит для семейного отдыха, но бюджет лучше уточнить заранее.",
      en: "Guests rate the food, the friendliness of the staff and the nature highly. Most complaints concern value for money and the condition of the rooms. The pool and rooms look bigger in the advertising photos than in reality. 2 reviews were flagged as suspicious because they repeat each other. Suitable for a family holiday, but it is worth checking the budget in advance.",
    },
    strengths: ["food", "staff", "location"],
    problems: [{ topic: "price", mentions: 6 }, { topic: "room", mentions: 4 }, { topic: "cleanliness", mentions: 3 }, { topic: "service", mentions: 3 }],
    analyzed_reviews: 20,
  },
  "chorvoq-boyi": {
    reliability: 42, service: 61, cleanliness: 38, food: 66, staff: 63, price: 49, ad_match: 51, overall: 54, confidence: "medium",
    summary: {
      uz: "Manzara va joylashuv yuqori baholanadi, ammo sohil va hududning tozaligi bo‘yicha shikoyatlar ko‘p. Sharhlarning sezilarli qismi qisqa va bir xil — ularning ishonchliligi past. Yuqori reyting (4.8) real tajribani to‘liq aks ettirmasligi mumkin.",
      ru: "Высоко оценивают вид и расположение, но много жалоб на чистоту пляжа и территории. Значительная часть отзывов короткие и однотипные — их надёжность низкая. Высокий рейтинг (4.8) может не полностью отражать реальный опыт.",
      en: "The view and location are rated highly, but there are many complaints about the cleanliness of the beach and grounds. A large share of the reviews are short and similar — their reliability is low. The high rating (4.8) may not fully reflect the real experience.",
    },
    strengths: ["location", "food"],
    problems: [{ topic: "cleanliness", mentions: 11 }, { topic: "price", mentions: 7 }, { topic: "service", mentions: 5 }],
    analyzed_reviews: 41,
  },
  "zomin-archazor": {
    reliability: 92, service: 85, cleanliness: 88, food: 79, staff: 91, price: 84, ad_match: 87, overall: 86, confidence: "high",
    summary: {
      uz: "Sharhlar ishonchli va izchil. Tabiat, toza havo va xodimlar alohida maqtaladi. Ayrim xonalar eski, lekin reklama rasmlari real holatga mos. Narx/sifat nisbati yaxshi.",
      ru: "Отзывы надёжные и последовательные. Отдельно хвалят природу, чистый воздух и персонал. Некоторые номера устаревшие, но рекламные фото соответствуют реальности. Хорошее соотношение цены и качества.",
      en: "Reviews are reliable and consistent. Guests especially praise the nature, fresh air and staff. Some rooms are dated, but the advertising photos match reality. Good value for money.",
    },
    strengths: ["staff", "location", "cleanliness"],
    problems: [{ topic: "room", mentions: 4 }, { topic: "food", mentions: 2 }],
    analyzed_reviews: 33,
  },
  "tog-nafasi": {
    reliability: 74, service: 62, cleanliness: 66, food: 48, staff: 65, price: 63, ad_match: null, overall: 63, confidence: "medium",
    summary: {
      uz: "Joylashuv va tinchlik yoqadi, ovqat sifati va menyu tanlovi bo‘yicha shikoyatlar bor. Reklama–real mosligini baholash uchun rasmlar yetarli emas.",
      ru: "Нравятся расположение и тишина, есть жалобы на качество еды и выбор меню. Для оценки соответствия рекламы реальности недостаточно фотографий.",
      en: "Guests like the location and the quiet, but there are complaints about food quality and menu choice. There are not enough photos to assess how well the ads match reality.",
    },
    strengths: ["location"],
    problems: [{ topic: "food", mentions: 7 }, { topic: "service", mentions: 3 }, { topic: "room", mentions: 2 }],
    analyzed_reviews: 18,
  },
  "oqtosh-bulogi": {
    reliability: 55, service: 29, cleanliness: 47, food: 44, staff: 38, price: 41, ad_match: 36, overall: 41, confidence: "medium",
    summary: {
      uz: "Xizmat tezligi va xodimlar munosabati bo‘yicha jiddiy shikoyatlar mavjud. Reklama rasmlari real holatdan sezilarli farq qiladi. Tanlashdan oldin so‘nggi sharhlarni o‘qib chiqish tavsiya etiladi.",
      ru: "Есть серьёзные жалобы на скорость обслуживания и отношение персонала. Рекламные фото заметно отличаются от реальности. Перед выбором рекомендуется прочитать последние отзывы.",
      en: "There are serious complaints about the speed of service and the attitude of the staff. The advertising photos differ noticeably from reality. Read the latest reviews before choosing.",
    },
    strengths: ["pool"],
    problems: [{ topic: "service", mentions: 12 }, { topic: "staff", mentions: 8 }, { topic: "cleanliness", mentions: 6 }, { topic: "price", mentions: 5 }],
    analyzed_reviews: 27,
  },
  "samarqand-bogi": {
    reliability: 88, service: 82, cleanliness: 84, food: 90, staff: 86, price: 58, ad_match: 80, overall: 81, confidence: "high",
    summary: {
      uz: "Oshxona va xizmat yuqori darajada. Asosiy kamchilik — narxlar yuqoriligi. Reklama real holatga yaqin.",
      ru: "Кухня и сервис на высоком уровне. Главный минус — высокие цены. Реклама близка к реальности.",
      en: "The kitchen and service are excellent. The main drawback is high prices. The advertising is close to reality.",
    },
    strengths: ["food", "staff", "cleanliness"],
    problems: [{ topic: "price", mentions: 9 }, { topic: "location", mentions: 2 }],
    analyzed_reviews: 52,
  },
  "zarafshon-sohil": {
    reliability: null, service: null, cleanliness: null, food: null, staff: null, price: null, ad_match: null, overall: null, confidence: "low",
    summary: {
      uz: "Sharhlar soni juda kam (4 ta). Ishonchli xulosa chiqarish uchun ma’lumot yetarli emas.",
      ru: "Отзывов очень мало (4). Недостаточно данных для надёжного вывода.",
      en: "There are very few reviews (4). Not enough data for a reliable conclusion.",
    },
    strengths: [],
    problems: [],
    analyzed_reviews: 4,
  },
  "fargona-gullari": {
    reliability: 81, service: 78, cleanliness: 82, food: 85, staff: 61, price: 76, ad_match: 74, overall: 77, confidence: "high",
    summary: {
      uz: "Ovqat va tozalik yaxshi baholanadi. Ayrim xodimlarning munosabati bo‘yicha shikoyatlar bor. Narx/sifat nisbati mos.",
      ru: "Хорошо оценивают еду и чистоту. Есть жалобы на отношение отдельных сотрудников. Соотношение цены и качества адекватное.",
      en: "Food and cleanliness are rated well. There are complaints about the attitude of some staff. Value for money is fair.",
    },
    strengths: ["food", "cleanliness"],
    problems: [{ topic: "staff", mentions: 6 }, { topic: "room", mentions: 3 }],
    analyzed_reviews: 29,
  },
};

export const analyses: AiAnalysis[] = Object.entries(analysisBase).map(([resort_id, a]) => ({
  resort_id,
  updated_at: "2026-10-08T10:30:00Z",
  ...a,
}));

export const jobs: AnalysisJob[] = [
  { id: "j-104", resort_id: "chorvoq-boyi", status: "running", progress: 62, error: null, started_at: "2026-10-09T09:12:00Z", finished_at: null },
  { id: "j-103", resort_id: "tog-nafasi", status: "queued", progress: 0, error: null, started_at: null, finished_at: null },
  { id: "j-102", resort_id: "oqtosh-bulogi", status: "failed", progress: 35, error: "Vision API timeout", started_at: "2026-10-09T08:40:00Z", finished_at: "2026-10-09T08:41:30Z" },
  { id: "j-101", resort_id: "yashil-vodiy", status: "done", progress: 100, error: null, started_at: "2026-10-08T10:28:00Z", finished_at: "2026-10-08T10:30:00Z" },
  { id: "j-100", resort_id: "samarqand-bogi", status: "done", progress: 100, error: null, started_at: "2026-10-08T09:02:00Z", finished_at: "2026-10-08T09:05:10Z" },
];

export const users: User[] = [
  { id: "u1", name: "Admin", email: "admin@sayoxatchi.uz", role: "admin", created_at: "2026-08-01", blocked: false, review_count: 0 },
  { id: "u2", name: "Dilnoza K.", email: "dilnoza@example.com", role: "user", created_at: "2026-09-01", blocked: false, review_count: 3 },
  { id: "u3", name: "Jasur T.", email: "jasur@example.com", role: "user", created_at: "2026-09-04", blocked: false, review_count: 1 },
  { id: "u4", name: "Mehmon", email: "spam123@example.com", role: "user", created_at: "2026-09-19", blocked: true, review_count: 5 },
  { id: "u5", name: "Ольга М.", email: "olga@example.com", role: "user", created_at: "2026-09-21", blocked: false, review_count: 2 },
];
