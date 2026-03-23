<?php
/**
 * ملف اختبار وتشخيص البريد الإلكتروني
 * استخدمه لمعرفة المشكلة في إرسال البريد
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$action = $_GET['action'] ?? 'info';

// معلومات البريد
$EMAIL_USER = 'abawelast@gmail.com';
$EMAIL_PASSWORD = 'ilkgojrrmoqaqerw';
$ADMIN_EMAILS = ['alkurdiabdullah444@gmail.com', 'carsspace88@gmail.com'];

// 1. فحص إعدادات PHP
if ($action === 'check_php') {
    $info = [];
    $info['PHP Version'] = phpversion();
    $info['mail() enabled'] = function_exists('mail') ? '✅ نعم' : '❌ لا';
    $info['sendmail_path'] = ini_get('sendmail_path') ?: '❌ غير مُعرّف';
    $info['SMTP'] = ini_get('SMTP') ?: 'localhost';
    $info['smtp_port'] = ini_get('smtp_port') ?: '25';
    $info['openssl'] = extension_loaded('openssl') ? '✅ مُفعّل' : '❌ غير مُفعّل';
    $info['allow_url_fopen'] = ini_get('allow_url_fopen') ? '✅ مُفعّل' : '❌ غير مُفعّل';
    
    $message = "📊 معلومات PHP:\n\n";
    foreach ($info as $key => $value) {
        $message .= "$key: $value\n";
    }
    
    echo json_encode([
        'success' => true,
        'message' => $message,
        'data' => $info
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

// 2. اختبار mail() البسيطة
if ($action === 'test_mail') {
    $to = $_GET['email'] ?? $ADMIN_EMAILS[0];
    $subject = '🧪 اختبار mail() - صرح الإتقان';
    $message = 'السلام عليكم،\n\nهذا بريد تجريبي من mail() function.\n\nإذا وصلك هذا البريد، فإن mail() تعمل بشكل صحيح.';
    $headers = "From: $EMAIL_USER\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    
    $result = @mail($to, $subject, $message, $headers);
    
    if ($result) {
        echo json_encode([
            'success' => true,
            'message' => "✅ تم إرسال البريد باستخدام mail() إلى: $to\n\nتحقق من صندوق الوارد أو البريد المزعج."
        ], JSON_UNESCAPED_UNICODE);
    } else {
        echo json_encode([
            'success' => false,
            'message' => "❌ فشل إرسال البريد باستخدام mail()\n\nالأسباب المحتملة:\n1. mail() معطلة على الاستضافة\n2. إعدادات SMTP غير صحيحة\n3. البريد محظور من firewall\n\nالحل: استخدم PHPMailer مع Gmail SMTP"
        ], JSON_UNESCAPED_UNICODE);
    }
    exit();
}

// 3. اختبار Gmail SMTP (يحتاج PHPMailer أو fsockopen)
if ($action === 'test_smtp') {
    // محاولة الاتصال بـ Gmail SMTP
    $smtp_host = 'smtp.gmail.com';
    $smtp_port = 587; // أو 465 لـ SSL
    
    // تجربة الاتصال
    $errno = 0;
    $errstr = '';
    
    // تجربة TLS (587)
    $connection = @fsockopen($smtp_host, $smtp_port, $errno, $errstr, 10);
    
    if ($connection) {
        fclose($connection);
        
        // محاولة إرسال بريد فعلي باستخدام stream
        $sent = send_via_smtp_stream($EMAIL_USER, $EMAIL_PASSWORD, $ADMIN_EMAILS[0]);
        
        if ($sent) {
            echo json_encode([
                'success' => true,
                'message' => "✅ تم الاتصال بـ Gmail SMTP بنجاح!\n\nSMTP Host: $smtp_host:$smtp_port\n\nتم إرسال بريد تجريبي.\nتحقق من: {$ADMIN_EMAILS[0]}"
            ], JSON_UNESCAPED_UNICODE);
        } else {
            echo json_encode([
                'success' => false,
                'message' => "⚠️ الاتصال بـ SMTP ناجح لكن الإرسال فشل.\n\nقد يكون:\n1. App Password غير صحيح\n2. Less Secure Apps معطلة\n3. حساب Gmail محظور\n\nتحقق من إعدادات Gmail."
            ], JSON_UNESCAPED_UNICODE);
        }
    } else {
        // تجربة SSL (465)
        $connection_ssl = @fsockopen('ssl://' . $smtp_host, 465, $errno, $errstr, 10);
        
        if ($connection_ssl) {
            fclose($connection_ssl);
            echo json_encode([
                'success' => true,
                'message' => "✅ يمكن الاتصال بـ Gmail SMTP عبر SSL (port 465)\n\nلكن يُفضّل استخدام PHPMailer للإرسال الفعلي."
            ], JSON_UNESCAPED_UNICODE);
        } else {
            echo json_encode([
                'success' => false,
                'message' => "❌ فشل الاتصال بـ Gmail SMTP\n\nخطأ: $errstr (رقم: $errno)\n\nالأسباب المحتملة:\n1. منفذ SMTP مغلق من Hostinger\n2. Firewall يحظر الاتصال\n3. fsockopen() معطلة\n\nالحل: استخدم PHPMailer أو اتصل بدعم Hostinger"
            ], JSON_UNESCAPED_UNICODE);
        }
    }
    exit();
}

// دالة مساعدة لإرسال عبر SMTP stream
function send_via_smtp_stream($from, $password, $to) {
    try {
        $smtp = fsockopen('ssl://smtp.gmail.com', 465, $errno, $errstr, 30);
        if (!$smtp) return false;
        
        // قراءة الترحيب
        fgets($smtp);
        
        // EHLO
        fputs($smtp, "EHLO localhost\r\n");
        while ($line = fgets($smtp)) {
            if (strlen($line) <= 3 || $line[3] == ' ') break;
        }
        
        // AUTH LOGIN
        fputs($smtp, "AUTH LOGIN\r\n");
        fgets($smtp);
        fputs($smtp, base64_encode($from) . "\r\n");
        fgets($smtp);
        fputs($smtp, base64_encode($password) . "\r\n");
        $auth_response = fgets($smtp);
        
        if (strpos($auth_response, '235') === false) {
            fclose($smtp);
            return false;
        }
        
        // MAIL FROM
        fputs($smtp, "MAIL FROM: <$from>\r\n");
        fgets($smtp);
        
        // RCPT TO
        fputs($smtp, "RCPT TO: <$to>\r\n");
        fgets($smtp);
        
        // DATA
        fputs($smtp, "DATA\r\n");
        fgets($smtp);
        
        // Message
        $message = "From: $from\r\n";
        $message .= "To: $to\r\n";
        $message .= "Subject: =?UTF-8?B?" . base64_encode("اختبار SMTP - صرح الإتقان") . "?=\r\n";
        $message .= "Content-Type: text/plain; charset=UTF-8\r\n";
        $message .= "\r\n";
        $message .= "السلام عليكم،\n\nهذا بريد تجريبي من Gmail SMTP.\n\nإذا وصلك، فإن SMTP يعمل بنجاح!";
        $message .= "\r\n.\r\n";
        
        fputs($smtp, $message);
        $data_response = fgets($smtp);
        
        // QUIT
        fputs($smtp, "QUIT\r\n");
        fclose($smtp);
        
        return strpos($data_response, '250') !== false;
    } catch (Exception $e) {
        return false;
    }
}

// الصفحة الرئيسية
echo json_encode([
    'success' => true,
    'message' => 'أداة اختبار البريد الإلكتروني',
    'actions' => [
        'check_php' => 'فحص إعدادات PHP',
        'test_mail' => 'اختبار mail() البسيطة',
        'test_smtp' => 'اختبار Gmail SMTP'
    ]
], JSON_UNESCAPED_UNICODE);
