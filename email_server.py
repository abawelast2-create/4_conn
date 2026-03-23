#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🚀 نظام إرسال البريد الإلكتروني الاحترافي
مجموعة صرح الإتقان المحدودة | 2026

Backend API لإرسال رسائل التوثيق للمديرين تلقائياً
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
import os
import re
import socket
from dotenv import load_dotenv

# تحميل المتغيرات البيئية
load_dotenv()

app = Flask(__name__)
CORS(app)  # للسماح بالطلبات من المتصفح

# الحصول على عنوان IP المحلي
def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
        return local_ip
    except:
        return "localhost"

# إعدادات البريد الإلكتروني
EMAIL_USER = os.getenv('EMAIL_USER', 'your-email@gmail.com')
EMAIL_PASSWORD = os.getenv('EMAIL_PASSWORD', 'your-app-password')
ADMIN_EMAILS = ['alkurdiabdullah444@gmail.com', 'carsspace88@gmail.com']

# عنوان السيرفر (يمكن تغييره من ملف .env)
SERVER_IP = get_local_ip()
SERVER_PORT = os.getenv('SERVER_PORT', '8765')
SERVER_URL = os.getenv('SERVER_URL', f'http://{SERVER_IP}:{SERVER_PORT}')


def clean_text(text):
    """
    تنظيف النص من HTML tags والمسافات الزائدة
    
    Args:
        text: النص المراد تنظيفه
    
    Returns:
        str: النص النظيف
    """
    if not text:
        return 'غير متوفر'
    
    # إزالة HTML tags
    text = re.sub(r'<[^>]+>', '', text)
    
    # إزالة CSS rules (أي شيء يبدأ بنقطة أو hash متبوع بأقواس معقوفة)
    text = re.sub(r'[.#][\w-]+\s*\{[^}]*\}', '', text)
    
    # إزالة المسافات الزائدة والأسطر الفارغة
    text = re.sub(r'\s+', ' ', text)
    
    # تنظيف المسافات في البداية والنهاية
    text = text.strip()
    
    # إذا كان النص فارغاً أو قصير جداً
    if len(text) < 10:
        return 'لا يوجد محتوى نصي'
    
    return text


def send_approval_email(document_data):
    """
    إرسال بريد التوثيق للمديرين
    
    Args:
        document_data: بيانات الوثيقة (عنوان، وصف، محتوى، إلخ)
    
    Returns:
        tuple: (success: bool, message: str)
    """
    try:
        # تنظيف المحتوى من HTML و CSS
        clean_excerpt = clean_text(document_data.get('contentExcerpt', ''))
        
        # إنشاء رسالة HTML احترافية
        msg = MIMEMultipart('alternative')
        msg['From'] = EMAIL_USER
        msg['To'] = ', '.join(ADMIN_EMAILS)
        msg['Subject'] = f"🔔 طلب توثيق وثيقة - {document_data.get('title', 'بدون عنوان')}"
        
        # محتوى النص البسيط (fallback)
        text_content = f"""
السلام عليكم ورحمة الله وبركاته،

طلب توثيق وثيقة جديدة في نظام صرح الإتقان:

📄 العنوان: {document_data.get('title', 'غير محدد')}
📝 الوصف: {document_data.get('description', 'غير محدد')}
🔢 الرقم التسلسلي: {document_data.get('serialNumber', 'غير محدد')}
🆔 المعرّف الفريد: {document_data.get('uuid', 'غير محدد')}
📅 التاريخ: {document_data.get('date', 'غير محدد')}

📋 محتوى الوثيقة (ملخص):
{clean_excerpt[:500]}...

🔗 للموافقة أو الرفض، افتح الرابط التالي:
{document_data.get('approvalLink', 'http://localhost:8765/approval.html')}

مع تحيات،
نظام صرح الإتقان الذكي
مجموعة صرح الإتقان المحدودة
"""
        
        # محتوى HTML احترافي
        html_content = f"""
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <style>
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            margin: 0;
        }}
        .container {{
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        }}
        .header {{
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }}
        .header h1 {{
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }}
        .content {{
            padding: 30px;
        }}
        .document-info {{
            background: #f8f9fa;
            border-right: 4px solid #667eea;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
        }}
        .info-row {{
            display: flex;
            padding: 10px 0;
            border-bottom: 1px solid #e9ecef;
        }}
        .info-row:last-child {{
            border-bottom: none;
        }}
        .info-label {{
            font-weight: 600;
            color: #495057;
            min-width: 120px;
        }}
        .info-value {{
            color: #212529;
        }}
        .excerpt {{
            background: #fff3cd;
            border-right: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 8px;
            font-size: 14px;
            color: #856404;
            max-height: 150px;
            overflow-y: auto;
        }}
        .cta-button {{
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white !important;
            padding: 15px 40px;
            text-decoration: none;
            border-radius: 50px;
            font-weight: 600;
            margin: 20px 0;
            text-align: center;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            transition: transform 0.2s;
        }}
        .cta-button:hover {{
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }}
        .footer {{
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #6c757d;
            font-size: 12px;
            border-top: 1px solid #e9ecef;
        }}
        .icon {{
            font-size: 16px;
            margin-left: 5px;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔔 طلب توثيق وثيقة جديدة</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">نظام صرح الإتقان الذكي</p>
        </div>
        
        <div class="content">
            <p>السلام عليكم ورحمة الله وبركاته،</p>
            <p>تم استلام طلب توثيق وثيقة جديدة في النظام. الرجاء مراجعة التفاصيل أدناه:</p>
            
            <div class="document-info">
                <div class="info-row">
                    <span class="info-label"><span class="icon">📄</span> العنوان:</span>
                    <span class="info-value">{document_data.get('title', 'غير محدد')}</span>
                </div>
                <div class="info-row">
                    <span class="info-label"><span class="icon">📝</span> الوصف:</span>
                    <span class="info-value">{document_data.get('description', 'غير محدد')}</span>
                </div>
                <div class="info-row">
                    <span class="info-label"><span class="icon">🔢</span> الرقم التسلسلي:</span>
                    <span class="info-value">{document_data.get('serialNumber', 'غير محدد')}</span>
                </div>
                <div class="info-row">
                    <span class="info-label"><span class="icon">🆔</span> المعرّف:</span>
                    <span class="info-value" style="font-size: 12px; font-family: monospace;">{document_data.get('uuid', 'غير محدد')}</span>
                </div>
                <div class="info-row">
                    <span class="info-label"><span class="icon">📅</span> التاريخ:</span>
                    <span class="info-value">{document_data.get('date', 'غير محدد')}</span>
                </div>
            </div>
            
            <h3 style="color: #495057; margin-top: 25px;">📋 ملخص المحتوى:</h3>
            <div class="excerpt">
                {clean_excerpt[:500]}...
            </div>
            
            <div style="text-align: center; margin-top: 30px; display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                <a href="{SERVER_URL}/quick-action.html?uuid={document_data.get('uuid')}&action=approve" 
                   style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
                          color: white !important; padding: 15px 40px; text-decoration: none; 
                          border-radius: 50px; font-weight: 600; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
                          transition: transform 0.2s;">
                    ✅ موافقة
                </a>
                <a href="{SERVER_URL}/quick-action.html?uuid={document_data.get('uuid')}&action=reject" 
                   style="display: inline-block; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); 
                          color: white !important; padding: 15px 40px; text-decoration: none; 
                          border-radius: 50px; font-weight: 600; box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
                          transition: transform 0.2s;">
                    ❌ رفض
                </a>
            </div>
            
            <p style="margin-top: 30px; color: #6c757d; font-size: 14px;">
                💡 <strong>ملاحظة:</strong> الرجاء اتخاذ القرار في أقرب وقت ممكن. سيتم تنبيه الموظف بمجرد اتخاذ القرار.
            </p>
        </div>
        
        <div class="footer">
            <p style="margin: 5px 0;"><strong>مجموعة صرح الإتقان المحدودة</strong></p>
            <p style="margin: 5px 0;">نظام إدارة الوثائق الذكي | {datetime.now().strftime('%Y')}</p>
            <p style="margin: 5px 0; font-size: 11px; color: #adb5bd;">
                هذه رسالة تلقائية، الرجاء عدم الرد عليها
            </p>
        </div>
    </div>
</body>
</html>
"""
        
        # إضافة المحتوى
        part1 = MIMEText(text_content, 'plain', 'utf-8')
        part2 = MIMEText(html_content, 'html', 'utf-8')
        msg.attach(part1)
        msg.attach(part2)
        
        # الاتصال بخادم Gmail
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(EMAIL_USER, EMAIL_PASSWORD)
            server.send_message(msg)
        
        return True, "✅ تم إرسال البريد الإلكتروني بنجاح"
        
    except smtplib.SMTPAuthenticationError:
        return False, "❌ خطأ في المصادقة: تحقق من البريد الإلكتروني وكلمة المرور في ملف .env"
    except smtplib.SMTPException as e:
        return False, f"❌ خطأ SMTP: {str(e)} | تأكد من إعدادات Hostinger"
    except Exception as e:
        return False, f"❌ خطأ غير متوقع: {str(e)}"


@app.route('/api/send-approval-email', methods=['POST'])
def api_send_approval_email():
    """
    نقطة نهاية API لإرسال بريد التوثيق
    
    يتوقع JSON في الطلب:
    {
        "title": "عنوان الوثيقة",
        "description": "وصف الوثيقة",
        "serialNumber": "SARH-2026-0001",
        "uuid": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
        "date": "15 فبراير 2026",
        "contentExcerpt": "أول 500 حرف من المحتوى...",
        "approvalLink": "http://localhost:8765/approval.html?doc=xxxxx"
    }
    """
    try:
        # الحصول على البيانات من الطلب
        data = request.get_json()
        
        # التحقق من البيانات المطلوبة
        if not data:
            return jsonify({
                'success': False,
                'message': '❌ لم يتم إرسال بيانات'
            }), 400
        
        if not data.get('title'):
            return jsonify({
                'success': False,
                'message': '❌ العنوان مطلوب'
            }), 400
        
        # إرسال البريد
        success, message = send_approval_email(data)
        
        if success:
            return jsonify({
                'success': True,
                'message': message
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': message
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'❌ خطأ في السيرفر: {str(e)}'
        }), 500


@app.route('/api/health', methods=['GET'])
def health_check():
    """فحص صحة السيرفر"""
    return jsonify({
        'status': 'running',
        'message': '✅ السيرفر يعمل بشكل صحيح',
        'timestamp': datetime.now().isoformat(),
        'email_configured': EMAIL_USER != 'your-email@gmail.com'
    }), 200


@app.route('/')
def home():
    """الصفحة الرئيسية"""
    return """
    <html dir="rtl">
    <head>
        <meta charset="UTF-8">
        <title>نظام إرسال البريد - صرح الإتقان</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
            }
            .container {
                text-align: center;
                background: rgba(255,255,255,0.1);
                padding: 40px;
                border-radius: 15px;
                backdrop-filter: blur(10px);
            }
            h1 { margin: 0 0 20px 0; }
            .status { 
                background: rgba(255,255,255,0.2);
                padding: 15px;
                border-radius: 8px;
                margin-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚀 نظام إرسال البريد الإلكتروني</h1>
            <p>نظام صرح الإتقان الذكي</p>
            <div class="status">
                <p>✅ السيرفر يعمل بشكل صحيح</p>
                <p style="font-size: 12px; opacity: 0.8;">API متاح على: <strong>/api/send-approval-email</strong></p>
            </div>
        </div>
    </body>
    </html>
    """


if __name__ == '__main__':
    print("=" * 60)
    print("🚀 نظام إرسال البريد الإلكتروني الاحترافي")
    print("مجموعة صرح الإتقان المحدودة | 2026")
    print("=" * 60)
    print(f"\n✅ السيرفر يعمل على: http://localhost:5000")
    print(f"🌐 عنوان الوصول الخارجي: {SERVER_URL}")
    print(f"📧 البريد المكوّن: {EMAIL_USER}")
    print(f"📮 خادم SMTP: smtp.gmail.com:465")
    print(f"👥 المديرين: {', '.join(ADMIN_EMAILS)}")
    print(f"\n📌 نقاط النهاية المتاحة:")
    print(f"   - POST /api/send-approval-email")
    print(f"   - GET  /api/health")
    print(f"\n💡 تأكد من إعداد ملف .env بشكل صحيح!")
    print(f"💡 روابط البريد ستستخدم: {SERVER_URL}")
    print("\n" + "=" * 60)
    
    # تشغيل السيرفر
    app.run(host='0.0.0.0', port=5000, debug=True)
