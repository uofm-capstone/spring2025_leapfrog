"use client";

import { useState } from "react";
import FrogChart from "./FrogChart";
import ModelSelector from './ModelSelector';

interface DashboardProps {
  onSortClick: () => void;
  onResultsClick: () => void;
}

export default function Dashboard({ onSortClick, onResultsClick }: DashboardProps) {
  const [activeCamera, setActiveCamera] = useState<string>("camera1");

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-10 text-[var(--apple-text)]">Leapfrog</h1>

      {/* Action buttons */}
      <div className="flex gap-6 mb-12">
        <button
          onClick={onSortClick}
          className="apple-button-outline"
        >
          Sort Frogs
        </button>

        <button
          onClick={onResultsClick}
          className="apple-button"
        >
          Results
        </button>
      </div>

      {/* Chart section */}
      <div className="w-full max-w-4xl">
        <h2 className="text-2xl font-semibold text-center mb-6 text-[var(--apple-text)]">Frogs Over Time</h2>

        <div className="mb-4">
          <select
            value={activeCamera}
            onChange={(e) => setActiveCamera(e.target.value)}
            className="apple-select"
          >
            <option value="camera1">Camera One</option>
            <option value="camera2">Camera Two</option>
            <option value="camera3">Camera Three</option>
          </select>
        </div>

        <div className="apple-card h-[300px]">
          <FrogChart cameraId={activeCamera} />
        </div>

        <div className="flex justify-between text-[var(--apple-text-secondary)] mt-2">
          <span>Feb 2025</span>
          <span>Dec 2025</span>
        </div>
      </div>
    </div>
  );
}
