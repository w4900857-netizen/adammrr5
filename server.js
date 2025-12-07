const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Telegram configuration from environment variables
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Appointment booking server is running' });
});

// Validate environment variables
function validateConfig() {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error('ERROR: Missing required environment variables!');
    console.error('Please set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID');
    return false;
  }
  return true;
}

// Send message to Telegram
async function sendToTelegram(appointmentData) {
  const { fullName, phone, date, time, service, notes } = appointmentData;
  
  const message = `🔔 *حجز موعد جديد*

👤 *الاسم:* ${fullName}
📱 *الهاتف:* ${phone}
📅 *التاريخ:* ${date}
🕐 *الوقت:* ${time}
🔧 *نوع الخدمة:* ${service}
${notes ? `📝 *ملاحظات:* ${notes}` : ''}

✅ تم استلام الحجز بنجاح`;

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  
  try {
    const response = await axios.post(url, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'Markdown'
    });
    
    return response.data;
  } catch (error) {
    console.error('Telegram API Error:', error.response?.data || error.message);
    throw new Error('Failed to send message to Telegram');
  }
}

// Validate appointment data
function validateAppointment(data) {
  const { fullName, phone, date, time, service } = data;
  
  if (!fullName || fullName.trim().length === 0) {
    return { valid: false, error: 'الاسم الكامل مطلوب' };
  }
  
  if (!phone || phone.trim().length === 0) {
    return { valid: false, error: 'رقم الهاتف مطلوب' };
  }
  
  if (!date || date.trim().length === 0) {
    return { valid: false, error: 'تاريخ الموعد مطلوب' };
  }
  
  if (!time || time.trim().length === 0) {
    return { valid: false, error: 'وقت الموعد مطلوب' };
  }
  
  if (!service || service.trim().length === 0) {
    return { valid: false, error: 'نوع الخدمة مطلوب' };
  }
  
  return { valid: true };
}

// Book appointment endpoint
app.post('/api/book', async (req, res) => {
  try {
    // Validate configuration
    if (!validateConfig()) {
      return res.status(500).json({
        success: false,
        message: 'خطأ في إعدادات الخادم. يرجى التواصل مع المسؤول.'
      });
    }
    
    // Validate appointment data
    const validation = validateAppointment(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }
    
    // Send to Telegram
    await sendToTelegram(req.body);
    
    // Log appointment (optional)
    console.log('New appointment booked:', {
      name: req.body.fullName,
      date: req.body.date,
      time: req.body.time,
      service: req.body.service
    });
    
    // Return success
    res.json({
      success: true,
      message: 'تم حجز الموعد بنجاح! سنتواصل معك قريباً.'
    });
    
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء حجز الموعد. يرجى المحاولة مرة أخرى.'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  if (validateConfig()) {
    console.log('✅ Telegram configuration is valid');
  } else {
    console.log('⚠️  WARNING: Telegram configuration is missing!');
  }
});
