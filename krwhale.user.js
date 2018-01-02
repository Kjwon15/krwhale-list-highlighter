// ==UserScript==
// @name         Krwhale list highlighter
// @namespace    https://github.com/Kjwon15/krwhale-list-highlighter
// @version      0.1
// @description  Highlight userid and waiting list, More comfortable timestamp
// @author       Kjwon15
// @match        http://pliton.godohosting.com/steem/list.php
// @grant        none
// @updateURL    https://github.com/Kjwon15/krwhale-list-highligher/raw/master/krwhale.user.js
// ==/UserScript==

function leftPad(num, size) {
    return (new Array(size + 1).join('0') + num).slice(-size);
}

function formatTime(string) {
    let dt = new Date(string + 'Z');
    let y = dt.getFullYear();
    let m = leftPad(dt.getMonth() + 1, 2);
    let d = leftPad(dt.getDate(), 2);
    let H = leftPad(dt.getHours(), 2);
    let M = leftPad(dt.getMinutes(), 2);
    let S = leftPad(dt.getSeconds(), 2);
    return `${y}-${m}-${d} ${H}:${M}:${S}`;
}

function getHash(string, ...args) {
    let hash = 0x88cc;
    for (let i in string) {
        hash <<= 5;
        hash += string.charCodeAt(i);
        hash ^= hash >> 3;
        hash |= 0;  // Make it 32bit
    }

    if (args.length === 0) return hash;

    let arr = [];
    for (let size of args) {
        arr.push(hash % size);
        hash = Math.floor(hash / size);
    }

    return arr;
}

function getColor(string) {
    let [h, s, l] = getHash(string, 360, 20, 10);
    s += 30;  // 30 ~ 50
    l += 80;  // 80 ~ 90
    return `hsl(${h}, ${s}%, ${l}%)`;
}

let userid = localStorage.getItem('userid');
if (!userid) {
    userid = prompt('User ID');
    localStorage.setItem('userid', userid);
}

Array.from(document.querySelectorAll('td:nth-child(5)'))
    .filter(elem => {
        if (elem.innerText !== 'Waiting') return false;
        let amount = elem.parentElement.children[1].innerText;
        let url = elem.parentElement.children[2].innerText;
        return (amount === '0.500' && url);
    })
    .reverse()
    .forEach((elem, index) => {
        let newElem = document.createElement('span');
        newElem.innerText = index + 1;
        elem.appendChild(newElem);
    });

Array.from(document.querySelectorAll('tr'))
    .filter(elem => elem.querySelector('td'))
    .forEach(elem => {
        let user = elem.querySelector('td:nth-child(1)');
        let amount = elem.querySelector('td:nth-child(2)');
        let timestamp = elem.querySelector('td:nth-child(4)');

        if (user.innerText === userid) {
            elem.style.background = 'cornflowerblue';
        } else {
            elem.style.background = getColor(user.innerText);
        }

        if (amount.innerText !== '0.500') {
            amount.style.background = 'red';
        }

        timestamp.innerText = formatTime(timestamp.innerText);
    });
