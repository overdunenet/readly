import { test, expect } from '@playwright/test';

// 테스트마다 고유한 이메일 생성을 위한 헬퍼
function uniqueEmail() {
  return `test-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@example.com`;
}

test.describe('회원가입 페이지', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/signup');
  });

  test('회원가입 폼 요소가 표시된다', async ({ page }) => {
    await expect(page.getByRole('heading', { name: '회원가입' })).toBeVisible();
    await expect(page.getByPlaceholder('이메일을 입력하세요')).toBeVisible();
    await expect(page.getByPlaceholder('비밀번호를 입력하세요')).toBeVisible();
    await expect(page.getByPlaceholder('닉네임을 입력하세요')).toBeVisible();
    await expect(page.getByRole('button', { name: '가입하기' })).toBeVisible();
  });

  test('빈 필드 제출 시 검증 에러가 표시된다', async ({ page }) => {
    await page.getByRole('button', { name: '가입하기' }).click();

    await expect(page.getByText('올바른 이메일 형식이 아닙니다')).toBeVisible();
    await expect(
      page.getByText('비밀번호는 최소 8자 이상이어야 합니다'),
    ).toBeVisible();
    await expect(
      page.getByText('닉네임은 최소 2자 이상이어야 합니다'),
    ).toBeVisible();
  });

  test('회원가입 성공 후 홈으로 리다이렉트된다', async ({ page }) => {
    const email = uniqueEmail();

    await page.getByPlaceholder('이메일을 입력하세요').fill(email);
    await page.getByPlaceholder('비밀번호를 입력하세요').fill('password123');
    await page.getByPlaceholder('닉네임을 입력하세요').fill('테스트유저');
    await page.getByRole('button', { name: '가입하기' }).click();

    await expect(page).toHaveURL('/', { timeout: 10000 });
  });

  test('중복 이메일로 가입 시 에러가 표시된다', async ({ page }) => {
    const email = uniqueEmail();

    // 첫 번째 가입
    await page.getByPlaceholder('이메일을 입력하세요').fill(email);
    await page.getByPlaceholder('비밀번호를 입력하세요').fill('password123');
    await page.getByPlaceholder('닉네임을 입력하세요').fill('테스트유저');
    await page.getByRole('button', { name: '가입하기' }).click();
    await expect(page).toHaveURL('/', { timeout: 10000 });

    // 다시 회원가입 페이지로 이동하여 동일 이메일로 가입 시도
    await page.goto('/signup');
    await page.getByPlaceholder('이메일을 입력하세요').fill(email);
    await page.getByPlaceholder('비밀번호를 입력하세요').fill('password123');
    await page.getByPlaceholder('닉네임을 입력하세요').fill('테스트유저2');
    await page.getByRole('button', { name: '가입하기' }).click();

    // 에러 메시지가 나타나야 함 (서버 에러 - AlertBox)
    await expect(page.locator('[class*="bg-red-50"]')).toBeVisible({
      timeout: 10000,
    });
  });

  test('로그인 링크가 /login으로 이동한다', async ({ page }) => {
    await page.getByRole('link', { name: '로그인' }).click();
    await expect(page).toHaveURL('/login');
  });
});
