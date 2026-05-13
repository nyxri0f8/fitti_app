const fs = require('fs');
const path = require('path');

const files = [
  'src/pages/admin/AdminDashboard.jsx',
  'src/pages/customer/CustomerDashboard.jsx',
  'src/pages/cook/CookDashboard.jsx',
  'src/pages/doctor/DoctorDashboard.jsx',
  'src/pages/trainer/TrainerDashboard.jsx'
];

files.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (!fs.existsSync(fullPath)) return;
  
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Remove nanoid import
  content = content.replace(/import { nanoid } from 'nanoid';\n?/g, '');
  
  // Remove setActiveCall
  content = content.replace(/const setActiveCall = useAuthStore\(state => state\.setActiveCall\);\n?/g, '');
  
  // Remove startVideoCall function
  content = content.replace(/const startVideoCall = async \([^)]*\) => {[\s\S]*?};\n?/g, '');
  
  // Remove onStartVideoCall prop
  content = content.replace(/ onStartVideoCall={startVideoCall}/g, '');
  
  // Remove /sessions Route
  content = content.replace(/<Route path="\/sessions" element=\{<div[^>]*>.*?<\/div>\} \/>\n?/g, '');
  content = content.replace(/<Route path="\/sessions" element=\{<div[^>]*>[\s\S]*?<\/div>\} \/>\n?/g, '');
  content = content.replace(/<Route path="\/sessions" element=\{<div className="p-8.*?(?:<\/div>\} \/>)/g, '');

  fs.writeFileSync(fullPath, content);
});

// Also remove sessions icon from Sidebar
const sidebarPath = path.join(__dirname, 'src/components/shared/Sidebar.jsx');
if (fs.existsSync(sidebarPath)) {
  let sidebar = fs.readFileSync(sidebarPath, 'utf8');
  // the link might be to /sessions or similar
  sidebar = sidebar.replace(/\{ icon: <Video[^>]*>, label: 'Sessions', path: '\/sessions' \},?\n?/g, '');
  sidebar = sidebar.replace(/Video,/g, '');
  fs.writeFileSync(sidebarPath, sidebar);
}

console.log('Video call references removed.');
