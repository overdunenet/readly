import { createFileRoute } from '@tanstack/react-router';
import tw from 'tailwind-styled-components';

import FeedCard from '../components/feed/FeedCard';
import Layout from '../components/layout/Layout';

import { trpc } from '@/shared';

// Mock data for demonstration
const mockFeeds = [
  {
    id: 1,
    author: '김작가',
    title: '2024년 웹 개발 트렌드와 미래 전망',
    excerpt:
      '올해 웹 개발 업계에서 주목받고 있는 기술 스택과 프레임워크들을 살펴보고, 앞으로의 발전 방향에 대해 논의해보겠습니다.',
    thumbnail: 'https://via.placeholder.com/600x400',
    publishedAt: '2시간 전',
    likes: 42,
    comments: 12,
    tags: ['웹개발', 'React', 'TypeScript'],
  },
  {
    id: 2,
    author: '이에디터',
    title: 'AI 시대의 글쓰기: 창의성과 기술의 조화',
    excerpt:
      'ChatGPT와 같은 AI 도구들이 글쓰기 영역에 미치는 영향과 작가들이 이를 활용하는 방법에 대해 알아봅니다.',
    publishedAt: '5시간 전',
    likes: 128,
    comments: 34,
    tags: ['AI', '글쓰기', '창작'],
  },
  {
    id: 3,
    author: '박크리에이터',
    title: '미니멀리즘 디자인의 핵심 원칙',
    excerpt:
      '단순함 속에서 아름다움을 찾는 미니멀리즘 디자인의 철학과 실제 적용 사례를 통해 효과적인 디자인 방법론을 제시합니다.',
    thumbnail: 'https://via.placeholder.com/600x400',
    publishedAt: '어제',
    likes: 89,
    comments: 23,
    tags: ['디자인', 'UI/UX', '미니멀리즘'],
  },
  {
    id: 4,
    author: '최개발자',
    title: 'Next.js 14 업데이트: 무엇이 달라졌나?',
    excerpt:
      'Next.js의 최신 버전에서 추가된 기능들과 성능 개선 사항들을 실제 프로젝트에 적용해본 경험을 공유합니다.',
    publishedAt: '2일 전',
    likes: 256,
    comments: 45,
    tags: ['Next.js', 'React', 'Frontend'],
  },
  {
    id: 5,
    author: '정작가',
    title: '독립 출판의 시대: 개인 브랜드 구축하기',
    excerpt:
      '전통적인 출판 시스템을 벗어나 독립적으로 콘텐츠를 제작하고 배포하는 방법과 성공 전략을 소개합니다.',
    publishedAt: '3일 전',
    likes: 67,
    comments: 19,
    tags: ['출판', '브랜딩', '콘텐츠'],
  },
];

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  return (
    <Layout>
      <FeedContainer>
        <FeedList>
          {mockFeeds.map((feed) => (
            <FeedCard
              key={feed.id}
              author={feed.author}
              title={feed.title}
              excerpt={feed.excerpt}
              thumbnail={feed.thumbnail}
              publishedAt={feed.publishedAt}
              likes={feed.likes}
              comments={feed.comments}
              tags={feed.tags}
            />
          ))}
        </FeedList>

        <LoadMoreButton>더 보기</LoadMoreButton>
      </FeedContainer>
    </Layout>
  );
}

// Styled Components
const FeedContainer = tw.div`
  min-h-screen
  bg-white
`;

const FeedList = tw.div`
  divide-y
  divide-gray-200
`;

const LoadMoreButton = tw.button`
  w-full
  py-4
  text-center
  text-sm
  font-medium
  text-blue-600
  hover:text-blue-800
  transition-colors
`;
