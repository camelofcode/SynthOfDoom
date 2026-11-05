import { expect, test } from '@playwright/test';

test('starts audio and routes computer keyboard notes to the piano', async ({
  page,
}) => {
  await page.goto('/');

  await expect(
    page.getByRole('heading', { level: 1, name: 'SynthOfDoom' }),
  ).toBeVisible();
  await expect(page.getByText('Phase 5 · Accessible controls')).toBeVisible();
  await expect(
    page.getByRole('heading', {
      name: 'The instrument has a tactile language.',
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

  const cutoff = page.getByRole('slider', { name: 'Cutoff' });
  await cutoff.focus();
  await page.keyboard.press('End');
  await expect(cutoff).toHaveValue('10000');
  await page.getByRole('button', { name: 'Reset Cutoff to default' }).click();
  await expect(cutoff).toHaveValue('1000');
});
