import { expect, test } from '@playwright/test';

test('starts audio and routes computer keyboard notes to the piano', async ({
  page,
}) => {
  await page.goto('/');

  await expect(
    page.getByRole('heading', { level: 1, name: 'SynthOfDoom' }),
  ).toBeVisible();
  await expect(page.getByText('Phase 6 · Full interface')).toBeVisible();
  await expect(
    page.getByRole('heading', {
      name: 'Shape the sound from source to space.',
    }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Audio: Ready to start' }),
  ).toBeVisible();

  await page.getByRole('button', { name: 'Start audio' }).click();
  await expect(
    page.getByRole('heading', { name: 'Audio: Running' }),
  ).toBeVisible();

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
