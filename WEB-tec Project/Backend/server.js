// Import dependencies
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const session = require('express-session');
const multer = require('multer');
const path = require('path');


// Constants
const app = express();
const port = 5000;
const saltRounds = 10;
const mongoUrl = 'mongodb://localhost:27017';
const url = mongoUrl;
const dbName = 'test';

(app.use(express.static(path.join(__dirname, 'public'))))
// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(
  session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// MongoDB connection utility
async function connectToDb() {
  const client = new MongoClient(mongoUrl);
  await client.connect();
  return client;
}

// Route: Student Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

  const client = await connectToDb();
  const db = client.db(dbName);
  try {
    const user = await db.collection('Student').findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    req.session.user = { id: user._id, email: user.email };
    res.status(200).json({ message: 'Login successful', student_id: user._id });
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    await client.close();
  }
});


// Route to handle student logout
app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ message: 'Could not log out.' });
    }
    res.status(200).json({ message: 'Logged out.' });
  });
});


// Route: Student Registration
app.post('/register', async (req, res) => {
  const { name, email, password, date_of_birth, phone_number, gender, address } = req.body;
  if (!name || !email || !password || !date_of_birth || !phone_number || !gender || !address) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const client = await connectToDb();
  const db = client.db(dbName);
  try {
    const existingUser = await db.collection('Student').findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = { name, email, password: hashedPassword, date_of_birth, phone_number, gender, address };
    const result = await db.collection('Student').insertOne(newUser);
    res.status(200).json({ message: 'Registration successful', student_id: result.insertedId });
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    await client.close();
  }
});

// Route: Owner Login
app.post('/owner-login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const client = await connectToDb();
  const db = client.db(dbName);

  try {
    const owner = await db.collection('HostelOwner').findOne({ email });

    if (!owner || !(await bcrypt.compare(password, owner.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Store session data
    req.session.user = { id: owner._id, email: owner.email };
    res.status(200).json({
      message: 'Login successful',
      owner_id: owner._id,
    });
  } catch (err) {
    console.error('Error during owner login:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    await client.close();
  }
});


// Route to handle owner logout
app.post('/owner-logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ message: 'Could not log out.' });
    }
    res.status(200).json({ message: 'Logged out.' });
  });
});

app.post('/register_owner', async (req, res) => {
  const { name, email, password, phone_number, address } = req.body;

  if (!name || !email || !password || !phone_number || !address) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const client = await connectToDb();
  const db = client.db(dbName);

  try {
    // Check if the owner already exists
    const existingOwner = await db.collection('HostelOwner').findOne({ email });
    if (existingOwner) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert the new owner into the `HostelOwner` collection
    const newOwner = {
      name,
      email,
      password: hashedPassword,
      phone_number,
      address,
    };

    const result = await db.collection('HostelOwner').insertOne(newOwner);

    res.status(201).json({ message: 'Registration successful', owner_id: result.insertedId });
  } catch (error) {
    console.error('Error during owner registration:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    await client.close();
  }
});

app.post('/admin-login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const client = await connectToDb();
  const db = client.db(dbName);

  try {
    // Find admin by email
    const admin = await db.collection('CollegeAdministration').findOne({ email });
    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Store session data
    req.session.user = { id: admin._id, email: admin.email };
    res.status(200).json({ message: 'Login successful', admin_id: admin._id });
  } catch (err) {
    console.error('Error during admin login:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    await client.close();
  }
});

app.post('/admin-logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ message: 'Could not log out.' });
    }
    res.status(200).json({ message: 'Logged out successfully' });
  });
});

app.post('/register-admin', async (req, res) => {
  const { name, email, password, phone_number, position } = req.body;

  if (!name || !email || !password || !phone_number || !position) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const client = await connectToDb();
  const db = client.db(dbName);

  try {
    // Check if admin already exists
    const existingAdmin = await db.collection('CollegeAdministration').findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new admin
    const newAdmin = { name, email, password: hashedPassword, phone_number, position };
    const result = await db.collection('CollegeAdministration').insertOne(newAdmin);

    res.status(201).json({ message: 'Registration successful', admin_id: result.insertedId });
  } catch (error) {
    console.error('Error during admin registration:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    await client.close();
  }
});



// Route: Add Hostel
app.post('/add-hostel', upload.single('image'), async (req, res) => {
  const { owner_id, name, address, description, total_rooms, available_rooms, rent, facilities } = req.body;
  const image_path = req.file ? req.file.filename : null;

  if (!owner_id || !name || !address || !description || !total_rooms || !available_rooms || !rent || !image_path) {
    return res.status(400).json({ message: 'All fields including image are required' });
  }

  const client = await connectToDb();
  const db = client.db(dbName);
  try {
    const HostelDetails = {
      owner_id,
      name,
      address,
      description,
      total_rooms: parseInt(total_rooms),
      available_rooms: parseInt(available_rooms),
      rent: parseFloat(rent),
      image_path,
      facilities: JSON.parse(facilities || '[]'),
      approval_status: 'pending',
    };
    await db.collection('HostelDetails').insertOne(HostelDetails);
    res.status(200).json({ message: 'Hostel added successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    await client.close();
  }
});

app.get('/owner-hostels/:ownerId', async (req, res) => {
  const ownerId = req.params.ownerId;

  if (!ownerId) {
    return res.status(400).json({ message: 'Owner ID is required' });
  }

  const client = await connectToDb();
  const db = client.db(dbName);

  try {
    // Fetch hostels for the given owner_id
    const hostels = await db.collection('HostelDetails').find({ owner_id: ownerId }).toArray();

    if (hostels.length === 0) {
      return res.status(404).json({ message: 'No hostels found for this owner' });
    }

    // Process results to include base64 encoded image paths
    const processedHostels = hostels.map((hostel) => {
      let base64Image = null;

      // Convert image_path to base64 if it exists
      if (hostel.image_path) {
        try {
          const imagePath = path.join(__dirname, 'uploads', hostel.image_path);
          const imageBuffer = fs.readFileSync(imagePath);
          base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
        } catch (err) {
          console.error(`Error reading image file for hostel ${hostel._id}:`, err);
        }
      }

      return {
        ...hostel,
        image_path: base64Image, // Base64-encoded image
      };
    });

    res.status(200).json(processedHostels);
  } catch (error) {
    console.error('Error fetching hostels:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    await client.close();
  }
});

app.delete('/remove-hostel', async (req, res) => {
  const { hostel_id } = req.body;

  if (!hostel_id) {
    return res.status(400).json({ message: 'Hostel ID is required' });
  }

  const client = await connectToDb();
  const db = client.db(dbName);

  try {
    // Attempt to delete the hostel by its `_id` (or use another unique identifier if required)
    const result = await db.collection('HostelDetails').deleteOne({ _id: new ObjectId(hostel_id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Hostel not found or already removed' });
    }

    res.status(200).json({ message: 'Hostel removed successfully' });
  } catch (error) {
    console.error('Error deleting hostel:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    await client.close(); // Ensure the connection is closed
  }
});

// Route to fetch all hostels
app.get('/api/hostels', async (req, res) => {
  const client = await connectToDb();  // Use the existing connectToDb utility

  try {
    const db = client.db(dbName);

    // Fetch all hostels from the HostelDetails collection with necessary projection
    const hostels = await db.collection('HostelDetails').find({}, {
      projection: {
        owner_id: 1,
        name: 1,
        address: 1,
        description: 1,
        total_rooms: 1,
        available_rooms: 1,
        rent: 1,
        approval_status: 1,
      }
    }).toArray();

    // If no hostels are found
    if (hostels.length === 0) {
      return res.status(404).json({ message: 'No hostels found' });
    }

    // Send the response with the hostels data
    res.status(200).json(hostels);
  } catch (error) {
    console.error('Error fetching hostel details:', error);
    res.status(500).json({ message: 'Error fetching hostel details' });
  } finally {
    await client.close();  // Ensure the connection is closed
  }
});

// Route to fetch all students
app.get('/api/students', async (req, res) => {
  const client = await connectToDb();  // Use the existing connectToDb utility

  try {
    const db = client.db(dbName);

    // Fetch all students from the Student collection
    const students = await db.collection('Student').find({}).toArray();

    // If no students are found
    if (students.length === 0) {
      return res.status(404).json({ message: 'No students found' });
    }

    // Send the response with the students data
    res.status(200).json(students);
  } catch (error) {
    console.error('Error fetching student details:', error);
    res.status(500).json({ message: 'Error fetching student details' });
  } finally {
    await client.close();  // Ensure the connection is closed
  }
});

// Route to delete a student by ID
app.delete('/api/students/:id', async (req, res) => {
  const studentId = req.params.id;

  const client = await connectToDb(); // Use the existing connectToDb utility

  try {
    const db = client.db(dbName);

    // Delete student document by _id (MongoDB default identifier)
    const result = await db.collection('Student').deleteOne({ _id: new ObjectId(studentId) });

    // If no document was deleted
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.status(200).json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    await client.close(); // Ensure the connection is closed
  }
});

// Route to update hostel details
app.put('/update-hostel', async (req, res) => {
  const { hostel_id, total_rooms, rent, address, description, facilities } = req.body;

  if (!hostel_id || !total_rooms || !rent || !address || !description) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Default empty array if facilities is not provided
  const facilitiesData = facilities || [];

  const client = await connectToDb(); // Use the existing connectToDb utility

  try {
    const db = client.db(dbName);

    // Update hostel details in the database
    const result = await db.collection('HostelDetails').updateOne(
      { _id: new ObjectId(hostel_id) }, // Filter by hostel_id
      { $set: { total_rooms, rent, address, description, facilities: facilitiesData } } // Update fields
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Hostel not found' });
    }

    res.status(200).json({ message: 'Hostel updated successfully!' });
  } catch (error) {
    console.error('Error updating hostel:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    await client.close(); // Ensure the connection is closed
  }
});

// Route to approve a hostel
app.post('/api/hostels/approve/:hostelId', async (req, res) => {
  const hostelId = req.params.hostelId;

  // Validate input
  if (!hostelId) {
    return res.status(400).json({ message: 'Hostel ID is required' });
  }

  const client = await connectToDb(); // Use the existing connectToDb utility

  try {
    const db = client.db(dbName);

    // Update the approval status of the hostel
    const result = await db.collection('HostelDetails').updateOne(
      { _id: new ObjectId(hostelId) }, // Filter by hostel_id
      { $set: { approval_status: 'approved' } } // Update the approval status
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Hostel not found' });
    }

    res.status(200).json({ message: 'Hostel approved successfully' });
  } catch (error) {
    console.error('Error updating hostel approval status:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    await client.close(); // Ensure the connection is closed
  }
});

// Route to fetch all non-approved hostels
app.get('/api/hostels/non-approved', async (req, res) => {
  const client = await connectToDb();

  try {
    const db = client.db(dbName);

    // Fetch hostels with 'not approved' status
    const hostels = await db.collection('HostelDetails').find({ approval_status: 'not approved' }).toArray();

    // If no hostels are found
    if (hostels.length === 0) {
      return res.status(404).json({ message: 'No non-approved hostels found.' });
    }

    res.status(200).json(hostels);
  } catch (err) {
    console.error('Error fetching non-approved hostels:', err);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  } finally {
    await client.close();
  }
});

// Route to approve a hostel by ID
app.post('/api/hostels/approve/:id', async (req, res) => {
  const hostelId = req.params.id;
  console.log(hostelId);

  if (!hostelId) {
    return res.status(400).json({ message: 'Hostel ID is required.' });
  }

  const client = await connectToDb();

  try {
    const db = client.db(dbName);

    // Update the hostel's approval status to 'approved'
    const result = await db.collection('HostelDetails').updateOne(
      { _id: new ObjectId(hostelId) }, // Filter by hostel_id
      { $set: { approval_status: 'approved' } }
    );

    // If no hostel is found
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: `Hostel with ID ${hostelId} not found.` });
    }

    res.status(200).json({ message: 'Hostel approved successfully.' });
  } catch (err) {
    console.error('Error approving hostel:', err);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  } finally {
    await client.close();
  }
});

// Route to reject a hostel by ID
app.post('/api/hostels/reject/:hostelId', async (req, res) => {
  const hostelId = req.params.hostelId;

  // Validate input
  if (!hostelId) {
    return res.status(400).json({ message: 'Hostel ID is required.' });
  }

  const client = await connectToDb(); // Use a utility function for consistent DB connection handling

  try {
    const db = client.db(dbName);

    // Update the hostel's approval status to 'rejected'
    const result = await db.collection('HostelDetails').updateOne(
      { _id: new ObjectId(hostelId) }, // Match by hostel_id
      { $set: { approval_status: 'rejected' } } // Set approval status to 'rejected'
    );

    // Check if the hostel was found and updated
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: `Hostel with ID ${hostelId} not found.` });
    }

    res.status(200).json({ message: 'Hostel rejected successfully.' });
  } catch (err) {
    console.error('Error rejecting hostel:', err);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  } finally {
    await client.close(); // Ensure the database connection is closed
  }
});

// Route to fetch hostels for the logged-in owner
app.get('/api/owner-hostels', async (req, res) => {
  try {
    // Validate session to ensure the user is logged in
    if (!req.session?.user?.id) {
      return res.status(401).json({ message: 'Unauthorized: Please log in to access this resource.' });
    }

    const ownerId = req.session.user.id;

    // Fetch the hostels for the logged-in owner
    const hostels = await HostelDetails.find({ owner_id: ownerId });

    if (hostels.length === 0) {
      return res.status(404).json({ message: 'No hostels found for the logged-in owner.' });
    }

    // Format hostels: Convert image and profile_pic fields to base64
    const formattedHostels = hostels.map(hostel => {
      const imageBuffer = hostel.image ? hostel.image.toString('base64') : null;
      const profilePicBuffer = hostel.profile_pic ? hostel.profile_pic.toString('base64') : null;

      return {
        ...hostel.toObject(), // Convert the Mongoose document to a plain object
        image: imageBuffer ? `data:image/jpeg;base64,${imageBuffer}` : null,
        profile_pic: profilePicBuffer ? `data:image/jpeg;base64,${profilePicBuffer}` : null,
      };
    });

    res.status(200).json(formattedHostels);
  } catch (err) {
    console.error('Error fetching hostels for the logged-in owner:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Route to fetch all hostels
app.get('/all-hostels', async (req, res) => {
  const client = new MongoClient(url);

  try {
    // Connect to the MongoDB client
    await client.connect();
    const db = client.db(dbName);

    // Fetch all hostels from the "HostelDetails" collection
    const hostels = await db.collection('HostelDetails').find({}).toArray();

    if (hostels.length === 0) {
      return res.status(404).json({ message: 'No hostels found.' });
    }

    // Map through the hostels to format image_path to base64
    const formattedHostels = hostels.map(hostel => {
      const imageBuffer = hostel.image_path ? hostel.image_path.toString('base64') : null;

      return {
        ...hostel,
        image_path: imageBuffer ? `data:image/jpeg;base64,${imageBuffer}` : null,
      };
    });

    res.status(200).json(formattedHostels);
  } catch (err) {
    console.error('Error fetching hostels:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    // Ensure the client connection is closed
    await client.close();
  }
});

// Route to fetch hostel stats
app.get('/hostel-stats', async (req, res) => {
  const client = new MongoClient(url);

  try {
    // Connect to MongoDB
    await client.connect();
    const db = client.db(dbName);

    // Fetch statistics using MongoDB aggregation pipeline
    const stats = await db.collection('HostelDetails').aggregate([
      {
        $group: {
          _id: "$approval_status",
          count: { $sum: 1 },
        },
      },
    ]).toArray();

    // Format the statistics
    const statsMap = stats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});

    res.status(200).json({
      total: (statsMap['approved'] || 0) + (statsMap['rejected'] || 0) + (statsMap['not approved'] || 0),
      approved: statsMap['approved'] || 0,
      rejected: statsMap['rejected'] || 0,
      notApproved: statsMap['not approved'] || 0,
    });
  } catch (err) {
    console.error('Error fetching hostel stats:', err);
    res.status(500).json({ error: 'Failed to fetch hostel stats' });
  } finally {
    await client.close(); // Ensure the connection is closed
  }
});

// Route to book a hostel
app.post('/book_hostel/:hostelId', async (req, res) => {
  const { student_id, rent, room_number, booking_date } = req.body;
  const { hostelId } = req.params;

  // Validate request body and parameters
  if (!hostelId || !student_id || !rent || !room_number || !booking_date) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Fetch the owner_id from the hostel collection based on hostelId
    const hostel = await HostelDetails.findOne({ hostel_id: hostelId }, 'owner_id available_rooms');

    if (!hostel) {
      return res.status(404).json({ message: 'Hostel not found' });
    }

    // Check if there are available rooms
    if (hostel.available_rooms <= 0) {
      return res.status(400).json({ message: 'No rooms available in this hostel' });
    }

    const hostelOwnerId = hostel.owner_id;

    // Create a new booking entry
    const newBooking = new Bookings({
      student_id,
      hostel_id: hostelId,
      rent,
      room_number,
      booking_date,
      hostel_owner_id: hostelOwnerId,
    });

    // Save the booking to the database
    const savedBooking = await newBooking.save();

    // Decrement the available_rooms count in HostelDetails
    await HostelDetails.updateOne(
      { hostel_id: hostelId },
      { $inc: { available_rooms: -1 } }
    );

    res.status(200).json({ booking_id: savedBooking._id, message: 'Hostel booked successfully' });
  } catch (error) {
    console.error('Error booking hostel:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to update payment status
app.post('/update_payment_status/:bookingId', async (req, res) => {
  const { payment_status } = req.body;
  const { bookingId } = req.params;

  // Validate inputs
  if (!payment_status || !bookingId) {
    return res.status(400).json({ message: 'Payment status and booking ID are required' });
  }

  // Validate payment_status value
  const validStatuses = ['pending', 'completed', 'failed'];
  if (!validStatuses.includes(payment_status)) {
    return res.status(400).json({ message: `Invalid payment status. Valid statuses are: ${validStatuses.join(', ')}` });
  }

  try {
    // Update the payment status in the Bookings collection
    const result = await Bookings.updateOne(
      { _id: bookingId }, // Find the booking by bookingId (MongoDB _id)
      { $set: { payment_status } } // Update the payment_status field
    );

    // Check if the booking was found and updated
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (result.modifiedCount === 0) {
      return res.status(200).json({ message: 'Payment status is already up-to-date' });
    }

    res.status(200).json({ message: 'Payment status updated successfully' });
  } catch (err) {
    console.error('Error updating payment status:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Route: Approve Hostel
app.post('/approve-hostel/:id', async (req, res) => {
  const hostelId = req.params.id;

  const client = await connectToDb();
  const db = client.db(dbName);
  try {
    const result = await db.collection('HostelDetails').updateOne(
      { _id: new ObjectId(hostelId) },
      { $set: { approval_status: 'approved' } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Hostel not found' });
    }
    res.status(200).json({ message: 'Hostel approved successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    await client.close();
  }
});

// Route: Fetch All Hostels
app.get('/stu_hostels', async (req, res) => {
  const client = await connectToDb();
  const db = client.db(dbName);
  try {
    const hostels = await db.collection('HostelDetails').find({}).toArray();
    res.status(200).json(hostels);
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    await client.close();
  }
});

// Route: Fetch Students
app.get('/students', async (req, res) => {
  const client = await connectToDb();
  const db = client.db(dbName);
  try {
    const students = await db.collection('Student').find({}).toArray();
    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    await client.close();
  }
});

// Route: Delete Hostel
app.delete('/delete-hostel/:id', async (req, res) => {
  const hostelId = req.params.id;

  const client = await connectToDb();
  const db = client.db(dbName);
  try {
    const result = await db.collection('HostelDetails').deleteOne({ _id: new ObjectId(hostelId) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Hostel not found' });
    }
    res.status(200).json({ message: 'Hostel deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    await client.close();
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
