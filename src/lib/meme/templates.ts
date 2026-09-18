import type { Template } from "./types";

export const TEMPLATES: Template[] = [
  { id: "cat", name: "Кот", src: "/templates/cat.jpg" },
  { id: "dog", name: "Пёс", src: "/templates/dog.jpg" },
  { id: "buttons", name: "Кнопки", src: "/templates/buttons.jpg" },
  { id: "sky", name: "Небо", src: "/templates/sky.jpg" },
  { id: "road", name: "Трасса", src: "/templates/road.jpg" },
  { id: "coffee", name: "Кофе", src: "/templates/coffee.jpg" },
  { id: "rain", name: "Дождь", src: "/templates/rain.jpg" },
  { id: "forest", name: "Лес", src: "/templates/forest.jpg" },
];

export const DEFAULT_TEMPLATE = TEMPLATES[0]!;
