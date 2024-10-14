// import { useState } from "react";

import "./output.css";
import "./App.css";
import Banner from "./components/banner";
import Nav from "./components/nav/Nav";
import PlayButton from "./components/playButton";
import { LoadingProvider } from "./contexts/Loading";
import '@fortawesome/fontawesome-free/css/all.min.css';
import TopBar from "./components/TopBar";
import { appWindow, LogicalSize } from '@tauri-apps/api/window';
import { useEffect, useState } from 'react';



function App() {

  useEffect(() => {
    // Funkcja obsługująca zmianę skali (DPI)
    const handleScaleChange = async () => {
      // Zmiana rozmiaru okna na 715x505 po zmianie skali
      await appWindow.setSize(new LogicalSize(715,  505 ));
    };

    // Nasłuchiwanie na zdarzenie zmiany skali
    const unlisten = appWindow.onScaleChanged(({ payload }) => {
      console.log(`Skala zmieniona na: ${payload}`);
      handleScaleChange();
    });

    // Czyszczenie event listenera po odmontowaniu komponentu
    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  appWindow.setSize(new LogicalSize(715, 505)).then(() => {
    console.log('resized!');
  });
  // appWindow.scaleFactor().then((factor) => {
  // console.log(`Skalowanie DPI: ${factor}`);
  // appWindow.setSize(new PhysicalSize(800 * factor, 600 * factor));
  return (
    <div className="bg-[#191b28] w-screen h-screen">
      {/* <div className="border-0 bg-contain bg-no-repeat bg-window_frame z-[9999] w-full"> */}
      <div className="flex flex-col text-center h-screen w-full">
        <TopBar />
        <LoadingProvider>
          <Banner />
          <Nav />
          <PlayButton />
        </LoadingProvider>
      </div>
    </div>
    // </div>
  );
}

export default App;
