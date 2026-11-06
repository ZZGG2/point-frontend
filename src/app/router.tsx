import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from './Layout';
import { HomePage } from '@/pages/HomePage';
import { BenefitsPage } from '@/pages/BenefitsPage';
import { EventPage } from '@/pages/EventPage';
import { PayPage } from '@/pages/PayPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { AdminPage } from '@/pages/AdminPage';

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/benefits', element: <BenefitsPage /> },
      { path: '/events/:eventId', element: <EventPage /> },
      { path: '/pay', element: <PayPage /> },
      { path: '/history', element: <HistoryPage /> },
      { path: '/admin', element: <AdminPage /> },
      { path: '/system', element: <Navigate to="/admin" replace /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
