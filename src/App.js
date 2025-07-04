import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import AdminProtectedRoute from "./component/AdminProtectedRoute";
import AppBarRequestor from "./component/navbarRequestor";
import SideBarAdmin from "./component/sidebarAdmin";
import AdminRouter from "./view/admin/adminRouter";

// User Requestor
import Home from "./view/requestor/home";
import Progress from "./view/requestor/progress";
import FormRequest from "./view/requestor/formRequest";
import Register from "./view/requestor/register";
import ItemRequest from "./view/requestor/itemRequest";

// admin
import LoginAdmin from "./view/admin/login"

function App() {
  return (
    <HelmetProvider>
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </HelmetProvider>
  );
}

function AppContent() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  // cek auth admin
  const { isAdminAuthenticated } = useAuth();
  const year = new Date().getFullYear();
  return (
    <>
      { !isAdmin && <AppBarRequestor />}


      <Routes>
        {/* requestor only Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/progress/:machineType/:year" element={<Progress />} />
        <Route path="/form-request" element={<FormRequest />} />
        <Route path="/register" element={<Register />} />

        {/* Admin login */}
        <Route
          path="/admin/login"
          element={isAdminAuthenticated ? <Navigate to={`/admin/item-request/new`} /> : <LoginAdmin />}
        />

        {/* Protected Admin Routes */}
        <Route element={<AdminProtectedRoute redirectTo="/admin/login" />}>
          <Route path="/admin/*" element={<AdminRouter />} />
        </Route>

        {/* multi user route */}
        <Route path="/item-request" element={<ItemRequest />} />

      </Routes>
    </>
  );
}

export default App;
