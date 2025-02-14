// ==UserScript==
// @name         Tickets Extended
// @namespace    Violentmonkey Scripts
// @match        https://pomoc.engie-polska.pl/*
// @grant        none
// @version      1.6
// @author       Adrian, Hubert
// @description  GLPI QOL scripts pack
// @updateURL    https://github.com/Propek/ScriptsRepo/raw/refs/heads/main/TicketsExtended.js
// @downloadURL  https://github.com/Propek/ScriptsRepo/raw/refs/heads/main/TicketsExtended.js
// ==/UserScript==

// Function to format ticket title on the list
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

    ticketTitles.forEach(ticket => {
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

function formatPhoneNumber(phoneNumberElement) {
    const originalNumber = phoneNumberElement.textContent;
    const formattedNumber = originalNumber.replace(/(\+\d{2}) ?(\d{3}) ?(\d{3}) ?(\d{3})/, '$1 $2 $3 $4');
    phoneNumberElement.textContent = formattedNumber;
}

function formatPhoneNumbers() {
    const phoneNumbers = document.querySelectorAll('a[href^="tel:"]');
    phoneNumbers.forEach(formatPhoneNumber);
}

const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
        mutation.addedNodes.forEach(formatPhoneNumbers);
    });
});

// Wait for the page to load and then run the scripts
window.addEventListener('load', function () {
    formatTicketTitle();
    formatTicketTitleOnList();
    formatPhoneNumbers();

    observer.observe(document.body, { childList: true, subtree: true });
});


(function() {
    'use strict';

    // Function to remove options under "0godz30"
    function removeOptions() {
        // Wait for the dropdown to be visible
        let dropdown = document.querySelector('.select2-container--open .select2-results__options');
        if (dropdown) {
            let options = dropdown.querySelectorAll('li');
            options.forEach(option => {
                if (option.textContent.trim().startsWith('0godz') && parseInt(option.textContent.trim().slice(-2)) < 30) {
                    option.remove();
                }
            });
        }
    }

    // Observe changes to the dropdown container to detect when the options are populated dynamically
    const observer = new MutationObserver(removeOptions);
    observer.observe(document.body, { childList: true, subtree: true });

    // Run the function initially in case the dropdown is already populated
    window.addEventListener('load', removeOptions);
})();
