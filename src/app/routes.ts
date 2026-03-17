import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { TicketsEnhanced } from './pages/TicketsEnhanced';
import { TicketDetailEnhanced } from './pages/TicketDetailEnhanced';
import { Reports } from './pages/Reports';
import { Insights } from './pages/Insights';
import { KnowledgeBase } from './pages/KnowledgeBase';
import { CustomerProfile } from './pages/CustomerProfile';
import { Settings } from './pages/Settings';
import { Operations } from './pages/Operations';
import { Queue } from './pages/Queue';
import { DuplicateDetector } from './pages/DuplicateDetector';
import { AgentPerformance } from './pages/AgentPerformance';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: 'tickets', Component: TicketsEnhanced },
      { path: 'tickets/:id', Component: TicketDetailEnhanced },
      { path: 'operations', Component: Operations },
      { path: 'queue', Component: Queue },
      { path: 'duplicates', Component: DuplicateDetector },
      { path: 'performance', Component: AgentPerformance },
      { path: 'reports', Component: Reports },
      { path: 'insights', Component: Insights },
      { path: 'knowledge-base', Component: KnowledgeBase },
      { path: 'customers/:id', Component: CustomerProfile },
      { path: 'settings', Component: Settings },
    ],
  },
]);