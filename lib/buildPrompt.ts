export interface StepFormData {
  // キャラ基本
  gender?: string;
  age?: string;
  ethnicity?: string;
  skin_tone?: string;
  body_type?: string;
  breast_size?: string;

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
  outfit_state?: string;
  exposure?: string;

  // ポーズ
  composition?: string;
  angle?: string;
  pose?: string;

  // 撮影設定
  camera?: string;
  lighting?: string;

  // NSFW
  nsfw_level?: string;
  nsfw_situation?: string;

  // 背景・詳細
  background?: string;
  style: "real" | "anime" | "cinematic";
  freePrompt?: string;
  extraNegative?: string;
  steps: number;
  cfg_scale: number;
  width: number;
  height: number;

  // シード値
  seed?: number;

  // モデル選択
  model?: string;
}

export function buildUserPrompt(data: StepFormData, facesLoraStrength: number = 0): string {
  const parts: string[] = [];

  // 撮影設定（最初に置くと全体のトーンに影響する）
  if (data.camera) parts.push(data.camera);
  if (data.lighting) parts.push(data.lighting);

  // 構図
  if (data.composition === "full body") {
    parts.push("full body, long shot, wide shot, full figure, entire body visible, detailed clothing, full outfit visible, feet visible");
  } else if (data.composition) {
    parts.push(data.composition);
  }

  // アングル・ポーズ
  if (data.angle) parts.push(data.angle + " angle");
  if (data.pose) parts.push(data.pose);

  // 衣装（色・素材・状態を結合）
  if (data.outfit) {
    const outfitParts = [data.outfit_color, data.outfit_material, data.outfit_state, data.outfit].filter(Boolean);
    parts.push(outfitParts.join(" "));
  }
  if (data.exposure) parts.push(data.exposure);

  // 人種・肌
  if (data.ethnicity) parts.push(data.ethnicity);
  if (data.skin_tone) parts.push(data.skin_tone);

  // キャラ基本
  if (data.gender) parts.push(data.gender);
  if (data.age) parts.push(data.age);
  if (data.body_type) parts.push(data.body_type);
  if (data.breast_size) parts.push(data.breast_size);

  // 顔タイプ
  if (data.face_type) parts.push(data.face_type);

  // 髪
  if (data.hair_color) parts.push(data.hair_color);
  if (data.hair_style) parts.push(data.hair_style);

  // 目・口・表情
  if (data.eye_color) parts.push(data.eye_color);
  if (data.eye_shape) parts.push(data.eye_shape);
  if (data.mouth) parts.push(data.mouth);
  if (data.expression) parts.push(data.expression);

  // NSFWシチュエーション（背景と同レベルで配置）
  if (data.nsfw_situation) parts.push(data.nsfw_situation);

  // 背景
  if (data.background) parts.push(data.background);

  // 自由入力
  if (data.freePrompt) parts.push(data.freePrompt);

  // NSFW強度（末尾近くで強い影響）
  if (data.nsfw_level) parts.push(data.nsfw_level);

  // LoRAタグ
  if (facesLoraStrength > 0) parts.push(`<lora:better_faces_sdxl:${facesLoraStrength}>`);

  return parts.join(", ");
}
