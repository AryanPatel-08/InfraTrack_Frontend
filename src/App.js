import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Login from './Pages/Login';
import OTP from './Pages/Otp';
import Sidebar from './Pages/Sidebar';
import AdminDashboard from './Pages/AdminDashboard';
import UserActivityReport from './utils/UserActivityReport'
import ForgotPassword from './Pages/ForgotPassword';
import EnterPassword from './Pages/EnterPassword';

import AddUser from './Pages/AddUser';
import ListUser from './Pages/ListUser';

import QuotationForm from "./Pages/QuotationForm";
import QuotationList from "./Pages/QuotationList";

import ProjectForm from "./Pages/ProjectForm";
import ProjectList from "./Pages/ProjectList";

import ClientForm from "./Pages/ClientForm";
import ClientList from './Pages/ClientList';

import ProgressForm from './Pages/ProgressForm';
import ProgressList from './Pages/ProgressList';

import ItemMForm from "./Pages/ItemMForm";
import ItemMList from './Pages/ItemMList';

import Profile from './Pages/Profile';

import ProtectedRoute from './Pages/ProtectedRoute';


// Project Manager Pages Import
import ManagerDashboard from './Pages/ProjectManager/ManagerDashboard';
import ManagerProgressList from './Pages/ProjectManager/ManagerProgressList';
import ManagerProfile from './Pages/ProjectManager/ManagerProfile';

const Layout = () => {
  const location = useLocation();

  // Hide Sidebar for these pages
  const hideSidebarPages = ["/", "/forgotpassword", "/otp", "/enterpassword", "/unauthorized"];
  const hideSidebar = hideSidebarPages.includes(location.pathname.toLowerCase());

  return (
    <div className="App">
      {!hideSidebar && <Sidebar />}  {/* Sidebar is hidden on login-related pages */}
      <Routes>

        <Route path="/" element={<Login />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/otp" element={<OTP />} />
        <Route path="/enterpassword" element={<EnterPassword />} />
        <Route path='/unauthorized' element={<h1>Unauthorized</h1>} />

        {/* ProjectManager-only routes */}
        <Route element={<ProtectedRoute allowedRoles={["Project Manager"]} />}>
          <Route path="managerdashboard" element={<ManagerDashboard />} />
          <Route path="managerprogresslist" element={<ManagerProgressList />} />
          <Route path="managerprofile" element={<ManagerProfile />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
        
          <Route path="/AdminDashboard" element={<AdminDashboard />} />
          <Route path="/UserActivityReport" element={<UserActivityReport />} />

          <Route path="/adduser" element={<AddUser />} />
          <Route path="/listuser" element={<ListUser />} />

          <Route path="/quotationform" element={<QuotationForm />} />
          <Route path="/quotationlist" element={<QuotationList />} />

          <Route path="/projectform" element={<ProjectForm />} />
          <Route path="/projectlist" element={<ProjectList />} />

          <Route path="/clientform" element={<ClientForm />} />
          <Route path="/clientlist" element={<ClientList />} />

          <Route path='/progressform' element={<ProgressForm />} />
          <Route path="/progresslist" element={<ProgressList />} />

          <Route path="/itemmform" element={<ItemMForm />} />
          <Route path="/itemmlist" element={<ItemMList />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;
