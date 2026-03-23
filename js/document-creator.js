/**
 * ═══════════════════════════════════════════════════════════
 * منشئ الوثائق الرسمية - صرح الإتقان
 * نظام متكامل لإنشاء وتوثيق الوثائق الرسمية
 * ═══════════════════════════════════════════════════════════
 */

(function() {
    'use strict';

    /* ═══ Constants & Global Variables ═══ */
    const STORAGE_KEY = 'sarh_custom_documents_v1';
    const pagesContainer = document.getElementById('pagesContainer');
    let dragSrcBlock = null;

    /* ═══════════════════════════════════════════════════════════
     * دوال الأمان والتحقق (Security & Verification)
     * ═══════════════════════════════════════════════════════════ */

    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    async function generateHash(text) {
        const encoder = new TextEncoder();
        const data = encoder.encode(text);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    function generateSerialNumber() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const timestamp = Date.now().toString(36).toUpperCase();
        return `SARH-${year}${month}-${timestamp}`;
    }

    function formatDateTime() {
        return new Date().toLocaleString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    }

    function generateQRCodeURL(data) {
        const encoded = encodeURIComponent(data);
        return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encoded}`;
    }

    /* ═══════════════════════════════════════════════════════════
     * تهيئة الأحداث (Event Initialization)
     * ═══════════════════════════════════════════════════════════ */

    function initHeaderBindings() {
        const headerBindings = [
            ['propCompany', 'hCompany'],
            ['propCompanyEn', 'hCompanyEn'],
            ['propTax', 'hTax'],
            ['propRole', 'hRole'],
            ['propName', 'hName'],
            ['propFooter', 'docFooter'],
        ];

        headerBindings.forEach(([inputId, targetId]) => {
            const inp = document.getElementById(inputId);
            const tgt = document.getElementById(targetId);
            if (!inp || !tgt) return;

            inp.addEventListener('input', () => {
                document.querySelectorAll(`[id="${targetId}"]`).forEach(el => {
                    el.textContent = inp.value;
                });
            });
        });
    }

    function initPageEvents(page) {
        const dz = page.querySelector('.drop-zone');

        dz.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = dragSrcBlock ? 'move' : 'copy';
            if (!dragSrcBlock) dz.classList.add('drag-over');
        });

        dz.addEventListener('dragleave', (e) => {
            if (!dz.contains(e.relatedTarget)) {
                dz.classList.remove('drag-over');
            }
        });

        dz.addEventListener('drop', (e) => {
            e.preventDefault();
            dz.classList.remove('drag-over');
            const compType = e.dataTransfer.getData('component-type');
            
            if (compType && !dragSrcBlock) {
                const block = createBlock(compType, dz);
                const children = [...dz.querySelectorAll('.block')];
                let inserted = false;

                for (const child of children) {
                    const rect = child.getBoundingClientRect();
                    if (e.clientY < rect.top + rect.height / 2) {
                        dz.insertBefore(block, child);
                        inserted = true;
                        break;
                    }
                }

                if (!inserted) dz.appendChild(block);
            }
        });
    }

    /* ═══════════════════════════════════════════════════════════
     * إنشاء المكونات (Component Creation)
     * ═══════════════════════════════════════════════════════════ */

    function createBlock(type, currentDropZone) {
        const wrap = document.createElement('div');
        wrap.className = 'block';
        wrap.draggable = true;
        wrap.dataset.blockType = type;

        // Handle for dragging
        const handle = document.createElement('span');
        handle.className = 'block-handle';
        handle.textContent = '⠿';
        wrap.appendChild(handle);

        // Delete button
        const del = document.createElement('span');
        del.className = 'block-delete';
        del.textContent = '✕';
        del.addEventListener('click', () => wrap.remove());
        wrap.appendChild(del);

        // Create component based on type
        let inner = createComponentByType(type);
        wrap.appendChild(inner);

        // Add drag events
        setupBlockDragEvents(wrap);

        return wrap;
    }

    function createComponentByType(type) {
        let inner;

        switch (type) {
            case 'title':
                inner = document.createElement('div');
                inner.className = 'blk-title';
                inner.contentEditable = 'true';
                inner.textContent = 'عنوان الوثيقة';
                break;

            case 'subtitle':
                inner = document.createElement('div');
                inner.className = 'blk-subtitle';
                inner.contentEditable = 'true';
                inner.textContent = 'عنوان فرعي';
                break;

            case 'paragraph':
                inner = document.createElement('div');
                inner.className = 'blk-paragraph';
                inner.contentEditable = 'true';
                inner.textContent = 'اكتب نص الفقرة هنا...';
                break;

            case 'divider':
                inner = document.createElement('div');
                inner.className = 'blk-divider';
                break;

            case 'highlight':
                inner = document.createElement('div');
                inner.className = 'blk-box';
                inner.contentEditable = 'true';
                inner.innerHTML = '<strong>تنبيه:</strong> محتوى تمييزي.';
                break;

            case 'meta':
                inner = document.createElement('div');
                inner.className = 'blk-meta-grid';
                inner.innerHTML = '<div contenteditable="true"><strong>الرقم:</strong> ...</div><div contenteditable="true"><strong>التاريخ:</strong> ...</div>';
                break;

            case 'list':
                inner = document.createElement('ul');
                inner.className = 'blk-list';
                inner.contentEditable = 'true';
                inner.innerHTML = '<li>بند جديد</li>';
                break;

            case 'table':
                inner = document.createElement('table');
                inner.className = 'blk-table';
                inner.innerHTML = '<thead><tr><th>م</th><th>البيان</th></tr></thead><tbody><tr><td>1</td><td>...</td></tr></tbody>';
                inner.contentEditable = 'true';
                break;

            case 'signature':
                inner = document.createElement('div');
                inner.className = 'blk-sig';
                inner.innerHTML = '<div contenteditable="true">الاعتماد</div><br><div contenteditable="true">..........</div>';
                break;

            case 'spacer':
                inner = document.createElement('div');
                inner.style.height = '40px';
                break;

            case 'image':
                inner = document.createElement('div');
                inner.className = 'blk-image';
                inner.innerHTML = '<img src="https://via.placeholder.com/400x200/d4af37/ffffff?text=صورة+أو+شعار" alt="صورة"><input type="text" placeholder="أدخل رابط الصورة" onchange="this.previousElementSibling.src=this.value">';
                break;

            case 'quote':
                inner = document.createElement('div');
                inner.className = 'blk-quote';
                inner.contentEditable = 'true';
                inner.textContent = 'اكتب الاقتباس المميز هنا...';
                break;

            case 'alert':
                inner = document.createElement('div');
                inner.className = 'blk-alert';
                inner.contentEditable = 'true';
                inner.innerHTML = '<strong>تنبيه هام:</strong> هذا تنبيه مهم يتطلب الانتباه';
             break;

            case 'note':
                inner = document.createElement('div');
                inner.className = 'blk-note';
                inner.contentEditable = 'true';
                inner.innerHTML = '<strong>ملاحظة:</strong> معلومة إضافية';
                break;

            case 'timeline':
                inner = document.createElement('div');
                inner.className = 'blk-timeline';
                inner.innerHTML = `
                    <div class="blk-timeline-item"><strong contenteditable="true">يناير 2026</strong><div contenteditable="true">وصف الحدث</div></div>
                    <div class="blk-timeline-item"><strong contenteditable="true">مارس 2026</strong><div contenteditable="true">وصف الحدث</div></div>
                `;
                break;

            case 'card':
                inner = document.createElement('div');
                inner.className = 'blk-card';
                inner.innerHTML = '<div class="blk-card-title" contenteditable="true">عنوان البطاقة</div><div contenteditable="true">محتوى البطاقة</div>';
                break;

            case 'columns':
                inner = document.createElement('div');
                inner.className = 'blk-columns';
                inner.innerHTML = '<div class="blk-column" contenteditable="true">العمود الأول</div><div class="blk-column" contenteditable="true">العمود الثاني</div>';
                break;

            default:
                inner = document.createElement('div');
                inner.textContent = type;
        }

        return inner;
    }

    function setupBlockDragEvents(wrap) {
        wrap.addEventListener('dragstart', (e) => {
            dragSrcBlock = wrap;
            wrap.style.opacity = '0.4';
            e.dataTransfer.setData('text/plain', 'reorder');
        });

        wrap.addEventListener('dragend', () => {
            wrap.style.opacity = '1';
            dragSrcBlock = null;
        });

        wrap.addEventListener('dragover', (e) => {
            if (!dragSrcBlock || dragSrcBlock === wrap) return;
            e.preventDefault();
            const rect = wrap.getBoundingClientRect();
            const midY = rect.top + rect.height / 2;
            wrap.style.borderTop = e.clientY < midY ? '2px solid var(--gold)' : '';
            wrap.style.borderBottom = e.clientY >= midY ? '2px solid var(--gold)' : '';
        });

        wrap.addEventListener('dragleave', () => {
            wrap.style.borderTop = '';
            wrap.style.borderBottom = '';
        });

        wrap.addEventListener('drop', (e) => {
            e.preventDefault();
            wrap.style.borderTop = '';
            wrap.style.borderBottom = '';
            
            if (!dragSrcBlock || dragSrcBlock === wrap) return;
            
            const dz = wrap.closest('.drop-zone');
            const rect = wrap.getBoundingClientRect();
            
            if (e.clientY < rect.top + rect.height / 2) {
                dz.insertBefore(dragSrcBlock, wrap);
            } else {
                dz.insertBefore(dragSrcBlock, wrap.nextSibling);
            }
        });
    }

    /* ═══════════════════════════════════════════════════════════
     * Button Event Handlers
     * ═══════════════════════════════════════════════════════════ */

    function initButtonHandlers() {
        // Add Page Button
        document.getElementById('btnAddPage').addEventListener('click', () => {
            const firstPage = document.getElementById('a4Page');
            const newPage = firstPage.cloneNode(true);
            newPage.id = 'page-' + Date.now();
            
            const dz = newPage.querySelector('.drop-zone');
            dz.innerHTML = '';
            dz.classList.remove('drag-over');

            const delPageBtn = document.createElement('button');
            delPageBtn.className = 'no-print';
            delPageBtn.innerHTML = '🗑️ حذف الصفحة';
            delPageBtn.style.cssText = 'position:absolute;left:-140px;top:0;background:#c0392b;color:#fff;border:0;padding:8px 12px;border-radius:6px;cursor:pointer;font-family:sans-serif;font-size:12px;';
            delPageBtn.onclick = () => {
                if (confirm('حذف الصفحة؟')) newPage.remove();
            };
            newPage.appendChild(delPageBtn);

            pagesContainer.appendChild(newPage);
            initPageEvents(newPage);
            newPage.scrollIntoView({ behavior: 'smooth' });
        });

        // Print Button
        document.getElementById('btnPrint').addEventListener('click', () => {
            window.print();
        });

        // Export Word Button
        document.getElementById('btnExportWord').addEventListener('click', exportToWord);

        // Clear Button
        document.getElementById('btnClear').addEventListener('click', () => {
            if (confirm('تنبيه: سيتم مسح جميع المحتويات!')) {
                location.reload();
            }
        });

        // Save Button
        document.getElementById('btnSave').addEventListener('click', handleSave);
    }

    /* ═══════════════════════════════════════════════════════════
     * Export & Save Functions
     * ═══════════════════════════════════════════════════════════ */

    function exportToWord() {
        const title = document.getElementById('propDocTitle').value.trim() || 'وثيقة';
        const pagesClone = pagesContainer.cloneNode(true);
        
        pagesClone.querySelectorAll('.no-print, .block-handle, .block-delete').forEach(el => el.remove());
        pagesClone.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));

        const docContent = `
<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head><meta charset='utf-8'><title>${title}</title>
<style>
body{font-family:'Arial',sans-serif;direction:rtl;text-align:right;}
.a4-page{page-break-after:always;padding:20mm;}
table{border-collapse:collapse;width:100%;}
th,td{border:1px solid #000;padding:8px;}
</style>
</head>
<body>${pagesClone.innerHTML}</body>
</html>`;

        const blob = new Blob(['\ufeff', docContent], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = title.replace(/\s+/g, '-') + '.doc';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    async function handleSave() {
        const title = document.getElementById('propDocTitle').value.trim() || 'وثيقة جديدة';
        const desc = document.getElementById('propDocDesc').value.trim() || '';
        const icon = document.getElementById('propDocIcon').value.trim() || '📄';

        const confirmAuth = confirm(
            '📧 نظام التوثيق الإلكتروني\n\n' +
            'سيتم إرسال طلب التوثيق إلى:\n' +
            '• alkurdiabdullah444@gmail.com\n' +
            '• carsspace88@gmail.com\n\n' +
            'هل تريد المتابعة؟'
        );

        if (!confirmAuth) {
            if (confirm('هل تريد الحفظ بدون توثيق إلكتروني؟')) {
                await saveDocumentDirectly(title, desc, icon);
            }
            return;
        }

        // Generate security info
        const docUUID = generateUUID();
        const serialNumber = generateSerialNumber();
        const createdAt = formatDateTime();
        const timestamp = Date.now();

        // Prepare document
        const documentData = await prepareDocumentForApproval(
            title, desc, icon, docUUID, serialNumber, createdAt, timestamp
        );

        // Save to pending
        const pendingDoc = {
            title,
            description: desc,
            icon,
            timestamp,
            uuid: docUUID,
            serialNumber,
            createdAt,
            html: documentData.html,
            hash: documentData.hash,
            status: 'pending_approval'
        };

        const pendingDocs = JSON.parse(localStorage.getItem('pending_documents') || '[]');
        pendingDocs.push(pendingDoc);
        localStorage.setItem('pending_documents', JSON.stringify(pendingDocs));

        // Send email
        await sendApprovalEmailsViaGmail(pendingDoc);

        alert(
            '✅ تم إرسال البريد بنجاح!\n\n' +
            'الرقم التسلسلي: ' + serialNumber
        );

        window.location.href = 'index.html';
    }

    async function saveDocumentDirectly(title, desc, icon) {
        const docUUID = generateUUID();
        const serialNumber = generateSerialNumber();
        const createdAt = formatDateTime();
        const timestamp = Date.now();

        const pagesClone = pagesContainer.cloneNode(true);
        pagesClone.querySelectorAll('.no-print, .block-handle, .block-delete').forEach(el => el.remove());
        pagesClone.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));
        pagesClone.querySelectorAll('.block').forEach(el => el.style.border = 'none');

        const activeThemeClass = document.body.className;
        const contentForHash = pagesClone.textContent.trim();
        const documentHash = await generateHash(contentForHash + docUUID + timestamp);

        const verificationData = `SARH-DOC\nID:${docUUID}\nSN:${serialNumber}\nHash:${documentHash.substring(0, 16)}...\nDate:${createdAt}`;
        const qrCodeURL = generateQRCodeURL(verificationData);

        // Add watermark and security seal
        pagesClone.querySelectorAll('.a4-page').forEach((page, index) => {
            const watermark = document.createElement('div');
            watermark.className = 'security-watermark no-print';
            watermark.textContent = `صرح الإتقان • ${serialNumber}`;
            page.insertBefore(watermark, page.firstChild);

            if (index === pagesClone.querySelectorAll('.a4-page').length - 1) {
                const seal = createSecuritySeal(serialNumber, docUUID, createdAt, documentHash, qrCodeURL);
                const footer = page.querySelector('.doc-footer');
                if (footer) footer.parentNode.insertBefore(seal, footer);
            }
        });

        const fullHTML = createFullHTML(title, activeThemeClass, pagesClone.innerHTML);
        const dataUri = 'data:text/html;charset=utf-8,' + encodeURIComponent(fullHTML);

        const docs = loadCustomDocs();
        docs.push({
            title,
            description: desc,
            icon,
            link: dataUri,
            createdAt: timestamp,
            securityInfo: {
                uuid: docUUID,
                serialNumber: serialNumber,
                hash: documentHash.substring(0, 32) + '...',
                verified: true
            }
        });

        try {
            saveCustomDocs(docs);
            alert('✅ تم حفظ الوثيقة بنجاح!');
            window.location.href = 'index.html';
        } catch (e) {
            alert('❌ خطأ في الحفظ: ' + e.message);
        }
    }

    function createSecuritySeal(serialNumber, docUUID, createdAt, documentHash, qrCodeURL) {
        const seal = document.createElement('div');
        seal.className = 'security-seal';
        seal.innerHTML = `
            <div class="security-seal-title">🔒 ختم التحقق الرقمي</div>
            <div class="security-info">
                <span>الرقم التسلسلي:</span><span>${serialNumber}</span>
                <span>المعرّف الفريد:</span><span style="font-size:6pt;">${docUUID}</span>
                <span>تاريخ الإصدار:</span><span>${createdAt}</span>
                <span>الجهة المُصدرة:</span><span>مجموعة صرح الإتقان المحدودة</span>
                <span>نظام الإصدار:</span><span>منشئ الوثائق v2.0</span>
            </div>
            <div class="security-hash">
                <strong>البصمة الرقمية (SHA-256):</strong><br>${documentHash}
            </div>
            <div class="qr-code-container">
                <img src="${qrCodeURL}" alt="QR Code" style="width:120px;height:120px;">
                <div style="font-size:7pt;margin-top:4px;color:#666;">امسض للتحقق من الأصالة</div>
            </div>
        `;
        return seal;
    }

    /* ═══════════════════════════════════════════════════════════
     * Email & Approval Functions
     * ═══════════════════════════════════════════════════════════ */

    async function prepareDocumentForApproval(title, desc, icon, docUUID, serialNumber, createdAt, timestamp) {
        const pagesClone = pagesContainer.cloneNode(true);
        pagesClone.querySelectorAll('.no-print, .block-handle, .block-delete').forEach(el => el.remove());
        pagesClone.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));
        pagesClone.querySelectorAll('.block').forEach(el => el.style.border = 'none');

        const activeThemeClass = document.body.className;
        const contentForHash = pagesClone.textContent.trim();
        const documentHash = await generateHash(contentForHash + docUUID + timestamp);

        const verificationData = `SARH-DOC\nID:${docUUID}\nSN:${serialNumber}\nHash:${documentHash.substring(0, 16)}...\nDate:${createdAt}`;
        const qrCodeURL = generateQRCodeURL(verificationData);

        pagesClone.querySelectorAll('.a4-page').forEach((page, index) => {
            const watermark = document.createElement('div');
            watermark.className = 'security-watermark no-print';
            watermark.textContent = `صرح الإتقان • ${serialNumber}`;
            page.insertBefore(watermark, page.firstChild);

            if (index === pagesClone.querySelectorAll('.a4-page').length - 1) {
                const seal = createPendingSeal(serialNumber, docUUID, createdAt, documentHash, qrCodeURL);
                const footer = page.querySelector('.doc-footer');
                if (footer) footer.parentNode.insertBefore(seal, footer);
            }
        });

        const fullHTML = createFullHTML(title, activeThemeClass, pagesClone.innerHTML);

        return {
            html: fullHTML,
            hash: documentHash,
            uuid: docUUID,
            serialNumber: serialNumber
        };
    }

    function createPendingSeal(serialNumber, docUUID, createdAt, documentHash, qrCodeURL) {
        const seal = document.createElement('div');
        seal.className = 'security-seal';
        seal.innerHTML = `
            <div class="security-seal-title">🔒 ختم التحقق الرقمي - قيد التوثيق</div>
            <div class="security-info">
                <span>الرقم التسلسلي:</span><span>${serialNumber}</span>
                <span>المعرّف الفريد:</span><span style="font-size:6pt;">${docUUID}</span>
                <span>تاريخ الإصدار:</span><span>${createdAt}</span>
                <span>الجهة المُصدرة:</span><span>مجموعة صرح الإتقان المحدودة</span>
                <span>الحالة:</span><span style="color:#ff9800;font-weight:bold;">⏳ قيد الانتظار</span>
            </div>
            <div class="security-hash">
                <strong>البصمة الرقمية (SHA-256):</strong><br>${documentHash}
            </div>
            <div class="qr-code-container">
                <img src="${qrCodeURL}" alt="QR Code" style="width:120px;height:120px;">
                <div style="font-size:7pt;margin-top:4px;color:#666;">امسح للتحقق من الأصالة</div>
            </div>
        `;
        return seal;
    }

    function createFullHTML(title, themeClass, content) {
        return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<title>${title}</title>
<link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Reem+Kufi:wght@400;700&display=swap" rel="stylesheet">
<style>
:root{--gold:#b8860b;--deep-gold:#6b5b2e;--antique:#d4af37;--frame:15mm}
.theme-blue{--gold:#2980b9;--deep-gold:#2c3e50;--antique:#3498db}
.theme-maroon{--gold:#800000;--deep-gold:#4a0000;--antique:#a52a2a}
.theme-silver{--gold:#7f8c8d;--deep-gold:#2c3e50;--antique:#95a5a6}
body{font-family:'Amiri',serif;background:#d8d0c0;padding:20px;margin:0}
.no-print-btn{display:block;margin:0 auto 20px;padding:12px 24px;background:var(--gold);color:#fff;border:0;border-radius:6px;cursor:pointer;font-family:'Reem Kufi'}
.a4-page{width:210mm;min-height:297mm;margin:0 auto 30px;background:#fffef9;position:relative;box-shadow:0 0 20px rgba(0,0,0,0.1);page-break-after:always}
.page-frame{position:absolute;top:var(--frame);right:var(--frame);bottom:var(--frame);left:var(--frame);border:3px double var(--gold);pointer-events:none}
.frame-corner{position:absolute;width:10mm;height:10mm;border:3px solid var(--gold);pointer-events:none}
.tr{top:5mm;right:5mm;border-bottom:0;border-left:0}.tl{top:5mm;left:5mm;border-bottom:0;border-right:0}
.br{bottom:5mm;right:5mm;border-top:0;border-left:0}.bl{bottom:5mm;left:5mm;border-top:0;border-right:0}
.page-inner{padding:25mm;display:flex;flex-direction:column;min-height:247mm}
.doc-header{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;border-bottom:2px solid var(--gold);padding-bottom:10px;margin-bottom:20px}
.logo-img{height:50px;width:70px;display:inline-block}.h-center{text-align:center}.h-left{text-align:left;font-size:12px}.h-right{text-align:right;font-size:12px}
.blk-title{text-align:center;font-size:24pt;color:var(--deep-gold);margin-bottom:10px;font-family:'Reem Kufi'}
.blk-subtitle{text-align:center;font-size:18pt;color:var(--deep-gold);margin-bottom:8px;font-family:'Reem Kufi'}
.blk-paragraph{line-height:1.8;text-align:justify;margin-bottom:10px}
.blk-divider{height:2px;background:var(--gold);width:60%;margin:15px auto}
.blk-box{border:2px solid var(--gold);padding:15px;background:rgba(212,175,55,0.05);border-radius:8px}
.blk-table{width:100%;border-collapse:collapse;margin:10px 0}.blk-table th{background:var(--gold);color:#fff;padding:8px}.blk-table td{border:1px solid #ddd;padding:8px;text-align:center}
.doc-footer{margin-top:auto;border-top:1px solid var(--gold);padding-top:10px;text-align:center;font-size:10px;color:var(--deep-gold)}
.security-watermark{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-45deg);font-size:48px;font-family:'Reem Kufi';color:rgba(212,175,55,0.04);font-weight:bold;pointer-events:none;z-index:0;user-select:none;white-space:nowrap}
.security-seal{border:2px double var(--gold);background:linear-gradient(135deg,rgba(255,254,249,0.98),rgba(255,249,237,0.95));padding:10px;border-radius:8px;margin:12px 0;font-size:8pt;line-height:1.5;box-shadow:0 2px 6px rgba(184,134,11,0.15)}
.security-seal-title{font-family:'Reem Kufi';font-weight:bold;color:var(--deep-gold);margin-bottom:6px;text-align:center;font-size:9pt;border-bottom:1px solid var(--gold);padding-bottom:3px}
.security-info{display:grid;grid-template-columns:auto 1fr;gap:3px 6px;font-size:7pt;color:var(--deep-gold)}
.security-info span:nth-child(odd){font-weight:bold}
.security-hash{font-family:'Courier New',monospace;font-size:5.5pt;word-break:break-all;background:rgba(212,175,55,0.06);padding:4px;border-radius:3px;margin-top:4px}
.qr-code-container{text-align:center;margin-top:8px;padding:6px;background:#fff;border-radius:6px;display:inline-block}
@media print{.no-print-btn,.no-print{display:none}body{background:#fff;padding:0}.a4-page{box-shadow:none;margin:0}.security-watermark{font-size:64px;color:rgba(212,175,55,0.03)}}
</style>
</head>
<body class="${themeClass}">
<button class="no-print-btn" onclick="window.print()">🖨️ طباعة النسخة</button>
${content}
</body></html>`;
    }

    async function sendApprovalEmailsViaGmail(documentData) {
        const approvalLink = `${window.location.origin}/approval.html?uuid=${documentData.uuid}`;
        
        // استخراج النص الحقيقي من HTML (بدون CSS و tags)
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = documentData.html;
        
        // إزالة style tags و script tags
        tempDiv.querySelectorAll('style, script, button').forEach(el => el.remove());
        
        // استخراج النص فقط من محتوى الوثيقة
        const dropZones = tempDiv.querySelectorAll('.drop-zone');
        let cleanText = '';
        
        if (dropZones.length > 0) {
            // استخراج النص من المحتوى الفعلي (drop-zone)
            dropZones.forEach(zone => {
                cleanText += zone.textContent.trim() + ' ';
            });
        } else {
            // fallback: استخراج من كل النص
            cleanText = tempDiv.textContent;
        }
        
        // تنظيف المسافات الزائدة
        cleanText = cleanText.replace(/\s+/g, ' ').trim();
        const textContent = cleanText.substring(0, 500);

        const loadingMessage = showLoadingMessage();

        // تحديد عنوان API بناءً على البيئة
        const apiUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? 'http://localhost:5000/api/send-approval-email'  // للتطوير المحلي
            : window.location.pathname.includes('/1_cons/')
                ? '/1_cons/api/send-approval-email'  // على sarh.site/1_cons/
                : '/api/send-approval-email';  // على نطاق مباشر

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: documentData.title,
                    description: documentData.description || 'لا يوجد وصف',
                    serialNumber: documentData.serialNumber,
                    uuid: documentData.uuid,
                    date: documentData.createdAt,
                    contentExcerpt: textContent,
                    approvalLink: approvalLink
                })
            });

            const result = await response.json();
            document.body.removeChild(loadingMessage);

            if (result.success) {
                showSuccessMessage(result.message);
            } else {
                throw new Error(result.message);
            }

        } catch (error) {
            if (loadingMessage.parentNode) {
                document.body.removeChild(loadingMessage);
            }
            showErrorMessage(error.message);
        }
    }

    function showLoadingMessage() {
        const loadingMessage = document.createElement('div');
        loadingMessage.style.cssText = `
            position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
            background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);
            color:white;padding:30px 50px;border-radius:15px;
            box-shadow:0 10px 40px rgba(0,0,0,0.3);z-index:10000;
            text-align:center;font-size:18px;font-weight:600;
        `;
        loadingMessage.innerHTML = `
            <div style="margin-bottom:15px;">
                <div style="width:50px;height:50px;border:5px solid rgba(255,255,255,0.3);
                     border-top-color:white;border-radius:50%;
                     animation:spin 1s linear infinite;margin:0 auto;"></div>
            </div>
            📧 جاري إرسال البريد...
            <style>@keyframes spin{to{transform:rotate(360deg);}}</style>
        `;
        document.body.appendChild(loadingMessage);
        return loadingMessage;
    }

    function showSuccessMessage(message) {
        const successMessage = document.createElement('div');
        successMessage.style.cssText = `
            position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
            background:linear-gradient(135deg,#10b981 0%,#059669 100%);
            color:white;padding:30px 50px;border-radius:15px;
            box-shadow:0 10px 40px rgba(16,185,129,0.4);z-index:10000;
            text-align:center;font-size:18px;font-weight:600;
        `;
        successMessage.innerHTML = `
            ✅ ${message}
            <div style="margin-top:15px;font-size:14px;opacity:0.9;">
                تم إرسال طلب التوثيق بنجاح
            </div>
        `;
        document.body.appendChild(successMessage);
        setTimeout(() => document.body.removeChild(successMessage), 3000);
    }

    function showErrorMessage(error) {
        const errorMessage = document.createElement('div');
        errorMessage.style.cssText = `
            position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
            background:linear-gradient(135deg,#ef4444 0%,#dc2626 100%);
            color:white;padding:30px 50px;border-radius:15px;
            box-shadow:0 10px 40px rgba(239,68,68,0.4);z-index:10000;
            text-align:center;font-size:18px;font-weight:600;max-width:500px;
        `;
        errorMessage.innerHTML = `
            ❌ فشل إرسال البريد
            <div style="margin-top:15px;font-size:14px;opacity:0.9;">${error}</div>
            <div style="margin-top:20px;font-size:13px;opacity:0.8;">
                تأكد من أن السيرفر يعمل على المنفذ 5000
            </div>
            <button onclick="this.parentElement.remove()" style="
                margin-top:20px;background:rgba(255,255,255,0.2);
                border:2px solid white;color:white;padding:10px 30px;
                border-radius:50px;cursor:pointer;font-size:14px;font-weight:600;
            ">إغلاق</button>
        `;
        document.body.appendChild(errorMessage);
    }

    /* ═══════════════════════════════════════════════════════════
     * Storage Functions
     * ═══════════════════════════════════════════════════════════ */

    function loadCustomDocs() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        } catch (e) {
            console.error('Error loading documents:', e);
            return [];
        }
    }

    function saveCustomDocs(items) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }

    /* ═══════════════════════════════════════════════════════════
     * Theme Switcher
     * ═══════════════════════════════════════════════════════════ */

    function initThemeSwitcher() {
        document.querySelectorAll('.theme-swatch').forEach(sw => {
            sw.addEventListener('click', () => {
                document.querySelectorAll('.theme-swatch').forEach(s => s.classList.remove('active'));
                sw.classList.add('active');
                document.body.className = sw.dataset.theme;
            });
        });
    }

    /* ═══════════════════════════════════════════════════════════
     * Component Palette
     * ═══════════════════════════════════════════════════════════ */

    function initComponentPalette() {
        document.querySelectorAll('.component-item[draggable]').forEach((item) => {
            item.addEventListener('dragstart', (e) => {
                dragSrcBlock = null;
                e.dataTransfer.setData('component-type', item.dataset.type);
            });
        });
    }

    /* ═══════════════════════════════════════════════════════════
     * Main Initialization
     * ═══════════════════════════════════════════================================ */

    function init() {
        console.log('🚀 منشئ الوثائق - تهيئة النظام...');
        
        initHeaderBindings();
        initPageEvents(document.getElementById('a4Page'));
        initButtonHandlers();
        initThemeSwitcher();
        initComponentPalette();

        console.log('✅ تم تهيئة النظام بنجاح');
    }

    // Run initialization when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
