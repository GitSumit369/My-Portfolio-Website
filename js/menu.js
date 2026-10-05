const mobileMenuBtn = document.getElementById("mobile-menu");
const navMenu = document.getElementById("nav-menu");

if (mobileMenuBtn && navMenu) {

    mobileMenuBtn.addEventListener("click", function () {

        this.classList.toggle("active");
        navMenu.classList.toggle("active");

    });

    const navLinks = navMenu.querySelectorAll("a");

    navLinks.forEach(function (link) {

        link.addEventListener("click", function () {

            mobileMenuBtn.classList.remove("active");
            navMenu.classList.remove("active");

        });

    });
}