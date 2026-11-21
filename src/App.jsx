
import { useState, useEffect } from 'react'
import './App.css'

const API_URL = 'http://localhost:5000/api'

function App() {
  const [activePage, setActivePage] = useState('Dashboard')

  const [employees, setEmployees] = useState([])
  const [shifts, setShifts] = useState([])
  const [swapRequests, setSwapRequests] = useState([])

  const [selectedShift, setSelectedShift] = useState('')
  const [targetShift, setTargetShift] = useState('')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [position, setPosition] = useState('Manager')

  const [employeeId, setEmployeeId] = useState('')
  const [day, setDay] = useState('Monday')
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('17:00')

  const [loading, setLoading] = useState(true)

  const menuItems = [
    'Dashboard',
    'Employees',
    'Weekly Schedule',
    'Shift Swaps',
    'Hours Report',
  ]

  // Load all data from the backend
  async function loadData() {
    try {
      const [employeeResponse, shiftResponse, swapResponse] =
        await Promise.all([
          fetch(`${API_URL}/employees`),
          fetch(`${API_URL}/shifts`),
          fetch(`${API_URL}/swaps`),
        ])

      if (!employeeResponse.ok || !shiftResponse.ok || !swapResponse.ok) {
        throw new Error('Failed to load data from the server.')
      }

      const employeeData = await employeeResponse.json()
      const shiftData = await shiftResponse.json()
      const swapData = await swapResponse.json()

      setEmployees(employeeData.data)
      setShifts(shiftData.data)
      setSwapRequests(swapData.data)
    } catch (error) {
      console.error(error)
      alert('Could not connect to the backend. Please check that your server is running.')
    } finally {
      setLoading(false)
    }
  }

  // Load data when the application opens
  useEffect(() => {
    loadData()
  }, [])

  // Add employee
  async function addEmployee(e) {
    e.preventDefault()

    try {
      const response = await fetch(`${API_URL}/employees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, position }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to add employee.')
      }

      await loadData()

      setName('')
      setEmail('')
      setPosition('Manager')

      alert('Employee added successfully!')
    } catch (error) {
      alert(error.message)
    }
  }

  // Delete employee
  async function deleteEmployee(id) {
    if (!window.confirm('Are you sure you want to delete this employee?')) {
      return
    }

    try {
      const response = await fetch(`${API_URL}/employees/${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete employee.')
      }

      await loadData()
      alert('Employee deleted successfully!')
    } catch (error) {
      alert(error.message)
    }
  }

  // Add shift
  async function addShift(e) {
    e.preventDefault()

    if (!employeeId) {
      alert('Please select an employee.')
      return
    }

    if (endTime <= startTime) {
      alert('End time must be later than start time.')
      return
    }

    try {
      const response = await fetch(`${API_URL}/shifts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeId: Number(employeeId),
          day,
          startTime,
          endTime,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to add shift.')
      }

      await loadData()

      setEmployeeId('')
      setDay('Monday')
      setStartTime('09:00')
      setEndTime('17:00')

      alert('Shift added successfully!')
    } catch (error) {
      alert(error.message)
    }
  }

  // Delete shift
  async function deleteShift(id) {
    if (!window.confirm('Are you sure you want to delete this shift?')) {
      return
    }

    try {
      const response = await fetch(`${API_URL}/shifts/${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete shift.')
      }

      await loadData()
      alert('Shift deleted successfully!')
    } catch (error) {
      alert(error.message)
    }
  }

  // Create shift swap request
  async function createSwapRequest(e) {
    e.preventDefault()

    const firstShift = shifts.find(
      (shift) => shift.id === Number(selectedShift)
    )

    const secondShift = shifts.find(
      (shift) => shift.id === Number(targetShift)
    )

    if (!firstShift || !secondShift) {
      alert('Please select both shifts.')
      return
    }

    if (firstShift.id === secondShift.id) {
      alert('Please select two different shifts.')
      return
    }

    if (firstShift.day !== secondShift.day) {
      alert('Please select shifts on the same day.')
      return
    }

    try {
      const response = await fetch(`${API_URL}/swaps`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstShiftId: firstShift.id,
          secondShiftId: secondShift.id,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create swap request.')
      }

      await loadData()

      setSelectedShift('')
      setTargetShift('')

      alert('Shift swap request created successfully!')
    } catch (error) {
      alert(error.message)
    }
  }

  // Approve or reject a swap request
  async function updateSwapRequest(id, approved) {
    const status = approved ? 'Approved' : 'Rejected'

    try {
      const response = await fetch(`${API_URL}/swaps/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update swap request.')
      }

      await loadData()
      alert(`Swap request ${status.toLowerCase()} successfully!`)
    } catch (error) {
      alert(error.message)
    }
  }

  // Get employee name
  function getEmployeeName(id) {
    const employee = employees.find((item) => item.id === id)
    return employee ? employee.name : 'Unknown'
  }

  // Calculate working hours
  function calculateHours(shift) {
    const start = shift.startTime.split(':').map(Number)
    const end = shift.endTime.split(':').map(Number)

    return (
      (end[0] * 60 + end[1] - start[0] * 60 - start[1]) / 60
    )
  }

  const totalTeamHours = shifts.reduce(
    (total, shift) => total + calculateHours(shift),
    0
  )

  if (loading) {
    return (
      <div className="app">
        <main className="main-content">
          <h2>Loading ShiftPlanner...</h2>
          <p>Connecting to your database.</p>
        </main>
      </div>
    )
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>ShiftPlanner</h2>
        <p className="tagline">Smart Staff Scheduling</p>

        <nav>
          {menuItems.map((item) => (
            <button
              key={item}
              className={activePage === item ? 'active' : ''}
              onClick={() => setActivePage(item)}
            >
              {item}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <p>Staff Management</p>
          <small>ShiftPlanner v1.0</small>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <h1>{activePage}</h1>
            <p>Manage your team and work schedules.</p>
          </div>
          <div className="profile">Manager</div>
        </header>

        {activePage === 'Dashboard' && (
          <>
            <section className="welcome">
              <h2>Welcome to ShiftPlanner 👋</h2>
              <p>
                Manage your employees, shifts and working hours in one place.
              </p>
            </section>

            <section className="stats">
              <div className="stat-card">
                <h3>Total Employees</h3>
                <strong>{employees.length}</strong>
              </div>

              <div className="stat-card">
                <h3>Scheduled Shifts</h3>
                <strong>{shifts.length}</strong>
              </div>

              <div className="stat-card">
                <h3>Pending Swap Requests</h3>
                <strong>
                  {swapRequests.filter(
                    (request) => request.status === 'Pending'
                  ).length}
                </strong>
              </div>

              <div className="stat-card">
                <h3>Working Hours</h3>
                <strong>{totalTeamHours.toFixed(1)}</strong>
              </div>
            </section>

            <section className="schedule-card">
              <h2>Weekly Schedule</h2>
              <p>Your employee shift schedule will appear here.</p>

              <div className="empty-state">
                <span>📅</span>
                <h3>
                  {shifts.length === 0
                    ? 'No shifts scheduled yet'
                    : `${shifts.length} shifts scheduled`}
                </h3>
                <p>Visit Weekly Schedule to manage shifts.</p>
              </div>
            </section>
          </>
        )}

        {activePage === 'Employees' && (
          <>
            <section className="schedule-card employee-form-card">
              <h2>Add New Employee</h2>
              <p>Enter employee details to add them to your team.</p>

              <form onSubmit={addEmployee} className="employee-form">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="Enter employee name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />

                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <label>Position</label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                >
                  <option>Manager</option>
                  <option>Chef</option>
                  <option>Waiter</option>
                  <option>Cashier</option>
                  <option>Sales Assistant</option>
                  <option>Other</option>
                </select>

                <button type="submit" className="add-button">
                  + Add Employee
                </button>
              </form>
            </section>

            <section className="schedule-card employee-list-card">
              <h2>Employee List ({employees.length})</h2>

              {employees.length === 0 ? (
                <div className="empty-state">
                  <span>👥</span>
                  <h3>No employees added yet</h3>
                  <p>Add your first employee using the form above.</p>
                </div>
              ) : (
                <div className="employee-table-wrapper">
                  <table className="employee-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Position</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {employees.map((employee) => (
                        <tr key={employee.id}>
                          <td>{employee.name}</td>
                          <td>{employee.email}</td>
                          <td>{employee.position}</td>
                          <td>
                            <button
                              className="delete-button"
                              onClick={() => deleteEmployee(employee.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}

        {activePage === 'Weekly Schedule' && (
          <>
            <section className="schedule-card employee-form-card">
              <h2>Create New Shift</h2>
              <p>Assign an employee to a day and working time.</p>

              {employees.length === 0 ? (
                <p>Please add an employee before creating a shift.</p>
              ) : (
                <form onSubmit={addShift} className="employee-form">
                  <label>Select Employee</label>
                  <select
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    required
                  >
                    <option value="">Choose employee</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.name}
                      </option>
                    ))}
                  </select>

                  <label>Select Day</label>
                  <select
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                  >
                    {[
                      'Monday',
                      'Tuesday',
                      'Wednesday',
                      'Thursday',
                      'Friday',
                      'Saturday',
                      'Sunday',
                    ].map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>

                  <label>Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />

                  <label>End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />

                  <button type="submit" className="add-button">
                    + Add Shift
                  </button>
                </form>
              )}
            </section>

            <section className="schedule-card employee-list-card">
              <h2>Weekly Rota ({shifts.length} shifts)</h2>

              {shifts.length === 0 ? (
                <div className="empty-state">
                  <span>📅</span>
                  <h3>No shifts scheduled yet</h3>
                  <p>Create your first shift using the form above.</p>
                </div>
              ) : (
                <div className="employee-table-wrapper">
                  <table className="employee-table">
                    <thead>
                      <tr>
                        <th>Day</th>
                        <th>Employee</th>
                        <th>Start Time</th>
                        <th>End Time</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {shifts.map((shift) => (
                        <tr key={shift.id}>
                          <td>{shift.day}</td>
                          <td>{getEmployeeName(shift.employeeId)}</td>
                          <td>{shift.startTime}</td>
                          <td>{shift.endTime}</td>
                          <td>
                            <button
                              className="delete-button"
                              onClick={() => deleteShift(shift.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}

        {activePage === 'Shift Swaps' && (
          <>
            <section className="schedule-card employee-form-card">
              <h2>Create Shift Swap Request</h2>
              <p>Select two employees' shifts to request an exchange.</p>

              {shifts.length < 2 ? (
                <div className="empty-state">
                  <span>🔄</span>
                  <h3>Not enough shifts</h3>
                  <p>Add at least two shifts before creating a swap request.</p>
                </div>
              ) : (
                <form onSubmit={createSwapRequest} className="employee-form">
                  <label>First Shift</label>
                  <select
                    value={selectedShift}
                    onChange={(e) => setSelectedShift(e.target.value)}
                    required
                  >
                    <option value="">Select first shift</option>
                    {shifts.map((shift) => (
                      <option key={shift.id} value={shift.id}>
                        {getEmployeeName(shift.employeeId)} - {shift.day} (
                        {shift.startTime} - {shift.endTime})
                      </option>
                    ))}
                  </select>

                  <label>Second Shift</label>
                  <select
                    value={targetShift}
                    onChange={(e) => setTargetShift(e.target.value)}
                    required
                  >
                    <option value="">Select second shift</option>
                    {shifts.map((shift) => (
                      <option key={shift.id} value={shift.id}>
                        {getEmployeeName(shift.employeeId)} - {shift.day} (
                        {shift.startTime} - {shift.endTime})
                      </option>
                    ))}
                  </select>

                  <button type="submit" className="add-button">
                    + Submit Swap Request
                  </button>
                </form>
              )}
            </section>

            <section className="schedule-card employee-list-card">
              <h2>Swap Requests ({swapRequests.length})</h2>

              {swapRequests.length === 0 ? (
                <div className="empty-state">
                  <span>🔄</span>
                  <h3>No swap requests yet</h3>
                  <p>Submitted requests will appear here.</p>
                </div>
              ) : (
                <div className="employee-table-wrapper">
                  <table className="employee-table">
                    <thead>
                      <tr>
                        <th>Employee 1</th>
                        <th>Employee 2</th>
                        <th>Day</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {swapRequests.map((request) => {
                        const first = shifts.find(
                          (shift) => shift.id === request.firstShiftId
                        )

                        const second = shifts.find(
                          (shift) => shift.id === request.secondShiftId
                        )

                        return (
                          <tr key={request.id}>
                            <td>
                              {first
                                ? getEmployeeName(first.employeeId)
                                : 'N/A'}
                            </td>
                            <td>
                              {second
                                ? getEmployeeName(second.employeeId)
                                : 'N/A'}
                            </td>
                            <td>{first ? first.day : 'N/A'}</td>
                            <td>
                              <span
                                className={`swap-status ${request.status.toLowerCase()}`}
                              >
                                {request.status}
                              </span>
                            </td>
                            <td>
                              {request.status === 'Pending' ? (
                                <div className="swap-actions">
                                  <button
                                    className="approve-button"
                                    onClick={() =>
                                      updateSwapRequest(request.id, true)
                                    }
                                  >
                                    Approve
                                  </button>

                                  <button
                                    className="reject-button"
                                    onClick={() =>
                                      updateSwapRequest(request.id, false)
                                    }
                                  >
                                    Reject
                                  </button>
                                </div>
                              ) : (
                                <span>Completed</span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}

        {activePage === 'Hours Report' && (
          <section className="schedule-card employee-list-card">
            <h2>Employee Working Hours</h2>
            <p>View the total scheduled hours for each employee.</p>

            {employees.length === 0 ? (
              <div className="empty-state">
                <span>📊</span>
                <h3>No employees found</h3>
                <p>Add employees to view their working hours.</p>
              </div>
            ) : (
              <>
                <div className="employee-table-wrapper">
                  <table className="employee-table">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Position</th>
                        <th>Total Shifts</th>
                        <th>Total Hours</th>
                      </tr>
                    </thead>

                    <tbody>
                      {employees.map((employee) => {
                        const employeeShifts = shifts.filter(
                          (shift) => shift.employeeId === employee.id
                        )

                        const totalHours = employeeShifts.reduce(
                          (total, shift) => total + calculateHours(shift),
                          0
                        )

                        return (
                          <tr key={employee.id}>
                            <td>{employee.name}</td>
                            <td>{employee.position}</td>
                            <td>{employeeShifts.length}</td>
                            <td>{totalHours.toFixed(2)} hours</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                <h3 className="hours-total">
                  Total Team Hours: {totalTeamHours.toFixed(2)} hours
                </h3>
              </>
            )}
          </section>
        )}
      </main>
    </div>
  )
}

export default App
