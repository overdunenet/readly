import { createFileRoute, Link } from '@tanstack/react-router';

import { trpc } from '@/shared';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  return <div>Index Page</div>;
}
