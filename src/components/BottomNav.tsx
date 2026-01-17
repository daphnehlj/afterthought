import { useLocation, useNavigate } from "react-router-dom";
import { Home, Users, Sun, User } from "lucide-react";
import KeyboardKey from "./KeyboardKey";

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/history", icon: Users, label: "History" },
  { path: "/analysis", icon: Sun, label: "Analysis" },
  { path: "/profile", icon: User, label: "Profile" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
      <div className="flex justify-center items-end gap-2 py-4 px-6">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <KeyboardKey
              key={item.path}
              onClick={() => navigate(item.path)}
              active={isActive}
              size="lg"
            >
              <Icon className="w-5 h-5" />
            </KeyboardKey>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
