import { useEffect, useRef } from 'react';
import type { AnalyserNodePort } from '../../audio/contracts';
import styles from './Oscilloscope.module.scss';

export function Oscilloscope({
  analyser,
  active,
  accent,
}: {
  readonly analyser: AnalyserNodePort | null;
  readonly active: boolean;
  readonly accent: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analyser || !active) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    const samples = new Uint8Array(analyser.fftSize);
    let frame = 0;

    const draw = () => {
      if (document.visibilityState === 'hidden') {
        frame = requestAnimationFrame(draw);
        return;
      }
      const ratio = window.devicePixelRatio || 1;
      const width = Math.max(320, canvas.clientWidth);
      const height = Math.max(120, canvas.clientHeight);
      if (canvas.width !== width * ratio || canvas.height !== height * ratio) {
        canvas.width = width * ratio;
        canvas.height = height * ratio;
      }
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);
      analyser.getByteTimeDomainData(samples);
      context.beginPath();
      context.strokeStyle = accent;
      context.lineWidth = 2;
      for (let index = 0; index < samples.length; index += 1) {
        const x = (index / (samples.length - 1)) * width;
        const y = ((samples[index] ?? 128) / 255) * height;
        if (index === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.stroke();
      frame = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(frame);
  }, [accent, active, analyser]);

  return (
    <figure className={styles.scope}>
      <figcaption>Master output oscilloscope</figcaption>
      <canvas ref={canvasRef} aria-label="Live master output waveform" />
    </figure>
  );
}
