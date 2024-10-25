// Updated scripts.js to sort the records by the 'gemeente' column alphabetically
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getDocs, query, collection, deleteDoc, doc, addDoc, orderBy, getFirestore } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";

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

// Listen for form submission and add data to Firestore
const form = document.getElementById('dataForm');
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Check honeypot field
  const honeypotValue = document.getElementById('honeypot').value;
  if (honeypotValue) {
    console.warn('Bot submission detected, ignoring.');
    return; // Do not proceed if honeypot field is filled
  }

  // Get the form data
  const newRecord = {
    gemeente: document.getElementById('gemeente').value,
    contactpersoon: document.getElementById('contactpersoon').value,
    onderwerp: document.getElementById('onderwerp').value,
    subonderwerp: document.getElementById('subonderwerp').value,
    bron: document.getElementById('bron').value,
    status: document.getElementById('status').value
  };

  try {
    // Add the record to Firestore
    await addDoc(collection(db, 'records'), newRecord);
    alert('Mapping succesvol toegevoegd!');
    form.reset();
    fetchRecords();  // Fetch updated records after adding a new one
  } catch (error) {
    console.error('Error adding document: ', error);
  }
});

// Function to fetch records from Firestore and display in the table
async function fetchRecords() {
  try {
    // Query records and order them by 'gemeente' alphabetically
    const recordsQuery = query(collection(db, 'records'), orderBy('gemeente'));
    const querySnapshot = await getDocs(recordsQuery); // Fetch the records from Firestore

    const recordsTableBody = document.getElementById('records');
    recordsTableBody.innerHTML = ''; // Clear the table before displaying new data

    querySnapshot.forEach((doc) => {
      const record = doc.data();
      const recordId = doc.id;
      const newRow = `
        <tr>
          <td>${record.gemeente}</td>
          <td>${record.contactpersoon}</td>
          <td>${record.onderwerp}</td>
          <td>${record.subonderwerp}</td>
          <td>${record.bron}</td>
          <td>${record.status}</td>
          <td class="delete-cell" style="display: none;">
            <button class="delete-button" data-id="${recordId}" style="display: none;">&minus;</button>
          </td>
        </tr>
      `;
      recordsTableBody.innerHTML += newRow;
    });

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

    // Attach delete event listeners
    deleteButtons.forEach(button => {
      button.addEventListener('click', async (e) => {
        const recordId = e.target.getAttribute('data-id');
        try {
          await deleteDoc(doc(db, 'records', recordId));
          alert('Record deleted successfully!');
          fetchRecords(); // Refresh the records after deletion
        } catch (error) {
          console.error('Error deleting document: ', error);
        }
      });
    });
  } catch (error) {
    console.error('Error fetching records: ', error);
  }
}

// Fetch the records when the page loads
document.addEventListener('DOMContentLoaded', fetchRecords);

// On document fully loaded
document.addEventListener('DOMContentLoaded', () => {
  const loginButton = document.getElementById('loginButton');
  const loginModal = document.getElementById('loginModal');
  const closeModal = document.getElementById('closeModal');
  const loginForm = document.getElementById('loginForm');
  const actionColumn = document.querySelector('.action-column');
  const collapsibleHeader = document.querySelector('.form-container h2');
  const content = document.querySelector('.content');
  const feedbackButton = document.getElementById('requestButton');
  const feedbackModal = document.getElementById('feedbackModal');
  const closeFeedbackModal = document.getElementById('closeFeedbackModal');
  const feedbackForm = document.getElementById('feedbackForm');

  // Toggle form content visibility
  collapsibleHeader.addEventListener('click', () => {
    content.classList.toggle('closed');
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

  // Function to filter table rows based on search query
  searchBox.addEventListener('input', () => {
    const filter = searchBox.value.toLowerCase();
    const rows = recordsTable.getElementsByTagName('tbody')[0].getElementsByTagName('tr');

    Array.from(rows).forEach(row => {
      const cells = row.getElementsByTagName('td');
      const rowText = Array.from(cells).map(cell => cell.textContent.toLowerCase()).join(' ');
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
    const options = Array.from(document.querySelectorAll('input[name="option"]:checked')).map(checkbox => checkbox.value);

    // Use EmailJS or alternative method here to send the data
    // Placeholder for now
    alert('Feedback verstuurd: ' + description + '\nOpties: ' + options.join(', '));

    // Close modal after submission
    feedbackModal.style.display = 'none';
  });
});

// Sorting initialized through Tablesort in index.html
