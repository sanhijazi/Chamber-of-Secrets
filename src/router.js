import { createHashRouter } from 'react-router-dom';
import { createBrowserRouter } from 'react-router-dom';
import Home from './home';
import Section1 from './Section1';
import Section2 from './Section2';
import Section3 from './Section3';
import Section4 from './Section4';

export const router = createHashRouter(
  [
    {
      path: '/',
      element: <Home />,
    },
    {
      path: '/Section1',
      element: <Section1 />,
    },
    {
      path: '/Section2',
      element: <Section2 />,
    },
    {
      path: '/Section3',
      element: <Section3 />,
    },
    {
      path: '/Section4',
      element: <Section4 />,
    },
  ],
  {
    future: {
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_prependBasename: true,
      v7_relativeSplatPath: true,
      v7_skipActionErrorRevalidation: true
    },
  }
);
