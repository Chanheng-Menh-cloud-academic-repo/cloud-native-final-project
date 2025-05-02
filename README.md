Here is the correct syntax for your GitHub `README.md` file:

```markdown
# Student Management System

A microservices-based application for managing student records. This system consists of multiple services:

- **API Gateway**: Central entry point that routes requests to appropriate microservices  
- **Add Service**: Handles adding new students  
- **Delete Service**: Manages deletion of student records  
- **Update Service**: Handles updating student information  
- **Search Service**: Provides search functionality for student records  

---

## Running the Application

### Local Development

To run the application locally with each service running independently:

```bash
# Navigate to the project directory
cd student-management-final
```

This script will:
1. Create necessary environment files  
2. Check if MongoDB is running  
3. Start all services in separate processes  

---

### Docker Compose

To run the application using Docker Compose:

```bash
# Navigate to the project directory
cd student-management-final

# Build and start all services
docker-compose up --build

# To run in detached mode
docker-compose up -d

# To stop all services
docker-compose down
```

---

### Kubernetes Deployment

To deploy the application to Kubernetes:

```bash
# Navigate to the project directory
cd student-management-final

# Build Docker images for all services
docker build -t api-gateway:latest ./api-gateway
docker build -t add-service:latest ./add-service
docker build -t delete-service:latest ./delete-service
docker build -t update-service:latest ./update-service
docker build -t search-service:latest ./search-service

# Apply ConfigMap first
kubectl apply -f kubernetes-microservices/config-map.yaml

# Deploy microservices
kubectl apply -f kubernetes-microservices/

# Deploy API Gateway
kubectl apply -f kubernetes-api-gateway/

# Check deployment status
kubectl get pods
```

---

## Accessing the Application

### Local and Docker

Access the API Gateway at: `http://localhost:5000`

### Kubernetes

Set up port forwarding to access the API Gateway:

```bash
kubectl port-forward svc/api-gateway 8080:5000
```

Then access the API at: `http://localhost:8080`

---

## API Endpoints

### Add Service

- **Add a Single Student**  
  Method: `POST`  
  URL: `/add`  
  Body:
  ```json
  {
    "Name": "Goat Sheep",
    "Age": 19,
    "Class": "Cloud Operations",
    "ID": "sdk"
  }
  ```

- **Add Multiple Students**  
  Method: `POST`  
  URL: `/adds`  
  Body:
  ```json
  {
    "students": [
      { "Name": "Edersoan Moraase", "Age": 19, "Class": "Cloud Native Development", "ID": "115" },
      { "Name": "Erligg Haalaand", "Age": 19, "Class": "Cloud Native Development", "ID": "116" },
      { "Name": "Davidd Silva", "Age": 19, "Class": "Cloud Native Development", "ID": "113" },
      { "Name": "Kylee Walker", "Age": 19, "Class": "Cloud Native Development", "ID": "114" }
    ]
  }
  ```

---

### Search Service

- **Get All Students**  
  Method: `GET`  
  URL: `/search-all`

- **Get Student by ID**  
  Method: `GET`  
  URL: `/search/{id}`

---

### Update Service

- **Update Student by ID**  
  Method: `PUT`  
  URL: `/update/{id}`  
  Body:
  ```json
  {
    "Name": "Updated Name",
    "Age": 22,
    "Class": "Updated Class"
  }
  ```

---

### Delete Service

- **Delete Student by ID**  
  Method: `DELETE`  
  URL: `/delete/{id}`

- **Delete Multiple Students**  
  Method: `DELETE`  
  URL: `/deletes`  
  Body:
  ```json
  {
    "ids": ["114", "113", "115", "116"]
  }
  ```

- **Delete All Students**  
  Method: `DELETE`  
  URL: `/delete-all`

---

## Testing with Curl

```bash
# Add a student
curl -X POST -H "Content-Type: application/json" -d '{"Name": "John Doe", "Age": 20, "Class": "Computer Science", "ID": "CS001"}' http://localhost:8080/add

# Get all students
curl -X GET http://localhost:8080/search-all

# Get student by ID
curl -X GET http://localhost:8080/search/CS001

# Update student
curl -X PUT -H "Content-Type: application/json" -d '{"Name": "John Doe Updated", "Age": 21, "Class": "Computer Engineering"}' http://localhost:8080/update/CS001

# Delete student
curl -X DELETE http://localhost:8080/delete/CS001
```

---

## Troubleshooting

### Docker Issues

- **Permission Denied**: Run `chmod +x start-locally.sh` to make the script executable  
- **Port Already in Use**: Change the port mapping in `docker-compose.yml`

### Kubernetes Issues

- **ImagePullBackOff**: Ensure images are properly built and available  
- **CrashLoopBackOff**: Check logs with `kubectl logs <pod-name>`  
- **Service Connection Issues**: Verify service names and ports in the API Gateway configuration  

---

## Environment Variables

Each service uses the following environment variables:

- `PORT`: The port the service runs on  
- `MONGO_URI`: MongoDB connection string  
- `K8S`: Set to `"true"` when running in Kubernetes  
- `DOCKER`: Set to `"true"` when running in Docker  

---

# cloud-native-final-project


