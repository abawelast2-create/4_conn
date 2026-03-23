<?php
/**
 * 🚀 نظام إرسال البريد الإلكتروني - PHP Version
 * بديل لـ email_server.py للاستخدام على Shared Hosting
 * مجموعة صرح الإتقان المحدودة | 2026
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// التعامل مع preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// إعدادات البريد الإلكتروني
// ⚠️ في الإنتاج، استخدم ملف .env أو config.php منفصل
$EMAIL_USER = 'abawelast@gmail.com';
$EMAIL_PASSWORD = 'ilkgojrrmoqaqerw';  // App Password من Google
$ADMIN_EMAILS = ['alkurdiabdullah444@gmail.com', 'carsspace88@gmail.com'];

// عنوان السيرفر (غيّره إلى نطاقك)
$SERVER_URL = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' 
    ? 'https://' . $_SERVER['HTTP_HOST'] 
    : 'http://' . $_SERVER['HTTP_HOST'];

/**
 * تنظيف النص من HTML و CSS
 */
function clean_text($text) {
    if (empty($text)) {
        return 'لا يوجد محتوى';
    }
    
    // إزالة وسوم HTML
    $text = strip_tags($text);
    
    // إزالة قواعد CSS (أي شيء بين { و })
    $text = preg_replace('/\{[^}]*\}/', '', $text);
    
    // إزالة أسماء الوسوم المتبقية
    $text = preg_replace('/<[^>]*>/', '', $text);
    
    // تنظيف المسافات الزائدة
    $text = preg_replace('/\s+/', ' ', $text);
    $text = trim($text);
    
    if (strlen($text) < 10) {
        return 'لا يوجد محتوى نصي';
    }
    
    return $text;
}

/**
 * إرسال بريد الموافقة
 */
function send_approval_email($document_data) {
    global $EMAIL_USER, $EMAIL_PASSWORD, $ADMIN_EMAILS, $SERVER_URL;
    
    // تنظيف المحتوى
    $clean_excerpt = clean_text($document_data['contentExcerpt'] ?? '');
    
    $title = htmlspecialchars($document_data['title'] ?? 'غير محدد', ENT_QUOTES, 'UTF-8');
    $description = htmlspecialchars($document_data['description'] ?? 'غير محدد', ENT_QUOTES, 'UTF-8');
    $serial = htmlspecialchars($document_data['serialNumber'] ?? 'غير محدد', ENT_QUOTES, 'UTF-8');
    $uuid = htmlspecialchars($document_data['uuid'] ?? 'غير محدد', ENT_QUOTES, 'UTF-8');
    $date = htmlspecialchars($document_data['date'] ?? 'غير محدد', ENT_QUOTES, 'UTF-8');
    
    $approve_link = $SERVER_URL . '/quick-action.html?uuid=' . urlencode($uuid) . '&action=approve';
    $reject_link = $SERVER_URL . '/quick-action.html?uuid=' . urlencode($uuid) . '&action=reject';
    
    // محتوى HTML
    $html_content = <<<HTML
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            margin: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        }
        .header {
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .content {
            padding: 30px;
        }
        .document-info {
            background: #f8f9fa;
            border-right: 4px solid #667eea;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
        }
        .info-row {
            display: flex;
            padding: 10px 0;
            border-bottom: 1px solid #e9ecef;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .info-label {
            font-weight: 600;
            color: #495057;
            min-width: 120px;
        }
        .info-value {
            color: #212529;
        }
        .excerpt {
            background: #fff3cd;
            border-right: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 8px;
            font-size: 14px;
            color: #856404;
            max-height: 150px;
            overflow-y: auto;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #6c757d;
            font-size: 12px;
            border-top: 1px solid #e9ecef;
        }
        .icon {
            font-size: 16px;
            margin-left: 5px;
        }
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
                    <span class="info-value">$title</span>
                </div>
                <div class="info-row">
                    <span class="info-label"><span class="icon">📝</span> الوصف:</span>
                    <span class="info-value">$description</span>
                </div>
                <div class="info-row">
                    <span class="info-label"><span class="icon">🔢</span> الرقم التسلسلي:</span>
                    <span class="info-value">$serial</span>
                </div>
                <div class="info-row">
                    <span class="info-label"><span class="icon">🆔</span> المعرّف:</span>
                    <span class="info-value" style="font-size: 12px; font-family: monospace;">$uuid</span>
                </div>
                <div class="info-row">
                    <span class="info-label"><span class="icon">📅</span> التاريخ:</span>
                    <span class="info-value">$date</span>
                </div>
            </div>
            
            <h3 style="color: #495057; margin-top: 25px;">📋 ملخص المحتوى:</h3>
            <div class="excerpt">
                {$clean_excerpt}...
            </div>
            
            <div style="text-align: center; margin-top: 30px; display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                <a href="$approve_link" 
                   style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
                          color: white !important; padding: 15px 40px; text-decoration: none; 
                          border-radius: 50px; font-weight: 600; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
                          transition: transform 0.2s;">
                    ✅ موافقة
                </a>
                <a href="$reject_link" 
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
            <p style="margin: 5px 0;">نظام إدارة الوثائق الذكي | 2026</p>
            <p style="margin: 5px 0; font-size: 11px; color: #adb5bd;">
                هذه رسالة تلقائية، الرجاء عدم الرد عليها
            </p>
        </div>
    </div>
</body>
</html>
HTML;

    // استخدام PHPMailer أو mail() function
    // هنا مثال باستخدام mail() البسيطة:
    
    $to = implode(', ', $ADMIN_EMAILS);
    $subject = "🔔 طلب توثيق وثيقة - $title";
    
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= "From: $EMAIL_USER" . "\r\n";
    
    // محاولة الإرسال
    $success = mail($to, $subject, $html_content, $headers);
    
    if ($success) {
        return ['success' => true, 'message' => '✅ تم إرسال البريد الإلكتروني بنجاح'];
    } else {
        return ['success' => false, 'message' => '❌ فشل إرسال البريد الإلكتروني'];
    }
}

// معالجة الطلبات
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// GET /api/health
if ($method === 'GET' && strpos($path, '/api/health') !== false) {
    echo json_encode([
        'status' => 'running',
        'message' => '✅ السيرفر يعمل بشكل صحيح',
        'email_configured' => true,
        'timestamp' => date('Y-m-d\TH:i:s')
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

// POST /api/send-approval-email
if ($method === 'POST' && strpos($path, '/api/send-approval-email') !== false) {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    if (!$data) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => '❌ بيانات غير صالحة'
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }
    
    $result = send_approval_email($data);
    
    http_response_code($result['success'] ? 200 : 500);
    echo json_encode($result, JSON_UNESCAPED_UNICODE);
    exit();
}

// الصفحة الرئيسية
if ($method === 'GET' && $path === '/') {
    ?>
    <!DOCTYPE html>
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
            <h1>🚀 نظام إرسال البريد الإلكتروني - PHP</h1>
            <p>نظام صرح الإتقان الذكي</p>
            <div class="status">
                <p>✅ السيرفر يعمل بشكل صحيح</p>
                <p style="font-size: 12px; opacity: 0.8;">API متاح على: <strong>/api/send-approval-email</strong></p>
            </div>
        </div>
    </body>
    </html>
    <?php
    exit();
}

// Route غير موجود
http_response_code(404);
echo json_encode([
    'success' => false,
    'message' => '❌ الصفحة غير موجودة'
], JSON_UNESCAPED_UNICODE);
