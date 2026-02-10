# Deploying to GoDaddy

Since this project is built with **Astro** as a static site, deployment to GoDaddy (or any shared hosting) is straightforward. You essentially upload the built HTML/CSS/JS files to your server.

## Prerequisites
- Access to your GoDaddy Hosting Control Panel (cPanel or Plesk).
- File Manager access or an FTP client (like FileZilla).

## Step 1: Build the Project
Run the build command key to generate the static files.

```bash
make build
# OR
npm run build
```

This will create a `dist/` directory in your project root containing all the website files.

## Step 2: Prepare for Upload
The contents of the `dist/` folder are what you need to upload.

1. Locate the `dist/` folder.
2. (Optional but recommended) Zip the contents of the `dist/` folder into a single file (e.g., `website.zip`) for faster upload.

## Step 3: Upload to GoDaddy

### Option A: Using GoDaddy File Manager (Easiest)
1. Log in to your GoDaddy Product Page.
2. Go to **Web Hosting** > **Manage**.
3. Open **cPanel Admin**.
4. Click on **File Manager**.
5. Navigate to your public root directory (usually `public_html`).
6. **Backup**: If you have an existing site, create a backup folder (e.g., `backup_old_site`) and move all current files into it.
7. **Upload**: Click **Upload** and select your `website.zip` (or upload files individually).
8. **Extract**: If you uploaded a zip, right-click it and select **Extract**. Ensure files are in the root of `public_html` (not inside a subfolder like `dist`).
9. **Cleanup**: Delete the `website.zip`.

### Option B: Using FTP (FileZilla)
1. Connect to your server using your FTP credentials (found in cPanel > FTP Accounts).
2. Navigate to `public_html`.
3. Drag and drop the **contents** of your local `dist/` folder into `public_html`.

## Step 4: Verify
Visit your domain (e.g., `www.kubomontessori.com`) to see your new Astro site live!

## Troubleshooting
- **404 Errors**: Ensure you uploaded the `dist` *contents*, not the `dist` folder itself. The `index.html` should be directly inside `public_html`.
- **Missing Styles/Images**: Check that your `assets` or `images` folders were uploaded correctly.
