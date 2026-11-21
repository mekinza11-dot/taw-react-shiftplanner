
const express = require('express')
const cors = require('cors')
require('dotenv').config()
const { PrismaClient } = require('@prisma/client')

const app = express()
const PORT = process.env.PORT || 5000

const prisma = new PrismaClient()

app.use(cors())
app.use(express.json())

// Welcome route
app.get('/', (req, res) => {
  res.send('ShiftPlanner Backend is running!')
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'ShiftPlanner API is working!'
  })
})

// Get all employees
app.get('/api/employees', async (req, res) => {
  try {
    const employees = await prisma.employee.findMany()

    res.json({ success: true, data: employees })
  } catch (error) {
    console.error('Fetch employees error:', error)

    res.status(500).json({
      success: false,
      message: 'Unable to fetch employees. Please try again.'
    })
  }
})

// Add employee with validation
app.post('/api/employees', async (req, res) => {
  try {
    let { name, email, position } = req.body

    // Check required fields
    if (
      typeof name !== 'string' ||
      typeof email !== 'string' ||
      typeof position !== 'string' ||
      !name.trim() ||
      !email.trim() ||
      !position.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please enter name, email, and position.'
      })
    }

    // Remove unnecessary spaces
    name = name.trim()
    email = email.trim().toLowerCase()
    position = position.trim()

    // Validate email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailPattern.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address.'
      })
    }

    // Check duplicate email
    const existingEmployee = await prisma.employee.findUnique({
      where: { email }
    })

    if (existingEmployee) {
      return res.status(409).json({
        success: false,
        message: 'This email address is already registered.'
      })
    }

    // Create employee
    const employee = await prisma.employee.create({
      data: { name, email, position }
    })

    res.status(201).json({
      success: true,
      message: 'Employee added successfully.',
      data: employee
    })
  } catch (error) {
    console.error('Add employee error:', error)

    // Handle duplicate email database error
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'This email address is already registered.'
      })
    }

    res.status(500).json({
      success: false,
      message: 'Unable to add employee. Please try again.'
    })
  }
})

// Delete employee
app.delete('/api/employees/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid employee ID.'
      })
    }

    await prisma.employee.delete({ where: { id } })

    res.json({
      success: true,
      message: 'Employee deleted successfully.'
    })
  } catch (error) {
    console.error('Delete employee error:', error)

    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Employee not found.'
      })
    }

    res.status(500).json({
      success: false,
      message: 'Unable to delete employee.'
    })
  }
})

// Get all shifts
app.get('/api/shifts', async (req, res) => {
  try {
    const shifts = await prisma.shift.findMany({
      include: { employee: true }
    })

    res.json({ success: true, data: shifts })
  } catch (error) {
    console.error('Fetch shifts error:', error)

    res.status(500).json({
      success: false,
      message: 'Unable to fetch shifts.'
    })
  }
})

// Add shift
app.post('/api/shifts', async (req, res) => {
  try {
    const { employeeId, day, startTime, endTime } = req.body

    if (!employeeId || !day || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'All shift fields are required.'
      })
    }

    const validDays = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday'
    ]

    if (!validDays.includes(day)) {
      return res.status(400).json({
        success: false,
        message: 'Please select a valid day.'
      })
    }

    const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/

    if (
      !timePattern.test(startTime) ||
      !timePattern.test(endTime)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please enter valid shift times.'
      })
    }

    if (endTime <= startTime) {
      return res.status(400).json({
        success: false,
        message: 'End time must be later than start time.'
      })
    }

    const employee = await prisma.employee.findUnique({
      where: { id: Number(employeeId) }
    })

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Selected employee was not found.'
      })
    }

    const shift = await prisma.shift.create({
      data: {
        employeeId: Number(employeeId),
        day,
        startTime,
        endTime
      },
      include: { employee: true }
    })

    res.status(201).json({
      success: true,
      data: shift
    })
  } catch (error) {
    console.error('Add shift error:', error)

    res.status(500).json({
      success: false,
      message: 'Unable to add shift.'
    })
  }
})

// Delete shift
app.delete('/api/shifts/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid shift ID.'
      })
    }

    await prisma.shift.delete({ where: { id } })

    res.json({
      success: true,
      message: 'Shift deleted successfully.'
    })
  } catch (error) {
    console.error('Delete shift error:', error)

    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Shift not found.'
      })
    }

    res.status(500).json({
      success: false,
      message: 'Unable to delete shift.'
    })
  }
})

// Get all shift swap requests
app.get('/api/swaps', async (req, res) => {
  try {
    const swaps = await prisma.swapRequest.findMany({
      include: {
        firstShift: {
          include: { employee: true }
        },
        secondShift: {
          include: { employee: true }
        }
      }
    })

    res.json({ success: true, data: swaps })
  } catch (error) {
    console.error('Fetch swaps error:', error)

    res.status(500).json({
      success: false,
      message: 'Unable to fetch shift swap requests.'
    })
  }
})

// Create shift swap request
app.post('/api/swaps', async (req, res) => {
  try {
    const { firstShiftId, secondShiftId } = req.body

    const firstId = Number(firstShiftId)
    const secondId = Number(secondShiftId)

    if (!firstShiftId || !secondShiftId) {
      return res.status(400).json({
        success: false,
        message: 'Both shift IDs are required.'
      })
    }

    if (
      !Number.isInteger(firstId) ||
      !Number.isInteger(secondId) ||
      firstId <= 0 ||
      secondId <= 0 ||
      firstId === secondId
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide two different valid shift IDs.'
      })
    }

    const firstShift = await prisma.shift.findUnique({
      where: { id: firstId }
    })

    const secondShift = await prisma.shift.findUnique({
      where: { id: secondId }
    })

    if (!firstShift || !secondShift) {
      return res.status(404).json({
        success: false,
        message: 'One or both shifts were not found.'
      })
    }

    if (firstShift.day !== secondShift.day) {
      return res.status(400).json({
        success: false,
        message: 'Shifts must be on the same day.'
      })
    }

    const swap = await prisma.swapRequest.create({
      data: {
        firstShiftId: firstId,
        secondShiftId: secondId
      },
      include: {
        firstShift: {
          include: { employee: true }
        },
        secondShift: {
          include: { employee: true }
        }
      }
    })

    res.status(201).json({
      success: true,
      data: swap
    })
  } catch (error) {
    console.error('Create swap error:', error)

    res.status(500).json({
      success: false,
      message: 'Unable to create shift swap request.'
    })
  }
})

// Approve or reject a shift swap
app.patch('/api/swaps/:id/status', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const { status } = req.body

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid swap request ID.'
      })
    }

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be Approved or Rejected.'
      })
    }

    const swap = await prisma.swapRequest.findUnique({
      where: { id },
      include: {
        firstShift: true,
        secondShift: true
      }
    })

    if (!swap) {
      return res.status(404).json({
        success: false,
        message: 'Swap request not found.'
      })
    }

    if (swap.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: 'This swap request has already been processed.'
      })
    }

    if (status === 'Approved') {
      await prisma.$transaction(async (transaction) => {
        await transaction.shift.update({
          where: { id: swap.firstShiftId },
          data: { employeeId: swap.secondShift.employeeId }
        })

        await transaction.shift.update({
          where: { id: swap.secondShiftId },
          data: { employeeId: swap.firstShift.employeeId }
        })

        await transaction.swapRequest.update({
          where: { id },
          data: { status: 'Approved' }
        })
      })
    } else {
      await prisma.swapRequest.update({
        where: { id },
        data: { status: 'Rejected' }
      })
    }

    const updatedSwap = await prisma.swapRequest.findUnique({
      where: { id },
      include: {
        firstShift: {
          include: { employee: true }
        },
        secondShift: {
          include: { employee: true }
        }
      }
    })

    res.json({
      success: true,
      data: updatedSwap,
      message: `Swap request ${status.toLowerCase()} successfully.`
    })
  } catch (error) {
    console.error('Update swap error:', error)

    res.status(500).json({
      success: false,
      message: 'Unable to update shift swap request.'
    })
  }
})

// Start server
app.listen(PORT, () => {
  console.log(`ShiftPlanner server running on port ${PORT}`)
})
