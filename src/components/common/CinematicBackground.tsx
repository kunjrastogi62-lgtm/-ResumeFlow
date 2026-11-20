import React from 'react';

/**
 * Full-viewport fixed cinematic abstract gradient backdrop.
 * Layered pure-CSS radial/linear gradients, organic Gaussian-blurred lobes,
 * bottom wave glow, and micro-grain atmospheric texture.
 */
export const CinematicBackground: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="no-print rf-cinematic-bg fixed inset-0 z-0 pointer-events-none overflow-hidden select-none"
    >
      {/* Base multi-stop diagonal atmospheric canvas */}
      <div className="rf-bg-canvas" />

      {/* Left deep cobalt anchor & serene sky-blue mid glow */}
      <div className="rf-bg-left-glow" />

      {/* Organic diagonal cloud-mist streak from lower-left toward upper-center */}
      <div className="rf-bg-cloud-streak" />

      {/* Bright luminous white & ice-blue upper-middle core */}
      <div className="rf-bg-center-glow" />

      {/* Large soft lavender & violet organic cloud shape on the right */}
      <div className="rf-bg-right-violet" />

      {/* Flowing blue-to-violet wave-like light effects along the bottom */}
      <div className="rf-bg-bottom-waves" />

      {/* Ultra-subtle fine atmospheric light texture to eliminate gradient banding */}
      <div className="rf-bg-grain" />
    </div>
  );
};
