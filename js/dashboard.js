function safeText(value, fallback) {
    if (value === undefined || value === null) {
        return fallback;
    }

    const stringValue = String(value).trim();
    return stringValue ? stringValue : fallback;
}

let dashboardStaffSchoolId = '';
let dashboardStaffPromise = null;

function getDashboardStaff(verifiedSchoolId) {
    if (dashboardStaffSchoolId !== verifiedSchoolId || !dashboardStaffPromise) {
        dashboardStaffSchoolId = verifiedSchoolId;
        dashboardStaffPromise = import('./staff-service.js')
            .then(({ getStaffForCurrentSchool }) => getStaffForCurrentSchool(verifiedSchoolId));
    }

    return dashboardStaffPromise;
}

async function loadStudentCount(session) {
    const studentCountEl = document.getElementById('dashboardTotalStudents');
    const admissionsListEl = document.getElementById('dashboardLatestAdmissions');

    if (!studentCountEl && !admissionsListEl) {
        return;
    }

    const verifiedSchoolId = session?.schoolProfile?.id;

    if (!verifiedSchoolId) {
        if (studentCountEl) {
            studentCountEl.textContent = 'Unable to load students';
        }
        renderLatestAdmissions(admissionsListEl, null, 'Unable to load admissions.');
        window.updateSchoolAnalyticsChart?.(null, true);
        renderRecentActivities(null, 'Unable to load activities.');
        return;
    }

    try {
        const { getStudentsForCurrentSchool } = await import('./student-service.js');
        const students = await getStudentsForCurrentSchool(verifiedSchoolId);

        if (studentCountEl) {
            studentCountEl.textContent = String(students.length);
        }

        renderLatestAdmissions(admissionsListEl, students);
        window.updateSchoolAnalyticsChart?.(students);
        loadRecentActivities(session, students);
    } catch (error) {
        console.error('Unable to load dashboard student count:', error);
        if (studentCountEl) {
            studentCountEl.textContent = 'Unable to load students';
        }
        renderLatestAdmissions(admissionsListEl, null, 'Unable to load admissions.');
        window.updateSchoolAnalyticsChart?.(null, true);
        loadRecentActivities(session, null, 'Unable to load activities.');
    }
}

function normalizeStaffStatisticValue(value) {
    return safeText(value, '').toLowerCase().replace(/[\s_-]/g, '');
}

async function loadTeacherCount(session) {
    const teacherCountEl = document.getElementById('dashboardTeachers');

    if (!teacherCountEl) {
        return;
    }

    teacherCountEl.textContent = 'Loading...';

    const verifiedSchoolId = session?.schoolProfile?.id;

    if (!verifiedSchoolId) {
        teacherCountEl.textContent = 'Unable to load teachers';
        return;
    }

    try {
        const staff = await getDashboardStaff(verifiedSchoolId);
        const activeTeachingStaff = staff.filter(item => {
            const employmentStatus = normalizeStaffStatisticValue(item?.employmentStatus);
            const accountStatus = normalizeStaffStatisticValue(item?.accountStatus);

            return employmentStatus !== 'archived'
                && accountStatus !== 'disabled'
                && !item?.archivedAt
                && normalizeStaffStatisticValue(item?.staffType) === 'teachingstaff';
        });

        teacherCountEl.textContent = String(activeTeachingStaff.length);
    } catch (error) {
        console.error('Unable to load dashboard teacher count:', error);
        teacherCountEl.textContent = 'Unable to load teachers';
    }
}

function getActivityDate(value) {
    if (value?.toDate instanceof Function) {
        return value.toDate();
    }

    if (!value) {
        return null;
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

function getActivityTimestamp(record, fallbackField = 'createdAt') {
    return getActivityDate(record?.[fallbackField]);
}

function getActivityTimeLabel(date) {
    const elapsedMilliseconds = Date.now() - date.getTime();
    const elapsedMinutes = Math.floor(elapsedMilliseconds / 60000);

    if (elapsedMinutes < 1) {
        return 'Just now';
    }

    if (elapsedMinutes < 60) {
        return `${elapsedMinutes} minute${elapsedMinutes === 1 ? '' : 's'} ago`;
    }

    const elapsedHours = Math.floor(elapsedMinutes / 60);
    if (elapsedHours < 24) {
        return `${elapsedHours} hour${elapsedHours === 1 ? '' : 's'} ago`;
    }

    const elapsedDays = Math.floor(elapsedHours / 24);
    if (elapsedDays < 7) {
        return `${elapsedDays} day${elapsedDays === 1 ? '' : 's'} ago`;
    }

    return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

function getActivityRecords(students, staff, classes) {
    const studentActivities = (students || []).map(student => ({
        icon: 'fa-user-plus',
        title: 'New student admitted',
        details: [getStudentName(student), student.class].filter(Boolean).join(' • '),
        date: getActivityDate(student.admissionDate) || getActivityTimestamp(student)
    }));

    const staffActivities = (staff || []).map(member => ({
        icon: 'fa-user-tie',
        title: 'New staff member added',
        details: getStudentName(member),
        date: getActivityTimestamp(member)
    }));

    const classActivities = (classes || []).map(classRecord => ({
        icon: 'fa-school',
        title: 'New class created',
        details: [classRecord.className, classRecord.section].filter(Boolean).join(' • '),
        date: getActivityTimestamp(classRecord)
    }));

    return [...studentActivities, ...staffActivities, ...classActivities]
        .filter(activity => activity.date)
        .sort((first, second) => second.date.getTime() - first.date.getTime())
        .slice(0, 5);
}

function renderRecentActivities(activities, message) {
    const activityList = document.getElementById('dashboardRecentActivities');

    if (!activityList) {
        return;
    }

    activityList.replaceChildren();

    if (message || !activities?.length) {
        const emptyState = document.createElement('div');
        emptyState.className = 'activity-item';
        emptyState.textContent = message || 'No recent activities yet.';
        activityList.appendChild(emptyState);
        return;
    }

    activities.forEach(activity => {
        const item = document.createElement('div');
        item.className = 'activity-item';

        const icon = document.createElement('i');
        icon.className = `fa-solid ${activity.icon}`;

        const content = document.createElement('div');
        const title = document.createElement('h4');
        title.textContent = activity.title;
        const details = document.createElement('p');
        details.textContent = `${activity.details || 'Details unavailable'} • ${getActivityTimeLabel(activity.date)}`;
        content.append(title, details);

        item.append(icon, content);
        activityList.appendChild(item);
    });
}

async function loadRecentActivities(session, students, message) {
    if (message) {
        renderRecentActivities(null, message);
        return;
    }

    const verifiedSchoolId = session?.schoolProfile?.id;
    if (!verifiedSchoolId) {
        renderRecentActivities(null, 'Unable to load activities.');
        return;
    }

    try {
        const { getClassesForCurrentSchool } = await import('./classes-service.js');
        const [staff, classes] = await Promise.all([
            getDashboardStaff(verifiedSchoolId),
            getClassesForCurrentSchool(verifiedSchoolId)
        ]);
        renderRecentActivities(getActivityRecords(students, staff, classes));
    } catch (error) {
        console.error('Unable to load dashboard activities:', error);
        renderRecentActivities(null, 'Unable to load activities.');
    }
}

function getStudentName(student) {
    return student.fullName || [student.firstName, student.lastName].filter(Boolean).join(' ') || 'Student';
}

function getStudentInitials(name) {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0].toUpperCase())
        .join('') || 'ST';
}

function renderLatestAdmissions(container, students, message) {
    if (!container) {
        return;
    }

    container.replaceChildren();

    if (message || !students?.length) {
        const emptyState = document.createElement('div');
        emptyState.className = 'student-item';
        emptyState.textContent = message || 'No students admitted yet.';
        container.appendChild(emptyState);
        return;
    }

    students.slice(0, 3).forEach(student => {
        const name = getStudentName(student);
        const item = document.createElement('div');
        item.className = 'student-item';

        const avatar = document.createElement('div');
        avatar.className = 'avatar';
        avatar.textContent = getStudentInitials(name);

        const details = document.createElement('div');
        const nameElement = document.createElement('h4');
        nameElement.textContent = name;
        const metadata = document.createElement('p');
        metadata.textContent = [student.admissionNumber, student.class].filter(Boolean).join(' • ') || 'Admission details unavailable';
        details.append(nameElement, metadata);

        const status = document.createElement('span');
        status.className = 'badge success';
        status.textContent = student.status || 'Admitted';

        item.append(avatar, details, status);
        container.appendChild(item);
    });
}

function wireQuickActions() {
    document.querySelector('[data-dashboard-action="add-student"]')?.addEventListener('click', () => {
        window.location.href = 'student-admission.html';
    });

    document.querySelector('[data-dashboard-action="add-teacher"]')?.addEventListener('click', () => {
        window.location.href = 'add-staff.html';
    });

    const unavailableActions = {
        'collect-fees': 'Finance & Fee Collection is not available yet.',
        'publish-results': 'Results Management is not available yet.',
        'create-cbt': 'CBT Management is not available yet.',
        announcement: 'Announcements are not available yet.'
    };

    let toastTimeout;
    const toast = document.getElementById('dashboardToast');

    Object.entries(unavailableActions).forEach(([action, message]) => {
        document.querySelector(`[data-dashboard-action="${action}"]`)?.addEventListener('click', () => {
            if (!toast) {
                return;
            }

            toast.textContent = message;
            toast.classList.add('show');
            clearTimeout(toastTimeout);
            toastTimeout = setTimeout(() => toast.classList.remove('show'), 3200);
        });
    });
}

function renderDashboard(userProfile, schoolProfile) {
    if (!userProfile && !schoolProfile) {
        return;
    }

    const schoolNameEl = document.getElementById('dashboardSchoolName');
    const schoolMottoEl = document.getElementById('dashboardSchoolMotto');
    const schoolCodeEl = document.getElementById('dashboardSchoolCode');
    const schoolLogoEl = document.getElementById('dashboardSchoolLogo');
    const adminNameEl = document.getElementById('dashboardAdminName');
    const adminRoleEl = document.getElementById('dashboardAdminRole');
    const adminEmailEl = document.getElementById('dashboardAdminEmail');

    if (schoolNameEl) {
        schoolNameEl.textContent = safeText(schoolProfile?.schoolName, 'School Name Not Available');
    }

    if (schoolMottoEl) {
        schoolMottoEl.textContent = safeText(schoolProfile?.schoolMotto, 'Motto not provided');
    }

    if (schoolCodeEl) {
        schoolCodeEl.textContent = safeText(schoolProfile?.schoolCode, 'School Code Not Available');
    }

    if (schoolLogoEl) {
        const logoUrl = schoolProfile?.logo && String(schoolProfile.logo).trim()
            ? schoolProfile.logo
            : 'assets/images/logo.png';
        schoolLogoEl.src = logoUrl;
        schoolLogoEl.alt = safeText(schoolProfile?.schoolName, 'School Logo');
    }

    if (adminNameEl) {
        adminNameEl.textContent = safeText(userProfile?.displayName, 'Administrator');
    }

    if (adminRoleEl) {
        const roleValue = safeText(userProfile?.role, 'administrator');
        adminRoleEl.textContent = roleValue === 'administrator' ? 'Administrator' : roleValue;
    }

    if (adminEmailEl) {
        adminEmailEl.textContent = safeText(userProfile?.email, 'No email available');
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const menuToggle = document.querySelector(".menu-toggle");
    const sidebar = document.querySelector(".sidebar");
    const overlay = document.querySelector(".overlay");

    if (menuToggle && sidebar) {
        menuToggle.addEventListener("click", () => {
            const isOpen = sidebar.classList.toggle("show");
            menuToggle.setAttribute("aria-expanded", String(isOpen));

            if (overlay) {
                overlay.classList.toggle("active", isOpen);
            }
        });
    }

    if (overlay) {
        overlay.addEventListener("click", () => {
            if (sidebar) {
                sidebar.classList.remove("show");
            }

            overlay.classList.remove("active");
            menuToggle?.setAttribute("aria-expanded", "false");
        });
    }

    wireQuickActions();

    const dashboardSession = window.dashboardSession || { ready: false, userProfile: null, schoolProfile: null };

    if (dashboardSession.ready && dashboardSession.userProfile && dashboardSession.schoolProfile) {
        renderDashboard(dashboardSession.userProfile, dashboardSession.schoolProfile);
        loadStudentCount(dashboardSession);
        loadTeacherCount(dashboardSession);
        return;
    }

    window.addEventListener('dashboardSessionReady', (event) => {
        const session = event.detail || {};
        renderDashboard(session.userProfile, session.schoolProfile);
        loadStudentCount(session);
        loadTeacherCount(session);
    }, { once: true });
});
