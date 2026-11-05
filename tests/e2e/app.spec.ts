import { expect, test } from '@playwright/test';

test('starts audio and routes computer keyboard notes to the piano', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const BrowserAudioContext = window.AudioContext;
    const debugWindow = window as Window & { __synthGainNodes?: GainNode[] };
    const gainNodes: GainNode[] = [];
    debugWindow.__synthGainNodes = gainNodes;
    window.AudioContext = class extends BrowserAudioContext {
      override createGain(): GainNode {
        const node = super.createGain();
        gainNodes.push(node);
        return node;
      }
    };
  });
  await page.goto('/');

  await expect(
    page.getByRole('heading', { level: 1, name: 'SynthOfDoom' }),
  ).toBeVisible();
  await expect(page.getByText('Phase 7 · Presets')).toBeVisible();
  await expect(
    page.getByRole('heading', {
      name: 'Build a sound. Keep it.',
    }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Audio: Ready to start' }),
  ).toBeVisible();

  await page.getByRole('button', { name: 'Start audio' }).click();
  await expect(
    page.getByRole('heading', { name: 'Audio: Running' }),
  ).toBeVisible();

  const noiseEnabled = page.getByRole('button', {
    name: 'Noise mixer Enabled: On',
  });
  await noiseEnabled.click();
  await expect(
    page.getByRole('button', { name: 'Noise mixer Enabled: Off' }),
  ).toHaveAttribute('aria-pressed', 'false');
  expect(
    await page.evaluate(
      () =>
        (window as Window & { __synthGainNodes?: GainNode[] })
          .__synthGainNodes?.[16]?.gain.value,
    ),
  ).toBe(0);

  await page.keyboard.down('q');
  await expect(page.getByRole('button', { name: 'C4' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.keyboard.up('q');
  await expect(page.getByRole('button', { name: 'C4' })).toHaveAttribute(
    'aria-pressed',
    'false',
  );

  const d4 = page.getByRole('button', { name: 'D4' });
  await d4.dispatchEvent('pointerdown', { pointerId: 7, buttons: 1 });
  await expect(d4).toHaveAttribute('aria-pressed', 'true');
  await d4.dispatchEvent('pointerup', { pointerId: 7, buttons: 0 });
  await expect(d4).toHaveAttribute('aria-pressed', 'false');

  const cutoff = page.getByRole('slider', { name: 'Filter 1 Cutoff' });
  await cutoff.focus();
  await page.keyboard.press('End');
  await expect(cutoff).toHaveValue('10000');
  await page
    .getByRole('button', { name: 'Reset Filter 1 Cutoff to default' })
    .click();
  await expect(cutoff).toHaveValue('1000');
});

test('keeps the full synth operable at a narrow viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  await expect(page.getByRole('region', { name: 'Oscillators' })).toBeVisible();
  await expect(
    page.getByRole('region', { name: 'Delay & output' }),
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

test('restores the selected factory preset across reload', async ({ page }) => {
  await page.goto('/');

  const preset = page.getByRole('combobox', { name: 'Preset', exact: true });
  await preset.selectOption('factory:cathedral-lead');
  await expect(preset).toHaveValue('factory:cathedral-lead');
  await expect(page.getByRole('slider', { name: 'Delay Mix' })).toHaveValue(
    '0.32',
  );

  await page.reload();
  await expect(
    page.getByRole('combobox', { name: 'Preset', exact: true }),
  ).toHaveValue('factory:cathedral-lead');
  await expect(page.getByRole('slider', { name: 'Delay Mix' })).toHaveValue(
    '0.32',
  );
});
