import React from 'react';
import { ProviderContext } from '../state/ProviderContext';
import { ProviderBar } from '../components/ProviderBar';
import { ChatInput } from '../components/ChatInput';

const HomePage: React.FC = () => {
  return (
    <ProviderContext>
      <ProviderBar />
      {/* your existing panes/content go here */}
      <ChatInput />
    </ProviderContext>
  );
};

export default HomePage;
