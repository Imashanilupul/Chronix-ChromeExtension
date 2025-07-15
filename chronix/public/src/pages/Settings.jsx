import React from "react";
import { Link } from "react-router-dom";

export default function Settings() {
  return (
    <div className="w-80 h-auto p-4 font-sans text-sm text-gray-900 bg-white border border-gray-300 rounded-lg shadow">
      {/* Header */}
      <div className="mb-4 flex items-center space-x-2">
        <Link
          to="/home"
          className="inline-flex items-center gap-2 px-3 py-1.5 text-lg font-medium text-blue-600 rounded hover:bg-blue-50 hover:underline transition"
          aria-label="Go back home"
        >
          ⬅️
        </Link>
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      {/* Body */}
      <p className="text-gray-600 mb-6">
        Settings page is under construction.
      </p>

      {/* Back Home Link */}
      <Link
        to="/"
        className="inline-block px-4 py-2 text-blue-600 rounded border border-blue-200 hover:bg-blue-50 hover:underline transition"
      >
        This page is under developing. Go back home. Thanks for your patience! 😊
      </Link>
    </div>
  );
}
