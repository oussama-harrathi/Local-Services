import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  static async sendEmail({ to, subject, html }: EmailTemplate): Promise<boolean> {
    try {
      if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY not configured, skipping email send');
        return false;
      }

      const { data, error } = await resend.emails.send({
        from: process.env.FROM_EMAIL || 'LocalSpark <noreply@localspark.com>',
        to,
        subject,
        html,
      });

      if (error) {
        console.error('Failed to send email:', error);
        return false;
      }

      console.log('Email sent successfully:', data?.id);
      return true;
    } catch (error) {
      console.error('Email service error:', error);
      return false;
    }
  }

  static generateBookingConfirmationEmail(
    customerName: string,
    providerName: string,
    serviceType: string,
    date: Date,
    duration: number,
    totalPrice?: number
  ): string {
    const formattedDate = date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const formattedTime = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Booking Confirmation</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; }
            .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 30px 20px; text-align: center; }
            .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
            .content { padding: 30px 20px; }
            .details-box { background-color: #f1f5f9; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #2563eb; }
            .footer { background-color: #1e293b; color: #94a3b8; padding: 20px; text-align: center; font-size: 14px; }
            .btn { display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">✨ LocalSpark</div>
              <h1 style="margin: 0; font-size: 24px;">Booking Confirmed! 🎉</h1>
            </div>
            
            <div class="content">
              <p style="font-size: 18px; margin-bottom: 20px;">Hi ${customerName},</p>
              
              <p>Great news! Your appointment has been confirmed with <strong>${providerName}</strong>.</p>
              
              <div class="details-box">
                <h3 style="margin-top: 0; color: #1e40af; font-size: 20px;">📅 Appointment Details</h3>
                <p style="margin: 8px 0;"><strong>Service:</strong> ${serviceType}</p>
                <p style="margin: 8px 0;"><strong>Date:</strong> ${formattedDate}</p>
                <p style="margin: 8px 0;"><strong>Time:</strong> ${formattedTime}</p>
                <p style="margin: 8px 0;"><strong>Duration:</strong> ${duration} minutes</p>
                ${totalPrice ? `<p style="margin: 8px 0;"><strong>Total:</strong> $${totalPrice}</p>` : ''}
              </div>
              
              <p>📱 We'll send you helpful reminders:</p>
              <ul style="color: #64748b;">
                <li>24 hours before your appointment</li>
                <li>2 hours before your appointment</li>
              </ul>
              
              <p style="margin-top: 30px; color: #64748b;">
                Need to make changes? Contact your provider directly or reach out to our support team.
              </p>
            </div>
            
            <div class="footer">
              <p style="margin: 0;">Thank you for choosing LocalSpark!</p>
              <p style="margin: 5px 0 0 0; font-size: 12px;">Connecting you with trusted local service providers</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  static generateReminderEmail(
    customerName: string,
    providerName: string,
    serviceType: string,
    date: Date,
    duration: number,
    hoursUntil: number
  ): string {
    const formattedDate = date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const formattedTime = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const reminderText = hoursUntil === 24 
      ? 'Your appointment is tomorrow!' 
      : 'Your appointment is in 2 hours!';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Appointment Reminder</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; }
            .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px 20px; text-align: center; }
            .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
            .content { padding: 30px 20px; }
            .details-box { background-color: #fef3c7; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #f59e0b; }
            .footer { background-color: #1e293b; color: #94a3b8; padding: 20px; text-align: center; font-size: 14px; }
            .urgent { background-color: #fee2e2; border-left-color: #ef4444; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">✨ LocalSpark</div>
              <h1 style="margin: 0; font-size: 24px;">⏰ ${reminderText}</h1>
            </div>
            
            <div class="content">
              <p style="font-size: 18px; margin-bottom: 20px;">Hi ${customerName},</p>
              
              <p>This is a friendly reminder about your upcoming appointment with <strong>${providerName}</strong>.</p>
              
              <div class="details-box ${hoursUntil === 2 ? 'urgent' : ''}">
                <h3 style="margin-top: 0; color: #d97706; font-size: 20px;">📅 Appointment Details</h3>
                <p style="margin: 8px 0;"><strong>Service:</strong> ${serviceType}</p>
                <p style="margin: 8px 0;"><strong>Date:</strong> ${formattedDate}</p>
                <p style="margin: 8px 0;"><strong>Time:</strong> ${formattedTime}</p>
                <p style="margin: 8px 0;"><strong>Duration:</strong> ${duration} minutes</p>
              </div>
              
              ${hoursUntil === 2 ? 
                '<p style="background-color: #fee2e2; padding: 15px; border-radius: 8px; color: #dc2626; font-weight: 600;">🚨 Your appointment is starting soon! Please prepare to leave now.</p>' :
                '<p>📍 Please make sure to arrive on time tomorrow.</p>'
              }
              
              <p style="color: #64748b;">
                Need to cancel? Remember that cancellations must be made at least 24 hours in advance to avoid fees.
              </p>
            </div>
            
            <div class="footer">
              <p style="margin: 0;">See you ${hoursUntil === 2 ? 'soon' : 'tomorrow'}!</p>
              <p style="margin: 5px 0 0 0; font-size: 12px;">The LocalSpark Team</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  static generateReviewRequestEmail(
    customerName: string,
    providerName: string,
    serviceType: string,
    bookingId: string
  ): string {
    const reviewUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/provider/${bookingId}?review=true`;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>How was your experience?</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px 20px; text-align: center; }
            .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
            .content { padding: 30px 20px; }
            .cta-box { background-color: #ecfdf5; padding: 25px; border-radius: 12px; margin: 25px 0; text-align: center; border-left: 4px solid #10b981; }
            .footer { background-color: #1e293b; color: #94a3b8; padding: 20px; text-align: center; font-size: 14px; }
            .btn { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); }
            .stars { font-size: 24px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">✨ LocalSpark</div>
              <h1 style="margin: 0; font-size: 24px;">How was your experience? ⭐</h1>
            </div>
            
            <div class="content">
              <p style="font-size: 18px; margin-bottom: 20px;">Hi ${customerName},</p>
              
              <p>We hope you had a wonderful experience with <strong>${providerName}</strong> for your ${serviceType} service!</p>
              
              <div class="cta-box">
                <div class="stars">⭐⭐⭐⭐⭐</div>
                <h3 style="margin: 15px 0; color: #059669; font-size: 20px;">Share Your Experience</h3>
                <p style="margin-bottom: 25px; color: #64748b;">Your feedback helps other customers make informed decisions and helps providers improve their services.</p>
                
                <a href="${reviewUrl}" class="btn">
                  Leave a Review
                </a>
              </div>
              
              <p style="color: #64748b; font-size: 14px; text-align: center;">
                💡 <strong>Did you know?</strong> Reviews with photos get 3x more views and help providers showcase their work!
              </p>
              
              <p style="margin-top: 30px; color: #64748b;">
                Thank you for being part of the LocalSpark community. Your feedback makes our platform better for everyone!
              </p>
            </div>
            
            <div class="footer">
              <p style="margin: 0;">Thank you for choosing LocalSpark!</p>
              <p style="margin: 5px 0 0 0; font-size: 12px;">Connecting you with trusted local service providers</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}