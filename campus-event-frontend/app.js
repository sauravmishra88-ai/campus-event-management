
// ============================================
// CAMPUSCONNECT - COMPLETE FRONTEND JAVASCRIPT
// Plain HTML, CSS and JavaScript
// ============================================

const API_BASE_URL = "http://localhost:8080/api";

// ============================================
// 1. HTML ELEMENTS
// ============================================

// Navigation
const loginButton = document.getElementById("loginBtn");
const registerButton = document.getElementById("registerBtn");
const logoutButton = document.getElementById("logoutBtn");
const dashboardButton = document.getElementById("myDashboardBtn");

// Hero
const heroRegisterButton = document.getElementById("heroRegisterBtn");
const exploreEventsButton = document.getElementById("exploreEventsBtn");

// Events
const eventGrid = document.getElementById("eventsGrid");
const eventSearch = document.getElementById("eventSearch");
const categoryFilter = document.getElementById("eventCategory");
const eventMessage = document.getElementById("eventsMessage");
const refreshEventsButton = document.getElementById("refreshEventsBtn");

// Authentication modal
const authModal = document.getElementById("authModal");
const closeAuthModalButton = document.getElementById("closeAuthModalBtn");

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");

const registerName = document.getElementById("registerName");
const registerEmail = document.getElementById("registerEmail");
const registerPassword = document.getElementById("registerPassword");

const loginMessage = document.getElementById("loginMessage");
const registerMessage = document.getElementById("registerMessage");

const switchToLoginButton = document.getElementById("switchToLoginBtn");
const switchToRegisterButton = document.getElementById("switchToRegisterBtn");

// Dashboard
const dashboardSection = document.getElementById("dashboard");
const studentRegistrationsCard = document.getElementById(
    "studentRegistrationsCard"
);

const loadRegistrationsButton = document.getElementById(
    "loadRegistrationsBtn"
);

const registrationsGrid = document.getElementById("registrationsGrid");
const dashboardMessage = document.getElementById("dashboardMessage");

// Admin dashboard
const adminCard = document.getElementById("adminCard");
const loadAdminButton = document.getElementById("loadAdminBtn");
const adminStats = document.getElementById("adminStats");

// Club approval
const clubApprovalPanel = document.getElementById("clubApprovalPanel");
const loadPendingClubsButton = document.getElementById(
    "loadPendingClubsBtn"
);
const pendingClubsList = document.getElementById("pendingClubsList");
const clubApprovalMessage = document.getElementById(
    "clubApprovalMessage"
);

// ============================================
// 2. APPLICATION STATE
// ============================================

let allEvents = [];
let authMode = "login";

// ============================================
// 3. HELPER FUNCTIONS
// ============================================

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function formatDate(dateValue) {
    if (!dateValue) {
        return "Date to be announced";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "Date to be announced";
    }

    return date.toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit"
    });
}

function getToken() {
    return sessionStorage.getItem("accessToken");
}

function getRole() {
    return (
        sessionStorage.getItem("userRole") || "STUDENT"
    ).replace(/^ROLE_/, "").toUpperCase();
}

function getErrorMessage(error) {
    return error?.message || "Something went wrong. Please try again.";
}

function showMessage(element, message, type = "error") {
    if (!element) return;

    element.textContent = message;
    element.style.color =
        type === "success" ? "#138a58" : "#777b95";
}

// ============================================
// 4. API REQUEST FUNCTION
// ============================================

async function apiRequest(path, options = {}) {
    const headers = {
        ...(options.headers || {})
    };

    // Add JSON content type only when sending a body.
    if (options.body !== undefined && options.body !== null) {
        headers["Content-Type"] =
            headers["Content-Type"] || "application/json";
    }

    // Add JWT token for protected endpoints.
    if (getToken()) {
        headers.Authorization =
            `${sessionStorage.getItem("tokenType") || "Bearer"} ${getToken()}`;
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers
    });

    // Some endpoints may return no response body.
    const responseText = await response.text();

    let data = {};

    if (responseText) {
        try {
            data = JSON.parse(responseText);
        } catch {
            data = { message: responseText };
        }
    }

    if (!response.ok) {
        if (response.status === 401) {
            showMessage(
                dashboardMessage,
                "Session expired or authentication failed. Please log in again."
            );
        }

        if (response.status === 403) {
            throw new Error(
                "Access denied. You do not have permission for this action."
            );
        }

        throw new Error(
            data.message ||
            data.error ||
            data.detail ||
            `Request failed with HTTP ${response.status}`
        );
    }

    return data;
}

// ============================================
// 5. AUTHENTICATION MODAL
// ============================================

function showAuth(mode = "login") {
    authMode = mode;

    updateAuthForm();

    authModal.hidden = false;
    document.body.classList.add("modal-open");

    if (mode === "register") {
        registerName.focus();
    } else {
        loginEmail.focus();
    }
}

function closeAuth() {
    authModal.hidden = true;
    document.body.classList.remove("modal-open");
}

function updateAuthForm() {
    const isRegister = authMode === "register";

    loginForm.hidden = isRegister;
    registerForm.hidden = !isRegister;

    showMessage(loginMessage, "");
    showMessage(registerMessage, "");

    const title = document.getElementById("authModalTitle");
    const description = document.getElementById(
        "authModalDescription"
    );

    if (title) {
        title.textContent = isRegister
            ? "Create your account"
            : "Login to your account";
    }

    if (description) {
        description.textContent = isRegister
            ? "Join your campus community."
            : "Access events, clubs, and your dashboard.";
    }
}

// Open and close modal.
loginButton.addEventListener("click", () => showAuth("login"));

registerButton.addEventListener("click", () => showAuth("register"));

heroRegisterButton.addEventListener(
    "click",
    () => showAuth("register")
);

closeAuthModalButton.addEventListener("click", closeAuth);

switchToLoginButton.addEventListener("click", () => {
    authMode = "login";
    updateAuthForm();
});

switchToRegisterButton.addEventListener("click", () => {
    authMode = "register";
    updateAuthForm();
});

// Close modal when clicking outside.
authModal.addEventListener("click", event => {
    if (event.target === authModal) {
        closeAuth();
    }
});

// Close modal using Escape key.
document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !authModal.hidden) {
        closeAuth();
    }
});

// ============================================
// 6. REGISTER ACCOUNT
// ============================================

registerForm.addEventListener("submit", async event => {
    event.preventDefault();

    const name = registerName.value.trim();
    const email = registerEmail.value.trim();
    const password = registerPassword.value;

    if (!name || !email || !password) {
        showMessage(
            registerMessage,
            "Please fill in all the fields."
        );
        return;
    }

    const submitButton = registerForm.querySelector(
        'button[type="submit"]'
    );

    submitButton.disabled = true;
    submitButton.textContent = "Creating account...";

    showMessage(registerMessage, "");

    try {
        await apiRequest("/auth/register", {
            method: "POST",
            body: JSON.stringify({
                name,
                email,
                password
            })
        });

        registerForm.reset();

        authMode = "login";
        updateAuthForm();

        loginEmail.value = email;

        showMessage(
            loginMessage,
            "Account created successfully! Please log in.",
            "success"
        );

        loginPassword.focus();

    } catch (error) {
        showMessage(
            registerMessage,
            getErrorMessage(error)
        );
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Create Account";
    }
});

// ============================================
// 7. LOGIN ACCOUNT
// ============================================

loginForm.addEventListener("submit", async event => {
    event.preventDefault();

    const email = loginEmail.value.trim();
    const password = loginPassword.value;

    if (!email || !password) {
        showMessage(
            loginMessage,
            "Please enter your email and password."
        );
        return;
    }

    const submitButton = loginForm.querySelector(
        'button[type="submit"]'
    );

    submitButton.disabled = true;
    submitButton.textContent = "Logging in...";

    showMessage(loginMessage, "");

    try {
        const data = await apiRequest("/auth/login", {
            method: "POST",
            body: JSON.stringify({
                email,
                password
            })
        });

        if (!data.accessToken) {
            throw new Error(
                "Login response does not contain accessToken."
            );
        }

        sessionStorage.setItem(
            "accessToken",
            data.accessToken
        );

        sessionStorage.setItem(
            "tokenType",
            data.tokenType || "Bearer"
        );

        const role =
            data.user?.role ||
            data.role ||
            "STUDENT";

        sessionStorage.setItem(
            "userRole",
            String(role).replace(/^ROLE_/, "").toUpperCase()
        );

        loginForm.reset();

        updateAuthUI();

        closeAuth();

        dashboardSection.hidden = false;

        dashboardSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

        showMessage(
            dashboardMessage,
            `Login successful! Welcome, ${getRole()}.`,
            "success"
        );

    } catch (error) {
        showMessage(
            loginMessage,
            getErrorMessage(error)
        );
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Login";
    }
});

// ============================================
// 8. UPDATE NAVBAR AND ROLE-BASED UI
// ============================================


function updateAuthUI() {
    const loggedIn = Boolean(getToken());
    const role = getRole();

    // Navbar buttons
    loginButton.hidden = loggedIn;
    registerButton.hidden = loggedIn;
    logoutButton.hidden = !loggedIn;
    dashboardButton.hidden = !loggedIn;

    // Hero registration button
    heroRegisterButton.hidden = loggedIn;

    // Admin-only features
    adminCard.hidden = !loggedIn || role !== "ADMIN";
    clubApprovalPanel.hidden = !loggedIn || role !== "ADMIN";

    // Student-only features
    studentRegistrationsCard.hidden =
        !loggedIn || role !== "STUDENT";
}


// ============================================
// 9. LOAD CAMPUS EVENTS
// ============================================

async function loadEvents() {
    eventGrid.innerHTML = `
<div class="loading-card">
    Loading campus events...
</div>
`;

    eventMessage.textContent = "";

    try {
        const response = await fetch(
            `${API_BASE_URL}/events/published?page=0&size=100`
        );

        if (!response.ok) {
            throw new Error(
                `Could not load events. HTTP ${response.status}`
            );
        }

        const data = await response.json();

        allEvents = Array.isArray(data)
            ? data
            : (data.content || []);

        filterEvents();

    } catch (error) {
        console.error("Events loading error:", error);

        eventGrid.innerHTML = `
<div class="empty-state">
    <h3>Events are temporarily unavailable</h3>
<p>
    Check whether Spring Boot is running
    and the events API is accessible.
</p>
<button
    class="btn btn-primary"
    id="retryEventsBtn"
    type="button">
    Try Again
</button>
</div>
`;

        eventMessage.textContent = getErrorMessage(error);

        document
            .getElementById("retryEventsBtn")
            ?.addEventListener("click", loadEvents);
    }
}

// ============================================
// 10. FILTER EVENTS
// ============================================

function filterEvents() {
    const query = eventSearch.value.trim().toLowerCase();
    const category = categoryFilter.value.trim().toLowerCase();

    const filteredEvents = allEvents.filter(event => {
        const searchableText = [
            event.title || "",
            event.description || "",
            event.venue || ""
        ].join(" ").toLowerCase();

        const matchesSearch = searchableText.includes(query);

        const matchesCategory =
            !category ||
            String(event.category || "").toLowerCase() === category;

        return matchesSearch && matchesCategory;
    });

    renderEvents(filteredEvents);
}

eventSearch.addEventListener("input", filterEvents);

categoryFilter.addEventListener("change", filterEvents);

refreshEventsButton.addEventListener("click", loadEvents);

exploreEventsButton.addEventListener("click", () => {
    document.getElementById("events").scrollIntoView({
        behavior: "smooth"
    });
});

// ============================================
// 11. RENDER EVENTS
// ============================================


function renderEvents(events) {
    // Backend se koi published event nahi aaya
    if (!events || events.length === 0) {
        eventGrid.innerHTML = `
<div class="empty-state">
    <h3>No published events yet</h3>
<p>
    New campus events will appear here
    when the admin publishes them.
</p>
</div>
`;

        eventMessage.textContent = "";
        return;
    }

    // Sirf backend se aaye events display honge
    eventGrid.innerHTML = events.map(event => {
        const category = event.category || "CAMPUS EVENT";
        const canRegister =
            Boolean(getToken()) && getRole() === "STUDENT";

        return `
<article class="event-card">
    <div class="event-art">
    <span>${escapeHTML(category)}</span>
</div>

<div class="event-body">
    <div class="event-meta">
                        <span>
                            ◷ ${escapeHTML(formatDate(event.startTime))}
                        </span>
        <span>
                            ${escapeHTML(event.status || "PUBLISHED")}
                        </span>
    </div>

    <h3>
        ${escapeHTML(event.title || "Campus Event")}
    </h3>

    <p>
        ${escapeHTML(
        event.description ||
        "No description available."
    )}
    </p>

    <div class="event-footer">
                        <span>
                            ⌖ ${escapeHTML(
                            event.venue || "Venue to be announced"
                        )}
                        </span>

        <div class="event-actions">
            <button
                class="details-btn"
                type="button"
                data-action="details"
                data-event-id="${escapeHTML(event.id)}">
                Details
            </button>

            ${canRegister ? `
                                <button
                                    class="details-btn"
                                    type="button"
                                    data-action="register"
                                    data-event-id="${escapeHTML(event.id)}">
                                    Register
                                </button>
                            ` : ""}
        </div>
    </div>
</div>
</article>
`;
    }).join("");

    eventMessage.textContent =
        `Showing ${events.length} published event(s).`;
}


// ============================================
// 12. EVENT DETAILS AND REGISTRATION
// ============================================

eventGrid.addEventListener("click", async event => {
    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const eventId = button.dataset.eventId;

    const selectedEvent = allEvents.find(
        item => String(item.id) === String(eventId)
    );

    if (!selectedEvent) return;

    if (button.dataset.action === "details") {
        alert(
            `${selectedEvent.title || "Campus Event"}\n\n` +
            `Category: ${selectedEvent.category || "Not specified"}\n` +
            `Date: ${formatDate(selectedEvent.startTime)}\n` +
            `Venue: ${selectedEvent.venue || "To be announced"}\n\n` +
            `${selectedEvent.description || ""}`
        );

        return;
    }

    if (button.dataset.action === "register") {
        if (!getToken()) {
            showAuth("login");
            return;
        }

        if (getRole() !== "STUDENT") {
            alert("Only student accounts can register for events.");
            return;
        }

        button.disabled = true;

        try {
            await apiRequest(
                `/events/${encodeURIComponent(eventId)}/register`,
{
    method: "POST",
        body: JSON.stringify({})
}
);

alert("Event registration successful!");

} catch (error) {
    alert(getErrorMessage(error));
} finally {
    button.disabled = false;
}
}
});

// ============================================
// 13. DASHBOARD NAVIGATION
// ============================================

dashboardButton.addEventListener("click", () => {
    dashboardSection.hidden = false;

    dashboardSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
});

// ============================================
// 14. STUDENT EVENT REGISTRATIONS
// ============================================

loadRegistrationsButton.addEventListener(
    "click",
    async () => {
        registrationsGrid.innerHTML = "";

        showMessage(
            dashboardMessage,
            "Loading your registrations..."
        );

        try {
            const data = await apiRequest(
                "/student/registrations"
            );

            const registrations = Array.isArray(data)
                ? data
                : (data.content || []);

            if (!registrations.length) {
                showMessage(
                    dashboardMessage,
                    "You haven't registered for any events yet."
                );

                return;
            }

            registrationsGrid.innerHTML = registrations.map(reg => {
                const event = reg.event || reg;

                return `
                    <article class="event-card">
                        <div class="event-body">

                            <div class="event-meta">
                                <span>
                                    ${escapeHTML(
                    reg.status || "REGISTERED"
                )}
                                </span>
                            </div>

                            <h3>
                                ${escapeHTML(
                    event.title ||
                    reg.eventTitle ||
                    "Registered Event"
                )}
                            </h3>

                            <p>
                                ${escapeHTML(
                    event.description ||
                    reg.description ||
                    "Your event registration."
                )}
                            </p>

                            <div class="event-footer">
                                <span>
                                    ${escapeHTML(
                    formatDate(
                        event.startTime ||
                        reg.startTime
                    )
                )}
                                </span>
                            </div>

                        </div>
                    </article>
                `;
            }).join("");

            showMessage(
                dashboardMessage,
                `Found ${registrations.length} registration(s).`,
                "success"
            );

        } catch (error) {
            showMessage(
                dashboardMessage,
                getErrorMessage(error)
            );
        }
    }
);

// ============================================
// 15. ADMIN DASHBOARD STATISTICS
// ============================================

loadAdminButton.addEventListener("click", async () => {
    if (!getToken() || getRole() !== "ADMIN") {
        showMessage(
            dashboardMessage,
            "Only administrators can access admin statistics."
        );

        return;
    }

    adminStats.innerHTML = "";

    showMessage(
        dashboardMessage,
        "Loading admin statistics..."
    );

    try {
        const data = await apiRequest("/admin/dashboard");

        const entries = Object.entries(data || {});

        if (!entries.length) {
            showMessage(
                dashboardMessage,
                "No dashboard statistics are available."
            );

            return;
        }

        adminStats.innerHTML = entries.map(([key, value]) => `
            <div class="stat-card">
                <span>
                    ${escapeHTML(
            key.replace(/([A-Z])/g, " $1")
        )}
                </span>

                <strong>
                    ${escapeHTML(
            typeof value === "object"
                ? JSON.stringify(value)
                : value
        )}
                </strong>
            </div>
        `).join("");

        showMessage(
            dashboardMessage,
            "Admin statistics loaded successfully.",
            "success"
        );

    } catch (error) {
        showMessage(
            dashboardMessage,
            getErrorMessage(error)
        );
    }
});

// ============================================
// 16. LOAD PENDING CLUBS - ADMIN ONLY
// ============================================

async function loadPendingClubs() {
    if (!getToken() || getRole() !== "ADMIN") {
        showMessage(
            clubApprovalMessage,
            "Only administrators can manage club approvals."
        );

        return;
    }

    pendingClubsList.innerHTML = "";

    showMessage(
        clubApprovalMessage,
        "Loading pending clubs..."
    );

    loadPendingClubsButton.disabled = true;

    try {
        const data = await apiRequest("/clubs/pending");

        const clubs = Array.isArray(data)
            ? data
            : (data.content || []);

        if (!clubs.length) {
            showMessage(
                clubApprovalMessage,
                "No pending clubs right now.",
                "success"
            );

            return;
        }

        showMessage(
            clubApprovalMessage,
            `${clubs.length} pending club(s) found.`,
            "success"
        );

        pendingClubsList.innerHTML = clubs.map(club => `
            <article class="pending-club">

                <div>
                    <h4>
                        ${escapeHTML(club.name || "Unnamed Club")}
                    </h4>

                    <p>
                        ${escapeHTML(
            club.description ||
            "No description provided."
        )}
                    </p>

                    <p>
                        Status:
                        ${escapeHTML(club.status || "PENDING")}
                    </p>
                </div>

                <div class="pending-club-actions">

                    <button
                        class="btn btn-approve"
                        type="button"
                        data-club-action="approve"
                        data-club-id="${escapeHTML(club.id)}">
                        Approve
                    </button>

                    <button
                        class="btn btn-reject"
                        type="button"
                        data-club-action="reject"
                        data-club-id="${escapeHTML(club.id)}">
                        Reject
                    </button>

                </div>

            </article>
        `).join("");

    } catch (error) {
        showMessage(
            clubApprovalMessage,
            getErrorMessage(error)
        );
    } finally {
        loadPendingClubsButton.disabled = false;
    }
}

loadPendingClubsButton.addEventListener(
    "click",
    loadPendingClubs
);

// ============================================
// 17. APPROVE OR REJECT CLUB
// ============================================

pendingClubsList.addEventListener("click", async event => {
    const button = event.target.closest(
        "button[data-club-action]"
    );

    if (!button) return;

    if (!getToken() || getRole() !== "ADMIN") {
        showMessage(
            clubApprovalMessage,
            "Only administrators can approve or reject clubs."
        );

        return;
    }

    const clubId = button.dataset.clubId;
    const action = button.dataset.clubAction;

    if (!clubId || !["approve", "reject"].includes(action)) {
        showMessage(
            clubApprovalMessage,
            "Invalid club information."
        );

        return;
    }

    const confirmed = confirm(
        `Are you sure you want to ${action} this club?`
    );

    if (!confirmed) return;

    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = "Please wait...";

    try {
        await apiRequest(
            `/clubs/${encodeURIComponent(clubId)}/${action}`,
            {
                method: "PATCH"
            }
        );

        showMessage(
            clubApprovalMessage,
            `Club ${action === "approve" ? "approved" : "rejected"} successfully.`,
            "success"
        );

        // Refresh list after successful action.
        await loadPendingClubs();

    } catch (error) {
        showMessage(
            clubApprovalMessage,
            getErrorMessage(error)
        );

        button.disabled = false;
        button.textContent = originalText;
    }
});

// ============================================
// 18. LOGOUT
// ============================================

logoutButton.addEventListener("click", () => {
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("tokenType");
    sessionStorage.removeItem("userRole");

    loginForm.reset();
    registerForm.reset();

    registrationsGrid.innerHTML = "";
    adminStats.innerHTML = "";
    pendingClubsList.innerHTML = "";

    clubApprovalMessage.textContent = "";
    dashboardMessage.textContent = "";

    dashboardSection.hidden = true;

    updateAuthUI();

    window.location.hash = "home";
});

// ============================================
// 19. FOOTER YEAR
// ============================================

const currentYearElement = document.getElementById("currentYear");

if (currentYearElement) {
    currentYearElement.textContent = new Date().getFullYear();
}





// ============================================
// CREATE CLUB
// ============================================

const createClubCard = document.getElementById("createClubCard");
const createClubForm = document.getElementById("createClubForm");
const createClubMessage = document.getElementById("createClubMessage");
const createClubBtn = document.getElementById("createClubBtn");

function updateAuthUI() {
    const loggedIn = Boolean(getToken());
    const role = getRole();

    loginButton.hidden = loggedIn;
    registerButton.hidden = loggedIn;
    logoutButton.hidden = !loggedIn;
    dashboardButton.hidden = !loggedIn;
    heroRegisterButton.hidden = loggedIn;

    adminCard.hidden = !loggedIn || role !== "ADMIN";
    clubApprovalPanel.hidden = !loggedIn || role !== "ADMIN";

    studentRegistrationsCard.hidden =
        !loggedIn || role !== "STUDENT";

    // Students can submit clubs.
    createClubCard.hidden =
        !loggedIn || role !== "STUDENT";
}

createClubForm.addEventListener("submit", async event => {
    event.preventDefault();

    if (!getToken() || getRole() !== "STUDENT") {
        showMessage(
            createClubMessage,
            "Please log in with a student account."
        );
        return;
    }

    const name = document.getElementById("clubName").value.trim();
    const description =
        document.getElementById("clubDescription").value.trim();

    if (!name || !description) {
        showMessage(
            createClubMessage,
            "Please enter the club name and description."
        );
        return;
    }

    createClubBtn.disabled = true;
    createClubBtn.textContent = "Submitting...";

    try {
        const createdClub = await apiRequest("/clubs", {
            method: "POST",
            body: JSON.stringify({
                name: name,
                description: description
            })
        });

        createClubForm.reset();

        showMessage(
            createClubMessage,
            `Club "${createdClub.name || name}" submitted successfully! Status: ${createdClub.status || "PENDING"}.`,
            "success"
        );

    } catch (error) {
        showMessage(
            createClubMessage,
            getErrorMessage(error)
        );
    } finally {
        createClubBtn.disabled = false;
        createClubBtn.textContent = "Submit Club";
    }
});

// ============================================
// 20. INITIALIZE APPLICATION
// ============================================

updateAuthUI();
loadEvents();


