const { JSDOM } = require("jsdom");
const dom = new JSDOM(`<!DOCTYPE html><div id="root"></div>`);
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;

const fs = require('fs');

// We need React and ReactDOM as globals because the bundle expects them
global.React = require('/Users/richardducat/GITHUB/tyfys-benefits/tyfys-platform/vendor/react.production.min.js');
global.ReactDOM = require('/Users/richardducat/GITHUB/tyfys-benefits/tyfys-platform/vendor/react-dom.production.min.js');
// Wait, react.production.min.js registers UI globals? 
// In node, it might export instead. Let's use standard react if possible
try {
  global.React = require('react');
  global.ReactDOM = require('react-dom/client');
} catch(e) {
  global.React = require('/Users/richardducat/GITHUB/tyfys-benefits/tyfys-platform/vendor/react.production.min.js');
  global.ReactDOM = require('/Users/richardducat/GITHUB/tyfys-benefits/tyfys-platform/vendor/react-dom.production.min.js');
}

// Intercept console.error to catch the component stack
const originalError = console.error;
console.error = (...args) => {
  originalError('[REACT LOG]:', ...args);
};

// Now load the app
try {
  const code = fs.readFileSync('/Users/richardducat/GITHUB/tyfys-benefits/tyfys-platform/tyfys-platform-app.js', 'utf8');
  // Evaluate the IIFE
  eval(code);
} catch (error) {
  console.error('[EVAL ERROR]:', error);
}
