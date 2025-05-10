import React from "react";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header ici */}
      <main className="flex-1">{children}</main>
      {/* Footer ici */}
    </div>
  );
}
