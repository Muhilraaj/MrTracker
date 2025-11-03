import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './pages/App/App.tsx'
import { BrowserRouter } from 'react-router-dom'
import store from './stores/store.ts'
import { Provider } from 'react-redux'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <App />
      </LocalizationProvider>
        
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
