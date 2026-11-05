import { expect, test } from '@playwright/test';

test('starts the SynthOfDoom audio engine after an explicit gesture', async ({
  page,
}) => {
  await page.goto('/');

  await expect(
    page.getByRole('heading', { level: 1, name: 'SynthOfDoom' }),
  ).toBeVisible();
  await expect(page.getByText('Phase 3 · Audio engine')).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'The signal path is alive.' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Audio: Ready to start' }),
  ).toBeVisible();

  await page.getByRole('button', { name: 'Start audio' }).click();
  await expect(
    page.getByRole('heading', { name: 'Audio: Running' }),
  ).toBeVisible();
});
