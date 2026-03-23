#!/bin/bash
# 🚀 سكريبت تشغيل نظام صرح الإتقان الاحترافي
# مجموعة صرح الإتقان المحدودة | 2026

clear
echo "============================================================"
echo "🚀 نظام إدارة الوثائق الذكي"
echo "مجموعة صرح الإتقان المحدودة | 2026"
echo "============================================================"
echo ""

# التحقق من وجود ملف .env
if [ ! -f .env ]; then
    echo "❌ خطأ: ملف .env غير موجود!"
    echo ""
    echo "الرجاء إنشاء ملف .env بالخطوات التالية:"
    echo "1. cp .env.example .env"
    echo "2. nano .env"
    echo "3. أدخل بياناتك (EMAIL_USER و EMAIL_PASSWORD)"
    echo ""
    exit 1
fi

# التحقق من تثبيت المكتبات
echo "📦 التحقق من المكتبات المطلوبة..."
if ! python3 -c "import flask" 2>/dev/null; then
    echo "⚠️  المكتبات غير مثبتة. جاري التثبيت..."
    pip3 install -r requirements.txt
    echo "✅ تم تثبيت المكتبات بنجاح!"
else
    echo "✅ المكتبات مثبتة"
fi

echo ""
echo "============================================================"
echo "🎯 تشغيل السيرفرات..."
echo "============================================================"
echo ""

# تشغيل Flask في الخلفية
echo "🐍 تشغيل Backend (Flask) على المنفذ 5000..."
python3 email_server.py &
FLASK_PID=$!

# الانتظار قليلاً للتأكد من تشغيل Flask
sleep 2

# تشغيل HTTP Server في الخلفية
echo "🌐 تشغيل Frontend (HTTP) على المنفذ 8765..."
python3 -m http.server 8765 &
HTTP_PID=$!

echo ""
echo "============================================================"
echo "✅ النظام يعمل بنجاح!"
echo "============================================================"
echo ""
echo "📌 الروابط:"
echo "   • Frontend:  http://localhost:8765"
echo "   • Backend:   http://localhost:5000"
echo "   • الوثائق:    http://localhost:8765/document-creator.html"
echo ""
echo "📌 للتحقق من الحالة:"
echo "   curl http://localhost:5000/api/health"
echo ""
echo "⚠️  للإيقاف: اضغط Ctrl+C"
echo "============================================================"
echo ""

# دالة لتنظيف العمليات عند الخروج
cleanup() {
    echo ""
    echo "⏹️  إيقاف السيرفرات..."
    kill $FLASK_PID 2>/dev/null
    kill $HTTP_PID 2>/dev/null
    echo "✅ تم الإيقاف بنجاح!"
    exit 0
}

# التقاط إشارة الإيقاف (Ctrl+C)
trap cleanup INT TERM

# الانتظار للأبد (حتى يتم الإيقاف يدوياً)
wait
