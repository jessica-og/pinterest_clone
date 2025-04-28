import { Navigate } from "react-router-dom";
import useAuthStore from "../utils/authStore";


const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuthStore();
  return currentUser ? children : <Navigate to="/auth" replace />;
};
export default ProtectedRoute;