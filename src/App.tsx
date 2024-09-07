import React, { useEffect, useState } from 'react';
import TonConnect from '@tonconnect/sdk';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { ThemeProvider, createTheme } from '@mui/material';
import { bindViewportCSSVars, initViewport, bindThemeParamsCSSVars, initThemeParams } from "@telegram-apps/sdk";
import { CoinProvider } from './contexts/CoinContext';

import { UserInitializer } from './components/UserInitializer/UserInitializer';
import Onboarding from './components/Onboarding/Onboarding';
import ballImage from './assets/ball1.png';
import './types';

interface Quest {
  id: number;
  description: string;
  reward: number;
  completed: boolean;
}

const quests: Quest[] = [
  { id: 1, description: "Подпишись на официальный канал телеграм", reward: 200, completed: false },
  { id: 2, description: "Ежедневный бонус", reward: 100, completed: false },
  { id: 3, description: "Пригласи 5 друзей", reward: 800, completed: false },
  { id: 4, description: "Подключи кошелёк", reward: 150, completed: false },
  { id: 5, description: "Выставь историю в инстаграм со своим любимым клубом и хештегом BallCry", reward: 300, completed: false },
  { id: 6, description: "Подпишись на канал в X", reward: 100, completed: false },
  { id: 7, description: "Соверши транзакцию Ton", reward: 250, completed: false },
];

const theme = createTheme({
  components: {
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          height: 56,
          position: 'fixed',
          bottom: 0,
          width: '100%',
          backgroundColor: 'var(--tg-theme-bg-color)',
          color: 'var(--tg-theme-text-color)',
        },
      },
    },
  },
});

const manifestUrl = 'https://simi129.github.io/CARY/tonconnect-manifest.json';

export const App: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [totalReward, setTotalReward] = useState(0);
  const [questList, setQuestList] = useState(quests);

  useEffect(() => {
    const initApp = async () => {
      const [vpResult, vpCleanup] = initViewport();
      const viewport = await vpResult;
      bindViewportCSSVars(viewport);

      const [tpResult, tpCleanup] = initThemeParams();
      bindThemeParamsCSSVars(tpResult);

      if (window.Telegram?.WebApp) {
        const webApp = window.Telegram.WebApp;
        if ('viewportStableHeight' in webApp) {
          document.documentElement.style.setProperty(
            '--tg-viewport-stable-height',
            `${webApp.viewportStableHeight}px`
          );
        }
        if ('safeArea' in webApp && webApp.safeArea) {
          document.documentElement.style.setProperty(
            '--tg-bottom-safe-area',
            `${webApp.safeArea.bottom}px`
          );
        }
      }

      setIsInitialized(true);

      return () => {
        vpCleanup();
        tpCleanup();
      };
    };

    initApp();
  }, []);

  const handleOnboardingComplete = () => {
    setOnboardingComplete(true);
  };

  const connectWallet = async () => {
    const tonConnectSDK = new TonConnect({
      manifestUrl: 'https://simi129.github.io/CARY/tonconnect-manifest.json'
    });
    
    try {
      await tonConnectSDK.connect({
        universalLink: 'https://app.tonkeeper.com/ton-connect',
        bridgeUrl: 'https://bridge.tonapi.io/bridge'
      });
      setWalletConnected(true);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const completeQuest = (id: number) => {
    setQuestList(prevQuests => 
      prevQuests.map(quest => 
        quest.id === id ? { ...quest, completed: true } : quest
      )
    );
    setTotalReward(prevReward => prevReward + quests.find(q => q.id === id)!.reward);
  };

  if (!isInitialized) {
    return <div>Initializing...</div>;
  }

  if (!onboardingComplete) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <ThemeProvider theme={theme}>
      <TonConnectUIProvider manifestUrl={manifestUrl}>
        <CoinProvider>
          
            <UserInitializer />
            <div className="app-container">
              <div className="wallet-container">
                {walletConnected ? (
                  <span>Кошелек подключен</span>
                ) : (
                  <button onClick={connectWallet}>Подключить кошелек</button>
                )}
              </div>
              <div className="total-reward">
                Всего BallCry: {totalReward}
              </div>
              <img src={ballImage} alt="Ball" className="ball-image" />
              <div className="quests-container">
                {questList.map(quest => (
                  <div key={quest.id} className="quest-item">
                    <span>{quest.description} - {quest.reward} BallCry</span>
                    <button 
                      onClick={() => completeQuest(quest.id)}
                      disabled={quest.completed}
                    >
                      {quest.completed ? 'Выполнено' : 'Выполнить'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          
        </CoinProvider>
      </TonConnectUIProvider>
    </ThemeProvider>
  );
};