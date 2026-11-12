const studentApiURL = "http://localhost:5200/api/students";
const courseApiURL = "http://localhost:5200/api/courses";

function setApiStatus(isConnected) {
    const statusText = document.getElementById("apiStatusText");
    if (!statusText) return;

    statusText.textContent = isConnected ? "Connected" : "Disconnected";
    statusText.className = isConnected ? "connected" : "disconnected";
}

// =========================================
// 1. COURSES
// =========================================
function loadCourses() {
    fetch(courseApiURL)
        .then(res => {
            if (!res.ok) throw new Error("Failed to load courses");
            return res.json();
        })
        .then(courses => {
            setApiStatus(true);
            document.getElementById("courseCount").textContent = courses.length;
            displayCourses(courses);
            populateCourseDropdown(courses);
        })
        .catch(err => {
            console.error("Error loading courses:", err);
            setApiStatus(false);
            document.getElementById("courseList").innerHTML =
                `<tr><td colspan="4" class="error-cell">Could not connect to API at ${courseApiURL}</td></tr>`;
        });
}

function displayCourses(courses) {
    const courseList = document.getElementById("courseList");
    courseList.innerHTML = "";

    if (courses.length === 0) {
        courseList.innerHTML =
            `<tr><td colspan="4" class="empty-cell">No courses registered yet. Add one above.</td></tr>`;
        return;
    }

    courses.forEach(c => {
        courseList.innerHTML += `
            <tr>
                <td><strong>${c.code}</strong></td>
                <td>${c.title}</td>
                <td><span class="pill-badge">${c.enrolledCount} students</span></td>
                <td>
                    <button type="button" onclick="viewCourseRoster(${c.id})">View Students</button>
                    <button type="button" onclick="deleteCourse(${c.id})">Delete</button>
                </td>
            </tr>
        `;
    });
}

function populateCourseDropdown(courses) {
    const select = document.getElementById("course");
    const currentVal = select.value;
    select.innerHTML = `<option value="">-- Select a registered course --</option>`;

    courses.forEach(c => {
        select.innerHTML += `<option value="${c.title}">${c.code} - ${c.title}</option>`;
    });

    select.value = currentVal;
}

document.getElementById("courseForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const newCourse = {
        code: document.getElementById("courseCode").value.trim(),
        title: document.getElementById("courseTitle").value.trim()
    };

    fetch(courseApiURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCourse)
    })
        .then(res => {
            if (!res.ok) throw new Error("Failed to add course");
            document.getElementById("courseForm").reset();
            loadCourses();
        })
        .catch(err => console.error(err));
});

function viewCourseRoster(courseId) {
    fetch(`${courseApiURL}/${courseId}/students`)
        .then(res => res.json())
        .then(data => {
            const box = document.getElementById("courseRosterBox");
            const title = document.getElementById("rosterTitle");
            const list = document.getElementById("rosterList");

            title.textContent = `${data.course.code}: ${data.course.title} — Enrolled Students (${data.students.length})`;
            list.innerHTML = "";

            if (data.students.length === 0) {
                list.innerHTML = `<tr><td colspan="2" class="empty-cell">No students enrolled in this course yet.</td></tr>`;
            } else {
                data.students.forEach(s => {
                    list.innerHTML += `
                        <tr>
                            <td><strong>#${s.id}</strong></td>
                            <td>${s.name}</td>
                        </tr>
                    `;
                });
            }

            box.style.display = "block";
        })
        .catch(err => console.error(err));
}

function deleteCourse(id) {
    fetch(`${courseApiURL}/${id}`, { method: "DELETE" })
        .then(() => {
            document.getElementById("courseRosterBox").style.display = "none";
            loadCourses();
        })
        .catch(err => console.error(err));
}

document.getElementById("closeRosterBtn").addEventListener("click", function () {
    document.getElementById("courseRosterBox").style.display = "none";
});

// =========================================
// 2. STUDENTS
// =========================================
function loadStudents() {
    fetch(studentApiURL)
        .then(res => {
            if (!res.ok) throw new Error("Failed to load students");
            return res.json();
        })
        .then(students => {
            setApiStatus(true);
            document.getElementById("studentCount").textContent = students.length;
            displayStudents(students);
            loadCourses();
        })
        .catch(err => {
            console.error("Error loading students:", err);
            setApiStatus(false);
            document.getElementById("studentList").innerHTML =
                `<tr><td colspan="4" class="error-cell">Could not connect to API at ${studentApiURL}</td></tr>`;
        });
}

function displayStudents(students) {
    const studentList = document.getElementById("studentList");
    studentList.innerHTML = "";

    if (students.length === 0) {
        studentList.innerHTML =
            `<tr><td colspan="4" class="empty-cell">No students found.</td></tr>`;
        return;
    }

    students.forEach(student => {
        studentList.innerHTML += `
            <tr>
                <td><strong>#${student.id}</strong></td>
                <td>${student.name}</td>
                <td>${student.course}</td>
                <td>
                    <button type="button" onclick="editStudent(${student.id})">Edit</button>
                    <button type="button" onclick="deleteStudent(${student.id})">Delete</button>
                </td>
            </tr>
        `;
    });
}

document.getElementById("studentForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const id = document.getElementById("studentId").value;
    const student = {
        name: document.getElementById("name").value.trim(),
        course: document.getElementById("course").value
    };

    fetch(id ? `${studentApiURL}/${id}` : studentApiURL, {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(student)
    })
        .then(res => {
            if (!res.ok) throw new Error("Request failed");
            document.getElementById("studentForm").reset();
            document.getElementById("studentId").value = "";
            document.getElementById("submitButton").innerHTML = "Register Student <span>→</span>";
            loadStudents();
        })
        .catch(err => console.error(err));
});

function searchStudents() {
    const name = document.getElementById("searchName").value.trim();
    if (!name) {
        loadStudents();
        return;
    }

    fetch(`${studentApiURL}/search/${encodeURIComponent(name)}`)
        .then(res => res.json())
        .then(students => displayStudents(students))
        .catch(err => console.error(err));
}

document.getElementById("searchBtn").addEventListener("click", searchStudents);
document.getElementById("showAllBtn").addEventListener("click", loadStudents);
document.getElementById("searchName").addEventListener("keyup", function (e) {
    if (e.key === "Enter") searchStudents();
});

function editStudent(id) {
    fetch(`${studentApiURL}/${id}`)
        .then(res => res.json())
        .then(student => {
            document.getElementById("studentId").value = student.id;
            document.getElementById("name").value = student.name;
            document.getElementById("course").value = student.course;
            document.getElementById("submitButton").innerHTML = "Update Student <span>✓</span>";
            document.getElementById("registration").style.display = "block";
            document.getElementById("name").focus();
        })
        .catch(err => console.error(err));
}

function deleteStudent(id) {
    fetch(`${studentApiURL}/${id}`, { method: "DELETE" })
        .then(() => loadStudents())
        .catch(err => console.error(err));
}

// =========================================
// 3. SIDEBAR NAVIGATION TABS
// =========================================
const navLinks = document.querySelectorAll(".nav-links a");
const overviewGrid = document.querySelector(".overview-grid");
const coursesSection = document.getElementById("courses");
const regSection = document.getElementById("registration");
const dirSection = document.getElementById("directory");

navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        navLinks.forEach(l => l.classList.remove("active"));
        link.classList.add("active");

        const target = link.getAttribute("href");

        overviewGrid.style.display = target === "#" ? "grid" : "none";
        coursesSection.style.display = (target === "#" || target === "#courses") ? "block" : "none";
        regSection.style.display = (target === "#" || target === "#registration") ? "block" : "none";
        dirSection.style.display = (target === "#" || target === "#directory") ? "block" : "none";
    });
});

// Initial load
loadCourses();
loadStudents();