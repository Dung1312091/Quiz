import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { router } from '@/router'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TooltipProvider delayDuration={300}>
      <RouterProvider router={router} />
      <Toaster
        position="bottom-center"
        mobileOffset={{ bottom: 'calc(var(--mobile-nav-h) + env(safe-area-inset-bottom) + 12px)' }}
      />
    </TooltipProvider>
  </StrictMode>,
)
