# ⚡ خطوة واحدة فقط للتشغيل!

## ✅ تم إعداد البريد: abdulhakim@sarh.io

---

## 📝 الخطوة الأخيرة (30 ثانية):

### 1. أدخل كلمة المرور:
```bash
nano .env
```

**غيّر السطر:**
```env
EMAIL_PASSWORD=ضع_كلمة_المرور_هنا
```

**إلى:**
```env
EMAIL_PASSWORD=كلمة_مرورك_الفعلية
```

**احفظ:** `Ctrl+O` ثم `Enter` ثم `Ctrl+X`

---

### 2. شغّل النظام:
```bash
./start.sh
```

**أو يدوياً:**

**Terminal 1:**
```bash
python3 email_server.py
```

**Terminal 2:**
```bash
python3 -m http.server 8765
```

---

## 🎯 جاهز!

افتح: **http://localhost:8765/document-creator.html**

---

## 📧 المعلومات المستخدمة:

| الإعداد | القيمة |
|---------|--------|
| **البريد الإلكتروني** | abdulhakim@sarh.io |
| **SMTP Server** | smtp.hostinger.com |
| **Port** | 465 (SSL) |
| **المديرين** | alkurdiabdullah444@gmail.com<br>carsspace88@gmail.com |

---

## 🔍 اختبار:

```bash
# فحص السيرفر
curl http://localhost:5000/api/health
```

---

**✨ النظام جاهز 100%! فقط أدخل كلمة المرور وشغّل!**
