/**
 * إعدادات البريد الإلكتروني - EmailJS
 * 
 * للحصول على المفاتيح:
 * 1. سجل في https://www.emailjs.com/
 * 2. أنشئ Email Service
 * 3. أنشئ Email Template
 * 4. احصل على Public Key من account settings
 * 5. ضع القيم هنا
 */

const EMAIL_CONFIG = {
    // Public Key من EmailJS
    publicKey: 'YOUR_PUBLIC_KEY_HERE',
    
    // Service ID من EmailJS
    serviceId: 'service_4rqzf4j',
    
    // Template ID للتوثيق
    templateId: 'YOUR_TEMPLATE_ID',
    
    // البريد الإلكتروني للمدير الأول
    adminEmail1: 'alkurdiabdullah444@gmail.com',
    
    // البريد الإلكتروني للمدير الثاني
    adminEmail2: 'carsspace88@gmail.com',
    
    // رابط صفحة الموافقة (سيتم إنشاؤه)
    approvalUrl: window.location.origin + '/approval.html'
};

// التحقق من تكوين الإعدادات
function isEmailConfigured() {
    return EMAIL_CONFIG.publicKey !== 'YOUR_PUBLIC_KEY_HERE' &&
           EMAIL_CONFIG.serviceId !== 'YOUR_SERVICE_ID' &&
           EMAIL_CONFIG.templateId !== 'YOUR_TEMPLATE_ID';
}

/**
 * Template Parameters للبريد:
 * {
 *    to_email: string,
 *    admin_name: string,
 *    document_title: string,
 *    document_desc: string,
 *    serial_number: string,
 *    uuid: string,
 *    created_date: string,
 *    approval_link: string,
 *    document_content: string (محتوى نصي مختصر 2000 حرف)
 * }
 */
