# 🚀 نظام إرسال البريد الإلكتروني الاحترافي
## مجموعة صرح الإتقان المحدودة | 2026

---

## 📋 نظرة عامة

نظام احترافي متكامل لإرسال رسائل التوثيق للمديرين تلقائياً عبر:
- ✅ **Backend API** باستخدام Python + Flask
- ✅ **رسائل HTML احترافية** مع تصميم جذاب
- ✅ **إرسال تلقائي** عبر Hostinger Business Email
- ✅ **إشعارات مباشرة** للمديرين
- ✅ **واجهة سلسة** مع رسائل انتظار ونجاح/فشل

---

## 📦 المتطلبات

### 1. Python 3.7+
```bash
python3 --version
```

### 2. pip (مدير حزم Python)
```bash
pip3 --version
```

### 3. حساب Hostinger Business Email
- البريد الإلكتروني (مثل: admin@yourdomain.com)
- كلمة مرور البريد

---

## ⚙️ الإعداد السريع (3 دقائق)

### الخطوة 1: تثبيت المكتبات المطلوبة

```bash
cd "/home/sarh/سطح المكتب/work/proj/1_cons"
pip3 install -r requirements.txt
```

**المكتبات التي سيتم تثبيتها:**
- `flask` - إطار عمل الويب
- `flask-cors` - للسماح بطلبات CORS
- `python-dotenv` - لإدارة المتغيرات البيئية

---

### الخطوة 2: إعداد البريد الإلكتروني

#### أ) الحصول على بيانات Hostinger:
- **البريد:** البريد الذي أنشأته في Hostinger Business Email
- **كلمة المرور:** كلمة مرور البريد نفسه (ليست كلمة مرور لوحة التحكم)

#### ب) أين تجد البيانات:
1. اذهب إلى: https://hpanel.hostinger.com
2. قسم **Emails** → **Business Email**
3. اختر الحساب الذي تريد استخدامه
4. كلمة المرور هي نفسها التي أنشأتها عند إعداد البريد

💡 **ملاحظة:** إذا نسيت كلمة المرور، يمكنك إعادة تعيينها من لوحة التحكم

---

### الخطوة 3: إنشاء ملف التكوين

```bash
# نسخ الملف النموذجي
cp .env.example .env

# تحرير الملف
nano .env
```

**ضع البيانات التالية في ملف `.env`:**

```env
# 📧 البريد الإلكتروني من Hostinger
EMAIL_USER=admin@yourdomain.com

# 🔑 كلمة مرور البريد
EMAIL_PASSWORD=YourEmailPassword123
```

**مثال حقيقي:**
```env
EMAIL_USER=info@sarhetqan.com
EMAIL_PASSWORD=MyStrongPassword2026!
```

**💡 ملاحظات هامة:**
- استخدم البريد الكامل (مع اسم النطاق)
- كلمة المرور هي كلمة مرور البريد نفسه
- **لا تشارك ملف `.env` مع أحد!**

---

### الخطوة 4: تشغيل السيرفر

#### Terminal 1 - تشغيل backend (Flask):
```bash
cd "/home/sarh/سطح المكتب/work/proj/1_cons"
python3 email_server.py
```

**ستظهر لك رسالة:**
```
============================================================
🚀 نظام إرسال البريد الإلكتروني الاحترافي
مجموعة صرح الإتقان المحدودة | 2026
============================================================

✅ السيرفر يعمل على: http://localhost:5000
📧 البريد المكوّن: admin@yourdomain.com
👥 المديرين: alkurdiabdullah444@gmail.com, carsspace88@gmail.com

📌 نقاط النهاية المتاحة:
   - POST /api/send-approval-email
   - GET  /api/health

============================================================
```

#### Terminal 2 - تشغيل frontend (HTTP Server):
```bash
cd "/home/sarh/سطح المكتب/work/proj/1_cons"
python3 -m http.server 8765
```

**أو استخدم السكريبت التلقائي:**
```bash
./start.sh
```

---

## 🎯 الاستخدام

### 1. افتح متصفحك:
```
http://localhost:8765/document-creator.html
```

### 2. أنشئ وثيقة جديدة:
- أدخل العنوان والوصف
- اكتب محتوى الوثيقة
- استخدم أدوات التنسيق

### 3. احفظ واطلب التوثيق:
1. اضغط زر "💾 حفظ"
2. اختر "📧 طلب التوثيق من المدير"
3. **سيظهر لك:**
   ```
   📧 جاري إرسال البريد الإلكتروني للمديرين...
   ```
4. **عند نجاح الإرسال:**
   ```
   ✅ تم إرسال البريد الإلكتروني بنجاح
   تم إرسال طلب التوثيق للمديرين بنجاح
   ```

### 4. المدير يستلم البريد:
- **من:** admin@yourdomain.com (أو البريد الذي أدخلته)
- **إلى:** alkurdiabdullah444@gmail.com, carsspace88@gmail.com
- **الموضوع:** 🔔 طلب توثيق وثيقة - [عنوان الوثيقة]
- **المحتوى:** بريد HTML احترافي مع:
  - معلومات الوثيقة كاملة
  - ملخص المحتوى (500 حرف)
  - زر "✅ الموافقة أو الرفض"

### 5. الموافقة على الوثيقة:
1. المدير يضغط على زر "الموافقة أو الرفض"
2. يفتح `approval.html?doc=xxxxx`
3. يعاين الوثيقة
4. يضغط "✅ موافقة" أو "❌ رفض"
5. الوثيقة تُحفظ مع حالة التوثيق

---

## 🔍 اختبار النظام

### 1. فحص صحة السيرفر:
```bash
curl http://localhost:5000/api/health
```

**استجابة متوقعة:**
```json
{
  "status": "running",
  "message": "✅ السيرفر يعمل بشكل صحيح",
  "timestamp": "2026-02-15T12:30:45.123456",
  "email_configured": true
}
```

### 2. اختبار إرسال بريد تجريبي:
```bash
curl -X POST http://localhost:5000/api/send-approval-email \
  -H "Content-Type: application/json" \
  -d '{
    "title": "اختبار النظام",
    "description": "وثيقة تجريبية",
    "serialNumber": "TEST-2026-0001",
    "uuid": "12345678-1234-1234-1234-123456789012",
    "date": "15 فبراير 2026",
    "contentExcerpt": "هذا اختبار للنظام...",
    "approvalLink": "http://localhost:8765/approval.html?doc=test"
  }'
```

---

## ❌ حل المشاكل الشائعة

### 1️⃣ خطأ: "Authentication Error" (خطأ المصادقة)

**السبب:**
- بريد إلكتروني أو كلمة مرور خاطئة
- البريد غير مفعّل على Hostinger

**الحل:**
```bash
# افتح ملف .env
nano .env

# تأكد من:
# 1. EMAIL_USER صحيح (البريد الكامل: admin@yourdomain.com)
# 2. EMAIL_PASSWORD صحيح (كلمة مرور البريد نفسه)

# أعد تشغيل السيرفر
python3 email_server.py
```

**للتحقق من كلمة المرور:**
- جرّب تسجيل الدخول على: https://webmail.hostinger.com
- إذا نجح الدخول، الكلمة صحيحة
- إذا فشل، أعد تعيين كلمة المرور من لوحة التحكم

---

### 2️⃣ خطأ: "Connection Refused" أو "Connection Timeout"

**السبب:**
- مشكلة في الاتصال بخادم Hostinger SMTP
- السيرفر غير مشغّل

**الحل:**
```bash
# تأكد من تشغيل السيرفر
python3 email_server.py

# في terminal آخر، تحقق
curl http://localhost:5000/api/health

# إذا استمرت المشكلة، جرّب Port 587 بدلاً من 465
```

**لتغيير Port إلى 587:**
```python
# في ملف email_server.py، غيّر:
with smtplib.SMTP('smtp.hostinger.com', 587) as server:
    server.starttls()
    server.login(EMAIL_USER, EMAIL_PASSWORD)
    server.send_message(msg)
```

---

### 3️⃣ خطأ: "Module not found: flask"

**الحل:**
```bash
pip3 install -r requirements.txt

# أو يدوياً
pip3 install flask flask-cors python-dotenv
```

---

### 4️⃣ البريد لا يصل للمديرين

**تحقق من:**

1. **عناوين البريد صحيحة:**
```python
# في email_server.py، السطر 21
ADMIN_EMAILS = ['alkurdiabdullah444@gmail.com', 'carsspace88@gmail.com']
```

2. **البريد لم يُرسل إلى Spam:**
- اطلب من المديرين فحص مجلد الرسائل غير المرغوبة

3. **حد الإرسال اليومي:**
- Hostinger لديه حد إرسال يومي
- تحقق من عدم تجاوزه

---

### 5️⃣ خطأ: "Relay Access Denied"

**السبب:**
- استخدام بريد غير مطابق لاسم النطاق

**الحل:**
- تأكد أن EMAIL_USER يستخدم نطاقك على Hostinger
- مثال: `admin@yourdomain.com` وليس `admin@gmail.com`

---

## 📊 هيكل الملفات

```
/1_cons/
├── email_server.py          # 🐍 Backend API (Flask)
├── requirements.txt         # 📦 المكتبات المطلوبة
├── .env                     # 🔑 إعدادات البريد (سري!)
├── .env.example             # 📝 نموذج للإعدادات
├── document-creator.html    # 📄 واجهة إنشاء الوثائق
├── approval.html            # ✅ واجهة الموافقة
├── start.sh                 # 🚀 سكريبت تشغيل تلقائي
├── QUICKSTART.md            # ⚡ دليل سريع
├── EMAIL-SETUP.md           # 📖 هذا الملف
├── .gitignore               # 🔒 ملفات محمية
└── ...
```

---

## 🔐 الأمان والخصوصية

### ✅ أفضل الممارسات:

1. **لا تشارك ملف `.env` أبداً**
   ```bash
   # أضف إلى .gitignore
   echo ".env" >> .gitignore
   ```

2. **استخدم كلمة مرور قوية للبريد**
   - على الأقل 12 حرفاً
   - أحرف كبيرة وصغيرة وأرقام ورموز
   - مثال: `MyStr0ng!Pass2026`

3. **راجع Logs بانتظام**
   ```bash
   # سيظهر في Terminal الخاص بـ Flask
   ```

4. **قيّد الوصول للسيرفر**
   ```python
   # في email_server.py، غيّر:
   app.run(host='127.0.0.1', port=5000)  # localhost فقط
   ```

---

## 🌐 إعدادات Hostinger SMTP

### البيانات المستخدمة:

| الإعداد | القيمة |
|---------|--------|
| **SMTP Server** | smtp.hostinger.com |
| **Port (SSL)** | 465 |
| **Port (TLS)** | 587 |
| **Authentication** | نعم |
| **Username** | البريد الكامل (admin@yourdomain.com) |
| **Password** | كلمة مرور البريد |
| **Encryption** | SSL/TLS |

### حدود الإرسال:

- **Basic Plan:** ~100 بريد/ساعة
- **Business Plans:** ~500 بريد/ساعة
- **تحقق من خطتك** في لوحة التحكم

---

## 🚀 التشغيل التلقائي (Systemd)

### 1. إنشاء ملف Service:
```bash
sudo nano /etc/systemd/system/sarh-email.service
```

### 2. أضف المحتوى:
```ini
[Unit]
Description=Sarh Etqan Email Service
After=network.target

[Service]
Type=simple
User=sarh
WorkingDirectory=/home/sarh/سطح المكتب/work/proj/1_cons
ExecStart=/usr/bin/python3 email_server.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### 3. تفعيل:
```bash
sudo systemctl daemon-reload
sudo systemctl enable sarh-email.service
sudo systemctl start sarh-email.service
sudo systemctl status sarh-email.service
```

---

## 🎨 مميزات البريد المُرسل

### 📧 التصميم:
- ✅ خلفية متدرجة (Gradient) جذابة
- ✅ بطاقة بيضاء أنيقة مع ظلال
- ✅ رأس بلون مميز
- ✅ معلومات منظمة في صناديق
- ✅ أيقونات تعبيرية (📄📝🔢🆔📅📋)
- ✅ زر "Call-to-Action" بارز
- ✅ تذييل احترافي

### 📱 متجاوب:
- يعمل على جميع الأجهزة
- Gmail, Outlook, Yahoo Mail
- Mobile & Desktop

### 🔒 آمن:
- لا يتم تخزين كلمات المرور في الكود
- استخدام `.env` فقط
- SMTP SSL/TLS مشفّر

---

## 💡 نصائح إضافية

### لتجنب Spam:

1. **أضف SPF Record لنطاقك:**
   ```
   v=spf1 include:spf.hostinger.com ~all
   ```

2. **أضف DKIM:**
   - يتم تفعيله من لوحة Hostinger تلقائياً

3. **استخدم بريد احترافي:**
   - `noreply@yourdomain.com` بدلاً من `admin@yourdomain.com`

### لزيادة معدل التسليم:

- استخدم نص واضح في Subject
- لا ترسل أكثر من 50 بريد/ساعة
- تجنب الكلمات Spam-like

---

## 🎉 تم الإعداد بنجاح!

إذا رأيت:
```
✅ تم إرسال البريد الإلكتروني بنجاح
```

**مبروك! 🎊 النظام يعمل بشكل احترافي 100%**

---

## 📝 الترخيص

```
© 2026 مجموعة صرح الإتقان المحدودة
جميع الحقوق محفوظة

نظام إدارة الوثائق الذكي
Sarh Al-Etqan Limited Group
```

---

**آخر تحديث:** 15 فبراير 2026  
**الإصدار:** 2.1 (Hostinger Business Email)
