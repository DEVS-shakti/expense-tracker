import React from "react";

const LoadingScreen = ({
  label = "Loading...",
  fullScreen = false,
  compact = false,
}) => {
  const wrapperClass = fullScreen
    ? "loading-screen loading-screen-full"
    : `loading-screen ${compact ? "loading-screen-compact" : ""}`;

  return (
    <div className={wrapperClass} role="status" aria-live="polite" aria-busy="true">
      <div className="loading-orbit" />
      <p className="loading-label">{label}</p>
    </div>
  );
};

export default LoadingScreen;
