// Updated scripts.js to sort the records by the 'gemeente' column alphabetically
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getDocs, query, collection, deleteDoc, doc, addDoc, updateDoc, getFirestore } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-analytics.js";

// Initialize Firebase Authentication
const firebaseConfig = {
  apiKey: "AIzaSyCHN_JjJdkVAwtsr-brohVo28nV3-YdnSA",
  authDomain: "wiewatstatus.firebaseapp.com",
  projectId: "wiewatstatus",
  storageBucket: "wiewatstatus.appspot.com",
  messagingSenderId: "65233657379",
  appId: "1:65233657379:web:dde1290d3a05dcf68edb96",
  measurementId: "G-53E0YL250H"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const analytics = getAnalytics(app);

function normalizeText(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/gi, ''); // Lowercase and remove non-alphanumeric characters
}


let sort;
// Initialize arrays for storing suggestions
let gemeenteSuggestions = [];
let bronSuggestions = [];

// Fetch suggestions for Gemeente and Bron
fetch('./data/citynamescbs.json')
  .then(response => response.json())
  .then(data => {
    gemeenteSuggestions = data.cbsnames.map(city => city.toponymName);
  })
  .catch(error => console.error('Error loading city names:', error));

fetch('./data/leveranciers.json')
  .then(response => response.json())
  .then(data => {
    bronSuggestions = Object.values(data).map(entry => entry.Bron);
  })
  .catch(error => console.error('Error loading leveranciers:', error));


// Function to create and display suggestion list under the input
function showSuggestions(input, suggestionsArray) {
  // Clear any existing suggestion list
  const existingList = input.parentNode.querySelector('.suggestions-list');
  if (existingList) existingList.remove();

  // Exit if there are no suggestions to show
  if (suggestionsArray.length === 0) return;

  // Create new suggestion list
  const list = document.createElement('ul');
  list.classList.add('suggestions-list');
  
  // Position list directly below the input field
  list.style.top = `${input.offsetTop + input.offsetHeight}px`;
  list.style.left = `${input.offsetLeft}px`;
  list.style.width = `${input.offsetWidth}px`;

  suggestionsArray.forEach(suggestion => {
    const item = document.createElement('li');
    item.textContent = suggestion;
    item.addEventListener('mousedown', (event) => { // Use mousedown instead of click
      event.preventDefault(); // Prevent blur event from hiding the list
      input.value = suggestion; // Set the full suggestion as the input's value
      list.remove(); // Clear the list after selection
    });
    
    list.appendChild(item);
  });
  
  input.parentNode.appendChild(list);
}

// Event listener for Gemeente input
const gemeenteInput = document.getElementById('gemeente');
gemeenteInput.addEventListener('input', () => {
  const query = gemeenteInput.value.toLowerCase();
  const filteredSuggestions = gemeenteSuggestions.filter(suggestion => 
    suggestion.toLowerCase().startsWith(query)
  );

  showSuggestions(gemeenteInput, filteredSuggestions);
});

// Event listener for Bron input
const bronInput = document.getElementById('bron');
bronInput.addEventListener('input', () => {
  const query = normalizeText(bronInput.value);
  const filteredSuggestions = bronSuggestions.filter(suggestion => 
    query.split(' ').some(term => normalizeText(suggestion).includes(term))
  );
  
  showSuggestions(bronInput, filteredSuggestions);
});


// Close suggestion list when clicking outside
document.addEventListener('click', (event) => {
  const lists = document.querySelectorAll('.suggestions-list');
  lists.forEach(list => {
    if (!list.contains(event.target) && event.target !== gemeenteInput && event.target !== bronInput) {
      list.remove();
    }
  });
});

// Close suggestion list on blur (when clicking away) if no match
gemeenteInput.addEventListener('blur', () => {
  const list = gemeenteInput.parentNode.querySelector('.suggestions-list');
  if (list) list.remove();
});

bronInput.addEventListener('blur', () => {
  const list = bronInput.parentNode.querySelector('.suggestions-list');
  if (list) list.remove();
});



// Listen for form submission and add data to Firestore
const form = document.getElementById("dataForm");
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Check honeypot field
    const honeypotValue = document.getElementById("honeypot").value;
    if (honeypotValue) {
        console.warn("Bot submission detected, ignoring.");
        return; // Do not proceed if honeypot field is filled
    }

    // Gather data from form inputs
    const newRecord = {
        gemeente: document.getElementById("gemeente").value,
        contactpersoon: document.getElementById("contactpersoon").value,
        onderwerp: document.getElementById("onderwerp").value,
        subonderwerp: document.getElementById("subonderwerp").value,
        bron: document.getElementById("bron").value,
        status: document.getElementById("status").value
    };

    try {
        // Add the new record to Firestore
        await addDoc(collection(db, "records"), newRecord);
        alert("Mapping succesvol toegevoegd!");
        form.reset();

        fetchRecords();

        // Send email notification using EmailJS
        await emailjs.send("service_46c00xx", "template_jcs0474", {
            gemeente: newRecord.gemeente,
            contactpersoon: newRecord.contactpersoon,
            onderwerp: newRecord.onderwerp,
            subonderwerp: newRecord.subonderwerp,
            bron: newRecord.bron,
            status: newRecord.status,
        });

    } catch (error) {
        console.error("Error adding document or sending email: ", error);
        alert("There was an issue processing your request. Please try again later.");
    }
});


// Function to fetch records from Firestore and display in the table
async function fetchRecords() {
  try {
    // Query records and order them by 'gemeente' alphabetically
    const recordsQuery = query(collection(db, 'records'));
    const querySnapshot = await getDocs(recordsQuery); // Fetch the records from Firestore

    const recordsTableBody = document.getElementById('records');
    recordsTableBody.innerHTML = ''; // Clear the table before displaying new data

    querySnapshot.forEach((doc) => {
      const record = doc.data();
      const recordId = doc.id;
      const newRow = `
        <tr data-id="${recordId}">
          <td data-field="gemeente">${record.gemeente}</td>
          <td data-field="contactpersoon">${record.contactpersoon}</td>
          <td data-field="onderwerp">${record.onderwerp}</td>
          <td data-field="subonderwerp">${record.subonderwerp}</td>
          <td data-field="bron">${record.bron}</td>
          <td data-field="status">${record.status}</td>
          <td class="delete-cell" style="display: none;">
            <button class="delete-button" data-id="${recordId}" style="display: none;">&minus;</button>
          </td>
        </tr>
      `;
      recordsTableBody.innerHTML += newRow;
    });

    sort.refresh();

    // Show delete buttons if the user is logged in
    const deleteButtons = document.querySelectorAll('.delete-button');
    const deleteCells = document.querySelectorAll('.delete-cell');
    onAuthStateChanged(auth, (user) => {
      if (user) {
        deleteButtons.forEach(button => button.style.display = 'inline-block');
        deleteCells.forEach(cell => cell.style.display = 'table-cell');
      } else {
        deleteButtons.forEach(button => button.style.display = 'none');
        deleteCells.forEach(cell => cell.style.display = 'none');
      }
    });

    enableCellEditing();  // Call function to enable cell editing

    // Attach delete event listeners
    deleteButtons.forEach(button => {
      button.addEventListener('click', async (e) => {
        const recordId = e.target.getAttribute('data-id');
        try {
          await deleteDoc(doc(db, 'records', recordId));
          alert('Record deleted successfully!');
          fetchRecords(); // Refresh the records after deletion
        } catch (error) {
          console.error('Error deleting document:', error);
        }
      });
    });
  } catch (error) {
    console.error('Error fetching records:', error);
  }
}

// Function to enable inline cell editing for all table cells
function enableCellEditing() {
  const rows = document.querySelectorAll('#recordsTable tbody tr');
  rows.forEach(row => {
    const recordId = row.getAttribute('data-id');
    row.querySelectorAll('td:not(.delete-cell)').forEach(cell => {
      cell.addEventListener('mouseenter', () => {
        cell.classList.add('editable'); // Add hover effect
      });
      cell.addEventListener('mouseleave', () => {
        cell.classList.remove('editable');
      });
      cell.addEventListener('click', () => {
        if (!auth.currentUser) return; // Only allow editing when logged in
        const originalValue = cell.innerText;
        const field = cell.getAttribute('data-field'); // Retrieve the field name
        // console.log(`Editing field: ${field} for document ID: ${recordId}`); // Debugging line

        const input = document.createElement('input');
        input.type = 'text';
        input.value = originalValue;
        cell.innerHTML = ''; // Clear cell content
        cell.appendChild(input);
        input.focus();

        input.addEventListener('blur', async () => {
          const newValue = input.value.trim();
          if (newValue !== originalValue) {
            if (field) {  // Ensure field is not null
              try {
                await updateDoc(doc(db, 'records', recordId), { [field]: newValue });
                // console.log(`Updated ${field} for document ID: ${recordId} with value: ${newValue}`);
                cell.innerText = newValue;
              } catch (error) {
                console.error('Error updating document:', error);
                cell.innerText = originalValue; // Revert to original if there's an error
              }
            } else {
              console.error('Field name is null, unable to update.');
            }
          } else {
            cell.innerText = originalValue; // Revert if no change
          }
        });

        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            input.blur(); // Save on Enter key
          }
        });
      });
    });
  });
}

// Fetch the records when the page loads
document.addEventListener('DOMContentLoaded', fetchRecords);

// On document fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Init table sort
  sort = new Tablesort(document.getElementById('recordsTable'));
  sort.refresh();

  // Initialize EmailJS
  if (emailjs) {
    emailjs.init({ publicKey: 'sYD3J6d69p4pX-r2V' });
  } else {
    console.error('emailjs not loaded!');
  }

  const loginButton = document.getElementById('loginButton');
  const loginModal = document.getElementById('loginModal');
  const closeModal = document.getElementById('closeModal');
  const loginForm = document.getElementById('loginForm');
  const actionColumn = document.querySelector('.action-column');
  const collapsibleHeader = document.querySelector('.form-container');
  const content = document.querySelector('.content');
  const feedbackButton = document.getElementById('requestButton');
  const feedbackModal = document.getElementById('feedbackModal');
  const closeFeedbackModal = document.getElementById('closeFeedbackModal');
  const feedbackForm = document.getElementById('feedbackForm');

  // Toggle form content visibility
  collapsibleHeader.addEventListener('click', () => {
    content.classList.toggle('closed');
  });

  content.addEventListener('click', event => {
    event.stopImmediatePropagation();
  });

  // Open login modal
  loginButton.addEventListener('click', () => {
    if (auth.currentUser) {
      // User is logged in, so logout
      signOut(auth).then(() => {
        alert('Logged out successfully.');
        loginButton.textContent = 'Admin Login';
      }).catch((error) => {
        console.error('Error logging out: ', error);
      });
    } else {
      // User is not logged in, open the modal
      loginModal.style.display = 'block';
    }
  });

  // Close the login modal
  closeModal.addEventListener('click', () => {
    loginModal.style.display = 'none';
  });

  // Handle login form submission
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Successfully logged in
        loginModal.style.display = 'none';
        loginButton.textContent = 'Log Out';
        alert('Logged in successfully.');
      })
      .catch((error) => {
        console.error('Error signing in: ', error);
        alert('Failed to log in. Please check your credentials.');
      });
  });

  // Listen for auth state changes
  onAuthStateChanged(auth, (user) => {
    if (user) {
      loginButton.textContent = 'Log Out';
      loginButton.classList.add('danger');
      actionColumn.style.display = 'table-cell';
    } else {
      loginButton.textContent = 'Admin Login';
      loginButton.classList.remove('danger');
      actionColumn.style.display = 'none';
    }
  });

  // Search box and clear button functionality
  const searchBox = document.getElementById('searchBox');
  const clearButton = document.getElementById('clearButton');
  const recordsTable = document.getElementById('recordsTable');

// Function to filter table rows based on search query with enhanced special character handling
searchBox.addEventListener('input', () => {
  const filter = normalizeText(searchBox.value).replace(/\s+/g, ''); // Normalize and remove spaces
  const rows = recordsTable.getElementsByTagName('tbody')[0].getElementsByTagName('tr');

  Array.from(rows).forEach(row => {
    const cells = row.getElementsByTagName('td');
    const rowText = Array.from(cells)
      .map(cell => normalizeText(cell.textContent).replace(/-/g, '').replace(/\s+/g, '')) // Normalize and handle dashes/spaces
      .join('');

    row.style.display = rowText.includes(filter) ? '' : 'none';
  });
});

  // Function to clear the search box and reset the table rows
  clearButton.addEventListener('click', () => {
    searchBox.value = '';
    const rows = recordsTable.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
    Array.from(rows).forEach(row => {
      row.style.display = '';
    });
  });

  // Open feedback modal
  feedbackButton.addEventListener('click', () => {
    feedbackModal.style.display = 'block';
  });

  // Close feedback modal
  closeFeedbackModal.addEventListener('click', () => {
    feedbackModal.style.display = 'none';
  });

  // Handle feedback form submission
  feedbackForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Collect form data
    const description = document.getElementById('description').value;
    const email = document.getElementById('contactEmail').value;
    const options = Array.from(document.querySelectorAll('input[name="option"]:checked')).map(checkbox => checkbox.value);

    // Use EmailJS or alternative method here to send the data
    try {
      emailjs.send('service_46c00xx', 'template_xiy2tgj', {
        description,
        email,
        changeRequests: options.join(', ')
      });
      alert('Dank voor uw feedback');
    }
    catch (error) {
      console.error(error);
      alert('Oeps, er ging iets fout! Probeer het later opnieuw.');
    }

    // Close modal after submission
    feedbackModal.style.display = 'none';
  });
});
