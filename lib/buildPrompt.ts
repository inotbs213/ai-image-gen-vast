export interface StepFormData {
  gender?: string;
  age?: string;
  body_type?: string;
  hair_style?: string;
  hair_color?: string;
  eye_color?: string;
  eye_shape?: string;
  mouth?: string;
  expression?: string;
  composition?: string;
  ethnicity?: string;
  pose?: string;
  breast_size?: string;
  angle?: string;
  background?: string;
  style: "real" | "anime" | "cinematic";
  freePrompt?: string;
  extraNegative?: string;
  steps: number;
  cfg_scale: number;
  width: number;
  height: number;
}

export function buildUserPrompt(data: StepFormData): string {
  const parts: string[] = [];
  if (data.composition === "full body") {
    parts.push("full body, long shot, wide shot, full figure, entire body visible, detailed clothing, full outfit visible, feet visible");
  } else if (data.composition) {
    parts.push(data.composition);
  }
  if (data.ethnicity) parts.push(data.ethnicity);
  if (data.pose) parts.push(data.pose);
  if (data.breast_size) parts.push(data.breast_size);
  if (data.gender) parts.push(data.gender);
  if (data.age) parts.push(data.age);
  if (data.body_type) parts.push(data.body_type + " body");
  if (data.hair_color) parts.push(data.hair_color + " hair");
  if (data.hair_style) parts.push(data.hair_style + " hair style");
  if (data.eye_color) parts.push(data.eye_color + " eyes");
  if (data.eye_shape) parts.push(data.eye_shape + " eyes");
  if (data.mouth) parts.push(data.mouth + " mouth");
  if (data.expression) parts.push(data.expression + " expression");
  if (data.angle) parts.push(data.angle + " angle");
  if (data.background) parts.push(data.background + " background");
  if (data.freePrompt) parts.push(data.freePrompt);
  return parts.join(", ");
}
