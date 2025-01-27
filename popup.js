// Save the current tabs and assign them a group name
document.getElementById("groupTabs").addEventListener("click", () => {
  const groupName = document.getElementById("groupName").value.trim();

  if (groupName === "") {
    document.getElementById("status").innerText = "Please enter a group name.";
    return;
  }

  // Get all tabs in the current window
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    const groupData = {
      title: groupName,
      tabs: tabs.map(tab => tab.url), // Save only the URLs
    };

    chrome.storage.local.get({ savedGroups: [] }, (data) => {
      const savedGroups = data.savedGroups;
      savedGroups.push(groupData); // Add the new group to savedGroups
      chrome.storage.local.set({ savedGroups }, () => {
        document.getElementById("status").innerText = `Tabs saved as "${groupName}".`;
        loadGroups();
      });
    });
  });
});

// Load existing groups and display them
function loadGroups() {
  const groupList = document.getElementById("groups");
  groupList.innerHTML = ""; // Clear the list

  chrome.storage.local.get({ savedGroups: [] }, (data) => {
    const savedGroups = data.savedGroups;

    if (savedGroups.length === 0) {
      groupList.innerHTML = "<li>No saved groups found.</li>";
      return;
    }

    savedGroups.forEach((group, index) => {
      const listItem = document.createElement("li");
      listItem.textContent = group.title || `Unnamed Group`;

      // Create a "Restore" button
      const restoreButton = document.createElement("button");
      restoreButton.textContent = "Restore";
      restoreButton.style.marginLeft = "10px";

      restoreButton.addEventListener("click", () => {
        const urls = group.tabs;

        // Open all the saved tabs
        urls.forEach(url => {
          chrome.tabs.create({ url });
        });

        document.getElementById("status").innerText = `Group "${group.title}" restored.`;
      });

      // Create a "Delete" button
      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.style.marginLeft = "10px";

      deleteButton.addEventListener("click", () => {
        chrome.storage.local.get({ savedGroups: [] }, (data) => {
          const savedGroups = data.savedGroups;
          const updatedGroups = savedGroups.filter(savedGroup => savedGroup.title !== group.title);
          chrome.storage.local.set({ savedGroups: updatedGroups }, () => {
            document.getElementById("status").innerText = `Group "${group.title}" deleted.`;
            loadGroups(); // Refresh the group list
          });
        });
      });

      listItem.appendChild(restoreButton);
      listItem.appendChild(deleteButton);
      groupList.appendChild(listItem);
    });
  });
}

// Load groups when the popup is opened
document.addEventListener("DOMContentLoaded", loadGroups);
