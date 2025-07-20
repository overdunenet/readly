import { createFileRoute } from '@tanstack/react-router';

import Layout from '../../components/layout/Layout';

export const Route = createFileRoute('/_auth/editor')({
  component: EditorPage,
});

function EditorPage() {
  return <Layout>에디터 페이지 입니다.</Layout>;
}
