import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './layouts/Layout'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Invoices from './pages/Invoices'
import CashFlow from './pages/CashFlow'
import Suppliers from './pages/Suppliers'
import Credit from './pages/Credit'
import Insights from './pages/Insights'
import Settings from './pages/Settings'
import VoiceAssistant from './pages/VoiceAssistant'
import ProactiveAlerts from './pages/ProactiveAlerts'
import CustomerPortal from './pages/CustomerPortal'
import Register from './pages/Register'
import ElevenLabs from './pages/ElevenLabs'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="cash-flow" element={<CashFlow />} />
        <Route path="suppliers" element={<Suppliers />} />
        <Route path="credit" element={<Credit />} />
        <Route path="insights" element={<Insights />} />
        <Route path="settings" element={<Settings />} />
        <Route path="voice-assistant" element={<VoiceAssistant />} />
        <Route path="proactive-alerts" element={<ProactiveAlerts />} />
        <Route path="customer-portal" element={<CustomerPortal />} />
        <Route path="register" element={<Register />} />
        <Route path="elevenlabs" element={<ElevenLabs />} />
      </Route>
    </Routes>
  )
}

export default App
