export type PerformanceSample = Readonly<{
  sampleCount: number;
  averageFps: number;
  onePercentLowFps: number;
  worstFrameTimeMs: number;
}>;

export type PerformanceSamplerConfig = Readonly<{
  warmupFrames: number;
  sampleFrames: number;
}>;

export const PERFORMANCE_SAMPLE_CONFIG: PerformanceSamplerConfig = Object.freeze({
  warmupFrames: 60,
  sampleFrames: 300,
});

export function summarizeFrameDeltas(deltas: readonly number[]): PerformanceSample {
  if (deltas.length === 0) throw new Error("At least one frame delta is required");
  const normalized = deltas.map(delta => Math.max(delta, 1));
  const totalDelta = normalized.reduce((sum, delta) => sum + delta, 0);
  const slowFrameCount = Math.max(1, Math.ceil(normalized.length * 0.01));
  const slowest = [...normalized].sort((left, right) => right - left).slice(0, slowFrameCount);
  const slowestAverage = slowest.reduce((sum, delta) => sum + delta, 0) / slowest.length;

  return Object.freeze({
    sampleCount: normalized.length,
    averageFps: normalized.length * 1000 / totalDelta,
    onePercentLowFps: 1000 / slowestAverage,
    worstFrameTimeMs: Math.max(...normalized),
  });
}

export class PerformanceSampler {
  private warmupCount = 0;
  private readonly deltas: number[] = [];
  private completed = false;
  private readonly config: PerformanceSamplerConfig;

  constructor(config: PerformanceSamplerConfig = PERFORMANCE_SAMPLE_CONFIG) {
    if (config.warmupFrames < 0 || config.sampleFrames < 1) {
      throw new Error("Performance sampler frame counts must be positive");
    }
    this.config = config;
  }

  record(delta: number): PerformanceSample | undefined {
    if (this.completed) return undefined;
    if (this.warmupCount < this.config.warmupFrames) {
      this.warmupCount += 1;
      return undefined;
    }

    this.deltas.push(Math.max(delta, 1));
    if (this.deltas.length < this.config.sampleFrames) return undefined;
    this.completed = true;
    return summarizeFrameDeltas(this.deltas);
  }
}
