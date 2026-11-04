import { expect, test } from '@playwright/test';

test('loads the SynthOfDoom foundation shell', async ({ page }) => {
  await page.goto('/');

  await expect(
    page.getByRole('heading', { level: 1, name: 'SynthOfDoom' }),
  ).toBeVisible();
  await expect(page.getByText('Phase 1 · Foundation')).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'The signal path starts here.' }),
  ).toBeVisible();
});
