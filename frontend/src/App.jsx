import { Navigate, Route, Routes } from "react-router";
import { useAuth } from "./context/AuthContext";
import AdminLayout from "./components/AdminLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import Orders from "./pages/Orders";
import Users from "./pages/Users";
import Reviews from "./pages/Reviews";
import StoreLayout from "./store/components/StoreLayout";
import Home from "./store/pages/Home";
import Shop from "./store/pages/Shop";
import StoreCategories from "./store/pages/Categories";
import ProductDetail from "./store/pages/ProductDetail";
import Cart from "./store/pages/Cart";
import Checkout from "./store/pages/Checkout";
import OrderSuccess from "./store/pages/OrderSuccess";
import Auth from "./store/pages/Auth";
import NotFound from "./store/pages/NotFound";
import { Privacy, Terms } from "./store/pages/Legal";
import {
  AccountLayout,
  AccountSettings,
  Addresses,
  MyOrders,
  OrderDetails,
  Profile,
  Wishlist,
} from "./store/pages/Account";

const RequireAdmin = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-10 text-center text-muted">Loading...</div>;
  if (!user) return <Navigate to="/admin/login" replace />;
  return children;
};

const App = () => (
  <Routes>
    <Route path="/admin/login" element={<Login />} />
    <Route
      path="/admin"
      element={
        <RequireAdmin>
          <AdminLayout />
        </RequireAdmin>
      }
    >
      <Route index element={<Dashboard />} />
      <Route path="products" element={<Products />} />
      <Route path="categories" element={<Categories />} />
      <Route path="orders" element={<Orders />} />
      <Route path="users" element={<Users />} />
      <Route path="reviews" element={<Reviews />} />
    </Route>
    <Route path="/admin/*" element={<Navigate to="/admin" replace />} />

    <Route element={<StoreLayout />}>
      <Route index element={<Home />} />
      <Route path="shop" element={<Shop key="shop" />} />
      <Route path="deals" element={<Shop key="deals" deals />} />
      <Route path="categories" element={<StoreCategories />} />
      <Route path="product/:slug" element={<ProductDetail />} />
      <Route path="cart" element={<Cart />} />
      <Route path="checkout" element={<Checkout />} />
      <Route path="order-success/:orderId" element={<OrderSuccess />} />
      <Route path="login" element={<Auth key="login" mode="login" />} />
      <Route path="register" element={<Auth key="register" mode="register" />} />
      <Route path="account" element={<AccountLayout />}>
        <Route index element={<Navigate to="orders" replace />} />
        <Route path="profile" element={<Profile />} />
        <Route path="orders" element={<MyOrders />} />
        <Route path="orders/:orderId" element={<OrderDetails />} />
        <Route path="addresses" element={<Addresses />} />
        <Route path="wishlist" element={<Wishlist />} />
        <Route path="settings" element={<AccountSettings />} />
      </Route>
      <Route path="terms" element={<Terms />} />
      <Route path="privacy" element={<Privacy />} />
      <Route path="*" element={<NotFound />} />
    </Route>
  </Routes>
);

export default App;
