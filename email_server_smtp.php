<?php
/**
 * 🚀 نظام إرسال البريد الإلكتروني - النسخة المحسّنة
 * يستخدم SMTP مباشرة عبر fsockopen (لا يحتاج PHPMailer)
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
$EMAIL_USER = 'abawelast@gmail.com';
$EMAIL_PASSWORD = 'ilkgojrrmoqaqerw';  // App Password من Google
$ADMIN_EMAILS = ['alkurdiabdullah444@gmail.com', 'carsspace88@gmail.com'];

// عنوان السيرفر
$SERVER_URL = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' 
    ? 'https://' . $_SERVER['HTTP_HOST'] 
    : 'http://' . $_SERVER['HTTP_HOST'];

/**
 * إرسال بريد عبر Gmail SMTP
 */
function send_gmail_smtp($from, $password, $to_array, $subject, $html_body) {
    try {
        // الاتصال بـ Gmail SMTP عبر SSL
        $smtp = @fsockopen('ssl://smtp.gmail.com', 465, $errno, $errstr, 30);
        
        if (!$smtp) {
            return [
                'success' => false, 
                'message' => "❌ فشل الاتصال بـ Gmail SMTP: $errstr ($errno)"
            ];
        }

        // قراءة الترحيب
        $response = fgets($smtp, 515);
        if (strpos($response, '220') === false) {
            fclose($smtp);
            return ['success' => false, 'message' => '❌ خطأ في الترحيب من SMTP'];
        }

        // EHLO
        fputs($smtp, "EHLO " . $_SERVER['HTTP_HOST'] . "\r\n");
        $response = '';
        while ($line = fgets($smtp, 515)) {
            $response .= $line;
            if ($line[3] == ' ') break;
        }

        // AUTH LOGIN
        fputs($smtp, "AUTH LOGIN\r\n");
        fgets($smtp, 515);

        // Username
        fputs($smtp, base64_encode($from) . "\r\n");
        fgets($smtp, 515);

        // Password
        fputs($smtp, base64_encode($password) . "\r\n");
        $auth = fgets($smtp, 515);
        
        if (strpos($auth, '235') === false) {
            fclose($smtp);
            return ['success' => false, 'message' => '❌ فشل المصادقة مع Gmail. تحقق من App Password'];
        }

        // MAIL FROM
        fputs($smtp, "MAIL FROM: <$from>\r\n");
        fgets($smtp, 515);

        // RCPT TO
        foreach ($to_array as $to) {
            fputs($smtp, "RCPT TO: <$to>\r\n");
            fgets($smtp, 515);
        }

        // DATA
        fputs($smtp, "DATA\r\n");
        fgets($smtp, 515);

        // Headers
        $headers = "From: $from\r\n";
        $headers .= "To: " . implode(', ', $to_array) . "\r\n";
        $headers .= "Subject: =?UTF-8?B?" . base64_encode($subject) . "?=\r\n";
        $headers .= "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
        $headers .= "Content-Transfer-Encoding: quoted-printable\r\n";
        $headers .= "\r\n";

        // Body (quoted-printable encoding للعربي)
        $body = quoted_printable_encode($html_body);

        // إرسال الرسالة
        fputs($smtp, $headers . $body . "\r\n.\r\n");
        $data_response = fgets($smtp, 515);

        // QUIT
        fputs($smtp, "QUIT\r\n");
        fclose($smtp);

        if (strpos($data_response, '250') !== false) {
            return [
                'success' => true, 
                'message' => '✅ تم إرسال البريد الإلكتروني بنجاح'
            ];
        } else {
            return [
                'success' => false, 
                'message' => "❌ فشل إرسال البريد: $data_response"
            ];
        }

    } catch (Exception $e) {
        return [
            'success' => false, 
            'message' => '❌ خطأ: ' . $e->getMessage()
        ];
    }
}

/**
 * Quoted-printable encoding
 */
function quoted_printable_encode($str) {
    return quoted_printable_encode_custom($str);
}

function quoted_printable_encode_custom($input) {
    $lines = preg_split("/\r?\n/", $input);
    $encoded = [];
    
    foreach ($lines as $line) {
        $line_encoded = '';
        $length = strlen($line);
        
        for ($i = 0; $i < $length; $i++) {
            $char = $line[$i];
            $ord = ord($char);
            
            // أحرف يجب تشفيرها
            if ($ord < 33 || $ord > 126 || $char == '=') {
                $line_encoded .= '=' . strtoupper(sprintf('%02X', $ord));
            } else {
                $line_encoded .= $char;
            }
            
            // كسر السطر عند 76 حرف
            if (strlen($line_encoded) > 73) {
                $encoded[] = $line_encoded . '=';
                $line_encoded = '';
            }
        }
        
        if ($line_encoded) {
            $encoded[] = $line_encoded;
        }
    }
    
    return implode("\r\n", $encoded);
}

/**
 * تنظيف النص من HTML و CSS
 */
function clean_text($text) {
    if (empty($text)) {
        return 'لا يوجد محتوى';
    }
    
    $text = strip_tags($text);
    $text = preg_replace('/\{[^}]*\}/', '', $text);
    $text = preg_replace('/<[^>]*>/', '', $text);
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
    
    $clean_excerpt = clean_text($document_data['contentExcerpt'] ?? '');
    
    $title = htmlspecialchars($document_data['title'] ?? 'غير محدد', ENT_QUOTES, 'UTF-8');
    $description = htmlspecialchars($document_data['description'] ?? 'غير محدد', ENT_QUOTES, 'UTF-8');
    $serial = htmlspecialchars($document_data['serialNumber'] ?? 'غير محدد', ENT_QUOTES, 'UTF-8');
    $uuid = htmlspecialchars($document_data['uuid'] ?? 'غير محدد', ENT_QUOTES, 'UTF-8');
    $date = htmlspecialchars($document_data['date'] ?? 'غير محدد', ENT_QUOTES, 'UTF-8');
    
    $approve_link = $SERVER_URL . '/quick-action.html?uuid=' . urlencode($uuid) . '&action=approve';
    $reject_link = $SERVER_URL . '/quick-action.html?uuid=' . urlencode($uuid) . '&action=reject';
    
    $html_content = <<<HTML
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"><style>
body{font-family:'Segoe UI',Tahoma,sans-serif;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:20px;margin:0}
.container{max-width:600px;margin:0 auto;background:white;border-radius:15px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.2)}
.header{background:linear-gradient(135deg,#1e3c72 0%,#2a5298 100%);color:white;padding:30px;text-align:center}
.header h1{margin:0;font-size:24px}
.content{padding:30px}
.document-info{background:#f8f9fa;border-right:4px solid #667eea;padding:20px;margin:20px 0;border-radius:8px}
.info-row{display:flex;padding:10px 0;border-bottom:1px solid #e9ecef}
.info-row:last-child{border-bottom:none}
.info-label{font-weight:600;color:#495057;min-width:120px}
.excerpt{background:#fff3cd;border-right:4px solid #f59e0b;padding:15px;margin:20px 0;border-radius:8px;font-size:14px;color:#856404;max-height:150px;overflow-y:auto}
.footer{background:#f8f9fa;padding:20px;text-align:center;color:#6c757d;font-size:12px;border-top:1px solid #e9ecef}
</style></head>
<body>
<div class="container">
<div class="header">
<h1>🔔 طلب توثيق وثيقة جديدة</h1>
<p style="margin:10px 0 0 0;opacity:0.9">نظام صرح الإتقان الذكي</p>
</div>
<div class="content">
<p>السلام عليكم ورحمة الله وبركاته،</p>
<p>تم استلام طلب توثيق وثيقة جديدة في النظام. الرجاء مراجعة التفاصيل أدناه:</p>
<div class="document-info">
<div class="info-row"><span class="info-label">📄 العنوان:</span><span>$title</span></div>
<div class="info-row"><span class="info-label">📝 الوصف:</span><span>$description</span></div>
<div class="info-row"><span class="info-label">🔢 الرقم التسلسلي:</span><span>$serial</span></div>
<div class="info-row"><span class="info-label">🆔 المعرّف:</span><span style="font-size:12px;font-family:monospace">$uuid</span></div>
<div class="info-row"><span class="info-label">📅 التاريخ:</span><span>$date</span></div>
</div>
<h3 style="color:#495057;margin-top:25px">📋 ملخص المحتوى:</h3>
<div class="excerpt">$clean_excerpt...</div>
<div style="text-align:center;margin-top:30px;display:flex;gap:15px;justify-content:center;flex-wrap:wrap">
<a href="$approve_link" style="display:inline-block;background:linear-gradient(135deg,#10b981 0%,#059669 100%);color:white!important;padding:15px 40px;text-decoration:none;border-radius:50px;font-weight:600;box-shadow:0 4px 15px rgba(16,185,129,0.4)">✅ موافقة</a>
<a href="$reject_link" style="display:inline-block;background:linear-gradient(135deg,#ef4444 0%,#dc2626 100%);color:white!important;padding:15px 40px;text-decoration:none;border-radius:50px;font-weight:600;box-shadow:0 4px 15px rgba(239,68,68,0.4)">❌ رفض</a>
</div>
<p style="margin-top:30px;color:#6c757d;font-size:14px">💡 <strong>ملاحظة:</strong> الرجاء اتخاذ القرار في أقرب وقت ممكن.</p>
</div>
<div class="footer">
<p style="margin:5px 0"><strong>مجموعة صرح الإتقان المحدودة</strong></p>
<p style="margin:5px 0">نظام إدارة الوثائق الذكي | 2026</p>
</div>
</div>
</body>
</html>
HTML;

    $subject = "🔔 طلب توثيق وثيقة - $title";
    
    return send_gmail_smtp($EMAIL_USER, $EMAIL_PASSWORD, $ADMIN_EMAILS, $subject, $html_content);
}

// معالجة الطلبات
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// GET /api/health
if ($method === 'GET' && strpos($path, '/api/health') !== false) {
    echo json_encode([
        'status' => 'running',
        'message' => '✅ السيرفر يعمل بشكل صحيح (SMTP Version)',
        'email_configured' => true,
        'smtp' => 'Gmail SMTP (ssl://smtp.gmail.com:465)',
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
http_response_code(404);
echo json_encode([
    'success' => false,
    'message' => '❌ الصفحة غير موجودة',
    'endpoints' => [
        'GET /api/health' => 'فحص حالة السيرفر',
        'POST /api/send-approval-email' => 'إرسال بريد الموافقة'
    ]
], JSON_UNESCAPED_UNICODE);
