import React from 'react';

interface CompleteStepProps {
  supportRequestId?: string;
  onStartOver?: () => void;
}

/**
 * Component for the completion step in the signup flow.
 * Displays success message for either support request or GitHub OAuth completion.
 */
export default function CompleteStep({ supportRequestId, onStartOver }: CompleteStepProps) {
  if (supportRequestId) {
    // Support request completed
    return (
      <div className='form-content'>
        <div className='form-header'>
          <h3 className='form-title'>Support Request Submitted</h3>
          <p className='form-subtitle'>We've received your request</p>
        </div>

        <div className='success-content'>
          <div className='success-icon'>📧</div>
          <p className='success-text'>
            Your support request has been submitted successfully. Request ID: <strong>{supportRequestId}</strong>
          </p>
          <p className='success-text'>
            We'll review your request and get back to you soon.
          </p>
        </div>

        <div className='form-footer'>
          <button onClick={onStartOver} className='back-link' title='Start over'>
            ← Start over
          </button>
        </div>
      </div>
    );
  } else {
    // GitHub OAuth completed
    return (
      <div className='form-content'>
        <div className='form-header'>
          <h3 className='form-title'>Welcome to Insiders!</h3>
          <p className='form-subtitle'>You're all set up</p>
        </div>

        <div className='success-content'>
          <div className='success-icon'>🎉</div>
          <p className='success-text'>
            Congratulations! You now have access to the Insiders repository.
          </p>
          <p className='success-text'>
            Check your GitHub notifications for the invitation link.
          </p>
        </div>
      </div>
    );
  }
}