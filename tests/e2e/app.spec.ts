import { expect, test } from '@playwright/test';

test('starts audio and routes computer keyboard notes to the piano', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const BrowserAudioContext = window.AudioContext;
    const debugWindow = window as Window & {
      __synthGainNodes?: GainNode[];
      __synthOscillators?: OscillatorNode[];
      __scopeStrokeStyles?: string[];
    };
    const gainNodes: GainNode[] = [];
    const oscillators: OscillatorNode[] = [];
    debugWindow.__synthGainNodes = gainNodes;
    debugWindow.__synthOscillators = oscillators;
    debugWindow.__scopeStrokeStyles = [];
    const nativeStroke = CanvasRenderingContext2D.prototype.stroke;
    CanvasRenderingContext2D.prototype.stroke = function (path?: Path2D) {
      debugWindow.__scopeStrokeStyles?.push(String(this.strokeStyle));
      Reflect.apply(nativeStroke, this, path ? [path] : []);
    };
    window.AudioContext = class extends BrowserAudioContext {
      override createGain(): GainNode {
        const node = super.createGain();
        gainNodes.push(node);
        return node;
      }

      override createOscillator(): OscillatorNode {
        const node = super.createOscillator();
        oscillators.push(node);
        return node;
      }
    };
  });
  await page.goto('/');

  await expect(
    page.getByRole('heading', { level: 1, name: 'SynthOfDoom' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Audio: Ready to start' }),
  ).toBeVisible();
  const piano = page.getByRole('group', { name: 'Piano keyboard' });
  await expect(piano.getByRole('button')).toHaveCount(25);
  await expect(page.getByRole('button', { name: 'C6' })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'C6' })).toHaveAttribute(
    'data-audio-locked',
  );
  await page.getByText('Preset actions', { exact: true }).click();
  await expect(page.getByRole('button', { name: 'Initialise' })).toBeVisible();
  await page.getByText('Preset actions', { exact: true }).click();

  await page.getByRole('button', { name: 'Start audio' }).click();
  await expect(
    page.getByRole('heading', { name: 'Audio: Running' }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'C6' })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'C6' })).not.toHaveAttribute(
    'data-audio-locked',
  );
  await expect
    .poll(() =>
      page.evaluate(() =>
        (
          window as Window & { __scopeStrokeStyles?: string[] }
        ).__scopeStrokeStyles?.at(-1),
      ),
    )
    .toBe('#76d04b');
  await page.getByLabel('Synth accent colour').fill('#23b89a');
  await expect
    .poll(() =>
      page.evaluate(() =>
        (
          window as Window & { __scopeStrokeStyles?: string[] }
        ).__scopeStrokeStyles?.at(-1),
      ),
    )
    .toBe('#23b89a');

  const noiseEnabled = page.getByRole('button', {
    name: 'Noise mixer Enabled: On',
  });
  const gainValuesBeforeNoise = await page.evaluate(
    () =>
      (
        window as Window & { __synthGainNodes?: GainNode[] }
      ).__synthGainNodes?.map((node) => node.gain.value) ?? [],
  );
  await noiseEnabled.click();
  await expect(
    page.getByRole('button', { name: 'Noise mixer Enabled: Off' }),
  ).toHaveAttribute('aria-pressed', 'false');
  await page.waitForTimeout(25);
  const gainValuesAfterNoise = await page.evaluate(
    () =>
      (
        window as Window & { __synthGainNodes?: GainNode[] }
      ).__synthGainNodes?.map((node) => node.gain.value) ?? [],
  );
  expect(
    gainValuesBeforeNoise.some(
      (value, index) => value > 0 && gainValuesAfterNoise[index] === 0,
    ),
  ).toBe(true);

  const previousGainCount = await page.evaluate(
    () =>
      (window as Window & { __synthGainNodes?: GainNode[] }).__synthGainNodes
        ?.length ?? 0,
  );
  await page
    .getByRole('combobox', { name: 'LFO 1 Target' })
    .selectOption('filter.1.cutoff');
  page.once('dialog', (dialog) => void dialog.accept());
  await page
    .getByRole('combobox', { name: 'Preset', exact: true })
    .selectOption('factory:storm-noise');
  await expect(
    page.getByRole('combobox', { name: 'LFO 1 Target' }),
  ).toHaveValue('none');
  expect(
    await page.evaluate(
      () =>
        (window as Window & { __synthGainNodes?: GainNode[] }).__synthGainNodes
          ?.length ?? 0,
    ),
  ).toBeGreaterThan(previousGainCount);

  await page.keyboard.down('q');
  await page.keyboard.down('e');
  await expect(page.getByRole('button', { name: 'C4' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.getByRole('button', { name: 'E4' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  const soundingFrequencies = await page.evaluate(
    () =>
      (
        window as Window & { __synthOscillators?: OscillatorNode[] }
      ).__synthOscillators?.map((node) => node.frequency.value) ?? [],
  );
  expect(
    soundingFrequencies.some(
      (frequency) => Math.abs(frequency - 261.6256) < 0.01,
    ),
  ).toBe(true);
  expect(
    soundingFrequencies.some(
      (frequency) => Math.abs(frequency - 329.6276) < 0.01,
    ),
  ).toBe(true);
  await page.keyboard.up('q');
  await expect(page.getByRole('button', { name: 'C4' })).toHaveAttribute(
    'aria-pressed',
    'false',
  );
  await expect(page.getByRole('button', { name: 'E4' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.keyboard.up('e');

  const d4 = page.getByRole('button', { name: 'D4' });
  await d4.dispatchEvent('pointerdown', { pointerId: 7, buttons: 1 });
  await expect(d4).toHaveAttribute('aria-pressed', 'true');
  await d4.dispatchEvent('pointerup', { pointerId: 7, buttons: 0 });
  await expect(d4).toHaveAttribute('aria-pressed', 'false');

  const cutoff = page.getByRole('slider', { name: 'Filter 1 Cutoff' });
  const cutoffBox = await cutoff.boundingBox();
  if (!cutoffBox) throw new Error('Filter cutoff knob was not rendered.');
  await page.mouse.move(
    cutoffBox.x + cutoffBox.width / 2,
    cutoffBox.y + cutoffBox.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    cutoffBox.x + cutoffBox.width / 2,
    cutoffBox.y + cutoffBox.height / 2 - 24,
    { steps: 3 },
  );
  await page.mouse.up();
  await expect(cutoff).not.toHaveValue('1000');
  await page.keyboard.down('q');
  await expect(page.getByRole('button', { name: 'C4' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.keyboard.up('q');
  await cutoff.focus();
  await page.keyboard.press('End');
  await expect(cutoff).toHaveValue('10000');
  await page
    .getByRole('button', { name: 'Reset Filter 1 Cutoff to default' })
    .click();
  await expect(cutoff).toHaveValue('1000');
});

test('starts audio from the first piano pointer gesture', async ({ page }) => {
  await page.goto('/');

  const c4 = page.getByRole('button', { name: 'C4' });
  const bounds = await c4.boundingBox();
  if (!bounds) throw new Error('The C4 piano key was not rendered.');
  await page.mouse.move(
    bounds.x + bounds.width / 2,
    bounds.y + bounds.height * 0.82,
  );
  await page.mouse.down();
  await expect(
    page.getByRole('heading', { name: 'Audio: Running' }),
  ).toBeVisible();
  await expect(c4).toHaveAttribute('aria-pressed', 'true');
  await page.mouse.up();
  await expect(c4).toHaveAttribute('aria-pressed', 'false');
  await expect(
    page.getByRole('button', { name: 'Start audio' }),
  ).toBeDisabled();
});

test('keeps the full synth operable at a narrow viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  await expect(
    page.getByRole('region', { name: 'Sources & mixer', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('region', { name: 'Delay & output', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('slider', { name: 'Filter 1 Cutoff' }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test('keeps mixed controls on distinct aligned rows', async ({ page }) => {
  await page.goto('/');

  const oscillator = page.getByRole('region', {
    name: 'Sources & mixer: Oscillator 1',
  });
  const layout = await oscillator.evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    const controlBounds = Array.from(
      element.querySelectorAll<HTMLElement>('[data-control-kind]'),
    ).map((control) => {
      const controlBox = control.getBoundingClientRect();
      const controlSurface = control.firstElementChild?.getBoundingClientRect();
      return {
        kind: control.dataset.controlKind,
        top: controlBox.top,
        width: controlBox.width,
        surfaceHeight: controlSurface?.height ?? 0,
      };
    });
    return { subgroupWidth: bounds.width, controlBounds };
  });

  const toggle = layout.controlBounds.find(({ kind }) => kind === 'boolean');
  const selector = layout.controlBounds.find(({ kind }) => kind === 'enum');
  const knobs = layout.controlBounds.filter(({ kind }) => kind === 'number');
  expect(toggle?.width).toBeGreaterThan(layout.subgroupWidth * 0.9);
  expect(selector?.width).toBeGreaterThan(layout.subgroupWidth * 0.9);
  expect(toggle?.top).toBeLessThan(selector?.top ?? 0);
  expect(selector?.top).toBeLessThan(knobs[0]?.top ?? 0);
  expect(new Set(knobs.map(({ top }) => Math.round(top))).size).toBe(1);
  expect(
    Math.max(...knobs.map(({ surfaceHeight }) => surfaceHeight)) -
      Math.min(...knobs.map(({ surfaceHeight }) => surfaceHeight)),
  ).toBeLessThan(1);

  const filter = page.getByRole('region', {
    name: 'Dual filters: Filter 1',
  });
  const toneRowTop = await filter
    .getByRole('slider', { name: 'Filter 1 envelope Envelope amount' })
    .evaluate((element) => element.getBoundingClientRect().top);
  const adsrTops = await Promise.all(
    ['Attack', 'Decay', 'Sustain', 'Release'].map((name) =>
      filter
        .getByRole('slider', { name: `Filter 1 envelope ${name}` })
        .evaluate((element) => element.getBoundingClientRect().top),
    ),
  );
  expect(new Set(adsrTops.map(Math.round)).size).toBe(1);
  expect(adsrTops[0]).toBeGreaterThan(toneRowTop);

  const noise = page.getByRole('region', {
    name: 'Sources & mixer: Noise',
  });
  const noiseAlignment = await noise.evaluate((element) => {
    const subgroup = element.getBoundingClientRect();
    const knobs = Array.from(
      element.querySelectorAll<HTMLElement>('[data-control-kind="number"]'),
    ).map((control) => control.getBoundingClientRect());
    const rowCentre = (knobs.at(0)!.left + knobs.at(-1)!.right) / 2;
    return {
      subgroupCentre: subgroup.left + subgroup.width / 2,
      rowCentre,
    };
  });
  expect(
    Math.abs(noiseAlignment.rowCentre - noiseAlignment.subgroupCentre),
  ).toBeLessThan(1);

  const lfoPositions = await Promise.all(
    ['LFO 1', 'LFO 2', 'LFO 3'].map((name) =>
      page
        .getByRole('region', { name: `Modulation: ${name}` })
        .evaluate((element) => {
          const bounds = element.getBoundingClientRect();
          return { left: bounds.left, top: bounds.top };
        }),
    ),
  );
  expect(new Set(lfoPositions.map(({ top }) => Math.round(top))).size).toBe(1);
  expect(lfoPositions[0]!.left).toBeLessThan(lfoPositions[1]!.left);
  expect(lfoPositions[1]!.left).toBeLessThan(lfoPositions[2]!.left);

  const performance = page.getByRole('region', {
    name: 'Performance: Voice & glide',
  });
  const performanceControls = await Promise.all(
    ['Performance Voices', 'Performance Portamento'].map((name) =>
      performance.getByRole('slider', { name }).evaluate((element) => {
        const surface = element.closest(
          '[data-control-kind]',
        )?.firstElementChild;
        const bounds = surface?.getBoundingClientRect();
        return { height: bounds?.height ?? 0, top: bounds?.top ?? 0 };
      }),
    ),
  );
  expect(
    new Set(performanceControls.map(({ top }) => Math.round(top))).size,
  ).toBe(1);
  expect(
    Math.abs(performanceControls[0]!.height - performanceControls[1]!.height),
  ).toBeLessThan(1);
});

test('restores the selected factory preset across reload', async ({ page }) => {
  await page.goto('/');

  const preset = page.getByRole('combobox', { name: 'Preset', exact: true });
  const accent = page.getByLabel('Synth accent colour');
  await preset.selectOption('factory:cathedral-lead');
  await accent.fill('#23b89a');
  await expect(preset).toHaveValue('factory:cathedral-lead');
  await expect(accent).toHaveValue('#23b89a');
  await expect(page.getByRole('slider', { name: 'Delay Mix' })).toHaveValue(
    '0.32',
  );
  await expect(
    page.getByRole('slider', { name: 'Performance Voices' }),
  ).toHaveValue('1');

  await page.reload();
  await expect(
    page.getByRole('combobox', { name: 'Preset', exact: true }),
  ).toHaveValue('factory:cathedral-lead');
  await expect(page.getByLabel('Synth accent colour')).toHaveValue('#23b89a');
  await expect(page.getByRole('slider', { name: 'Delay Mix' })).toHaveValue(
    '0.32',
  );
  await expect(
    page.getByRole('slider', { name: 'Performance Voices' }),
  ).toHaveValue('1');
});
