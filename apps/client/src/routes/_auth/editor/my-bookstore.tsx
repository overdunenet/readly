import { createFileRoute, Outlet } from '@tanstack/react-router';
import { Suspense } from 'react';

export const Route = createFileRoute('/_auth/editor/my-bookstore')({
  component: MyBookstoreLayout,
});

function MyBookstoreLayout() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-20">
          <span className="text-gray-400">로딩 중...</span>
        </div>
      }
    >
      <Outlet />
    </Suspense>
  );
}
