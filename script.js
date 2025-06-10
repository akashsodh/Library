// ======================================================
// !! जरूरी: अपनी फायरबेस कॉन्फ़िगरेशन यहाँ भी पेस्ट करें !!
// ======================================================
const firebaseConfig = {
  apiKey: "AIzaSyDSQm9bIcS3dM18PjPlmb1ziJ_BcxNe8iE",
  authDomain: "library0060.firebaseapp.com",
  projectId: "library0060",
  storageBucket: "library0060.firebasestorage.app",
  messagingSenderId: "575895945890",
  appId: "1:575895945890:web:8adeb76b5e645f36cd8dfb"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
let currentUser = null; // To hold the current user object

// Global configuration and data arrays
let STUDENT_FEE_PER_MONTH = 500;
const PLAN_DURATION_DAYS = 30;
let TOTAL_SEATS = 50;
let students = [];
let payments = [];

// --- Firebase Authentication Guard ---
auth.onAuthStateChanged(user => {
    if (user) {
        currentUser = user;
        // User is logged in, load their data
        loadData();
        document.querySelector('body').style.display = 'block'; // Show the app
    } else {
        // No user is logged in, redirect to login page
        window.location.href = 'login.html';
    }
});

// --- Data Persistence with Firestore ---
const saveData = async () => {
    if (!currentUser) return;
    try {
        const userDocRef = db.collection('users').doc(currentUser.uid);
        await userDocRef.set({
            students: students,
            payments: payments,
            settings: {
                STUDENT_FEE_PER_MONTH: STUDENT_FEE_PER_MONTH,
                TOTAL_SEATS: TOTAL_SEATS
            }
        });
        console.log('Data saved to Firestore');
    } catch (error) {
        console.error("Error saving data: ", error);
        alert('Could not save data to the cloud.');
    }
};

const loadData = async () => {
    if (!currentUser) return;
    try {
        const userDocRef = db.collection('users').doc(currentUser.uid);
        const doc = await userDocRef.get();

        if (doc.exists) {
            const data = doc.data();
            students = data.students || [];
            payments = data.payments || [];
            STUDENT_FEE_PER_MONTH = data.settings?.STUDENT_FEE_PER_MONTH || 500;
            TOTAL_SEATS = data.settings?.TOTAL_SEATS || 50;
            console.log('Data loaded from Firestore');
        } else {
            console.log("No data found for this user. Using defaults.");
            // First time user, save default data
            await saveData();
        }
        // Once data is loaded, initialize the app
        showSection('dashboard-section');
    } catch (error) {
        console.error("Error loading data: ", error);
        alert('Could not load data from the cloud.');
    }
};

// --- Logout Functionality ---
document.getElementById('logout-button').addEventListener('click', () => {
    auth.signOut().then(() => {
        console.log('User signed out');
        // The onAuthStateChanged listener will automatically redirect to login.html
    }).catch(error => {
        console.error('Sign out error', error);
    });
});


// DOM Elements (The rest of your original script.js starts here)
const allSections = document.querySelectorAll('main > section');
// ... (rest of the variable declarations remain the same)
const navButtons = document.querySelectorAll('nav button');
const totalStudentsCard = document.getElementById('total-students-card');
const studentForm = document.getElementById('student-form');
const studentIdInput = document.getElementById('student-id');
const studentNameInput = document.getElementById('student-name');
const joinDateInput = document.getElementById('join-date');
const allottedSeatInput = document.getElementById('allotted-seat');
const isVipInput = document.getElementById('is-vip');
const studentsTableBody = document.querySelector('#students-table tbody');
const feeStudentSelect = document.getElementById('fee-student-select');
const selectedStudentFeesInfo = document.getElementById('selected-student-fees-info');
const feePaymentForm = document.getElementById('fee-payment-form');
const feePaymentCard = document.getElementById('fee-payment-card');
const paymentMonthInput = document.getElementById('payment-month');
const paymentYearInput = document.getElementById('payment-year');
const amountPaidInput = document.getElementById('amount-paid');
const paymentDateInput = document.getElementById('payment-date');
const paymentModeInput = document.getElementById('payment-mode');
const attendedMonthInput = document.getElementById('attended-month');
const seatLayoutDiv = document.getElementById('seat-layout');
const reportMonthInput = document.getElementById('report-month');
const reportYearInput = document.getElementById('report-year');
const monthlyReportOutputDiv = document.getElementById('monthly-report-output');
const defaultMonthlyFeeInput = document.getElementById('default-monthly-fee');
const totalStudySeatsInput = document.getElementById('total-study-seats');
// const importDataFile = document.getElementById('import-data-file'); // No longer needed
const seatModal = document.getElementById('seat-allotment-modal');
const modalSeatNumber = document.getElementById('modal-seat-number');
const modalStudentSelect = document.getElementById('modal-student-select');

// --- Utility Functions ---
const formatDate = (date) => new Date(date).toISOString().split('T')[0];
const getMonthName = (monthNum) => new Date(2000, monthNum - 1, 1).toLocaleString('en-us', { month: 'long' });


// --- Core App Logic (Unchanged for the most part) ---
function showSection(sectionId) {
    navButtons.forEach(btn => {
        if (!btn.id.includes('logout')) {
           btn.classList.toggle('nav-active', btn.getAttribute('onclick').includes(sectionId));
        }
    });
    allSections.forEach(s => s.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    
    const today = new Date();
    switch (sectionId) {
        case 'dashboard-section': updateDashboardStats(); break;
        case 'student-management-section': renderStudentsTable(); break;
        case 'fees-management-section':
            populateFeeStudentSelect();
            selectedStudentFeesInfo.style.display = 'none';
            feePaymentCard.style.display = 'none';
            paymentMonthInput.value = today.getMonth() + 1;
            paymentYearInput.value = today.getFullYear();
            paymentDateInput.value = formatDate(today);
            break;
        case 'seat-management-section': renderSeatLayout(); break;
        case 'reports-section':
            reportMonthInput.value = today.getMonth() + 1;
            reportYearInput.value = today.getFullYear();
            monthlyReportOutputDiv.style.display = 'none';
            break;
        case 'settings-section': loadSettings(); break;
    }
}

// All your other functions (updateDashboardStats, studentForm listener, etc.) remain exactly the same.
// The only change is that whenever they call saveData(), it will now save to Firestore instead of localStorage.

// --- REMOVED Data Import/Export ---
// The old exportData and importDataFile listeners are removed as data is now managed in the cloud.

// --- Initializer ---
document.addEventListener('DOMContentLoaded', () => {
    // Hide the app body by default until authentication check is complete
    document.querySelector('body').style.display = 'none';
    
    // Initializer logic is now handled by the onAuthStateChanged listener
    totalStudentsCard.addEventListener('click', () => showSection('student-management-section'));
});


// PASTE THE REST OF YOUR ORIGINAL script.js FUNCTIONS HERE
// (From updateDashboardStats() all the way to the end, but remove the old Initializer and import/export)
// I have already copied most of them above for you. Just ensure everything is present.
// The key is that the core logic of your app does not need to change, only the data layer.

// --- Student Management ---
studentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const studentId = studentIdInput.value;
    const studentData = {
        name: studentNameInput.value.trim(),
        joinDate: joinDateInput.value,
        seat: parseInt(allottedSeatInput.value) || null,
        isVip: isVipInput.checked
    };
    if (studentId) {
        const student = students.find(s => s.id === studentId);
        Object.assign(student, studentData);
    } else {
        students.push({ id: 'S' + Date.now(), ...studentData, planExpiryDate: formatDate(new Date(new Date(studentData.joinDate).setDate(new Date(studentData.joinDate).getDate() + PLAN_DURATION_DAYS))) });
    }
    saveData();
    renderStudentsTable();
    studentForm.reset();
    studentIdInput.value = '';
    alert('Student saved!');
});

function renderStudentsTable() {
    studentsTableBody.innerHTML = '';
    students.forEach(s => {
        const row = studentsTableBody.insertRow();
        row.innerHTML = `
            <td><span class="student-name">${s.name}</span></td>
            <td>${s.joinDate}</td>
            <td>${s.isVip ? `<i class="fas fa-crown icon"></i>VIP` : (s.planExpiryDate || 'N/A')}</td>
            <td>${s.seat ? `<i class="fas fa-chair icon"></i>${s.seat}` : 'N/A'}</td>
            <td>${s.isVip ? 'Yes' : 'No'}</td>
            <td class="action-buttons">
                <button onclick="editStudent('${s.id}')" title="Edit"><i class="fas fa-edit"></i></button>
                <button onclick="deleteStudent('${s.id}')" title="Delete"><i class="fas fa-trash-alt"></i></button>
            </td>
        `;
    });
}

function editStudent(id) {
    const student = students.find(s => s.id === id);
    if (student) {
        studentIdInput.value = student.id;
        studentNameInput.value = student.name;
        joinDateInput.value = student.joinDate;
        allottedSeatInput.value = student.seat;
        isVipInput.checked = student.isVip;
        showSection('student-management-section');
    }
}

function deleteStudent(id) {
    if (confirm('Delete this student and all their records?')) {
        students = students.filter(s => s.id !== id);
        payments = payments.filter(p => p.studentId !== id);
        saveData();
        renderStudentsTable();
        renderSeatLayout();
    }
}

// Fees Management, Seat Management, Reports, Settings functions go here...
// (These are unchanged from your original file)

// --- Fees Management ---
feeStudentSelect.addEventListener('change', (e) => {
    const studentId = e.target.value;
    if (studentId) {
        feePaymentCard.style.display = 'block';
        selectedStudentFeesInfo.style.display = 'block';
        displayStudentFees(studentId);
    } else {
        feePaymentCard.style.display = 'none';
        selectedStudentFeesInfo.style.display = 'none';
    }
});

function populateFeeStudentSelect() {
    feeStudentSelect.innerHTML = '<option value="">-- Select a student --</option>';
    students.forEach(s => feeStudentSelect.innerHTML += `<option value="${s.id}">${s.name} (Seat: ${s.seat || 'N/A'})</option>`);
}

function displayStudentFees(studentId) {
    if (!studentId) { selectedStudentFeesInfo.innerHTML = ''; return; }
    const student = students.find(s => s.id === studentId);
    let infoHtml = `<h3><i class="fas fa-user-circle"></i>Status for ${student.name}</h3>`;
    if (student.isVip) { infoHtml += `<p>This is a VIP member.</p>`; feePaymentForm.style.display = 'none'; }
    
    let tableHtml = `<div class="table-responsive"><table id="monthly-status-table"><thead><tr><th>Month</th><th>Status</th><th>Amount</th><th>Date</th></tr></thead><tbody>`;
    const joinDate = new Date(student.joinDate);
    const today = new Date();
    for (let y = joinDate.getFullYear(); y <= today.getFullYear(); y++) {
        for (let m = 1; m <= 12; m++) {
            if (new Date(y, m-1) < new Date(joinDate.getFullYear(), joinDate.getMonth())) continue;
            if (new Date(y, m-1) > today) break;
            
            const payment = payments.find(p => p.studentId === studentId && p.month === m && p.year === y);
            let status, icon, text, amount, date;
            if (payment) {
                if (payment.attended) { [status, icon, text, amount, date] = ['paid', 'check-circle', 'Paid', payment.amount, payment.paymentDate]; } 
                else { [status, icon, text, amount, date] = ['absent', 'user-slash', 'Absent', 0, 'N/A']; }
            } else { [status, icon, text, amount, date] = ['pending', 'clock', 'Pending', STUDENT_FEE_PER_MONTH, 'N/A']; }
            tableHtml += `<tr class="status-${status}">
                <td>${getMonthName(m)} ${y}</td>
                <td><i class="fas fa-${icon} status-icon"></i>${text}</td>
                <td>₹ ${amount}</td><td>${date}</td></tr>`;
        }
    }
    selectedStudentFeesInfo.innerHTML = infoHtml + tableHtml + '</tbody></table></div>';
}

feePaymentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const studentId = feeStudentSelect.value;
    const paymentData = { studentId, month: parseInt(paymentMonthInput.value), year: parseInt(paymentYearInput.value), amount: parseFloat(amountPaidInput.value), attended: attendedMonthInput.checked, paymentMode: paymentModeInput.value, paymentDate: paymentDateInput.value };
    const pIndex = payments.findIndex(p => p.studentId === paymentData.studentId && p.month === paymentData.month && p.year === paymentData.year);
    if (pIndex > -1) payments[pIndex] = paymentData; else payments.push(paymentData);
    saveData();
    displayStudentFees(studentId);
});

function generateFeeReceipt() {
    const studentId = feeStudentSelect.value;
    if (!studentId) { alert('Please select a student.'); return; }
    const student = students.find(s => s.id === studentId);
    const receipt = `--- Fee Receipt ---\nDate: ${paymentDateInput.value}\nStudent: ${student.name}\nFor: ${getMonthName(paymentMonthInput.value)} ${paymentYearInput.value}\nAmount: ₹ ${amountPaidInput.value}\nMode: ${paymentModeInput.value}\n--- Thank You ---`;
    alert(receipt);
}

// --- Seat Management ---
function renderSeatLayout() {
    seatLayoutDiv.innerHTML = ''; // पुराने लेआउट को साफ़ करें

    // एक हेल्पर फ़ंक्शन जो एक सीट बनाता है
    const createSeatElement = (seatNumber) => {
        const seatDiv = document.createElement('div');
        seatDiv.className = 'seat';
        const studentOnSeat = students.find(s => s.seat === seatNumber);
        
        if (studentOnSeat) {
            seatDiv.classList.add('occupied');
            seatDiv.innerHTML = `<span>${seatNumber}</span><span class="student-name-on-seat">${studentOnSeat.name}</span>`;
        } else {
            seatDiv.textContent = seatNumber;
            seatDiv.title = `Click to allot Seat ${seatNumber}`;
            seatDiv.onclick = () => openSeatModal(seatNumber);
        }
        return seatDiv;
    };

    // लेआउट के लिए मुख्य कंटेनर
    const layoutContainer = document.createElement('div');
    layoutContainer.className = 'layout-container';

    // 1. टॉप रो (सीटें 9-16)
    const topRow = document.createElement('div');
    topRow.className = 'seat-block horizontal';
    for (let i = 9; i <= 16; i++) {
        topRow.appendChild(createSeatElement(i));
    }

    // 2. बीच का एरिया (सभी वर्टिकल कॉलम के लिए)
    const middleArea = document.createElement('div');
    middleArea.className = 'middle-area';

    // 2a. लेफ्ट कॉलम (सीटें 1-8)
    const leftCol = document.createElement('div');
    leftCol.className = 'seat-block vertical';
    for (let i = 8; i >= 1; i--) { // 8 से 1 तक उल्टा लूप
        leftCol.appendChild(createSeatElement(i));
    }

    // 2b. सेंटर के कॉलम (31-34 और 35-40)
    const centerColsContainer = document.createElement('div');
    centerColsContainer.className = 'center-columns';
    
    const centerTopBlock = document.createElement('div');
    centerTopBlock.className = 'seat-block vertical';
    for (let i = 40; i >= 35; i--) { // 40 से 35 तक उल्टा लूप
        centerTopBlock.appendChild(createSeatElement(i));
    }

    const centerBottomBlock = document.createElement('div');
    centerBottomBlock.className = 'seat-block vertical';
    for (let i = 34; i >= 31; i--) { // 34 से 31 तक उल्टा लूप
        centerBottomBlock.appendChild(createSeatElement(i));
    }
    centerColsContainer.appendChild(centerTopBlock);
    centerColsContainer.appendChild(centerBottomBlock);

    // 2c. राइट कॉलम (सीटें 17-30)
    const rightCol = document.createElement('div');
    rightCol.className = 'seat-block vertical';
    for (let i = 17; i <= 30; i++) {
        rightCol.appendChild(createSeatElement(i));
    }

    // बीच के एरिया में सभी कॉलम जोड़ें
    middleArea.appendChild(leftCol);
    middleArea.appendChild(centerColsContainer);
    middleArea.appendChild(rightCol);

    // मुख्य कंटेनर में टॉप रो और बीच का एरिया जोड़ें
    layoutContainer.appendChild(topRow);
    layoutContainer.appendChild(middleArea);

    // अंत में, मुख्य सीट लेआउट डिव में सब कुछ जोड़ें
    seatLayoutDiv.appendChild(layoutContainer);
}

function openSeatModal(seatNumber) {
    modalSeatNumber.textContent = seatNumber;
    modalStudentSelect.innerHTML = '<option value="">-- Select --</option>';
    students.filter(s => !s.seat).forEach(s => modalStudentSelect.innerHTML += `<option value="${s.id}">${s.name}</option>`);
    seatModal.style.display = 'flex';
}

function closeSeatModal() { seatModal.style.display = 'none'; }

function confirmSeatAllotment() {
    const studentId = modalStudentSelect.value;
    const seatNumber = parseInt(modalSeatNumber.textContent);
    if (!studentId) { alert('Please select a student.'); return; }
    const student = students.find(s => s.id === studentId);
    student.seat = seatNumber;
    saveData();
    closeSeatModal();
    renderSeatLayout();
    renderStudentsTable();
}

// --- Reports ---
function generateMonthlyReport() {
    const month = parseInt(reportMonthInput.value);
    const year = parseInt(reportYearInput.value);
    const reportMonthEnd = new Date(year, month, 0);
    
    let collectedHtml = `<h4>Collected</h4><div class="table-responsive"><table class="report-table"><thead><tr><th>Name</th><th>Seat</th><th>Amount</th><th>Date</th></tr></thead><tbody>`;
    let pendingHtml = `<h4>Pending</h4><div class="table-responsive"><table class="report-table"><thead><tr><th>Name</th><th>Seat</th><th>Amount</th></tr></thead><tbody>`;
    
    let collectedCount = 0, pendingCount = 0;

    students.forEach(s => {
        const joinDate = new Date(s.joinDate);
        if (s.isVip || joinDate > reportMonthEnd) return;

        const payment = payments.find(p => p.studentId === s.id && p.month === month && p.year === year);
        if (payment && payment.attended) {
            collectedHtml += `<tr><td>${s.name}</td><td>${s.seat || 'N/A'}</td><td>₹ ${payment.amount}</td><td>${payment.paymentDate}</td></tr>`;
            collectedCount++;
        } else if (!payment) {
            pendingHtml += `<tr><td>${s.name}</td><td>${s.seat || 'N/A'}</td><td>₹ ${STUDENT_FEE_PER_MONTH}</td></tr>`;
            pendingCount++;
        }
    });

    if (collectedCount === 0) collectedHtml += '<tr><td colspan="4">No records found.</td></tr>';
    if (pendingCount === 0) pendingHtml += '<tr><td colspan="3">No records found.</td></tr>';
    
    monthlyReportOutputDiv.innerHTML = `<h3>Report for ${getMonthName(month)} ${year}</h3>` + collectedHtml + '</tbody></table></div>' + pendingHtml + '</tbody></table></div>';
    monthlyReportOutputDiv.style.display = 'block';
}

// --- Settings ---
function loadSettings() {
    defaultMonthlyFeeInput.value = STUDENT_FEE_PER_MONTH;
    totalStudySeatsInput.value = TOTAL_SEATS;
}
function saveSettings() {
    STUDENT_FEE_PER_MONTH = parseInt(defaultMonthlyFeeInput.value) || 500;
    TOTAL_SEATS = parseInt(totalStudySeatsInput.value) || 50;
    saveData();
    alert('Settings saved!');
}

function updateDashboardStats() {
    document.getElementById('total-students').textContent = students.length;
    const occupiedSeats = students.filter(s => s.seat).length;
    document.getElementById('occupied-seats').textContent = occupiedSeats;
    document.getElementById('available-seats').textContent = TOTAL_SEATS - occupiedSeats;
    const currentMonth = new Date().getMonth() + 1;
    const collectedFees = payments
        .filter(p => p.month === currentMonth && p.year === new Date().getFullYear() && p.attended)
        .reduce((sum, p) => sum + p.amount, 0);
    document.getElementById('this-month-collected-fees').textContent = `₹ ${collectedFees}`;
}