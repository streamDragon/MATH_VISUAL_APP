/* globals.js - משתנים גלובליים ומתמטיקה */

// --- משתנים גלובליים (State) ---
let canvas, ctx;
let width, height;

// פרמטרים של הפונקציה
let a = 1, b = 0, c = 0, d = 0; 
let currentX = 1; // מיקום הנקודה הנחקרת

// הגדרות תצוגה
let scale = 40; // זום (כמה פיקסלים שווה יחידה אחת)
let offsetX = 0, offsetY = 0; // להזזת המרכז (אופציונלי לעתיד)

// ניהול שאלות
let currentQIndex = 0;
let isSolved = false; 

// אינטראקציה
let isDragging = false;

// --- מתמטיקה טהורה ---

// הפונקציה: f(x)
function f(x) {
    return a * Math.pow(x, 3) + b * Math.pow(x, 2) + c * x + d;
}

// הנגזרת (השיפוע): f'(x)
function df(x) {
    return 3 * a * Math.pow(x, 2) + 2 * b * x + c;
}
