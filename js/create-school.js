import { auth, createUserWithEmailAndPassword, signOut, storage } from "./firebase.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";
import { createSchoolProfile, updateSchoolProfile } from "./school-service.js";
import { createUserProfile } from "./user-service.js";
import { setApplicationSession } from "./auth-service.js";

const form = document.querySelector("form");
const title = document.querySelector(".register-card h2");
const subtitle = document.querySelector(".register-card p");

let currentStep = 1;

function getMessageElement() {
    return form.querySelector('.form-message');
}

let registrationData = {
    schoolName: '',
    schoolType: '',
    schoolMotto: '',
    schoolCode: '',
    schoolLogoFile: null,
    country: '',
    state: '',
    city: '',
    address: '',
    phone: '',
    email: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    confirmPassword: ''
};

function getSelectedLogoFile() {
    const fileInput = form.querySelector('input[type="file"]');

    if (fileInput?.files?.length > 0) {
        return fileInput.files[0];
    }

    return registrationData.schoolLogoFile || null;
}

function showStepOne() {
    currentStep = 1;
    title.textContent = 'Create School';
    subtitle.textContent = 'Step 1 of 4';

    form.innerHTML = `
        <div class="input-group">
            <label>School Name</label>
            <input type="text" placeholder="Enter school name">
        </div>

        <div class="input-group">
            <label>School Type</label>
            <select>
                <option>Select School Type</option>
                <option>Nursery</option>
                <option>Primary</option>
                <option>Secondary</option>
                <option>College</option>
                <option>University</option>
            </select>
        </div>

        <div class="input-group">
            <label>School Motto</label>
            <input type="text" placeholder="Enter school motto">
        </div>

        <div class="input-group">
            <label>School Logo</label>
            <input type="file">
            <p class="selected-file-note"></p>
        </div>

        <button type="submit">
            Continue →
        </button>
        <p class="form-message" style="margin-top: 16px; font-size: 14px; color: #F87171; min-height: 22px;"></p>
    `;

    const nameInput = form.querySelector('input[placeholder="Enter school name"]');
    const typeSelect = form.querySelector('select');
    const mottoInput = form.querySelector('input[placeholder="Enter school motto"]');

    if (registrationData.schoolName) {
        nameInput.value = registrationData.schoolName;
    }

    if (registrationData.schoolType) {
        typeSelect.value = registrationData.schoolType;
    }

    if (registrationData.schoolMotto) {
        mottoInput.value = registrationData.schoolMotto;
    }

    const logoNote = form.querySelector('.selected-file-note');
    if (registrationData.schoolLogoFile && logoNote) {
        logoNote.textContent = `Selected file: ${registrationData.schoolLogoFile.name}`;
        logoNote.style.color = '#94A3B8';
        logoNote.style.marginTop = '8px';
        logoNote.style.fontSize = '13px';
    }
}

function showMessage(message, isError = true) {
    const messageEl = getMessageElement();
    if (!messageEl) return;
    messageEl.textContent = message;
    messageEl.style.color = isError ? '#F87171' : '#34D399';
}

function clearMessage() {
    const messageEl = getMessageElement();
    if (!messageEl) return;
    messageEl.textContent = '';
}

function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function createSchoolCode(schoolName) {
    const normalizedName = schoolName
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 24) || 'SCHOOL';
    const suffix = `${Date.now().toString(36).slice(-6)}-${Math.random().toString(36).slice(2, 6)}`.toUpperCase();
    return `${normalizedName}-${suffix}`;
}

async function createAdminAccount(email, password) {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    return credential.user;
}

async function handleRegistration(event) {
    event.preventDefault();
    clearMessage();

    try {
        if (currentStep === 1) {
            validateStepOne();
            showStepTwo();
            return;
        }

        if (currentStep === 2) {
            validateStepTwo();
            showStepThree();
            return;
        }

        if (currentStep === 3) {
            validateStepThree();
            showStepFour();
            return;
        }

        if (currentStep === 4) {
            await submitRegistration();
            return;
        }
    } catch (error) {
        showMessage(error.message || 'Registration failed.');
        console.error('Create school registration error', error);
    }
}

function validateStepOne() {
    const nameInput = form.querySelector('input[placeholder="Enter school name"]');
    const typeSelect = form.querySelector('select');
    const mottoInput = form.querySelector('input[placeholder="Enter school motto"]');
    const selectedLogoFile = getSelectedLogoFile();

    if (!nameInput?.value.trim()) {
        throw new Error('Please enter your school name.');
    }

    if (typeSelect?.selectedIndex === 0) {
        throw new Error('Please select your school type.');
    }

    if (!mottoInput?.value.trim()) {
        throw new Error('Please enter your school motto.');
    }

    registrationData.schoolName = nameInput.value.trim();
    registrationData.schoolType = typeSelect.value;
    registrationData.schoolMotto = mottoInput.value.trim();
    registrationData.schoolCode = createSchoolCode(registrationData.schoolName);
    registrationData.schoolLogoFile = selectedLogoFile || null;
}

function showStepTwo() {
    currentStep = 2;
    title.textContent = 'School Contact Details';
    subtitle.textContent = 'Step 2 of 4';

    form.innerHTML = `
        <div class="input-group">
            <label>Country</label>
            <input type="text" placeholder="Nigeria">
        </div>

        <div class="input-group">
            <label>State</label>
            <input type="text" placeholder="Ebonyi State">
        </div>

        <div class="input-group">
            <label>City / LGA</label>
            <input type="text" placeholder="Enter City or LGA">
        </div>

        <div class="input-group">
            <label>School Address</label>
            <input type="text" placeholder="Full School Address">
        </div>

        <div class="input-group">
            <label>Phone Number</label>
            <input type="tel" placeholder="Enter Phone Number">
        </div>

        <div class="input-group">
            <label>School Email</label>
            <input type="email" placeholder="school@email.com">
        </div>

        <div class="button-row">
            <button type="button" class="back-btn">Back</button>
            <button type="submit">Continue →</button>
        </div>
        <p class="form-message" style="margin-top: 16px; font-size: 14px; color: #F87171; min-height: 22px;"></p>
    `;

    const country = form.querySelector('input[placeholder="Nigeria"]');
    const state = form.querySelector('input[placeholder="Ebonyi State"]');
    const city = form.querySelector('input[placeholder="Enter City or LGA"]');
    const address = form.querySelector('input[placeholder="Full School Address"]');
    const phone = form.querySelector('input[placeholder="Enter Phone Number"]');
    const email = form.querySelector('input[placeholder="school@email.com"]');

    if (registrationData.country) country.value = registrationData.country;
    if (registrationData.state) state.value = registrationData.state;
    if (registrationData.city) city.value = registrationData.city;
    if (registrationData.address) address.value = registrationData.address;
    if (registrationData.phone) phone.value = registrationData.phone;
    if (registrationData.email) email.value = registrationData.email;

    form.querySelector('.back-btn')?.addEventListener('click', showStepOne);
}

function validateStepTwo() {
    const country = form.querySelector('input[placeholder="Nigeria"]');
    const state = form.querySelector('input[placeholder="Ebonyi State"]');
    const city = form.querySelector('input[placeholder="Enter City or LGA"]');
    const address = form.querySelector('input[placeholder="Full School Address"]');
    const phone = form.querySelector('input[placeholder="Enter Phone Number"]');
    const email = form.querySelector('input[placeholder="school@email.com"]');

    if (!country?.value.trim() || !state?.value.trim() || !city?.value.trim() || !address?.value.trim() || !phone?.value.trim() || !email?.value.trim()) {
        throw new Error('Please complete all school contact details.');
    }

    if (!isValidEmail(email.value.trim())) {
        throw new Error('Please enter a valid school email address.');
    }

    registrationData.country = country.value.trim();
    registrationData.state = state.value.trim();
    registrationData.city = city.value.trim();
    registrationData.address = address.value.trim();
    registrationData.phone = phone.value.trim();
    registrationData.email = email.value.trim();
}

function showStepThree() {
    currentStep = 3;
    title.textContent = 'Administrator Account';
    subtitle.textContent = 'Step 3 of 4';

    form.innerHTML = `
        <div class="input-group">
            <label>Administrator Full Name</label>
            <input type="text" placeholder="Enter full name">
        </div>

        <div class="input-group">
            <label>Administrator Email</label>
            <input type="email" placeholder="admin@email.com">
        </div>

        <div class="input-group">
            <label>Administrator Password</label>
            <input id="password" name="password" type="password" placeholder="Enter a secure password" autocomplete="new-password">
        </div>

        <div class="input-group">
            <label>Confirm Password</label>
            <input id="confirmPassword" name="confirmPassword" type="password" placeholder="Confirm your password" autocomplete="new-password">
        </div>

        <div class="button-row">
            <button type="button" class="back-btn">Back</button>
            <button type="submit">Continue →</button>
        </div>
        <p class="form-message" style="margin-top: 16px; font-size: 14px; color: #F87171; min-height: 22px;"></p>
    `;

    const displayName = form.querySelector('input[placeholder="Enter full name"]');
    const email = form.querySelector('input[placeholder="admin@email.com"]');
    const password = form.querySelector('#password');
    const confirmPassword = form.querySelector('#confirmPassword');

    if (registrationData.adminName) displayName.value = registrationData.adminName;
    if (registrationData.adminEmail) email.value = registrationData.adminEmail;
    if (registrationData.adminPassword) password.value = registrationData.adminPassword;
    if (registrationData.confirmPassword) confirmPassword.value = registrationData.confirmPassword;

    form.querySelector('.back-btn')?.addEventListener('click', showStepTwo);
}

function validateStepThree() {
    const displayName = form.querySelector('input[placeholder="Enter full name"]');
    const email = form.querySelector('input[placeholder="admin@email.com"]');
    const password = form.querySelector('#password');
    const confirmPassword = form.querySelector('#confirmPassword');

    if (!displayName?.value.trim()) {
        throw new Error('Please enter the administrator full name.');
    }

    if (!email?.value.trim() || !isValidEmail(email.value.trim())) {
        throw new Error('Please enter a valid administrator email address.');
    }

    if (!password?.value || password.value.length < 6) {
        throw new Error('Please enter a password with at least 6 characters.');
    }

    if (!confirmPassword?.value) {
        throw new Error('Please confirm your password.');
    }

    if (password.value !== confirmPassword.value) {
        throw new Error('Passwords do not match. Please confirm your password.');
    }

    registrationData.adminName = displayName.value.trim();
    registrationData.adminEmail = email.value.trim();
    registrationData.adminPassword = password.value;
    registrationData.confirmPassword = confirmPassword.value;
}

function showStepFour() {
    currentStep = 4;
    title.textContent = 'Finish Setup';
    subtitle.textContent = 'Step 4 of 4';

    form.innerHTML = `
        <div class="input-group">
            <label>Confirm School Name</label>
            <input type="text" value="${registrationData.schoolName}" disabled>
        </div>

        <div class="input-group">
            <label>Confirm Administrator Email</label>
            <input type="email" value="${registrationData.adminEmail}" disabled>
        </div>

        <div class="button-row">
            <button type="button" class="back-btn">Back</button>
            <button type="submit">Create School</button>
        </div>
        <p class="form-message" style="margin-top: 16px; font-size: 14px; color: #F87171; min-height: 22px;"></p>
    `;

    form.querySelector('.back-btn')?.addEventListener('click', showStepThree);
}

async function submitRegistration() {
    const button = form.querySelector('button[type="submit"]');
    if (button) {
        button.disabled = true;
        button.textContent = 'Creating...';
    }

    try {
        const user = await createAdminAccount(registrationData.adminEmail, registrationData.adminPassword);

        try {
            const schoolProfile = await createSchoolProfile({
                schoolName: registrationData.schoolName,
                schoolType: registrationData.schoolType,
                schoolMotto: registrationData.schoolMotto,
                schoolCode: registrationData.schoolCode,
                email: registrationData.email,
                phone: registrationData.phone,
                address: `${registrationData.address}, ${registrationData.city}, ${registrationData.state}, ${registrationData.country}`,
                logo: "",
                createdBy: user.uid
            });

            if (registrationData.schoolLogoFile) {
                try {
                    const logoRef = ref(storage, `school-logos/${schoolProfile.id}/${registrationData.schoolLogoFile.name}`);
                    await uploadBytes(logoRef, registrationData.schoolLogoFile);
                    const logoUrl = await getDownloadURL(logoRef);
                    await updateSchoolProfile(schoolProfile.id, { logo: logoUrl });
                    schoolProfile.logo = logoUrl;
                } catch (logoError) {
                    console.warn('School logo upload failed; continuing without a logo.', logoError);
                    schoolProfile.logo = '';
                }
            }

            await createUserProfile(user.uid, {
                email: registrationData.adminEmail,
                displayName: registrationData.adminName,
                schoolId: schoolProfile.id,
                role: 'administrator'
            });

            setApplicationSession(user, { uid: user.uid, email: user.email, schoolId: schoolProfile.id, role: 'administrator', displayName: registrationData.adminName }, schoolProfile);
            window.location.href = 'dashboard.html';
        } catch (firestoreError) {
            console.error('School creation failed after auth succeeded:', firestoreError);
            await signOut(auth);
            throw firestoreError;
        }
    } catch (error) {
        if (error?.code === 'auth/email-already-in-use') {
            throw new Error('This email address is already in use.');
        }
        if (error?.code === 'auth/invalid-email') {
            throw new Error('Please enter a valid administrator email address.');
        }
        if (error?.code === 'auth/weak-password') {
            throw new Error('Please choose a stronger password with at least 6 characters.');
        }
        throw error;
    } finally {
        if (button) {
            button.disabled = false;
            button.textContent = 'Create School';
        }
    }
}

if (form) {
    showStepOne();
    form.addEventListener('submit', handleRegistration);
}
