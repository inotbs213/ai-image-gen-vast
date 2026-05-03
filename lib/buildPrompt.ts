export interface StepFormData {
  // シーン
  scene_type?: string;

  // キャラ基本
  gender?: string;
  age?: string;
  ethnicity?: string;
  skin_tone?: string;
  body_type?: string;
  breast_size?: string;
  pubic_hair?: string;

  // 顔・髪
  face_type?: string;
  hair_style?: string;
  hair_color?: string;
  eye_color?: string;
  eye_shape?: string;
  mouth?: string;
  expression?: string;

  // 衣装
  outfit?: string;
  outfit_color?: string;
  outfit_material?: string;
  outfit_state: string[];
  underwear?: string;
  exposure?: string;

  // ポーズ・構図
  shot_type?: string;
  inset_view?: string;
  angle?: string;
  pose: string[];
  position?: string;

  // シーン設定
  location?: string;
  situation: string[];
  mood?: string;

  // NSFW
  nsfw_level?: string;

  // 共通
  style: "real" | "anime" | "cinematic";
  freePrompt?: string;
  extraNegative?: string;
  steps: number;
  cfg_scale: number;
  width: number;
  height: number;
  seed?: number;
  model?: string;
}

const SCENE_TYPE_PROMPTS: Record<string, string> = {
  solo:             "(1girl:1.2), solo",
  couple_mf:        "1boy, 1girl, couple",
  couple_ff:        "2girls, yuri",
  group:            "multiple girls, group",
  futanari_solo:    "futanari, solo, 1futanari",
  futanari_female:  "futanari with female, 1futanari, 1girl",
  futanari_male:    "futanari with male, 1futanari, 1boy",
  futanari_double:  "2futanari, futa on futa",
};

export function buildUserPrompt(data: StepFormData, facesLoraStrength: number = 0): string {
  const parts: string[] = [];
  const isSolo = !data.scene_type || data.scene_type === "solo" || data.scene_type === "futanari_solo";


  // 1. scene_type
  if (data.scene_type && SCENE_TYPE_PROMPTS[data.scene_type]) {
    parts.push(SCENE_TYPE_PROMPTS[data.scene_type]);
  }

  // 2. shot_type
  if (data.shot_type === "full body") {
    parts.push("full body, long shot, wide shot, full figure, entire body visible, detailed clothing, full outfit visible, feet visible");
  } else if (data.shot_type) {
    parts.push(data.shot_type);
  }

  // 2.5. inset_view
  if (data.inset_view) parts.push(data.inset_view);

  // 3. angle
  if (data.angle) parts.push(data.angle);

  // 4. pose（solo）or position（非solo）
  if (isSolo) {
    if (data.pose.length > 0) parts.push(data.pose.join(", "));
  } else {
    if (data.position) parts.push(data.position);
  }

  // 6. 衣装
  if (data.outfit) {
    const outfitParts = [
      data.outfit_color,
      data.outfit_material,
      ...data.outfit_state.filter(Boolean),
      data.outfit,
    ].filter(Boolean);
    parts.push(outfitParts.join(" "));
  } else if (data.outfit_state.filter(Boolean).length > 0) {
    parts.push(data.outfit_state.filter(Boolean).join(", "));
  }
  if (data.exposure) parts.push(data.exposure);

  // 7. underwear
  if (data.underwear) parts.push(data.underwear);

  // 8. 人種・肌
  if (data.ethnicity) parts.push(data.ethnicity);
  if (data.skin_tone) parts.push(data.skin_tone);

  // 9. キャラ基本
  if (data.gender) parts.push(data.gender);
  if (data.age) parts.push(data.age);
  if (data.body_type) parts.push(data.body_type);
  if (data.breast_size) parts.push(data.breast_size);

  // 10. pubic_hair（強調）
  if (data.pubic_hair) parts.push(`(${data.pubic_hair}:1.4)`);

  // 11. eye_shape（強調・顔セクション先頭）
  if (data.eye_shape) parts.push(`(${data.eye_shape}:1.3)`);

  // 12. 顔・髪
  if (data.face_type) parts.push(data.face_type);
  if (data.hair_color) parts.push(data.hair_color);
  if (data.hair_style) parts.push(data.hair_style);
  if (data.eye_color) parts.push(data.eye_color);
  if (data.mouth) parts.push(data.mouth);
  if (data.expression) parts.push(data.expression);

  // 13. location
  if (data.location) parts.push(data.location);

  // 14. situation（複数）
  if (data.situation.length > 0) parts.push(data.situation.filter(Boolean).join(", "));

  // 15. mood
  if (data.mood) parts.push(data.mood);

  // 16. freePrompt
  if (data.freePrompt) parts.push(data.freePrompt);

  // 17. nsfw_level + LoRA
  if (data.nsfw_level) parts.push(data.nsfw_level);
  if (facesLoraStrength > 0) parts.push(`<lora:better_faces_sdxl:${facesLoraStrength}>`);

  return parts.join(", ");
}
