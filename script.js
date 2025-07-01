const scriptURL = 'https://script.google.com/macros/s/AKfycbzYgykVhY5m8WtLxm0zh3WCJ1E3E5HtJzcssBK0fybZgNkiudJS4ZdIztTDivXNqQg1/exec'; // ← استبدله برابط السكربت الحقيقي

// تسجيل الدخول والتحقق
if (location.pathname.endsWith('dashboard.html') && !localStorage.getItem('logged')) {
  location.href = 'index.html';
}

// ربط الحقول بالأسماء في Google Sheets
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

function gather() {
  let o = {};
  formEls.forEach(id => {
    const arabicKey = fieldMap[id];
    o[arabicKey] = document.getElementById(id)?.value || "";
  });
  return o;
}

function fill(obj) {
  for (const [engKey, arabicKey] of Object.entries(fieldMap)) {
    document.getElementById(engKey).value = obj[arabicKey] || "";
  }
}

function postToSheet(payload, action) {
  return fetch(`${scriptURL}?action=${action}`, {
    method: 'POST',
    body: JSON.stringify(payload)
  })
    .then(res => res.text());
}

// 🎯 العمليات داخل dashboard.html
if (location.pathname.endsWith('dashboard.html')) {
  const statusMsg = document.getElementById('statusMsg');

  document.getElementById('addStud').onclick = () => {
    const regNo = document.getElementById("regNo").value.trim();
    if (!regNo) {
      statusMsg.innerText = "❗يرجى إدخال رقم التسجيل.";
      return;
    }
    postToSheet(gather(), 'add').then(txt => {
      statusMsg.innerText = txt;
    }).catch(err => {
      statusMsg.innerText = "❌ فشل الاتصال بالخادم";
    });
  };

  document.getElementById('delStud').onclick = () => {
    let regNo = prompt("أدخل رقم التسجيل لحذف الطالب");
    if (regNo) {
      postToSheet({ "رقم التسجيل": regNo }, 'delete').then(txt => {
        statusMsg.innerText = txt;
      }).catch(err => {
        statusMsg.innerText = "❌ فشل الاتصال بالخادم";
      });
    }
  };

  document.getElementById('getStud').onclick = () => {
    let regNo = prompt("أدخل رقم التسجيل لجلب البيانات");
    if (regNo) {
      postToSheet({ "رقم التسجيل": regNo }, 'get').then(response => {
        try {
          const data = JSON.parse(response);
          if (data.error) {
            statusMsg.innerText = data.error;
          } else {
            fill(data);
            statusMsg.innerText = "✅ تم جلب البيانات";
          }
        } catch (err) {
          statusMsg.innerText = "⚠️ فشل في تحليل البيانات";
        }
      }).catch(() => {
        statusMsg.innerText = "❌ فشل الاتصال بالخادم";
      });
    }
  };

  document.getElementById('editStud').onclick = () => {
    postToSheet(gather(), 'edit').then(txt => {
      statusMsg.innerText = txt;
    }).catch(err => {
      statusMsg.innerText = "❌ فشل الاتصال بالخادم";
    });
  };

  document.getElementById('clearForm').onclick = () => {
    formEls.forEach(id => document.getElementById(id).value = '');
    statusMsg.innerText = "🧹 تم مسح البيانات";
  };
}
