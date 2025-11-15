# GitHub Pages Deployment Script for Reyan Luxe
# This script ensures proper deployment to GitHub Pages

# Step 1: Build the frontend
cd frontend
npm run build

# Step 2: Copy build files to docs folder
cd ..
rm -rf docs
mkdir docs
cp -r frontend/dist/* docs/

# Step 3: Add GitHub Pages configuration files
touch docs/.nojekyll
cp frontend/public/404.html docs/404.html

# Step 4: Create root redirect index.html
cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="refresh" content="0; url=/Reyan_Luxe/docs/">
    <title>Reyan Luxe - Redirecting...</title>
</head>
<body>
    <p>Redirecting to <a href="/Reyan_Luxe/docs/">Reyan Luxe Store</a>...</p>
</body>
</html>
EOF

# Step 5: Create GitHub Pages config
cat > _config.yml << 'EOF'
# GitHub Pages Configuration
jekyll: false
source: docs
baseurl: "/Reyan_Luxe"
title: "Reyan Luxe"
description: "Luxury Customized Jewelry Store"
EOF

echo "Deployment files prepared successfully!"
echo "Next steps:"
echo "1. git add ."
echo "2. git commit -m 'Deploy Reyan Luxe to GitHub Pages'"
echo "3. git push origin main"