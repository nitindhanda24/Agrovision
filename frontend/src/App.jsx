import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import TraderDashboard from "./pages/TraderDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AddProduct from "./pages/AddProduct";
import Browse from "./pages/Browse";
import CropListings from "./pages/CropListings";
import Orders from "./pages/Orders";
import Chat from "./pages/Chat";
import EditProfile from "./pages/EditProfile";
import { useEffect, useState } from "react";

const routes = {
  "/farmer-dashboard": Dashboard,
  "/trader-dashboard": TraderDashboard,
  "/admin-dashboard": AdminDashboard,
  "/login": Login,
  "/register": Register,
  "/add": AddProduct,
  "/browse": Browse,
  "/crop-listings": CropListings,
  "/orders": Orders,
  "/chat": Chat,
  "/edit-profile": EditProfile
};

const roleDashboardPath = {
  farmer: "/farmer-dashboard",
  trader: "/trader-dashboard",
  admin: "/admin-dashboard"
};

function App() {
  const [path, setPath] = useState(window.location.pathname);

  const navigate = (nextPath) => {
    window.history.pushState({}, "", nextPath);
    setPath(nextPath);
  };

  const role = localStorage.getItem("role");
  const isPublicPath = path === "/login" || path === "/register";
  const roleHome = roleDashboardPath[role];

  useEffect(() => {
    if (path === "/") {
      navigate(roleHome || "/login");
      return;
    }

    if (!role && !isPublicPath) {
      navigate("/login");
      return;
    }

    if (role && isPublicPath) {
      navigate(roleHome || "/login");
      return;
    }

    const dashboardPaths = Object.values(roleDashboardPath);
    if (role && dashboardPaths.includes(path) && path !== roleHome) {
      navigate(roleHome);
    }
  }, [path, role, roleHome, isPublicPath]);

  const Page = routes[path] || (roleHome ? routes[roleHome] : Login);

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  return <Page navigate={navigate} path={path} />;
}

export default App;
