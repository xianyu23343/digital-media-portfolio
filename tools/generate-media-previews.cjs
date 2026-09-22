const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const { spawn } = require('child_process');

const repo = path.resolve(__dirname, '..');
const ffmpeg = process.env.FFMPEG_PATH;
const sharp = require(process.env.SHARP_MODULE);

if (!ffmpeg || !fs.existsSync(ffmpeg)) {
  throw new Error('FFMPEG_PATH is missing or invalid.');
}

const videos = [
  'mg-01.mp4',
  'mg-02.mp4',
  'mg-03.mp4',
  'p5-fullmoon-wax-plum.mp4',
  'soda-ad.mp4',
  'game-pv.mp4',
  'aigc-work.mp4',
  'aigc-one-take.mp4',
  'blender-3d-showreel.mp4',
  'photography-duhuo-web.mp4',
  'college-film-01.mp4',
  'college-film-02.mp4'
];

const images = [
  'assets/mono-key-visual.png',
  'assets/projects/poster-childhood.jpg',
  'assets/projects/poster-urban-current.png',
  'assets/projects/poster-red-rider.png',
  'assets/projects/poster-stay-bright.png',
  'assets/projects/poster-tidal-protocol.png',
  'assets/projects/poster-coastal-signal.png',
  'assets/projects/poster-soft-infrastructure.png',
  'assets/projects/poster-vision-explore.png',
  'assets/projects/poster-city-shift.png',
  'assets/projects/poster-urban-signal.png',
  'assets/projects/backrooms.png',
  'assets/projects/blender-flooded-corridor.png',
  'assets/projects/scifi-room.jpg',
  'assets/projects/room-2.png',
  'assets/projects/room-3.png',
  'assets/operations/school-douyin.jpg',
  'assets/operations/bilibili-editing.png',
  'assets/operations/deep-space-profile.jpg',
  'assets/operations/deep-space-works.jpg'
];

const run = (command, args) => new Promise((resolve, reject) => {
  const child = spawn(command, args, { stdio: ['ignore', 'ignore', 'pipe'] });
  let stderr = '';
  child.stderr.on('data', chunk => { stderr += chunk.toString(); });
  child.on('error', reject);
  child.on('close', code => {
    if (code === 0) resolve();
    else reject(new Error(`${path.basename(command)} exited with ${code}\n${stderr.slice(-3000)}`));
  });
});

const bytes = async file => (await fsp.stat(file)).size;
const mb = value => `${(value / 1024 / 1024).toFixed(2)} MB`;

async function generateVideoPreview(name) {
  const input = path.join(repo, 'assets', 'projects', name);
  const base = path.parse(name).name;
  const outputDir = path.join(repo, 'assets', 'previews', 'projects');
  const webDir = path.join(repo, 'assets', 'web', 'projects');
  const preview = path.join(outputDir, `${base}-preview.mp4`);
  const poster = path.join(outputDir, `${base}-poster.webp`);
  const webVideo = path.join(webDir, `${base}.mp4`);
  const previewStart = name === 'mg-01.mp4' ? '8.5' : '2';
  const posterTime = name === 'mg-01.mp4' ? '10' : '2.5';
  await fsp.mkdir(outputDir, { recursive: true });
  await fsp.mkdir(webDir, { recursive: true });

  await run(ffmpeg, [
    '-y', '-ss', previewStart, '-i', input, '-t', '7',
    '-vf', 'scale=720:-2:flags=lanczos,fps=24',
    '-an', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '30',
    '-profile:v', 'main', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
    preview
  ]);
  await run(ffmpeg, [
    '-y', '-ss', posterTime, '-i', input, '-frames:v', '1',
    '-vf', 'scale=720:-2:flags=lanczos', '-c:v', 'libwebp', '-quality', '72',
    poster
  ]);
  await run(ffmpeg, [
    '-y', '-i', input,
    '-map', '0:v:0', '-map', '0:a?',
    '-vf', 'scale=960:960:force_original_aspect_ratio=decrease:force_divisible_by=2',
    '-c:v', 'libx264', '-preset', 'fast', '-crf', '27', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart',
    webVideo
  ]);

  const originalSize = await bytes(input);
  const previewSize = await bytes(preview);
  const webSize = await bytes(webVideo);
  console.log(`video ${name}: ${mb(originalSize)} -> preview ${mb(previewSize)} / full ${mb(webSize)}`);
  return { originalSize, previewSize, webSize };
}

async function generateImagePreview(relative) {
  const input = path.join(repo, relative);
  const parsed = path.parse(relative);
  const relativeFromAssets = path.relative('assets', parsed.dir);
  const outputDir = path.join(repo, 'assets', 'previews', relativeFromAssets);
  const output = path.join(outputDir, `${parsed.name}.webp`);
  await fsp.mkdir(outputDir, { recursive: true });
  await sharp(input)
    .rotate()
    .resize({ width: 1280, withoutEnlargement: true })
    .webp({ quality: 76, effort: 4 })
    .toFile(output);

  const originalSize = await bytes(input);
  const previewSize = await bytes(output);
  console.log(`image ${relative}: ${mb(originalSize)} -> ${mb(previewSize)}`);
  return { originalSize, previewSize };
}

(async () => {
  let originalTotal = 0;
  let previewTotal = 0;
  let webVideoTotal = 0;
  for (const video of videos) {
    const result = await generateVideoPreview(video);
    originalTotal += result.originalSize;
    previewTotal += result.previewSize;
    webVideoTotal += result.webSize;
  }
  for (const image of images) {
    const result = await generateImagePreview(image);
    originalTotal += result.originalSize;
    previewTotal += result.previewSize;
  }
  console.log(`CARD PREVIEWS: ${mb(originalTotal)} source media -> ${mb(previewTotal)} previews`);
  console.log(`FULL WEB VIDEOS: ${mb(webVideoTotal)}`);
})().catch(error => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
