# کوتاه‌کننده لینک شیک
![Visitor Count](https://komarev.com/ghpvc/?username=Argh94&repo=link-shortener-ui&label=بازدیدها)

یه ابزار ساده و زیبا برای کوتاه کردن لینک‌ها و متن‌ها با امکانات پیشرفته مثل رمزگذاری، محدودیت استفاده، و انقضا. این پروژه شامل یه رابط کاربری (UI) توی GitHub Pages و یه API توی Cloudflare Workers هست.

![پیش‌نمایش](https://imgur.com/a/5lymgbJ))  
*(توضیح: بعداً می‌تونی یه اسکرین‌شات از صفحه‌ت بذاری و لینک تصویر رو جایگزین کنی.)*

## امکانات
- کوتاه کردن لینک‌ها و متن‌ها با اسم دلخواه.
- رمزگذاری با کلید دلخواه.
- تنظیم محدودیت استفاده و تاریخ انقضا.
- قابلیت یک‌بارمصرف.
- دکمه کپی برای لینک کوتاه‌شده.
- طراحی شیک با انیمیشن و گرادیانت.

## پیش‌نیازها
برای راه‌اندازی این پروژه، به اینا نیاز داری:
1. **حساب GitHub**: برای میزبانی رابط کاربری.
2. **حساب Cloudflare**: برای راه‌اندازی API با Workers و KV Storage.
3. یه مرورگر یا ویرایشگر متن ساده (مثل Notepad یا VS Code).

## راه‌اندازی پروژه
### 1. راه‌اندازی رابط کاربری (UI) توی GitHub
1. **فورک کردن مخزن**:
   - روی دکمه "Fork" بالای این صفحه کلیک کن تا یه کپی از این پروژه توی حساب GitHub خودت بسازی.
2. **فعال کردن GitHub Pages**:
   - توی مخزن فورک‌شده‌ت، برو به **Settings** > **Pages**.
   - توی بخش "Branch"، شاخه `main` رو انتخاب کن و **Save** بزن.
   - بعد از چند دقیقه، سایتت توی آدرس `https://YOUR-USERNAME.github.io/link-shortener-ui/` فعال می‌شه (به جای YOUR-USERNAME، اسم کاربری خودت رو بذار).
3. **تست UI**:
   - آدرس بالا رو توی مرورگر باز کن. باید یه فرم زیبا ببینی.

### 2. راه‌اندازی API توی Cloudflare Workers
1. **ساخت Worker**:
   - توی [Cloudflare Dashboard](https://dash.cloudflare.com)، وارد حساب Cloudflareت شو.
   - برو به بخش **Workers** و روی **Create a Worker** کلیک کن.
   - یه اسم برای Worker انتخاب کن (مثلاً `link-shortener`).
2. **کپی کردن کد API**:
   - فایل `worker.js` رو از این مخزن (توی بخش کدهای این پروژه) دانلود کن یا کپی کن.
   - توی ویرایشگر Worker، کد فعلی رو حذف کن و کد `worker.js` رو پیست کن.
3. **تنظیم KV Storage**:
   - توی بخش **Workers** > **KV**، یه فضای KV جدید بساز (مثلاً `SHORTENER_KV`).
   - توی تنظیمات Worker، این KV رو به Worker وصل کن (اسم متغیر باید `SHORTENER_KV` باشه).
4. **Deploy کردن**:
   - روی **Save and Deploy** بزن. حالا Worker توی آدرسی مثل `https://your-worker.YOUR-ACCOUNT.workers.dev` فعال می‌شه.
5. **اتصال UI به API**:
   - توی فایل `script.js` توی مخزن GitHubت، خط زیر رو پیدا کن:
     ```javascript
     const response = await fetch('https://tight-grass-6f1f.tahmasebimoein140.workers.dev/shorten', {
