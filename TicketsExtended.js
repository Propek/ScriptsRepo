// ==UserScript==
// @name         Tickets Extended
// @namespace    Violentmonkey Scripts
// @match        https://pomoc.engie-polska.pl/*
// @grant        none
// @version      1.4
// @author       Adrian, Hubert
// @description  GLPI QOL scripts pack
// @updateURL    https://gitfront.io/r/hOObi/yUP8uEXvfR5q/ScriptsRepo/raw/TicketsExtended.js
// @downloadURL  https://gitfront.io/r/hOObi/yUP8uEXvfR5q/ScriptsRepo/raw/TicketsExtended.js
// ==/UserScript==

// Function to format ticket title on the list (unchanged)
function formatTicketTitleOnList() {
    const ticketLinks = document.querySelectorAll('a[id^="Ticket"]');

    ticketLinks.forEach(link => {
        const ticketID = link.id.substring(6);
        const trElement = link.closest('tr');

        if (trElement) {
            const spanElement = trElement.querySelector('span.text-nowrap');

            if (spanElement && spanElement.textContent.replace(/\s/g, '') === ticketID) {
                const formattedID = `HLP #${ticketID.padStart(7, '0')}`;
                spanElement.textContent = formattedID;
            }
        }
    });
}

// Function to format ticket title and add copy button
function formatTicketTitle() {
    const ticketTitles = document.querySelectorAll('.navigationheader-title');

    ticketTitles.forEach((ticket) => {
        const titleText = ticket.textContent.trim();
        const idMatch = titleText.match(/\((\d+)\)$/);

        if (idMatch) {
            const ticketID = idMatch[1];
            const formattedID = `[HLP #${ticketID.padStart(7, '0')}]`;
            const newTitle = titleText.replace(`(${ticketID})`, ` ${formattedID}`);
            ticket.innerHTML = ""; // Clear existing content
            const titleSpan = document.createElement('span');
            titleSpan.textContent = newTitle;
            ticket.appendChild(titleSpan);

            const copyButton = document.createElement('button');
            copyButton.classList.add('btn', 'btn-icon', 'btn-outline-secondary', 'ms-2');
            copyButton.type = 'button';
            copyButton.id = 'copy';
            copyButton.innerHTML = '<i class="ti ti-clipboard"></i>Kopiuj';

            copyButton.addEventListener('click', () => {
                const hlpFullIdMatch = newTitle.match(/\[(HLP #\d+)\]/); // Match full HLP ID
                if (hlpFullIdMatch) {
                    const hlpFullId = hlpFullIdMatch[1];
                    navigator.clipboard.writeText(hlpFullId).then(() => { // Copy full ID
                        copyButton.textContent = "Skopiowano!";
                        setTimeout(() => {
                            copyButton.innerHTML = '<i class="ti ti-clipboard"></i>Kopiuj';
                        }, 2000);
                    }).catch(err => {
                        console.error('Failed to copy: ', err);
                        copyButton.textContent = "Błąd!";
                        setTimeout(() => {
                            copyButton.innerHTML = '<i class="ti ti-clipboard"></i>Kopiuj';
                        }, 2000);
                    });
                }
            });

            ticket.appendChild(copyButton);
        }
    });
}

// Wait for the page to load and then run the scripts (unchanged)
window.addEventListener('load', function () {
    formatTicketTitle();
    formatTicketTitleOnList();
});
