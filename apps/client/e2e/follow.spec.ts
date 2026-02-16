import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:3000/trpc';

function uniqueEmail() {
  return `test-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@example.com`;
}

async function trpcMutation(
  procedure: string,
  input: Record<string, unknown>,
  accessToken?: string,
) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_URL}/${procedure}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(input),
  });
  const data = await response.json();
  if (data.error) throw new Error(JSON.stringify(data.error));
  return data.result?.data;
}

async function seedPublishedPost(overrides?: {
  title?: string;
  content?: string;
  nickname?: string;
}) {
  // 1. 사용자 등록
  const email = uniqueEmail();
  const nickname =
    overrides?.nickname ?? `author-${Math.random().toString(36).slice(2, 7)}`;
  const password = 'password123';
  await trpcMutation('user.register', {
    email,
    password,
    nickname,
  });

  // 로그인하여 accessToken 획득
  const loginResult = await trpcMutation('user.login', { email, password });
  const accessToken = loginResult.accessToken;

  // 2. 포스트 생성
  const title = overrides?.title ?? '테스트 포스트 제목';
  const content = overrides?.content ?? '테스트 포스트 내용입니다.';
  const createResult = await trpcMutation(
    'post.create',
    { title, content },
    accessToken,
  );

  // 3. 포스트 발행
  await trpcMutation('post.publish', { postId: createResult.id }, accessToken);

  return {
    title,
    nickname,
    email,
    password,
    accessToken,
    postId: createResult.id,
  };
}

async function registerUser(overrides?: { nickname?: string }) {
  const email = uniqueEmail();
  const nickname =
    overrides?.nickname ?? `user-${Math.random().toString(36).slice(2, 7)}`;
  const password = 'password123';
  await trpcMutation('user.register', { email, password, nickname });
  const loginResult = await trpcMutation('user.login', { email, password });
  return { email, password, nickname, accessToken: loginResult.accessToken };
}

async function loginViaUI(
  page: import('@playwright/test').Page,
  email: string,
  password: string,
) {
  await page.goto('/login');
  await page.getByPlaceholder('이메일을 입력하세요').fill(email);
  await page.getByPlaceholder('비밀번호를 입력하세요').fill(password);
  await page.getByRole('button', { name: '로그인' }).click();
  await expect(page).toHaveURL('/', { timeout: 10000 });
}

test.describe('팔로우 기능', () => {
  test('비로그인 시 팔로우 버튼이 표시되지 않는다', async ({ page }) => {
    const { title } = await seedPublishedPost({
      title: '비로그인팔로우테스트',
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const article = page.locator('article').filter({ hasText: title });
    await expect(article).toBeVisible({ timeout: 10000 });
    await expect(
      article.getByRole('button', { name: '팔로우' }),
    ).not.toBeVisible();
  });

  test('로그인 후 다른 작가의 팔로우 버튼이 표시된다', async ({ page }) => {
    const { title } = await seedPublishedPost({
      title: '다른작가팔로우버튼테스트',
      nickname: '작가A',
    });

    const userB = await registerUser({ nickname: '사용자B' });
    await loginViaUI(page, userB.email, userB.password);
    await page.waitForLoadState('networkidle');

    const article = page.locator('article').filter({ hasText: title });
    await expect(article).toBeVisible({ timeout: 10000 });
    await expect(article.getByRole('button', { name: '팔로우' })).toBeVisible({
      timeout: 10000,
    });
  });

  test('팔로우 클릭 시 "팔로잉"으로 변경된다', async ({ page }) => {
    const { title } = await seedPublishedPost({
      title: '팔로우변경테스트',
      nickname: '팔로우작가',
    });

    const userB = await registerUser({ nickname: '팔로우사용자' });
    await loginViaUI(page, userB.email, userB.password);
    await page.waitForLoadState('networkidle');

    const article = page.locator('article').filter({ hasText: title });
    await expect(article).toBeVisible({ timeout: 10000 });

    await article.getByRole('button', { name: '팔로우' }).click();
    await expect(article.getByRole('button', { name: '팔로잉' })).toBeVisible({
      timeout: 10000,
    });
  });

  test('팔로잉 클릭 시 언팔로우되어 "팔로우"로 변경된다', async ({ page }) => {
    const { title } = await seedPublishedPost({
      title: '언팔로우테스트',
      nickname: '언팔로우작가',
    });

    const userB = await registerUser({ nickname: '언팔로우사용자' });
    await loginViaUI(page, userB.email, userB.password);
    await page.waitForLoadState('networkidle');

    const article = page.locator('article').filter({ hasText: title });
    await expect(article).toBeVisible({ timeout: 10000 });

    // 팔로우 → 팔로잉
    await article.getByRole('button', { name: '팔로우' }).click();
    await expect(article.getByRole('button', { name: '팔로잉' })).toBeVisible({
      timeout: 10000,
    });

    // 팔로잉 클릭 → 팔로우로 복원
    await article.getByRole('button', { name: '팔로잉' }).click();
    await expect(article.getByRole('button', { name: '팔로우' })).toBeVisible({
      timeout: 10000,
    });
  });

  test('자기 자신의 포스트에는 팔로우 버튼이 표시되지 않는다', async ({
    page,
  }) => {
    const userC = await seedPublishedPost({
      title: '자기자신포스트테스트',
      nickname: '자기자신작가',
    });

    await loginViaUI(page, userC.email, userC.password);
    await page.waitForLoadState('networkidle');

    const article = page.locator('article').filter({
      hasText: '자기자신포스트테스트',
    });
    await expect(article).toBeVisible({ timeout: 10000 });
    await expect(
      article.getByRole('button', { name: '팔로우' }),
    ).not.toBeVisible();
  });
});
