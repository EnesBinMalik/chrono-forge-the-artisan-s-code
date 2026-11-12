/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * CHRONO-FORGE: THE ARTISAN'S CODE
 * Yazar, Baş Mimar & Sistem Tasarımcısı: ENES ÖZTÜRK
 */

import { useEffect, useRef, useState } from 'react';
import { ChronoForgeGame, GameStateSnapshot } from './engine/ChronoForgeGame';
import { ChronoForgeUI } from './components/ChronoForgeUI';

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<ChronoForgeGame | null>(null);
  const [gameState, setGameState] = useState<GameStateSnapshot | null>(null);

  useEffect(() => {
    if (!canvasMountRef.current) return;

    // Initialize 3D Simulation Game Engine
    const game = new ChronoForgeGame(canvasMountRef.current, (state) => {
      setGameState(state);
    });
    gameRef.current = game;

    return () => {
      game.dispose();
      gameRef.current = null;
    };
  }, []);

  const handleLayerSelect = (layerIndex: number) => {
    gameRef.current?.loadLayer(layerIndex);
  };

  const handleLogicGateSelect = (gate: 'AND' | 'XOR' | 'NOT' | 'NAND') => {
    gameRef.current?.setLogicGate(gate);
  };

  const handleHammerStrike = () => {
    gameRef.current?.triggerHammerStrike();
  };

  const handleSawSlash = () => {
    gameRef.current?.triggerSawSlash();
  };

  const handleOverdrive = () => {
    gameRef.current?.triggerMainspringOverdrive();
  };

  const handleCameraModeChange = (mode: 'follow' | 'inspect' | 'cinematic') => {
    gameRef.current?.setCameraMode(mode);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0a0a0d] font-sans select-none">
      {/* 3D WebGL Canvas Mount Container */}
      <div ref={canvasMountRef} className="w-full h-full absolute inset-0 cursor-crosshair" />

      {/* Diegetic Artisan HUD Overlay (Zero Viewport Occlusion) */}
      <ChronoForgeUI
        state={gameState}
        onLayerSelect={handleLayerSelect}
        onLogicGateSelect={handleLogicGateSelect}
        onHammerStrike={handleHammerStrike}
        onSawSlash={handleSawSlash}
        onOverdrive={handleOverdrive}
        onCameraModeChange={handleCameraModeChange}
      />
    </div>
  );
}
