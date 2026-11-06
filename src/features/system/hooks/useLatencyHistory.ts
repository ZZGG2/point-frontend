import { useEffect, useState } from 'react';
import { pushSample } from '../components/systemMetrics';

/** 폴링 결과가 갱신될 때마다(dataUpdatedAt 변화) 지연 값을 시계열로 쌓는다 */
export function useLatencyHistory(latencyMs: number | undefined, updatedAt: number, max = 30) {
  const [samples, setSamples] = useState<number[]>([]);
  useEffect(() => {
    if (latencyMs == null || updatedAt === 0) return;
    setSamples((prev) => pushSample(prev, latencyMs, max));
  }, [latencyMs, updatedAt, max]);
  return samples;
}
