const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const journeyRoutes = require('./routes/journey.routes');
const stationRoutes = require('./routes/station.routes');
const arrivalRoutes = require('./routes/arrival.routes');

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  optionsSuccessStatus: 200
}));
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Backend service is running' });
});

app.use('/api/journeys', journeyRoutes);
app.use('/api/stations', stationRoutes);
app.use('/api/arrivals', arrivalRoutes);

mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://db:27017/appdb', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
