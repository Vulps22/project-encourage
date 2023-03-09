let selected = null;
const endpoint = "https://tordBot-Alpha.tx296rt2wp.repl.co";
// Retrieve truths from the server
function getTruths() {
  fetch(`${endpoint}/api/truths`)
    .then(response => response.json())
    .then(truths => { selected = "truth"; displayList(truths); })
    .catch(error => console.error(error));
} d

// Retrieve dares from the server
function getDares() {
  fetch(`${endpoint}/api/dares`)
    .then(response => response.json())
    .then(dares => { selected = "dare"; displayList(dares); })
    .catch(error => console.error(error));
}


// Retrieve servers from the server
function dareReview() {
  fetch(`${endpoint}/api/review/dares`)
    .then(response => response.json())
    .then(dares => { selected = "review_dare"; displayList(dares, true); })
    .catch(error => console.error(error));
}


// Retrieve servers from the server
function getServers() {
  fetch(`${endpoint}/api/servers`)
    .then(response => response.json())
    .then(servers => { selected = "server"; displayServers(servers); })
    .catch(error => console.error(error));
}


// Display the list of truths/dares
function displayList(items, isReview = false) {
  if (items.length === 0) {
    const list = document.getElementById('list');
    list.innerHTML = '';
    const li = document.createElement('li');
    const questionSpan = document.createElement('span');
    questionSpan.classList.add('item');
    questionSpan.textContent = "Nothing to show";
    li.appendChild(questionSpan);
    list.appendChild(li);
  } else {
    const list = document.getElementById('list');
    list.innerHTML = '';
    items.forEach(item => {
      const li = document.createElement('li');
      const questionSpan = document.createElement('span');
      questionSpan.classList.add('item');
      questionSpan.textContent = item.question;
      const buttonPanel = document.createElement('span');
      buttonPanel.classList.add('button-panel');
      const banBtn = document.createElement('button');
      banBtn.textContent = 'Ban';
      banBtn.onclick = () => banItem(item);
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.onclick = () => deleteItem(item);
      const approveBtn = document.createElement('button');
      approveBtn.textContent = 'Approve';
      approveBtn.onclick = () => approveItem(item);
      buttonPanel.appendChild(banBtn);
      buttonPanel.appendChild(deleteBtn);
      if (selected === "review_dare" || selected === "review_dare") buttonPanel.appendChild(approveBtn);
      li.appendChild(questionSpan);
      li.appendChild(buttonPanel);
      list.appendChild(li);
    });
  }
}


function displayServers(servers) {
  const list = document.getElementById('list');
  list.innerHTML = '';
  servers.forEach(server => {
    const li = document.createElement('li');
    const itemSpan = document.createElement('span');
    itemSpan.classList.add('item', 'server-item');
    const idSpan = document.createElement('span');
    idSpan.classList.add('server-id');
    idSpan.textContent = server.id;
    const nameheading = document.createElement('h3');
    nameheading.textContent = server.name;
    const keySpan = document.createElement('span');
    keySpan.classList.add('server-key');
    keySpan.textContent = server.key;
    const statusSpan = document.createElement('span');
    statusSpan.classList.add('server-status');
    const acceptedSpan = document.createElement('span');
    acceptedSpan.classList.add('server-accepted');
    acceptedSpan.textContent = server.hasAccepted ? 'Accepted' : 'Not Accepted';
    const bannedSpan = document.createElement('span');
    bannedSpan.classList.add('server-banned');
    bannedSpan.textContent = server.isBanned ? 'Banned' : '';
    statusSpan.appendChild(acceptedSpan);
    statusSpan.appendChild(bannedSpan);
    itemSpan.appendChild(nameheading);
    itemSpan.appendChild(idSpan);
    itemSpan.appendChild(keySpan);
    itemSpan.appendChild(statusSpan);
    const buttonPanel = document.createElement('span');
    buttonPanel.classList.add('button-panel');
    const banBtn = document.createElement('button');
    banBtn.textContent = 'Ban';
    banBtn.onclick = () => banItem(server);
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = () => deleteItem(server);
    buttonPanel.appendChild(banBtn);
    buttonPanel.appendChild(deleteBtn);
    li.appendChild(itemSpan);
    li.appendChild(buttonPanel);
    list.appendChild(li);
  });
}

// Empty function to ban an item
function banItem(item) {
  console.log(`Banning ${item}`);
}

// Empty function to delete an item
function deleteItem(item) {
  console.log(`Deleting ${item.id}`);
  console.log("mode", selected);
  if (selected === "truth") {
    deleteTruth(item.id);
  } else if (selected === "dare") {
    deleteDare(item.id);
  } else if (selected === "review_dare") {
    deleteReview(item.id);
  } else if (selected === "server") {
    deleteServer(item.key)
  }
}

function deleteTruth(id) {
  fetch(`${endpoint}/api/truth/delete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ id: id })
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // Reload the page to show the updated truth list
        getTruths();
      } else {
        console.log('Error deleting truth');
      }
    })
    .catch(error => {
      console.error('Error deleting truth:', error);
    });

}

function deleteDare(id) {
  fetch(`${endpoint}/api/dare/delete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ id: id })
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // Reload the page to show the updated truth list
        getDares();
      } else {
        console.log('Error deleting dare');
      }
    })
    .catch(error => {
      console.error('Error deleting dare:', error);
    });
}

function deleteReview(id) {
  let api = "";

  if (selected === "review_dare") api = "/api/review/dare/delete";
  else if (selected === "review_truth") api = "/api/review/truth/delete";
  else { console.log("Invalid Selected List"); return; }

  console.log("Sending delete command to ", `${endpoint}${api}`)

  fetch(`${endpoint}${api}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ id: id })
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // Reload the page to show the updated truth list
        getDares();
      } else {
        console.log('Error deleting dare');
      }
    })
    .catch(error => {
      console.error('Error deleting dare:', error);
    });

}

function approveItem(item) {
  let api = "";
  const id = item.id

  if (selected === "review_dare") api = "/api/review/dare/approve";
  else if (selected === "review_truth") api = "/api/review/truth/approve";
  else { console.log("Invalid Selected List"); return; }

  console.log("Sending approve command to ", `${endpoint}${api}`)

  fetch(`${endpoint}${api}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ id: id })
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // Reload the page to show the updated truth list
        dareReview();
      } else {
        console.log('Error approving dare');
      }
    })
    .catch(error => {
      console.error('Error approving dare:', error);
    });

}
