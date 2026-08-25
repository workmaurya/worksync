import { test, expect } from '@playwright/test';

test.describe('ScholarShare Interactive App Tests', () => {

  test('Authentication - Invalid password triggers error toast', async ({ page }) => {
    await page.goto('http://localhost:8080');

    // Select Abhinav and enter wrong password
    await page.selectOption('#login-user-select', 'Abhinav');
    await page.fill('#login-password-input', '0000');
    await page.click('button[type="submit"]');

    // Check toast message
    const toast = page.locator('#toast-container');
    await expect(toast).toContainText('Invalid credentials, access denied');
    await page.screenshot({ path: 'test-results/01_invalid_login.png' });
  });

  test('Authentication & Home Dashboard - Valid login', async ({ page }) => {
    await page.goto('http://localhost:8080');

    await page.selectOption('#login-user-select', 'Abhinav');
    await page.fill('#login-password-input', '7474');
    await page.click('button[type="submit"]');

    // Verify Home Dashboard loaded
    await expect(page.locator('h1')).toContainText('EduShare');
    await expect(page.locator('main')).toContainText('Abhinav');
    await page.screenshot({ path: 'test-results/02_home_dashboard.png' });
  });

  test('Command Bar Navigation - @group & @dm', async ({ page }) => {
    await page.goto('http://localhost:8080');

    // Login as Admin Abhinav
    await page.selectOption('#login-user-select', 'Abhinav');
    await page.fill('#login-password-input', '7474');
    await page.click('button[type="submit"]');

    // Type @group
    await page.fill('#home-cmd-input', '@group');
    await page.click('form button[type="submit"]');

    // Expect group page loaded
    await expect(page.locator('h2')).toContainText('Mathematics / ScholarShare Workspace');
    await page.screenshot({ path: 'test-results/03_group_workspace.png' });

    // Navigate to Home then @dm
    await page.click('header button:has-text("arrow_back")');
    await page.fill('#home-cmd-input', '@dm');
    await page.click('form button[type="submit"]');

    // Expect DM page loaded
    await expect(page.locator('h2')).toContainText('Direct Messages');
    await page.screenshot({ path: 'test-results/04_dm_page.png' });
  });

  test('Member Read-Only Guardrails in Group Workspace', async ({ page }) => {
    await page.goto('http://localhost:8080');

    // Login as Member Satvik Tripathi
    await page.selectOption('#login-user-select', 'Satvik Tripathi');
    await page.fill('#login-password-input', '9151');
    await page.click('button[type="submit"]');

    // Navigate to group
    await page.fill('#home-cmd-input', '@group');
    await page.click('form button[type="submit"]');

    // Input bar should say disabled with lock icon
    await expect(page.locator('main')).toContainText('Only admins can send messages');

    // Attempting restricted action (click disabled bar)
    await page.click('text=Only admins can send messages');
    await expect(page.locator('#toast-container')).toContainText('Action Restricted: Requires Admin Privileges.');

    await page.screenshot({ path: 'test-results/05_member_group_lock.png' });
  });

  test('Roster Password Masking (Member vs Admin)', async ({ page }) => {
    await page.goto('http://localhost:8080');

    // Login as Member Satvik
    await page.selectOption('#login-user-select', 'Satvik Tripathi');
    await page.fill('#login-password-input', '9151');
    await page.click('button[type="submit"]');

    // Open group info modal
    await page.fill('#home-cmd-input', '@group');
    await page.click('form button[type="submit"]');
    await page.click('button:has-text("Group Info")');

    // Roster passwords should be masked as ••••
    await expect(page.locator('#roster-list')).toContainText('••••');
    await page.screenshot({ path: 'test-results/06_member_masked_roster.png' });

    await page.click('button:has-text("close")');

    // Logout and login as Admin Vatsal
    await page.click('header button:has-text("arrow_back")');
    await page.click('button[title="Logout"]');
    await page.selectOption('#login-user-select', 'Vatsal');
    await page.fill('#login-password-input', '9305');
    await page.click('button[type="submit"]');

    // Open group info modal
    await page.fill('#home-cmd-input', '@group');
    await page.click('form button[type="submit"]');
    await page.click('button:has-text("Group Info")');

    // Passwords should be unmasked (e.g., 7474)
    await expect(page.locator('#roster-list')).toContainText('7474');
    await page.screenshot({ path: 'test-results/07_admin_unmasked_roster.png' });
  });

  test('Member DM Restrictions - Members can only DM Admins', async ({ page }) => {
    await page.goto('http://localhost:8080');

    // Login as Shivam (Member)
    await page.selectOption('#login-user-select', 'Shivam');
    await page.fill('#login-password-input', '9792');
    await page.click('button[type="submit"]');

    // Go to DM page
    await page.fill('#home-cmd-input', '@dm');
    await page.click('form button[type="submit"]');

    // DM sidebar should only show Admins (Abhinav, Vatsal, Adarsh) and NOT Satvik Tripathi
    await expect(page.locator('main')).toContainText('Abhinav');
    await expect(page.locator('main')).not.toContainText('Satvik Tripathi');
    await page.screenshot({ path: 'test-results/08_member_dm_admins_only.png' });
  });

  test('Emoji Reaction System in Group Workspace', async ({ page }) => {
    await page.goto('http://localhost:8080');

    // Login as Abhinav
    await page.selectOption('#login-user-select', 'Abhinav');
    await page.fill('#login-password-input', '7474');
    await page.click('button[type="submit"]');

    // Go to Group
    await page.fill('#home-cmd-input', '@group');
    await page.click('form button[type="submit"]');

    // Hover over message to reveal reaction picker and react with 👍
    const firstMsg = page.locator('.group-message').first();
    await firstMsg.hover();
    await firstMsg.locator('button:has-text("👍")').click();

    await page.screenshot({ path: 'test-results/09_emoji_reaction.png' });
  });
});
