"use client";
import type { LocationType } from "./types";

// Fon sahnasini almashtirish: null — shahar foni, aks holda lokatsiya rasmi.
// "preload" — rasmlarni oldindan yuklab qo‘yish (bo‘lim ekranga yaqinlashganda).
export type SceneEvent = LocationType | null | "preload";
const EVT = "sayoxatchi-scene";

export function setScene(s: SceneEvent) {
  window.dispatchEvent(new CustomEvent<SceneEvent>(EVT, { detail: s }));
}

export function onScene(cb: (s: SceneEvent) => void) {
  const h = (e: Event) => cb((e as CustomEvent<SceneEvent>).detail);
  window.addEventListener(EVT, h);
  return () => window.removeEventListener(EVT, h);
}

export const LOCATION_PHOTOS: Record<LocationType, { src: string; pos: string; credit: string; place: string; license: string; url: string }> = {
  mountain: { src: "/loc/mountain.webp", pos: "50% 55%", credit: "Ivan Kondyukov", place: "Toypan dovoni", license: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:%D0%9F%D0%B5%D1%80%D0%B5%D0%B2%D0%B0%D0%BB_%D0%A2%D0%BE%D0%B9%D0%BF%D0%B0%D0%BD.jpg" },
  snow: { src: "/loc/snow.webp", pos: "50% 40%", credit: "WWELNUR", place: "Amirsoy", license: "CC BY 4.0", url: "https://commons.wikimedia.org/wiki/File:Amirsoy_Winter_Landscape.jpg" },
  green: { src: "/loc/green.webp", pos: "50% 50%", credit: "German Stimban", place: "Beldersoy vodiysi", license: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:Spring_Beldersay_valley.JPG" },
  water: { src: "/loc/water.webp", pos: "50% 50%", credit: "Dilmurad91", place: "Ispay sharsharasi", license: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:%D0%98%D1%81%D0%BF%D0%B0%D0%B9%D1%81%D0%BA%D0%B8%D0%B9_%D0%B2%D0%BE%D0%B4%D0%BE%D0%BF%D0%B0%D0%B4.jpg" },
};
