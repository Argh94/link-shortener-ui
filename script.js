document.getElementById('shortenForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const content = document.getElementById('content').value;
    const custom = document.getElementById('custom').value;
    const password = document.getElementById('password').value;
    const maxUses = document.getElementById('maxUses').value;
    const expireDays = document.getElementById('expireDays').value;
    const encryptionKey = document.getElementById('encryptionKey').value;
    const disposable = document.getElementById('disposable').checked;

    const data = {
        content,
        custom: custom || undefined,
        password: password || undefined,
        maxUses: maxUses ? parseInt(maxUses) : undefined,
        expireDays: expireDays ? parseInt(expireDays) : undefined,
        encryptionKey: encryptionKey || undefined,
        disposable
    };

    try {
        const response = await fetch('https://tight-grass-6f1f.tahmasebimoein140.workers.dev/shorten', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (response.ok) {
            const shortenedUrl = document.getElementById('shortenedUrl');
            shortenedUrl.value = result.url; // نمایش لینک توی کادر
            document.getElementById('result').style.display = 'flex'; // نمایش کادر نتیجه
        } else {
            document.getElementById('result').innerHTML = `خطا: ${result.error}`;
            document.getElementById('result').style.color = 'red';
        }
    } catch (error) {
        document.getElementById('result').innerHTML = 'یه مشکلی پیش اومد!';
        document.getElementById('result').style.color = 'red';
    }
});

// منطق کپی کردن
document.getElementById('copyButton').addEventListener('click', () => {
    const shortenedUrl = document.getElementById('shortenedUrl');
    shortenedUrl.select(); // انتخاب متن
    navigator.clipboard.writeText(shortenedUrl.value) // کپی به کلیپ‌بورد
        .then(() => {
            const originalText = document.getElementById('copyButton').innerText;
            document.getElementById('copyButton').innerText = 'کپی شد!';
            setTimeout(() => {
                document.getElementById('copyButton').innerText = originalText; // برگشت به حالت اولیه
            }, 2000); // بعد از ۲ ثانیه
        })
        .catch(err => {
            console.error('خطا در کپی: ', err);
        });
});
