document.addEventListener("DOMContentLoaded", () => {
    // Form and button elements
    const saeForm = document.getElementById("sae-form");
    const submitBtn = document.getElementById("submit-btn");
    const spinner = document.getElementById("spinner");

    // Scanner elements
    const scanBtn = document.getElementById("scan-btn");
    const scannerContainer = document.getElementById("scanner-container");
    const closeScannerBtn = document.getElementById("close-scanner");
    const serialInput = document.getElementById("serialNumber");

    // Initialize the scanner
    const html5QrCode = new Html5Qrcode("reader");

    // --- Barcode Scanner Logic ---
    const qrCodeSuccessCallback = (decodedText, decodedResult) => {
        // Handle successful scan
        console.log(`Scan result: ${decodedText}`, decodedResult);
        serialInput.value = decodedText; // Populate the input field
        stopScanner();
    };

    const qrCodeErrorCallback = (errorMessage) => {
        // Handle scan error, (optional)
        // console.warn(`Scan error: ${errorMessage}`);
    };

    const config = { fps: 10, qrbox: { width: 250, height: 250 } };

    // Function to start the scanner
    function startScanner() {
        scannerContainer.style.display = "flex";
        // Start scanning with camera
        html5QrCode.start(
            { facingMode: "environment" }, // Use the back camera
            config,
            qrCodeSuccessCallback,
            qrCodeErrorCallback
        ).catch((err) => {
            console.error("Unable to start scanner", err);
            alert("Error: Could not start camera. Please check permissions.");
            scannerContainer.style.display = "none";
        });
    }

    // Function to stop the scanner
    function stopScanner() {
        html5QrCode.stop().then(() => {
            scannerContainer.style.display = "none";
        }).catch((err) => {
            console.warn("Scanner already stopped or failed to stop.", err);
            scannerContainer.style.display = "none";
        });
    }

    // Event listeners for scanner buttons
    scanBtn.addEventListener("click", startScanner);
    closeScannerBtn.addEventListener("click", stopScanner);


    // --- Form Submission Logic ---
    saeForm.addEventListener("submit", (e) => {
        e.preventDefault(); // Prevent the form from reloading the page

        // Show loading state
        submitBtn.disabled = true;
        spinner.style.display = "block";

        const formData = new FormData(saeForm);

        // Send data to Google Apps Script
        fetch(SCRIPT_URL, {
            method: "POST",
            body: formData,
        })
        .then(response => response.json()) // Parse the JSON response from the script
        .then(data => {
            // Hide loading state
            submitBtn.disabled = false;
            spinner.style.display = "none";

            if (data.result === "success") {
                // **Show pop-up on success**
                alert("Submission Confirmed! Data saved successfully.");
                saeForm.reset(); // Clear the form
            } else {
                // Show error message from the script
                console.error("Error from script:", data.message);
                alert("Error: " + data.message);
            }
        })
        .catch(error => {
            // Handle network or other errors
            submitBtn.disabled = false;
            spinner.style.display = "none";
            console.error("Submission Error:", error);
            alert("Error: Could not submit form. Please check network.");
        });
    });
});
