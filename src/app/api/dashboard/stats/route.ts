import type { Route } from '@react-router/dev/routes';

export const routes: Route[] = [
  {
    path: '/api/dashboard/stats',
    loader: './route.js#loader',
  },
];