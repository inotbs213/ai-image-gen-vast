export type CharacterRole = "dom" | "sub" | "neutral";

export interface CharacterSpec {
  name?: string;
  extra?: string;
  is_futanari?: boolean;
  role?: CharacterRole;

  // キャラ基本
  age?: string;
  ethnicity?: string;
  skin_tone?: string;
  body_type?: string;
  breast_size?: string;
  pubic_hair?: string;

  // 顔・髪
  face_type?: string;
  hair_color?: string;
  hair_style?: string;
  eye_color?: string;
  eye_shape?: string;
  mouth?: string;
  expression?: string;

  // 衣装
  outfit?: string;
  outfit_color?: string;
  outfit_material?: string;
  outfit_state?: string[];
  underwear?: string;
  exposure?: string;
}

export interface StepFormData {
  // シーン
  scene_type?: string;

  // キャラ基本（ソロ時のみ使用）
  gender?: string;
  age?: string;
  ethnicity?: string;
  skin_tone?: string;
  body_type?: string;
  breast_size?: string;
  pubic_hair?: string;

  // 顔・髪（ソロ時のみ使用）
  face_type?: string;
  hair_style?: string;
  hair_color?: string;
  eye_color?: string;
  eye_shape?: string;
  mouth?: string;
  expression?: string;

  // 衣装（ソロ時のみ使用）
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

  // ペア時のキャラ別設定
  char_a?: CharacterSpec;
  char_b?: CharacterSpec;

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

const ROLE_PROMPTS: Record<CharacterRole, string> = {
  dom: "dominant, aggressive, taking initiative",
  sub: "submissive, receiving, being pleased",
  neutral: "",
};

export function isPairScene(scene_type?: string): boolean {
  if (!scene_type) return false;
  return scene_type !== "solo" && scene_type !== "futanari_solo";
}

// scene_type + 各キャラのis_futanariから動的に人数・性別タグを生成
function buildSceneTypePrompt(
  scene_type: string,
  char_a?: CharacterSpec,
  char_b?: CharacterSpec
): string {
  const aFuta = !!char_a?.is_futanari;
  const bFuta = !!char_b?.is_futanari;
  const futaCount = (aFuta ? 1 : 0) + (bFuta ? 1 : 0);

  switch (scene_type) {
    case "solo":
      return "(1girl:1.2), solo";
    case "futanari_solo":
      return "futanari, solo, 1futanari";
    case "couple_mf":
      if (aFuta || bFuta) return "1futanari, 1boy, futa on male";
      return "1boy, 1girl, couple";
    case "couple_ff":
      if (futaCount === 2) return "2futanari, futa on futa";
      if (futaCount === 1) return "1futanari, 1girl";
      return "2girls, yuri";
    case "group":
      if (futaCount >= 1) return `multiple girls, ${futaCount}futanari, group`;
      return "multiple girls, group";
    default:
      return "";
  }
}

function hasCharContent(c?: CharacterSpec): boolean {
  if (!c) return false;
  return Object.values(c).some(
    (v) =>
      v !== undefined &&
      v !== "" &&
      v !== false &&
      !(Array.isArray(v) && v.length === 0)
  );
}

function buildCharacterBlock(c: CharacterSpec): string {
  const parts: string[] = [];

  // === 識別子（BREAK後の先頭に置き、強い重みでキャラを分離）===
  if (c.name) parts.push(`(${c.name}:1.3)`);
  if (c.extra) parts.push(c.extra);
  if (c.is_futanari) parts.push("futanari, futanari penis");
  if (c.role && ROLE_PROMPTS[c.role]) parts.push(ROLE_PROMPTS[c.role]);

  // === 顔・髪（混ざりやすいので強調・上位に配置）===
  if (c.hair_color) parts.push(`(${c.hair_color}:1.2)`);
  if (c.hair_style) parts.push(c.hair_style);
  if (c.eye_color) parts.push(c.eye_color);
  if (c.eye_shape) {
    const isStandard = c.eye_shape === "detailed eyes";
    parts.push(isStandard ? c.eye_shape : `(${c.eye_shape}:1.3)`);
  }
  if (c.face_type) parts.push(c.face_type);
  if (c.mouth) parts.push(c.mouth);
  if (c.expression) parts.push(`(${c.expression}:1.2)`);

  // === キャラ基本（モデル特性上、両キャラに影響しやすい）===
  if (c.age) parts.push(c.age);
  if (c.ethnicity) parts.push(c.ethnicity);
  if (c.skin_tone) parts.push(c.skin_tone);
  if (c.body_type) parts.push(c.body_type);
  if (c.breast_size) parts.push(c.breast_size);
  if (c.pubic_hair) parts.push(`(${c.pubic_hair}:1.4)`);

  // === 衣装 ===
  if (c.outfit) {
    const outfitParts = [
      c.outfit_color,
      c.outfit_material,
      ...(c.outfit_state ?? []).filter(Boolean),
      c.outfit,
    ].filter(Boolean);
    parts.push(outfitParts.join(" "));
  } else if ((c.outfit_state ?? []).filter(Boolean).length > 0) {
    parts.push((c.outfit_state ?? []).filter(Boolean).join(", "));
  }
  if (c.underwear) parts.push(c.underwear);
  if (c.exposure) parts.push(c.exposure);

  return parts.join(", ");
}

export function buildUserPrompt(data: StepFormData, facesLoraStrength: number = 0): string {
  const parts: string[] = [];
  const isSolo = !isPairScene(data.scene_type);

  // 1. scene_type（is_futanari に応じて動的生成）
  if (data.scene_type) {
    const sceneTypePrompt = buildSceneTypePrompt(data.scene_type, data.char_a, data.char_b);
    if (sceneTypePrompt) parts.push(sceneTypePrompt);
  }

  // 1.5. freePrompt（強調のため前半に配置）
  if (data.freePrompt) parts.push(data.freePrompt);

  // 2. shot_type
  if (data.shot_type === "full body") {
    parts.push("full body, long shot, wide shot, full figure, entire body visible, detailed clothing, full outfit visible, feet visible");
  } else if (data.shot_type) {
    parts.push(data.shot_type);
  }

  // 2.5. inset_view
  if (data.inset_view) parts.push(data.inset_view);

  // 3. angle（シックスナイン選択時はスキップ: 視点タグがposition側に含まれるため）
  const isSixtyNine = !!data.position?.includes("sixty-nine position");
  if (data.angle && !isSixtyNine) parts.push(data.angle);

  if (isSolo) {
    // 4. pose
    if (data.pose.length > 0) parts.push(data.pose.join(", "));

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

    // 9. キャラ基本（scene_type で人数・性別が決まる場合は gender 不要）
    if (data.gender && !data.scene_type) parts.push(data.gender);
    if (data.age) parts.push(data.age);
    if (data.body_type) parts.push(data.body_type);
    if (data.breast_size) parts.push(data.breast_size);

    // 10. pubic_hair（強調）
    if (data.pubic_hair) parts.push(`(${data.pubic_hair}:1.4)`);

    // 11. eye_shape（「標準」は強調しない）
    if (data.eye_shape) {
      const isStandard = data.eye_shape === "detailed eyes";
      parts.push(isStandard ? data.eye_shape : `(${data.eye_shape}:1.3)`);
    }

    // 12. 顔・髪
    if (data.face_type) parts.push(data.face_type);
    if (data.hair_color) parts.push(data.hair_color);
    if (data.hair_style) parts.push(data.hair_style);
    if (data.eye_color) parts.push(data.eye_color);
    if (data.mouth) parts.push(data.mouth);
    if (data.expression) parts.push(data.expression);
  } else {
    // ペア時: position を共通として配置 → BREAK でキャラ別に分離
    if (data.position) parts.push(data.position);

    if (hasCharContent(data.char_a)) {
      parts.push("BREAK");
      parts.push(buildCharacterBlock(data.char_a!));
    }
    if (hasCharContent(data.char_b)) {
      parts.push("BREAK");
      parts.push(buildCharacterBlock(data.char_b!));
    }
    if (hasCharContent(data.char_a) || hasCharContent(data.char_b)) {
      parts.push("BREAK");
    }
  }

  // 13. location
  if (data.location) parts.push(data.location);

  // 14. situation（複数）
  if (data.situation.length > 0) parts.push(data.situation.filter(Boolean).join(", "));

  // 15. mood
  if (data.mood) parts.push(data.mood);

  // 16. LoRA
  if (facesLoraStrength > 0) parts.push(`<lora:better_faces_sdxl:${facesLoraStrength}>`);

  return parts.join(", ");
}
