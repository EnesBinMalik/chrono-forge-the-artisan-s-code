/**
 * CHRONO-FORGE: THE ARTISAN'S CODE
 * Lead Architect & System Designer: ENES ÖZTÜRK
 * Ergonomic Bottom Control Dock & Diegetic Artisan HUD
 */

import React, { useState } from 'react';
import { GameStateSnapshot } from '../engine/ChronoForgeGame';
import { LAYER_DEFINITIONS } from '../engine/layers/HardwareLayers';
import { foley } from '../audio/ArtisanFoleyEngine';
import {
  Hammer,
  Volume2,
  VolumeX,
  Compass,
  Scroll,
  Zap,
  Activity,
  ChevronDown,
  ChevronUp,
  Crosshair,
  Award,
} from 'lucide-react';

interface ChronoForgeUIProps {
  state: GameStateSnapshot | null;
  onLayerSelect: (layerIndex: number) => void;
  onLogicGateSelect: (gate: 'AND' | 'XOR' | 'NOT' | 'NAND') => void;
  onHammerStrike: () => void;
  onSawSlash: () => void;
  onOverdrive: () => void;
  onCameraModeChange: (mode: 'follow' | 'inspect' | 'cinematic') => void;
}

export const ChronoForgeUI: React.FC<ChronoForgeUIProps> = ({
  state,
  onLayerSelect,
  onLogicGateSelect,
  onHammerStrike,
  onSawSlash,
  onOverdrive,
  onCameraModeChange,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'forge' | 'layers' | 'blueprint' | 'controls'>('forge');
  const [isMuted, setIsMuted] = useState(false);
  const [showBlueprintModal, setShowBlueprintModal] = useState(false);

  const toggleAudio = () => {
    const muted = foley.toggleMute();
    setIsMuted(muted);
  };

  const currentLayer = state?.currentLayer || LAYER_DEFINITIONS[0];
  const logicGates: ('AND' | 'XOR' | 'NOT' | 'NAND')[] = ['AND', 'XOR', 'NOT', 'NAND'];

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between overflow-hidden">
      {/* Top Header Badge (Minimal & Pure Artisan Craftsmanship) */}
      <div className="w-full p-4 flex items-start justify-between pointer-events-auto">
        {/* Creator & Game Brand */}
        <div className="bg-[#12100d]/90 border border-[#4a3b2a] rounded-sm px-4 py-2.5 shadow-2xl backdrop-blur-none">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] tracking-[0.25em] text-[#b88b4a] font-mono uppercase">
              ENES ÖZTÜRK İMZALI BAŞYAPIT
            </span>
            <span className="h-2 w-px bg-[#4a3b2a]" />
            <span className="text-[10px] tracking-widest text-[#8a7a66] font-mono uppercase">
              C++26 / VULKAN MİMARİSİ
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-[#e8d8b8] tracking-wider uppercase font-['Cinzel'] mt-0.5">
            CHRONO-FORGE
            <span className="text-xs text-[#c8963e] ml-2 font-normal font-sans tracking-normal lowercase">
              the artisan's code
            </span>
          </h1>
          <div className="text-[11px] text-[#9c8973] font-serif italic mt-0.5">
            Katman {currentLayer.id}: {currentLayer.nameTr} ({currentLayer.nameEn})
          </div>
        </div>

        {/* Diegetic Telemetry Indicators (Manometer & Mainspring tension) */}
        <div className="flex items-center space-x-3">
          {/* Mainspring Overdrive Meter */}
          <div className="bg-[#12100d]/90 border border-[#4a3b2a] px-3.5 py-2 flex items-center space-x-3">
            <div className="flex flex-col text-right">
              <span className="text-[10px] tracking-wider text-[#b88b4a] font-mono uppercase">
                ZEMBEREK GERGİSİ
              </span>
              <span className="text-xs font-bold font-mono text-[#e8d8b8]">
                {state?.isOverdrive ? `AŞIRI YÜKLEME (${state.overdriveRemaining.toFixed(1)}s)` : 'HAZIR [SPACE]'}
              </span>
            </div>
            <button
              onClick={onOverdrive}
              className={`w-9 h-9 border flex items-center justify-center cursor-pointer transition-all ${
                state?.isOverdrive
                  ? 'border-[#ff4411] bg-[#ff4411]/20 text-[#ffaa44]'
                  : 'border-[#785623] hover:border-[#c8963e] bg-[#221a12] text-[#c8963e]'
              }`}
              title="Zemberek Hızlandırma (Space)"
            >
              <Zap className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Actions (Audio & Blueprints) */}
          <div className="flex items-center space-x-1 bg-[#12100d]/90 border border-[#4a3b2a] p-1">
            <button
              onClick={() => setShowBlueprintModal(true)}
              className="p-2 text-[#b88b4a] hover:text-[#e8d8b8] hover:bg-[#2b2216] cursor-pointer"
              title="Zanaatkar Planları & Mühendislik Şeması"
            >
              <Scroll className="w-4 h-4" />
            </button>
            <button
              onClick={toggleAudio}
              className="p-2 text-[#b88b4a] hover:text-[#e8d8b8] hover:bg-[#2b2216] cursor-pointer"
              title={isMuted ? 'Sesi Aç' : 'Sesi Sustur'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-[#8a4433]" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Center Dynamic Strike Reticle & Combo Feedback */}
      <div className="flex flex-col items-center justify-center pointer-events-none my-auto">
        {state && state.comboCount > 1 && (
          <div className="bg-[#16120e]/95 border-2 border-[#b88b4a] px-5 py-2 text-center shadow-2xl mb-4 animate-fade-in">
            <div className="text-[10px] tracking-[0.3em] font-mono text-[#c8963e] uppercase">
              ZANAATKAR VURUŞ SERİSİ
            </div>
            <div className="text-3xl font-black font-['Cinzel'] text-[#ffcc44]">
              {state.comboCount}x REZONANS
            </div>
            <div className="text-[11px] font-mono text-[#a3907a]">
              Skor: {state.score.toLocaleString()}
            </div>
          </div>
        )}

        {/* Central Boss Bar if in Master's Core */}
        {state && state.currentLayer.id === 5 && (
          <div className="w-[min(500px,85vw)] bg-[#120a0a]/90 border border-[#782323] p-2.5 shadow-2xl mb-6">
            <div className="flex justify-between items-center text-xs font-mono mb-1">
              <span className="text-[#ff5533] font-bold tracking-wider">
                RUHSUZ OTOMASYON TANRISI (LEVIATHAN)
              </span>
              <span className="text-[#a3907a]">{Math.round(state.bossHealthPercent)}%</span>
            </div>
            <div className="w-full h-3 bg-[#241111] border border-[#541c1c] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#991111] to-[#ff3300] transition-all duration-150"
                style={{ width: `${state.bossHealthPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Unified Bottom Control Dock (Consolidated, Zero-Pill, Collapsible) */}
      <div className="w-full flex flex-col items-center pb-5 pointer-events-auto">
        {/* Collapse / Expand Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="bg-[#16120e] hover:bg-[#261e16] border-t border-x border-[#4a3b2a] text-[#c8963e] text-xs font-mono uppercase tracking-widest px-4 py-1.5 flex items-center space-x-1.5 cursor-pointer shadow-lg"
        >
          <span>{isCollapsed ? 'Zanaatkar Konsolunu Aç' : 'Konsolu Gizle'}</span>
          {isCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {/* Main Dock Container */}
        {!isCollapsed && (
          <div className="w-[min(940px,94vw)] bg-[#14100c]/95 border border-[#4a3b2a] shadow-2xl p-3.5 flex flex-col space-y-3">
            {/* Dock Navigation Tabs */}
            <div className="flex items-center justify-between border-b border-[#2b2216] pb-2 text-xs font-mono">
              <div className="flex space-x-1">
                <button
                  onClick={() => setActiveTab('forge')}
                  className={`px-3 py-1 cursor-pointer transition-colors ${
                    activeTab === 'forge'
                      ? 'bg-[#2b2216] text-[#e8d8b8] border-b-2 border-[#c8963e]'
                      : 'text-[#8a7a66] hover:text-[#c8963e]'
                  }`}
                >
                  <span className="flex items-center space-x-1.5">
                    <Hammer className="w-3.5 h-3.5" />
                    <span>MANTIK DÖVME</span>
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('layers')}
                  className={`px-3 py-1 cursor-pointer transition-colors ${
                    activeTab === 'layers'
                      ? 'bg-[#2b2216] text-[#e8d8b8] border-b-2 border-[#c8963e]'
                      : 'text-[#8a7a66] hover:text-[#c8963e]'
                  }`}
                >
                  <span className="flex items-center space-x-1.5">
                    <Compass className="w-3.5 h-3.5" />
                    <span>5 KATMAN ({currentLayer.id}/5)</span>
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('controls')}
                  className={`px-3 py-1 cursor-pointer transition-colors ${
                    activeTab === 'controls'
                      ? 'bg-[#2b2216] text-[#e8d8b8] border-b-2 border-[#c8963e]'
                      : 'text-[#8a7a66] hover:text-[#c8963e]'
                  }`}
                >
                  <span className="flex items-center space-x-1.5">
                    <Crosshair className="w-3.5 h-3.5" />
                    <span>KONTROLLER & BAKICI</span>
                  </span>
                </button>
              </div>

              {/* Camera Perspective Mode */}
              <div className="flex items-center space-x-1">
                <span className="text-[10px] text-[#786650] uppercase mr-1">Kamera:</span>
                {(['follow', 'inspect', 'cinematic'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => onCameraModeChange(mode)}
                    className={`px-2 py-0.5 text-[10px] font-mono cursor-pointer border ${
                      state?.cameraMode === mode
                        ? 'border-[#c8963e] bg-[#2b2216] text-[#e8d8b8]'
                        : 'border-[#332617] text-[#8a7a66] hover:border-[#665033]'
                    }`}
                  >
                    {mode === 'follow' ? 'Takip' : mode === 'inspect' ? 'İncele' : 'Sinematik'}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab 1: Logic Gate Forging (The Core Mechanic) */}
            {activeTab === 'forge' && (
              <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                {/* Logic Gate Selector Buttons */}
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono text-[#a3907a] uppercase mr-1">
                    EL ELDİVENİ DİSKİ:
                  </span>
                  {logicGates.map((gate) => {
                    const isSelected = state?.logicGate === gate;
                    return (
                      <button
                        key={gate}
                        onClick={() => onLogicGateSelect(gate)}
                        className={`px-3.5 py-1.5 text-xs font-mono font-bold border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#c8963e] bg-[#3a2c1b] text-[#ffd67a] shadow-md'
                            : 'border-[#3d2e1c] bg-[#1a140f] text-[#8a7862] hover:border-[#7a5e38]'
                        }`}
                      >
                        {gate}
                      </button>
                    );
                  })}
                </div>

                {/* Direct Action Triggers */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={onHammerStrike}
                    className="px-3.5 py-1.5 bg-[#261c12] hover:bg-[#3d2c1c] border border-[#785623] hover:border-[#c8963e] text-[#e8d8b8] text-xs font-mono font-semibold cursor-pointer flex items-center space-x-1.5"
                  >
                    <Hammer className="w-3.5 h-3.5 text-[#c8963e]" />
                    <span>ÇEKİÇ VURUŞU [SOL TIK]</span>
                  </button>

                  <button
                    onClick={onSawSlash}
                    className="px-3.5 py-1.5 bg-[#1a202c] hover:bg-[#253042] border border-[#40546e] hover:border-[#7292bf] text-[#e8d8b8] text-xs font-mono font-semibold cursor-pointer flex items-center space-x-1.5"
                  >
                    <Activity className="w-3.5 h-3.5 text-[#88b0e8]" />
                    <span>TİTANYUM TESTERE [SAĞ TIK]</span>
                  </button>

                  <button
                    onClick={onOverdrive}
                    className="px-3.5 py-1.5 bg-[#3a1a0f] hover:bg-[#542413] border border-[#943818] hover:border-[#e85827] text-[#ffd67a] text-xs font-mono font-bold cursor-pointer flex items-center space-x-1.5"
                  >
                    <Zap className="w-3.5 h-3.5 text-[#ff8833]" />
                    <span>ZEMBEREK [SPACE]</span>
                  </button>
                </div>
              </div>
            )}

            {/* Tab 2: 5 Handcrafted Hardware Layers */}
            {activeTab === 'layers' && (
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                {LAYER_DEFINITIONS.map((layer, idx) => {
                  const isCurrent = state?.currentLayer.id === layer.id;
                  return (
                    <button
                      key={layer.id}
                      onClick={() => onLayerSelect(idx)}
                      className={`p-2 text-left border cursor-pointer transition-all ${
                        isCurrent
                          ? 'border-[#c8963e] bg-[#2b2216]'
                          : 'border-[#2d2216] bg-[#14100c] hover:border-[#5a442a]'
                      }`}
                    >
                      <div className="text-[10px] font-mono text-[#b88b4a]">
                        KATMAN {layer.id}
                      </div>
                      <div className="text-xs font-bold text-[#e8d8b8] truncate font-['Cinzel']">
                        {layer.nameTr}
                      </div>
                      <div className="text-[10px] text-[#786650] truncate font-sans">
                        Gereken: {layer.requiredLogicGate} Kapısı
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Tab 3: Controls & Guide */}
            {activeTab === 'controls' && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono text-[#b8a690]">
                <div className="bg-[#1a140f] p-2 border border-[#2b2216]">
                  <span className="text-[#c8963e] block font-bold">W / A / S / D:</span>
                  Artisan Enes Öztürk Hareket
                </div>
                <div className="bg-[#1a140f] p-2 border border-[#2b2216]">
                  <span className="text-[#c8963e] block font-bold">Sol Tık / J:</span>
                  The Logic Maul (Ağır Çekiç)
                </div>
                <div className="bg-[#1a140f] p-2 border border-[#2b2216]">
                  <span className="text-[#c8963e] block font-bold">Sağ Tık / K:</span>
                  Titanyum Testere Dilimleme
                </div>
                <div className="bg-[#1a140f] p-2 border border-[#2b2216]">
                  <span className="text-[#c8963e] block font-bold">Q / E / F:</span>
                  Mantık Kapısı Değiştir / Döv
                </div>
              </div>
            )}

            {/* Task Banner & Progress */}
            <div className="flex items-center justify-between text-[11px] font-mono text-[#8a7a66] pt-1 border-t border-[#221a11]">
              <div className="truncate mr-2">
                <span className="text-[#c8963e]">Görev:</span> {currentLayer.forgeTask}
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <span>İlerleme: {state?.layerProgress || 0}%</span>
                <div className="w-20 h-1.5 bg-[#221a11] border border-[#443322]">
                  <div
                    className="h-full bg-[#c8963e]"
                    style={{ width: `${state?.layerProgress || 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Artisan Blueprint & Schematics Modal */}
      {showBlueprintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 pointer-events-auto">
          <div className="max-w-2xl w-full bg-[#16120d] border-2 border-[#785623] p-6 shadow-2xl text-[#d4c3ad] font-mono max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#443322] pb-3 mb-4">
              <div>
                <span className="text-[10px] text-[#c8963e] tracking-widest uppercase block">
                  BAŞ MİMAR & SİSTEM TASARIMCISI: ENES ÖZTÜRK
                </span>
                <h2 className="text-xl font-bold font-['Cinzel'] text-[#f5ebd7]">
                  ZANAATKAR MÜHENDİSLİK ŞEMASI
                </h2>
              </div>
              <button
                onClick={() => setShowBlueprintModal(false)}
                className="px-2.5 py-1 text-xs border border-[#55402a] hover:border-[#c8963e] cursor-pointer"
              >
                Kapat [ESC]
              </button>
            </div>

            <div className="space-y-4 text-xs leading-relaxed">
              <div className="bg-[#1f1710] p-3 border-l-2 border-[#c8963e]">
                <h3 className="font-bold text-[#e6b349] font-['Cinzel'] mb-1">
                  1. ÇEKİRDEK FELSEFE (ZERO-AI SLOP)
                </h3>
                <p className="text-[#a8957e]">
                  Bu eserde yapay zeka tarafından üretilmiş tek bir piksel, ses dalgası, 3D model
                  veya hazır kod bulunmaz. Her bir dişli milimetrik diş açılarıyla, her bir ses demirci
                  örsü ve canlı çello rezonansıyla, çekirdek motor ise Enes Öztürk'ün saf zanaatkar
                  ruhuyla inşa edilmiştir.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-[#14100c] p-3 border border-[#332617]">
                  <div className="font-bold text-[#c8963e] mb-1 flex items-center space-x-1.5">
                    <Award className="w-3.5 h-3.5" />
                    <span>THE LOGIC MAUL</span>
                  </div>
                  <p className="text-[11px] text-[#8a7a66]">
                    Ağır kinetik dövme çekici. Bakır devre plakalarına AND, XOR, NOT, NAND
                    mantık kapılarını fiziksel olarak çakar ve düşman zırhlarını ezerek deforme eder.
                  </p>
                </div>

                <div className="bg-[#14100c] p-3 border border-[#332617]">
                  <div className="font-bold text-[#c8963e] mb-1 flex items-center space-x-1.5">
                    <Activity className="w-3.5 h-3.5 text-[#88b0e8]" />
                    <span>OSCILLATING BLADE</span>
                  </div>
                  <p className="text-[11px] text-[#8a7a66]">
                    Sol koldaki yüksek devirli titanyum testere. Düşman otomatların pirinç perçinlerini
                    keser, kıvılcım ve fırlayan cıvata fırtınası koparır.
                  </p>
                </div>
              </div>

              <div className="border-t border-[#332617] pt-3">
                <h4 className="font-bold text-[#e8d8b8] mb-2 font-['Cinzel']">
                  5 EL İŞİ DONANIM KATMANI
                </h4>
                <ul className="space-y-1.5 text-[11px] text-[#9c8973]">
                  <li>
                    <b className="text-[#c8963e]">Katman 1 - Bakır ve Silikon Dökümhanesi:</b> Erimiş silikon
                    kanalları, devasa dikey vinçler ve AND matrisi.
                  </li>
                  <li>
                    <b className="text-[#c8963e]">Katman 2 - Sonsuz Saat Kulesi:</b> Milimetrik pirinç çarklar,
                    sarkaçlar ve XOR faz senkronizasyonu.
                  </li>
                  <li>
                    <b className="text-[#c8963e]">Katman 3 - Cam ve Vakum Tüpü Katedrali:</b> El üflemesi cam
                    tüpler, kırılan cam fiziği ve NOT polaritesi.
                  </li>
                  <li>
                    <b className="text-[#c8963e]">Katman 4 - Delikli Kart Labirenti:</b> Asılı devasa bronz
                    punch card'lar ve NAND derleme algoritması.
                  </li>
                  <li>
                    <b className="text-[#c8963e]">Katman 5 - Ustanın Çekirdek Atölyesi:</b> Ruhsuz Otomasyon
                    Tanrısı (The Automated Leviathan) ile destansı final düellosu.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
