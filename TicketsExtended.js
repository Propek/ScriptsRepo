// ==UserScript==
// @name         Tickets Extended
// @namespace    Violentmonkey Scripts
// @match        https://pomoc.engie-polska.pl/*
// @grant        none
// @version      2.4
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
            <option value="Instalacja sterowników i oprogramowania do drukarki/urządzenia wielofunkcyjnego">Instalacja sterowników i oprogramowania do drukarki/urządzenia wielofunkcyjnego</option>
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
            <option value="Rozwiązanie problemu z zablokowanym komputerem">Rozwiązanie problemu z zablokowanym komputerem</option>
          </optgroup>
          <optgroup label="CZYNNOŚCI ADMINISTRACYJNE">
            <option value="Reset konfiguracji MFA">Reset konfiguracji MFA</option>
            <option value="Przypisanie licencji AutoCAD na innego użytkownika">Przypisanie licencji AutoCAD na innego użytkownika</option>
            <option value="Odzyskanie dostępu do konta w domenie ENGIE">Odzyskanie dostępu do konta w domenie ENGIE</option>
            <option value="Odblokowanie i administracyjna zmiana hasła domenowego użytkownika">Odblokowanie i administracyjna zmiana hasła domenowego użytkownika</option>
            <option value="Zablokowanie konta domenowego użytkownika">Zablokowanie konta domenowego użytkownika</option>
            <option value="Zabezpieczenie danych oraz usunięcie konta domenowego">Zabezpieczenie danych oraz usunięcie konta domenowego</option>
            <option value="Zabezpieczenie danych z konta domenowego">Zabezpieczenie danych z konta domenowego</option>
            <option value="Usunięcie konta domenowego">Usunięcie konta domenowego</option>
          </optgroup>
          <optgroup label="URZĄDZENIA">
            <option value="Inwentaryzacja urządzenia">Inwentaryzacja urządzenia</option>
            <option value="Instalacja systemu operacyjnego przeznaczonego dla korporacji">Instalacja systemu operacyjnego przeznaczonego dla korporacji</option>
            <option value="Awaryjna konfiguracja komputera dla pracownika">Awaryjna konfiguracja komputera dla pracownika</option>
            <option value="Awaryjna konfiguracja komputera dla wielu użytkowników">Konfiguracja komputera dla wielu użytkowników</option>
            <option value="Konfiguracja komputera dla pracownika">Konfiguracja komputera dla pracownika</option>
            <option value="Konfiguracja komputera dla wielu użytkowników">Konfiguracja komputera dla wielu użytkowników</option>
            <option value="Przygotowanie komputera narzędziowego na obiekt">Przygotowanie komputera narzędziowego na obiekt</option>
            <option value="Uzupełnienie profilu użytkownika na komputerze">Uzupełnienie profilu użytkownika na komputerze</option>
            <option value="Zabezpieczenie danych oraz odłączenie komputera z domeny">Zabezpieczenie danych oraz odłączenie komputera z domeny</option>
            <option value="Oczyszczenie urządzenia z danych">Oczyszczenie urządzenia z danych</option>
            <option value="Przygotowanie urządzenia mobilnego">Przygotowanie urządzenia mobilnego</option>
            <option value="Konfiguracja drukarki/urządzenia wielofunkcyjnego">Konfiguracja drukarki/urządzenia wielofunkcyjnego</option>
            <option value="Instalacja sterowników i oprogramowania do drukarki/urządzenia wielofunkcyjnego">Instalacja sterowników i oprogramowania do drukarki/urządzenia wielofunkcyjnego</option>
          </optgroup>
          <optgroup label="DOSTĘPY">
            <option value="Konfiguracja dostępów dla nowego użytkownika">Konfiguracja dostępów dla nowego użytkownika</option>
            <option value="Dodanie nowego pracownika do grupy mailingowej">Dodanie nowego pracownika do grupy mailingowej</option>
            <option value="Dodanie użytkownika do listy w portalu DMS">Dodanie użytkownika do listy w portalu DMS</option>
            <option value="Konfiguracja dostępu do współdzielonej skrzynki e-mail">Konfiguracja dostępu do współdzielonej skrzynki e-mail</option>
            <option value="Przyznanie uprawnień lokalnego administratora na komputerze">Przyznanie uprawnień lokalnego administratora na komputerze</option>
            <option value="Przyznanie dostępu do katalogu sieciowego">Przyznanie dostępu do katalogu sieciowego</option>
            <option value="Modyfikacja licencji Microsoft 365">Modyfikacja licencji Microsoft 365</option>
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
            <option value="Instalacja sterowników i oprogramowania do drukarki/urządzenia wielofunkcyjnego">Instalacja sterowników i oprogramowania do drukarki/urządzenia wielofunkcyjnego</option>
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
            <option value="Rozwiązanie problemu z zablokowanym komputerem">Rozwiązanie problemu z zablokowanym komputerem</option>
          </optgroup>
          <optgroup label="CZYNNOŚCI ADMINISTRACYJNE">
            <option value="Reset konfiguracji MFA">Reset konfiguracji MFA</option>
            <option value="Przypisanie licencji AutoCAD na innego użytkownika">Przypisanie licencji AutoCAD na innego użytkownika</option>
            <option value="Odzyskanie dostępu do konta w domenie ENGIE">Odzyskanie dostępu do konta w domenie ENGIE</option>
            <option value="Odblokowanie i administracyjna zmiana hasła domenowego użytkownika">Odblokowanie i administracyjna zmiana hasła domenowego użytkownika</option>
            <option value="Zablokowanie konta domenowego użytkownika">Zablokowanie konta domenowego użytkownika</option>
            <option value="Zabezpieczenie danych oraz usunięcie konta domenowego">Zabezpieczenie danych oraz usunięcie konta domenowego</option>
            <option value="Zabezpieczenie danych z konta domenowego">Zabezpieczenie danych z konta domenowego</option>
            <option value="Usunięcie konta domenowego">Usunięcie konta domenowego</option>
          </optgroup>
          <optgroup label="URZĄDZENIA">
            <option value="Inwentaryzacja urządzenia">Inwentaryzacja urządzenia</option>
            <option value="Instalacja systemu operacyjnego przeznaczonego dla korporacji">Instalacja systemu operacyjnego przeznaczonego dla korporacji</option>
            <option value="Awaryjna konfiguracja komputera dla pracownika">Awaryjna konfiguracja komputera dla pracownika</option>
            <option value="Awaryjna konfiguracja komputera dla wielu użytkowników">Konfiguracja komputera dla wielu użytkowników</option>
            <option value="Konfiguracja komputera dla pracownika">Konfiguracja komputera dla pracownika</option>
            <option value="Konfiguracja komputera dla wielu użytkowników">Konfiguracja komputera dla wielu użytkowników</option>
            <option value="Przygotowanie komputera narzędziowego na obiekt">Przygotowanie komputera narzędziowego na obiekt</option>
            <option value="Uzupełnienie profilu użytkownika na komputerze">Uzupełnienie profilu użytkownika na komputerze</option>
            <option value="Zabezpieczenie danych oraz odłączenie komputera z domeny">Zabezpieczenie danych oraz odłączenie komputera z domeny</option>
            <option value="Oczyszczenie urządzenia z danych">Oczyszczenie urządzenia z danych</option>
            <option value="Przygotowanie urządzenia mobilnego">Przygotowanie urządzenia mobilnego</option>
            <option value="Konfiguracja drukarki/urządzenia wielofunkcyjnego">Konfiguracja drukarki/urządzenia wielofunkcyjnego</option>
            <option value="Instalacja sterowników i oprogramowania do drukarki/urządzenia wielofunkcyjnego">Instalacja sterowników i oprogramowania do drukarki/urządzenia wielofunkcyjnego</option>
          </optgroup>
          <optgroup label="DOSTĘPY">
            <option value="Konfiguracja dostępów dla nowego użytkownika">Konfiguracja dostępów dla nowego użytkownika</option>
            <option value="Dodanie nowego pracownika do grupy mailingowej">Dodanie nowego pracownika do grupy mailingowej</option>
            <option value="Dodanie użytkownika do listy w portalu DMS">Dodanie użytkownika do listy w portalu DMS</option>
            <option value="Konfiguracja dostępu do współdzielonej skrzynki e-mail">Konfiguracja dostępu do współdzielonej skrzynki e-mail</option>
            <option value="Przyznanie uprawnień lokalnego administratora na komputerze">Przyznanie uprawnień lokalnego administratora na komputerze</option>
            <option value="Przyznanie dostępu do katalogu sieciowego">Przyznanie dostępu do katalogu sieciowego</option>
            <option value="Modyfikacja licencji Microsoft 365">Modyfikacja licencji Microsoft 365</option>
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

  // Funkcja przetwarzająca tekst z czasem zadania na sekundy
  function parseTaskTime(timeText) {
    timeText = timeText.trim();
    let totalSeconds = 0;
    // Sprawdzenie, czy występują godziny
    if (/godz/i.test(timeText)) {
      // Wyłapywanie godzin, minut i sekund z tekstu
      let m = timeText.match(/(\d+)\s*godz(?:ina|in|iny)?\s*(\d+)\s*minut(?:[ay])?\s*(\d+)\s*sekund(?:[ay])?/i);
      if (m) {
        let hours = parseInt(m[1], 10);
        let minutes = parseInt(m[2], 10);
        totalSeconds = hours * 3600 + minutes * 60;
      } else {
        console.warn("Nie udało się przetworzyć godzin: " + timeText);
      }
    } else {
      // Wyłapywanie minut i sekund, gdy nie występują godziny
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
    console.log("Znaleziono " + badges.length + " odznak czasu.");
    badges.forEach(badge => {
      const text = badge.textContent.trim();
      console.log("Tekst odznaki: " + text);
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

  // Uruchomienie funkcji z opóźnieniem po załadowaniu strony
  window.addEventListener('load', () => {
    setTimeout(insertOrUpdateSummary, 1500);
  });

  // Obserwator zmian, aby na bieżąco aktualizować sumę czasu
  const observer = new MutationObserver(() => {
    insertOrUpdateSummary();
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
