"use client";

import { useState } from "react";
import { buildUserPrompt, StepFormData } from "@/lib/buildPrompt";

const STYLES = {
  real: {
    label: "📷 リアル",
    basePrompt:
      "masterpiece, best quality, ultra-detailed, 8k, high dynamic range, professional photography, soft lighting, natural skin texture, sharp focus, depth of field, smooth skin, glossy skin, subsurface scattering, beautiful face, detailed face, detailed eyes, realistic skin texture, detailed skin pores",
    baseNegative:
      "bad anatomy, deformed, extra limbs, extra fingers, mutated hands, distorted face, low quality, blurry, overexposed, underexposed, bad composition, unrealistic skin, waxy skin, plastic texture, close-up, portrait, headshot, cropped, zoomed in, upper body only, extra fingers, missing fingers, fused fingers, too many fingers, extra toes, missing toes, fused legs, extra legs, missing legs, deformed hands, deformed feet, bad hands, bad feet",
  },
  anime: {
    label: "🎨 アニメ",
    basePrompt:
      "masterpiece, best quality, ultra-detailed, anime style, highly detailed, sharp focus, illustration, vibrant colors, clean lineart, smooth skin, glossy skin, subsurface scattering, beautiful face, detailed face, detailed eyes, realistic skin texture, detailed skin pores",
    baseNegative:
      "photo, realistic, bad anatomy, bad hands, extra fingers, missing fingers, mutated hands, poorly drawn hands, poorly drawn face, deformed, extra limbs, ugly, blurry, low quality, worst quality, close-up, face focus, portrait, headshot, cropped, zoomed in, upper body only, extra fingers, missing fingers, fused fingers, too many fingers, extra toes, missing toes, fused legs, extra legs, missing legs, deformed hands, deformed feet, bad hands, bad feet",
  },
  cinematic: {
    label: "🎬 シネマ",
    basePrompt:
      "masterpiece, best quality, ultra-detailed, 8k, cinematic photo, 35mm photograph, film grain, professional, high dynamic range, cinematic lighting, dramatic atmosphere, sharp focus, depth of field, smooth skin, glossy skin, subsurface scattering, beautiful face, detailed face, detailed eyes, realistic skin texture, detailed skin pores",
    baseNegative:
      "bad anatomy, deformed, extra limbs, extra fingers, mutated hands, distorted face, low quality, blurry, overexposed, underexposed, bad composition, unrealistic skin, cartoon, anime, close-up, portrait, headshot, cropped, zoomed in, upper body only, extra fingers, missing fingers, fused fingers, too many fingers, extra toes, missing toes, fused legs, extra legs, missing legs, deformed hands, deformed feet, bad hands, bad feet",
  },
} as const;

const RESOLUTIONS = [
  { label: "正方形 768×768", width: 768, height: 768 },
  { label: "横長 896×512", width: 896, height: 512 },
  { label: "縦長 512×896", width: 512, height: 896 },
];

const TOTAL_STEPS = 6;
const STEP_TITLES = ["キャラ基本", "顔・表情", "構図・アングル", "背景", "スタイル・パラメータ", "自由入力"];

const DEFAULT: StepFormData = {
  style: "real",
  steps: 24,
  cfg_scale: 5.5,
  width: 768,
  height: 768,
};

function Btn({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
        active
          ? "bg-purple-600 text-white"
          : "bg-gray-800 text-gray-300 hover:bg-gray-700"
      }`}
    >
      {label}
    </button>
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-400 mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export default function Home() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<StepFormData>(DEFAULT);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function toggle(key: keyof StepFormData, value: string) {
    setData((prev) => ({
      ...prev,
      [key]: (prev[key] as string | undefined) === value ? undefined : value,
    }));
  }

  function setVal<K extends keyof StepFormData>(key: K, value: StepFormData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setImageUrl(null);

    const stepData = data;
    const style = STYLES[stepData.style];
    const userPrompt = buildUserPrompt(stepData);
    const finalPrompt = [style.basePrompt, userPrompt].filter(Boolean).join(", ");
    const finalNegative = [style.baseNegative, stepData.extraNegative].filter(Boolean).join(", ");

    const isFullBody = stepData.composition === "full body";
    const finalCfg = isFullBody ? 7.5 : stepData.cfg_scale;
    const finalHeight = isFullBody ? 896 : stepData.height;
    const finalWidth = isFullBody ? 512 : stepData.width;

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: finalPrompt,
          negative_prompt: finalNegative,
          steps: stepData.steps,
          cfg_scale: finalCfg,
          width: finalWidth,
          height: finalHeight,
          sampler_name: "DPM++ 2M Karras",
          override_settings: {
            sd_model_checkpoint: "RealVisXL_V4.0.safetensors",
          },
        }),
      });

      if (!res.ok) throw new Error(`生成失敗 (${res.status})`);
      const json = await res.json();
      if (json.image) {
        setImageUrl(json.image);
      } else {
        throw new Error(json.error ?? "画像データが取得できませんでした");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep(0);
    setData(DEFAULT);
    setImageUrl(null);
    setError("");
  };

  const isConfirm = step === 6;
  const progress = isConfirm ? 100 : ((step + 1) / (TOTAL_STEPS + 1)) * 100;

  return (
    <main className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-center">🎨 AI画像生成</h1>
        <p className="text-gray-400 text-sm text-center mb-6">Vast.ai × RTX 3090</p>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span className="font-medium">
              {isConfirm ? "確認・生成" : `STEP ${step + 1} / ${TOTAL_STEPS}`}
            </span>
            <span>{isConfirm ? "" : STEP_TITLES[step]}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="space-y-5">
          {/* STEP 1: キャラ基本 */}
          {step === 0 && (
            <>
              <h2 className="text-lg font-bold text-white">キャラ基本</h2>
              <FieldGroup label="性別">
                {(["female", "male"] as const).map((v) => (
                  <Btn
                    key={v}
                    label={v === "female" ? "女性" : "男性"}
                    active={data.gender === v}
                    onClick={() => toggle("gender", v)}
                  />
                ))}
              </FieldGroup>
              <FieldGroup label="年齢">
                {(["teen", "adult", "mature"] as const).map((v) => (
                  <Btn
                    key={v}
                    label={v === "teen" ? "ティーン" : v === "adult" ? "アダルト" : "成熟"}
                    active={data.age === v}
                    onClick={() => toggle("age", v)}
                  />
                ))}
              </FieldGroup>
              <FieldGroup label="体型">
                {([
                  { label: "華奢", value: "very slender, petite, thin body" },
                  { label: "スレンダー", value: "slender, lean body" },
                  { label: "スリム", value: "slim" },
                  { label: "普通", value: "normal" },
                  { label: "グラマー", value: "curvy" },
                ] as const).map((v) => (
                  <Btn
                    key={v.value}
                    label={v.label}
                    active={data.body_type === v.value}
                    onClick={() => toggle("body_type", v.value)}
                  />
                ))}
              </FieldGroup>
              <FieldGroup label="髪色">
                {(["black", "brown", "blonde", "white", "silver"] as const).map((v) => (
                  <Btn
                    key={v}
                    label={v}
                    active={data.hair_color === v}
                    onClick={() => toggle("hair_color", v)}
                  />
                ))}
              </FieldGroup>
              <FieldGroup label="ヘアスタイル">
                {(["short", "bob", "long", "twin tails"] as const).map((v) => (
                  <Btn
                    key={v}
                    label={v}
                    active={data.hair_style === v}
                    onClick={() => toggle("hair_style", v)}
                  />
                ))}
              </FieldGroup>
              <FieldGroup label="目の色">
                {(["brown", "black", "blue", "green", "red"] as const).map((v) => (
                  <Btn
                    key={v}
                    label={v}
                    active={data.eye_color === v}
                    onClick={() => toggle("eye_color", v)}
                  />
                ))}
              </FieldGroup>
              <FieldGroup label="人種">
                {(["japanese", "korean", "chinese", "caucasian", "latina", "black"] as const).map((v) => (
                  <Btn
                    key={v}
                    label={v}
                    active={data.ethnicity === v}
                    onClick={() => toggle("ethnicity", v)}
                  />
                ))}
              </FieldGroup>
              <FieldGroup label="胸サイズ">
                {([
                  { label: "小さい", value: "small breasts" },
                  { label: "普通", value: "medium breasts" },
                  { label: "大きい", value: "large breasts, busty" },
                  { label: "爆乳", value: "huge breasts, very large breasts" },
                ] as const).map((v) => (
                  <Btn
                    key={v.value}
                    label={v.label}
                    active={data.breast_size === v.value}
                    onClick={() => toggle("breast_size", v.value)}
                  />
                ))}
              </FieldGroup>
            </>
          )}

          {/* STEP 2: 顔・表情 */}
          {step === 1 && (
            <>
              <h2 className="text-lg font-bold text-white">顔・表情</h2>
              <FieldGroup label="目の形">
                {(["big", "sharp", "droopy"] as const).map((v) => (
                  <Btn
                    key={v}
                    label={v === "big" ? "大きい" : v === "sharp" ? "切れ長" : "垂れ目"}
                    active={data.eye_shape === v}
                    onClick={() => toggle("eye_shape", v)}
                  />
                ))}
              </FieldGroup>
              <FieldGroup label="口元">
                {(["smile", "neutral", "open"] as const).map((v) => (
                  <Btn
                    key={v}
                    label={v === "smile" ? "微笑み" : v === "neutral" ? "自然" : "開口"}
                    active={data.mouth === v}
                    onClick={() => toggle("mouth", v)}
                  />
                ))}
              </FieldGroup>
              <FieldGroup label="表情">
                {(["happy", "neutral", "seductive", "sad"] as const).map((v) => (
                  <Btn
                    key={v}
                    label={
                      v === "happy"
                        ? "笑顔"
                        : v === "neutral"
                        ? "自然"
                        : v === "seductive"
                        ? "色っぽい"
                        : "悲しい"
                    }
                    active={data.expression === v}
                    onClick={() => toggle("expression", v)}
                  />
                ))}
              </FieldGroup>
            </>
          )}

          {/* STEP 3: 構図・アングル */}
          {step === 2 && (
            <>
              <h2 className="text-lg font-bold text-white">構図・アングル</h2>
              <FieldGroup label="構図">
                {(["full body", "upper body", "cowboy shot", "close-up"] as const).map((v) => (
                  <Btn
                    key={v}
                    label={
                      v === "full body"
                        ? "全身"
                        : v === "upper body"
                        ? "上半身"
                        : v === "cowboy shot"
                        ? "カウボーイショット"
                        : "クローズアップ"
                    }
                    active={data.composition === v}
                    onClick={() => toggle("composition", v)}
                  />
                ))}
              </FieldGroup>
              <FieldGroup label="アングル">
                {(["front", "side", "3/4", "from below", "from above"] as const).map((v) => (
                  <Btn
                    key={v}
                    label={
                      v === "front"
                        ? "正面"
                        : v === "side"
                        ? "横"
                        : v === "3/4"
                        ? "斜め"
                        : v === "from below"
                        ? "煽り"
                        : "俯瞰"
                    }
                    active={data.angle === v}
                    onClick={() => toggle("angle", v)}
                  />
                ))}
              </FieldGroup>
              <FieldGroup label="ポーズ">
                {([
                  { label: "standing", value: "standing" },
                  { label: "sitting", value: "sitting" },
                  { label: "lying down", value: "lying down" },
                  { label: "kneeling", value: "kneeling" },
                  { label: "arms crossed", value: "arms crossed" },
                  { label: "hand on hip", value: "hand on hip" },
                  { label: "arms raised", value: "arms raised" },
                  { label: "looking back", value: "looking back" },
                  { label: "足を広げる", value: "spread legs, standing with legs apart" },
                  { label: "背中を反らす", value: "arching the back, back arch pose" },
                  { label: "谷間を強調", value: "showcasing cleavage, leaning forward" },
                  { label: "お尻を強調", value: "booty pose, looking back over shoulder" },
                  { label: "椅子にまたがる", value: "straddling a chair" },
                  { label: "ひざまずく", value: "kneeling pose" },
                  { label: "誘惑的", value: "seductive pose, sultry stance" },
                ] as const).map((v) => (
                  <Btn
                    key={v.value}
                    label={v.label}
                    active={data.pose === v.value}
                    onClick={() => toggle("pose", v.value)}
                  />
                ))}
              </FieldGroup>
            </>
          )}

          {/* STEP 4: 背景 */}
          {step === 3 && (
            <>
              <h2 className="text-lg font-bold text-white">背景</h2>
              <FieldGroup label="背景">
                {(
                  [
                    "white",
                    "city street",
                    "night city",
                    "japanese room",
                    "fantasy forest",
                    "beach",
                  ] as const
                ).map((v) => (
                  <Btn
                    key={v}
                    label={
                      v === "white"
                        ? "白背景"
                        : v === "city street"
                        ? "街並み"
                        : v === "night city"
                        ? "夜の都市"
                        : v === "japanese room"
                        ? "和室"
                        : v === "fantasy forest"
                        ? "幻想の森"
                        : "ビーチ"
                    }
                    active={data.background === v}
                    onClick={() => toggle("background", v)}
                  />
                ))}
              </FieldGroup>
            </>
          )}

          {/* STEP 5: スタイル・解像度・パラメータ */}
          {step === 4 && (
            <>
              <h2 className="text-lg font-bold text-white">スタイル・パラメータ</h2>
              <FieldGroup label="スタイル">
                {(Object.keys(STYLES) as Array<keyof typeof STYLES>).map((k) => (
                  <Btn
                    key={k}
                    label={STYLES[k].label}
                    active={data.style === k}
                    onClick={() => setVal("style", k)}
                  />
                ))}
              </FieldGroup>
              <FieldGroup label="解像度">
                {RESOLUTIONS.map((r) => (
                  <Btn
                    key={r.label}
                    label={r.label}
                    active={data.width === r.width && data.height === r.height}
                    onClick={() =>
                      setData((prev) => ({ ...prev, width: r.width, height: r.height }))
                    }
                  />
                ))}
              </FieldGroup>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  ステップ数: <span className="text-white font-bold">{data.steps}</span>
                </label>
                <input
                  type="range"
                  min={15}
                  max={35}
                  value={data.steps}
                  onChange={(e) => setVal("steps", Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>15</span>
                  <span>35</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  CFG: <span className="text-white font-bold">{data.cfg_scale}</span>
                </label>
                <input
                  type="range"
                  min={3}
                  max={6.5}
                  step={0.5}
                  value={data.cfg_scale}
                  onChange={(e) => setVal("cfg_scale", Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>3.0</span>
                  <span>6.5</span>
                </div>
              </div>
            </>
          )}

          {/* STEP 6: 自由入力 */}
          {step === 5 && (
            <>
              <h2 className="text-lg font-bold text-white">自由入力</h2>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  追加プロンプト <span className="text-gray-600">（任意）</span>
                </label>
                <textarea
                  value={data.freePrompt ?? ""}
                  onChange={(e) => setVal("freePrompt", e.target.value)}
                  placeholder="例: wearing school uniform, cherry blossoms"
                  rows={3}
                  className="w-full bg-gray-800 rounded-lg p-3 text-white resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  追加ネガティブ <span className="text-gray-600">（任意）</span>
                </label>
                <textarea
                  value={data.extraNegative ?? ""}
                  onChange={(e) => setVal("extraNegative", e.target.value)}
                  placeholder="追加で除外したいものがあれば"
                  rows={2}
                  className="w-full bg-gray-800 rounded-lg p-3 text-white resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </>
          )}

          {/* 確認・生成画面 */}
          {step === 6 && (
            <>
              <h2 className="text-lg font-bold text-white mb-2">確認・生成</h2>
              <div className="bg-gray-800 rounded-lg p-4 space-y-1 text-sm">
                {data.gender && (
                  <p>
                    <span className="text-gray-500">性別:</span>{" "}
                    <span className="text-gray-200">{data.gender}</span>
                  </p>
                )}
                {data.age && (
                  <p>
                    <span className="text-gray-500">年齢:</span>{" "}
                    <span className="text-gray-200">{data.age}</span>
                  </p>
                )}
                {data.body_type && (
                  <p>
                    <span className="text-gray-500">体型:</span>{" "}
                    <span className="text-gray-200">{data.body_type}</span>
                  </p>
                )}
                {data.hair_color && (
                  <p>
                    <span className="text-gray-500">髪色:</span>{" "}
                    <span className="text-gray-200">{data.hair_color}</span>
                  </p>
                )}
                {data.hair_style && (
                  <p>
                    <span className="text-gray-500">ヘアスタイル:</span>{" "}
                    <span className="text-gray-200">{data.hair_style}</span>
                  </p>
                )}
                {data.eye_color && (
                  <p>
                    <span className="text-gray-500">目の色:</span>{" "}
                    <span className="text-gray-200">{data.eye_color}</span>
                  </p>
                )}
                {data.eye_shape && (
                  <p>
                    <span className="text-gray-500">目の形:</span>{" "}
                    <span className="text-gray-200">{data.eye_shape}</span>
                  </p>
                )}
                {data.mouth && (
                  <p>
                    <span className="text-gray-500">口元:</span>{" "}
                    <span className="text-gray-200">{data.mouth}</span>
                  </p>
                )}
                {data.expression && (
                  <p>
                    <span className="text-gray-500">表情:</span>{" "}
                    <span className="text-gray-200">{data.expression}</span>
                  </p>
                )}
                {data.composition && (
                  <p>
                    <span className="text-gray-500">構図:</span>{" "}
                    <span className="text-gray-200">{data.composition}</span>
                  </p>
                )}
                {data.angle && (
                  <p>
                    <span className="text-gray-500">アングル:</span>{" "}
                    <span className="text-gray-200">{data.angle}</span>
                  </p>
                )}
                {data.background && (
                  <p>
                    <span className="text-gray-500">背景:</span>{" "}
                    <span className="text-gray-200">{data.background}</span>
                  </p>
                )}
                <p>
                  <span className="text-gray-500">スタイル:</span>{" "}
                  <span className="text-gray-200">{STYLES[data.style].label}</span>
                </p>
                <p>
                  <span className="text-gray-500">解像度:</span>{" "}
                  <span className="text-gray-200">
                    {data.width}×{data.height}
                  </span>
                </p>
                <p>
                  <span className="text-gray-500">ステップ数:</span>{" "}
                  <span className="text-gray-200">{data.steps}</span>
                  <span className="text-gray-500 ml-3">CFG:</span>{" "}
                  <span className="text-gray-200">{data.cfg_scale}</span>
                </p>
                {data.freePrompt && (
                  <p>
                    <span className="text-gray-500">追加プロンプト:</span>{" "}
                    <span className="text-gray-200">{data.freePrompt}</span>
                  </p>
                )}
                {data.extraNegative && (
                  <p>
                    <span className="text-gray-500">追加ネガティブ:</span>{" "}
                    <span className="text-gray-200">{data.extraNegative}</span>
                  </p>
                )}
              </div>

              {!imageUrl && (
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:text-gray-400 font-bold text-lg transition"
                >
                  {loading ? "生成中..." : "🎨 生成する"}
                </button>
              )}

              {loading && (
                <div className="text-center text-gray-400 animate-pulse">
                  生成中... 30秒〜2分かかります
                </div>
              )}

              {error && <p className="text-red-400 text-center">{error}</p>}

              {imageUrl && (
                <div className="space-y-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`data:image/png;base64,${imageUrl}`}
                    alt="生成画像"
                    className="w-full rounded-xl shadow-lg"
                  />
                  <a
                    href={`data:image/png;base64,${imageUrl}`}
                    download={`generated_${Date.now()}.png`}
                    className="block text-center bg-green-600 hover:bg-green-700 rounded-lg py-2 font-medium transition"
                  >
                    💾 ダウンロード
                  </a>
                  <button
                    onClick={() => handleGenerate()}
                    className="mt-2 w-full py-2 rounded bg-gray-700 hover:bg-gray-600 text-white text-sm"
                  >
                    🔄 もう一度生成する（同じ設定で）
                  </button>
                  <button
                    onClick={handleReset}
                    className="w-full py-2 rounded-lg bg-gray-700 hover:bg-gray-600 font-medium transition"
                  >
                    🔄 最初からやり直す
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* ナビゲーション */}
        {!isConfirm && (
          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="flex-1 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 font-medium transition"
              >
                ← 戻る
              </button>
            )}
            <button
              onClick={() => setStep((s) => s + 1)}
              className="flex-1 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 font-bold transition"
            >
              {step === TOTAL_STEPS - 1 ? "確認へ →" : "次へ →"}
            </button>
          </div>
        )}

        {isConfirm && !imageUrl && !loading && (
          <button
            onClick={() => setStep(5)}
            className="w-full mt-4 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 font-medium transition"
          >
            ← 戻る
          </button>
        )}
      </div>
    </main>
  );
}
