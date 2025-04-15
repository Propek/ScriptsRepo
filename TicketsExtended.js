// ==UserScript==
// @name         Tickets Extended
// @namespace    Violentmonkey Scripts
// @match        https://pomoc.engie-polska.pl/*
// @grant        none
// @version      3.11
// @author       Adrian, Hubert
// @description  GLPI QOL scripts pack
// @updateURL    https://github.com/Propek/ScriptsRepo/raw/refs/heads/main/TicketsExtended.js
// @downloadURL  https://github.com/Propek/ScriptsRepo/raw/refs/heads/main/TicketsExtended.js
// ==/UserScript==

/************************************************
 * I. Funkcje formatowania (ID zgłoszenia, tytułów, numerów telefonów,
 *    opcji wyboru godzin) – oraz ich dynamiczna aktualizacja.
 ************************************************/
(function() {
  'use strict';

  /************************************************
   * Wyświetlanie i formatowanie pełnego ID zgłoszenia
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
  * Przyciski do kopiowania ID zgłoszenia i zmiany tytułu zgłoszenia
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
      // Dolny dodatkowy DIV: Ukryty poza trybem edycji, zawiera pole edycji tytułu oraz listę tytułów
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
      // Domyślnie ukryty
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
      // Ustawienie wysokości pola edycji
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
  <optgroup label="NAJCZĘŚCIEJ UŻYWANE">
            <option value="Konfiguracja komputera dla pracownika">Konfiguracja komputera dla pracownika</option>
            <option value="Instalacja dodatkowego oprogramowania">Instalacja dodatkowego oprogramowania</option>
            <option value="Instalacja sterowników i oprogramowania do urządzenia wielofunkcyjnego">Instalacja sterowników i oprogramowania do urządzenia wielofunkcyjnego</option>
            <option value="Rozwiązanie problemu z dostępem do platformy e-Pracownik">Rozwiązanie problemu z dostępem do platformy e-Pracownik</option>
            <option value="Rozwiązanie problemu z logowaniem do konta domenowego">Rozwiązanie problemu z logowaniem do konta domenowego</option>
            <option value="Rozwiązanie problemu z synchronizacją OneDrive">Rozwiązanie problemu z synchronizacją OneDrive</option>
            <option value="Zabezpieczenie danych oraz odłączenie komputera z domeny">Zabezpieczenie danych oraz odłączenie komputera z domeny</option>
            <option value="Oczyszczenie urządzenia z danych">Oczyszczenie urządzenia z danych</option>
            <option value="Konfiguracja dostępu do współdzielonej skrzynki e-mail">Konfiguracja dostępu do współdzielonej skrzynki e-mail</option>
          </optgroup>
          <optgroup label="WSPARCIE">
            <option value="Wsparcie w procesie zmiany hasła w usłudze WiPass">Wsparcie w procesie zmiany hasła w usłudze WiPass</option>
            <option value="Instalacja dodatkowego oprogramowania">Instalacja dodatkowego oprogramowania</option>
            <option value="Pomoc przy konfiguracji podpisu cyfrowego">Pomoc przy konfiguracji podpisu cyfrowego</option>
            <option value="Pomoc przy konfiguracji OKTA Verify">Pomoc przy konfiguracji OKTA Verify</option>
            <option value="Przygotowanie stanowiska pracy">Przygotowanie stanowiska pracy</option>
            <option value="Konfiguracja połączenia VPN na komputerze">Konfiguracja połączenia VPN na komputerze</option>
            <option value="Asysta podczas instalacji oprogramowania przez osoby trzecie">Asysta podczas instalacji oprogramowania przez osoby trzecie</option>
          </optgroup>
          <optgroup label="ROZWIĄZANIE PROBLEMU">
            <option value="Rozwiązanie problemu z dostępem do platformy e-Pracownik">Rozwiązanie problemu z dostępem do platformy e-Pracownik</option>
            <option value="Rozwiązanie problemu z dostępem do platformy Sezame">Rozwiązanie problemu z dostępem do platformy Sezame</option>
            <option value="Rozwiązanie problemu z dostępem do sieci firmowej">Rozwiązanie problemu z dostępem do sieci firmowej</option>
            <option value="Rozwiązanie problemu z logowaniem do konta domenowego">Rozwiązanie problemu z logowaniem do konta domenowego</option>
            <option value="Rozwiązanie problemu z logowaniem do Microsoft 365">Rozwiązanie problemu z logowaniem do Microsoft 365</option>
            <option value="Rozwiązanie problemu z logowaniem do systemu bankowego">Rozwiązanie problemu z logowaniem do systemu bankowego</option>
            <option value="Rozwiązanie problemu zdalnego dostępu do komputera">Rozwiązanie problemu zdalnego dostępu do komputera</option>
            <option value="Rozwiązanie problemu z synchronizacją OneDrive">Rozwiązanie problemu z synchronizacją OneDrive</option>
            <option value="Rozwiązanie problemu z drukowaniem">Rozwiązanie problemu z drukowaniem</option>
            <option value="Rozwiązanie problemu ze skanowaniem">Rozwiązanie problemu ze skanowaniem</option>
            <option value="Rozwiązanie problemu z urządzeniem wielofunkcyjnym">Rozwiązanie problemu z urządzeniem wielofunkcyjnym</option>
            <option value="Rozwiązanie problemu z zablokowanym komputerem">Rozwiązanie problemu z zablokowanym komputerem</option>
          </optgroup>
          <optgroup label="CZYNNOŚCI ADMINISTRACYJNE">
            <option value="Reset konfiguracji MFA">Reset konfiguracji MFA</option>
            <option value="Odblokowanie komputera kluczem Bitlocker">Odblokowanie komputera kluczem Bitlocker</option>
            <option value="Przypisanie licencji AutoCAD na innego użytkownika">Przypisanie licencji AutoCAD na innego użytkownika</option>
            <option value="Odzyskanie dostępu do konta w domenie ENGIE">Odzyskanie dostępu do konta w domenie ENGIE</option>
            <option value="Zablokowanie konta domenowego użytkownika">Zablokowanie konta domenowego użytkownika</option>
            <option value="Zabezpieczenie danych oraz usunięcie konta domenowego">Zabezpieczenie danych oraz usunięcie konta domenowego</option>
            <option value="Zabezpieczenie danych z konta domenowego">Zabezpieczenie danych z konta domenowego</option>
            <option value="Usunięcie konta domenowego">Usunięcie konta domenowego</option>
          </optgroup>
          <optgroup label="URZĄDZENIA">
            <option value="Inwentaryzacja urządzenia">Inwentaryzacja urządzenia</option>
            <option value="Instalacja systemu operacyjnego przeznaczonego dla korporacji">Instalacja systemu operacyjnego przeznaczonego dla korporacji</option>
            <option value="Awaryjna konfiguracja komputera dla pracownika">Awaryjna konfiguracja komputera dla pracownika</option>
            <option value="Awaryjna konfiguracja komputera dla wielu użytkowników">Awaryjna konfiguracja komputera dla wielu użytkowników</option>
            <option value="Konfiguracja komputera dla pracownika">Konfiguracja komputera dla pracownika</option>
            <option value="Konfiguracja komputera dla wielu użytkowników">Konfiguracja komputera dla wielu użytkowników</option>
            <option value="Przygotowanie komputera narzędziowego na obiekt">Przygotowanie komputera narzędziowego na obiekt</option>
            <option value="Uzupełnienie profilu użytkownika na komputerze">Uzupełnienie profilu użytkownika na komputerze</option>
            <option value="Zabezpieczenie danych oraz odłączenie komputera z domeny">Zabezpieczenie danych oraz odłączenie komputera z domeny</option>
            <option value="Oczyszczenie urządzenia z danych">Oczyszczenie urządzenia z danych</option>
            <option value="Przygotowanie urządzenia mobilnego">Przygotowanie urządzenia mobilnego</option>
            <option value="Konfiguracja urządzenia wielofunkcyjnego">Konfiguracja urządzenia wielofunkcyjnego</option>
            <option value="Instalacja sterowników i oprogramowania do urządzenia wielofunkcyjnego">Instalacja sterowników i oprogramowania do urządzenia wielofunkcyjnego</option>
          </optgroup>
          <optgroup label="DOSTĘPY">
            <option value="Konfiguracja dostępów dla nowego użytkownika">Konfiguracja dostępów dla nowego użytkownika</option>
            <option value="Dodanie nowego pracownika do grupy mailingowej">Dodanie nowego pracownika do grupy mailingowej</option>
            <option value="Dodanie użytkownika do listy w portalu DMS">Dodanie użytkownika do listy w portalu DMS</option>
            <option value="Konfiguracja dostępu do współdzielonej skrzynki e-mail">Konfiguracja dostępu do współdzielonej skrzynki e-mail</option>
            <option value="Przyznanie uprawnień lokalnego administratora na komputerze">Przyznanie uprawnień lokalnego administratora na komputerze</option>
            <option value="Przyznanie dostępu do katalogu sieciowego">Przyznanie dostępu do katalogu sieciowego</option>
            <option value="Modyfikacja licencji Microsoft 365">Modyfikacja licencji Microsoft 365</option>
            <option value="Wniosek o przyznanie dodatkowych dostępów dla użytkownika">Wniosek o przyznanie dodatkowych dostępów dla użytkownika</option>
          </optgroup>
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
`;
dropdownRow.appendChild(presetDropdown);


      // Dodany element datalist do podpowiedzi tytułów (utworzony po utworzeniu presetDropdown)
      // Komentarz: iteracja po opcjach selecta z tytułami
      const titleDatalist = document.createElement('datalist'); // Utworzenie datalistu
      titleDatalist.id = 'presetTitlesDatalist';
      Array.from(presetDropdown.options).forEach(option => {
        if(option.value.trim() !== "") {
          const dataOption = document.createElement('option');
          dataOption.value = option.value;
          titleDatalist.appendChild(dataOption);
        }
      });
      document.body.appendChild(titleDatalist);
      editInput.setAttribute('list', titleDatalist.id);

      // Dodany listener do autouzupełniania przy naciśnięciu klawisza TAB
      editInput.addEventListener('keydown', (evt) => {
        if (evt.key === 'Tab') {
          // Pobierz wszystkie opcje z datalistu
          const options = Array.from(titleDatalist.options).map(opt => opt.value);
          const currentValue = editInput.value.trim();
          // Znajdź pierwszą opcję, która zaczyna się od wpisanej wartości (ignorując wielkość liter)
          const match = options.find(opt => opt.toLowerCase().startsWith(currentValue.toLowerCase()));
          if (match) {
            evt.preventDefault();
            // Uzupełnij pole edycji o znaleziony tytuł
            editInput.value = match;
          }
        }
      }, true); // Listener wykonywany w fazie przechwytywania

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
      const bracketPart = (newTitle.match(/\[HLP #[0-9]+\]/) || [])[0] || '';
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

      // Obsługa klawisza ENTER (zapis) i ESC (anulacja) w trybie edycji
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
    }
  });
}

(function() {
  // Funkcja wstrzykująca select z presetami oraz ustawiająca auto hint
  function injectPresetDropdown() {
    var nameInput = document.querySelector('input[name="name"]');
    if (!nameInput) return;

    // Szukamy przycisku "Dodaj" – obecnego tylko na stronie tworzenia zgłoszenia
    var addButton = document.querySelector('button[name="add"][title="Dodaj"]');
    if (!addButton) return;

    // Znajdź kontener pola (przyjmujemy, że jest w .field-container)
    var fieldContainer = nameInput.closest('.field-container');
    if (!fieldContainer) return;

    // Jeśli już dodaliśmy nasz select, nie dodawaj go ponownie
    if (fieldContainer.querySelector('.preset-dropdown-injected')) return;

    // Utwórz element select z presetami
    var presetDropdown = document.createElement('select');
    presetDropdown.classList.add('form-select', 'form-select-sm', 'mt-1', 'preset-dropdown-injected');
    // Wstaw opcje – możesz dowolnie modyfikować
    presetDropdown.innerHTML = `
      <option value="">Wybierz tytuł zgłoszenia</option>
      <optgroup label="NAJCZĘŚCIEJ UŻYWANE">
            <option value="Konfiguracja komputera dla pracownika">Konfiguracja komputera dla pracownika</option>
            <option value="Instalacja dodatkowego oprogramowania">Instalacja dodatkowego oprogramowania</option>
            <option value="Instalacja sterowników i oprogramowania do urządzenia wielofunkcyjnego">Instalacja sterowników i oprogramowania do urządzenia wielofunkcyjnego</option>
            <option value="Rozwiązanie problemu z dostępem do platformy e-Pracownik">Rozwiązanie problemu z dostępem do platformy e-Pracownik</option>
            <option value="Rozwiązanie problemu z logowaniem do konta domenowego">Rozwiązanie problemu z logowaniem do konta domenowego</option>
            <option value="Rozwiązanie problemu z synchronizacją OneDrive">Rozwiązanie problemu z synchronizacją OneDrive</option>
            <option value="Zabezpieczenie danych oraz odłączenie komputera z domeny">Zabezpieczenie danych oraz odłączenie komputera z domeny</option>
            <option value="Oczyszczenie urządzenia z danych">Oczyszczenie urządzenia z danych</option>
            <option value="Konfiguracja dostępu do współdzielonej skrzynki e-mail">Konfiguracja dostępu do współdzielonej skrzynki e-mail</option>
          </optgroup>
          <optgroup label="WSPARCIE">
            <option value="Wsparcie w procesie zmiany hasła w usłudze WiPass">Wsparcie w procesie zmiany hasła w usłudze WiPass</option>
            <option value="Instalacja dodatkowego oprogramowania">Instalacja dodatkowego oprogramowania</option>
            <option value="Pomoc przy konfiguracji podpisu cyfrowego">Pomoc przy konfiguracji podpisu cyfrowego</option>
            <option value="Pomoc przy konfiguracji OKTA Verify">Pomoc przy konfiguracji OKTA Verify</option>
            <option value="Przygotowanie stanowiska pracy">Przygotowanie stanowiska pracy</option>
            <option value="Konfiguracja połączenia VPN na komputerze">Konfiguracja połączenia VPN na komputerze</option>
            <option value="Asysta podczas instalacji oprogramowania przez osoby trzecie">Asysta podczas instalacji oprogramowania przez osoby trzecie</option>
          </optgroup>
          <optgroup label="ROZWIĄZANIE PROBLEMU">
            <option value="Rozwiązanie problemu z dostępem do platformy e-Pracownik">Rozwiązanie problemu z dostępem do platformy e-Pracownik</option>
            <option value="Rozwiązanie problemu z dostępem do platformy Sezame">Rozwiązanie problemu z dostępem do platformy Sezame</option>
            <option value="Rozwiązanie problemu z dostępem do sieci firmowej">Rozwiązanie problemu z dostępem do sieci firmowej</option>
            <option value="Rozwiązanie problemu z logowaniem do konta domenowego">Rozwiązanie problemu z logowaniem do konta domenowego</option>
            <option value="Rozwiązanie problemu z logowaniem do Microsoft 365">Rozwiązanie problemu z logowaniem do Microsoft 365</option>
            <option value="Rozwiązanie problemu z logowaniem do systemu bankowego">Rozwiązanie problemu z logowaniem do systemu bankowego</option>
            <option value="Rozwiązanie problemu zdalnego dostępu do komputera">Rozwiązanie problemu zdalnego dostępu do komputera</option>
            <option value="Rozwiązanie problemu z synchronizacją OneDrive">Rozwiązanie problemu z synchronizacją OneDrive</option>
            <option value="Rozwiązanie problemu z drukowaniem">Rozwiązanie problemu z drukowaniem</option>
            <option value="Rozwiązanie problemu ze skanowaniem">Rozwiązanie problemu ze skanowaniem</option>
            <option value="Rozwiązanie problemu z urządzeniem wielofunkcyjnym">Rozwiązanie problemu z urządzeniem wielofunkcyjnym</option>
            <option value="Rozwiązanie problemu z zablokowanym komputerem">Rozwiązanie problemu z zablokowanym komputerem</option>
          </optgroup>
          <optgroup label="CZYNNOŚCI ADMINISTRACYJNE">
            <option value="Reset konfiguracji MFA">Reset konfiguracji MFA</option>
            <option value="Odblokowanie komputera kluczem Bitlocker">Odblokowanie komputera kluczem Bitlocker</option>
            <option value="Przypisanie licencji AutoCAD na innego użytkownika">Przypisanie licencji AutoCAD na innego użytkownika</option>
            <option value="Odzyskanie dostępu do konta w domenie ENGIE">Odzyskanie dostępu do konta w domenie ENGIE</option>
            <option value="Zablokowanie konta domenowego użytkownika">Zablokowanie konta domenowego użytkownika</option>
            <option value="Zabezpieczenie danych oraz usunięcie konta domenowego">Zabezpieczenie danych oraz usunięcie konta domenowego</option>
            <option value="Zabezpieczenie danych z konta domenowego">Zabezpieczenie danych z konta domenowego</option>
            <option value="Usunięcie konta domenowego">Usunięcie konta domenowego</option>
          </optgroup>
          <optgroup label="URZĄDZENIA">
            <option value="Inwentaryzacja urządzenia">Inwentaryzacja urządzenia</option>
            <option value="Instalacja systemu operacyjnego przeznaczonego dla korporacji">Instalacja systemu operacyjnego przeznaczonego dla korporacji</option>
            <option value="Awaryjna konfiguracja komputera dla pracownika">Awaryjna konfiguracja komputera dla pracownika</option>
            <option value="Awaryjna konfiguracja komputera dla wielu użytkowników">Awaryjna konfiguracja komputera dla wielu użytkowników</option>
            <option value="Konfiguracja komputera dla pracownika">Konfiguracja komputera dla pracownika</option>
            <option value="Konfiguracja komputera dla wielu użytkowników">Konfiguracja komputera dla wielu użytkowników</option>
            <option value="Przygotowanie komputera narzędziowego na obiekt">Przygotowanie komputera narzędziowego na obiekt</option>
            <option value="Uzupełnienie profilu użytkownika na komputerze">Uzupełnienie profilu użytkownika na komputerze</option>
            <option value="Zabezpieczenie danych oraz odłączenie komputera z domeny">Zabezpieczenie danych oraz odłączenie komputera z domeny</option>
            <option value="Oczyszczenie urządzenia z danych">Oczyszczenie urządzenia z danych</option>
            <option value="Przygotowanie urządzenia mobilnego">Przygotowanie urządzenia mobilnego</option>
            <option value="Konfiguracja urządzenia wielofunkcyjnego">Konfiguracja urządzenia wielofunkcyjnego</option>
            <option value="Instalacja sterowników i oprogramowania do urządzenia wielofunkcyjnego">Instalacja sterowników i oprogramowania do urządzenia wielofunkcyjnego</option>
          </optgroup>
          <optgroup label="DOSTĘPY">
            <option value="Konfiguracja dostępów dla nowego użytkownika">Konfiguracja dostępów dla nowego użytkownika</option>
            <option value="Dodanie nowego pracownika do grupy mailingowej">Dodanie nowego pracownika do grupy mailingowej</option>
            <option value="Dodanie użytkownika do listy w portalu DMS">Dodanie użytkownika do listy w portalu DMS</option>
            <option value="Konfiguracja dostępu do współdzielonej skrzynki e-mail">Konfiguracja dostępu do współdzielonej skrzynki e-mail</option>
            <option value="Przyznanie uprawnień lokalnego administratora na komputerze">Przyznanie uprawnień lokalnego administratora na komputerze</option>
            <option value="Przyznanie dostępu do katalogu sieciowego">Przyznanie dostępu do katalogu sieciowego</option>
            <option value="Modyfikacja licencji Microsoft 365">Modyfikacja licencji Microsoft 365</option>
            <option value="Wniosek o przyznanie dodatkowych dostępów dla użytkownika">Wniosek o przyznanie dodatkowych dostępów dla użytkownika</option>
          </optgroup>
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
    `;
    // Wstaw select na końcu kontenera pola
    fieldContainer.appendChild(presetDropdown);

    // Po zmianie wyboru aktualizuj wartość pola input
    presetDropdown.addEventListener('change', function() {
      if (this.value.trim() !== "") {
        nameInput.value = this.value.trim();
      }
    });

    // Utwórz datalist dla autouzupełniania
    var titleDatalist = document.createElement('datalist');
    titleDatalist.id = 'presetTitlesDatalist';
    Array.from(presetDropdown.options).forEach(function(option) {
      if (option.value.trim() !== "") {
        var dataOption = document.createElement('option');
        dataOption.value = option.value;
        titleDatalist.appendChild(dataOption);
      }
    });
    // Dodaj datalist do dokumentu – musi być poza kontenerem pola
    document.body.appendChild(titleDatalist);
    // Przypisz datalist do inputa
    nameInput.setAttribute('list', titleDatalist.id);

    // Listener dla autouzupełniania przy naciśnięciu TAB
    nameInput.addEventListener('keydown', function(evt) {
      if (evt.key === 'Tab') {
        var options = Array.from(titleDatalist.options).map(function(opt) {
          return opt.value;
        });
        var currentValue = nameInput.value.trim();
        var match = options.find(function(opt) {
          return opt.toLowerCase().startsWith(currentValue.toLowerCase());
        });
        if (match) {
          evt.preventDefault();
          nameInput.value = match;
        }
      }
    }, true);
  }

  // Używamy setInterval do okresowego sprawdzania, czy elementy są dostępne
  var checkInterval = setInterval(function() {
    var addButton = document.querySelector('button[name="add"][title="Dodaj"]');
    var nameInput = document.querySelector('input[name="name"]');
    if (addButton && nameInput) {
      clearInterval(checkInterval);
      injectPresetDropdown();
    }
  }, 500);
})();


  /************************************************
   * Formatowanie wyświetlania numerów telefonów
   ************************************************/
  function formatPhoneNumber(phoneNumberElement) {
    const originalNumber = phoneNumberElement.textContent;
    // Używamy wyrażenia regularnego, by dodać spacje między grupami numeru
    const formattedNumber = originalNumber.replace(/(\+\d{2}) ?(\d{3}) ?(\d{3}) ?(\d{3})/, '$1 $2 $3 $4');
    phoneNumberElement.textContent = formattedNumber;
  }

  function formatPhoneNumbers() {
    const phoneNumbers = document.querySelectorAll('a[href^="tel:"]');
    phoneNumbers.forEach(formatPhoneNumber);
  }

  // Uwaga: Zmieniono callback MutationObserver – teraz wywołuje funkcję formatPhoneNumbers poprawnie
  const phoneObserver = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1) { // tylko elementy
          formatPhoneNumbers();
        }
      });
    });
  });

  window.addEventListener('load', function () {
    formatTicketTitle();
    formatTicketTitleOnList();
    formatPhoneNumbers();
    phoneObserver.observe(document.body, { childList: true, subtree: true });
  });

  /************************************************
   * Usunięcie możliwości wyboru godzin poniżej 30 minut
   * oraz formatowanie wyświetlanego tekstu
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
        // Formatowanie opcji zaczynających się od "0godz"
        if (txt.startsWith("0godz")) {
          let minutes = parseInt(txt.slice(-2)); // np. "0godz30" -> 30
          if (minutes < 30) {
            option.remove();
          } else if (minutes === 30) {
            option.textContent = "30 min.";
          }
        }
        // Formatowanie opcji np. "1godz30"
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

  // Formatowanie tekstu opcji w selectach
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
 * II. Przełącznik główny dla powiadomień – ustawianie i logika.
 ************************************************/

(function() {
  'use strict';

  function insertMasterSwitch() {
    const actorsCollapse = document.getElementById('actors');
    if (!actorsCollapse) {
      console.log("[MasterSwitch] Osoby jeszcze nie znalezione.");
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
        <label class="form-check-label ms-1" for="toggle-all-notifications" style="user-select: none; cursor: pointer;">
          Powiadomienia email
        </label>
      </div>
    `;
    actorsCollapse.insertBefore(toggleContainer, actorsCollapse.firstChild);
    return true;
  }

  const pollInterval = setInterval(() => {
    if (insertMasterSwitch()) {
      clearInterval(pollInterval);
      const actorsInterval = setInterval(() => {
        if (typeof window.actors === 'object' && typeof window.saveActorsToDom === 'function') {
          clearInterval(actorsInterval);
          setupMasterSwitchLogic();
        } else {
          console.log("[MasterSwitch] Oczekiwanie na panel osób...");
        }
      }, 1000);
    }
  }, 1000);

  function setupMasterSwitchLogic() {
    console.log("[MasterSwitch] Tworzenie MasterSwitcha.");

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

    function updateAllBellIcons() {
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

    // Aktualizacja state'u MasterSwticha
    const originalSaveActorsToDom = window.saveActorsToDom;
    window.saveActorsToDom = function() {
      originalSaveActorsToDom();
      updateMasterSwitch();
    };

    if (typeof window.saveNotificationSettings === 'function') {
      const originalSaveNotificationSettings = window.saveNotificationSettings;
      window.saveNotificationSettings = function() {
        originalSaveNotificationSettings();
        updateMasterSwitch();
      };
    }

    // Nasłuchiwanie zmian w MasterSwitchu
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
      // Automatyczny zapis zmian.
      setTimeout(() => {
        const saveButton = document.querySelector('button[name="update"][form="itil-form"]');
        if (saveButton) {
          console.log("[MasterSwitch] Automatyczny zapis.");
          saveButton.click();
        } else {
          console.warn("[MasterSwitch] Przycisk zapisu nie znaleziony.");
        }
      }, 500);
    });

    updateMasterSwitch();
    updateAllBellIcons();
  }
})();


/************************************************
 * III. Zliczanie i wyświetlanie łącznego czasu z zadań w zgłoszeniu
 ************************************************/
(function() {
  'use strict';

  /********************
   * Style CSS dla etykiety dodatkowej
   ********************/
  function addAdditionalLabelStyles() {
    if (document.getElementById('additional-label-styles')) return;
    const style = document.createElement('style');
    style.id = 'additional-label-styles';
    style.textContent = `
      /* Upewnij się, że kontener pola (field-container) ma pozycjonowanie relative */
      .field-container.relative {
         position: relative;
      }
      /* Bazowy styl etykiety dodatkowej – absolutnie pozycjonowana wewnątrz kontenera o stałej szerokości */
      .dodatkowy-label {
          font-weight: bold;
          color: #3275b2;  /* domyślnie niebieski */
          position: absolute;
          right: 5px;       /* dopasuj według potrzeb */
          top: 130%;
          transform: translateY(-50%);
          white-space: nowrap;
          pointer-events: none;
          background: transparent;
          width: 200px;     /* stała szerokość, aby uniknąć zmian układu */
          text-align: right;
          overflow: hidden;
          text-overflow: ellipsis;
      }
      /* Gdy etykieta ma reprezentować pełną kwalifikację – tekst "Kwalifikuje się jako dodatkowe" */
      .dodatkowy-label.dodatkowy {
          right: 85px;    /* przesunięcie bardziej w lewo */
          color: green;    /* kolor zielony */
          width: 215px;
      }
      /* Gdy etykieta ma reprezentować potencjalną kwalifikację – tekst "Potencjalnie dodatkowe" */
      .dodatkowy-label.potencjalnie {
          right: 130px;    /* mniejsze przesunięcie */
          color: #3275b2;     /* kolor niebieski */
      }
      /* Efekt falowania */
      .dodatkowy-label::after {
          content: "";
          position: absolute;
          left: -100%;
          top: 0;
          width: 100%;
          height: 100%;
          background: rgba(255,255,255,0.2);
          animation: ripple 2s infinite;
      }
      @keyframes ripple {
          0% { left: -100%; }
          50% { left: 100%; }
          100% { left: 100%; }
      }
    `;
    document.head.appendChild(style);
  }
  addAdditionalLabelStyles();

  /********************
   * Funkcje pomocnicze
   ********************/
  function parseTaskTime(timeText) {
    timeText = timeText.trim();
    let totalSeconds = 0;
    if (/godz/i.test(timeText)) {
      let m = timeText.match(/(\d+)\s*godz(?:ina|in|iny)?\s*(\d+)\s*minut(?:[ay])?\s*(\d+)\s*sekund(?:[ay])?/i);
      if (m) {
        let hours = parseInt(m[1], 10);
        let minutes = parseInt(m[2], 10);
        totalSeconds = hours * 3600 + minutes * 60;
      } else {
        console.warn("Nie udało się przetworzyć godzin: " + timeText);
      }
    } else {
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

  function formatTotalTime(totalSeconds) {
    const totalMinutes = Math.floor(totalSeconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    let result = "";
    if (hours > 0) result += hours + " godz. ";
    result += minutes + " min";
    return result;
  }

  function getTotalTimeSeconds() {
    let totalSeconds = 0;
    const badges = document.querySelectorAll('.actiontime.badge.bg-orange-lt');
    badges.forEach(badge => {
      totalSeconds += parseTaskTime(badge.textContent.trim());
    });
    return totalSeconds;
  }

  function getTotalTimeMinutes() {
    return Math.floor(getTotalTimeSeconds() / 60);
  }

  function parseSuggestedTimeMinutes(suggestedStr) {
    if (!suggestedStr) return null;
    const m = suggestedStr.match(/(\d+)/);
    if (m) {
      return parseInt(m[1], 10);
    }
    return null;
  }

  let initialTicketTitle = null;
  function getCurrentTicketTitle() {
    if (initialTicketTitle !== null) return initialTicketTitle;
    const titleSpan = document.querySelector('.navigationheader-title span');
    if (titleSpan) {
      let text = titleSpan.textContent.trim();
      if (text.indexOf("[HLP") !== -1) {
        text = text.split("[HLP")[0].trim();
      }
      initialTicketTitle = text;
      console.log("Tytuł zgłoszenia (oczyszczony):", initialTicketTitle);
      return initialTicketTitle;
    }
    const titleElem = document.querySelector('.navigationheader-title');
    if (titleElem) {
      let rawText = titleElem.textContent.trim();
      if (rawText.indexOf("[HLP") !== -1) {
        rawText = rawText.split("[HLP")[0].trim();
      }
      initialTicketTitle = rawText;
      console.log("Tytuł zgłoszenia (fallback):", initialTicketTitle);
      return initialTicketTitle;
    }
    return "";
  }

  // Mapa sugerowanego czasu – klucze muszą być zapisane małymi literami
  const titleSuggestedTimes = {
    "konfiguracja komputera dla pracownika": "2 godz",
    "instalacja dodatkowego oprogramowania": "30 min",
    "Instalacja sterowników i oprogramowania do urządzenia wielofunkcyjnego": "30 min",
    "rozwiązanie problemu z dostępem do platformy e-pracownik": "30 min",
    "rozwiązanie problemu z logowaniem do konta domenowego": "30 min",
    "rozwiązanie problemu z synchronizacją onedrive": "30 min",
    "zabezpieczenie danych oraz odłączenie komputera z domeny": "3 godz",
    "oczyszczenie urządzenia z danych": "2 godz",
    "konfiguracja dostępu do współdzielonej skrzynki e-mail": "30 min",
    "wsparcie w procesie zmiany hasła w usłudze wiPass": "30 min",
    "pomoc przy konfiguracji podpisu cyfrowego": "30 min",
    "pomoc przy konfiguracji okta verify": "30 min",
    "przygotowanie stanowiska pracy": "30 min",
    "konfiguracja połączenia vpn na komputerze": "30 min",
    "asysta podczas instalacji oprogramowania przez osoby trzecie": "30 min",
    "rozwiązanie problemu z dostępem do platformy sezame": "30 min",
    "rozwiązanie problemu z dostępem do sieci firmowej": "30 min",
    "rozwiązanie problemu z logowaniem do microsoft 365": "30 min",
    "rozwiązanie problemu z logowaniem do systemu bankowego": "30 min",
    "rozwiązanie problemu zdalnego dostępu do komputera": "30 min",
    "rozwiązanie problemu z drukowaniem": "30 min",
    "rozwiązanie problemu z urządzeniem wielofunkcyjnym": "30 min",
    "rozwiązanie problemu ze skanowaniem": "30 min",
    "rozwiązanie problemu z zablokowanym komputerem": "1 godz",
    "reset konfiguracji mfa": "30 min",
    "przypisanie licencji autocad na innego użytkownika": "30 min",
    "odzyskanie dostępu do konta w domenie engie": "30 min",
    "zablokowanie konta domenowego użytkownika": "30 min",
    "zabezpieczenie danych oraz usunięcie konta domenowego": "4 godz",
    "zabezpieczenie danych z konta domenowego": "2 godz",
    "usunięcie konta domenowego": "1 godz",
    "inwentaryzacja urządzenia": "30 min",
    "instalacja systemu operacyjnego przeznaczonego dla korporacji": "2 godz",
    "awaryjna konfiguracja komputera dla pracownika": "2 godz",
    "awaryjna konfiguracja komputera dla wielu użytkowników": "2 godz",
    "konfiguracja komputera dla wielu użytkowników": "2 godz",
    "przygotowanie komputera narzędziowego na obiekt": "2 godz",
    "uzupełnienie profilu użytkownika na komputerze": "30 min",
    "przygotowanie urządzenia mobilnego": "2 godz",
    "konfiguracja urządzenia wielofunkcyjnego": "1 godz",
    "konfiguracja dostępów dla nowego użytkownika": "30 min",
    "dodanie nowego pracownika do grupy mailingowej": "30 min",
    "dodanie użytkownika do listy w portalu dms": "30 min",
    "przyznanie uprawnień lokalnego administratora na komputerze": "30 min",
    "przyznanie dostępu do katalogu sieciowego": "30 min",
    "modyfikacja licencji microsoft 365": "30 min",
    "wniosek o przyznanie dodatkowych dostępów dla użytkownika": "30 min",
    "archiwizacja kopii zapasowych komputerów": "8 godz",
    "prace porządkowe w glpi": "4 godz",
    "optymalizacja wykorzystania licencji": "4 godz",
    "porządkowanie nieużywanych kont domenowych": "4 godz",
    "porządkowanie licencji microsoft 365": "2 godz",
    "porządkowanie licencji power apps i powerbi": "2 godz",
    "zarządzanie aplikacjami w portalu firmy": "8 godz",
    "aktualizacja obrazu systemu operacyjnego przeznaczonego dla korporacji": "2 godz",
    "odblokowanie komputera kluczem Bitlocker": "30 min"
    // Dodaj kolejne mapowania, jeśli potrzeba
  };

  function getSuggestedTime() {
    const title = getCurrentTicketTitle().trim().toLowerCase();
    return titleSuggestedTimes[title] || null;
  }

  function checkTitleCondition() {
    const titleLower = getCurrentTicketTitle().toLowerCase();
    if (titleLower.indexOf("rozwiązanie") !== -1) return true;
    /* Tytuły zgłoszeń, które powinny być zaliczane do potencjalnie dodatkowych */
    const specificTitles = [
      "instalacja dodatkowego oprogramowania",
      "instalacja sterowników i oprogramowania do urządzenia wielofunkcyjnego",
      "konfiguracja dostępu do współdzielonej skrzynki e-mail",
      "wsparcie w procesie zmiany hasła w usłudze wipass",
      "pomoc przy konfiguracji podpisu cyfrowego",
      "pomoc przy konfiguracji okta verify",
      "odzyskanie dostępu do konta w domenie ENGIE",
      "uzupełnienie profilu użytkownika na komputerze",
      "przyznanie uprawnień lokalnego administratora na komputerze",
    ];
    return specificTitles.includes(titleLower);
  }

  function checkTimeCondition() {
    const suggestedStr = getSuggestedTime();
    const suggestedMinutes = parseSuggestedTimeMinutes(suggestedStr);
    if (suggestedMinutes === null) return false;
    const totalMinutes = getTotalTimeMinutes();
    return totalMinutes > suggestedMinutes;
  }

  /********************
   * Aktualizacja etykiety dodatkowej
   ********************/
  function updateAdditionalLabel() {
  const ticketTitle = getCurrentTicketTitle().toLowerCase();
  let resultText = "";
  // Jeśli tytuł zaczyna się od "awaryjne/a" – zawsze kwalifikuje się jako dodatkowe
  if (ticketTitle.startsWith("awaryjne") || ticketTitle.startsWith("awaryjna")) {
    resultText = "Kwalifikuje się jako dodatkowe";
  } else {
    const titleCond = checkTitleCondition();
    const timeCond = checkTimeCondition();
    if (titleCond && timeCond) {
      resultText = "Kwalifikuje się jako dodatkowe";
    } else if (titleCond) {
      resultText = "Potencjalnie dodatkowe";
    }
  }
  // ... (reszta kodu pozostaje bez zmian)
  let fieldRow = null;
  const rows = document.querySelectorAll('div.form-field.row.col-12.mb-2');
  rows.forEach(row => {
    const label = row.querySelector('label');
    if (label && label.textContent.trim().toLowerCase().includes("dodatkowe")) {
      fieldRow = row;
    }
  });
  if (!fieldRow) return;
  let container = fieldRow.querySelector('div.field-container');
  if (!container) return;
  container.classList.add("relative");
  let labelEl = container.querySelector('#additional_label_text');
  if (!labelEl) {
    labelEl = document.createElement('div');
    labelEl.id = 'additional_label_text';
    labelEl.className = 'dodatkowy-label';
    container.appendChild(labelEl);
  }
  if (labelEl.textContent !== resultText) {
    labelEl.textContent = resultText;
  }
  labelEl.classList.remove("potencjalnie", "dodatkowy");
  if (resultText === "Kwalifikuje się jako dodatkowe") {
    labelEl.classList.add("dodatkowy");
  } else if (resultText === "Potencjalnie dodatkowe") {
    labelEl.classList.add("potencjalnie");
  }
}


  /********************
   * Aktualizacja podsumowania czasu zadania
   ********************/
  function updateTaskTimeSummary() {
    let totalSeconds = 0;
    const badges = document.querySelectorAll('.actiontime.badge.bg-orange-lt');
    badges.forEach(badge => {
      const text = badge.textContent.trim();
      totalSeconds += parseTaskTime(text);
    });
    return formatTotalTime(totalSeconds);
  }

  let observer = null;
  function insertOrUpdateSummary() {
    if (observer) observer.disconnect();
    const navPanel = document.getElementById('tabspanel');
    if (!navPanel) return;
    let summaryContainer = document.getElementById('task-time-summary-container');
    if (!summaryContainer) {
      summaryContainer = document.createElement('li');
      summaryContainer.id = 'task-time-summary-container';
      summaryContainer.classList.add('nav-item');
      summaryContainer.style.padding = '10px';
      summaryContainer.style.borderTop = '1px solid #ccc';
      navPanel.appendChild(summaryContainer);
      const totalTimeEl = document.createElement('div');
      totalTimeEl.id = 'total-time-el';
      summaryContainer.appendChild(totalTimeEl);
      const suggestedTimeEl = document.createElement('div');
      suggestedTimeEl.id = 'suggested-time-el';
      summaryContainer.appendChild(suggestedTimeEl);
    }
    const totalTimeEl = document.getElementById('total-time-el');
    totalTimeEl.innerHTML = "Łączny czas: <strong>" + updateTaskTimeSummary() + "</strong>";
    const suggestedTimeEl = document.getElementById('suggested-time-el');
    const suggestedTime = getSuggestedTime();
    if (suggestedTime) {
      suggestedTimeEl.innerHTML = "Sugerowany czas: <strong>" + suggestedTime + "</strong>";
    } else {
      suggestedTimeEl.innerHTML = "";
    }
    if (observer) {
      observer.observe(document.body, { childList: true, subtree: true });
    }
  }

  /********************
   * Inicjalizacja i okresowa aktualizacja
   ********************/
  window.addEventListener('load', () => {
    setTimeout(() => {
      insertOrUpdateSummary();
      updateAdditionalLabel();
    }, 1500);
  });
  let summaryTimeout = null;
  observer = new MutationObserver(() => {
    if (summaryTimeout) clearTimeout(summaryTimeout);
    summaryTimeout = setTimeout(() => {
      insertOrUpdateSummary();
      updateAdditionalLabel();
    }, 300);
  });
  observer.observe(document.body, { childList: true, subtree: true });
  setInterval(updateAdditionalLabel, 5000);

  /********************
   * Ujawnienie funkcji pomocniczych do globalnego zakresu (opcjonalnie)
   ********************/
  window.myHelpers = {
    getCurrentTicketTitle,
    parseTaskTime,
    formatTotalTime,
    getTotalTimeSeconds,
    getTotalTimeMinutes,
    parseSuggestedTimeMinutes,
    getSuggestedTime,
    checkTitleCondition,
    checkTimeCondition,
    updateTaskTimeSummary,
    updateAdditionalLabel,
    insertOrUpdateSummary
  };

})();


// ================================================
// FUNKCJE DO TWORZENIA POWIĄZANEGO ZGŁOSZENIA (DEBUGOWANE)
// ================================================
(function() {
  'use strict';

// Log helper function
  function log(msg) {
    console.log("[RelatedTicketScript] " + msg);
  }

  // Pobiera numer ID zgłoszenia z tytułu, np. "[HLP #0003500]" -> "3500"
  function getCurrentTicketID() {
    const titleElem = document.querySelector('.navigationheader-title');
    if (!titleElem) return null;
    const text = titleElem.textContent;
    const match = text.match(/\[HLP\s+#0*(\d+)\]/i);
    log("Parsed ticket ID from title: " + (match ? match[1] : "null"));
    return match ? match[1] : null;
  }

  // Funkcja zmieniająca wybór pierwszego dropdownu (_link[link]) na "Podrzędne do" (wartość "3")
  function changeRelationTypeToPodrzedne() {
    log("Zmiana pierwszego dropdownu (_link[link]) na 'Podrzędne do'.");
    const selectRel = document.querySelector('select[name="_link[link]"]');
    if (selectRel) {
      $(selectRel).val("3").trigger("change");
      log("Pierwszy dropdown ustawiony na 'Podrzędne do'.");
    } else {
      log("ERROR: Nie znaleziono pierwszego dropdownu (_link[link]).");
    }
  }

  // Dodaje przycisk "Utwórz podrzędne zgłoszenie" do akordeonu "Powiązane zgłoszenia"
  function addCreateRelatedTicketButton() {
    log("Oczekiwanie na pojawienie się akordeonu #linked_tickets w widoku zgłoszenia.");
    const interval = setInterval(() => {
      const linkedTicketsAccordion = document.getElementById('linked_tickets');
      if (linkedTicketsAccordion) {
        log("Akordeon #linked_tickets znaleziony.");
        clearInterval(interval);
        const accordionBody = linkedTicketsAccordion.querySelector('.accordion-body');
        if (!accordionBody) {
          log("ERROR: Nie znaleziono ciała akordeonu 'Powiązane zgłoszenia'.");
          return;
        }
        // Jeśli przycisk już istnieje, nie dodajemy go ponownie.
        if (document.getElementById('createRelatedTicketButton')) {
          log("Przycisk 'Utwórz podrzędne zgłoszenie' już istnieje.");
          return;
        }

        const btn = document.createElement('button');
        btn.id = 'createRelatedTicketButton';
        btn.textContent = "Utwórz podrzędne zgłoszenie";
        btn.className = "btn btn-sm btn-primary";
        btn.style.marginBottom = "10px";
        btn.addEventListener('click', function() {
          const urlParams = new URLSearchParams(window.location.search);
          const currentTicketID = urlParams.get('id');
          log("Przycisk kliknięty. ID zgłoszenia: " + currentTicketID);
          if (!currentTicketID) {
            log("ERROR: Nie znaleziono ID zgłoszenia.");
            return;
          }
          // Zapisujemy ID do localStorage.
          localStorage.setItem('related_ticket', currentTicketID);
          log("ID zgłoszenia zapisane w localStorage.");

          // Otwieramy stronę tworzenia zgłoszenia w nowej zakładce.
          window.open("/front/ticket.form.php?new=1", "_blank");

          // Na oryginalnej stronie zastępujemy zawartość komunikatem, prosząc użytkownika o ponowne załadowanie strony.
          document.body.innerHTML = `
            <div style="text-align: center; padding: 30px;">
              <h2>Strona zgłoszenia została zaktualizowana.</h2>
              <p>Formularz tworzenia zgłoszenia został otwarty w nowej karcie. Ze względu na ograniczenia techniczne skryptu odśwież tę stronę, by ponownie wyświetlić wybrane zgłoszenie. </p>
              <button id="reloadButton" style="padding: 10px 20px; font-size: 16px;">Odśwież stronę</button>
            </div>
          `;
          // Opcjonalnie – dodajemy obsługę przycisku odświeżania.
          document.getElementById('reloadButton').addEventListener('click', function() {
            window.location.href = window.location.href;
          });

          log("Zaktualizowano zawartość strony. Użytkownik powinien kliknąć przycisk 'Odśwież stronę'.");
        });
        accordionBody.insertAdjacentElement('afterbegin', btn);
        log("Przycisk 'Utwórz podrzędne zgłoszenie' dodany do akordeonu.");
      } else {
        log("Czekam na akordeon #linked_tickets...");
      }
    }, 1000);
  }

  // Funkcja automatycznego dodawania powiązanego zgłoszenia na stronie tworzenia zgłoszenia.
  function autoAddRelatedTicket() {
    log("autoAddRelatedTicket() uruchomione.");
    const urlParams = new URLSearchParams(window.location.search);
    // Jeśli parametr "id" istnieje, to nie jest to strona tworzenia zgłoszenia.
    if (urlParams.has('id')) {
      log("Strona zawiera parametr 'id'. To nie jest strona tworzenia zgłoszenia.");
      return;
    }
    const relatedTicketID = localStorage.getItem('related_ticket');
    log("Odczytano ID powiązanego zgłoszenia: " + relatedTicketID);
    if (!relatedTicketID) {
      log("ERROR: Brak zapisanego ID zgłoszenia.");
      return;
    }
    // Usuwamy zapisane ID, aby proces wykonał się tylko raz.
    localStorage.removeItem('related_ticket');
    log("Usunięto zapisane ID zgłoszenia z localStorage.");

    // Czekamy, aż dynamicznie ładowany kontener #linked_tickets będzie dostępny.
    const waitForContainer = setInterval(() => {
      log("Sprawdzam, czy kontener #linked_tickets jest dostępny...");
      const linkedTicketsContainer = document.getElementById('linked_tickets');
      if (linkedTicketsContainer) {
        log("Kontener #linked_tickets znaleziony.");
        clearInterval(waitForContainer);

        // Zmieniamy pierwszy dropdown na "Podrzędne do".
        changeRelationTypeToPodrzedne();

        // Następnie czekamy na przycisk "Dodaj" w kontenerze.
        const waitForAddButton = setInterval(() => {
          log("Sprawdzam, czy przycisk 'Dodaj' jest dostępny...");
          const addButton = Array.from(linkedTicketsContainer.querySelectorAll('button'))
                              .find(btn => btn.textContent.trim() === "Dodaj");
          if (addButton) {
            log("Przycisk 'Dodaj' znaleziony.");
            clearInterval(waitForAddButton);
            addButton.click();
            log("Kliknięto przycisk 'Dodaj'.");
            // Po krótkim opóźnieniu otwieramy dropdown wyboru zgłoszenia.
            setTimeout(() => {
              log("Wywoływanie funkcji openTicketSelectionDropdown() dla ticketID: " + relatedTicketID);
              openTicketSelectionDropdown(relatedTicketID);
            }, 500);
          } else {
            log("Przycisk 'Dodaj' nie jest jeszcze dostępny. Czekam...");
          }
        }, 1000);
      } else {
        log("Czekam na kontener #linked_tickets...");
      }
    }, 1000);
  }

  // -------------------------------------------------------------------------
  // Funkcje pomocnicze do obsługi Select2 w drugim dropdownie.
  // -------------------------------------------------------------------------

  // Oczekuje na pojawienie się pola wyszukiwania w ostatnio otwartym dropdownie Select2.
  function waitForDropdownSearchInput(callback, retries = 10) {
    log("Sprawdzam pole wyszukiwania w dropdownie Select2, pozostało prób: " + retries);
    const searchInputs = document.querySelectorAll('.select2-dropdown .select2-search__field');
    if (searchInputs.length > 0) {
      log("Znaleziono " + searchInputs.length + " pola. Używam ostatniego.");
      callback(searchInputs[searchInputs.length - 1]);
    } else {
      if (retries <= 0) {
        log("ERROR: Nie znaleziono pola wyszukiwania.");
        return;
      }
      setTimeout(() => waitForDropdownSearchInput(callback, retries - 1), 500);
    }
  }

  // Oczekuje na pojawienie się wyniku wyszukiwania.
  function waitForSelectResult(callback, retries = 10) {
    log("Sprawdzam wyniki wyszukiwania, pozostało prób: " + retries);
    const result = document.querySelector('.select2-results__option[aria-selected]');
    if (result) {
      log("Wynik znaleziony: " + result.textContent);
      callback(result);
    } else {
      if (retries <= 0) {
        log("ERROR: Nie znaleziono wyników wyszukiwania.");
        return;
      }
      setTimeout(() => waitForSelectResult(callback, retries - 1), 500);
    }
  }

  // Funkcja symulująca pełny przebieg zdarzeń myszy (mousedown, mouseup, click) na wyniku.
  function simulateClickOnResult(result) {
    log("Symulacja zdarzeń myszy dla wyniku.");
    var mousedownEvent = new MouseEvent('mousedown', { view: window, bubbles: true, cancelable: true });
    result.dispatchEvent(mousedownEvent);
    log("Dispatched mousedown.");
    var mouseupEvent = new MouseEvent('mouseup', { view: window, bubbles: true, cancelable: true });
    result.dispatchEvent(mouseupEvent);
    log("Dispatched mouseup.");
    var clickEvent = new MouseEvent('click', { view: window, bubbles: true, cancelable: true });
    result.dispatchEvent(clickEvent);
    log("Dispatched click.");
  }

  // Funkcja otwierająca Select2 dla pola wyboru zgłoszenia (_link[tickets_id_2]) i wpisująca ID zgłoszenia.
  function openTicketSelectionDropdown(ticketID) {
    log("Otwarcie dropdownu (_link[tickets_id_2]) dla zgłoszenia.");
    const selectEl = document.querySelector('select[name="_link[tickets_id_2]"]');
    if (!selectEl) {
      log("ERROR: Nie znaleziono elementu select (_link[tickets_id_2]).");
      return;
    }
    log("Element select (_link[tickets_id_2]) znaleziony: " + (selectEl.id || 'brak id'));
    $(selectEl).select2("open");
    log("Wywołano otwarcie Select2.");
    waitForDropdownSearchInput(function(searchInput) {
      log("Pole wyszukiwania znalezione. Wpisuję ticketID: " + ticketID);
      searchInput.value = ticketID;
      const evt = new Event('input', { bubbles: true });
      searchInput.dispatchEvent(evt);
      log("Wysłano zdarzenie input.");
      waitForSelectResult(function(result) {
        log("Przygotowanie do symulacji kliknięcia na wynik: " + result.textContent);
        simulateClickOnResult(result);
        log("Wybrano wynik.");
      });
    });
  }

  // Inicjacja w zależności od strony.
  window.addEventListener('load', function() {
    log("Window load event. location.search: " + window.location.search);
    // Jeśli mamy .navigationheader-title, to jesteśmy na stronie zgłoszenia.
    if (document.querySelector('.navigationheader-title')) {
      log("Wykryto widok zgłoszenia. Uruchamiam addCreateRelatedTicketButton().");
      addCreateRelatedTicketButton();
    }
    // Jeśli URL zawiera parametr new lub mamy formularz tworzenia (np. 'itil-form'),
    // oraz brak .navigationheader-title – to jesteśmy na stronie tworzenia zgłoszenia.
    const params = new URLSearchParams(window.location.search);
    if ((document.getElementById('itil-form') || params.has('new')) && !document.querySelector('.navigationheader-title')) {
      log("Wykryto stronę tworzenia zgłoszenia. Uruchamiam autoAddRelatedTicket().");
      autoAddRelatedTicket();
    } else {
      log("Strona tworzenia zgłoszenia nie została wykryta.");
    }
  });

  // skróty kolejek
  (function() {
  'use strict';

  const breadcrumbHtml = `
    <div class="breadcrumb breadcrumb-alternate pe-1 pe-sm-3">
      <ul class="nav navbar-nav border-start border-left ps-1 ps-sm-2 flex-row">
        <li class="nav-item">
          <a
            href="/front/savedsearch.php?action=load&id=10"
            class="btn btn-icon btn-sm btn-outline-secondary me-1 pe-2"
          >
            <i class="ti ti-eye-check" title="Do realizacji"></i>
            <span class="d-none d-xxl-block"> Do realizacji </span>
          </a>
        </li>

        <li class="nav-item">
          <a
            href="/front/savedsearch.php?action=load&id=5"
            class="btn btn-icon btn-sm btn-outline-secondary me-1 pe-2"
          >
            <i class="ti ti-eye-check" title="Moje aktywne"></i>
            <span class="d-none d-xxl-block"> Moje aktywne </span>
          </a>
        </li>
        <li class="nav-item">
          <a
            href="/front/savedsearch.php?action=load&id=6"
            class="btn btn-icon btn-sm btn-outline-secondary me-1 pe-2"
          >
            <i class="ti ti-eye-check" title="Moje zamknięte"></i>
            <span class="d-none d-xxl-block"> Moje zamknięte </span>
          </a>
        </li>
      </ul>
    </div>
  `;

  let breadcrumbAdded = false;
  const targetSelector = 'main[role="main"][id="page"].legacy';

  const observer = new MutationObserver((mutationsList, observer) => {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList' && !breadcrumbAdded) {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1 && node.matches(targetSelector)) {
            node.insertAdjacentHTML('afterbegin', breadcrumbHtml);
            console.log('Element breadcrumb został dodany przy użyciu MutationObserver.');
            breadcrumbAdded = true;
            observer.disconnect();
            return;
          }
        });
      }
      // Sprawdź, czy targetSelector już istnieje na stronie przy mutacjach
      if (!breadcrumbAdded && document.querySelector(targetSelector)) {
        const mainElement = document.querySelector(targetSelector);
        mainElement.insertAdjacentHTML('afterbegin', breadcrumbHtml);
        console.log('Element breadcrumb został dodany (element był już w DOM).');
        breadcrumbAdded = true;
        observer.disconnect();
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  setTimeout(() => {
    if (!breadcrumbAdded) {
      const mainElement = document.querySelector(targetSelector);
      if (mainElement) {
        mainElement.insertAdjacentHTML('afterbegin', breadcrumbHtml);
        breadcrumbAdded = true;
        observer.disconnect();
        console.log('Element breadcrumb został dodany przez timeout.');
      } else {
        console.log('Element <main> nie został znaleziony w czasie (timeout).');
      }
    }
  }, 5000); // Sprawdzaj maksymalnie przez 5 sekund

})();
})();

