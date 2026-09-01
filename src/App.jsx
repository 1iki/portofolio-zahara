/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SoundProvider } from './context/SoundContext';
import CustomCursor from './components/CustomCursor';
import ScanlineOverlay from './components/ScanlineOverlay';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Timeline from './components/Timeline';
import StatsLevelMeter from './components/StatsLevelMeter';
import WorkGrid from './components/WorkGrid';
import ScriptPreviewSection from './components/ScriptPreviewSection';
import DocumentationSection from './components/DocumentationSection';
import Contact from './components/Contact';

export default function App() {
  return (
    <SoundProvider>
      <div className="min-h-screen bg-navy-base font-body text-ivory">
        <CustomCursor />
        <ScanlineOverlay />
        
        <Navbar />
        
        <main>
          <Hero />
          <About />
          <Timeline />
          <StatsLevelMeter />
          <WorkGrid />
          <ScriptPreviewSection />
          <DocumentationSection />
        </main>
        
        <Contact />
      </div>
    </SoundProvider>
  );
}
