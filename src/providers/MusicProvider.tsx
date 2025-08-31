import React, {createContext, useContext, useEffect, useState} from 'react';
import { AppState } from 'react-native';
import { Music } from '../native/Music';

type Ctx = { musicOn: boolean; toggle: ()=>void; setOn:(b:boolean)=>void; };
const Ctx = createContext<Ctx>({ musicOn: true, toggle(){}, setOn(){} });

export const MusicProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [musicOn, setMusicOn] = useState(true);

  useEffect(() => { musicOn ? Music.start() : Music.stop(); }, [musicOn]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', s => {
      if (s === 'active') { if (musicOn) Music.start(); }
      else { Music.stop(); }
    });
    return () => sub.remove();
  }, [musicOn]);

  return (
    <Ctx.Provider value={{ musicOn, toggle: ()=>setMusicOn(v=>!v), setOn:setMusicOn }}>
      {children}
    </Ctx.Provider>
  );
};

export const useMusic = () => useContext(Ctx);
