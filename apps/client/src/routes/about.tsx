import { createFileRoute } from '@tanstack/react-router';
import { Helmet } from 'react-helmet-async';
import tw from 'tailwind-styled-components';

import Layout from '../components/layout/Layout';

export const Route = createFileRoute('/about')({
  component: AboutPage,
});

function AboutPage() {
  return (
    <Layout>
      <Helmet>
        <title>Readly 소개 - 에디터와 팔로워를 연결하는 블로그 플랫폼</title>
        <meta
          name="description"
          content="Readly는 에디터와 팔로워를 연결하는 유료 블로그 플랫폼입니다. 양질의 콘텐츠를 만들고 공유하세요."
        />
        <meta property="og:title" content="Readly 소개" />
        <meta
          property="og:description"
          content="에디터와 팔로워를 연결하는 유료 블로그 플랫폼"
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://readly.me/about" />
      </Helmet>

      <Container>
        <Hero>
          <HeroTitle>Readly</HeroTitle>
          <HeroSubtitle>에디터와 팔로워를 연결하는 블로그 플랫폼</HeroSubtitle>
        </Hero>

        <Section>
          <SectionTitle>서비스 소개</SectionTitle>
          <SectionText>
            Readly는 양질의 콘텐츠를 만드는 에디터와 이를 소비하는 팔로워를
            연결하는 유료 블로그 플랫폼입니다. 에디터는 자신만의 블로그를
            운영하며, 팔로워는 구독이나 개별 구매를 통해 콘텐츠에 접근할 수
            있습니다.
          </SectionText>
        </Section>

        <Section>
          <SectionTitle>주요 기능</SectionTitle>
          <FeatureGrid>
            <FeatureCard>
              <FeatureTitle>블로그 포스트 작성</FeatureTitle>
              <FeatureDescription>
                에디터 전용 작성 도구로 쉽고 빠르게 콘텐츠를 만들 수 있습니다.
              </FeatureDescription>
            </FeatureCard>
            <FeatureCard>
              <FeatureTitle>유연한 접근 권한</FeatureTitle>
              <FeatureDescription>
                전체공개, 구독자 전용, 구매자 전용, 비공개 등 다양한 접근 권한을
                설정할 수 있습니다.
              </FeatureDescription>
            </FeatureCard>
            <FeatureCard>
              <FeatureTitle>구독 & 구매</FeatureTitle>
              <FeatureDescription>
                팔로워는 에디터를 구독하거나 개별 포스트를 구매하여 콘텐츠를
                즐길 수 있습니다.
              </FeatureDescription>
            </FeatureCard>
          </FeatureGrid>
        </Section>
      </Container>
    </Layout>
  );
}

const Container = tw.div`
  max-w-3xl
  mx-auto
  px-6
  py-12
`;

const Hero = tw.div`
  text-center
  py-16
`;

const HeroTitle = tw.h1`
  text-4xl
  font-bold
  text-gray-900
  mb-4
`;

const HeroSubtitle = tw.p`
  text-xl
  text-gray-600
`;

const Section = tw.section`
  py-8
`;

const SectionTitle = tw.h2`
  text-2xl
  font-semibold
  text-gray-900
  mb-4
`;

const SectionText = tw.p`
  text-gray-700
  leading-relaxed
`;

const FeatureGrid = tw.div`
  grid
  grid-cols-1
  md:grid-cols-3
  gap-6
`;

const FeatureCard = tw.div`
  p-6
  border
  border-gray-200
  rounded-lg
`;

const FeatureTitle = tw.h3`
  text-lg
  font-medium
  text-gray-900
  mb-2
`;

const FeatureDescription = tw.p`
  text-sm
  text-gray-600
`;
