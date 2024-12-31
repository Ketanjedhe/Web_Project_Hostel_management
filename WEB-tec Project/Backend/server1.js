const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
var mongo = require('mongodb');

// Create the Express app
const app = express();
const port = 5000;
const saltRounds = 10; // Number of salt rounds for bcrypt hashing

// //mongo db connection
// const { MongoClient } = require('mongodb');
// const url = "mongodb://localhost:27017";
// const dbName = "mydb";

// async function main() {
//   const client = new MongoClient(url);

//   try {
//     // Connect to the MongoDB server
//     await client.connect();
//     console.log("Connected successfully to the MongoDB server!");

//     // Create or use the database
//     const db = client.db(dbName);
//     console.log(`Database "${dbName}" is ready to use.`);
//   } catch (err) {
//     console.error("Error connecting to MongoDB:", err);
//   } 
// }

// main();

// MySQL database connection
// const db = mysql.createConnection({
//   host: 'localhost',
//   user: 'root', // Replace with your MySQL username
//   password: 'root', // Replace with your MySQL password
//   database: 'hostel' // Replace with your MySQL database name
// });



// // Connect to MySQL
// db.connect((err) => {
//   if (err) {
//     console.error('Database connection failed:', err.stack);
//     return;
//   }
//   console.log('Connected to MongoDB database.');
// });

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Session middleware
app.use(session({
  secret: 'your_secret_key', // Replace with your secret key
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Function to hash password
const hashPassword = (password) => {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, saltRounds, (err, hash) => {
      if (err) reject(err);
      resolve(hash);
    });
  });
};

// Route to handle student login
const { MongoClient } = require('mongodb');
// MongoDB connection details
const url = "mongodb://localhost:27017";
const dbName = "test"; // Replace with your database name



app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const client = new MongoClient(url);

  try {
    await client.connect();
    const db = client.db(dbName);

    // Query the `student` collection for the user with the given email
    const user = await db.collection('student').findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare the hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      // Set session data if required
      req.session.user = { id: user._id, email: user.email };
      res.status(200).json({ 
        message: 'Login successful',
        student_id: user._id // MongoDB uses `_id` instead of `student_id`
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (err) {
    console.error('Error with MongoDB operation:', err);
    res.status(500).json({ message: 'Internal Server Error' });
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


app.post('/register', async (req, res) => {
  const { name, email, password, date_of_birth, phone_number, gender, address } = req.body;

  if (!name || !email || !password || !date_of_birth || !phone_number || !gender || !address) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const client = new MongoClient(url);

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Connect to MongoDB
    await client.connect();
    const db = client.db(dbName);

    // Check if the user already exists
    const existingUser = await db.collection('student').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Insert the new student into the `student` collection
    const newUser = {
      name,
      email,
      password: hashedPassword,
      date_of_birth,
      phone_number,
      gender,
      address,
    };

    const result = await db.collection('student').insertOne(newUser);

    res.status(200).json({ message: 'Registration successful', student_id: result.insertedId });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Route to handle owner login
// Route to handle owner login
app.post('/owner-login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const client = new MongoClient(url);

  try {
    await client.connect();
    const db = client.db(dbName);

    // Query the `hostelowner` collection for the user with the given email
    const owner = await db.collection('hostelowner').findOne({ email });

    if (!owner) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare the hashed password
    const isMatch = await bcrypt.compare(password, owner.password);

    if (isMatch) {
      // Set session data if required
      req.session.user = { id: owner._id, email: owner.email }; // MongoDB uses `_id`
      res.status(200).json({
        message: 'Login successful',
        owner_id: owner._id // MongoDB uses `_id` instead of `owner_id`
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (err) {
    console.error('Error during owner login:', err);
    res.status(500).json({ message: 'Internal Server Error' });
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

  const client = new MongoClient(url);

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Connect to MongoDB
    await client.connect();
    const db = client.db(dbName);

    // Check if the owner already exists
    const existingOwner = await db.collection('hostelowner').findOne({ email });
    if (existingOwner) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Insert the new owner into the `hostelowner` collection
    const newOwner = {
      name,
      email,
      password: hashedPassword,
      phone_number,
      address,
    };

    const result = await db.collection('hostelowner').insertOne(newOwner);

    res.status(200).json({ message: 'Registration successful', owner_id: result.insertedId });
  } catch (error) {
    console.error('Error during owner registration:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.post('/admin-login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const client = new MongoClient(url);

  try {
    await client.connect();
    const db = client.db(dbName);

    // Query the `collegeadministration` collection for the admin by email
    const admin = await db.collection('collegeadministration').findOne({ email });

    if (!admin) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare the hashed password
    const isMatch = await bcrypt.compare(password, admin.password);

    if (isMatch) {
      // Set session data if required
      req.session.user = { id: admin._id, email: admin.email }; // MongoDB uses `_id`
      res.status(200).json({ message: 'Login successful' });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (err) {
    console.error('Error during admin login:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Route to handle admin logout
app.post('/admin-logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ message: 'Could not log out.' });
    }
    res.status(200).json({ message: 'Logged out.' });
  });
});

app.post('/register_admin', async (req, res) => {
  const { name, email, password, phone_number, position } = req.body;

  if (!name || !email || !password || !phone_number || !position) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const client = new MongoClient(url);

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Connect to MongoDB
    await client.connect();
    const db = client.db(dbName);

    // Check if the admin already exists by email
    const existingAdmin = await db.collection('collegeadministration').findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create the admin object
    const newAdmin = {
      name,
      email,
      password: hashedPassword,
      phone_number,
      position,
    };

    // Insert the new admin into the collection
    const result = await db.collection('collegeadministration').insertOne(newAdmin);

    res.status(200).json({ message: 'Registration successful', admin_id: result.insertedId });
  } catch (error) {
    console.error('Error during admin registration:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Specify the folder to store uploaded images
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Generate a unique filename
  }
});

const upload = multer({ storage });

// Route to handle adding hostel details with image upload
app.post('/add-hostel', upload.single('image'), async (req, res) => {
  console.log('Request body:', req.body); // Log the body
  console.log('Uploaded file:', req.file); // Log the uploaded file

  const { owner_id, name, address, description, total_rooms, available_rooms, rent, facilities } = req.body;
  const image_path = req.file ? req.file.filename : null; // Get the image file path

  // Ensure all required fields are present
  if (!owner_id || !name || !address || !description || !total_rooms || !available_rooms || !rent || !image_path) {
    return res.status(400).json({ message: 'All fields including image are required' });
  }

  // Parse facilities as JSON if provided
  let parsedFacilities = [];
  try {
    parsedFacilities = JSON.parse(facilities);
  } catch (error) {
    return res.status(400).json({ message: 'Invalid facilities format' });
  }

  // Set default approval status to 'pending'
  const approval_status = 'pending';

  const client = new MongoClient(url);

  try {
    // Connect to MongoDB
    await client.connect();
    const db = client.db(dbName);

    // Create hostel details object
    const hostelDetails = {
      owner_id,
      name,
      address,
      description,
      total_rooms,
      available_rooms,
      approval_status,
      rent,
      image_path,
      facilities: parsedFacilities,
    };

    // Insert hostel details into the collection
    await db.collection('hosteldetails').insertOne(hostelDetails);

    res.status(200).json({ message: 'Hostel added successfully' });
  } catch (error) {
    console.error('Error adding hostel:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Route to handle removing a hostel
// Fetch hostels for a specific owner
// app.get('/owner-hostels/:ownerId', (req, res) => {
//   const ownerId = req.params.ownerId;

//   const query = `
//     SELECT hostel_id, name, address, description, rent, total_rooms, available_rooms, approval_status, image_path, facilities
//     FROM hosteldetails 
//     WHERE owner_id = ?
//   `;

//   db.query(query, [ownerId], (err, results) => {
//     if (err) {
//       console.error('Error fetching hostels:', err);
//       return res.status(500).json({ message: 'Internal Server Error' });
//     }

//     if (results.length === 0) {
//       return res.status(404).json({ message: 'No hostels found for this owner' });
//     }

//     res.status(200).json(results);
//   });
// });
// Route to fetch hostels for the owner with base64 image_path conversion
app.get('/owner-hostels/:ownerId', async (req, res) => {
  const ownerId = req.params.ownerId;

  const client = new MongoClient(url);

  try {
    // Connect to MongoDB
    await client.connect();
    const db = client.db(dbName);

    // Fetch hostels for the given owner_id
    const hostels = await db.collection('hosteldetails').find({ owner_id: ownerId }).toArray();

    if (hostels.length === 0) {
      return res.status(404).json({ message: 'No hostels found for this owner' });
    }

    // Process results to include base64 encoded image_path
    const processedHostels = hostels.map(hostel => {
      let base64Image = null;
      
      // Read image file and convert to base64 if image_path exists
      if (hostel.image_path) {
        try {
          const imagePath = path.join(__dirname, 'uploads', hostel.image_path); // Adjust path if necessary
          const imageBuffer = fs.readFileSync(imagePath);
          base64Image = imageBuffer.toString('base64');
        } catch (err) {
          console.error('Error reading image file:', err);
        }
      }

      return {
        ...hostel,
        image_path: base64Image ? `data:image/jpeg;base64,${base64Image}` : null, // Base64-encoded image
      };
    });
    console.log(processedHostels);
    res.status(200).json(processedHostels);
  } catch (error) {
    console.error('Error fetching hostels:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});



// Route to remove a hostel by ID
app.delete('/remove-hostel', async (req, res) => {
  const { hostel_id } = req.body;

  if (!hostel_id) {
    return res.status(400).json({ message: 'Hostel ID is required' });
  }

  const client = new MongoClient(url);

  try {
    // Connect to MongoDB
    await client.connect();
    const db = client.db(dbName);

    // Attempt to delete the hostel by hostel_id
    const result = await db.collection('hosteldetails').deleteOne({ hostel_id: hostel_id });

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
  const client = new MongoClient(url);

  try {
    // Connect to MongoDB
    await client.connect();
    const db = client.db(dbName);

    // Fetch all hostels from the hosteldetails collection
    const hostels = await db.collection('hosteldetails').find({}, { projection: { owner_id: 1, hostel_id: 1, name: 1, address: 1, description: 1, total_rooms: 1, available_rooms: 1, rent: 1, approval_status: 1 } }).toArray();

    // If no hostels are found
    if (hostels.length === 0) {
      return res.status(404).json({ message: 'No hostels found' });
    }

    res.json(hostels);
  } catch (error) {
    console.error('Error fetching hostel details:', error);
    res.status(500).json({ message: 'Error fetching hostel details' });
  } finally {
    await client.close(); // Ensure the connection is closed
  }
});


// Route to fetch all students
app.get('/api/students', async (req, res) => {
  const client = new MongoClient(url);

  try {
    // Connect to MongoDB
    await client.connect();
    const db = client.db(dbName);

    // Fetch all students from the students collection
    const students = await db.collection('students').find({}).toArray();

    // If no students are found
    if (students.length === 0) {
      return res.status(404).json({ message: 'No students found' });
    }

    res.json(students);
  } catch (error) {
    console.error('Error fetching student details:', error);
    res.status(500).json({ message: 'Error fetching student details' });
  }
});



// Route to delete a student by ID
app.delete('/api/students/:id', async (req, res) => {
  const studentId = req.params.id;

  const client = new MongoClient(url);

  try {
    // Connect to MongoDB
    await client.connect();
    const db = client.db(dbName);

    // Delete student document by student_id
    const result = await db.collection('students').deleteOne({ student_id: studentId });

    // If no document was deleted
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.status(200).json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Make sure this route is in your server file (e.g., index.js)
// Route to update hostel details
app.put('/update-hostel', async (req, res) => {
  const { hostel_id, total_rooms, rent, address, description, facilities } = req.body;

  if (!hostel_id || !total_rooms || !rent || !address || !description) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Handle facilities data: Ensure it's a valid JSON array
  let facilitiesData;
  try {
    facilitiesData = JSON.stringify(facilities || []);
  } catch (err) {
    return res.status(400).json({ message: 'Invalid facilities data' });
  }

  const client = new MongoClient(url);

  try {
    // Connect to MongoDB
    await client.connect();
    const db = client.db(dbName);

    // Update hostel details in the database
    const result = await db.collection('hosteldetails').updateOne(
      { hostel_id: hostel_id }, // Filter by hostel_id
      { $set: { total_rooms, rent, address, description, facilities: facilitiesData } } // Update fields
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Hostel not found' });
    }

    res.status(200).json({ message: 'Hostel updated successfully!' });
  } catch (error) {
    console.error('Error updating hostel:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
// Route to approve a hostel
app.post('/api/hostels/approve/:hostelId', async (req, res) => {
  const hostelId = req.params.hostelId;

  // Validate input
  if (!hostelId) {
    return res.status(400).json({ message: 'Hostel ID is required' });
  }

  const client = new MongoClient(url);

  try {
    // Connect to MongoDB
    await client.connect();
    const db = client.db(dbName);

    // Update the approval status of the hostel
    const result = await db.collection('hosteldetails').updateOne(
      { hostel_id: hostelId }, // Filter by hostel_id
      { $set: { approval_status: 'approved' } } // Update the approval status
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Hostel not found' });
    }

    res.status(200).json({ message: 'Hostel approved successfully' });
  } catch (error) {
    console.error('Error updating hostel approval status:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// In your backend file (e.g., `index.js` or `api.js`)

app.get('/api/hostels/non-approved', async (req, res) => {
  const client = new MongoClient(url);

  try {
    // Connect to MongoDB
    await client.connect();
    const db = client.db(dbName);

    // Fetch non-approved hostels
    const hostels = await db.collection('hosteldetails').find({ approval_status: 'not approved' }).toArray();

    // If no hostels are found
    if (hostels.length === 0) {
      return res.status(404).json({ message: 'No non-approved hostels found' });
    }

    res.status(200).json(hostels);
  } catch (err) {
    console.error('Error fetching non-approved hostels:', err);
    res.status(500).json({ error: err.message });
  } finally {
    await client.close(); // Ensure the connection is closed
  }
});

app.post('/api/hostels/approve/:id', async (req, res) => {
  const hostelId = req.params.id;
  const client = new MongoClient(url);

  try {
    // Connect to MongoDB
    await client.connect();
    const db = client.db(dbName);

    // Update the hostel's approval status to 'approved'
    const result = await db.collection('hosteldetails').updateOne(
      { hostel_id: hostelId }, // Match by hostel_id
      { $set: { approval_status: 'approved' } } // Update the approval status
    );

    // If no hostel is found with the given ID
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Hostel not found' });
    }

    res.status(200).json({ message: 'Hostel approved successfully' });
  } catch (err) {
    console.error('Error approving hostel:', err);
    res.status(500).json({ error: err.message });
  } finally {
    await client.close(); // Ensure the connection is closed
  }
});


// Route to reject a hostel
app.post('/api/hostels/reject/:hostelId', async (req, res) => {
  const hostelId = req.params.hostelId;
  const client = new MongoClient(url);

  // Validate input
  if (!hostelId) {
    return res.status(400).json({ message: 'Hostel ID is required' });
  }

  try {
    // Connect to MongoDB
    await client.connect();
    const db = client.db(dbName);

    // Update the hostel's approval status to 'rejected'
    const result = await db.collection('hosteldetails').updateOne(
      { hostel_id: hostelId }, // Match by hostel_id
      { $set: { approval_status: 'rejected' } } // Update the approval status
    );

    // If no hostel is found with the given ID
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Hostel not found' });
    }

    res.status(200).json({ message: 'Hostel rejected successfully' });
  } catch (err) {
    console.error('Error rejecting hostel:', err);
    res.status(500).json({ error: err.message });
  } finally {
    await client.close(); // Ensure the connection is closed
  }
});

// Route to fetch hostels for the logged-in owner
app.get('/api/owner-hostels', async (req, res) => {
  if (!req.session.user || !req.session.user.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const ownerId = req.session.user.id;

  try {
    // Fetch the hostels for the logged-in owner
    const hostels = await HostelDetails.find({ owner_id: ownerId });

    // Map through the hostels to convert image and profile_pic fields to base64
    const formattedHostels = hostels.map(hostel => {
      const imageBuffer = hostel.image ? hostel.image.toString('base64') : null;
      const profilePicBuffer = hostel.profile_pic ? hostel.profile_pic.toString('base64') : null;

      return {
        ...hostel.toObject(),
        image: imageBuffer ? `data:image/jpeg;base64,${imageBuffer}` : null,
        profile_pic: profilePicBuffer ? `data:image/jpeg;base64,${profilePicBuffer}` : null,
      };
    });

    res.status(200).json(formattedHostels);
  } catch (err) {
    console.error('Error fetching hostels:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});



// Fetch all hostels
app.get('/all-hostels', async (req, res) => {
  try {
    // Fetch all hostels from the MongoDB collection
    await client.connect();
    const db = client.db(dbName);
    const hostels = await HostelDetails.find({});

    // Map through the hostels to convert image_path field to base64
    const formattedHostels = hostels.map(hostel => {
      const imageBuffer = hostel.image_path ? hostel.image_path.toString('base64') : null;

      return {
        ...hostel.toObject(),
        image_path: imageBuffer ? `data:image/jpeg;base64,${imageBuffer}` : null,
      };
    });

    res.status(200).json(formattedHostels);
  } catch (err) {
    console.error('Error fetching hostels:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});




//count of hostels
// Example: Express.js route
// Route to fetch hostel stats
app.get('/hostel-stats', async (req, res) => {
  try {
    // Count total hostels
    const totalHostels = await HostelDetails.countDocuments();

    // Count approved hostels
    const approvedHostels = await HostelDetails.countDocuments({ approval_status: 'approved' });

    // Count rejected hostels
    const rejectedHostels = await HostelDetails.countDocuments({ approval_status: 'rejected' });

    // Return the stats
    res.json({
      total: totalHostels,
      approved: approvedHostels,
      rejected: rejectedHostels,
    });
  } catch (err) {
    console.error('Error fetching hostel stats:', err);
    res.status(500).json({ error: 'Failed to fetch hostel stats' });
  }
});

// Static file serving for uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route to fetch all hostels
app.get('/stu_hostels', async (req, res) => {
  try {
    // Fetch all approved hostels
    const hostels = await HostelDetails.find({ approval_status: 'approved' });

    // Map and format hostels for response (optional, depending on use case)
    const formattedHostels = hostels.map(hostel => {
      return {
        ...hostel.toObject(),
        image_path: hostel.image_path ? `/uploads/${hostel.image_path}` : null,
      };
    });

    res.status(200).json(formattedHostels);
  } catch (error) {
    console.error('Error fetching hostels:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to book a hostel
app.post('/book_hostel/:hostelId', async (req, res) => {
  const { student_id, rent, room_number, booking_date } = req.body;
  const { hostelId } = req.params;

  try {
    // Fetch the owner_id from the hostel collection based on hostelId
    const hostel = await HostelDetails.findOne({ hostel_id: hostelId }, 'owner_id');

    if (!hostel) {
      return res.status(404).json({ message: 'Hostel not found' });
    }

    const hostelOwnerId = hostel.owner_id;

    // Insert booking into the Bookings collection
    const newBooking = new Bookings({
      student_id,
      hostel_id: hostelId,
      rent,
      room_number,
      booking_date,
      hostel_owner_id: hostelOwnerId,
    });

    const savedBooking = await newBooking.save();

    res.status(200).json({ booking_id: savedBooking._id });
  } catch (error) {
    console.error('Error booking hostel:', error);
    res.status(500).json({ error: error.message });
  }
});





// Route to update payment status
app.post('/update_payment_status/:bookingId', async (req, res) => {
  const { payment_status } = req.body;
  const { bookingId } = req.params;

  if (!payment_status || !bookingId) {
    return res.status(400).json({ message: 'Payment status and booking ID are required' });
  }

  try {
    // Update the payment status in the Bookings collection
    const result = await Bookings.updateOne(
      { _id: bookingId },  // Find the booking by bookingId (MongoDB _id)
      { $set: { payment_status } }  // Update the payment_status field
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: 'Booking not found or no change made' });
    }

    res.status(200).json({ message: 'Payment status updated successfully' });
  } catch (err) {
    console.error('Error updating payment status:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});




// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
