// ==UserScript==
// @name         Tickets Extended
// @namespace    Violentmonkey Scripts
// @match        https://pomoc.engie-polska.pl/*
// @grant        none
// @version      1.8
// @author       Adrian, Hubert
// @description  GLPI QOL scripts pack
// @updateURL    https://github.com/Propek/ScriptsRepo/raw/refs/heads/main/TicketsExtended.js
// @downloadURL  https://github.com/Propek/ScriptsRepo/raw/refs/heads/main/TicketsExtended.js
// ==/UserScript==

(function() {
    'use strict';

    /************************************************
      Wyświetlanie i formatowanie pełnego ID zgłoszenia
     ************************************************/
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

    /************************************************
      Przyciski do kopiowania ID zgłoszenia i
      zmiany tytułu zgłoszenia
     ************************************************/
function formatTicketTitle() {
    const ticketTitles = document.querySelectorAll('.navigationheader-title');
    ticketTitles.forEach(ticket => {
        const titleText = ticket.textContent.trim();
        const idMatch = titleText.match(/\((\d+)\)$/);
        if (idMatch) {
            const ticketID = idMatch[1];
            const formattedID = `[HLP #${ticketID.padStart(7, '0')}]`;
            const newTitle = titleText.replace(`(${ticketID})`, ` ${formattedID}`);
            ticket.innerHTML = "";

            // Główny DIV
            // Górny wiersz: Tytuł z przyciskami
            // Dolny dodatkowy DIV: Ukryte poza trybem edycji dodatkowe dwa wiersze na pole edycji tytułu i liste tytułów
            const mainContainer = document.createElement('div');
            mainContainer.classList.add('d-flex', 'flex-column', 'gap-2');
            ticket.appendChild(mainContainer);

            // Górny wiersz
            const topRow = document.createElement('div');
            topRow.classList.add('d-flex', 'align-items-center', 'gap-2');
            mainContainer.appendChild(topRow);

            // Tytuł zgłoszenia przed edycją
            const titleSpan = document.createElement('span');
            titleSpan.textContent = newTitle;
            topRow.appendChild(titleSpan);

            // Przycisk do kopiowania ID zgłoszenia
            const copyButton = document.createElement('button');
            copyButton.classList.add('btn', 'btn-icon', 'btn-outline-secondary', 'btn-sm', 'px-2');
            copyButton.type = 'button';
            copyButton.innerHTML = '<i class="ti ti-clipboard me-1"></i>Kopiuj ID';
            copyButton.addEventListener('click', () => {
                const hlpFullIdMatch = newTitle.match(/\[(HLP #\d+)\]/);
                if (hlpFullIdMatch) {
                    const hlpFullId = hlpFullIdMatch[1];
                    navigator.clipboard.writeText(hlpFullId)
                        .then(() => {
                            copyButton.textContent = "Skopiowano!";
                            setTimeout(() => {
                                copyButton.innerHTML = '<i class="ti ti-clipboard me-1"></i>Kopiuj ID';
                            }, 2000);
                        })
                        .catch(err => {
                            console.error('Wystąpił błąd przy próbie kopiowania ID: ', err);
                            copyButton.textContent = "Błąd!";
                            setTimeout(() => {
                                copyButton.innerHTML = '<i class="ti ti-clipboard me-1"></i>Kopiuj ID';
                            }, 2000);
                        });
                }
            });
            topRow.appendChild(copyButton);

            // Przycisk do zmiany tytułu zgłoszenia
            const changeTitleButton = document.createElement('button');
            changeTitleButton.classList.add('btn', 'btn-icon', 'btn-outline-secondary', 'btn-sm', 'px-2');
            changeTitleButton.type = 'button';
            changeTitleButton.innerHTML = '<i class="ti ti-edit me-1"></i>Zmień tytuł';
            topRow.appendChild(changeTitleButton);

            // ----- Dodatkowy DIV na dole w trybie edycji -----
            // Domyślnie ukryte
            const bottomContainer = document.createElement('div');
            bottomContainer.classList.add('d-none', 'flex-column', 'gap-1');
            mainContainer.appendChild(bottomContainer);

            // Pierwszy wiersz: Pole do edycji tytułu zgłoszenia
            const inputRow = document.createElement('div');
            inputRow.classList.add('w-100');
            bottomContainer.appendChild(inputRow);

            const editInput = document.createElement('input');
            editInput.classList.add('form-control', 'form-control-sm', 'w-100');
            editInput.placeholder = 'Wpisz nowy tytuł...';
            // Wielkość pola do edycji tytułu
            editInput.style.height = '2.0rem';
            inputRow.appendChild(editInput);

            // Drugi wiersz: Lista do wyboru tytułu zgłoszenia
            const dropdownRow = document.createElement('div');
            dropdownRow.classList.add('w-100');
            bottomContainer.appendChild(dropdownRow);

            const presetDropdown = document.createElement('select');
            presetDropdown.classList.add('form-select', 'form-select-sm', 'w-100', 'mt-1');
            presetDropdown.setAttribute('data-width', '100%');
            presetDropdown.innerHTML = `
                <option value="">Wybierz tytuł zgłoszenia</option>
                <optgroup label="PRACE CYKLICZNE">
                    <option value="Archiwizacja kopii zapasowych komputerów">Archiwizacja kopii zapasowych komputerów</option>
                    <option value="Prace porządkowe w GLPI">Prace porządkowe w GLPI</option>
                    <option value="Optymalizacja wykorzystania licencji">Optymalizacja wykorzystania licencji</option>
                    <option value="Porządkowanie nieużywanych kont domenowych">Porządkowanie nieużywanych kont domenowych</option>
                    <option value="Porządkowanie licencji Microsoft 365">Porządkowanie licencji Microsoft 365</option>
                    <option value="Porządkowanie licencji Power Apps i PowerBI">Porządkowanie licencji Power Apps i PowerBI</option>
                    <option value="Zarządzanie aplikacjami w Portalu Firmy">Zarządzanie aplikacjami w Portalu Firmy</option>
                    <option value="Aktualizacja obrazu systemu operacyjnego przeznaczonego dla korporacji">Aktualizacja obrazu systemu operacyjnego przeznaczonego dla korporacji</option>
                </optgroup>
                <optgroup label="URZĄDZENIA">
                    <option value="Inwentaryzacja urządzenia">Inwentaryzacja urządzenia</option>
                    <option value="Instalacja systemu operacyjnego przeznaczonego dla korporacji">Instalacja systemu operacyjnego przeznaczonego dla korporacji</option>
                    <option value="Awaryjna konfiguracja nowego komputera dla pracownika">Awaryjna konfiguracja nowego komputera dla pracownika</option>
                    <option value="Konfiguracja nowego komputera dla pracownika">Konfiguracja nowego komputera dla pracownika</option>
                    <option value="Awaryjna konfiguracja komputera dla nowego pracownika">Awaryjna konfiguracja komputera dla nowego pracownika</option>
                    <option value="Konfiguracja komputera dla nowego pracownika">Konfiguracja komputera dla nowego pracownika</option>
                    <option value="Konfiguracja komputera dla wielu użytkowników na obiekt">Konfiguracja komputera dla wielu użytkowników na obiekt</option>
                    <option value="Utworzenie i skonfigurowanie profilu użytkownika na komputerze">Utworzenie i skonfigurowanie profilu użytkownika na komputerze</option>
                    <option value="Uzupełnienie profilu użytkownika na komputerze">Uzupełnienie profilu użytkownika na komputerze</option>
                    <option value="Zabezpieczenie danych oraz odłączenie komputera z domeny">Zabezpieczenie danych oraz odłączenie komputera z domeny</option>
                    <option value="Oczyszczenie urządzenia z danych">Oczyszczenie urządzenia z danych</option>
                    <option value="Przygotowanie urządzenia mobilnego">Przygotowanie urządzenia mobilnego</option>
                    <option value="Konfiguracja telefonu dla nowego pracownika">Konfiguracja telefonu dla nowego pracownika</option>
                    <option value="Konfiguracja drukarki/urządzenia wielofunkcyjnego">Konfiguracja drukarki/urządzenia wielofunkcyjnego</option>
                    <option value="Instalacja sterowników i oprogramowania do drukarki/urządzenia wielofunkcyjnego">Instalacja sterowników i oprogramowania do drukarki/urządzenia wielofunkcyjnego</option>
                </optgroup>
                <optgroup label="UDZIELANIE DOSTĘPÓW">
                    <option value="Konfiguracja dostępów dla nowego użytkownika">Konfiguracja dostępów dla nowego użytkownika</option>
                    <option value="Dodanie nowego pracownika do grupy mailingowej">Dodanie nowego pracownika do grupy mailingowej</option>
                    <option value="Dodanie użytkownika do listy w portalu DMS">Dodanie użytkownika do listy w portalu DMS</option>
                    <option value="Konfiguracja dostępu do współdzielonej skrzynki e-mail">Konfiguracja dostępu do współdzielonej skrzynki e-mail</option>
                    <option value="Przyznanie uprawnień lokalnego administratora na komputerze">Przyznanie uprawnień lokalnego administratora na komputerze</option>
                </optgroup>
                <optgroup label="OPROGRAMOWANIE">
                    <option value="Instalacja dodatkowego oprogramowania">Instalacja dodatkowego oprogramowania</option>
                    <option value="Konfiguracja połączenia VPN na komputerze">Konfiguracja połączenia VPN na komputerze</option>
                    <option value="Rozwiązanie problemu z logowaniem do Microsoft 365">Rozwiązanie problemu z logowaniem do Microsoft 365</option>
                    <option value="Rozwiązanie problemu z synchronizacją OneDrive">Rozwiązanie problemu z synchronizacją OneDrive</option>
                </optgroup>
                <optgroup label="PROBLEMY Z SYSTEMAMI KORPO">
                    <option value="Konfiguracja polityki Zscaler">Konfiguracja polityki Zscaler</option>
                    <option value="Pomoc przy konfiguracji OKTA Verify">Pomoc przy konfiguracji OKTA Verify</option>
                    <option value="Rozwiązanie problemu z dostępem do platformy e-Pracownik">Rozwiązanie problemu z dostępem do platformy e-Pracownik</option>
                    <option value="Rozwiązanie problemu z dostępem do platformy Sezame">Rozwiązanie problemu z dostępem do platformy Sezame</option>
                    <option value="Rozwiązanie problemu z logowaniem do konta domenowego">Rozwiązanie problemu z logowaniem do konta domenowego</option>
                    <option value="Rozwiązanie problemu zdalnego dostępu do komputera">Rozwiązanie problemu zdalnego dostępu do komputera</option>
                    <option value="Asysta podczas instalacji oprogramowania przez osoby trzecie">Asysta podczas instalacji oprogramowania przez osoby trzecie</option>
                    <option value="Konfiguracja WiPass">Konfiguracja WiPass</option>
                    <option value="Reset konfiguracji MFA">Reset konfiguracji MFA</option>
                </optgroup>
                <optgroup label="CZYNNOŚCI ADMINISTRACYJNE">
                    <option value="Przypisanie licencji AutoCAD na innego użytkownika">Przypisanie licencji AutoCAD na innego użytkownika</option>
                    <option value="Odzyskanie dostępu do konta w domenie ENGIE">Odzyskanie dostępu do konta w domenie ENGIE</option>
                    <option value="Przyznanie dostępu do katalogu sieciowego">Przyznanie dostępu do katalogu sieciowego</option>
                    <option value="Rozwiązanie problemu z zablokowanym komputerem">Rozwiązanie problemu z zablokowanym komputerem</option>
                    <option value="Odblokowanie i administracyjna zmiana hasła domenowego użytkownika">Odblokowanie i administracyjna zmiana hasła domenowego użytkownika</option>
                    <option value="Zablokowanie konta domenowego użytkownika">Zablokowanie konta domenowego użytkownika</option>
                    <option value="Zabezpieczenie danych oraz usunięcie konta domenowego">Zabezpieczenie danych oraz usunięcie konta domenowego</option>
                    <option value="Zabezpieczenie danych z konta domenowego">Zabezpieczenie danych z konta domenowego</option>
                    <option value="Usunięcie konta domenowego">Usunięcie konta domenowego</option>
                </optgroup>
                <optgroup label="PROBLEMY Z INFRASTRUKTURĄ">
                    <option value="Rozwiązanie problemu z dostępem do sieci firmowej">Rozwiązanie problemu z dostępem do sieci firmowej</option>
                    <option value="Rozwiązanie problemu z drukowaniem">Rozwiązanie problemu z drukowaniem</option>
                    <option value="Rozwiązanie problemu ze skanowaniem">Rozwiązanie problemu ze skanowaniem</option>
                    <option value="Przygotowanie stanowiska pracy">Przygotowanie stanowiska pracy</option>
                </optgroup>
                <optgroup label="SYSTEMY DODATKOWE">
                    <option value="Rozwiązanie problemu z logowaniem do systemu bankowego">Rozwiązanie problemu z logowaniem do systemu bankowego</option>
                    <option value="Pomoc przy konfiguracji podpisu cyfrowego">Pomoc przy konfiguracji podpisu cyfrowego</option>
                </optgroup>
            `;
            dropdownRow.appendChild(presetDropdown);

            // Aktualizacja tytułu po wybraniu z listy
            presetDropdown.addEventListener('change', () => {
                if (presetDropdown.value !== "") {
                    const newValue = presetDropdown.value.trim();
                    stopEditing(newValue);
                    saveTitleToGLPI(newValue);
                    // Resetuj wybrany element listy tytułów
                    presetDropdown.selectedIndex = 0;
                    if (typeof $ !== "undefined" && typeof $.fn.selectpicker === "function") {
                        $(presetDropdown).selectpicker('refresh');
                    }
                }
            });

            // Zmienna z tytułem zgłoszenia bez ID
            let currentTitleOnly = newTitle.replace(/\s*\[HLP #\d+\]/, '').trim();
            const bracketPart = newTitle.match(/\[HLP #[0-9]+\]/)?.[0] || '';
            let isEditingTitle = false;

            // Przejście w tryb edycji
            function startEditing() {
                isEditingTitle = true;
                titleSpan.style.display = 'none';
                bottomContainer.classList.remove('d-none');
                editInput.value = currentTitleOnly;
                editInput.focus();
                changeTitleButton.innerHTML = '<i class="ti ti-check me-1"></i>Zapisz zmiany';
            }

            // Wyjście z trybu edycji
            function stopEditing(newTitleValue) {
                isEditingTitle = false;
                currentTitleOnly = newTitleValue;
                const updatedFullTitle = `${currentTitleOnly} ${bracketPart}`;
                titleSpan.textContent = updatedFullTitle;
                titleSpan.style.display = 'inline';
                bottomContainer.classList.add('d-none');
                changeTitleButton.innerHTML = '<i class="ti ti-edit me-1"></i>Zmień tytuł';
            }

            // Automatyczna symulacja procesu zmiany tytułu zgłoszenia
            function saveTitleToGLPI(newTitleValue) {
                const dotsBtn = document.querySelector('.card-body:first-child .timeline-more-actions');
                if (!dotsBtn) {
                    console.warn('Nie znaleziono przycisku menu z trzema kropkami!');
                    return;
                }
                dotsBtn.click();
                setTimeout(() => {
                    const editLink = document.querySelector('.card-body:first-child .dropdown-item.edit-timeline-item');
                    if (!editLink) {
                        console.warn('Nie znaleziono opcji "Edytuj"!');
                        return;
                    }
                    editLink.click();
                    const checkInterval = setInterval(() => {
                        const nameInput = document.querySelector('.edit-content input[name="name"]');
                        if (nameInput) {
                            clearInterval(checkInterval);
                            nameInput.value = newTitleValue;
                            const saveBtn = document.querySelector('.edit-content button[name="update"]');
                            if (saveBtn) {
                                saveBtn.click();
                            }
                        }
                    }, 500);
                }, 300);
            }

            // Logika działania przycisku do zmiany tytułu zgłoszenia
            changeTitleButton.addEventListener('click', () => {
                if (!isEditingTitle) {
                    startEditing();
                } else {
                    const newValue = editInput.value.trim();
                    if (newValue === currentTitleOnly) {
                        stopEditing(currentTitleOnly);
                        return;
                    }
                    stopEditing(newValue);
                    saveTitleToGLPI(newValue);
                }
            });

            // Obsługa klawisza ENTER do zapisania zmian i ESC do wyjścia z trybu edycji
            editInput.addEventListener('keydown', (evt) => {
                if (evt.key === 'Enter') {
                    evt.preventDefault();
                    const newValue = editInput.value.trim();
                    if (newValue === currentTitleOnly) {
                        stopEditing(currentTitleOnly);
                        return;
                    }
                    stopEditing(newValue);
                    saveTitleToGLPI(newValue);
                } else if (evt.key === 'Escape') {
                    evt.preventDefault();
                    stopEditing(currentTitleOnly);
                }
            });

            // Initial update of suggested time.
            updateSuggestedTimeSummary();
        }
    });
}


    /************************************************
      Formatowanie wyświetlania numerów telefonów
     ************************************************/
    function formatPhoneNumber(phoneNumberElement) {
        const originalNumber = phoneNumberElement.textContent;
        const formattedNumber = originalNumber.replace(/(\+\d{2}) ?(\d{3}) ?(\d{3}) ?(\d{3})/, '$1 $2 $3 $4');
        phoneNumberElement.textContent = formattedNumber;
    }

    function formatPhoneNumbers() {
        const phoneNumbers = document.querySelectorAll('a[href^="tel:"]');
        phoneNumbers.forEach(formatPhoneNumber);
    }

    const phoneObserver = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(formatPhoneNumbers);
        });
    });

    window.addEventListener('load', function () {
        formatTicketTitle();
        formatTicketTitleOnList();
        formatPhoneNumbers();
        phoneObserver.observe(document.body, { childList: true, subtree: true });
    });

    /************************************************
      Usunięcie możliwości wyboru godzin poniżej
      30 minut i formatownie wyświetlanego tekstu
     ************************************************/
    const removeOptionsObserver = new MutationObserver(() => {
    removeOptions();
    updateUnderlyingSelectOptionTexts();
});
function removeOptions() {
    let dropdown = document.querySelector('.select2-container--open .select2-results__options');
    if (dropdown) {
        let options = dropdown.querySelectorAll('li');
        options.forEach(option => {
            let txt = option.textContent.trim();
            // Formatowanie opcji z początkiem "0godz"
            if (txt.startsWith("0godz")) {
                let minutes = parseInt(txt.slice(-2)); // np. "0godz30" -> 30
                if (minutes < 30) {
                    option.remove();
                } else if (minutes === 30) {
                    option.textContent = "30 min.";
                }
            }
            // Formatowanie opcji z początkiem 1godz itd.
            else if (/^\d+godz\d{1,2}$/.test(txt)) {
                let parts = txt.split("godz");
                let hour = parseInt(parts[0]);
                let mins = parseInt(parts[1]);
                let newText = "";
                if (mins === 0) {
                    newText = hour + " godz.";
                } else if (mins === 30) {
                    newText = hour + ",5 godz.";
                } else {
                    newText = txt;
                }
                option.textContent = newText;
            }
        });
    }
}

// Formatowanie wyświetlania godzin w wybranej opcji
function updateUnderlyingSelectOptionTexts() {
    let selects = document.querySelectorAll('select');
    selects.forEach(select => {
        Array.from(select.options).forEach(opt => {
            let txt = opt.textContent.trim();
            if (txt.startsWith("0godz")) {
                let minutes = parseInt(txt.slice(-2));
                if (minutes === 30) {
                    opt.textContent = "30 min.";
                }
            } else if (/^\d+godz\d{1,2}$/.test(txt)) {
                let parts = txt.split("godz");
                let hour = parseInt(parts[0]);
                let mins = parseInt(parts[1]);
                let newText = "";
                if (mins === 0) {
                    newText = hour + " godz.";
                } else if (mins === 30) {
                    newText = hour + ",5 godz.";
                } else {
                    newText = txt;
                }
                opt.textContent = newText;
            }
        });
    });
}

window.addEventListener('load', () => {
    removeOptions();
    updateUnderlyingSelectOptionTexts();
});
removeOptionsObserver.observe(document.body, { childList: true, subtree: true });


})();

    /************************************************
      Przełącznik do włączania/wyłączania wszystkim
      osobom powiadomień
     ************************************************/

(function() {
  'use strict';

  // Utworzenie switcha w zakładce "Uczestnicy"
  function insertMasterSwitch() {
    const actorsCollapse = document.getElementById('actors');
    if (!actorsCollapse) {
      console.log("[MasterSwitch] Jeszcze nie wykryto uczestników.");
      return false;
    }
    if (document.getElementById('toggle-all-notifications')) {
      return true;
    }
    const toggleContainer = document.createElement('div');
    toggleContainer.style.padding = '8px 12px';
    toggleContainer.style.backgroundColor = '#f8f9fa';
    toggleContainer.style.borderBottom = '1px solid #dee2e6';
    toggleContainer.innerHTML = `
      <div class="form-check form-switch m-0">
        <input class="form-check-input" type="checkbox" id="toggle-all-notifications" style="cursor: pointer;">
        <label class="form-check-label ms-1" for="toggle-all-notifications" style="cursor: pointer; user-select: none;">
          Powiadomienia email
        </label>
      </div>
    `;
    actorsCollapse.insertBefore(toggleContainer, actorsCollapse.firstChild);
    return true;
  }

  // Czekanie aż załadują się wymagane elementy
  const pollInterval = setInterval(() => {
    if (insertMasterSwitch()) {
      clearInterval(pollInterval);
      const actorsInterval = setInterval(() => {
        if (typeof window.actors === 'object' && typeof window.saveActorsToDom === 'function') {
          clearInterval(actorsInterval);
          setupMasterSwitchLogic();
        } else {
          console.log("[MasterSwitch] Oczekiwanie na uczestników zgłoszenia...");
        }
      }, 1000);
    }
  }, 1000);

  function setupMasterSwitchLogic(){
    console.log("[MasterSwitch] Ustawianie switcha.");

    function allParticipantsOn() {
      for (const category in window.actors) {
        for (const participant of window.actors[category]) {
          if (participant.use_notification == 0) return false;
        }
      }
      return true;
    }

    function updateMasterSwitch() {
      const masterSwitch = document.getElementById('toggle-all-notifications');
      if (masterSwitch) {
        masterSwitch.checked = allParticipantsOn();
      }
    }

    function updateAllBellIcons(){
      for (const category in window.actors) {
        for (const actor of window.actors[category]) {
          const faClass = (actor.use_notification == 1) ? 'fas' : 'far';
          const selector = `.actor_entry[data-itemtype="${actor.itemtype}"][data-items-id="${actor.items_id}"][data-actortype="${category}"]`;
          document.querySelectorAll(selector).forEach(entry => {
            const icon = entry.querySelector('.notify-icon');
            if (icon) {
              icon.classList.remove('fas','far');
              icon.classList.add(faClass);
            }
          });
        }
      }
    }

    // Aktualizacja MasterSwitcha
    const originalSaveActorsToDom = window.saveActorsToDom;
    window.saveActorsToDom = function() {
      originalSaveActorsToDom();
      updateMasterSwitch();
    };

    // Aktualizacja funkcji zapisu
    if (typeof window.saveNotificationSettings === 'function') {
      const originalSaveNotificationSettings = window.saveNotificationSettings;
      window.saveNotificationSettings = function() {
        originalSaveNotificationSettings();
        updateMasterSwitch();
      };
    }

    const masterSwitch = document.getElementById('toggle-all-notifications');
    masterSwitch.addEventListener('change', () => {
      const newValue = masterSwitch.checked ? 1 : 0;
      for (const category in window.actors) {
        for (const actor of window.actors[category]) {
          actor.use_notification = newValue;
        }
      }
      updateAllBellIcons();
      window.saveActorsToDom();
      // Automatyczny zapis ustawienia powiadomień
      setTimeout(() => {
        const saveButton = document.querySelector('button[name="update"][form="itil-form"]');
        if (saveButton) {
          console.log("[MasterSwitch] Automatyczne zapisywanie.");
          saveButton.click();
        } else {
          console.warn("[MasterSwitch] Nie znaleziono przycisku zapisu.");
        }
      }, 500);
    });

    updateMasterSwitch();
    updateAllBellIcons();

    // Automatyczne wyłączenie powiadomień po dodaniu nowej osoby jeśli MasterSwitch jest wyłączony
    setInterval(() => {
      if (!document.getElementById('toggle-all-notifications').checked) {
        let changed = false;
        for (const category in window.actors) {
          for (const actor of window.actors[category]) {
            if (actor.use_notification != 0) {
              actor.use_notification = 0;
              changed = true;
            }
          }
        }
        if (changed) {
          updateAllBellIcons();
          window.saveActorsToDom();
          // Automatyczny zapis.
          const saveButton = document.querySelector('button[name="update"][form="itil-form"]');
          if (saveButton) {
            saveButton.click();
          }
        }
      }
    }, 2000);
  }
})();

    /************************************************
      Zliczanie i wyśiwetlanie łącznego czasu z zadań
      w zgłoszeniu
     ************************************************/

(function() {
    'use strict';

    // Przetworzenie tekstu z czasem zadania na sekundy
    function parseTaskTime(timeText) {
        timeText = timeText.trim();
        let totalSeconds = 0;
        // Sprawdzenie czy występują godziny
        if (/godz/i.test(timeText)) {
            // Klucz do wyłapywania godzin, minut i sekund z czasu zadania
            let m = timeText.match(/(\d+)\s*godz(?:ina|in|iny)?\s*(\d+)\s*minut(?:[ay])?\s*(\d+)\s*sekund(?:[ay])?/i);
            if (m) {
                let hours = parseInt(m[1], 10);
                let minutes = parseInt(m[2], 10);
                totalSeconds = hours * 3600 + minutes * 60;
            } else {
                console.warn("Nie udało się przetworzyć godzin: " + timeText);
            }
        } else {
            // Klucz do wyłapywania jedynie minut i sekund
            let m = timeText.match(/(\d+)\s*minut(?:[ay])?\s*(\d+)\s*sekund(?:[ay])?/i);
            if (m) {
                let minutes = parseInt(m[1], 10);
                totalSeconds = minutes * 60;
            } else {
                console.warn("Nie udało się przetworzyć minut: " + timeText);
            }
        }
        return totalSeconds;
    }

    // Formatowanie sumarycznego czasu zgłoszenia
    function formatTotalTime(totalSeconds) {
        const totalMinutes = Math.floor(totalSeconds / 60);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        let result = "";
        if (hours > 0) {
            result += hours + " godz. ";
        }
        result += minutes + " min.";
        return result;
    }

    // Sumowanie czasu ze wszystkich zadań
    function updateTaskTimeSummary() {
        let totalSeconds = 0;
        const badges = document.querySelectorAll('.actiontime.badge.bg-orange-lt');
        console.log("Found " + badges.length + " time badges.");
        badges.forEach(badge => {
            const text = badge.textContent.trim();
            console.log("Badge text: " + text);
            totalSeconds += parseTaskTime(text);
        });
        return formatTotalTime(totalSeconds);
    }

    // Wyświetlenie łącznego czasu zgłoszenia
    function insertOrUpdateSummary() {
        const answerBtn = document.querySelector('button.answer-action');
        if (!answerBtn) return;
        let summarySpan = document.getElementById('task-time-summary');
        if (!summarySpan) {
            summarySpan = document.createElement('span');
            summarySpan.id = 'task-time-summary';
            summarySpan.style.marginLeft = '10px';
            summarySpan.style.fontWeight = 'bold';
            answerBtn.parentElement.appendChild(summarySpan);
        }
        summarySpan.textContent = "Łączny czas: " + updateTaskTimeSummary();
    }

    // Załadownie skryptu z opóźnieniem po wczytaniu strony
    window.addEventListener('load', () => {
        setTimeout(insertOrUpdateSummary, 1500);
    });

    // Nasłuchiwanie zmian na osi, by zliczać czas zgłoszenia na bieżąco
    const observer = new MutationObserver(() => {
        insertOrUpdateSummary();
    });
    observer.observe(document.body, { childList: true, subtree: true });
})();
