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

  return { title, nickname, email, accessToken, postId: createResult.id };
}

test.describe('메인 페이지 포스트 목록', () => {
  test('포스트가 없을 때 빈 상태 메시지가 표시된다', async ({ page }) => {
    await page.goto('/');
    // 로딩 완료 대기
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('아직 등록된 포스트가 없습니다.')).toBeVisible({
      timeout: 10000,
    });
  });

  test('등록된 포스트가 목록에 표시된다', async ({ page }) => {
    const { title, nickname } = await seedPublishedPost({
      title: 'E2E 테스트 포스트',
      nickname: 'E2E작가',
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText(title)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(nickname)).toBeVisible();
  });

  test('여러 포스트가 최신순으로 표시된다', async ({ page }) => {
    await seedPublishedPost({ title: '첫 번째 포스트' });
    // 약간의 딜레이로 시간차 확보
    await new Promise((r) => setTimeout(r, 1000));
    await seedPublishedPost({ title: '두 번째 포스트' });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('두 번째 포스트')).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText('첫 번째 포스트')).toBeVisible();

    // 최신 포스트가 위에 표시되는지 확인
    const articles = page.locator('article');
    const firstArticleText = await articles.first().textContent();
    expect(firstArticleText).toContain('두 번째 포스트');
  });
});
