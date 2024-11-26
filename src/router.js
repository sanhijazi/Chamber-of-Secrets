import { createBrowserRouter } from 'react-router-dom';
import Home from './home';
import Section1 from './Section1';
import Section2 from './Section2';

export const router = createBrowserRouter(
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
  ],
  {
    future: {
      v7_startTransition: true,
    },
  }
);
