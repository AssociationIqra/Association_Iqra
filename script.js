const scriptURL = 'https://script.google.com/macros/s/AKfycbx2XnF-EYqZZrjxABgmIbawMX_uX_WQN8OVFPM0F-r0J1aAo8Ez2QQN4-zT4Noarudrow/exec';
// ✅ تسجيل حساب جديد
document.getElementById('btnRegister')?.addEventListener('click', () => {
  const username = document.getElementById('regUsername').value.trim();
  const password = document.getElementById('regPass').value.trim();
  const regMsg = document.getElementById('regMsg');

  if (!username || !password) {
    regMsg.textContent = 'يرجى إدخال اسم المستخدم وكلمة المرور.';
    regMsg.style.color = 'red';
    return;
  }

  let users = JSON.parse(localStorage.getItem('users')) || [];
  if (users.find(u => u.username === username)) {
    regMsg.textContent = '⚠️ اسم المستخدم موجود مسبقًا.';
    regMsg.style.color = 'red';
    return;
  }

  users.push({ username, password });
  localStorage.setItem('users', JSON.stringify(users));
  regMsg.textContent = '✅ تم إنشاء الحساب! سيتم تحويلك...';
  regMsg.style.color = 'green';
  setTimeout(() => window.location.href = 'index.html', 2000);
});

// ✅ تسجيل الدخول
document.getElementById('btnLogin')?.addEventListener('click', () => {
  const username = document.getElementById('loginUser').value.trim();
  const password = document.getElementById('loginPass').value.trim();
  const loginMsg = document.getElementById('loginMsg');

  let users = JSON.parse(localStorage.getItem('users')) || [];
  const match = users.find(u => u.username === username && u.password === password);

  if (match) {
    localStorage.setItem('loggedIn', 'true');
    window.location.href = 'dashboard.html';
  } else {
    loginMsg.textContent = '❌ اسم المستخدم أو كلمة المرور غير صحيحة.';
    loginMsg.style.color = 'red';
  }
});

// ✅ تأمين صفحة dashboard
if (window.location.href.includes('dashboard')) {
  if (!localStorage.getItem('loggedIn')) {
    window.location.href = 'index.html';
  }
}

// ✅ أسماء الحقول بالعربية
const fieldMap = {
  fname: "الاسم",
  lname: "اللقب",
  dob: "تاريخ الميلاد",
  regNo: "رقم التسجيل",
  regPassStud: "الرقم السري",
  stream: "الشعبة",
  phase1: "مرحلة التسجيل الأولي",
  phase2: "مرحلة تأكيد التسجيل",
  pedDate: "تاريخ التسجيل البيداغوجي",
  socDate: "تاريخ تسجيل الخدمات الجامعية",
  wish: "الرغبة",
  major: "التخصص",
  state: "الولاية",
  payNotes: "حالة الدفع",
  grade: "المعدل"
};

const formEls = Object.keys(fieldMap);

// ✅ تجميع البيانات
function gather() {
  let obj = {};
  formEls.forEach(id => {
    obj[fieldMap[id]] = document.getElementById(id).value;
  });
  return obj;
}

// ✅ تعبئة النموذج
function fill(data) {
  for (const [id, arabic] of Object.entries(fieldMap)) {
    document.getElementById(id).value = data[arabic] || '';
  }
}

// ✅ إرسال البيانات
function postToSheet(payload, action) {
  return fetch(`${scriptURL}?action=${action}`, {
    method: 'POST',
    body: JSON.stringify(payload),
    // ⚠️ حل مؤقت لتجاوز CORS
    headers: { 'Content-Type': 'application/json' }
  }).then(r => r.text());
}


// ✅ معالجات الأزرار (بدون شرط pathname)
window.addEventListener('DOMContentLoaded', () => {
  const msg = document.getElementById('statusMsg');

  document.getElementById('addStud')?.addEventListener('click', () => {
    const regNo = document.getElementById('regNo').value;
    if (!regNo) return msg.innerText = "⚠️ يرجى إدخال رقم التسجيل";

    postToSheet({ "رقم التسجيل": regNo }, 'get').then(res => {
      try {
        const data = JSON.parse(res);
        if (data && !data.error) {
          msg.innerText = "❌ هذا الطالب مسجل مسبقا.";
        } else {
          postToSheet(gather(), 'add').then(r => msg.innerText = r);
        }
      } catch (e) {
        msg.innerText = "⚠️ حدث خطأ في الاتصال بالخادم.";
      }
    });
  });

  document.getElementById('delStud')?.addEventListener('click', () => {
    const regNo = document.getElementById('regNo').value;
    if (!regNo) return msg.innerText = "⚠️ أدخل رقم التسجيل لحذف الطالب";
    postToSheet({ "رقم التسجيل": regNo }, 'delete').then(r => msg.innerText = r);
  });

  document.getElementById('clearForm')?.addEventListener('click', () => {
    formEls.forEach(id => document.getElementById(id).value = '');
    msg.innerText = 'تم تفريغ النموذج';
  });

  document.getElementById('getStud')?.addEventListener('click', () => {
    const regNo = document.getElementById('regNo').value;
    if (!regNo) return msg.innerText = "⚠️ أدخل رقم التسجيل للبحث";
    postToSheet({ "رقم التسجيل": regNo }, 'get').then(r => {
      try {
        const obj = JSON.parse(r);
        if (obj.error) msg.innerText = obj.error;
        else {
          fill(obj);
          msg.innerText = '✅ تم جلب البيانات';
        }
      } catch (e) {
        msg.innerText = "⚠️ فشل الاتصال بالخادم.";
      }
    });
  });

  document.getElementById('editStud')?.addEventListener('click', () => {
    postToSheet(gather(), 'edit').then(r => msg.innerText = r);
  });
});
