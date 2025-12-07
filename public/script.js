// Set minimum date to today
document.addEventListener('DOMContentLoaded', function() {
    const dateInput = document.getElementById('date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
});

// Form submission handler
document.getElementById('appointmentForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    const messageDiv = document.getElementById('message');
    
    // Disable button and show loader
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoader.style.display = 'inline';
    messageDiv.style.display = 'none';
    
    // Collect form data
    const formData = {
        fullName: document.getElementById('fullName').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        date: document.getElementById('date').value,
        time: document.getElementById('time').value,
        service: document.getElementById('service').value,
        notes: document.getElementById('notes').value.trim()
    };
    
    // Client-side validation
    if (!formData.fullName) {
        showMessage('الرجاء إدخال الاسم الكامل', 'error');
        resetButton();
        return;
    }
    
    if (!formData.phone) {
        showMessage('الرجاء إدخال رقم الهاتف', 'error');
        resetButton();
        return;
    }
    
    if (!formData.date) {
        showMessage('الرجاء اختيار تاريخ الموعد', 'error');
        resetButton();
        return;
    }
    
    if (!formData.time) {
        showMessage('الرجاء اختيار وقت الموعد', 'error');
        resetButton();
        return;
    }
    
    if (!formData.service) {
        showMessage('الرجاء اختيار نوع الخدمة', 'error');
        resetButton();
        return;
    }
    
    try {
        // Send data to backend
        const response = await fetch('/api/book', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage(result.message, 'success');
            // Reset form after successful booking
            document.getElementById('appointmentForm').reset();
        } else {
            showMessage(result.message || 'حدث خطأ أثناء حجز الموعد', 'error');
        }
        
    } catch (error) {
        console.error('Error:', error);
        showMessage('حدث خطأ في الاتصال. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.', 'error');
    } finally {
        resetButton();
    }
    
    function resetButton() {
        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
    }
    
    function showMessage(message, type) {
        messageDiv.textContent = message;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';
        
        // Auto-hide success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 5000);
        }
    }
});
