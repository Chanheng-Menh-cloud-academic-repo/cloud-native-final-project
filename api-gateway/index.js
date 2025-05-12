import express from 'express';
import httpProxy from 'http-proxy';
import dotenv from 'dotenv';
import cors from 'cors';


dotenv.config(); // Load environment variables from .env

const app = express();
const proxy = httpProxy.createProxyServer({
  proxyTimeout: 10000,
  timeout: 10000
});

const port = process.env.PORT || 5000;

// Middleware

// Health check route for the API Gateway
app.get('/', (req, res) => {
  console.log('✅ API Gateway is running...');
  res.send('✅ API Gateway is running...');
});

// Determine environment: Kubernetes or Local
const isKubernetes = process.env.K8S === 'true';

// Define microservice URLs based on environment
let services;

if (isKubernetes) {
  // In Kubernetes, use service names directly
  services = {
    add: 'http://add-service:5001',
    delete: 'http://delete-service:5002',
    update: 'http://update-service:5003',
    search: 'http://search-service:5004'
  };
  console.log('Running in Kubernetes mode');
} else if (process.env.DOCKER === 'true') {
  // In Docker Compose, use service names
  services = {
    add: 'http://add-service:5001',
    delete: 'http://delete-service:5002',
    update: 'http://update-service:5003',
    search: 'http://search-service:5004'
  };
  console.log('Running in Docker mode');
} else {
  // Local development
  services = {
    add: 'http://localhost:5001',
    delete: 'http://localhost:5002',
    update: 'http://localhost:5003',
    search: 'http://localhost:5004'
  };
  console.log('Running in Local mode');
}

// Log service URLs for debugging
console.log('Service URLs:', JSON.stringify(services, null, 2));

// Handle proxy errors gracefully
proxy.on('error', (err, req, res) => {
  console.error('❌ Proxy error:', err.message);
  console.error('Request path:', req.path);
  console.error('Request method:', req.method);
  if (!res.headersSent) {
    res.status(503).json({
      error: 'Service Unavailable',
      details: 'The microservice you are trying to reach is not available.',
      message: err.message
    });
  }
});

// Proxy requests to the 'add' service
app.post('/add', (req, res) => {
  console.log(`Proxying to add service: ${services.add}/add`);
  proxy.web(req, res, { target: services.add, changeOrigin: true });
});

app.post('/adds', (req, res) => {
  console.log(`Proxying to add service: ${services.add}/adds`);
  proxy.web(req, res, { target: services.add, changeOrigin: true });
});

// Proxy requests to the 'delete' service
app.delete('/delete/:id', (req, res) => {
  console.log(`Proxying to delete service: ${services.delete}${req.url}`);
  proxy.web(req, res, { target: services.delete, changeOrigin: true });
});

app.delete('/deletes', (req, res) => {
  console.log(`Proxying to delete service: ${services.delete}/deletes`);
  proxy.web(req, res, { target: services.delete, changeOrigin: true });
});

app.delete('/delete-all', (req, res) => {
  console.log(`Proxying to delete service: ${services.delete}/delete-all`);
  proxy.web(req, res, { target: services.delete, changeOrigin: true });
});

// Proxy requests to the 'update' service
app.put('/update/:id', (req, res) => {
  console.log(`Proxying to update service: ${services.update}${req.url}`);
  proxy.web(req, res, { target: services.update, changeOrigin: true });
});

// Proxy requests to the 'search' service
app.get('/search/:id', (req, res) => {
  console.log(`Proxying to search service: ${services.search}${req.url}`);
  proxy.web(req, res, { target: services.search, changeOrigin: true });
});

app.get('/search', (req, res) => {
  console.log(`Proxying to search service: ${services.search}/search-all`);
  // Rewrite path
  req.url = '/search-all';
  proxy.web(req, res, { target: services.search, changeOrigin: true });
});

app.get('/search-all', (req, res) => {
  console.log(`Proxying to search service: ${services.search}/search-all`);
  proxy.web(req, res, { target: services.search, changeOrigin: true });
});

// Start the server
app.listen(port, () => {
  console.log(`🚀 API Gateway is listening on port ${port}`);
  console.log(`Environment: ${isKubernetes ? 'Kubernetes' : 'Local'}`);
  console.log(`Services: ${JSON.stringify(services, null, 2)}`);
});