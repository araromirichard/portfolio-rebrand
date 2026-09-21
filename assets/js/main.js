/*=============== SHOW MENU ===============*/
const navMenu = document.getElementById('nav-menu'),
    navToggle = document.getElementById('nav-toggle'),
    navClose = document.getElementById('nav-close')

/* Menu show */
if (navToggle) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.add('show-menu')
    })
}

/* Menu hidden */
if (navClose) {
    navClose.addEventListener('click', () => {
        navMenu.classList.remove('show-menu')
    })
}


/*=============== REMOVE MENU MOBILE ===============*/
const navLink = document.querySelectorAll('.nav__link')

const linkAction = () => {
    const navMenu = document.getElementById('nav-menu')
    // When we click on each nav__link, we remove the show-menu class
    navMenu.classList.remove('show-menu')
}
navLink.forEach(n => n.addEventListener('click', linkAction))


/*=============== SHADOW HEADER ===============*/
const shadowHeader = () => {
    const header = document.getElementById('header')
    // Add a class if the bottom offset is greater than 50 of the viewport
    this.scrollY >= 50 ? header.classList.add('shadow-header')
        : header.classList.remove('shadow-header')
}
window.addEventListener('scroll', shadowHeader)

/*=============== EMAIL JS ===============*/
// Select the form, message, button, and loader elements
const contactForm = document.getElementById('contact-form');
const contactMessage = document.getElementById('contact-message');
const submitButton = document.getElementById('submit-button');
const loader = document.getElementById('loader');

// Function to send an email
const sendEmail = (e) => {
    e.preventDefault(); // Prevent default form submission

    // Show loader and disable the button
    loader.classList.remove('hidden');
    submitButton.disabled = true;
    contactMessage.textContent = 'Sending...';

    // Send form data using EmailJS
    emailjs.sendForm('service_1tnuekn', 'template_64vfnhh', '#contact-form', 'WU50jj5_IqzHhVJ0k')
        .then(() => {
            // Hide loader and re-enable the button
            loader.classList.add('hidden');
            submitButton.disabled = false;

            // Show success message
            contactMessage.textContent = 'Message sent successfully ✅';

            // Remove message after 5 seconds
            setTimeout(() => {
                contactMessage.textContent = '';
            }, 5000);

            // Reset the form
            contactForm.reset();
        })
        .catch(() => {
            // Hide loader and re-enable the button
            loader.classList.add('hidden');
            submitButton.disabled = false;

            // Show error message
            contactMessage.textContent = 'Message not sent (service error) ❌';
        });
};

// Add event listener to the form
contactForm.addEventListener('submit', sendEmail);
/*=============== SHOW SCROLL UP ===============*/
const scrollUp = () => {
    const scrollUp = document.getElementById('scroll-up')

    //when the scroll is more than 350 viewport add the show-scroll class to the tag with the scrollUp id
    this.scrollY >= 350 ? scrollUp.classList.add('show-scroll') : scrollUp.classList.remove('show-scroll')
}

window.addEventListener('scroll', scrollUp)

/*=============== SCROLL SECTIONS ACTIVE LINK ===============*/
const sections = document.querySelectorAll('section[id]')

const scrollActive = () => {
    const scrollDown = window.scrollY

    sections.forEach(current => {
        const sectionHeight = current.offsetHeight,
            sectionTop = current.offsetTop - 58,
            sectionId = current.getAttribute('id'),
            sectionsClass = document.querySelector('.nav__menu a[href*=' + sectionId + ']')

        if (scrollDown > sectionTop && scrollDown <= sectionTop + sectionHeight) {
            sectionsClass.classList.add('active-link')
        } else {
            sectionsClass.classList.remove('active-link')
        }
    })
}
window.addEventListener('scroll', scrollActive)

/*=============== DARK LIGHT THEME ===============*/
const themeButton = document.getElementById('theme-button')
const darkTheme = 'dark-theme'
const iconTheme = 'ri-sun-line'

// Previously selected topic (if user selected)
const selectedTheme = localStorage.getItem('selected-theme')
const selectedIcon = localStorage.getItem('selected-icon')

// We obtain the current theme that the interface has by validating the dark-theme class
const getCurrentTheme = () => document.body.classList.contains(darkTheme) ? 'dark' : 'light'
const getCurrentIcon = () => themeButton.classList.contains(iconTheme) ? 'ri-moon-line' : 'ri-sun-line'

// We validate if the user previously chose a topic
if (selectedTheme) {
    // If the validation is fulfilled, we ask what the issue was to know if we activated or deactivated the dark
    document.body.classList[selectedTheme === 'dark' ? 'add' : 'remove'](darkTheme)
    themeButton.classList[selectedIcon === 'ri-moon-line' ? 'add' : 'remove'](iconTheme)
}

// Activate / deactivate the theme manually with the button
themeButton.addEventListener('click', () => {
    // Add or remove the dark / icon theme
    document.body.classList.toggle(darkTheme)
    themeButton.classList.toggle(iconTheme)
    // We save the theme and the current icon that the user chose
    localStorage.setItem('selected-theme', getCurrentTheme())
    localStorage.setItem('selected-icon', getCurrentIcon())
})

/*=============== SCROLL REVEAL ANIMATION ===============*/
const scRev = ScrollReveal({
    origin: 'top',
    distance: '60px',
    duration: 2500,
    delay: 400,
    reset: true
})

scRev.reveal(`.home__perfil, .about__image, .contact__mail`, { origin: 'right' });
scRev.reveal(`.home__name, .home__info,
                .about__container .section__title-1, .about__info,
                .contact__social, .contact__data`, { origin: 'left' });
scRev.reveal(`.projects__card`, { interval: 100 });

/*=============== DYNAMIC PROJECTS ===============*/
const API_BASE = 'https://portfolio-rebrand.onrender.com'

const projectsGrid  = document.getElementById('projects-grid')
const projectsLoader = document.getElementById('projects-loader')
const loadMoreBtn   = document.getElementById('load-more-btn')
const pageInfoEl    = document.getElementById('projects-page-info')

let currentPage  = 1
let totalPages   = 1
const PAGE_SIZE  = 6

function buildProjectCard(p) {
    const stacks = (p.stacks || [])
        .map(s => `<span class="projects__stack-tag">${escapeHtml(s)}</span>`)
        .join('')

    const liveBtn = p.live_url
        ? `<a href="${escapeHtml(p.live_url)}" target="_blank" class="projects__button button">
               <i class="ri-arrow-right-up-line"></i>
           </a>`
        : ''

    const ghLink = p.github_url
        ? `<div class="projects__buttons">
               <a href="${escapeHtml(p.github_url)}" target="_blank" class="projects__link">
                   <i class="ri-github-line"></i>View
               </a>
           </div>`
        : ''

    const img = p.image_url
        ? `<img src="${escapeHtml(p.image_url)}" alt="${escapeHtml(p.title)}" class="projects__img" loading="lazy">`
        : ''

    return `
        <article class="projects__card">
            <div class="projects__image">
                ${img}
                ${liveBtn}
            </div>
            <div class="projects__content">
                <h3 class="projects__subtitle">${escapeHtml(p.subtitle || 'Project')}</h3>
                <h2 class="projects__title">${escapeHtml(p.title)}</h2>
                <p class="projects__description">${escapeHtml(p.description || '')}</p>
            </div>
            ${stacks ? `<div class="projects__terminologies">${stacks}</div>` : ''}
            ${ghLink}
        </article>`
}

async function fetchProjects(page) {
    const res = await fetch(`${API_BASE}/api/projects?page=${page}&limit=${PAGE_SIZE}`)
    if (!res.ok) throw new Error('API error ' + res.status)
    return res.json()
}

async function loadDynamicProjects(page = 1) {
    if (page === 1 && projectsLoader) projectsLoader.style.display = 'flex'

    try {
        const { data, meta } = await fetchProjects(page)

        if (projectsLoader) projectsLoader.remove()

        if (page === 1) {
            projectsGrid.innerHTML = data.map(buildProjectCard).join('')
        } else {
            projectsGrid.insertAdjacentHTML('beforeend', data.map(buildProjectCard).join(''))
        }

        currentPage = meta.page
        totalPages  = meta.totalPages

        if (meta.page >= meta.totalPages) {
            loadMoreBtn.classList.add('hidden')
            pageInfoEl.textContent = `Showing all ${meta.total} project${meta.total !== 1 ? 's' : ''}`
        } else {
            loadMoreBtn.classList.remove('hidden')
            loadMoreBtn.disabled = false
            loadMoreBtn.innerHTML = '<i class="ri-refresh-line"></i> Load More'
            pageInfoEl.textContent = `Page ${meta.page} of ${meta.totalPages}`
        }

        scRev.reveal('.projects__card', { interval: 100 })
    } catch {
        if (projectsLoader) projectsLoader.innerHTML = '<span>Could not load projects.</span>'
        loadMoreBtn.classList.add('hidden')
        pageInfoEl.textContent = ''
    }
}

if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', async () => {
        loadMoreBtn.disabled = true
        loadMoreBtn.innerHTML = '<i class="ri-loader-2-line"></i> Loading…'
        await loadDynamicProjects(currentPage + 1)
    })
}

loadDynamicProjects(1)

/*=============== DYNAMIC STACKS ===============*/
const stacksGrid   = document.getElementById('stacks-grid')
const stacksLoader = document.getElementById('stacks-loader')

const CATEGORY_LABELS = {
    frontend: 'Frontend',
    backend:  'Backend',
    database: 'Database',
    other:    'Other',
}

async function loadStacks() {
    try {
        const res = await fetch(`${API_BASE}/api/stacks`)
        if (!res.ok) throw new Error()
        const { data } = await res.json()

        if (stacksLoader) stacksLoader.remove()

        // group by category
        const groups = {}
        data.forEach(s => {
            const cat = s.category || 'other'
            if (!groups[cat]) groups[cat] = []
            groups[cat].push(s)
        })

        const order = ['frontend', 'backend', 'database', 'other']
        const html = order
            .filter(cat => groups[cat])
            .map(cat => `
                <div class="stacks__group">
                    <h3 class="stacks__category">${CATEGORY_LABELS[cat] || cat}</h3>
                    <ul class="stacks__list">
                        ${groups[cat].map(s => `
                            <li class="stacks__item">
                                ${s.icon ? `<span class="stacks__icon">${escapeHtml(s.icon)}</span>` : ''}
                                <span class="stacks__name">${escapeHtml(s.name)}</span>
                            </li>`).join('')}
                    </ul>
                </div>`).join('')

        stacksGrid.insertAdjacentHTML('beforeend', html)
        scRev.reveal('.stacks__group', { interval: 100 })
    } catch {
        if (stacksLoader) stacksLoader.innerHTML = '<span>Could not load stacks.</span>'
    }
}

loadStacks()

function escapeHtml(str) {
    return String(str ?? '').replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]))
}