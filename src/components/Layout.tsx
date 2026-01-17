import { ReactNode } from "react";
import BottomNav from "./BottomNav";

interface LayoutProps {
  children: ReactNode;
  showNav?: boolean;
}

const Layout = ({ children, showNav = true }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <main className={showNav ? "pb-24" : ""}>
        {children}
      </main>
      {showNav && <BottomNav />}
    </div>
  );
};

export default Layout;
