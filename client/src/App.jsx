import { Routes, Route } from "react-router-dom";

import Navbar from "./components/layout/Navbar.jsx";
import Footer from "./components/layout/Footer.jsx";

import Home from "./pages/Home.jsx";
import Properties from "./pages/Properties.jsx";
import PropertyDetails from "./pages/PropertyDetails.jsx";
import CompareProperties from "./pages/CompareProperties";

import Login from "./pages/auth/Login.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";
import ResetPassword from "./pages/auth/ResetPassword.jsx";
import Register from "./pages/auth/Register.jsx";
import VerifyOtp from "./pages/auth/VerifyOtp.jsx";

import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import Favourites from "./pages/buyer/Favourites.jsx";
import Account from "./pages/account/Account.jsx";

import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminUsers from "./pages/admin/AdminUsers.jsx";
import AdminProperties from "./pages/admin/AdminProperties.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";

import SellerLayout from "./layouts/SellerLayout.jsx";
import SellerDashboard from "./pages/seller/SellerDashboard.jsx";
import SellerProperties from "./pages/seller/SellerProperties.jsx";
import AddProperty from "./pages/seller/AddProperty.jsx";
import EditProperty from "./pages/seller/EditProperty.jsx";
import SellerInquiries from "./pages/seller/SellerInquiries.jsx";
import PricePredictor from "./pages/seller/PricePredictor.jsx";

import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import RoleRoute from "./routes/RoleRoute.jsx";
import ScrollToTop from "./components/common/ScrollToTop.jsx";

const PageLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-1 bg-slate-50">
      {" "}
      {/* light background for content */}
      {children}
    </main>
    <Footer />
  </div>
);

const App = () => {
  return (
    <>
      <ScrollToTop />
      <Routes>
      {/* Public / Buyer */}
      <Route
        path="/"
        element={
          <PageLayout>
            <Home />
          </PageLayout>
        }
      />
      <Route
        path="/properties"
        element={
          <PageLayout>
            <Properties />
          </PageLayout>
        }
      />
      <Route
        path="/properties/:id"
        element={
          <PageLayout>
            <PropertyDetails />
          </PageLayout>
        }
      />
      <Route
        path="/about"
        element={
          <PageLayout>
            <About />
          </PageLayout>
        }
      />
      <Route
        path="/compare"
        element={
          <PageLayout>
            <CompareProperties />
          </PageLayout>
        }
      />
      <Route
        path="/contact"
        element={
          <PageLayout>
            <Contact />
          </PageLayout>
        }
      />

      <Route
        path="/login"
        element={
          <PageLayout>
            <Login />
          </PageLayout>
        }
      />
      <Route
        path="/register"
        element={
          <PageLayout>
            <Register />
          </PageLayout>
        }
      />
      <Route
        path="/verify-otp"
        element={
          <PageLayout>
            <VerifyOtp />
          </PageLayout>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PageLayout>
            <ForgotPassword />
          </PageLayout>
        }
      />

      <Route
        path="/reset-password"
        element={
          <PageLayout>
            <ResetPassword />
          </PageLayout>
        }
      />

      <Route element={<ProtectedRoute />}>
        <Route
          path="/profile"
          element={
            <PageLayout>
              <Account />
            </PageLayout>
          }
        />

        <Route
          path="/account"
          element={
            <PageLayout>
              <Account />
            </PageLayout>
          }
        />
      </Route>

      <Route element={<RoleRoute allowedRoles={["buyer"]} />}>
        <Route
          path="/favourites"
          element={
            <PageLayout>
              <Favourites />
            </PageLayout>
          }
        />
      </Route>

      {/* Admin */}
      <Route element={<RoleRoute allowedRoles={["admin"]} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="properties" element={<AdminProperties />} />
        </Route>
      </Route>

      {/* Seller */}
      <Route element={<RoleRoute allowedRoles={["seller"]} />}>
        <Route path="/seller" element={<SellerLayout />}>
          <Route index element={<SellerDashboard />} />
          <Route path="dashboard" element={<SellerDashboard />} />
          <Route path="properties" element={<SellerProperties />} />
          <Route path="properties/add" element={<AddProperty />} />
          <Route path="properties/:id/edit" element={<EditProperty />} />
          <Route path="inquiries" element={<SellerInquiries />} />
          <Route path="price-predictor" element={<PricePredictor />} />
          <Route path="profile" element={<Account />} />
        </Route>
      </Route>
    </Routes>
  </>
);
};

export default App;
