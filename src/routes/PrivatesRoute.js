// import React, { useContext } from "react";
// import { Route, Navigate } from "react-router-dom";
// import { AuthContext } from "../context/AuthContext";

// const PrivateRoute = ({ children, ...props }) => {
//   const { currentUser } = useContext(AuthContext);

//   return (
//     <Route {...props}>
//       {currentUser ? children : <Navigate to="/signin" />}
//     </Route>
//   );
// };

// export default PrivateRoute;
import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { currentUser } = useContext(AuthContext);
  const location = useLocation();

  return currentUser ? (
    children
  ) : (
    <Navigate to="/signin" replace state={{ from: location }} />
  );
};

export default PrivateRoute;
