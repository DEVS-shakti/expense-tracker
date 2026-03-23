import React from "react";

const ConfigErrorScreen = ({ message }) => {
  return (
    <main className="config-error-screen">
      <section className="config-error-card">
        <span className="config-error-eyebrow">Configuration error</span>
        <h1>App startup failed</h1>
        <p>{message}</p>
        <p className="config-error-help">
          Add the required Firebase values to <code>.env</code> and restart the
          Vite server.
        </p>
      </section>
    </main>
  );
};

export default ConfigErrorScreen;
