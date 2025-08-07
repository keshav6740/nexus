document.addEventListener("DOMContentLoaded", function () {
    const tableBody = document.querySelector("#data-table tbody"); // Example table
    let records = []; // To store dynamic data
    
    // Dummy Data Example
    function loadDummyData() {
      records = [
        { id: 1, name: "John Doe", role: "Engineer", status: "Active" },
        { id: 2, name: "Jane Smith", role: "Project Manager", status: "Active" },
      ];
      renderTable();
    }
  
    // Render Table Data Dynamically
    function renderTable() {
      tableBody.innerHTML = ""; // Clear previous rows
      records.forEach(record => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${record.id}</td>
          <td>${record.name}</td>
          <td>${record.role}</td>
          <td>${record.status}</td>
          <td>
            <button class="btn btn-warning edit-btn" data-id="${record.id}">Edit</button>
            <button class="btn btn-danger delete-btn" data-id="${record.id}">Delete</button>
          </td>
        `;
        tableBody.appendChild(row);
      });
    }
  
    // Add Record
    document.querySelector("#add-form").addEventListener("submit", function (e) {
      e.preventDefault();
      const name = document.querySelector("#name").value;
      const role = document.querySelector("#role").value;
      records.push({ id: records.length + 1, name, role, status: "Active" });
      renderTable();
      e.target.reset(); // Reset form after submission
    });
  
    // Edit Record
    tableBody.addEventListener("click", function (e) {
      if (e.target.classList.contains("edit-btn")) {
        const id = e.target.getAttribute("data-id");
        const record = records.find(r => r.id == id);
        document.querySelector("#edit-id").value = record.id;
        document.querySelector("#edit-name").value = record.name;
        document.querySelector("#edit-role").value = record.role;
        document.querySelector("#editModal").style.display = "block";
      }
    });
  
    // Save Edited Record
    document.querySelector("#edit-form").addEventListener("submit", function (e) {
      e.preventDefault();
      const id = document.querySelector("#edit-id").value;
      const name = document.querySelector("#edit-name").value;
      const role = document.querySelector("#edit-role").value;
      const record = records.find(r => r.id == id);
      record.name = name;
      record.role = role;
      renderTable();
      document.querySelector("#editModal").style.display = "none";
    });
  
    // Delete Record
    tableBody.addEventListener("click", function (e) {
      if (e.target.classList.contains("delete-btn")) {
        const id = e.target.getAttribute("data-id");
        records = records.filter(r => r.id != id);
        renderTable();
      }
    });
  
    // Apply Filters
    document.querySelector("#filter-form").addEventListener("submit", function (e) {
      e.preventDefault();
      const filterStatus = document.querySelector("#filter-status").value;
      const filteredRecords = records.filter(r => r.status === filterStatus || filterStatus === "All");
      renderFilteredTable(filteredRecords);
    });
  
    function renderFilteredTable(filteredRecords) {
      tableBody.innerHTML = "";
      filteredRecords.forEach(record => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${record.id}</td>
          <td>${record.name}</td>
          <td>${record.role}</td>
          <td>${record.status}</td>
          <td>
            <button class="btn btn-warning edit-btn" data-id="${record.id}">Edit</button>
            <button class="btn btn-danger delete-btn" data-id="${record.id}">Delete</button>
          </td>
        `;
        tableBody.appendChild(row);
      });
    }
  
    // Download Table as CSV
    document.querySelector("#download-btn").addEventListener("click", function () {
      const csvContent = "data:text/csv;charset=utf-8," +
        "ID,Name,Role,Status\n" +
        records.map(r => `${r.id},${r.name},${r.role},${r.status}`).join("\n");
  
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "data.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  
    // Load initial dummy data on page load
    loadDummyData();
  });
  