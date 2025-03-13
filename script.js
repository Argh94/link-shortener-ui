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
            document.getElementById('result').innerHTML = `لینک کوتاه‌شده: <a href="${result.url}" target="_blank">${result.url}</a>`;
        } else {
            document.getElementById('result').innerHTML = `خطا: ${result.error}`;
            document.getElementById('result').style.color = 'red';
        }
    } catch (error) {
        document.getElementById('result').innerHTML = 'یه مشکلی پیش اومد!';
        document.getElementById('result').style.color = 'red';
    }
});