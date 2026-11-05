import { expect, test } from '@playwright/test';

test('loads the SynthOfDoom domain shell', async ({ page }) => {
  await page.goto('/');

  await expect(
    page.getByRole('heading', { level: 1, name: 'SynthOfDoom' }),
  ).toBeVisible();
  await expect(page.getByText('Phase 2 · Domain model')).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'The signal path has a contract.' }),
  ).toBeVisible();
});
