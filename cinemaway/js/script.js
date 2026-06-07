// Configuration Supabase
const supabaseUrl = "https://mbseywbnkawxhealauuf.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ic2V5d2Jua2F3eGhlYWxhdXVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4NTY3ODgsImV4cCI6MjA5NjQzMjc4OH0.v9YbUIg1ZkvbsmFOlIKRDBIbyqB6NAp00HIAZcD6fVE";

const supabaseClient = supabase.createClient(
  supabaseUrl,
  supabaseKey
);

const initAnimations = () => {
    // 1. Page Load Animation
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);

    // 2. Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }, { passive: true });
    }

    // 3. Staggered scroll reveal using IntersectionObserver
    const revealElements = document.querySelectorAll('.reveal-hidden, .reveal-scale');
    
    if (revealElements.length > 0) {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -60px 0px' // triggers slightly before entering the frame
        };

        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = entry.target;
                    
                    // Stagger cards dynamically inside their grid
                    if (target.classList.contains('service-card')) {
                        const grid = target.closest('.services-grid');
                        if (grid) {
                            const cards = Array.from(grid.querySelectorAll('.service-card'));
                            const index = cards.indexOf(target);
                            target.style.transitionDelay = `${index * 0.18}s`;
                        }
                    }
                    
                    target.classList.add('reveal-active');
                    revealObserver.unobserve(target); // Animate only once
                }
            });
        }, observerOptions);

        revealElements.forEach(el => {
            revealObserver.observe(el);
        });
    }

    // 4. Parallax effect on hero video background
    const heroVideo = document.querySelector('.hero-video');
    if (heroVideo) {
        window.addEventListener('scroll', () => {
            const scrollOffset = window.scrollY;
            // Only calculate parallax if the hero section is on screen (height is 893px)
            if (scrollOffset <= 920) {
                // Adjust translateY and add a micro-zoom to create premium physical depth
                heroVideo.style.transform = `translateY(${scrollOffset * 0.28}px) scale(${1.05 + scrollOffset * 0.00005})`;
            }
        }, { passive: true });
    }

    // 5. Smart Morphing Navbar Animation
    const path = window.location.pathname;
    const isProjectsPage = path.includes('projects.html') || document.body.classList.contains('projects-page');
    const isServicesPage = path.includes('services.html') || document.body.classList.contains('services-page');

    if (navbar) {
        if (isProjectsPage) {
            navbar.classList.remove('navbar-projects-active');
            void navbar.offsetHeight; // force reflow
            setTimeout(() => {
                navbar.classList.add('navbar-projects-active');
            }, 100);
        } else if (isServicesPage) {
            navbar.classList.remove('navbar-services-active');
            void navbar.offsetHeight; // force reflow
            setTimeout(() => {
                navbar.classList.add('navbar-services-active');
            }, 100);
        }

        // Intercept all links targeting projects.html to run morph animation
        const projectsLinks = document.querySelectorAll('a[href*="projects.html"]');
        projectsLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                const titleText = navbar.querySelector('.active-page-title .title-text');
                if (titleText) {
                    titleText.textContent = 'Projects';
                }

                navbar.classList.remove('navbar-services-active');
                navbar.classList.add('navbar-projects-active');

                setTimeout(() => {
                    window.location.href = link.getAttribute('href');
                }, 500); // 500ms matches style.css transition
            });
        });

        // Intercept all links targeting services.html to run morph animation
        const servicesLinks = document.querySelectorAll('a[href*="services.html"]');
        servicesLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                const titleText = navbar.querySelector('.active-page-title .title-text');
                if (titleText) {
                    titleText.textContent = 'Services';
                }

                navbar.classList.remove('navbar-projects-active');
                navbar.classList.add('navbar-services-active');

                setTimeout(() => {
                    window.location.href = link.getAttribute('href');
                }, 500); // 500ms matches style.css transition
            });
        });

        // Intercept back-to-home links when on a subpage to morph back before navigating
        const backToHomeLinks = document.querySelectorAll('a[href*="index.html"], a[href^="#"]');
        backToHomeLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                if (isProjectsPage || isServicesPage) {
                    e.preventDefault();
                    
                    navbar.classList.remove('navbar-projects-active');
                    navbar.classList.remove('navbar-services-active');

                    setTimeout(() => {
                        window.location.href = link.getAttribute('href');
                    }, 500); // 500ms matches style.css transition
                }
            });
        });
    }

    // 6. Interactive Projects Grid Overlay & Spline Transitions
    const btnCheckProjects = document.getElementById('btn-check-projects');
    const entranceView = document.getElementById('entrance-view');

    // Projects Explore View (State 2 - Selection Layout)
    const projectsExploreView = document.getElementById('projects-explore-view');
    const btnExploreCheck = document.getElementById('btn-explore-check');
    const peActionBlock = projectsExploreView ? projectsExploreView.querySelector('.pe-action-block') : null;
    const projectItems = document.querySelectorAll('.pe-project-item');
    const coverImages = document.querySelectorAll('.pe-cover-img');

    // Short Film View (State 3 - Project Detail)
    const shortFilmView = document.getElementById('short-film-view');
    const btnSfBack = document.getElementById('btn-sf-back');
    const peDetailSubtitle = document.getElementById('pe-detail-subtitle');
    const peDetailDescription = document.getElementById('pe-detail-description');

    let selectedProject = null; // Track selected project key
    let currentViewState = 'entrance'; // 'entrance', 'explore', 'detail'

    const projectData = {
        fckprblms: {
            title: 'FCKPRBLMS',
            tag: 'creative film',
            description: 'Lorem Ipsum est un générateur de faux textes aléatoires. Vous choisissez le nombre de paragraphes, de mots ou de listes. Vous obtenez alors un texte aléatoire que vous pourrez ensuite utiliser librement dans vos maquettes. Le texte généré est du pseudo latin et peut donner l\'impression d\'être du vrai texte.'
        },
        light: {
            title: 'LET THE LIGHT',
            tag: 'cinematography',
            description: 'Sculpter les émotions brutes à travers les ombres et les conceptions de lumière de qualité supérieure. Une leçon magistrale de drame visuel à fort contraste et de sculpture de lumière. Une expérience visuelle mémorable.'
        },
        ali: {
            title: 'MUHAMMAD ALI',
            tag: 'documentary',
            description: 'Un documentaire historique détaillant le combat légendaire et l\'héritage visuel de Neil Leifer. Un voyage d\'archives immersif dans l\'histoire de la cinématographie sportive et du journalisme visuel.'
        },
        wwii: {
            title: 'WORLD WAR II',
            tag: 'historical film',
            description: 'Une exploration approfondie basée sur les archives des histoires des héros de guerre méconnus. Vivez l\'histoire recréée avec une précision cinématographique moderne, de superbes effets sonores et visuels.'
        }
    };

    const showExploreView = () => {
        if (!projectsExploreView) return;
        currentViewState = 'explore';

        // Fade out entrance view
        if (entranceView) {
            entranceView.style.opacity = '0';
            entranceView.style.transform = 'scale(0.95) translateY(-20px)';
            entranceView.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            entranceView.style.pointerEvents = 'none';
        }

        // Show explore view overlay
        projectsExploreView.style.display = 'flex';
        void projectsExploreView.offsetHeight; // force reflow
        projectsExploreView.classList.add('active');

        setTimeout(() => {
            if (currentViewState === 'explore') {
                if (entranceView) entranceView.style.display = 'none';
            }
        }, 400);
    };

    const hideExploreView = () => {
        if (!projectsExploreView) return;
        currentViewState = 'entrance';

        // Hide explore view overlay
        projectsExploreView.classList.remove('active');

        // Show entrance view
        if (entranceView) {
            entranceView.style.display = 'flex';
            void entranceView.offsetHeight; // force reflow
            entranceView.style.opacity = '1';
            entranceView.style.transform = 'scale(1) translateY(0)';
            entranceView.style.pointerEvents = 'auto';
            entranceView.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        }

        setTimeout(() => {
            if (currentViewState === 'entrance') {
                projectsExploreView.style.display = 'none';
            }
        }, 400);
    };

    const showDetailView = () => {
        if (!shortFilmView) return;
        currentViewState = 'detail';

        if (!selectedProject) {
            selectedProject = 'fckprblms';
            const firstItem = document.querySelector('.pe-project-item[data-project="fckprblms"]');
            if (firstItem) firstItem.classList.add('active');
        }

        const data = projectData[selectedProject];
        if (data) {
            if (peDetailSubtitle) peDetailSubtitle.textContent = data.tag;
            if (peDetailDescription) peDetailDescription.textContent = data.description;
        }

        // Add pe-inactive class to non-selected items
        projectItems.forEach(item => {
            if (item.getAttribute('data-project') !== selectedProject) {
                item.classList.add('pe-inactive');
            }
        });

        // Add sf-mode class to explore view to trigger layout overrides
        if (projectsExploreView) {
            projectsExploreView.classList.add('sf-mode');
        }
        // Show detail view overlay
        shortFilmView.style.display = 'flex';
        void shortFilmView.offsetHeight; // force reflow
        shortFilmView.classList.add('active');
    };

    const hideDetailView = () => {
        if (!shortFilmView) return;
        currentViewState = 'explore';

        // Hide detail view overlay
        shortFilmView.classList.remove('active');

        // Remove pe-inactive class from all items
        projectItems.forEach(item => {
            item.classList.remove('pe-inactive');
        });

        // Remove sf-mode class from explore view to return to list layout
        if (projectsExploreView) {
            projectsExploreView.classList.remove('sf-mode');
        }

        setTimeout(() => {
            if (currentViewState === 'explore') {
                shortFilmView.style.display = 'none';
            }
        }, 400);
    };

    // State 1: Clicking Check transitions to Explore selection layout
    if (btnCheckProjects) {
        btnCheckProjects.addEventListener('click', showExploreView);
    }

    let hoverTimeout = null;

    // State 2: Project Item clicks & hovers (0.50s delay)
    projectItems.forEach(item => {
        // Mouse enter (start hover timer)
        item.addEventListener('mouseenter', () => {
            const projectKey = item.getAttribute('data-project');
            if (hoverTimeout) clearTimeout(hoverTimeout);

            hoverTimeout = setTimeout(() => {
                coverImages.forEach(img => img.classList.remove('active'));
                const hoverCover = document.getElementById(`cover-${projectKey}`);
                if (hoverCover) {
                    hoverCover.classList.add('active');
                }
                // Show Check button on right on hover
                if (peActionBlock) peActionBlock.classList.add('active');
            }, 500); // 0.50 seconds delay
        });

        // Mouse leave (restore selected cover)
        item.addEventListener('mouseleave', () => {
            if (hoverTimeout) clearTimeout(hoverTimeout);

            coverImages.forEach(img => img.classList.remove('active'));
            if (selectedProject) {
                const activeCover = document.getElementById(`cover-${selectedProject}`);
                if (activeCover) {
                    activeCover.classList.add('active');
                }
            } else {
                // Hide Check button if no project is locked/selected
                if (peActionBlock) peActionBlock.classList.remove('active');
            }
        });

        // Click to select/lock
        item.addEventListener('click', () => {
            if (hoverTimeout) clearTimeout(hoverTimeout);

            const projectKey = item.getAttribute('data-project');
            selectedProject = projectKey;

            // Highlight selected text title and dot
            projectItems.forEach(pi => pi.classList.remove('active'));
            item.classList.add('active');

            // Show corresponding project cover image
            coverImages.forEach(img => img.classList.remove('active'));
            const activeCover = document.getElementById(`cover-${projectKey}`);
            if (activeCover) {
                activeCover.classList.add('active');
            }

            // Lock Check button on right to visible
            if (peActionBlock) peActionBlock.classList.add('active');
        });
    });

    // State 2: Check button goes to selected project Detail View (State 3)
    if (btnExploreCheck) {
        btnExploreCheck.addEventListener('click', () => {
            if (!selectedProject) {
                // Default to first project if none selected yet
                selectedProject = 'fckprblms';
                const firstItem = document.querySelector('.pe-project-item[data-project="fckprblms"]');
                if (firstItem) firstItem.click();
            }
            showDetailView();
        });
    }

    // State 3: Back button goes back to Explore selection layout
    if (btnSfBack) {
        btnSfBack.addEventListener('click', hideDetailView);
    }

    // Force show entrance view immediately on projects page with a 1.20s (1200ms) delay
    if (isProjectsPage && entranceView) {
        setTimeout(() => {
            entranceView.classList.add('reveal-active');
            entranceView.style.opacity = '1';
            entranceView.style.transform = 'scale(1) translateY(0)';
        }, 1200);
    }

    // Keyboard 'Enter' navigation through views on Projects Page
    if (isProjectsPage) {
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (currentViewState === 'entrance') {
                    showExploreView();
                } else if (currentViewState === 'explore') {
                    if (!selectedProject) {
                        selectedProject = 'fckprblms';
                        const firstItem = document.querySelector('.pe-project-item[data-project="fckprblms"]');
                        if (firstItem) firstItem.click();
                    }
                    showDetailView();
                } else if (currentViewState === 'detail') {
                    hideDetailView();
                }
            }
        });
    }

    // ================================================
    // SERVICES PAGE INTERACTIVITY (CD + Click-to-Detail)
    // ================================================
    if (isServicesPage) {
        const wrappers = document.querySelectorAll('.se-card-wrapper');
        const cardsRow = document.getElementById('se-cards-row');
        const descBlock = document.getElementById('se-desc-block');
        const descTitle = document.getElementById('se-desc-title');
        const descLead = document.getElementById('se-desc-lead');
        const descParagraph = document.getElementById('se-desc-paragraph');
        const descBullets = document.getElementById('se-desc-bullets');
        let selectedService = null; // No default selection on load

        // Default static content
        const defaultContent = {
            title: 'OUR SERVICES',
            lead: 'We craft cinematic visuals that transform ideas into immersive experiences.',
            paragraph: 'Cinemaway combines storytelling, technology, and visual artistry to produce impactful cinematic content for brands, audiences, and creators.',
            bullets: []
        };

        // Service-specific content from Figma
        const serviceContent = {
            movies: {
                title: 'Movies',
                lead: 'From concept to final frame, we produce cinematic films focused on storytelling, emotion, and visual atmosphere.',
                paragraph: '',
                bullets: ['Short Films', 'Creative Direction', 'Screenwriting', 'Cinematic Editing', 'Color Grading']
            },
            docs: {
                title: 'Documentaries',
                lead: 'Authentic and visually compelling documentaries designed to capture real stories with depth and emotion.',
                paragraph: '',
                bullets: ['Interviews', 'Story Development', 'Event Coverage', 'Narrative Editing', 'Documentary Production']
            },
            td: {
                title: '3D Production',
                lead: 'We create immersive 3D visuals and animations that blend cinematic aesthetics with modern digital experiences.',
                paragraph: '',
                bullets: ['3D Animation', 'Motion Design', 'CGI Visuals', 'Product Visualization', 'VFX Integration']
            }
        };

        /**
         * Update the description block with the given content data.
         * Uses a fade-out / swap / fade-in animation.
         */
        function updateDescBlock(content) {
            // Fade out
            descBlock.classList.add('fade-out');

            setTimeout(() => {
                // Swap title
                descTitle.innerHTML = content.title + ' <span class="dot">.</span>';

                // Swap lead
                descLead.textContent = content.lead;

                // Swap paragraph (show/hide)
                if (content.paragraph) {
                    descParagraph.textContent = content.paragraph;
                    descParagraph.style.display = '';
                } else {
                    descParagraph.textContent = '';
                    descParagraph.style.display = 'none';
                }

                // Swap bullets
                if (content.bullets && content.bullets.length > 0) {
                    descBullets.innerHTML = content.bullets.map(b => `<li>${b}</li>`).join('');
                    descBullets.classList.add('visible');
                } else {
                    descBullets.innerHTML = '';
                    descBullets.classList.remove('visible');
                }

                // Fade back in
                descBlock.classList.remove('fade-out');
            }, 300); // matches CSS transition duration
        }

        wrappers.forEach(wrapper => {
            const serviceKey = wrapper.getAttribute('data-service');

            // Hover preview (visual only — no text updates)
            wrapper.addEventListener('mouseenter', () => {
                wrappers.forEach(w => w.classList.remove('active'));
                wrapper.classList.add('active');
            });

            // Hover leave — restore locked active card
            wrapper.addEventListener('mouseleave', () => {
                wrappers.forEach(w => w.classList.remove('active'));
                if (selectedService) {
                    const activeWrapper = document.querySelector(`.se-card-wrapper[data-service="${selectedService}"]`);
                    if (activeWrapper) {
                        activeWrapper.classList.add('active');
                    }
                }
            });

            // Click — two-step interaction:
            // 1st click: show service details
            // 2nd click (same service): slide to brief form
            // 3rd click (same service): deselect and hide everything
            wrapper.addEventListener('click', () => {
                if (selectedService === serviceKey) {
                    if (!briefShowing) {
                        // 2nd click — show brief form
                        briefShowing = true;
                        showBriefSection(serviceKey);
                    } else {
                        // 3rd click — deselect everything
                        selectedService = null;
                        briefShowing = false;
                        wrapper.classList.remove('active');
                        cardsRow.classList.remove('has-selection');
                        updateDescBlock(defaultContent);
                        hideBriefSection();
                    }
                } else {
                    // 1st click (or switching service) — show details only
                    selectedService = serviceKey;
                    briefShowing = false;
                    wrappers.forEach(w => w.classList.remove('active'));
                    wrapper.classList.add('active');
                    cardsRow.classList.add('has-selection');
                    updateDescBlock(serviceContent[serviceKey]);
                    hideBriefSection();
                }
            });
        });

        // ================================================
        // BRIEF FORM — Show / Hide / Prefill
        // ================================================
        const briefSection = document.getElementById('brief-section');
        const briefForm = document.getElementById('brief-form');
        const briefSubmitBtn = document.getElementById('bf-submit');
        const briefSuccess = document.getElementById('brief-success');
        const briefSuccessClose = document.getElementById('brief-success-close');
        const successProjectId = document.getElementById('success-project-id');
        const projectTypeSelect = document.getElementById('bf-project-type');

        // Maps service keys to the project type dropdown value and checkbox values
        const serviceToProjectType = {
            movies: 'Film Production',
            docs: 'Documentary',
            td: 'Motion Graphics'
        };

        const serviceToCheckboxes = {
            movies: ['Filming', 'Script Writing', 'Video Editing', 'Color Grading'],
            docs: ['Filming', 'Video Editing', 'Sound Design'],
            td: ['Motion Graphics', 'Color Grading']
        };

        function showBriefSection(serviceKey) {
            if (!briefSection) return;

            // Pre-fill project type
            if (projectTypeSelect && serviceToProjectType[serviceKey]) {
                projectTypeSelect.value = serviceToProjectType[serviceKey];
            }

            // Pre-check relevant services
            const checkboxes = briefForm.querySelectorAll('input[name="services_needed"]');
            const autoCheck = serviceToCheckboxes[serviceKey] || [];
            checkboxes.forEach(cb => {
                cb.checked = autoCheck.includes(cb.value);
            });

            // Reveal section
            briefSection.classList.add('visible');

            // Smooth scroll to brief section after a short delay for the reveal animation
            setTimeout(() => {
                briefSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 200);
        }

        function hideBriefSection() {
            if (!briefSection) return;
            briefSection.classList.remove('visible');

            // Scroll back to services cards
            const container = document.querySelector('.se-container-inner');
            if (container) {
                setTimeout(() => {
                    container.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
            }
        }

        // ================================================
        // FORM VALIDATION & SUBMISSION
        // ================================================
        if (briefForm) {
            briefForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                // Clear previous errors
                briefForm.querySelectorAll('.has-error').forEach(el => el.classList.remove('has-error'));
                briefForm.querySelectorAll('.field-error').forEach(el => el.textContent = '');

                // Validate required fields
                let isValid = true;

                const fullName = document.getElementById('bf-fullname');
                if (!fullName.value.trim()) {
                    setFieldError(fullName, 'err-fullname', 'Full name is required');
                    isValid = false;
                }

                const email = document.getElementById('bf-email');
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!email.value.trim()) {
                    setFieldError(email, 'err-email', 'Email address is required');
                    isValid = false;
                } else if (!emailRegex.test(email.value.trim())) {
                    setFieldError(email, 'err-email', 'Please enter a valid email');
                    isValid = false;
                }

                const projectTitle = document.getElementById('bf-project-title');
                if (!projectTitle.value.trim()) {
                    setFieldError(projectTitle, 'err-project-title', 'Project title is required');
                    isValid = false;
                }

                const description = document.getElementById('bf-description');
                if (!description.value.trim()) {
                    setFieldError(description, 'err-description', 'Project description is required');
                    isValid = false;
                }

                if (!isValid) {
                    // Scroll to first error
                    const firstError = briefForm.querySelector('.has-error');
                    if (firstError) {
                        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                    return;
                }

                // Collect services checked
                const servicesChecked = [];
                briefForm.querySelectorAll('input[name="services_needed"]:checked').forEach(cb => {
                    servicesChecked.push(cb.value);
                });

                // Build payload
                const payload = {
                    full_name: fullName.value.trim(),
                    company: document.getElementById('bf-company').value.trim(),
                    email: email.value.trim(),
                    phone: document.getElementById('bf-phone').value.trim(),
                    project_title: projectTitle.value.trim(),
                    project_type: projectTypeSelect.value || '',
                    project_description: description.value.trim(),
                    services_needed: servicesChecked.join(', '),
                    estimated_budget: document.getElementById('bf-budget').value || '',
                    desired_deadline: document.getElementById('bf-deadline').value || '',
                    project_location: document.getElementById('bf-location').value.trim(),
                    reference_links: document.getElementById('bf-references').value.trim(),
                    additional_notes: document.getElementById('bf-notes').value.trim()
                };

                // Submit to Supabase instead of local API
                briefSubmitBtn.classList.add('loading');
                briefSubmitBtn.disabled = true;

                try {
                    const { data, error } = await supabaseClient
                        .from("project_briefs")
                        .insert([
                            {
                                full_name: payload.full_name,
                                email: payload.email,
                                project_title: payload.project_title,
                                project_description: payload.project_description,
                                status: "New Lead"
                            }
                        ])
                        .select();

                    if (error) {
                        console.error('Supabase Error:', error);
                        alert("Error sending project: " + error.message);
                    } else {
                        // Show success overlay
                        // data[0] contains the inserted row if successful
                        successProjectId.textContent = 'Project ID: ' + (data && data[0] && data[0].id ? data[0].id : 'Sent');
                        briefSuccess.classList.add('visible');
                        briefForm.reset();
                    }
                } catch (err) {
                    console.error('Submission error:', err);
                    alert('Could not connect to Supabase. Please try again later.');
                } finally {
                    briefSubmitBtn.classList.remove('loading');
                    briefSubmitBtn.disabled = false;
                }
            });
        }

        // Success overlay close
        if (briefSuccessClose) {
            briefSuccessClose.addEventListener('click', () => {
                briefSuccess.classList.remove('visible');
                hideBriefSection();
                // Deselect current card
                selectedService = null;
                wrappers.forEach(w => w.classList.remove('active'));
                cardsRow.classList.remove('has-selection');
                updateDescBlock(defaultContent);
            });
        }

        function setFieldError(inputEl, errorId, message) {
            inputEl.classList.add('has-error');
            const errSpan = document.getElementById(errorId);
            if (errSpan) errSpan.textContent = message;
        }
    }

}

// Bulletproof execution checking document readyState to avoid DOMContentLoaded race conditions
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnimations);
} else {
    initAnimations();
}
