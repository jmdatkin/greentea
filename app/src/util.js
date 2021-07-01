const $ = el => document.querySelector(el);
const $$ = el => document.querySelectorAll(el);

const floorMod = function (n, m) {
    return ((n % m) + m) % m;
};

export { $, $$, floorMod };