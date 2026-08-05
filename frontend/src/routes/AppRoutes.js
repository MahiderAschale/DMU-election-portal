// src/routes/AppRoutes.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import ProtectedRoute from "./ProtectedRoute";
import MainLayout from "../layouts/MainLayout";

import Positions from "../pages/Positions";
import Vacancies from "../pages/Vacancies";
import VacancyList from "../pages/VacancyList";
import Home from "../pages/Home";
import ApplyVacancy from "../pages/ApplyVacancy";
import Screening from "../pages/Screening";
import Shortlist from "../pages/Shortlist";
import VotingCardsPage from "../pages/VotingCardsPage";

import ComplaintPage from "../pages/ComplaintPage";
import ActivateAccount from "../pages/ActivateAccount";
import CandidateDashboard from "../pages/CandidateDashboard";
import ComplaintDashboard from "../pages/ComplaintDashboard";
import ElectionDashboard from "../pages/ElectionDashboard";

/* 🔥 NEW PAGES */
import ManagerVoterRequestPage from "../pages/ManagerVoterRequestPage.js";
import DeanUploadPage from "../pages/DeanUploadPage";
import HRUploadPage from "../pages/HRUploadPage";
import VoterValidationPage from "../pages/VoterValidationPage";
import VoterDashboard from "../pages/VoterDashboard";
import VoterManifestoPage from "../pages/VoterManifestoPage";
import ResultsPage from "../pages/ResultsPage";
import ResultsLandingPage from "../pages/ResultsLandingPage";
import SystemAdminDashboard from "../pages/SystemAdminDashboard";
import WinnersPage from "../pages/WinnersPage";
function AppRoutes() {
  return (
    <Router>
      <Routes>

        {/* ========================= */}
        {/* PUBLIC ROUTES */}
        {/* ========================= */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/winners" element={<WinnersPage />} />

        <Route path="/complaint/:id" element={<ComplaintPage />} />
        <Route path="/activate/:token" element={<ActivateAccount />} />

        {/* ========================= */}
        {/*  PROTECTED ROUTES */}
        {/* ========================= */}

        {/* Manager Dashboard */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <MainLayout>
                <SystemAdminDashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Elections */}
        <Route
          path="/elections"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ElectionDashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Voting Cards */}
        <Route
          path="/voting-cards"
          element={
            <ProtectedRoute>
              <MainLayout>
                <VotingCardsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Election Results — Landing (all elections) */}
        <Route
          path="/results"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ResultsLandingPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Election Results — Detail for one election */}
        <Route
          path="/results/:election_id"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ResultsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* VOTER FLOW */}
        <Route
          path="/voter-request"
          element={
            <ProtectedRoute>
              <MainLayout>
                {ManagerVoterRequestPage ? (
                  <ManagerVoterRequestPage />
                ) : (
                  <div>ManagerVoterRequestPage component unavailable</div>
                )}
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dean-upload"
          element={
            <ProtectedRoute>
              <MainLayout>
                <DeanUploadPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
<Route
  path="/voter-validation"
  element={
    <ProtectedRoute>
      <MainLayout>
        <VoterValidationPage />
      </MainLayout>
    </ProtectedRoute>
  }
/>
        <Route
          path="/hr-upload"
          element={
            <ProtectedRoute>
              <MainLayout>
                <HRUploadPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/hr-request"
          element={
            <ProtectedRoute>
              <MainLayout>
                <HRUploadPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/voter"
          element={
            <ProtectedRoute>
              <MainLayout>
                <VoterDashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/manifesto"
          element={
            <ProtectedRoute>
              <MainLayout>
                <VoterManifestoPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/vote"
          element={
            <ProtectedRoute>
              <MainLayout>
                <VoterDashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/candidate"
          element={
            <ProtectedRoute>
              <MainLayout>
                <CandidateDashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Positions */}
        <Route
          path="/positions"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Positions />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Vacancies */}
        <Route
          path="/vacancies"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Vacancies />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route path="/vacancies-list" element={<VacancyList />} />
        <Route path="/apply/:id" element={<ApplyVacancy />} />

        <Route
          path="/screening"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Screening />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/shortlist"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Shortlist />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/complaints"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ComplaintDashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* ========================= */}
        {/* 404 */}
        {/* ========================= */}
        <Route path="*" element={<h1>404 - Page Not Found</h1>} />

      </Routes>
    </Router>
  );
}

export default AppRoutes;
