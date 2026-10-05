const reviewsContainer =
    document.querySelector(".reviews-grid");

const reviewForm =
    document.querySelector(".review-form-section form");


// =========================
// REVIEW SETTINGS
// =========================

const REVIEWS_PER_PAGE = 6;

let allReviews = [];
let currentPage = 1;


// =========================
// LOAD REVIEWS
// =========================

async function loadReviews() {

    try {

        const response =
            await fetch("/api/reviews");

        const data =
            await response.json();


        if (!data.success) {

            console.error(data.message);

            return;

        }


        allReviews = data.reviews || [];

        currentPage = 1;

        renderReviews();


    } catch (error) {

        console.error(
            "Could not load reviews:",
            error
        );

    }

}


// =========================
// RENDER REVIEWS
// =========================

function renderReviews() {

    reviewsContainer.innerHTML = "";


    // No reviews
    if (allReviews.length === 0) {

        reviewsContainer.innerHTML = `

            <div class="empty-reviews"
                 style="display:block;">

                <h2>No reviews yet</h2>

                <p>
                    Be the first client to share
                    your experience working with me.
                </p>

            </div>

        `;

        removePagination();

        return;
    }


    // Calculate reviews for current page

    const startIndex =
        (currentPage - 1) * REVIEWS_PER_PAGE;

    const endIndex =
        startIndex + REVIEWS_PER_PAGE;


    const pageReviews =
        allReviews.slice(startIndex, endIndex);


    // Create cards

    pageReviews.forEach(function (review) {

        const card =
            document.createElement("div");

        card.className = "review-card";


        const rating =
            Math.min(
                5,
                Math.max(0, Number(review.rating))
            );


        const stars =
            "★".repeat(rating) +
            "☆".repeat(5 - rating);


        card.innerHTML = `

            <div class="stars">
                ${stars}
            </div>

            <p class="review-text">
                "${escapeHTML(review.review)}"
            </p>

            <div class="review-author">

                <strong>
                    ${escapeHTML(review.name)}
                </strong>

                <span>
                    ${
                        review.business_name
                            ? escapeHTML(review.business_name)
                            : "Client"
                    }
                </span>

            </div>

        `;


        reviewsContainer.appendChild(card);

    });


    renderPagination();
}


// =========================
// PAGINATION
// =========================

function renderPagination() {

    removePagination();


    const totalPages =
        Math.ceil(
            allReviews.length /
            REVIEWS_PER_PAGE
        );


    // No need for pagination
    // when everything fits on one page

    if (totalPages <= 1) {

        return;

    }


    const pagination =
        document.createElement("div");

    pagination.className =
        "reviews-pagination";


    // Previous button

    const previousButton =
        document.createElement("button");

    previousButton.textContent =
        "← Previous";

    previousButton.disabled =
        currentPage === 1;


    previousButton.addEventListener(
        "click",
        function () {

            if (currentPage > 1) {

                currentPage--;

                renderReviews();

                scrollToReviews();

            }

        }
    );


    pagination.appendChild(previousButton);


    // Page numbers

    for (
        let page = 1;
        page <= totalPages;
        page++
    ) {

        const pageButton =
            document.createElement("button");


        pageButton.textContent =
            page;


        if (page === currentPage) {

            pageButton.classList.add(
                "active"
            );

        }


        pageButton.addEventListener(
            "click",
            function () {

                currentPage = page;

                renderReviews();

                scrollToReviews();

            }
        );


        pagination.appendChild(pageButton);

    }


    // Next button

    const nextButton =
        document.createElement("button");

    nextButton.textContent =
        "Next →";

    nextButton.disabled =
        currentPage === totalPages;


    nextButton.addEventListener(
        "click",
        function () {

            if (currentPage < totalPages) {

                currentPage++;

                renderReviews();

                scrollToReviews();

            }

        }
    );


    pagination.appendChild(nextButton);


    // Put pagination after review grid

    reviewsContainer.parentNode.insertBefore(
        pagination,
        reviewsContainer.nextSibling
    );
}


// =========================
// REMOVE PAGINATION
// =========================

function removePagination() {

    const existingPagination =
        document.querySelector(
            ".reviews-pagination"
        );


    if (existingPagination) {

        existingPagination.remove();

    }

}


// =========================
// SCROLL TO REVIEWS
// =========================

function scrollToReviews() {

    reviewsContainer.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


// =========================
// SUBMIT REVIEW
// =========================

reviewForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const selectedRating =
            document.querySelector(
                'input[name="rating"]:checked'
            );


        if (!selectedRating) {

            alert("Please select a rating.");

            return;

        }


        const reviewData = {

            name:
                document.getElementById("name").value.trim(),

            business_name:
                document.getElementById("business").value.trim(),

            rating:
                Number(selectedRating.value),

            review:
                document.getElementById("review").value.trim()

        };


        const button =
            document.querySelector(
                ".submit-review"
            );


        button.disabled = true;

        button.textContent =
            "Submitting...";


        try {

            const response =
                await fetch(
                    "/api/reviews",
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify(
                                reviewData
                            )

                    }
                );


            const result =
                await response.json();


            if (result.success) {

                alert(
                    "Thank you! Your review has been submitted and is awaiting approval."
                );


                reviewForm.reset();


            } else {

                alert(
                    result.message
                );

            }


        } catch (error) {

            console.error(error);

            alert(
                "Unable to connect to the server."
            );

        }


        button.disabled = false;

        button.textContent =
            "Submit Review";

    }
);


// =========================
// BASIC HTML ESCAPING
// =========================

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;

}


// =========================
// INITIAL LOAD
// =========================

loadReviews();