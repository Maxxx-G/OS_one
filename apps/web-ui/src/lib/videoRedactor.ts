// Minimal on-device video redaction via Canvas + FaceDetector (if available).
// Falls back to full-frame pixelation when maskAll=true or FaceDetector absent.
export type RedactOpts = { blur: boolean; maskAll: boolean; pixelSize?: number; fps?: number };

export async function createRedactedStream(
  input: MediaStream,
  opts: RedactOpts,
): Promise<MediaStream> {
  const track = input.getVideoTracks()[0];
  if (!track) return input;

  const settings = track.getSettings();
  const width = settings.width || 640;
  const height = settings.height || 480;
  const fps = opts.fps ?? Math.min(30, settings.frameRate || 30);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { alpha: false })!;

  // @ts-ignore experimental
  const FaceDetectorCtor = (window as any).FaceDetector;
  // @ts-ignore experimental
  const detector: any =
    opts.blur && FaceDetectorCtor
      ? new FaceDetectorCtor({ fastMode: true, maxDetectedFaces: 5 })
      : null;

  const [video] = [document.createElement('video')];
  video.srcObject = input;
  video.muted = true;
  video.playsInline = true;
  await video.play().catch(() => {
    /* ignore autoplay errors; user gesture exists */
  });

  let stopped = false;
  const output = (canvas as any).captureStream(fps) as MediaStream;

  const draw = async () => {
    if (stopped) return;
    try {
      ctx.drawImage(video, 0, 0, width, height);

      if (opts.maskAll) {
        pixelate(ctx, 0, 0, width, height, opts.pixelSize ?? 12);
      } else if (detector) {
        const faces = (await detector.detect(video).catch(() => [])) || [];
        for (const f of faces) {
          const box = f.boundingBox || f;
          if (opts.blur) blurRect(ctx, box.x, box.y, box.width, box.height);
        }
      }
    } catch {}
    requestAnimationFrame(draw);
  };
  requestAnimationFrame(draw);

  // tie lifecycle to original tracks
  const stop = () => {
    stopped = true;
    output.getTracks().forEach((t) => t.stop());
  };
  input.getTracks().forEach((t) => t.addEventListener('ended', stop));

  return output;
}

function blurRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  // simple pixelate-based blur
  pixelate(ctx, x, y, w, h, 10);
}

function pixelate(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  size: number,
) {
  const img = ctx.getImageData(x, y, w, h);
  const sw = Math.max(1, Math.floor(w / size));
  const sh = Math.max(1, Math.floor(h / size));
  const tmp = document.createElement('canvas');
  tmp.width = sw;
  tmp.height = sh;
  const tctx = tmp.getContext('2d', { alpha: false })!;
  // scale down
  tctx.imageSmoothingEnabled = false;
  tctx.drawImage(ctx.canvas, x, y, w, h, 0, 0, sw, sh);
  // scale up (pixelated)
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(tmp, 0, 0, sw, sh, x, y, w, h);
}
