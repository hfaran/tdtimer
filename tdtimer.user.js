"use strict";

// ==UserScript==
// @name        tdtimer
// @namespace   http://zirael.org
// @description Todoist timer
// @include     https://todoist.com/*
// @include     http://todoist.com/*
// @include     https://*.todoist.com/*
// @include     http://*.todoist.com/*
// @version     5
// @grant       none
// ==/UserScript==


var DEBUG = false;

function debug(text) {
    if (DEBUG) {
        console.log(text);
    }
}

function list_all_items() {
    var time_finder = new RegExp("\\[(\\d*(\\.\\d+)?)(m|h)\\]"),
        editor = document.getElementById("editor"),
        uls,
        ul,
        total_minutes = 0,
        i = 0,
        multiplier = null,
        heads_and_counts = [],
        lis,
        li,
        text,
        match,
        header,
        headers,
        span,
        last_child;

    // find all item lists
    uls = document.evaluate(".//ul[starts-with(@class, 'items')]", editor, null, XPathResult.ANY_TYPE, null);
    ul = uls.iterateNext();
    while (ul) {
        debug(ul);
        total_minutes = 0;
        // find all list items
        lis = document.evaluate(".//li[starts-with(@id,'item_')]//td/span[starts-with(@class,'text')]", ul, null, XPathResult.ANY_TYPE, null);
        li = lis.iterateNext();
        while (li) {
            text = li.innerText || li.textContent; // first for IE, rest for browsers
            debug(text);
            match = time_finder.exec(text);
            if (match && match[1]) {
                if (match[3] === "m") {
                    multiplier = 1;
                } else if (match[3] === "h") {
                    multiplier = 60;
                }
                total_minutes += parseInt(match[1]) * multiplier;
                debug(match);
            }
            li = lis.iterateNext();
        }
        debug("Total minutes:", total_minutes);
        // find the title
        header = ul.previousSibling; //headers.iterateNext();
        if (header) {
            debug(header.nodeName);
            if (header.nodeName !== "H2") {
                headers = document.evaluate(".//h2[starts-with(@class,'section_header')]", header, null, XPathResult.ANY_TYPE, null);
                header = headers.iterateNext();
            }
            debug("header", header);
            if (header) {
                heads_and_counts.push(header);
                heads_and_counts.push(total_minutes);
            }
        }
        ul = uls.iterateNext();
    }

    debug(heads_and_counts);

    for (i = 0; i < heads_and_counts.length; i += 2) {
        header = heads_and_counts[i];
        total_minutes = heads_and_counts[i+1];

        if (total_minutes>0) {
            if (header.lastChild.className == "tdtimer") {
                span = header.lastChild;
            } else {
                span = document.createElement("span");
                span.setAttribute("class", "tdtimer");
                span.setAttribute("style", "float:right; margin-right:22px; background-color: #777; color: #fff; border-radius: 3px; font-size:70%; padding:0.1em 0.2em");
                header.appendChild(span);
            }

            if (total_minutes < 60) {
                span.innerHTML = ""+total_minutes+"m";
            } else {
                span.innerHTML = ""+((total_minutes / 60).toFixed(2))+"h";
            }
        } else if (header.lastChild.className == "tdtimer") {
            header.removeChild(header.lastChild);
        }
    }
    setTimeout(list_all_items, 2000);
}

list_all_items();

window.onhashchange = list_all_items;
