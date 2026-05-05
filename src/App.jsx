import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/context/auth-context.jsx'
import ProtectedRoute from '@/components/ProtectedRoute'
import Chatbot from '@/components/ui/Chatbot'

import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import PendingPage from '@/pages/auth/PendingPage'
import OwnerDashboard from '@/pages/dashboard/owner/OwnerDashboard'
import OwnerAppointments from '@/pages/dashboard/owner/OwnerAppointments'
import OwnerProfile from '@/pages/dashboard/owner/OwnerProfile'
import MyAnimals from '@/pages/dashboard/owner/MyAnimals'
import AnimalDetails from '@/pages/dashboard/owner/AnimalDetails'
import VetDashboard from '@/pages/dashboard/vet/VetDashboard'
import VetAppointments from '@/pages/dashboard/vet/VetAppointments'
import VetProfile from '@/pages/dashboard/vet/VetProfile'
import PatientManagement from '@/pages/dashboard/vet/PatientManagement'
import PatientDetails from '@/pages/dashboard/vet/PatientDetails'
import VetsPage from '@/pages/vets/VetsPage'
import VetBookingPage from '@/pages/vets/VetBookingPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster richColors position="top-right" />
        <Routes>
          <Route path="/" element={<LandingPage />} />

          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="/auth/pending" element={<PendingPage />} />

          <Route path="/vets" element={
            <ProtectedRoute allowedRoles={['maitre']} redirectTo="/dashboard/vet">
              <VetsPage />
            </ProtectedRoute>
          } />
          <Route path="/vets/:id" element={
            <ProtectedRoute allowedRoles={['maitre']} redirectTo="/dashboard/vet">
              <VetBookingPage />
            </ProtectedRoute>
          } />

          <Route path="/dashboard/owner" element={
            <ProtectedRoute allowedRoles={['maitre']} redirectTo="/dashboard/vet">
              <OwnerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/owner/appointments" element={
            <ProtectedRoute allowedRoles={['maitre']} redirectTo="/dashboard/vet">
              <OwnerAppointments />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/owner/pets" element={
            <ProtectedRoute allowedRoles={['maitre']} redirectTo="/dashboard/vet">
              <MyAnimals />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/owner/pets/:id" element={
            <ProtectedRoute allowedRoles={['maitre']} redirectTo="/dashboard/vet">
              <AnimalDetails />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/owner/profile" element={
            <ProtectedRoute allowedRoles={['maitre']} redirectTo="/dashboard/vet">
              <OwnerProfile />
            </ProtectedRoute>
          } />

          <Route path="/dashboard/vet" element={
            <ProtectedRoute allowedRoles={['veterinaire']} redirectTo="/dashboard/owner">
              <VetDashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/vet/appointments" element={
            <ProtectedRoute allowedRoles={['veterinaire']} redirectTo="/dashboard/owner">
              <VetAppointments />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/vet/patients" element={
            <ProtectedRoute allowedRoles={['veterinaire']} redirectTo="/dashboard/owner">
              <PatientManagement />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/vet/patients/:id" element={
            <ProtectedRoute allowedRoles={['veterinaire']} redirectTo="/dashboard/owner">
              <PatientDetails />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/vet/profile" element={
            <ProtectedRoute allowedRoles={['veterinaire']} redirectTo="/dashboard/owner">
              <VetProfile />
            </ProtectedRoute>
          } />
        </Routes>
        <Chatbot />
      </AuthProvider>
    </BrowserRouter>
  )
}
