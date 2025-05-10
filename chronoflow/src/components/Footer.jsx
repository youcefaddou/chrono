import React from "react";

export default function Footer() {
  return (
    <footer className="p-4 bg-gray-100 text-center">
      <span>© {new Date().getFullYear()} ChronoFlow</span>
    </footer>
  );
}
