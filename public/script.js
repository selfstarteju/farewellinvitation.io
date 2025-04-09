// script.js
document.addEventListener('DOMContentLoaded', function() {
    const registrationForm = document.getElementById('registrationForm');
    const invitationCard = document.getElementById('invitationCard');
    const inviteeName = document.getElementById('inviteeName');
    const invitationId = document.getElementById('invitationId');
    const downloadBtn = document.getElementById('downloadInvitation');
    const backToFormBtn = document.getElementById('backToForm');
    
    // API URL - using port 3001
    const API_URL = 'http://localhost:3001/api/registrations';
    
    // Form submission handler
    registrationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const studentId = document.getElementById('studentId').value;
        const batch = document.getElementById('batch').value;
        const message = document.getElementById('message').value;
        
        // Create registration data object
        const registrationData = {
            name,
            email,
            studentId,
            batch,
            message
        };
        
        // Send registration to backend
        sendToBackend(registrationData);
    });
    
    // Display the invitation card with personalized details
    function showInvitationCard(registration) {
        // Hide the form and show the invitation card
        document.querySelector('.form-container').style.display = 'none';
        document.querySelector('.event-details-section').style.display = 'none';
        invitationCard.classList.remove('hidden');
        
        // Update the invitation card with the registrant's details
        inviteeName.textContent = registration.name;
        invitationId.textContent = registration.id;
        
        // Scroll to the invitation card
        invitationCard.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Return to the registration form
    backToFormBtn.addEventListener('click', function() {
        invitationCard.classList.add('hidden');
        document.querySelector('.form-container').style.display = 'block';
        document.querySelector('.event-details-section').style.display = 'block';
        registrationForm.reset();
        
        // Scroll back to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    // Download invitation as PDF
    downloadBtn.addEventListener('click', function() {
        // Use html2canvas to capture the invitation card
        html2canvas(invitationCard, {
            scale: 2, // Higher quality
            useCORS: true,
            logging: false
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jspdf.jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            
            // Calculate dimensions to fit the invitation on the PDF
            const imgWidth = 210; // A4 width in mm
            const pageHeight = 297; // A4 height in mm
            const imgHeight = canvas.height * imgWidth / canvas.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save(`SCSM_Farewell_Invitation_${invitationId.textContent}.pdf`);
        });
    });
    
    // Send data to backend API
    function sendToBackend(registrationData) {
        // For demonstration, we'll simulate a successful response
        // In a real implementation, uncomment the fetch code below
        
        // Simulate a successful registration
        const mockResponse = {
            success: true,
            registration: {
                id: generateInvitationId(registrationData.name, registrationData.studentId),
                name: registrationData.name,
                email: registrationData.email,
                studentId: registrationData.studentId,
                batch: registrationData.batch,
                message: registrationData.message,
                registrationDate: new Date().toISOString()
            }
        };
        
        showInvitationCard(mockResponse.registration);
        
        // Uncomment this for actual API integration
        /*
        fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(registrationData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Registration successful
                console.log('Registration successful:', data);
                showInvitationCard(data.registration);
            } else {
                // Registration failed
                alert(`Registration failed: ${data.message}`);
                console.error('Registration error:', data);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred. Please try again later.');
        });
        */
    }
    
    // Generate a unique invitation ID based on name and student ID
    function generateInvitationId(name, studentId) {
        const namePart = name.substring(0, 3).toUpperCase();
        const idPart = studentId.substring(studentId.length - 4);
        const randomPart = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `INV-${namePart}${idPart}-${randomPart}`;
    }
});