import settings from '../settings';

const $ = el => document.querySelector(el);
const $$ = el => document.querySelectorAll(el);


const floorMod = function (n, m) {
    return ((n % m) + m) % m;
};

let lerp = function(a,b,x) {
    a = a || 0;
    b = b || 0;
    return a + x*(b-a);
};

const ptou = function(p) {
    return p/settings.unitSize;
};

const utop = function(u) {
    return u*settings.unitSize;
};

export { $, $$, floorMod, lerp, ptou, utop };