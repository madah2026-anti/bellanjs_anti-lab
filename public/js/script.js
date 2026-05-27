// Form validation and interactivity
document.addEventListener('DOMContentLoaded', function() {
    // Phone number formatting
    const phoneInputs = document.querySelectorAll('input[type="text"][name="cf_t5"]');
    
    phoneInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            
            // Ensure it starts with 05 for Saudi numbers
            if (value.length > 0 && !value.startsWith('0')) {
                value = '0' + value;
            }
            
            // Limit to 10 digits
            if (value.length > 10) {
                value = value.substring(0, 10);
            }
            
            // Format with spaces
            if (value.length >= 2) {
                value = value.substring(0, 2) + ' ' + value.substring(2);
            }
            if (value.length >= 6) {
                value = value.substring(0, 6) + ' ' + value.substring(6);
            }
            if (value.length >= 9) {
                value = value.substring(0, 9) + ' ' + value.substring(9);
            }
            
            e.target.value = value.trim();
        });
    });
    
    // Form validation
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const requiredFields = form.querySelectorAll('[required]');
            let valid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    valid = false;
                    field.style.borderColor = '#e74c3c';
                } else {
                    field.style.borderColor = '#ddd';
                }
            });
            
            if (!valid) {
                e.preventDefault();
                alert('يرجى ملء جميع الحقول الإلزامية');
            }
        });
    });
    
    // Auto-format displayed phone numbers
    const phoneCells = document.querySelectorAll('td[style*="direction: ltr"]');
    phoneCells.forEach(cell => {
        let phone = cell.textContent.trim();
        if (phone && phone !== 'غير محدد') {
            phone = phone.replace(/\D/g, '');
            if (phone.length === 10 && phone.startsWith('05')) {
                cell.textContent = phone.replace(/(\d{2})(\d{3})(\d{2})(\d{3})/, '$1 $2 $3 $4');
            }
        }
    });
});