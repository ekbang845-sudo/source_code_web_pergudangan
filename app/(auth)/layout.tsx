import React from "react";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return <div className="bg-gray-50 min-h-screen">{children}</div>;
};

export default AuthLayout;
