const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerJsdoc = require('swagger-jsdoc');
require('dotenv').config();

const { createClient } = require('db-vendo-client');
const { profile: dbProfile } = require('db-vendo-client/p/db/index.js');
const { profile: dbnavProfile } = require('db-vendo-client/p/dbnav/index.js');
const { createHafasRestApi: createApi } = require('hafas-rest-api');
const { mapRouteParsers } = require('db-vendo-client/lib/api-parsers.js');

const app = express();
const PORT = process.env.PORT || 3000;

const journeyRoutes = require('./routes/journey.routes');
const stationRoutes = require('./routes/station.routes');
const arrivalAndDepartureRoutes = require('./routes/arrivalAndDeparture.routes');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Refund Rebel API',
      version: '1.0.0',
      description: 'API documentation for Refund Rebel application',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
      },
    ],
    components: {
      schemas: {
        Station: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            address: { type: 'string' },
          },
        },
        Journey: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            destination: { type: 'string' },
            direction: { type: 'string' },
            line: { type: 'string' },
            arrival: { type: 'string', format: 'date-time' },
            departure: { type: 'string', format: 'date-time' },
            arrivalDelay: { type: 'integer', description: 'Delay in minutes' },
            arrivalPlatform: { type: 'string' },
            departureDelay: { type: 'integer', description: 'Delay in minutes' },
            departurePlatform: { type: 'string' },
          },
        },
        ArrivalDeparture: {
          type: 'object',
          properties: {
            station: { type: 'string' },
            line: { type: 'string' },
            when: { type: 'string', format: 'date-time' },
            delay: { type: 'integer', description: 'Delay in minutes' },
            platform: { type: 'string' }
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, { explorer: true }));

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
app.use('/api', arrivalAndDepartureRoutes);

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

const hafasConfig = {
  hostname: process.env.HAFAS_HOSTNAME || 'localhost',
  port: 3001,
  name: process.env.APP_NAME || 'db-vendo-client',
  description: 'DB Vendo Client API',
  homepage: process.env.APP_HOMEPAGE || 'https://github.com/your-username/refundrebel-dev-challenge',
  version: '1.0.0',
  docsLink: 'https://github.com/public-transport/db-vendo-client',
  openapiSpec: true,
  logging: true,
  aboutPage: true,
  enrichStations: true,
  etags: 'strong',
  csp: 'default-src \'none\'; style-src \'self\' \'unsafe-inline\'; img-src https:',
  mapRouteParsers,
};

const profiles = {
  db: dbProfile,
  dbnav: dbnavProfile
};

const server = app.listen(PORT, async () => {
  console.log(`Backend server running on port ${PORT}`);
  
  try {
    console.log('Initializing DB Vendo client...');
    
    const profileName = process.env.DB_PROFILE || 'dbnav';
    const profile = profiles[profileName] || profiles.dbnav;
    
    console.log(`Creating DB Vendo client with ${profileName} profile...`);
    const hafas = createClient(
      profile,
      process.env.USER_AGENT || 'refundrebel-dev-challenge',
      hafasConfig
    );
    
    try {
      console.log('Testing DB Vendo client with a sample request...');
      const location = await hafas.locations('Berlin Hbf', { results: 1 });
      console.log('DB Vendo client test successful. Found location:', location[0]?.name);
    } catch (testErr) {
      console.error('DB Vendo client test failed:', testErr);
      throw testErr;
    }
    
    console.log('Creating HAFAS REST API...');
    const api = await createApi(hafas, hafasConfig);
    
    api.listen(hafasConfig.port, (err) => {
      if (err) {
        console.error('Error starting HAFAS API:', err);
        return;
      }
      console.log(`HAFAS API server running on port ${hafasConfig.port}`);
    });
    
    api.on('error', (err) => {
      console.error('HAFAS API error:', err);
    });
    
  } catch (err) {
    console.error('Failed to initialize HAFAS API:', err);
  }
});
