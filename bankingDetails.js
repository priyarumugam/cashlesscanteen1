async function add() {
    // Get form data
    const formData = {
        accountHolderName: document.getElementById('account-holder-name').value,
        accountNumber: document.getElementById('account-number').value,
        ifscCode: document.getElementById('ifsc-code').value,
        bankName: document.getElementById('bank-name').value,
        email: document.getElementById('email').value,
        phoneNumber: document.getElementById('phone-number').value,
    };

    try {
        // Send data to the server
        const response = await fetch('http://localhost:3000/api/save-banking-details', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        if (response.ok) {
            alert('Banking details added successfully!');
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message);
        }
    } catch (error) {
        console.error('Error adding banking details:', error.message);
        document.getElementById('validation-error').innerText = 'Error adding banking details.';
    }

    // Prevent the form from submitting normally
    return false;
}

function cancelpage() {
    // Implement cancel logic if needed
    alert('Cancel button clicked.');
}