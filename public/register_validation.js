document.getElementById('avatar').addEventListener('change', function () {
    const file = this.files[0];
    if (file) {
        // Check MIME type
        const validTypes = ['image/jpeg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            alert('Only JPG and PNG files are allowed.');
            this.value = ''; // Clear the field
            return;
        }

        // Optionally: check extension as well
        const extension = file.name.split('.').pop().toLowerCase();
        if (!['jpg', 'jpeg', 'png'].includes(extension)) {
            alert('Only JPG and PNG files are allowed.');
            this.value = '';
            return;
        }
    }
});