import { getDocs, query, collection, deleteDoc, doc, addDoc } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";

// Initialize Firebase Authentication
const auth = getAuth();

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
    const recordsQuery = query(collection(db, 'records')); // Create a query for the records collection
    const querySnapshot = await getDocs(recordsQuery); // Fetch the records from Firestore

    const records = [];
    querySnapshot.forEach((doc) => {
      records.push({ id: doc.id, data: doc.data() });
    });

    // Sort records alphabetically by 'gemeente'
    records.sort((a, b) => a.data.gemeente.localeCompare(b.data.gemeente));

    const recordsTableBody = document.getElementById('records');
    recordsTableBody.innerHTML = ''; // Clear the table before displaying new data

    records.forEach(({ id, data }) => {
      const newRow = `
        <tr>
          <td>${data.gemeente}</td>
          <td>${data.contactpersoon}</td>
          <td>${data.onderwerp}</td>
          <td>${data.subonderwerp}</td>
          <td>${data.bron}</td>
          <td>${data.status}</td>
          <td class="delete-cell" style="display: none;">
            <button class="delete-button" data-id="${id}" style="display: none;">&minus;</button>
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

// Authentication-related logic
document.addEventListener('DOMContentLoaded', () => {
  const loginButton = document.getElementById('loginButton');
  const logoutButton = document.getElementById('logoutButton');
  const loginModal = document.getElementById('loginModal');
  const closeModal = document.getElementById('closeModal');
  const loginForm = document.getElementById('loginForm');
  const collapsibleHeader = document.querySelector('.form-container h2');
  const content = document.querySelector('.content');

  // Initially hide logout button
  logoutButton.style.display = 'none';

  // Animate collapsible content visibility
  collapsibleHeader.addEventListener('click', () => {
    const isVisible = content.style.display === 'block';
    content.style.display = isVisible ? 'none' : 'block';
  });

  // Open login modal
  loginButton.addEventListener('click', () => {
    console.log('Opening login modal...');
    loginModal.style.display = 'block';
  });

  // Close the modal
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
        loginButton.style.display = 'none';
        logoutButton.style.display = 'inline-block';
        alert('Logged in successfully.');
        console.log('User logged in successfully:', userCredential.user);
      })
      .catch((error) => {
        console.error('Error signing in: ', error);
        alert('Failed to log in. Please check your credentials.');
      });
  });

  // Handle logout button click
  logoutButton.addEventListener('click', () => {
    console.log('Logging out...');
    signOut(auth).then(() => {
      alert('Logged out successfully.');
      loginButton.style.display = 'inline-block';
      logoutButton.style.display = 'none';
      console.log('Logout successful, login button displayed');
    }).catch((error) => {
      console.error('Error logging out: ', error);
    });
  });

  // Listen for auth state changes
  onAuthStateChanged(auth, (user) => {
    if (user) {
      loginButton.style.display = 'none';
      logoutButton.style.display = 'inline-block';
    } else {
      loginButton.style.display = 'inline-block';
      logoutButton.style.display = 'none';
    }
  });
});
