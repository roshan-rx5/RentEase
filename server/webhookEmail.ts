// Alternative email system using webhook.site for testing
export async function sendWebhookEmail(to: string, subject: string, text: string): Promise<boolean> {
  try {
    // Send email content to a webhook for testing/inspection
    const webhookUrl = 'https://webhook.site/unique-id'; // User can replace with their own webhook
    
    const emailData = {
      timestamp: new Date().toISOString(),
      to: to,
      subject: subject,
      content: text,
      type: 'otp_email'
    };

    console.log('\n📧 EMAIL NOTIFICATION 📧');
    console.log('═══════════════════════════════════════');
    console.log(`📮 To: ${to}`);
    console.log(`📋 Subject: ${subject}`);
    console.log('📄 Content:');
    console.log(text);
    console.log('═══════════════════════════════════════');
    console.log(`🔗 You can also check: ${webhookUrl}`);
    console.log('');

    // Try to send to webhook (optional - won't fail if webhook is down)
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailData)
      });
    } catch (e) {
      // Webhook sending failed, but that's ok - we still show in console
    }

    return true;
  } catch (error) {
    console.error('Email notification failed:', error);
    return false;
  }
}

export function generateSimpleOtpText(email: string, otp: string, purpose: 'login' | 'signup'): string {
  const action = purpose === 'login' ? 'sign in to' : 'verify your account on';
  
  return `
════════════════════════════════════════
🔐 RENTFLOW VERIFICATION CODE
════════════════════════════════════════

Hello!

You requested to ${action} RentFlow.
Your verification code is:

    >>> ${otp} <<<

⏰ This code will expire in 5 minutes.

If you didn't request this, please ignore.

Best regards,
RentFlow Team
════════════════════════════════════════
  `;
}