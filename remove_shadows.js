const fs = require('fs');
const path = 'c:\\Users\\Tashin Khan\\Desktop\\eventify\\eventify-organizer\\src\\pages\\organizer\\DashboardHome.tsx';
let src = fs.readFileSync(path, 'utf8');

// Match any tailwind shadow class, including arbitrary values like shadow-[...] and color opacity shadow-black/10
const cleanSrc = src.replace(/\bshadow(?:-[a-zA-Z0-9_/[\]#(),.-]+)?\b/g, '');

// Clean up extra spaces inside quotes resulting from removal
const finalSrc = cleanSrc.replace(/className="([^"]+)"/g, (match, p1) => {
    return 'className="' + p1.replace(/\s+/g, ' ').trim() + '"';
});

fs.writeFileSync(path, finalSrc);
console.log("Shadows removed successfully.");
