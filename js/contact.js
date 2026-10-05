const contactForm = document.querySelector(".contact-form form");

contactForm.addEventListener("submit", async function (event) {

    event.preventDefault();


    const formData = {

        name: document.getElementById("name").value,

        business_name:
            document.getElementById("business").value,

        business_type:
            document.getElementById("business-type").value,

        contact:
            document.getElementById("contact").value,

        message:
            document.getElementById("message").value

    };


    const button = document.querySelector(".submit-btn");

    button.disabled = true;

    button.textContent = "Sending...";


    try {

        const response = await fetch("/api/contact", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(formData)

        });


        const result = await response.json();


        if (result.success) {

            alert(
                "Your inquiry has been sent successfully. I'll get back to you soon."
            );

            contactForm.reset();

        } else {

            alert(result.message);

        }


    } catch (error) {

        console.error(error);

        alert(
            "Unable to connect to the server. Please try again."
        );

    }


    button.disabled = false;

    button.textContent = "Send Inquiry";

});