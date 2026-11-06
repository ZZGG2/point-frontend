import { createBrowserRouter } from 'react-router-dom';
import { Layout } from './Layout';
import { HomePage } from '@/pages/HomePage';
import { EventPage } from '@/pages/EventPage';

// TODO(#이슈): login, assets, cs 페이지 추가
export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/events/:eventId', element: <EventPage /> },
    ],
  },
]);
