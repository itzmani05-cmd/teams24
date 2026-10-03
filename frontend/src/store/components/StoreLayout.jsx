import { useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import { CatalogProvider } from "../context/CatalogContext";
import { ShopProvider } from "../context/ShopContext";
import Header from "./Header";
import Footer from "./Footer";
import Toast from "./Toast";

const StoreLayout = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <CatalogProvider>
      <ShopProvider>
        <div className="flex min-h-screen flex-col bg-canvas">
          <Header />
          <main className="flex-1 pb-12">
            <Outlet />
          </main>
          <Footer />
          <Toast />
        </div>
      </ShopProvider>
    </CatalogProvider>
  );
};

export default StoreLayout;
