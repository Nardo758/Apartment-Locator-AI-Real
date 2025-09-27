// BACKUP: Original main.tsx 
// This was the previous version without React.StrictMode

import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);