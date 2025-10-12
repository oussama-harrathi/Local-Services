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
      const { data, error } = await resend.emails.send({
        from: 'LocalSpark <onboarding@resend.dev>',
        to: [to],
        subject,
        html,
      });

      if (error) {
        console.error('Failed to send email:', error);
        return false;
      }

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
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px 20px; text-align: center; }
            .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
            .content { padding: 30px 20px; }
            .booking-card { background-color: #f0fdf4; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #10b981; }
            .footer { background-color: #1e293b; color: #94a3b8; padding: 20px; text-align: center; font-size: 14px; }
            .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
            .detail-label { font-weight: 600; color: #475569; }
            .detail-value { color: #1e293b; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">✨ LocalSpark</div>
              <h1 style="margin: 0; font-size: 24px;">Booking Confirmed! 🎉</h1>
            </div>
            
            <div class="content">
              <p style="font-size: 18px; margin-bottom: 20px;">Hello ${customerName},</p>
              
              <p style="font-size: 16px; color: #475569; margin-bottom: 25px;">
                Great news! Your booking has been confirmed. Here are the details:
              </p>
              
              <div class="booking-card">
                <h3 style="margin: 0 0 20px 0; color: #1e293b; font-size: 18px;">Booking Details</h3>
                
                <div class="detail-row">
                  <span class="detail-label">Service Provider:</span>
                  <span class="detail-value">${providerName}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Service Type:</span>
                  <span class="detail-value">${serviceType}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Date & Time:</span>
                  <span class="detail-value">${formattedDate} at ${formattedTime}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Duration:</span>
                  <span class="detail-value">${duration} minutes</span>
                </div>
                
                ${totalPrice ? `
                <div class="detail-row" style="border-bottom: none; font-size: 18px; font-weight: bold;">
                  <span class="detail-label">Total Price:</span>
                  <span class="detail-value" style="color: #10b981;">$${totalPrice.toFixed(2)}</span>
                </div>
                ` : ''}
              </div>
              
              <p style="background-color: #dcfce7; padding: 15px; border-radius: 8px; color: #166534; font-weight: 600;">
                📅 We'll send you reminders 24 hours and 2 hours before your appointment.
              </p>
              
              <p style="color: #64748b;">
                Need to make changes? Remember that cancellations must be made at least 24 hours in advance.
              </p>
            </div>
            
            <div class="footer">
              <p style="margin: 0;">Thank you for choosing LocalSpark!</p>
              <p style="margin: 5px 0 0 0; font-size: 12px;">The LocalSpark Team</p>
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
            .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
            .detail-label { font-weight: 600; color: #475569; }
            .detail-value { color: #1e293b; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">⏰ LocalSpark</div>
              <h1 style="margin: 0; font-size: 24px;">${reminderText}</h1>
            </div>
            
            <div class="content">
              <p style="font-size: 18px; margin-bottom: 20px;">Hello ${customerName},</p>
              
              <p style="font-size: 16px; color: #475569; margin-bottom: 25px;">
                This is a friendly reminder about your upcoming appointment.
              </p>
              
              <div class="details-box">
                <h3 style="margin: 0 0 20px 0; color: #1e293b; font-size: 18px;">Appointment Details</h3>
                
                <div class="detail-row">
                  <span class="detail-label">Provider:</span>
                  <span class="detail-value">${providerName}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Service:</span>
                  <span class="detail-value">${serviceType}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Date & Time:</span>
                  <span class="detail-value">${formattedDate} at ${formattedTime}</span>
                </div>
                
                <div class="detail-row" style="border-bottom: none;">
                  <span class="detail-label">Duration:</span>
                  <span class="detail-value">${duration} minutes</span>
                </div>
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
    const reviewUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/review/${bookingId}`;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>How was your experience?</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; }
            .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 30px 20px; text-align: center; }
            .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
            .content { padding: 30px 20px; }
            .cta-box { background-color: #f0fdf4; padding: 30px; border-radius: 12px; margin: 25px 0; text-align: center; border: 2px solid #10b981; }
            .btn { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; }
            .footer { background-color: #1e293b; color: #94a3b8; padding: 20px; text-align: center; font-size: 14px; }
            .stars { font-size: 24px; margin-bottom: 15px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">⭐ LocalSpark</div>
              <h1 style="margin: 0; font-size: 24px;">How was your experience?</h1>
            </div>
            
            <div class="content">
              <p style="font-size: 18px; margin-bottom: 20px;">Hello ${customerName},</p>
              
              <p style="font-size: 16px; color: #475569; margin-bottom: 25px;">
                We hope you had a great experience with <strong>${providerName}</strong> for your <strong>${serviceType}</strong> service!
              </p>
              
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
            </div>
            
            <div class="footer">
              <p style="margin: 0;">Thank you for using LocalSpark!</p>
              <p style="margin: 5px 0 0 0; font-size: 12px;">The LocalSpark Team</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  static generateBookingUpdateEmail(
    customerName: string,
    providerName: string,
    serviceType: string,
    status: string,
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
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    const statusMessages = {
      confirmed: {
        title: 'Booking Confirmed! ✅',
        message: 'Great news! Your booking has been confirmed.',
        color: '#10b981'
      },
      cancelled: {
        title: 'Booking Cancelled ❌',
        message: 'Your booking has been cancelled.',
        color: '#ef4444'
      },
      rescheduled: {
        title: 'Booking Rescheduled 📅',
        message: 'Your booking has been rescheduled.',
        color: '#f59e0b'
      },
      completed: {
        title: 'Service Completed ✨',
        message: 'Your service has been completed.',
        color: '#8b5cf6'
      }
    };

    const statusInfo = statusMessages[status as keyof typeof statusMessages] || {
      title: 'Booking Updated',
      message: `Your booking status has been updated to: ${status}`,
      color: '#6b7280'
    };

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${statusInfo.title}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; }
            .header { background: linear-gradient(135deg, ${statusInfo.color} 0%, ${statusInfo.color}dd 100%); color: white; padding: 30px 20px; text-align: center; }
            .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
            .content { padding: 30px 20px; }
            .booking-card { background-color: #f8fafc; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid ${statusInfo.color}; }
            .footer { background-color: #1e293b; color: #94a3b8; padding: 20px; text-align: center; font-size: 14px; }
            .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
            .detail-label { font-weight: 600; color: #475569; }
            .detail-value { color: #1e293b; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">✨ LocalSpark</div>
              <h1 style="margin: 0; font-size: 24px;">${statusInfo.title}</h1>
            </div>
            
            <div class="content">
              <p style="font-size: 18px; margin-bottom: 20px;">Hello ${customerName},</p>
              
              <p style="font-size: 16px; color: #475569; margin-bottom: 25px;">
                ${statusInfo.message}
              </p>
              
              <div class="booking-card">
                <h3 style="margin: 0 0 20px 0; color: #1e293b; font-size: 18px;">Booking Details</h3>
                
                <div class="detail-row">
                  <span class="detail-label">Provider:</span>
                  <span class="detail-value">${providerName}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Service:</span>
                  <span class="detail-value">${serviceType}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Date & Time:</span>
                  <span class="detail-value">${formattedDate} at ${formattedTime}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Duration:</span>
                  <span class="detail-value">${duration} minutes</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Status:</span>
                  <span class="detail-value" style="color: ${statusInfo.color}; font-weight: 600;">${status.charAt(0).toUpperCase() + status.slice(1)}</span>
                </div>
                
                ${totalPrice ? `
                <div class="detail-row" style="border-bottom: none; font-size: 18px; font-weight: bold;">
                  <span class="detail-label">Total:</span>
                  <span class="detail-value" style="color: ${statusInfo.color};">$${totalPrice.toFixed(2)}</span>
                </div>
                ` : ''}
              </div>
              
              <p style="color: #64748b;">
                If you have any questions about this update, please don't hesitate to contact us.
              </p>
            </div>
            
            <div class="footer">
              <p style="margin: 0;">Thank you for using LocalSpark!</p>
              <p style="margin: 5px 0 0 0; font-size: 12px;">The LocalSpark Team</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  static generateOrderUpdateEmail(
    customerName: string,
    providerName: string,
    status: string,
    items: string,
    totalPrice: number,
    orderDate: Date
  ): string {
    const formattedDate = orderDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    
    const formattedTime = orderDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    const statusMessages = {
      confirmed: {
        title: 'Order Confirmed! 🍽️',
        message: 'Great news! Your food order has been confirmed.',
        color: '#10b981'
      },
      cancelled: {
        title: 'Order Cancelled ❌',
        message: 'Your food order has been cancelled.',
        color: '#ef4444'
      },
      preparing: {
        title: 'Order Being Prepared 👨‍🍳',
        message: 'Your food is being prepared.',
        color: '#3b82f6'
      },
      ready: {
        title: 'Order Ready for Pickup! 📦',
        message: 'Your food order is ready for pickup.',
        color: '#8b5cf6'
      },
      delivered: {
        title: 'Order Delivered! ✅',
        message: 'Your food order has been delivered.',
        color: '#059669'
      }
    };

    const statusInfo = statusMessages[status as keyof typeof statusMessages] || {
      title: 'Order Updated',
      message: `Your order status has been updated to: ${status}`,
      color: '#6b7280'
    };

    let parsedItems;
    try {
      parsedItems = JSON.parse(items);
    } catch {
      parsedItems = [];
    }

    const itemsHtml = parsedItems.map((item: any) => 
      `<div class="detail-row">
        <span class="detail-label">${item.name} x${item.quantity}</span>
        <span class="detail-value">$${(item.price * item.quantity).toFixed(2)}</span>
      </div>`
    ).join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${statusInfo.title}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; }
            .header { background: linear-gradient(135deg, ${statusInfo.color} 0%, ${statusInfo.color}dd 100%); color: white; padding: 30px 20px; text-align: center; }
            .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
            .content { padding: 30px 20px; }
            .order-card { background-color: #f8fafc; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid ${statusInfo.color}; }
            .footer { background-color: #1e293b; color: #94a3b8; padding: 20px; text-align: center; font-size: 14px; }
            .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
            .detail-label { font-weight: 600; color: #475569; }
            .detail-value { color: #1e293b; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🍽️ LocalSpark</div>
              <h1 style="margin: 0; font-size: 24px;">${statusInfo.title}</h1>
            </div>
            
            <div class="content">
              <p style="font-size: 18px; margin-bottom: 20px;">Hello ${customerName},</p>
              
              <p style="font-size: 16px; color: #475569; margin-bottom: 25px;">
                ${statusInfo.message}
              </p>
              
              <div class="order-card">
                <h3 style="margin: 0 0 20px 0; color: #1e293b; font-size: 18px;">Order Details</h3>
                
                <div class="detail-row">
                  <span class="detail-label">Provider:</span>
                  <span class="detail-value">${providerName}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Order Date:</span>
                  <span class="detail-value">${formattedDate} at ${formattedTime}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Status:</span>
                  <span class="detail-value" style="color: ${statusInfo.color}; font-weight: 600;">${status.charAt(0).toUpperCase() + status.slice(1)}</span>
                </div>
                
                <hr style="border: none; border-top: 2px solid #e2e8f0; margin: 20px 0;">
                
                <h4 style="margin: 15px 0 10px 0; color: #1e293b;">Items Ordered:</h4>
                ${itemsHtml}
                
                <hr style="border: none; border-top: 2px solid #e2e8f0; margin: 20px 0;">
                
                <div class="detail-row" style="border-bottom: none; font-size: 18px; font-weight: bold;">
                  <span class="detail-label">Total:</span>
                  <span class="detail-value" style="color: ${statusInfo.color};">$${totalPrice.toFixed(2)}</span>
                </div>
              </div>
              
              ${status === 'confirmed' ? 
                '<p style="background-color: #dcfce7; padding: 15px; border-radius: 8px; color: #166534; font-weight: 600;">🎉 Your order is confirmed! The provider will start preparing your food soon.</p>' :
                status === 'ready' ?
                '<p style="background-color: #fef3c7; padding: 15px; border-radius: 8px; color: #92400e; font-weight: 600;">📦 Your order is ready for pickup! Please collect it as soon as possible.</p>' :
                status === 'delivered' ?
                '<p style="background-color: #dcfce7; padding: 15px; border-radius: 8px; color: #166534; font-weight: 600;">✅ Enjoy your meal! We hope you had a great experience.</p>' :
                ''
              }
              
              <p style="color: #64748b; margin-top: 25px;">
                Thank you for choosing LocalSpark for your food delivery needs!
              </p>
            </div>
            
            <div class="footer">
              <p style="margin: 0;">Bon appétit!</p>
              <p style="margin: 5px 0 0 0; font-size: 12px;">The LocalSpark Team</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  static generateVerificationStatusEmail(
    providerName: string,
    status: 'approved' | 'rejected',
    verificationLevel: string,
    verificationBadgeType: string,
    adminNotes?: string
  ): string {
    const statusInfo = {
      approved: {
        title: 'Verification Approved! ✅',
        message: 'Congratulations! Your provider verification has been approved.',
        color: '#10b981',
        icon: '✅'
      },
      rejected: {
        title: 'Verification Update ❌',
        message: 'We were unable to approve your verification request at this time.',
        color: '#ef4444',
        icon: '❌'
      }
    };

    const info = statusInfo[status];
    const badgeTypeDisplay = verificationBadgeType.charAt(0).toUpperCase() + verificationBadgeType.slice(1);
    const levelDisplay = verificationLevel.charAt(0).toUpperCase() + verificationLevel.slice(1);

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${info.title}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; }
            .header { background: linear-gradient(135deg, ${info.color} 0%, ${info.color}dd 100%); color: white; padding: 30px 20px; text-align: center; }
            .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
            .content { padding: 30px 20px; }
            .verification-card { background-color: #f8fafc; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid ${info.color}; }
            .footer { background-color: #1e293b; color: #94a3b8; padding: 20px; text-align: center; font-size: 14px; }
            .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
            .detail-label { font-weight: 600; color: #475569; }
            .detail-value { color: #1e293b; }
            .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
            .badge-approved { background-color: #dcfce7; color: #166534; }
            .badge-rejected { background-color: #fecaca; color: #991b1b; }
            .notes-box { background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
            .cta-button { display: inline-block; background-color: ${info.color}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">✨ LocalSpark</div>
              <h1 style="margin: 0; font-size: 24px;">${info.title}</h1>
            </div>
            
            <div class="content">
              <p style="font-size: 18px; margin-bottom: 20px;">Hello ${providerName},</p>
              
              <p style="font-size: 16px; margin-bottom: 25px;">${info.message}</p>
              
              <div class="verification-card">
                <h3 style="margin-top: 0; color: #1e293b; display: flex; align-items: center; gap: 10px;">
                  <span style="font-size: 24px;">${info.icon}</span>
                  Verification Details
                </h3>
                
                <div class="detail-row">
                  <span class="detail-label">Status:</span>
                  <span class="detail-value">
                    <span class="badge badge-${status}">${status.toUpperCase()}</span>
                  </span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Verification Level:</span>
                  <span class="detail-value">${levelDisplay}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Badge Type:</span>
                  <span class="detail-value">${badgeTypeDisplay} Verified</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Date:</span>
                  <span class="detail-value">${new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}</span>
                </div>
              </div>

              ${adminNotes ? `
                <div class="notes-box">
                  <h4 style="margin-top: 0; color: #92400e;">Admin Notes:</h4>
                  <p style="margin-bottom: 0; color: #451a03;">${adminNotes}</p>
                </div>
              ` : ''}

              ${status === 'approved' ? `
                <p style="font-size: 16px; margin: 25px 0;">
                  Your verification badge is now active on your profile! This will help build trust with potential customers and improve your visibility in search results.
                </p>
                
                <div style="text-align: center;">
                  <a href="${process.env.NEXTAUTH_URL}/dashboard" class="cta-button">
                    View Your Profile
                  </a>
                </div>
              ` : `
                <p style="font-size: 16px; margin: 25px 0;">
                  Don't worry - you can submit a new verification request at any time. Please review the feedback above and feel free to try again with additional documentation or information.
                </p>
                
                <div style="text-align: center;">
                  <a href="${process.env.NEXTAUTH_URL}/dashboard/verification" class="cta-button">
                    Submit New Request
                  </a>
                </div>
              `}

              <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
                If you have any questions about the verification process, please don't hesitate to contact our support team.
              </p>
            </div>
            
            <div class="footer">
              <p style="margin: 0;">Thank you for being part of LocalSpark!</p>
              <p style="margin: 5px 0 0 0; font-size: 12px;">The LocalSpark Team</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  static generateVerificationRequestEmail(
    adminName: string,
    providerName: string,
    verificationLevel: string,
    verificationBadgeType: string,
    message?: string
  ): string {
    const levelDisplay = verificationLevel.charAt(0).toUpperCase() + verificationLevel.slice(1);
    const badgeTypeDisplay = verificationBadgeType.charAt(0).toUpperCase() + verificationBadgeType.slice(1);

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>New Verification Request</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; }
            .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 30px 20px; text-align: center; }
            .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
            .content { padding: 30px 20px; }
            .request-card { background-color: #f8fafc; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #3b82f6; }
            .footer { background-color: #1e293b; color: #94a3b8; padding: 20px; text-align: center; font-size: 14px; }
            .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
            .detail-label { font-weight: 600; color: #475569; }
            .detail-value { color: #1e293b; }
            .message-box { background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
            .cta-button { display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">✨ LocalSpark</div>
              <h1 style="margin: 0; font-size: 24px;">New Verification Request 📋</h1>
            </div>
            
            <div class="content">
              <p style="font-size: 18px; margin-bottom: 20px;">Hello Admin,</p>
              
              <p style="font-size: 16px; margin-bottom: 25px;">
                A new provider verification request has been submitted and requires your review.
              </p>
              
              <div class="request-card">
                <h3 style="margin-top: 0; color: #1e293b; display: flex; align-items: center; gap: 10px;">
                  <span style="font-size: 24px;">👤</span>
                  Request Details
                </h3>
                
                <div class="detail-row">
                  <span class="detail-label">Provider:</span>
                  <span class="detail-value">${providerName}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Requested Level:</span>
                  <span class="detail-value">${levelDisplay}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Badge Type:</span>
                  <span class="detail-value">${badgeTypeDisplay} Verified</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Submitted:</span>
                  <span class="detail-value">${new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}</span>
                </div>
              </div>

              ${message ? `
                <div class="message-box">
                  <h4 style="margin-top: 0; color: #92400e;">Provider Message:</h4>
                  <p style="margin-bottom: 0; color: #451a03;">"${message}"</p>
                </div>
              ` : ''}

              <p style="font-size: 16px; margin: 25px 0;">
                Please review this request in the admin panel and take appropriate action.
              </p>
              
              <div style="text-align: center;">
                <a href="${process.env.NEXTAUTH_URL}/admin/verification" class="cta-button">
                  Review Request
                </a>
              </div>
            </div>
            
            <div class="footer">
              <p style="margin: 0;">LocalSpark Admin Panel</p>
              <p style="margin: 5px 0 0 0; font-size: 12px;">Automated Notification System</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}