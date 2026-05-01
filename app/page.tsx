"use client";

import { useState } from "react";
import { buildUserPrompt, StepFormData } from "@/lib/buildPrompt";
import { OPTIONS, MODELS, ModelDef } from "@/lib/optionsData";

// ── モデルヘルパー ────────────────────────────────────────────
function getCurrentModel(modelValue?: string): ModelDef {
  return MODELS.find((m) => m.value === modelValue) ?? MODELS[0];
}

const FAMILY_LABEL: Record<string, string> = {
  sdxl_real: "🎨 標準SDXL系",
  pony_real: "🐴 Pony系（特殊プロンプト体系）",
  illustrious_anime: "✨ Illustrious系（Danbooruタグ推奨）",
};

const RESOLUTIONS = [
  { label: "正方形 1024×1024", width: 1024, height: 1024 },
  { label: "横長 1216×832", width: 1216, height: 832 },
  { label: "縦長 832×1216", width: 832, height: 1216 },
];

const DEFAULT: StepFormData = {
  style: "real",
  steps: 30,
  cfg_scale: 4.0,
  width: 832,
  height: 1216,
  model: "novaAsianXL_illustrious_v7.safetensors",
};

// ── タブ定義 ──────────────────────────────────────────────────
type TabId = "character" | "face" | "outfit" | "pose" | "scene" | "detail";

const TABS: { id: TabId; label: string }[] = [
  { id: "character", label: "👤 キャラ" },
  { id: "face",      label: "💄 顔・髪" },
  { id: "outfit",    label: "👗 衣装" },
  { id: "pose",      label: "📐 ポーズ" },
  { id: "scene",     label: "🌆 シーン" },
  { id: "detail",    label: "⚙️ 詳細" },
];

// ── 共通コンポーネント ────────────────────────────────────────
function Btn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
        active ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
      }`}
    >
      {label}
    </button>
  );
}

function FieldGroup({
  label,
  children,
  scrollable = false,
}: {
  label: string;
  children: React.ReactNode;
  scrollable?: boolean;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-400 mb-2">{label}</p>
      <div
        className={`flex flex-wrap gap-2 ${
          scrollable ? "max-h-40 overflow-y-auto p-2 bg-gray-800/30 rounded-lg" : ""
        }`}
      >
        {children}
      </div>
    </div>
  );
}

// ── タブProps型 ───────────────────────────────────────────────
interface TabProps {
  data: StepFormData;
  toggle: (key: keyof StepFormData, value: string) => void;
  setVal: <K extends keyof StepFormData>(key: K, value: StepFormData[K]) => void;
}

// ── 各タブコンポーネント ──────────────────────────────────────
function CharacterTab({ data, toggle }: TabProps) {
  return (
    <>
      <FieldGroup label="性別">
        {OPTIONS.gender.map((opt) => (
          <Btn key={opt.value} label={opt.label} active={data.gender === opt.value}
            onClick={() => toggle("gender", opt.value)} />
        ))}
      </FieldGroup>
      <FieldGroup label="年齢">
        {OPTIONS.age.map((opt) => (
          <Btn key={opt.value} label={opt.label} active={data.age === opt.value}
            onClick={() => toggle("age", opt.value)} />
        ))}
      </FieldGroup>
      <FieldGroup label="人種">
        {OPTIONS.ethnicity.map((opt) => (
          <Btn key={opt.value} label={opt.label} active={data.ethnicity === opt.value}
            onClick={() => toggle("ethnicity", opt.value)} />
        ))}
      </FieldGroup>
      <FieldGroup label="肌の色">
        {OPTIONS.skin_tone.map((opt) => (
          <Btn key={opt.value} label={opt.label} active={data.skin_tone === opt.value}
            onClick={() => toggle("skin_tone", opt.value)} />
        ))}
      </FieldGroup>
      <FieldGroup label="体型">
        {OPTIONS.body_type.map((opt) => (
          <Btn key={opt.value} label={opt.label} active={data.body_type === opt.value}
            onClick={() => toggle("body_type", opt.value)} />
        ))}
      </FieldGroup>
      <FieldGroup label="胸サイズ">
        {OPTIONS.breast_size.map((opt) => (
          <Btn key={opt.value} label={opt.label} active={data.breast_size === opt.value}
            onClick={() => toggle("breast_size", opt.value)} />
        ))}
      </FieldGroup>
    </>
  );
}

function FaceTab({ data, toggle }: TabProps) {
  return (
    <>
      <FieldGroup label="顔タイプ（雰囲気）">
        {OPTIONS.face_type.map((opt) => (
          <Btn key={opt.value} label={opt.label} active={data.face_type === opt.value}
            onClick={() => toggle("face_type", opt.value)} />
        ))}
      </FieldGroup>
      <FieldGroup label="髪色">
        {OPTIONS.hair_color.map((opt) => (
          <Btn key={opt.value} label={opt.label} active={data.hair_color === opt.value}
            onClick={() => toggle("hair_color", opt.value)} />
        ))}
      </FieldGroup>
      <FieldGroup label="ヘアスタイル">
        {OPTIONS.hair_style.map((opt) => (
          <Btn key={opt.value} label={opt.label} active={data.hair_style === opt.value}
            onClick={() => toggle("hair_style", opt.value)} />
        ))}
      </FieldGroup>
      <FieldGroup label="目の色">
        {OPTIONS.eye_color.map((opt) => (
          <Btn key={opt.value} label={opt.label} active={data.eye_color === opt.value}
            onClick={() => toggle("eye_color", opt.value)} />
        ))}
      </FieldGroup>
      <FieldGroup label="目の形">
        {OPTIONS.eye_shape.map((opt) => (
          <Btn key={opt.value} label={opt.label} active={data.eye_shape === opt.value}
            onClick={() => toggle("eye_shape", opt.value)} />
        ))}
      </FieldGroup>
      <FieldGroup label="口元">
        {OPTIONS.mouth.map((opt) => (
          <Btn key={opt.value} label={opt.label} active={data.mouth === opt.value}
            onClick={() => toggle("mouth", opt.value)} />
        ))}
      </FieldGroup>
      <FieldGroup label="表情" scrollable>
        {OPTIONS.expression.map((opt) => (
          <Btn key={opt.value} label={opt.label} active={data.expression === opt.value}
            onClick={() => toggle("expression", opt.value)} />
        ))}
      </FieldGroup>
    </>
  );
}

function OutfitTab({ data, toggle }: TabProps) {
  return (
    <>
      <FieldGroup label="衣装" scrollable>
        {OPTIONS.outfit.map((opt) => (
          <Btn key={opt.value || "none"} label={opt.label} active={data.outfit === opt.value}
            onClick={() => toggle("outfit", opt.value)} />
        ))}
      </FieldGroup>
      <FieldGroup label="衣装の色">
        {OPTIONS.outfit_color.map((opt) => (
          <Btn key={opt.value} label={opt.label} active={data.outfit_color === opt.value}
            onClick={() => toggle("outfit_color", opt.value)} />
        ))}
      </FieldGroup>
      <FieldGroup label="素材">
        {OPTIONS.outfit_material.map((opt) => (
          <Btn key={opt.value || "standard"} label={opt.label} active={data.outfit_material === opt.value}
            onClick={() => toggle("outfit_material", opt.value)} />
        ))}
      </FieldGroup>
      <FieldGroup label="状態">
        {OPTIONS.outfit_state.map((opt) => (
          <Btn key={opt.value || "standard"} label={opt.label} active={data.outfit_state === opt.value}
            onClick={() => toggle("outfit_state", opt.value)} />
        ))}
      </FieldGroup>
      <FieldGroup label="露出度">
        {OPTIONS.exposure.map((opt) => (
          <Btn key={opt.value || "standard"} label={opt.label} active={data.exposure === opt.value}
            onClick={() => toggle("exposure", opt.value)} />
        ))}
      </FieldGroup>
    </>
  );
}

function PoseTab({ data, toggle }: TabProps) {
  return (
    <>
      <FieldGroup label="構図" scrollable>
        {OPTIONS.composition.map((opt) => (
          <Btn key={opt.value} label={opt.label} active={data.composition === opt.value}
            onClick={() => toggle("composition", opt.value)} />
        ))}
      </FieldGroup>
      <FieldGroup label="アングル" scrollable>
        {OPTIONS.angle.map((opt) => (
          <Btn key={opt.value} label={opt.label} active={data.angle === opt.value}
            onClick={() => toggle("angle", opt.value)} />
        ))}
      </FieldGroup>
      <FieldGroup label="ポーズ" scrollable>
        {OPTIONS.pose.map((opt) => (
          <Btn key={opt.value} label={opt.label} active={data.pose === opt.value}
            onClick={() => toggle("pose", opt.value)} />
        ))}
      </FieldGroup>
    </>
  );
}

function SceneTab({ data, toggle }: TabProps) {
  return (
    <>
      <FieldGroup label="背景" scrollable>
        {OPTIONS.background.map((opt) => (
          <Btn key={opt.value} label={opt.label} active={data.background === opt.value}
            onClick={() => toggle("background", opt.value)} />
        ))}
      </FieldGroup>
      <FieldGroup label="NSFWシチュエーション">
        {OPTIONS.nsfw_situation.map((opt) => (
          <Btn key={opt.value || "none"} label={opt.label} active={data.nsfw_situation === opt.value}
            onClick={() => toggle("nsfw_situation", opt.value)} />
        ))}
      </FieldGroup>
      <FieldGroup label="カメラ・撮影スタイル">
        {OPTIONS.camera.map((opt) => (
          <Btn key={opt.value || "standard"} label={opt.label} active={data.camera === opt.value}
            onClick={() => toggle("camera", opt.value)} />
        ))}
      </FieldGroup>
      <FieldGroup label="ライティング">
        {OPTIONS.lighting.map((opt) => (
          <Btn key={opt.value || "standard"} label={opt.label} active={data.lighting === opt.value}
            onClick={() => toggle("lighting", opt.value)} />
        ))}
      </FieldGroup>
    </>
  );
}

function DetailTab({
  data, toggle, setVal, facesLoraStrength, setFacesLoraStrength, lastSeed, onModelSelect,
}: TabProps & {
  facesLoraStrength: number;
  setFacesLoraStrength: (v: number) => void;
  lastSeed: number | null;
  onModelSelect: (m: ModelDef) => void;
}) {
  return (
    <>
      <div>
        <FieldGroup label="🔞 NSFW強度">
          {OPTIONS.nsfw_level.map((opt) => (
            <Btn key={opt.value || "none"} label={opt.label} active={data.nsfw_level === opt.value}
              onClick={() => toggle("nsfw_level", opt.value)} />
          ))}
        </FieldGroup>
        {data.nsfw_level && (
          <p className="text-xs text-yellow-500 mt-1 ml-1">
            ⚠️ NSFW強度を選択中。意図しない場合は「なし」を選択してください
          </p>
        )}
      </div>

      <div>
        <FieldGroup label="モデル">
          {MODELS.map((m) => (
            <Btn
              key={m.value}
              label={m.label}
              active={data.model === m.value}
              onClick={() => onModelSelect(m)}
            />
          ))}
        </FieldGroup>
        {(() => {
          const m = getCurrentModel(data.model);
          return (
            <div className="bg-gray-800/50 rounded-lg p-3 mt-2 space-y-1">
              <p className="text-xs text-gray-400">{m.description}</p>
              <p className="text-xs text-purple-400">{FAMILY_LABEL[m.family]}</p>
              <p className="text-xs text-gray-500">
                推奨: CFG {m.recommended.cfg_scale} / Steps {m.recommended.steps} / {m.recommended.sampler}
              </p>
            </div>
          );
        })()}
      </div>

      <FieldGroup label="解像度">
        {RESOLUTIONS.map((r) => (
          <Btn key={r.label} label={r.label}
            active={data.width === r.width && data.height === r.height}
            onClick={() => { setVal("width", r.width); setVal("height", r.height); }} />
        ))}
      </FieldGroup>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">
          ステップ数: <span className="text-white font-bold">{data.steps}</span>
        </label>
        <input type="range" min={20} max={40} value={data.steps}
          onChange={(e) => setVal("steps", Number(e.target.value))}
          className="w-full accent-purple-500" />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>20</span><span>40</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">
          CFG: <span className="text-white font-bold">{data.cfg_scale}</span>
        </label>
        <input type="range" min={3} max={6.5} step={0.5} value={data.cfg_scale}
          onChange={(e) => setVal("cfg_scale", Number(e.target.value))}
          className="w-full accent-purple-500" />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>3.0</span><span>6.5</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">
          顔クオリティ補正（Better Faces LoRA）:{" "}
          <span className="text-white font-bold">
            {facesLoraStrength === 0 ? "オフ" : facesLoraStrength.toFixed(2)}
          </span>
        </label>
        <input type="range" min={0} max={1} step={0.05} value={facesLoraStrength}
          onChange={(e) => setFacesLoraStrength(Number(e.target.value))}
          className="w-full accent-purple-500" />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>オフ</span><span>1.0</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">
          追加プロンプト <span className="text-gray-600">（任意）</span>
        </label>
        <textarea value={data.freePrompt ?? ""}
          onChange={(e) => setVal("freePrompt", e.target.value)}
          placeholder="例: wearing school uniform, cherry blossoms"
          rows={3}
          className="w-full bg-gray-800 rounded-lg p-3 text-white resize-none focus:outline-none focus:ring-2 focus:ring-purple-500" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">
          追加ネガティブ <span className="text-gray-600">（任意）</span>
        </label>
        <textarea value={data.extraNegative ?? ""}
          onChange={(e) => setVal("extraNegative", e.target.value)}
          placeholder="追加で除外したいものがあれば"
          rows={2}
          className="w-full bg-gray-800 rounded-lg p-3 text-white resize-none focus:outline-none focus:ring-2 focus:ring-purple-500" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">
          シード値 <span className="text-gray-600">（任意・空欄でランダム）</span>
        </label>
        <input
          type="number"
          value={data.seed ?? ""}
          onChange={(e) => {
            const v = e.target.value;
            setVal("seed", v === "" ? undefined : Number(v));
          }}
          placeholder="-1 または空欄でランダム"
          className="w-full bg-gray-800 rounded-lg p-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        {lastSeed !== null && (
          <button
            onClick={() => setVal("seed", lastSeed)}
            className="mt-2 text-xs text-purple-400 hover:text-purple-300"
          >
            → 直近のシード値（{lastSeed}）を使用
          </button>
        )}
      </div>
    </>
  );
}

// ── 設定サマリー ──────────────────────────────────────────────
function SettingSummary({ data }: { data: StepFormData }) {
  const parts = [
    data.gender === "female" ? "女性" : data.gender === "male" ? "男性" : null,
    OPTIONS.age.find((o) => o.value === data.age)?.label ?? null,
    OPTIONS.ethnicity.find((o) => o.value === data.ethnicity)?.label ?? null,
    OPTIONS.body_type.find((o) => o.value === data.body_type)?.label ?? null,
    OPTIONS.outfit.find((o) => o.value === data.outfit)?.label ?? null,
    OPTIONS.composition.find((o) => o.value === data.composition)?.label ?? null,
  ].filter(Boolean);

  if (parts.length === 0) return null;
  return (
    <p className="text-xs text-gray-400 mb-2 truncate">
      {parts.join(" / ")}
    </p>
  );
}

// ── メインコンポーネント ──────────────────────────────────────
export default function Home() {
  const [selectedTab, setSelectedTab] = useState<TabId>("character");
  const [data, setData] = useState<StepFormData>(DEFAULT);
  const [facesLoraStrength, setFacesLoraStrength] = useState(0.8);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastSeed, setLastSeed] = useState<number | null>(null);
  const [seedLocked, setSeedLocked] = useState(false);

  function toggle(key: keyof StepFormData, value: string) {
    setData((prev) => ({
      ...prev,
      [key]: (prev[key] as string | undefined) === value ? undefined : value,
    }));
  }

  function setVal<K extends keyof StepFormData>(key: K, value: StepFormData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function handleModelSelect(m: ModelDef) {
    setData((prev) => ({
      ...prev,
      model: m.value,
      cfg_scale: m.recommended.cfg_scale,
      steps: m.recommended.steps,
      width: m.recommended.width,
      height: m.recommended.height,
    }));
  }

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setImageUrl(null);

    // シード決定ロジック
    let effectiveSeed = -1;
    if (seedLocked && lastSeed !== null) {
      effectiveSeed = lastSeed;
    } else if (data.seed !== undefined && data.seed >= 0) {
      effectiveSeed = data.seed;
    }
    const stepData = { ...data, seed: effectiveSeed };

    const currentModel = getCurrentModel(stepData.model);
    const userPrompt = buildUserPrompt(stepData, facesLoraStrength);
    const finalPrompt = [currentModel.basePrompt, userPrompt].filter(Boolean).join(", ");
    const finalNegative = [currentModel.baseNegative, stepData.extraNegative].filter(Boolean).join(", ");

    const isFullBody = stepData.composition === "full body";
    const finalWidth = isFullBody ? 832 : stepData.width;
    const finalHeight = isFullBody ? 1216 : stepData.height;

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: finalPrompt,
          negative_prompt: finalNegative,
          steps: stepData.steps,
          cfg_scale: stepData.cfg_scale,
          width: finalWidth,
          height: finalHeight,
          sampler_name: currentModel.recommended.sampler,
          seed: effectiveSeed,
          override_settings: {
            sd_model_checkpoint: currentModel.value,
          },
        }),
      });

      if (!res.ok) throw new Error(`生成失敗 (${res.status})`);
      const json = await res.json();
      if (json.image) {
        setImageUrl(json.image);
        if (json.seed !== undefined) {
          setLastSeed(json.seed);
        }
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
    setData(DEFAULT);
    setImageUrl(null);
    setError("");
    setLastSeed(null);
    setSeedLocked(false);
    setSelectedTab("character");
  };

  const tabProps: TabProps = { data, toggle, setVal };

  return (
    <main className="min-h-screen bg-gray-900 text-white pb-32">
      <div className="max-w-3xl mx-auto p-4">
        {/* ヘッダー */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold">🎨 AI画像生成</h1>
          <p className="text-gray-400 text-xs mt-1">Vast.ai × RTX 3090 × A1111</p>
        </div>

        {/* タブナビ */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 sticky top-0 bg-gray-900 z-10 pt-2 -mx-4 px-4">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`whitespace-nowrap shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition ${
                selectedTab === tab.id
                  ? "bg-purple-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* タブコンテンツ */}
        <div className="space-y-5">
          {selectedTab === "character" && <CharacterTab {...tabProps} />}
          {selectedTab === "face"      && <FaceTab {...tabProps} />}
          {selectedTab === "outfit"    && <OutfitTab {...tabProps} />}
          {selectedTab === "pose"      && <PoseTab {...tabProps} />}
          {selectedTab === "scene"     && <SceneTab {...tabProps} />}
          {selectedTab === "detail"    && (
            <DetailTab {...tabProps}
              facesLoraStrength={facesLoraStrength}
              setFacesLoraStrength={setFacesLoraStrength}
              lastSeed={lastSeed}
              onModelSelect={handleModelSelect} />
          )}
        </div>

        {/* エラー */}
        {error && <p className="text-red-400 text-center mt-6">{error}</p>}

        {/* 生成済み画像プレビュー */}
        {imageUrl && (
          <div className="mt-8 space-y-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`data:image/png;base64,${imageUrl}`}
              alt="生成画像"
              className="w-full rounded-xl shadow-lg"
            />

            {/* シード値表示エリア */}
            {lastSeed !== null && (
              <div className="bg-gray-800 rounded-lg p-3 flex items-center justify-between gap-3">
                <div className="text-sm">
                  <span className="text-gray-500">シード:</span>{" "}
                  <span className="text-white font-mono text-xs break-all">{lastSeed}</span>
                </div>
                <button
                  onClick={() => setSeedLocked(!seedLocked)}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition shrink-0 ${
                    seedLocked
                      ? "bg-yellow-600 hover:bg-yellow-500 text-white"
                      : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                  }`}
                >
                  {seedLocked ? "🔒 顔を固定中" : "🔓 顔をランダム"}
                </button>
              </div>
            )}

            {/* シード固定中の補助テキスト */}
            {seedLocked && (
              <p className="text-xs text-yellow-400 px-1">
                💡 シード固定中：衣装やポーズなど他の項目だけ変えて再生成すると、同じ顔のまま着替えなどができます
              </p>
            )}

            <a
              href={`data:image/png;base64,${imageUrl}`}
              download={`generated_${Date.now()}.png`}
              className="block text-center bg-green-600 hover:bg-green-700 rounded-lg py-2 font-medium transition"
            >
              💾 ダウンロード
            </a>
            <button
              onClick={() => handleGenerate()}
              className="w-full py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm transition"
            >
              🔄 再生成
            </button>
            <button
              onClick={handleReset}
              className="w-full py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm transition"
            >
              🆕 設定をリセット
            </button>
          </div>
        )}
      </div>

      {/* 下部固定の生成ボタン */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 p-4 z-20">
        <div className="max-w-3xl mx-auto">
          <SettingSummary data={data} />
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:text-gray-400 font-bold text-lg transition"
          >
            {loading
              ? "生成中... しばらくお待ちください"
              : imageUrl
                ? seedLocked
                  ? "🔒 同じ顔で再生成"
                  : "🔄 再生成（顔も変わる）"
                : "🎨 生成する"
            }
          </button>
        </div>
      </div>
    </main>
  );
}
