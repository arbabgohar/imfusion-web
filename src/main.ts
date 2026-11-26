import { init } from '@imfusion/sdk';
import { makeSpherePhantom } from './phantom';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

async function main() {
  const status = $('status');
  const canvas = $<HTMLCanvasElement>('canvas');
  const input = $<HTMLInputElement>('fileInput');
  const controls = $('controls');
  const windowSlider = $<HTMLInputElement>('windowSlider');
  const levelSlider = $<HTMLInputElement>('levelSlider');
  const windowVal = $('windowVal');
  const levelVal = $('levelVal');
  const invert = $<HTMLInputElement>('invert');
  const autoBtn = $<HTMLButtonElement>('autoBtn');
  const presetSelect = $<HTMLSelectElement>('presetSelect');
  const phantomBtn = $<HTMLButtonElement>('phantomBtn');

  let unsubscribe: (() => void) | null = null;

  try {
    status.textContent = 'Initializing SDK...';
    const imf = await init(canvas);
    status.textContent = 'SDK ready. Choose a file or generate a phantom.';

    // Wires all controls to whichever dataset is currently shown
    const setupControls = (sis: NonNullable<ReturnType<typeof imf.dataModel.getImage>>) => {
      const opts2d = sis.displayOptions2d();
      const opts3d = sis.displayOptions3d();

      const [min, max] = sis.minmaxIntensityOriginal();
      const range = max - min || 1;
      const step = String(range / 500);
      windowSlider.min = step;
      windowSlider.max = String(range * 2);
      windowSlider.step = step;
      levelSlider.min = String(min);
      levelSlider.max = String(max);
      levelSlider.step = step;

      const refresh = () => {
        windowSlider.value = String(opts2d.window);
        levelSlider.value = String(opts2d.level);
        windowVal.textContent = opts2d.window.toFixed(1);
        levelVal.textContent = opts2d.level.toFixed(1);
        invert.checked = opts2d.invert;
      };
      refresh();

      unsubscribe?.();
      unsubscribe = opts2d.onChanged(refresh);

      windowSlider.oninput = () => { opts2d.window = windowSlider.valueAsNumber; };
      levelSlider.oninput = () => { opts2d.level = levelSlider.valueAsNumber; };
      invert.onchange = () => { opts2d.invert = invert.checked; };
      autoBtn.onclick = () => { sis.autoWindow(); refresh(); };

      presetSelect.innerHTML = '';
      for (const name of opts3d.transferFunctionPresetNames()) {
        const opt = document.createElement('option');
        opt.value = name;
        opt.textContent = name;
        presetSelect.appendChild(opt);
      }
      presetSelect.onchange = () => {
        opts3d.applyTransferFunctionPreset(presetSelect.value, sis);
      };

      controls.style.display = 'block';
    };

    input.addEventListener('change', async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        status.textContent = `Loading ${file.name} (${file.size} bytes)...`;
        const data = await imf.loadFile(file);
        imf.showAll(data);
        const sis = imf.dataModel.getImage();
        if (!sis) throw new Error('No image in data model');
        setupControls(sis);
        status.textContent = `Loaded ${file.name}`;
      } catch (e) {
        console.error('Load failed:', e);
        status.textContent = 'Load failed: ' + String(e);
      }
    });

    phantomBtn.addEventListener('click', () => {
      try {
        const size = 64;
        const data = makeSpherePhantom({ size, radius: 20, inside: 1000, outside: 0 });
        const image = imf.createImage({ dimensions: [size, size, size], channels: 1, data });
        if (!image) throw new Error('createImage returned null');
        const sis = imf.createSharedImageSet([image]);
        imf.dataModel.add(sis);
        imf.show(sis);
        setupControls(sis);
        status.textContent = 'Showing synthetic sphere phantom (64^3, radius 20, intensity 1000)';
      } catch (e) {
        console.error('Phantom failed:', e);
        status.textContent = 'Phantom failed: ' + String(e);
      }
    });
  } catch (e) {
    console.error('Init failed:', e);
    status.textContent = 'Init failed: ' + String(e);
  }
}

main();