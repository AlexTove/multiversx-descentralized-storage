# Decentral Store - Decentralized Storage Solution

## Purpose of the Project

The project aims to design and develop a decentralized storage solution leveraging blockchain technology to provide secure, reliable, and distributed data storage. This solution targets decentralized applications (dApps) and services, ensuring:

- **Data Integrity**
- **Enhanced Security**
- **Elimination of Single Points of Failure** associated with centralized storage systems

# Setup

## Prerequisites

- **Node.js**
- **rustup** - The Rust toolchain installer
- **mxpy** - Tool for interacting with the blockchain
- **sc-meta** - Universal smart contract management tool
- **Docker** (including Docker Compose)


---


## IPFS Setup

IPFS is used for decentralized file storage. By default, an IPFS cluster is configured using Docker Compose.

### Bring up the IPFS cluster:

```bash
docker compose up -d
```

## Custom Configuration

### To change the IPFS node ports:

1. Open the `docker-compose.yml` file.
2. Locate the `ports` section for the IPFS service.
3. Modify the host-to-container port mapping as desired. For example:

    ```yaml
    ports:
      - "5002:5001"  # Maps host port 5002 to container port 5001
    ```

4. After changes, restart the IPFS services:

    ```bash
    docker compose down
    docker compose up -d
    ```

### Blockchain Setup

1. **Navigate to the SmartContract directory**:
```bash
cd dc-smart-contract
```

2. **Build Dependencies**:
```bash
sc-meta all build
```

3. **Generate Interactors**:
```bash
sc-meta all snippets
```

4. **Deploy the Blockchain Application**:
```bash
cargo run deploy
```
   - **Important**: Upon successful deployment, the contract address will be printed in the console output. Copy this contract address for use in the frontend configuration.

5. **Custom Configuration**:
   - To change blockchain network ports or other settings, review and modify relevant configuration files (e.g., network settings in `Cargo.toml` or configuration scripts) before deployment.

---
### Backend Setup

The backend server, built with Express.js, facilitates communication between the frontend and IPFS, handling file uploads and downloads.

1. **Navigate to the backend directory**:
```bash
cd backend
```

2. **Install Dependencies**:
```bash
npm install
```

3. **Custom Configuration**:
   - **Change Backend Server Port**:
     - Open the server configuration file (e.g., `server.js` or `.env`).
     - Locate the port definition, commonly:
       ```javascript
       const PORT = process.env.PORT || 3000;
       ```
     - Change the default port value or set the `PORT` environment variable to your desired port.
   - If using Docker for the backend, update the `docker-compose.yml` or Dockerfile to reflect the new port.

4. **Start the Backend Application**:
```bash
npm run dev
```

---

### Frontend Setup

The frontend, built with Next.js, connects to the blockchain, interacts with the backend, and provides a user interface for file management.

1. **Navigate to the frontend directory**:
```bash
cd frontend
```

2. **Configure Environment Variables**:
```bash
cp .env.example .env
```
   - Open the `.env` file and update the following:
     ```env
     CONTRACT_ADDRESS=<your_contract_address>
     NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
     ```
     - Replace `<your_contract_address>` with the contract address copied from the blockchain deployment output.
     - Ensure `NEXT_PUBLIC_BACKEND_URL` matches your backend server URL and port.

3. **Custom Configuration**:
   - **Change Frontend Server Port**:
     - To change the port Next.js listens on, modify the `package.json` scripts or set an environment variable in `.env`/`.env.local`:
       ```env
       PORT=4000
       ```
     - Update API calls or environment variables to reflect any changes in backend ports:
       ```env
       NEXT_PUBLIC_BACKEND_URL=http://localhost:<new_backend_port>
       ```

4. **Install Dependencies**:
```bash
npm install
```

5. **Start the Frontend Application**:
```
npm run dev
```

---
# Additional Configuration Steps

## Changing Backend Port
1. In `backend/server.js` (or equivalent), modify the port definition:
   ```javascript
   const PORT = process.env.PORT || 3000; // Change 3000 to your desired port
   ```

2. Update Docker configurations if the backend is containerized:
   ```yaml
   ports:
     - "new_host_port:container_port"
   ```

---

## Changing Frontend Port
1. In the frontend `.env` file, set:
   ```env
   PORT=4000  # Or any desired port
   ```

---

## Updating Docker Compose Ports
1. To change service ports in Docker Compose, adjust the `ports` mappings:
   ```yaml
   services:
     ipfs:
       ports:
         - "5002:5001"
   ```

2. Restart Docker services after modifications:
   ```bash
   docker compose down
   docker compose up -d
   ```

---

## Integrating Blockchain Contract Address
1. After deploying the blockchain with `cargo run deploy`, locate the contract address in the output.

2. Update the frontend `.env` file:
   ```env
   CONTRACT_ADDRESS=<copied_contract_address>
   ```
   This ensures the frontend interacts with the correct smart contract.

---

## Project Workflow Summary
1. **IPFS Setup**: Start the IPFS cluster using Docker Compose.
2. **Blockchain Deployment**: Build, deploy smart contracts, and copy the contract address.
3. **Backend Setup**: Configure, customize ports, and run the Express.js backend for IPFS interaction.
4. **Frontend Setup**: Update environment variables, especially the contract address and backend URL, customize ports, install dependencies, and run the Next.js frontend.
5. **Customization**: Adjust ports and configurations as needed in Docker Compose, backend, and frontend files for a seamless integration.