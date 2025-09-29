import React, { useState } from 'react';
import { DiscordProvider } from './DiscordContext';
import DiscordOAuthButton from './DiscordOAuthButton';
import DiscordErrorDisplay from './DiscordErrorDisplay';
import SupportRequestForm from './SupportRequestForm';

type ViewState = 'oauth' | 'support' | 'success';

/**
 * Discord verification flow wrapper component that demonstrates
 * proper composition and context usage according to React guidelines
 */
const DiscordVerificationFlow: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('oauth');

  const handleSupportRequest = () => {
    setCurrentView('support');
  };

  const handleSupportSubmitted = (requestId: string) => {
    console.log('Support request submitted:', requestId);
    setCurrentView('success');
  };

  const handleBack = () => {
    setCurrentView('oauth');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'oauth':
        return <DiscordOAuthButton />;
      
      case 'support':
        return (
          <SupportRequestForm 
            onSupportSubmitted={handleSupportSubmitted}
            onBack={handleBack}
          />
        );
      
      case 'success':
        return (
          <div className="success-message">
            <h3>✅ Verification Complete</h3>
            <p>Your request has been submitted successfully!</p>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <DiscordProvider>
      <div className="discord-verification-flow">
        <DiscordErrorDisplay />
        {renderCurrentView()}
      </div>
    </DiscordProvider>
  );
};

export default DiscordVerificationFlow;