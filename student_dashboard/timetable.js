// const Sunday =[
//     {   
//         time: 'Sunday',
//         roomNumber: 'Holiday',
//         subject: 'No class Available',
//         type: ''
//     }
// ]
// const Monday =[
//     {   
//         time: '09-10 AM',
//         roomNumber: '38-718',
//         subject: 'DBMS130',
//         type: 'Lecture'
//     },
//     {   
//         time: '10-11 AM',
//         roomNumber: '38-718',
//         subject: 'MTH166',
//         type: 'Tutorial'
//     },
//     {   
//         time: '12-01 PM',
//         roomNumber: '38-718',
//         subject: 'NS200',
//         type: 'Lecture'
//     }
// ]
// const Tuesday =[
//     {   
//         time: '09-10 AM',
//         roomNumber: '27-304Y',
//         subject: 'MTH166',
//         type: 'Tutorial'
//     },
//     {   
//         time: '11-12 AM',
//         roomNumber: '28-107',
//         subject: 'CS849',
//         type: 'Lecture'
//     },
//     {   
//         time: '12-01 PM',
//         roomNumber: '28-107',
//         subject: 'CS849',
//         type: 'Lecture'
//     },
//     {   
//         time: '02-03 PM',
//         roomNumber: '38-718',
//         subject: 'NS200',
//         type: 'Lecture'
//     }
// ]

// const Wednesday =[
//     {   
//         time: '10-11 AM',
//         roomNumber: '33-309',
//         subject: 'DBMS130',
//         type: 'Lecture'
//     },
//     {   
//         time: '11-12 AM',
//         roomNumber: '38-719',
//         subject: 'CS200',
//         type: 'Lecture'
//     }
// ]

// const Thursday =[
//     {   
//         time: '11-12 AM',
//         roomNumber: '33-309',
//         subject: 'MTH166',
//         type: 'Lecture'
//     },
//     {   
//         time: '01-02 PM',
//         roomNumber: '38-719',
//         subject: 'CS849',
//         type: 'Lecture'
//     },
//     {   
//         time: '02-03 PM',
//         roomNumber: '38-718',
//         subject: 'NS200',
//         type: 'Lecture'
//     }
// ]

// const Friday =[
//     {   
//         time: '10-11 AM',
//         roomNumber: '33-309',
//         subject: 'MEC103',
//         type: 'Lecture'
//     },
//     {   
//         time: '11-12 AM',
//         roomNumber: '33-309',
//         subject: 'MEC103',
//         type: 'Lecture'
//     },
//     {   
//         time: '02-03 PM',
//         roomNumber: '33-601',
//         subject: 'CS849',
//         type: 'Tutorial'
//     },

// ]

// const Saturday =[
//     {   
//         time: '09-10 AM',
//         roomNumber: '34-604',
//         subject: 'DBMS130',
//         type: 'Tutorial'
//     },
//     {   
//         time: '10-11 AM',
//         roomNumber: '34-604',
//         subject: 'DBMS130',
//         type: 'Lecture'
//     },
//     {   
//         time: '01-02 PM',
//         roomNumber: '33-309',
//         subject: 'MTH166',
//         type: 'Lecture'
//     }
// ]
// --- NEW TIMETABLE LOGIC START ---

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Function to fetch data from API
async function fetchTimetable(dayIndex) {
    const dayName = dayNames[dayIndex];
    
    // Update the Header immediately
    const header = document.querySelector('.timetable div h2');
    if(header) header.innerText = dayName;

    const tbody = document.querySelector('table tbody');
    if(!tbody) return;

    tbody.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';

    try {
        // Fetch from your local backend
        const response = await fetch(`http://localhost:3000/timetable/${dayName}`);
        const data = await response.json();

        tbody.innerHTML = ''; // Clear loading

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No classes scheduled</td></tr>';
            return;
        }

        // Render rows
        data.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.time_slot}</td>
                <td>${item.room_number}</td>
                <td>${item.subject}</td>
                <td>${item.type}</td>
            `;
            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error("Error:", error);
        tbody.innerHTML = '<tr><td colspan="4" style="color:var(--color-danger); text-align:center;">Server Offline</td></tr>';
    }
}

// Global variable to track current view
let currentDayIndex = new Date().getDay();

// Initialize when page loads
if (window.location.pathname.includes('timetable.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        // Load Today's data
        fetchTimetable(currentDayIndex);
        
        // Setup Buttons
        document.getElementById('nextDay').onclick = () => {
            currentDayIndex = (currentDayIndex + 1) % 7;
            fetchTimetable(currentDayIndex);
        };

        document.getElementById('prevDay').onclick = () => {
            currentDayIndex = (currentDayIndex - 1 + 7) % 7;
            fetchTimetable(currentDayIndex);
        };
    });
}
// --- NEW TIMETABLE LOGIC END ---