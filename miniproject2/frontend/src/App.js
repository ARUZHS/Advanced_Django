import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RegisterForm from './components/RegisterForm';
import VerifyEmail from './components/VerifyEmail';
import Login from './components/Login';
import PasswordResetRequest from './components/PasswordResetRequest';
import PasswordResetConfirm from './components/PasswordResetConfirm';
import ResumeUpload from './components/ResumeUpload';
import ResumeFeedback from './components/ResumeFeedback';
import JobList from './components/JobList';
import JobCreate from './components/JobCreate';
import JobManage from './components/JobManage';
import MyResume from "./components/MyResume";
import CreateResume from "./components/CreateResume";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/password-reset" element={<PasswordResetRequest />} />
          <Route path="/password-reset-confirm" element={<PasswordResetConfirm />} />
          <Route path="/upload-resume" element={<ResumeUpload />} />
          <Route path="/resume-feedback" element={<ResumeFeedback />} />
          <Route path="/jobs" element={<JobList />} />
          <Route path="/jobs/create" element={<JobCreate />} />
          <Route path="/jobs/manage" element={<JobManage />} />
          <Route path="/my-resume" element={<MyResume />} />
          <Route path="/create-resume" element={<CreateResume />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;