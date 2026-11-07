import { createBrowserRouter } from 'react-router'
import { AppShell } from '@/components/app-shell'
import HomePage from '@/pages/home'
import UploadPage from '@/pages/upload'
import QuizPage from '@/pages/quiz'
import ResultPage from '@/pages/result'
import AnswersPage from '@/pages/answers'
import HistoryPage from '@/pages/history'

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/nap-cau-hoi', element: <UploadPage /> },
      { path: '/lam-bai', element: <QuizPage /> },
      { path: '/ket-qua/:sessionId', element: <ResultPage /> },
      { path: '/dap-an', element: <AnswersPage /> },
      { path: '/lich-su', element: <HistoryPage /> },
      { path: '*', element: <HomePage /> },
    ],
  },
])
