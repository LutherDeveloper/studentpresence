async function submitAttendance(status) {
    const student_id = document.getElementById("studentID").value;
    const name = document.getElementById("studentName").value;

    if (!student_id || !name) {
        alert("Please fill all fields");
        return;
    }

    await fetch("/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id, name, status })
    });

    alert("Success ✅");
    loadData();
}

async function loadData() {
    const res = await fetch("/attendance");
    const data = await res.json();

    const table = document.getElementById("tableData");
    table.innerHTML = "";

    data.forEach(row => {
        table.innerHTML += `
            <tr>
                <td>${row.student_id}</td>
                <td>${row.name}</td>
                <td>${new Date(row.time).toLocaleString()}</td>
                <td>${row.status}</td>
            </tr>
        `;
    });
}

loadData();