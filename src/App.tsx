import React, { useState } from 'react';
import TonConnect from '@tonconnect/sdk';

import ballImage from './assets/ball1.png';

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

export const App: React.FC = () => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [totalReward, setTotalReward] = useState(0);
  const [questList, setQuestList] = useState(quests);

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

  return (
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
  );
}