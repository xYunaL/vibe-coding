import type { Meme } from "./types";

/**
 * Seed memes for the Meme Box demo.
 * Captions reference real F1 meme/radio moments; images are real driver photos
 * from Wikimedia Commons (stable, hotlink-friendly). MemeCard has an onError
 * fallback if any external image fails to load.
 */
export const SEED_MEMES: Meme[] = [
  {
    id: "seed-meme-1",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Alonso-68_%2824710447098%29.jpg/330px-Alonso-68_%2824710447098%29.jpg",
    caption: "GP2 엔진! GP2! 아아!! 🗣️ — 알론소 전설의 라디오",
    authorNickname: "스패니시미사일",
    authorTeamId: "astonmartin",
    likes: 312,
    createdAt: "2026-05-28T21:40:00+09:00",
  },
  {
    id: "seed-meme-2",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/2024-08-25_Motorsport%2C_Formel_1%2C_Gro%C3%9Fer_Preis_der_Niederlande_2024_STP_3978_by_Stepro_%28cropped2%29.jpg/330px-2024-08-25_Motorsport%2C_Formel_1%2C_Gro%C3%9Fer_Preis_der_Niederlande_2024_STP_3978_by_Stepro_%28cropped2%29.jpg",
    caption: "We are checking... 🤡 — 페라리 피트월 클래식",
    authorNickname: "티포시지망생",
    authorTeamId: "ferrari",
    likes: 287,
    createdAt: "2026-05-28T18:15:00+09:00",
  },
  {
    id: "seed-meme-3",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/2024-08-25_Motorsport%2C_Formel_1%2C_Gro%C3%9Fer_Preis_der_Niederlande_2024_STP_3973_by_Stepro_%28medium_crop%29.jpg/330px-2024-08-25_Motorsport%2C_Formel_1%2C_Gro%C3%9Fer_Preis_der_Niederlande_2024_STP_3973_by_Stepro_%28medium_crop%29.jpg",
    caption: "This is boring, 베개 가져올걸 그랬어 😴 — 막스 모나코",
    authorNickname: "불스아이",
    authorTeamId: "redbull",
    likes: 264,
    createdAt: "2026-05-28T14:05:00+09:00",
  },
  {
    id: "seed-meme-4",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Prime_Minister_Keir_Starmer_meets_Sir_Lewis_Hamilton_%2854566928382%29_%28cropped%29.jpg/330px-Prime_Minister_Keir_Starmer_meets_Sir_Lewis_Hamilton_%2854566928382%29_%28cropped%29.jpg",
    caption: "Hammer time 🔨 — Bono, 아직도 그립습니다",
    authorNickname: "해미니즘",
    authorTeamId: "ferrari",
    likes: 233,
    createdAt: "2026-05-27T22:30:00+09:00",
  },
  {
    id: "seed-meme-5",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/KingsLeonSilverstne040724_%2828_of_112%29_%2853838006028%29_%28cropped%29.jpg/330px-KingsLeonSilverstne040724_%2828_of_112%29_%2853838006028%29_%28cropped%29.jpg",
    caption: "Just let me drive!! 🤬 — 러셀 vs 토토",
    authorNickname: "실버애로우",
    authorTeamId: "mercedes",
    likes: 201,
    createdAt: "2026-05-27T16:50:00+09:00",
  },
  {
    id: "seed-meme-6",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/2024-08-25_Motorsport%2C_Formel_1%2C_Gro%C3%9Fer_Preis_der_Niederlande_2024_STP_3968_by_Stepro_%28cropped2%29.jpg/330px-2024-08-25_Motorsport%2C_Formel_1%2C_Gro%C3%9Fer_Preis_der_Niederlande_2024_STP_3968_by_Stepro_%28cropped2%29.jpg",
    caption: "파파야 룰스 🧡 팀오더? 그게 뭔데",
    authorNickname: "파파야사랑",
    authorTeamId: "mclaren",
    likes: 188,
    createdAt: "2026-05-27T11:20:00+09:00",
  },
  {
    id: "seed-meme-7",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Formula1Gabelhofen2022_%2804%29_%28cropped2%29.jpg/330px-Formula1Gabelhofen2022_%2804%29_%28cropped2%29.jpg",
    caption: "Smooth operator 🎵 — 사인츠 테마곡",
    authorNickname: "차일리사인츠",
    authorTeamId: "williams",
    likes: 156,
    createdAt: "2026-05-26T20:10:00+09:00",
  },
  {
    id: "seed-meme-8",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/2019_Formula_One_tests_Barcelona%2C_Hulkenberg_%2840287128313%29.jpg/330px-2019_Formula_One_tests_Barcelona%2C_Hulkenberg_%2840287128313%29.jpg",
    caption: "휠켄베르크 첫 포디엄까지 단 239전 🏆 (드디어!)",
    authorNickname: "헐크매니아",
    authorTeamId: "audi",
    likes: 142,
    createdAt: "2026-05-26T13:40:00+09:00",
  },
  {
    id: "seed-meme-9",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/2022_French_Grand_Prix_%2852279065728%29_%28midcrop%29.png/330px-2022_French_Grand_Prix_%2852279065728%29_%28midcrop%29.png",
    caption: "알핀에서 혼자 점수 따는 가슬리 🔵 (캐리)",
    authorNickname: "블루임펄스",
    authorTeamId: "alpine",
    likes: 118,
    createdAt: "2026-05-25T19:25:00+09:00",
  },
  {
    id: "seed-meme-10",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/2026_Chinese_GP_-_Oscar_Piastri_%28cropped%29_%28cropped%29.jpg/330px-2026_Chinese_GP_-_Oscar_Piastri_%28cropped%29_%28cropped%29.jpg",
    caption: "조용한 암살자 피아스트리 😶 (말없이 추월)",
    authorNickname: "파파야사랑",
    authorTeamId: "mclaren",
    likes: 97,
    createdAt: "2026-05-25T09:15:00+09:00",
  },
];
