import { useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import Header from "./Header";
import Footer from "./Footer";

const StoreLayout = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <Header />
      <main className="flex-1 pb-12">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default StoreLayout;
